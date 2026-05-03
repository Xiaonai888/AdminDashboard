import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Import Pages (ត្រូវប្រាកដថាអ្នកមាន File ទាំងនេះក្នុង Folder pages)
import AdminDashboard from './pages/AdminDashboard';
import SlideSection from './pages/SlideSection';

// Placeholder សម្រាប់ទំព័រដែលមិនទាន់មាន (ដើម្បីកុំឱ្យ Error)
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>{title}</h2>
    <p>This page is under development for Shadow Exclusive.</p>
  </div>
);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  :root {
    --bg-main: #F8FAFC; --bg-card: #FFFFFF; --primary: #4F46E5; --primary-light: #EEF2FF;
    --text-main: #0F172A; --text-muted: #64748B; --success: #10B981;
    --border: #E2E8F0; --sidebar-collapsed: 80px; --sidebar-expanded: 260px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-main); }
  .app-layout { display: flex; height: 100vh; overflow: hidden; }
  
  .sidebar {
    width: var(--sidebar-collapsed); background: var(--bg-card);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    padding: 20px 14px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative; z-index: 1000; overflow-y: auto; overflow-x: hidden; flex-shrink: 0;
  }
  .sidebar:hover { width: var(--sidebar-expanded); box-shadow: 10px 0 30px rgba(0,0,0,0.04); }
  .sidebar-logo { min-height: 40px; display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding-left: 10px; }
  .logo-text { font-size: 18px; font-weight: 700; color: var(--primary); opacity: 0; transition: opacity 0.2s; white-space: nowrap; }
  .sidebar:hover .logo-text { opacity: 1; }
  .nav-group-label { font-size: 10px; font-weight: 800; color: var(--text-muted); margin: 20px 0 8px 12px; white-space: nowrap; opacity: 0; transition: opacity 0.2; text-transform: uppercase; letter-spacing: 1px; }
  .sidebar:hover .nav-group-label { opacity: 1; }
  .nav-item { display: flex; align-items: center; min-height: 44px; padding: 0 12px; border-radius: 10px; color: var(--text-muted); font-weight: 500; cursor: pointer; transition: all 0.2s ease; margin-bottom: 2px; white-space: nowrap; font-size: 14px; }
  .nav-item:hover, .nav-item.active { background: var(--primary-light); color: var(--primary); }
  .nav-text { margin-left: 14px; opacity: 0; transition: opacity 0.2s; }
  .sidebar:hover .nav-text { opacity: 1; }
  .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .page-content { flex: 1; overflow-y: auto; }
`;

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

// រចនាសម្ព័ន្ធ Menu របស់អ្នក (រក្សាទុកទាំងអស់)
const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/novels', label: 'Novels Content', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/ads', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
  ],
  system: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
  ]
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          <span className="logo-text">Shadow Exclusive</span>
        </div>

        <span className="nav-group-label">Overview</span>
        {navItems.overview.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            <Icon d={item.icon} />
            <span className="nav-text">{item.label}</span>
          </div>
        ))}

        <span className="nav-group-label">Visual Media</span>
        {navItems.visualMedia.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            <Icon d={item.icon} />
            <span className="nav-text">{item.label}</span>
          </div>
        ))}

        <span className="nav-group-label">System Admin</span>
        {navItems.system.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            <Icon d={item.icon} />
            <span className="nav-text">{item.label}</span>
          </div>
        ))}
      </aside>

      <div className="main-area">
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <style>{styles}</style>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" />} />
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/slides" element={<Layout><SlideSection /></Layout>} />
        
        {/* Route សម្រាប់ទំព័រផ្សេងៗទៀតដែលអ្នកចង់បន្ថែម */}
        <Route path="/novels" element={<Layout><PlaceholderPage title="Novels Content" /></Layout>} />
        <Route path="/authors" element={<Layout><PlaceholderPage title="Authors Community" /></Layout>} />
        <Route path="/banners" element={<Layout><PlaceholderPage title="Banner System" /></Layout>} />
        <Route path="/account" element={<Layout><PlaceholderPage title="Account Settings" /></Layout>} />
      </Routes>
    </Router>
  );
}
