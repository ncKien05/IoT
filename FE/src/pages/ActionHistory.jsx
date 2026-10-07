import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Topbar from '../components/Topbar';

const deviceList = ['Tất cả', 'Điều hòa', 'Quạt máy', 'Đèn LED'];
const actionList = ['Tất cả', 'BẬT', 'TẮT'];
const statusList = ['Tất cả', 'Thành công', 'Thất bại'];

// Map tên thiết bị → id trong devices state
const DEVICE_ID_MAP = {
  'Điều hòa': 'dieu-hoa',
  'Quạt máy': 'quat',
  'Đèn LED':  'den-led',
};

// Custom renderer cho cột Trạng thái (dot indicator)
const renderStatus = (val) => (
  <div className="status-indicator">
    <span
      className={`status-dot-indicator ${val === 'Thành công' ? 'dot-success' : 'dot-fail'}`}
    />
    <span style={{
      color: val === 'Thành công' ? 'var(--accent-green)' : 'var(--accent-red)',
      fontWeight: 500,
      fontSize: '13px',
    }}>
      {val}
    </span>
  </div>
);

// Custom renderer cho cột Hành động
const renderAction = (val) => (
  <span style={{
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    background: val === 'BẬT' ? 'rgba(0,230,118,0.15)' : 'rgba(255,82,82,0.15)',
    color: val === 'BẬT' ? 'var(--accent-green)' : 'var(--accent-red)',
  }}>
    {val}
  </span>
);

