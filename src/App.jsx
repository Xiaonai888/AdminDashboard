import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// Import Satellite Pages (អ្នកត្រូវប្រាកដថាអ្នកមាន File ទាំងនេះក្នុង Folder pages)
import AdminDashboard from './pages/AdminDashboard';
import SlideSection from './pages/SlideSection';
// អ្នកអាច import pages ពិតប្រាកដរបស់អ្នកនៅទីនេះ ឧទាហរណ៍៖
// import Account from './pages/Account';

// Placeholder សម្រាប់ទំព័រដែលមិនទាន់មាន (ដើម្បីកុំឱ្យ Error ពេល build)
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>{title} Page</h2>
    <p style={{ fontSize: '14px' }}>This page is under development for Shadow Exclusive.</p>
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
  .sidebar::-webkit-scrollbar { width: 0px; }
  .sidebar:hover { width: var(--sidebar-expanded); box-shadow: 10px 0 30px rgba(0,0,0,0.04); }
  .sidebar-logo { min-height: 40px; display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding-left: 10px; }
  .logo-text { font-size: 18px; font-weight: 700; color: var(--primary); opacity: 0; transition: opacity 0.2s; white-space: nowrap; }
  .sidebar:hover .logo-text { opacity: 1; }
  .nav-group-label { font-size: 10px; font-weight: 800; color: var(--text-muted); margin: 20px 0 8px 12px; white-space: nowrap; opacity: 0; transition: opacity 0.2; text-transform: uppercase; letter-spacing: 1px; }
  .sidebar:hover .nav-group-label { opacity: 1; }
  .nav-item { display: flex; align-items: center; min-height: 44px; padding: 0 12px; border-radius: 10px; color: var(--text-muted); font-weight: 500; cursor: pointer; transition: all 0.2s ease; margin-bottom: 2px; white-space: nowrap; font-size: 14px; text-decoration: none;}
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

// រចនាសម្ព័ន្ធ Menu របស់អ្នក (រក្សាទុកទិន្នន័យចាស់របស់អ្នកទាំងអស់)
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
    { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { path: '/blocklist', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
};

// Component layout សម្រាប់គ្រប់ទំព័រ (ដែលមាន Sidebar)
const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* Sidebar (រក្សាទុកកូដរចនាប័ទ្មរបស់អ្នកទាំងអស់) */}
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
        {navItems.systemAdmin.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            <Icon d={item.icon} />
            <span className="nav-text">{item.label}</span>
          </div>
        ))}

        <span className="nav-group-label">Finance & Growth</span>
        {navItems.finance.map(item => (
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
        {/* បើចូលមកកាន់ / ឱ្យវា Navigate ទៅ Dashboard ភ្លាម */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* ទំព័រពិតប្រាកដដែលអ្នកមាន File រួចហើយ */}
        <Route path="/admin" element={<MainLayout><AdminDashboard /></MainLayout>} />
        <Route path="/slides" element={<MainLayout><SlideSection /></MainLayout>} />
        
        {/* Placeholders សម្រាប់ទំព័រដែលមិនទាន់មាន File */}
        <Route path="/novels" element={<MainLayout><PlaceholderPage title="Novels Content" /></MainLayout>} />
        <Route path="/authors" element={<MainLayout><PlaceholderPage title="Authors Community" /></MainLayout>} />
        <Route path="/banners" element={<MainLayout><PlaceholderPage title="Banner System" /></MainLayout>} />
        <Route path="/ads" element={<MainLayout><PlaceholderPage title="Advertisement" /></MainLayout>} />
        <Route path="/recommended" element={<MainLayout><PlaceholderPage title="Recommended" /></MainLayout>} />
        <Route path="/category" element={<MainLayout><PlaceholderPage title="Category" /></MainLayout>} />
        <Route path="/rule" element={<MainLayout><PlaceholderPage title="Rule" /></MainLayout>} />
        <Route path="/account" element={<MainLayout><PlaceholderPage title="Account Settings" /></MainLayout>} />
        <Route path="/blocklist" element={<MainLayout><PlaceholderPage title="Block List" /></MainLayout>} />
        <Route path="/income" element={<MainLayout><PlaceholderPage title="Income Management" /></MainLayout>} />
        <Route path="/history" element={<MainLayout><PlaceholderPage title="History" /></MainLayout>} />
        <Route path="/deposit" element={<MainLayout><PlaceholderPage title="Deposit" /></MainLayout>} />
        <Route path="/withdraw" element={<MainLayout><PlaceholderPage title="Withdraw" /></MainLayout>} />
        <Route path="/ranking" element={<MainLayout><PlaceholderPage title="Ranking" /></MainLayout>} />

        {/* បើវាយ Link ផ្តេសផ្តាស ឱ្យត្រឡប់មក Dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}
