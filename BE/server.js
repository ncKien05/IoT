const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const mysql = require("mysql2/promise");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Kien@123",
  database: "iot_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
  dateStrings: true,
};
const pool = mysql.createPool(dbConfig);

// Kiểm tra kết nối DB
pool
  .getConnection()
  .then((conn) => {
    console.log("Đã kết nối tới Cơ sở dữ liệu MySQL (iot_system)");
    conn.release();
  })
  .catch((err) => {
    console.error(
      "Lỗi kết nối MySQL. Vui lòng bật XAMPP/MySQL và import database.sql:",
      err.message,
    );
  });

// --- STATE CẢM BIẾN ---
let sensorData = {
  temp: null,
  hum: null,
  light: null,
};

// --- MQTT CẤU HÌNH ---
const mqttClient = mqtt.connect("mqtt://localhost:1883", {
  username: "Kizen",
  password: "Kizen",
});

mqttClient.on("connect", async () => {
  console.log("Đã kết nối tới MQTT Broker");

  // Đăng ký nhận bản tin từ các topic cảm biến
  mqttClient.subscribe("esp32/sensor/temp");
  mqttClient.subscribe("esp32/sensor/hum");
  mqttClient.subscribe("esp32/sensor/light");
  console.log("Đã subscribe các topic cảm biến.");

  // [YÊU CẦU MỚI] Khi khởi động Server: Khôi phục trạng thái cuối cùng của Đèn LED từ DB
  try {
    const [devices] = await pool.query(
      "SELECT device_code, current_status FROM DEVICE",
    );
    devices.forEach((device) => {
      let topic = "";
      if (device.device_code === "CTL-101") topic = "esp32/ac/set"; // dieu-hoa
      if (device.device_code === "CTL-102") topic = "esp32/fan/set"; // quat
      if (device.device_code === "CTL-103") topic = "esp32/led/set"; // den-led

      if (topic) {
        mqttClient.publish(topic, device.current_status);
        console.log(
          `[Khôi phục Trạng thái] ${device.device_code} -> ${device.current_status}`,
        );
      }
    });
  } catch (err) {
    console.error("Lỗi khi khôi phục trạng thái thiết bị từ DB:", err);
  }
});

mqttClient.on("message", (topic, message) => {
  const payload = message.toString();
  console.log(`[MQTT Nhận] Topic: ${topic} - Dữ liệu: ${payload}`);

  // Cập nhật state tùy theo topic
  if (topic === "esp32/sensor/temp") {
    sensorData.temp = payload;
  } else if (topic === "esp32/sensor/hum") {
    sensorData.hum = payload;
  } else if (topic === "esp32/sensor/light") {
    sensorData.light = payload;
  }
});

mqttClient.on("error", (error) => {
  console.error("Lỗi kết nối MQTT:", error);
});

// --- CRONJOB (LƯU LỊCH SỬ CẢM BIẾN SAU MỖI 15 GIÂY) ---
// 15 giây = 15 * 1000 = 15000 ms
const INTERVAL_15_SEC = 15000;

const saveSensorData = async () => {
  const recordedAt = new Date();
  try {
    if (sensorData.temp !== null) {
      // sensor_id = 1 (SEN-001)
      await pool.query(
        "INSERT INTO DATA_SENSOR (sensor_id, value, recorded_at) VALUES (?, ?, ?)",
        [1, sensorData.temp, recordedAt],
      );
    }
    if (sensorData.hum !== null) {
      // sensor_id = 2 (SEN-002)
      await pool.query(
        "INSERT INTO DATA_SENSOR (sensor_id, value, recorded_at) VALUES (?, ?, ?)",
        [2, sensorData.hum, recordedAt],
      );
    }
    if (sensorData.light !== null) {
      // sensor_id = 3 (SEN-003)
      await pool.query(
        "INSERT INTO DATA_SENSOR (sensor_id, value, recorded_at) VALUES (?, ?, ?)",
        [3, sensorData.light, recordedAt],
      );
    }
    console.log(
      `[DB] Đã lưu lịch sử cảm biến vào cơ sở dữ liệu lúc ${recordedAt.toLocaleTimeString("vi-VN")}`,
    );
  } catch (err) {
    console.error("Lỗi khi lưu dữ liệu cảm biến định kỳ:", err);
  }
};

// Đợi 2 giây sau khi backend chạy để nhận data đầu tiên, lưu ngay, rồi lặp mỗi 15s
setTimeout(() => {
  saveSensorData();
  setInterval(saveSensorData, INTERVAL_15_SEC);
}, 2000);

// Ánh xạ device ID (từ Frontend) sang DB Code & MQTT Topic
const deviceMap = {
  "dieu-hoa": { topic: "esp32/ac/set", code: "CTL-101" },
  quat: { topic: "esp32/fan/set", code: "CTL-102" },
  "den-led": { topic: "esp32/led/set", code: "CTL-103" },
};

// --- API ENDPOINTS ---

