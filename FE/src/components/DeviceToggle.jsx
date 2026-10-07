import React from 'react';

/**
 * DeviceToggle - Thẻ điều khiển thiết bị với toggle switch
 * @param {string}   icon     - Bootstrap icon class
 * @param {string}   name     - Tên thiết bị
 * @param {boolean}  isOn     - Trạng thái bật/tắt
 * @param {function} onToggle - Callback khi toggle
 */
const DeviceToggle = ({ icon, name, isOn, onToggle, isLoading }) => {
  return (
    <div className={`device-card ${isOn ? 'on' : 'off'} ${isLoading ? 'loading' : ''} h-100`}>
      <div className="device-icon-wrap">
        {isLoading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '1.2rem', height: '1.2rem' }}></span>
        ) : (
          <i className={`bi ${icon}`} />
        )}
      </div>

      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="device-name">{name}</div>
          <div className="device-status-text">
            {isLoading ? (
              <span style={{ color: 'var(--accent-orange)' }}>
                <i className="bi bi-hourglass-split me-1" />
                Đang xử lý...
              </span>
            ) : isOn ? (
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

        <label className="toggle-switch" aria-label={`Toggle ${name}`}>
          <input
            type="checkbox"
            checked={isOn}
            onChange={onToggle}
            disabled={isLoading}
          />
          <span className={`toggle-slider ${isLoading ? 'loading-slider' : ''}`} />
        </label>
      </div>
    </div>
  );
};

export default DeviceToggle;
