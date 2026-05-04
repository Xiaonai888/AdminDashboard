import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import SlideSection from './pages/SlideSection';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  :root {
    --bg-main: #F8FAFC; --bg-card: #FFFFFF; --primary: #4F46E5; --primary-light: #EEF2FF;
    --text-main: #0F172A; --text-muted: #64748B; --success: #10B981;
    --border: #E2E8F0; --sidebar-collapsed: 85px; --sidebar-expanded: 280px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-main); color: var(--text-main); }
  .app-layout { display: flex; height: 100vh; overflow: hidden; }
  
  .sidebar {
    width: var(--sidebar-collapsed); background: var(--bg-card);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    padding: 25px 15px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative; z-index: 1000; overflow-y: auto; overflow-x: hidden; flex-shrink: 0;
  }
  .sidebar:hover { width: var(--sidebar-expanded); box-shadow: 15px 0 40px rgba(0,0,0,0.04); }
  .sidebar-logo { min-height: 50px; display: flex; align-items: center; gap: 15px; margin-bottom: 40px; padding-left: 12px; }
  .logo-text { font-size: 20px; font-weight: 800; color: var(--primary); opacity: 0; transition: opacity 0.2s; white-space: nowrap; }
  .sidebar:hover .logo-text { opacity: 1; }
  .nav-group-label { font-size: 11px; font-weight: 800; color: var(--text-muted); margin: 25px 0 10px 15px; white-space: nowrap; opacity: 0; transition: opacity 0.2s; text-transform: uppercase; letter-spacing: 1.2px; }
  .sidebar:hover .nav-group-label { opacity: 1; }
  .nav-item { display: flex; align-items: center; min-height: 48px; padding: 0 15px; border-radius: 12px; color: var(--text-muted); font-weight: 600; cursor: pointer; transition: all 0.2s ease; margin-bottom: 5px; white-space: nowrap; font-size: 15px; text-decoration: none; }
  .nav-item:hover, .nav-item.active { background: var(--primary-light); color: var(--primary); }
  .nav-text { margin-left: 16px; opacity: 0; transition: opacity 0.2s; }
  .sidebar:hover .nav-text { opacity: 1; }
  .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
`;

const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}><path d={d} /></svg>
);

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/novels', label: 'Novels Content', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
  ]
};

const MainLayout = ({ children }) => {
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
            <Icon d={item.icon} /><span className="nav-text">{item.label}</span>
          </div>
        ))}
        <span className="nav-group-label">Visual Media</span>
        {navItems.visualMedia.map(item => (
          <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            <Icon d={item.icon} /><span className="nav-text">{item.label}</span>
          </div>
        ))}
      </aside>
      <div className="main-area">{children}</div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <style>{styles}</style>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<MainLayout><AdminDashboard /></MainLayout>} />
        <Route path="/slides" element={<MainLayout><SlideSection /></MainLayout>} />
      </Routes>
    </Router>
  );
}