const ActionHistory = ({ devices = [], onToggle, historyData = [], loadingDevices = {} }) => {
  const [filters, setFilters] = useState({
    time: '',
    thietBi: 'Tất cả',
    hanhDong: 'Tất cả',
    trangThai: 'Tất cả',
  });

  const [filteredData, setFilteredData] = useState(historyData);

  useEffect(() => {
    let result = [...historyData];
    if (filters.thietBi !== 'Tất cả')  result = result.filter(r => r.thietBi === filters.thietBi);
    if (filters.hanhDong !== 'Tất cả') result = result.filter(r => r.hanhDong === filters.hanhDong);
    if (filters.trangThai !== 'Tất cả') result = result.filter(r => r.trangThai === filters.trangThai);
    setFilteredData(result);
  }, [historyData]);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    let result = [...historyData];
    if (filters.thietBi !== 'Tất cả')  result = result.filter(r => r.thietBi === filters.thietBi);
    if (filters.hanhDong !== 'Tất cả') result = result.filter(r => r.hanhDong === filters.hanhDong);
    if (filters.trangThai !== 'Tất cả') result = result.filter(r => r.trangThai === filters.trangThai);
    if (filters.time) {
      result = result.filter(r => (r.gioBat && r.gioBat.includes(filters.time)) || (r.gioTat && r.gioTat.includes(filters.time)));
    }
    setFilteredData(result);
  };

  const handleReset = () => {
    setFilters({ time: '', thietBi: 'Tất cả', hanhDong: 'Tất cả', trangThai: 'Tất cả' });
    setFilteredData(historyData);
  };

  // Renderer toggle switch cho cột Điều khiển
  const renderToggle = (_, row) => {
    const devId = DEVICE_ID_MAP[row.thietBi];
    const device = devices.find(d => d.id === devId);

    // Thiết bị không nhận lệnh (thất bại) → hiện badge lỗi
    if (row.trangThai === 'Thất bại') {
      return (
        <span style={{
          padding: '2px 9px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          background: 'rgba(255,82,82,0.12)',
          color: 'var(--accent-red)',
          border: '1px solid rgba(255,82,82,0.2)',
        }}>
          <i className="bi bi-exclamation-triangle me-1" style={{ fontSize: '10px' }} />
          Lỗi
        </span>
      );
    }

    if (!device) return null;

    return (
      <label className="toggle-switch" aria-label={`Toggle ${row.thietBi}`} style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={device.isOn}
          onChange={() => onToggle && onToggle(devId)}
        />
        <span className="toggle-slider" />
      </label>
    );
  };

  // Cấu hình cột bảng
  const columns = [
    { key: 'id', label: 'ID ↕', render: val => <span className="cell-id">{val}</span> },
    { 
      key: 'user', 
      label: 'User ↕', 
      render: val => <span style={{ fontWeight: 500, color: 'var(--accent-primary)' }}><i className="bi bi-person-fill me-1" style={{opacity: 0.7}}></i>{val}</span> 
    },
    { key: 'thietBi', label: 'Device ↕' },
    { key: 'hanhDong', label: 'Action ↕', render: val => val.toUpperCase() === 'BẬT' ? 'Bật' : 'Tắt' },
    {
      key: 'trangThai',
      label: 'Status ↕',
      render: (val, row) => {
        let badge = 'OFF';
        let badgeStyle = { background: '#343a40', color: '#fff' }; // dark
        if (row.hanhDong.toUpperCase() === 'BẬT') {
          badge = 'ON';
          badgeStyle = { background: '#2ecc71', color: '#fff' }; // green
        }
        if (val === 'Thất bại') {
          badge = 'FAILED';
          badgeStyle = { background: '#e74c3c', color: '#fff' }; // red
        }
        if (val === 'Đang chờ' || val === 'LOADING') {
          badge = 'LOADING';
          badgeStyle = { background: 'transparent', color: '#95a5a6' }; // gray
        }
        return <span style={{ ...badgeStyle, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{badge}</span>;
      }
    },
    { key: 'tgPhanHoi', label: 'Response Time ↕' },
    { 
      key: 'gioBat', 
      label: 'Time ↕', 
      render: (val, row) => <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{val !== '—' ? val : row.gioTat}</span>
    },
  ];

  return (
    <>
      <Topbar title="Action History" subtitle="Lịch sử điều khiển thiết bị" />
      <main className="page-content">

        {/* ── DEVICE STATUS STRIP ── */}
        <div className="device-status-strip mb-4">
          <div className="section-header mb-3">
            <span className="section-title">Trạng thái thiết bị hiện tại</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {devices.filter(d => d.isOn).length}/{devices.length} đang bật
            </span>
          </div>
          <div className="row g-3">
            {devices.map(device => (
              <div key={device.id} className="col-12 col-md-4">
                <div
                  className={`device-status-mini ${device.isOn ? 'on' : 'off'} ${loadingDevices[device.id] ? 'loading' : ''}`}
                  onClick={() => !loadingDevices[device.id] && onToggle && onToggle(device.id)}
                >
                  <div className="dsm-left">
                    <div className={`dsm-icon ${device.isOn ? 'on' : 'off'}`}>
                      {loadingDevices[device.id] ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span>
                      ) : (
                        <i className={`bi ${device.icon}`} />
                      )}
                    </div>
                    <div>
                      <div className="dsm-name">{device.name}</div>
                      <div className={`dsm-status ${device.isOn ? 'on' : 'off'}`}>
                        {loadingDevices[device.id] ? (
                          <span style={{ color: 'var(--accent-orange)' }}>
                            <i className="bi bi-hourglass-split me-1" />
                            Đang xử lý...
                          </span>
                        ) : device.isOn ? (
                          <>
                            <i className="bi bi-circle-fill me-1" style={{ fontSize: '7px' }} />
                            Đang bật
                          </>
                        ) : (
                          <>
                            <i className="bi bi-circle me-1" style={{ fontSize: '7px' }} />
                            Tắt
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className="toggle-switch" aria-label={`Toggle ${device.name}`} onClick={e => { e.stopPropagation(); if(loadingDevices[device.id]) e.preventDefault(); }}>
                    <input
                      type="checkbox"
                      checked={device.isOn}
                      onChange={() => onToggle && onToggle(device.id)}
                      disabled={loadingDevices[device.id]}
                    />
                    <span className={`toggle-slider ${loadingDevices[device.id] ? 'loading-slider' : ''}`} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div className="section-header mb-3">
          <span className="section-title">Bộ lọc tra cứu</span>
        </div>
        <div className="filter-bar mb-4">
          <div className="row g-3 align-items-end">
            
            {/* Search Time */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="filter-label">Search Time</div>
              <input
                id="filter-time"
                type="text"
                className="form-control form-control-dark"
                placeholder="2026/08/17"
                value={filters.time}
                onChange={e => handleChange('time', e.target.value)}
              />
            </div>

            {/* Device */}
            <div className="col-12 col-sm-6 col-lg-2">
              <div className="filter-label">Device</div>
              <select
                id="filter-device"
                className="form-select form-control-dark"
                value={filters.thietBi}
                onChange={e => handleChange('thietBi', e.target.value)}
              >
                {deviceList.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Action */}
            <div className="col-12 col-sm-6 col-lg-2">
              <div className="filter-label">Action</div>
              <select
                id="filter-action"
                className="form-select form-control-dark"
                value={filters.hanhDong}
                onChange={e => handleChange('hanhDong', e.target.value)}
              >
                {actionList.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="col-12 col-sm-6 col-lg-2">
              <div className="filter-label">Status</div>
              <select
                id="filter-status"
                className="form-select form-control-dark"
                value={filters.trangThai}
                onChange={e => handleChange('trangThai', e.target.value)}
              >
                {statusList.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {/* Buttons */}
            <div className="col-12 col-sm-12 col-lg-auto d-flex gap-2">
              <button id="btn-search-action" className="btn btn-search flex-grow-1" onClick={handleSearch} style={{ padding: '9px 24px', background: '#3b519c', letterSpacing: '0.02em' }}>
                Tìm kiếm
              </button>
              <button id="btn-reset-action" className="btn btn-rst" onClick={handleReset} title="Làm mới" style={{ color: '#3b519c', borderColor: 'var(--border)' }}>
                <i className="bi bi-arrow-repeat" />
              </button>
            </div>

          </div>
        </div>

        {/* ── DATA TABLE ── */}
        <div className="section-header mb-3">
          <span className="section-title">Lịch sử điều khiển</span>
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          total={filteredData.length}
          pageSize={6}
        />

      </main>
    </>
  );
};

export default ActionHistory;
