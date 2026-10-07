import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import MetricCard from '../components/MetricCard';
import DeviceToggle from '../components/DeviceToggle';
import Topbar from '../components/Topbar';
import { sensorChartData } from '../data/mockData';

// Custom tooltip cho Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>{label}</p>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              {entry.value} {entry.name === 'Nhiệt độ' ? '°C' : entry.name === 'Độ ẩm' ? '%' : 'lux'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = ({ devices = [], onToggle, isDemoMode = false, loadingDevices = {} }) => {
  const toggleDevice = onToggle;

  const [sensorData, setSensorData] = useState({ temp: '--', hum: '--', light: '--' });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sensors/latest');
        const data = await response.json();
        if (data.success && data.data) {
          const newTemp = data.data.temp ?? '--';
          const newHum = data.data.hum ?? '--';
          const newLight = data.data.light ?? '--';

          setSensorData({ temp: newTemp, hum: newHum, light: newLight });

          const now = new Date();
          const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

          setChartData(prev => {
            const newPoint = {
              time: timeString,
              nhietDo: newTemp !== '--' ? parseFloat(newTemp) : null,
              doAm: newHum !== '--' ? parseFloat(newHum) : null,
              anhSang: newLight !== '--' ? parseFloat(newLight) : null,
            };
            const updated = [...prev, newPoint];
            if (updated.length > 12) updated.shift();
            return updated;
          });
        }
      } catch (error) {
        // Demo mode: sensor chưa kết nối, hiển thị '--'
      }
    };

    fetchSensors();
    const intervalId = setInterval(fetchSensors, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Tổng quan hệ thống phòng học"
        isDemoMode={isDemoMode}
      />

      {/* Layout tĩnh 2 cột, không cuộn */}
      <main className="dashboard-static-layout">

        {/* ── CỘT TRÁI: SENSOR + CHART ── */}
        <div className="dashboard-left">

          {/* Tiêu đề section cảm biến */}
          <div className="dash-section-label">
            <span className="section-title">Chỉ số hiện tại</span>
            {isDemoMode && (
              <span className="demo-hint">
                <i className="bi bi-wifi-off me-1" />Chưa kết nối ESP
              </span>
            )}
          </div>

          {/* 3 Metric Cards */}
          <div className="metrics-row">
            <MetricCard
              type="temp"
              icon="bi-thermometer-half"
              label="Nhiệt độ"
              value={sensorData.temp}
              unit="°C"
              subtitle={isDemoMode ? 'Chưa kết nối' : 'Cập nhật từ MQTT'}
              trend="stable"
              trendLabel={isDemoMode ? 'Demo' : 'Realtime'}
            />
            <MetricCard
              type="humidity"
              icon="bi-droplet-fill"
              label="Độ ẩm"
              value={sensorData.hum}
              unit="%"
              subtitle={isDemoMode ? 'Chưa kết nối' : 'Cập nhật từ MQTT'}
              trend="stable"
              trendLabel={isDemoMode ? 'Demo' : 'Realtime'}
            />
            <MetricCard
              type="light"
              icon="bi-brightness-high-fill"
              label="Ánh sáng"
              value={sensorData.light}
              unit=""
              subtitle={isDemoMode ? 'Chưa kết nối' : 'Cập nhật từ MQTT'}
              trend="stable"
              trendLabel={isDemoMode ? 'Demo' : 'Realtime'}
            />
          </div>

          {/* Tiêu đề biểu đồ */}
          <div className="dash-section-label" style={{ marginTop: '16px' }}>
            <span className="section-title">Biểu đồ thời gian thực</span>
          </div>

          {/* Chart Card - chiếm phần còn lại */}
          <div className="chart-card chart-card-flex">
            <div className="chart-header">
              <div>
                <div className="chart-title">Theo dõi cảm biến</div>
                <div className="chart-subtitle">
                  {isDemoMode ? 'Dữ liệu mẫu — chưa kết nối ESP' : 'Cập nhật mỗi 2 giây'}
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item"><span className="legend-dot" style={{ background: '#ff6b6b' }} />Nhiệt độ</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#00d4ff' }} />Độ ẩm</div>
                <div className="legend-item"><span className="legend-dot" style={{ background: '#ffab40' }} />Ánh sáng</div>
              </div>
            </div>

            <div className="chart-inner">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.length > 0 ? chartData : sensorChartData}
                  margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.8)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#4a6fa5', fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(30,58,95,0.8)' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#4a6fa5', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#4a6fa5', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="nhietDo" name="Nhiệt độ" stroke="#ff6b6b" strokeWidth={2} dot={{ fill: '#ff6b6b', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="doAm" name="Độ ẩm" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="anhSang" name="Ánh sáng" stroke="#ffab40" strokeWidth={2} dot={{ fill: '#ffab40', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── CỘT PHẢI: BẢNG ĐIỀU KHIỂN ── */}
        <div className="dashboard-right">
          <div className="dash-section-label">
            <span className="section-title">Bảng điều khiển</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {devices.filter(d => d.isOn).length}/{devices.length} đang bật
            </span>
          </div>

          <div className="devices-column">
            {devices.map(device => (
              <DeviceToggle
                key={device.id}
                icon={device.icon}
                name={device.name}
                isOn={device.isOn}
                onToggle={() => toggleDevice(device.id)}
                isLoading={loadingDevices && loadingDevices[device.id]}
              />
            ))}
          </div>
        </div>

      </main>
    </>
  );
};

export default Dashboard;
