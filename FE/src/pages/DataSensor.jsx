import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Topbar from '../components/Topbar';
import { sensorData as mockSensorData } from '../data/mockData';

// ─── Các lựa chọn dropdown ────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { value: 'tatca',    label: 'Tất cả' },
  { value: 'thoigian', label: 'Thời gian' },
  { value: 'nhietdo',  label: 'Nhiệt độ' },
  { value: 'doam',     label: 'Độ ẩm' },
  { value: 'anhsang',  label: 'Ánh sáng' },
];

// Placeholder gợi ý theo lựa chọn
const PLACEHOLDER_MAP = {
  tatca:    'Nhập từ khóa bất kỳ...',
  thoigian: 'VD: 2026-08-27  hoặc  10:30',
  nhietdo:  'VD: 27.5  (giá trị nhiệt độ)',
  doam:     'VD: 62  (giá trị độ ẩm %)',
  anhsang:  'VD: 820  (giá trị ánh sáng lux)',
};

// ─── Cấu hình cột bảng ────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: 'id',
    label: 'ID',
    render: val => <span className="cell-id">{val}</span>,
  },
  {
    key: 'loai',
    label: 'Loại cảm biến',
    render: val => {
      const cfg = {
        'Nhiệt độ': { bg: 'rgba(255,107,107,0.15)', color: '#ff6b6b', icon: 'bi-thermometer-half' },
        'Độ ẩm':    { bg: 'rgba(0,212,255,0.15)',   color: '#00d4ff', icon: 'bi-droplet-fill' },
        'Ánh sáng': { bg: 'rgba(255,171,64,0.15)',  color: '#ffab40', icon: 'bi-brightness-high-fill' },
      }[val] || { bg: 'rgba(255,255,255,0.08)', color: '#8bafd4', icon: 'bi-cpu' };
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '20px',
          background: cfg.bg, color: cfg.color,
          fontSize: '12px', fontWeight: 600,
        }}>
          <i className={`bi ${cfg.icon}`} style={{ fontSize: '11px' }} />
          {val}
        </span>
      );
    },
  },
  {
    key: 'giaTri',
    label: 'Giá trị',
    render: (val, row) => (
      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
        {val}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 400 }}>
          {row.donVi}
        </span>
      </span>
    ),
  },
  {
    key: 'thoiGian',
    label: 'Thời gian',
    render: val => (
      <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <i className="bi bi-clock" style={{ fontSize: '11px' }} />
        {val}
      </span>
    ),
  },
];

