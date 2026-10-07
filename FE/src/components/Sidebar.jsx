import React from 'react';

const navItems = [
  { id: 'dashboard',      icon: 'bi-grid-1x2-fill',   label: 'Dashboard' },
  { id: 'data-sensor',    icon: 'bi-activity',         label: 'Data Sensor' },
  { id: 'action-history', icon: 'bi-clock-history',    label: 'Action History' },
  { id: 'profile',        icon: 'bi-person-circle',    label: 'Profile' },
];

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo d-flex align-items-center gap-3">
        <div className="logo-icon">
          <i className="bi bi-cpu" />
        </div>
        <div>
          <div className="logo-text">IoT Monitor</div>
          <div className="logo-sub">Classroom Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate(item.id)}
          >
            <i className={`bi ${item.icon} nav-icon`} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Footer User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">AD</div>
          <div>
            <div className="user-name">Admin</div>
            <div className="user-role">Quản trị viên</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