// API Điều khiển thiết bị
app.post("/api/device/control", async (req, res) => {
  const { deviceId, action } = req.body; // action: "ON" hoặc "OFF"

  if (!deviceId || !action) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin deviceId hoặc action",
    });
  }

  const deviceConfig = deviceMap[deviceId];
  if (!deviceConfig) {
    return res.status(404).json({
      success: false,
      message: "Thiết bị không tồn tại trong hệ thống",
    });
  }

  try {
    const requestedAt = new Date();
    // 1. Gửi bản tin qua MQTT tới ESP32 trước
    mqttClient.publish(deviceConfig.topic, action, async (err) => {
      if (err) {
        console.error(`Lỗi khi gửi MQTT (topic: ${deviceConfig.topic}):`, err);
        return res
          .status(500)
          .json({ success: false, message: "Lỗi hệ thống khi gửi lệnh MQTT" });
      }

      console.log(
        `[MQTT] Đã gửi lệnh '${action}' tới topic '${deviceConfig.topic}'`,
      );

      // 2. Cập nhật trạng thái thiết bị trong bảng DEVICE
      const [deviceRows] = await pool.query(
        "SELECT device_id FROM DEVICE WHERE device_code = ?",
        [deviceConfig.code],
      );
      if (deviceRows.length > 0) {
        const dbDeviceId = deviceRows[0].device_id;

        await pool.query(
          "UPDATE DEVICE SET current_status = ? WHERE device_id = ?",
          [action, dbDeviceId],
        );

        // 3. Ghi log vào bảng ACTION_HISTORY
        // Tạm gán action trong DB (enum) là TURN_ON hoặc TURN_OFF
        const dbAction = action === "ON" ? "TURN_ON" : "TURN_OFF";
        await pool.query(
          "INSERT INTO ACTION_HISTORY (device_id, action, triggered_by, mode, requested_at, executed_at, status) VALUES (?, ?, 'admin', 'MANUAL', ?, ?, 'SUCCESS')",
          [dbDeviceId, dbAction, requestedAt, new Date()],
        );
        console.log(
          `[DB] Đã cập nhật trạng thái thiết bị và lưu lịch sử hoạt động.`,
        );
      }

      res.json({
        success: true,
        message: `Lệnh '${action}' đã được gửi và lưu lịch sử thành công`,
      });
    });
  } catch (dbErr) {
    console.error("Lỗi cơ sở dữ liệu khi điều khiển thiết bị:", dbErr);
    res.status(500).json({ success: false, message: "Lỗi cơ sở dữ liệu" });
  }
});

// API Lấy dữ liệu cảm biến mới nhất
app.get("/api/sensors/latest", (req, res) => {
  res.json({ success: true, data: sensorData });
});

// API Lấy trạng thái tất cả thiết bị
app.get("/api/devices", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT device_code, device_name, current_status FROM DEVICE",
    );
    const devices = rows.map((r) => {
      let id = "";
      let icon = "";
      if (r.device_code === "CTL-101") {
        id = "dieu-hoa";
        icon = "bi-snow2";
      }
      if (r.device_code === "CTL-102") {
        id = "quat";
        icon = "bi-fan";
      }
      if (r.device_code === "CTL-103") {
        id = "den-led";
        icon = "bi-lightbulb-fill";
      }
      return { id, icon, name: r.device_name, isOn: r.current_status === "ON" };
    });
    res.json({ success: true, data: devices });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách thiết bị:", err);
    res.status(500).json({ success: false, message: "Lỗi cơ sở dữ liệu" });
  }
});

// API Lấy lịch sử hoạt động
app.get("/api/actions/history", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.action_id, d.device_name, a.action, a.status, DATE_FORMAT(a.requested_at, '%d/%m/%Y %H:%i:%s') as timeStr
      FROM ACTION_HISTORY a 
      JOIN DEVICE d ON a.device_id = d.device_id
      ORDER BY a.requested_at DESC LIMIT 100
    `);
    const history = rows.map((r) => {
      return {
        id: `AC-${String(r.action_id).padStart(3, "0")}`,
        thietBi: r.device_name,
        hanhDong: r.action === "TURN_ON" ? "BẬT" : "TẮT",
        trangThai: r.status === "SUCCESS" ? "Thành công" : "Thất bại",
        gioBat: r.action === "TURN_ON" ? r.timeStr : "—",
        gioTat: r.action === "TURN_OFF" ? r.timeStr : "—",
        tgPhanHoi: "0.1s",
      };
    });
    res.json({ success: true, data: history });
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử:", err);
    res.status(500).json({ success: false, message: "Lỗi cơ sở dữ liệu" });
  }
});

// API Lấy lịch sử dữ liệu cảm biến
app.get("/api/sensors/history", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.data_id, s.sensor_type, d.value, s.unit, DATE_FORMAT(d.recorded_at, '%d/%m/%Y %H:%i:%s') as timeStr
      FROM DATA_SENSOR d
      JOIN SENSOR s ON d.sensor_id = s.sensor_id
      ORDER BY d.recorded_at DESC LIMIT 100
    `);
    const data = rows.map((r) => {
      let loai = "Khác";
      if (r.sensor_type === "TEMPERATURE") loai = "Nhiệt độ";
      if (r.sensor_type === "HUMIDITY") loai = "Độ ẩm";
      if (r.sensor_type === "LIGHT") loai = "Ánh sáng";
      return {
        id: `DS-${String(r.data_id).padStart(4, "0")}`,
        loai,
        giaTri: r.value,
        donVi: r.unit,
        thoiGian: r.timeStr,
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử cảm biến:", err);
    res.status(500).json({ success: false, message: "Lỗi cơ sở dữ liệu" });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Backend Server đang chạy tại cổng http://localhost:${port}`);
});
