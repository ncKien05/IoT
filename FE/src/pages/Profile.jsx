import React from 'react';
import Topbar from '../components/Topbar';
import './Profile.css';

const Profile = () => {
  const resources = [
    {
      title: 'GitHub',
      iconClass: 'bi-github github',
      status: 'Đã liên kết',
      isLinked: true,
      desc: 'Repository mã nguồn dự án',
      link: 'https://github.com/ncKien05',
      btnText: 'Mở tài nguyên',
    },
    {
      title: 'Figma',
      iconClass: 'bi-palette figma',
      status: 'Đã liên kết',
      isLinked: true,
      desc: 'Thiết kế giao diện hệ thống',
      link: 'https://www.figma.com/design/...',
      btnText: 'Mở tài nguyên',
    },
    {
      title: 'Postman',
      iconClass: 'bi-send postman',
      status: 'Chưa liên kết',
      isLinked: false,
      desc: 'Tài liệu API và collection test',
      link: 'Chưa có thông tin',
      btnText: 'Cấu hình ngay',
    },
    {
      title: 'Báo cáo',
      iconClass: 'bi-file-earmark-text report',
      status: 'Chưa liên kết',
      isLinked: false,
      desc: 'Tài liệu báo cáo bài tập lớn',
      link: 'Chưa có thông tin',
      btnText: 'Cấu hình ngay',
    }
  ];

  return (
    <>
      <Topbar title="Profile" subtitle="Thông tin tài khoản quản trị" />
      <main className="page-content">
        <div className="row g-4">

          {/* ── LEFT: Profile Card ── */}
          <div className="col-12 col-xl-4 col-lg-5">
            <div className="profile-main-card">
              <div className="profile-cover">
                <button className="btn-edit-profile">
                  <i className="bi bi-pencil-square"></i> Sửa hồ sơ
                </button>
              </div>
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-img">NK</div>
              </div>
              <div className="profile-name">Nguyễn Cao Kiên</div>
              <div className="profile-role">B23DCAT159</div>
              
              <div className="profile-divider"></div>
              
              <div className="profile-details">
                <div className="detail-item">
                  <div className="detail-icon"><i className="bi bi-card-heading"></i></div>
                  <div className="detail-text">
                    <span className="detail-label">Mã sinh viên</span>
                    <span className="detail-value">B23DCAT159</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon"><i className="bi bi-people"></i></div>
                  <div className="detail-text">
                    <span className="detail-label">Lớp</span>
                    <span className="detail-value">D23CQAT04-B</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon"><i className="bi bi-envelope"></i></div>
                  <div className="detail-text">
                    <span className="detail-label">Email liên hệ</span>
                    <span className="detail-value">Nguyenkien26122005@gmail.com</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon"><i className="bi bi-telephone"></i></div>
                  <div className="detail-text">
                    <span className="detail-label">Số điện thoại</span>
                    <span className="detail-value">0987809265</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Project Resources ── */}
          <div className="col-12 col-xl-8 col-lg-7">
            <div className="section-header mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <span className="section-title" style={{ fontSize: '18px' }}>Tài nguyên dự án</span>
            </div>
            
            <div className="row g-4">
              {resources.map((res, idx) => (
                <div key={idx} className="col-12 col-md-6">
                  <div className="resource-card">
                    <div className="resource-header">
                      <div className="resource-title-group">
                        <i className={`bi ${res.iconClass} resource-icon`}></i>
                        <span className="resource-title">{res.title}</span>
                      </div>
                      <div className={`resource-status ${res.isLinked ? 'status-linked' : 'status-unlinked'}`}>
                        <div className="status-dot-sm"></div>
                        {res.status}
                      </div>
                    </div>
                    
                    <div className="resource-desc">{res.desc}</div>
                    
                    <div className="resource-link">
                      {res.isLinked ? (
                        <a href={res.link} target="_blank" rel="noreferrer">{res.link}</a>
                      ) : (
                        <span>{res.link}</span>
                      )}
                    </div>
                    
                    <button 
                      className={`btn-resource ${res.isLinked ? 'btn-resource-primary' : 'btn-resource-outline'}`}
                      onClick={() => res.isLinked && window.open(res.link, '_blank')}
                    >
                      {res.btnText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

export default Profile;
