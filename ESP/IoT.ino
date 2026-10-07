#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h> // NHỚ CÀI THƯ VIỆN NÀY TRONG ARDUINO IDE

// ================= PIN =================
// Module quang trở 4 chân (A0 -> GPIO34)
#define LIGHT_PIN 34
// DHT11
#define DHT_PIN 4
// LEDs
#define RED_LED_PIN 17
#define YELLOW_LED_PIN 18
#define GREEN_LED_PIN 16

#define DHT_TYPE DHT11

// ================= LED PWM =================
// Độ sáng 30% (30% của 255 là xấp xỉ 76)
#define LED_BRIGHTNESS 76
#define LED_PWM_FREQ 5000
#define LED_PWM_RESOLUTION 8

// ================= WIFI =================
const char* ssid = "Kizen";
const char* password = "20051226";

IPAddress staticIP(172, 20, 10, 12);
IPAddress gateway(172, 20, 10, 1);
IPAddress subnet(255, 255, 255, 240);
IPAddress primaryDNS(172, 20, 10, 1);
IPAddress secondaryDNS(8, 8, 8, 8);

// ================= MQTT =================
const char* mqtt_server = "172.20.10.3";
const int mqtt_port = 1883;

// ================= MQTT TOPICS =================
const char* topic_sensors  = "data_sensors";
const char* topic_control  = "device_control";
const char* topic_response = "device_response";

// ================= OBJECTS =================
WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

// ================= VARIABLES =================
unsigned long lastSensorRead = 0;
const long sensorInterval = 2000;

// ================= WIFI SETUP =================
void setup_wifi() {
  delay(10);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);

  if (!WiFi.config(staticIP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("[ERROR] Failed to configure Static IP!");
  }

  Serial.println();
  Serial.print("Connecting to Hotspot: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected successfully!");
  Serial.print("ESP32 Static IP: ");
  Serial.println(WiFi.localIP());
}

// ================= GỬI PHẢN HỒI =================
void sendResponse(int device_id, String action_req, String result_status) {
  StaticJsonDocument<200> doc;
  doc["deviceId"] = device_id;
  doc["action"] = action_req;
  doc["status"] = result_status;

  char buffer[200];
  serializeJson(doc, buffer);

  client.publish(topic_response, buffer);
  Serial.print("=> Đã gửi phản hồi: ");
  Serial.println(buffer);
}

// ================= MQTT CALLBACK =================
// ================= MQTT CALLBACK =================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("\n===== MQTT MESSAGE =====");
  Serial.print("Topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  Serial.println(message);

  if (strcmp(topic, topic_control) == 0) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
      Serial.print("Lỗi định dạng JSON: ");
      Serial.println(error.c_str());
      return;
    }

    int deviceId = doc["deviceId"]; // 0 = tất cả, 1, 2, hoặc 3
    String action = doc["action"];
    action.toUpperCase();

    bool isValid = (action == "ON" || action == "OFF");

    if (isValid) {
      int pwmValue = (action == "ON") ? (255 - LED_BRIGHTNESS) : 255;

      switch (deviceId) {
        case 0: // ✅ Bật/tắt cả 3 đèn cùng lúc
          ledcWrite(RED_LED_PIN, pwmValue);
          ledcWrite(YELLOW_LED_PIN, pwmValue);
          ledcWrite(GREEN_LED_PIN, pwmValue);
          sendResponse(0, action, "success");
          Serial.println("=> Đã điều khiển TẤT CẢ đèn: " + action);
          break;
        case 1:
          ledcWrite(RED_LED_PIN, pwmValue);
          sendResponse(1, action, "success");
          break;
        case 2:
          ledcWrite(YELLOW_LED_PIN, pwmValue);
          sendResponse(2, action, "success");
          break;
        case 3:
          ledcWrite(GREEN_LED_PIN, pwmValue);
          sendResponse(3, action, "success");
          break;
        default:
          Serial.println("Lỗi: deviceId không tồn tại!");
          sendResponse(deviceId, action, "fail");
          break;
      }
    } else {
      Serial.println("Lỗi: action không hợp lệ");
      sendResponse(deviceId, action, "fail");
    }
  }
}


// ================= MQTT CONNECT =================
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT Broker...");
    String clientID = "ESP32-NodeMCU-";
    clientID += String(random(0xffff), HEX);

    // if (client.connect(clientID.c_str(), "admin", "123")) {
    if (client.connect(clientID.c_str(), "Kizen", "Kizen")) {
      Serial.println(" Connected!");
      // Subscribe JSON control topic
      client.subscribe(topic_control);
      Serial.println("Subscribed to control topics.");
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(client.state());
      Serial.println(" -> Retry in 5 seconds");
      delay(5000);
    }
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  // ================= LIGHT SENSOR =================
  pinMode(LIGHT_PIN, INPUT);

  // ================= LED PWM =================
  ledcAttach(RED_LED_PIN, LED_PWM_FREQ, LED_PWM_RESOLUTION);
  ledcAttach(YELLOW_LED_PIN, LED_PWM_FREQ, LED_PWM_RESOLUTION);
  ledcAttach(GREEN_LED_PIN, LED_PWM_FREQ, LED_PWM_RESOLUTION);

  // Tắt đèn lúc khởi động (Active Low: 255 là tắt)
  ledcWrite(RED_LED_PIN, 255);
  ledcWrite(YELLOW_LED_PIN, 255);
  ledcWrite(GREEN_LED_PIN, 255);

  // ================= DHT11 =================
  dht.begin();

  // ================= WIFI =================
  setup_wifi();

  // ================= MQTT =================
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  Serial.println("\nESP32 JSON System Ready!");
}

// ================= LOOP =================
void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentMillis;

    // ================= SENSOR READINGS =================
    int lightRaw = analogRead(LIGHT_PIN);
    int lightValue = 4095 - lightRaw;

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("DHT11: Failed to read sensor!");
      return;
    }

    Serial.printf("Temp: %.1f °C | Hum: %.1f %% | Light: %d\n", temperature, humidity, lightValue);

    // ================= JSON PUBLISH =================
    StaticJsonDocument<200> doc;
    doc["nhiet_do"] = temperature;
    doc["do_am"] = humidity;
    doc["anh_sang"] = String(lightValue) + " lux";

    char msgBuffer[200];
    serializeJson(doc, msgBuffer);

    client.publish(topic_sensors, msgBuffer);
    Serial.println("------------------------------------");
  }
}
