import React from 'react';

/**
 * Topbar - Thanh tiêu đề trên cùng của mỗi trang
 * @param {boolean} isDemoMode - Hiển thị badge DEMO khi không có kết nối ESP/BE
 */
const Topbar = ({ title, subtitle, isDemoMode = false }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-subtitle">{subtitle}</div>
      </div>
      <div className="topbar-right">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{timeStr}</div>
          <div>{dateStr}</div>
        </div>

        {/* Badge trạng thái: Demo hoặc Trực tuyến */}
        {isDemoMode ? (
          <div className="status-badge status-badge-demo">
            <i className="bi bi-wifi-off" style={{ fontSize: '11px' }} />
            Chế độ Demo
          </div>
        ) : (
          <div className="status-badge">
            <span className="status-dot" />
            Trực tuyến
          </div>
        )}

        <div style={{
          width: '34px', height: '34px',
          borderRadius: '50%',
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '16px'
        }}>
          <i className="bi bi-bell" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
