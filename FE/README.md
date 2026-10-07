# 🏫 IoT Dashboard - Quản Lý Phòng Học

Giao diện web **Dark Mode** hiện đại cho hệ thống IoT quản lý phòng học, xây dựng với ReactJS + Bootstrap 5 + Recharts.

## 🛠️ Cài đặt & Chạy

### Yêu cầu
- **Node.js** >= 16.x (Tải tại: https://nodejs.org)
- **npm** >= 8.x (đi kèm Node.js)

### Các bước

```bash
# 1. Vào thư mục dự án
cd FE

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm start
```

Mở trình duyệt tại: **http://localhost:3000**

---

## 📁 Cấu trúc thư mục

```
FE/
├── public/
│   └── index.html
├── src/
│   ├── components/         # Các component tái sử dụng
│   │   ├── Sidebar.jsx     # Sidebar điều hướng
│   │   ├── Topbar.jsx      # Thanh tiêu đề
│   │   ├── MetricCard.jsx  # Thẻ chỉ số cảm biến
│   │   ├── DeviceToggle.jsx# Thẻ điều khiển thiết bị
│   │   └── DataTable.jsx   # Bảng dữ liệu + phân trang
│   ├── pages/              # Các trang chính
│   │   ├── Dashboard.jsx   # Trang tổng quan
│   │   ├── DataSensor.jsx  # Lịch sử cảm biến
│   │   ├── ActionHistory.jsx # Lịch sử điều khiển
│   │   └── Profile.jsx     # Trang hồ sơ
│   ├── data/
│   │   └── mockData.js     # Dữ liệu giả lập
│   ├── App.jsx             # Root component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles (Dark Mode)
├── package.json
└── README.md
```

## ✨ Tính năng

| Trang | Nội dung |
|-------|----------|
| **Dashboard** | 3 Metric Cards (Nhiệt độ/Độ ẩm/Ánh sáng) + Line Chart Recharts + 3 Device Toggle |
| **Data Sensor** | Filter Bar + Bảng lịch sử cảm biến + Pagination |
| **Action History** | Filter Bar + Bảng lịch sử điều khiển + Dot indicator trạng thái |
| **Profile** | Thông tin tài khoản + Thống kê + Đổi mật khẩu |

## 🎨 Design System

- **Màu nền**: `#0d1b2a` (xanh đậm)
- **Font**: Inter (Google Fonts)
- **Theme**: Dark Mode hoàn toàn
- **Phong cách**: Minimalist, glassmorphism nhẹ
