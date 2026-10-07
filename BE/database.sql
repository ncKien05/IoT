CREATE DATABASE IF NOT EXISTS iot_system;
USE iot_system;

-- 1. Bảng SENSOR
CREATE TABLE IF NOT EXISTS SENSOR (
    sensor_id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_code VARCHAR(20) UNIQUE NOT NULL,
    sensor_type ENUM('TEMPERATURE', 'HUMIDITY', 'LIGHT') NOT NULL,
    unit VARCHAR(10) NOT NULL,
    room_code VARCHAR(20) NOT NULL,
    connected_pin VARCHAR(10),
    status ENUM('ACTIVE', 'INACTIVE', 'ERROR') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng DATA_SENSOR
CREATE TABLE IF NOT EXISTS DATA_SENSOR (
    data_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    recorded_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES SENSOR(sensor_id)
);

-- 3. Bảng DEVICE
CREATE TABLE IF NOT EXISTS DEVICE (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_code VARCHAR(20) UNIQUE NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type ENUM('LIGHT', 'FAN', 'PROJECTOR') NOT NULL,
    room_code VARCHAR(20) NOT NULL,
    connected_pin VARCHAR(10) NOT NULL,
    current_status ENUM('ON', 'OFF') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng ACTION_HISTORY
CREATE TABLE IF NOT EXISTS ACTION_HISTORY (
    action_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id INT NOT NULL,
    action ENUM('TURN_ON', 'TURN_OFF') NOT NULL,
    triggered_by VARCHAR(50) DEFAULT 'admin' NOT NULL,
    mode ENUM('MANUAL', 'SCHEDULE') NOT NULL,
    requested_at DATETIME NOT NULL,
    executed_at DATETIME,
    response_time_ms INT,
    status ENUM('SUCCESS', 'FAILED', 'TIMEOUT', 'WAITING') NOT NULL,
    FOREIGN KEY (device_id) REFERENCES DEVICE(device_id)
);

-- 5. Bảng USER
CREATE TABLE IF NOT EXISTS USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(45) NOT NULL,
    student_id INT UNIQUE NOT NULL,
    email VARCHAR(45) UNIQUE NOT NULL,
    phone VARCHAR(45),
    avatar VARCHAR(255),
    github_url VARCHAR(45),
    figma_url VARCHAR(45),
    postman_url VARCHAR(45),
    report_url VARCHAR(45)
);

-- INSERT DỮ LIỆU MẪU (DUMMY DATA)
-- Cảm biến
INSERT IGNORE INTO SENSOR (sensor_code, sensor_type, unit, room_code, connected_pin, status) VALUES
('SEN-001', 'TEMPERATURE', '°C', 'P301', 'D5', 'ACTIVE'),
('SEN-002', 'HUMIDITY', '%', 'P301', 'D5', 'ACTIVE'),
('SEN-003', 'LIGHT', 'lux', 'P301', 'A0', 'ACTIVE');

-- Thiết bị
INSERT IGNORE INTO DEVICE (device_code, device_name, device_type, room_code, connected_pin, current_status) VALUES
('CTL-101', 'Điều hòa', 'LIGHT', 'P301', 'D1', 'OFF'),
('CTL-102', 'Quạt máy', 'FAN', 'P301', 'D2', 'OFF'),
('CTL-103', 'Đèn LED', 'LIGHT', 'P301', 'D3', 'OFF');

-- User
INSERT IGNORE INTO USER (user_name, full_name, student_id, email, phone) VALUES
('admin', 'Nguyễn Cao Kiên', 159, 'kien@example.com', '0123456789');
