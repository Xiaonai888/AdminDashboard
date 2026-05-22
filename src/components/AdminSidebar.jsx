import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Icon = ({ d, size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const styles = `
  .admin-sidebar {
    width:80px;
    background:#fff;
    border-right:1px solid #E2E8F0;
    padding:20px 14px;
    overflow:auto;
    overflow-x:hidden;
    transition:.25s;
    flex-shrink:0;
    position:relative;
    z-index:1000;
  }

  .admin-sidebar:hover {
    width:260px;
    box-shadow:10px 0 30px rgba(15,23,42,.05);
  }

  .admin-sidebar-logo {
    height:40px;
    display:flex;
    align-items:center;
    gap:12px;
    margin-bottom:28px;
    padding-left:10px;
  }

  .admin-sidebar-logo-text {
    opacity:0;
    white-space:nowrap;
    color:#4F46E5;
    font-weight:900;
    font-size:18px;
  }

  .admin-sidebar:hover .admin-sidebar-logo-text,
  .admin-sidebar:hover .admin-sidebar-nav-text,
  .admin-sidebar:hover .admin-sidebar-group-label {
    opacity:1;
  }

  .admin-sidebar-group-label {
    opacity:0;
    display:block;
    margin:18px 0 8px 12px;
    font-size:10px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:1px;
    color:#64748B;
    white-space:nowrap;
  }

  .admin-sidebar-nav-item {
    height:44px;
    display:flex;
    align-items:center;
    border-radius:12px;
    padding:0 12px;
    color:#64748B;
    cursor:pointer;
    margin-bottom:2px;
    font-weight:700;
    white-space:nowrap;
  }

  .admin-sidebar-nav-item:hover,
  .admin-sidebar-nav-item.active {
    background:#EEF2FF;
    color:#4F46E5;
  }

  .admin-sidebar-nav-text {
    opacity:0;
    margin-left:14px;
    transition:.2s;
  }
`;

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
    { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
    { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { path: '/payment', label: 'Payment', icon: 'M21 12V7H5v10h16v-5z M5 7l8 5 8-5 M7 17h10' },
    { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
};

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const renderGroup = (label, items) => (
    <>
      <span className="admin-sidebar-group-label">{label}</span>
      {items.map((item) => (
        <div key={item.path} className={`admin-sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
          <Icon d={item.icon} size={20} />
          <span className="admin-sidebar-nav-text">{item.label}</span>
        </div>
      ))}
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="#4F46E5" />
          <span className="admin-sidebar-logo-text">Shadow Exclusive</span>
        </div>
        {renderGroup('Overview', navItems.overview)}
        {renderGroup('Visual Media', navItems.visualMedia)}
        {renderGroup('System Admin', navItems.systemAdmin)}
        {renderGroup('Finance & Growth', navItems.finance)}
      </aside>
    </>
  );
}
