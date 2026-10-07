import React from 'react';

/**
 * MetricCard - Thẻ hiển thị chỉ số cảm biến
 * @param {string} type     - 'temp' | 'humidity' | 'light'
 * @param {string} icon     - Bootstrap icon class
 * @param {string} label    - Tên chỉ số
 * @param {number} value    - Giá trị hiện tại
 * @param {string} unit     - Đơn vị đo
 * @param {string} subtitle - Mô tả trạng thái
 * @param {string} trend    - 'up' | 'down' | 'stable'
 * @param {string} trendLabel - Nhãn trend
 */
const MetricCard = ({ type, icon, label, value, unit, subtitle, trend, trendLabel }) => {
  return (
    <div className={`metric-card ${type} h-100`}>
      <div className="card-icon">
        <i className={`bi ${icon}`} />
      </div>

      <div className="metric-label">{label}</div>

      <div className="d-flex align-items-baseline gap-2">
        <span className="metric-value">{value}</span>
        <span className="metric-unit">{unit}</span>
      </div>

      <div className="metric-subtitle">
        <span className={`metric-trend trend-${trend}`}>
          {trend === 'up' && <i className="bi bi-arrow-up-short" />}
          {trend === 'down' && <i className="bi bi-arrow-down-short" />}
          {trend === 'stable' && <i className="bi bi-dash" />}
          {trendLabel}
        </span>
        <span className="ms-2">{subtitle}</span>
      </div>
    </div>
  );
};

export default MetricCard;