// ─── Component chính ──────────────────────────────────────────────────────
const DataSensor = () => {
  const [filterType, setFilterType] = useState('tatca'); // giá trị dropdown
  const [inputVal,   setInputVal]   = useState('');      // giá trị textbox

  const [sensorData,   setSensorData]   = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch dữ liệu (hoặc fallback mock)
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch('http://localhost:5000/api/sensors/history');
        const data = await res.json();
        if (data.success && data.data?.length) {
          setSensorData(data.data);
          setFilteredData(data.data);
          return;
        }
      } catch (_) {}
      setSensorData(mockSensorData);
      setFilteredData(mockSensorData);
    };
    load();
  }, []);

  // Reset textbox khi đổi loại lọc
  const handleTypeChange = (val) => {
    setFilterType(val);
    setInputVal('');
    setFilteredData(sensorData); // xem tất cả khi đổi loại
  };

  // ── Tìm kiếm ─────────────────────────────────────────────────────────
  const handleSearch = () => {
    const q = inputVal.trim();
    let result = [...sensorData];

    if (filterType === 'nhietdo') {
      result = result.filter(r => r.loai === 'Nhiệt độ');
      if (q) result = result.filter(r => String(r.giaTri).includes(q));

    } else if (filterType === 'doam') {
      result = result.filter(r => r.loai === 'Độ ẩm');
      if (q) result = result.filter(r => String(r.giaTri).includes(q));

    } else if (filterType === 'anhsang') {
      result = result.filter(r => r.loai === 'Ánh sáng');
      if (q) result = result.filter(r => String(r.giaTri).includes(q));

    } else if (filterType === 'thoigian') {
      if (q) result = result.filter(r => r.thoiGian && r.thoiGian.includes(q));

    } else {
      // Tất cả: tìm trong mọi trường nếu có nhập
      if (q) {
        const lq = q.toLowerCase();
        result = result.filter(r =>
          r.loai.toLowerCase().includes(lq) ||
          String(r.giaTri).includes(lq) ||
          r.donVi.toLowerCase().includes(lq) ||
          (r.thoiGian && r.thoiGian.includes(lq))
        );
      }
    }

    setFilteredData(result);
  };

  const handleReset = () => {
    setInputVal('');
    setFilteredData(sensorData);
  };

  // Hiển thị label loại đang lọc (cho tag)
  const activeLabel = FILTER_OPTIONS.find(o => o.value === filterType)?.label;
  const isFiltered  = filteredData.length !== sensorData.length;

  return (
    <>
      <Topbar title="Data Sensor" subtitle="Lịch sử dữ liệu cảm biến" />
      <main className="page-content">

        {/* ── TIÊU ĐỀ ── */}
        <div className="section-header mb-3">
          <span className="section-title">Bộ lọc tra cứu</span>
        </div>

        {/* ── FILTER BAR: 1 dropdown + 1 textbox ── */}
        <div className="filter-bar mb-4">
          <div className="row g-3 align-items-end">

            {/* Dropdown chọn loại */}
            <div className="col-12 col-sm-5 col-lg-3">
              <div className="filter-label">Tìm kiếm theo</div>
              <select
                id="filter-type-select"
                className="form-select form-control-dark"
                value={filterType}
                onChange={e => handleTypeChange(e.target.value)}
              >
                {FILTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Textbox nhập giá trị */}
            <div className="col-12 col-sm-7 col-lg-5">
              <div className="filter-label">
                Nhập giá trị
                {filterType !== 'tatca' && (
                  <span className="filter-label-sub"> — {activeLabel}</span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <i
                  className={`bi ${
                    filterType === 'thoigian' ? 'bi-clock'
                    : filterType === 'nhietdo'  ? 'bi-thermometer-half'
                    : filterType === 'doam'     ? 'bi-droplet-fill'
                    : filterType === 'anhsang'  ? 'bi-brightness-high-fill'
                    : 'bi-search'
                  }`}
                  style={{
                    position: 'absolute', left: '13px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontSize: '14px', pointerEvents: 'none',
                  }}
                />
                <input
                  id="filter-value-input"
                  type="text"
                  className="form-control form-control-dark form-control-with-icon"
                  placeholder={PLACEHOLDER_MAP[filterType]}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Nút tìm kiếm & reset */}
            <div className="col-12 col-lg-auto d-flex gap-2">
              <button
                id="btn-search-sensor"
                className="btn btn-search"
                onClick={handleSearch}
                style={{ padding: '9px 22px', letterSpacing: '0.02em' }}
              >
                <i className="bi bi-search me-2" />
                Tìm kiếm
              </button>
              <button
                id="btn-reset-sensor"
                className="btn"
                onClick={handleReset}
                title="Xóa bộ lọc"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: '10px',
                  padding: '9px 13px',
                  fontSize: '15px',
                }}
              >
                <i className="bi bi-arrow-repeat" />
              </button>
            </div>
          </div>

          {/* Tag kết quả đang lọc */}
          {isFiltered && (
            <div className="active-filters">
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kết quả lọc:</span>
              <span className="filter-tag">
                {activeLabel}
                {inputVal && ` — "${inputVal}"`}
                <button onClick={handleReset}>&times;</button>
              </span>
            </div>
          )}
        </div>

        {/* ── DATA TABLE ── */}
        <div className="section-header mb-3">
          <span className="section-title">Dữ liệu cảm biến</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{filteredData.length}</span>
            /{sensorData.length} bản ghi
          </span>
        </div>

        <DataTable
          columns={COLUMNS}
          data={filteredData}
          total={filteredData.length}
          pageSize={8}
        />

      </main>
    </>
  );
};

export default DataSensor;
