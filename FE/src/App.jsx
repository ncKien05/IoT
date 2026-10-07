import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataSensor from './pages/DataSensor';
import ActionHistory from './pages/ActionHistory';
import Profile from './pages/Profile';

// Dữ liệu mặc định để demo khi không có kết nối BE
const DEFAULT_DEVICES = [
  { id: 'dieu-hoa', name: 'Điều hòa', icon: 'bi-wind', isOn: false },
  { id: 'quat',     name: 'Quạt máy', icon: 'bi-fan',  isOn: false },
  { id: 'den-led',  name: 'Đèn LED',  icon: 'bi-lightbulb-fill', isOn: false },
];

const App = () => {
  const [activePage, setActivePage] = useState('Sidebar');
  const [devices, setDevices] = useState(DEFAULT_DEVICES);
  const [historyData, setHistoryData] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState({});

  // Fetch dữ liệu thiết bị từ BE khi khởi động
  const fetchDevices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/devices');
      const data = await res.json();
      if (data.success) {
        setDevices(data.data);
        setIsDemoMode(false);
      }
    } catch (err) {
      // Không kết nối được BE → chạy chế độ demo với thiết bị mặc định
      console.warn("BE chưa khởi động - chạy chế độ DEMO:", err.message);
      setIsDemoMode(true);
      // Giữ DEFAULT_DEVICES đã khởi tạo sẵn
    }
  };

  // Fetch lịch sử hoạt động từ BE
  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/actions/history');
      const data = await res.json();
      if (data.success && data.data?.length) {
        setHistoryData(data.data);
        return;
      }
    } catch (err) {
      console.warn("Lỗi fetch history (demo mode):", err.message);
    }
    // Fallback: dùng mock data
    import('./data/mockData').then(module => {
      setHistoryData(module.actionHistory);
    });
  };

  useEffect(() => {
    fetchDevices();
    fetchHistory();
  }, []);

  const toggleDevice = async (id) => {
    if (loadingDevices[id]) return; // Chặn spam click

    const device = devices.find(d => d.id === id);
    if (!device) return;
    const newIsOn = !device.isOn;
    const action = newIsOn ? 'ON' : 'OFF';

    // 1. Set trạng thái loading UI
    setLoadingDevices(prev => ({ ...prev, [id]: true }));

    // 2. Delay 1 giây
    setTimeout(async () => {
      // Luôn cập nhật UI ngay lập tức sau 1s (demo mode hoặc thực)
      setDevices(prev => prev.map(d => d.id === id ? { ...d, isOn: newIsOn } : d));

      if (isDemoMode) {
        // Sinh log mới cho Action History
        import('./data/mockData').then(module => {
          const now = new Date();
          const dStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
          
          const newRecord = {
            id: `AC-T${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            user: 'Nguyễn Kiên',
            thietBi: device.name,
            hanhDong: newIsOn ? 'BẬT' : 'TẮT',
            trangThai: 'Thành công',
            gioBat: dStr,
            gioTat: '—',
            tgPhanHoi: (Math.random() * 0.8 + 0.2).toFixed(1) + 's'
          };
          module.actionHistory.unshift(newRecord);
          setHistoryData([...module.actionHistory]);
        });
        setLoadingDevices(prev => ({ ...prev, [id]: false }));
        return;
      }

      try {
        // Gọi API sang Backend
        const response = await fetch('http://localhost:5000/api/device/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: id, action })
        });
        const data = await response.json();
        if (data.success) {
          fetchHistory();
        } else {
          console.warn('Server trả lỗi:', data.message);
        }
      } catch (error) {
        console.warn('Không kết nối được Backend:', error.message);
      } finally {
        setLoadingDevices(prev => ({ ...prev, [id]: false }));
      }
    }, 500);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard devices={devices} onToggle={toggleDevice} isDemoMode={isDemoMode} loadingDevices={loadingDevices} />;
      case 'data-sensor':
        return <DataSensor />;
      case 'action-history':
        return <ActionHistory devices={devices} onToggle={toggleDevice} historyData={historyData} isDemoMode={isDemoMode} loadingDevices={loadingDevices} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard devices={devices} onToggle={toggleDevice} isDemoMode={isDemoMode} loadingDevices={loadingDevices} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
