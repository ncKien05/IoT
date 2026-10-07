import React, { useState } from 'react';

/**
 * DataTable - Bảng dữ liệu dùng chung cho Data Sensor & Action History
 * @param {Array}  columns  - Cấu hình cột [{ key, label, render? }]
 * @param {Array}  data     - Dữ liệu rows
 * @param {number} total    - Tổng số bản ghi
 * @param {number} pageSize - Số dòng mỗi trang
 */
const DataTable = ({ columns, data, total = 0, pageSize = 8 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(total / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="data-table-wrapper">
      {/* Table Header Bar */}
      <div className="table-header-bar">
        <div className="table-count">
          Hiển thị <span>{startRecord}–{endRecord}</span> / <span>{total}</span> bản ghi
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <i className="bi bi-arrow-clockwise me-1" />
          Cập nhật: 10:30 AM
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}
                >
                  <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }} />
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-wrap">
        <div className="pagination-info">
          Trang {currentPage} / {totalPages}
        </div>
        <div className="pagination-btns">
          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Trang trước"
          >
            <i className="bi bi-chevron-left" />
          </button>

          {getPageNumbers().map(page => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
              aria-label={`Trang ${page}`}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Trang sau"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
