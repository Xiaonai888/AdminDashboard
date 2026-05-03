import React, { useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import NovelsContent from './pages/NovelsContent';
import AuthorsCommunity from './pages/AuthorsCommunity';
import Income from './pages/Income';
import {
  CategoryPage, AccountPage, BlockListPage, RankingPage,
  DepositPage, WithdrawPage, HistoryPage,
  SlideSectionPage, BannerSystemPage, RulePage
} from './pages/OtherPages';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  :root {
    --bg-main: #F8FAFC; --bg-card: #FFFFFF; --primary: #4F46E5; --primary-light: #EEF2FF;
    --text-main: #0F172A; --text-muted: #64748B; --success: #10B981;
    --border: #E2E8F0; --sidebar-collapsed: 80px; --sidebar-expanded: 260px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-main); }

  .app-layout { display: flex; height: 100vh; font-family: 'Inter', sans-serif; overflow: hidden; }

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

  .nav-group-label { font-size: 10px; font-weight: 800; color: var(--text-muted); margin: 20px 0 8px 12px; white-space: nowrap; opacity: 0; transition: opacity 0.2s; text-transform: uppercase; letter-spacing: 1px; }
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

const navItems = {
  overview: [
    { key: 'dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { key: 'novels', label: 'Novels Content', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { key: 'authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { key: 'slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { key: 'banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { key: 'advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { key: 'recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { key: 'category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { key: 'rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { key: 'account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { key: 'blocklist', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { key: 'income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { key: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { key: 'deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { key: 'withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { key: 'ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
};

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>{title}</h2>
    <p style={{ fontSize: '14px' }}>This page is under development.</p>
  </div>
);

const pageMap = {
  dashboard: () => null, // Rendered at app level without sidebar
  novels: <NovelsContent />,
  authors: <AuthorsCommunity />,
  slides: <SlideSectionPage />,
  banners: <BannerSystemPage />,
  advertisement: <PlaceholderPage title="Advertisement" />,
  recommended: <PlaceholderPage title="Recommended" />,
  category: <CategoryPage />,
  rule: <RulePage />,
  account: <AccountPage />,
  blocklist: <BlockListPage />,
  income: <Income />,
  history: <HistoryPage />,
  deposit: <DepositPage />,
  withdraw: <WithdrawPage />,
  ranking: <RankingPage />,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  // Dashboard uses full layout (has its own sidebar embedded)
  if (activePage === 'dashboard') {
    return (
      <>
        <style>{styles}</style>
        <AdminDashboard onNavigate={setActivePage} />
        {/* Override nav items click from dashboard sidebar */}
      </>
    );
  }

  const allItems = [...navItems.overview, ...navItems.visualMedia, ...navItems.systemAdmin, ...navItems.finance];

  return (
    <>
      <style>{styles}</style>
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            <span className="logo-text">Shadow Exclusive</span>
          </div>

          <span className="nav-group-label">Overview</span>
          {navItems.overview.map(item => (
            <div key={item.key} className={`nav-item ${activePage === item.key ? 'active' : ''}`} onClick={() => setActivePage(item.key)}>
              <Icon d={item.icon} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}

          <span className="nav-group-label">Visual Media</span>
          {navItems.visualMedia.map(item => (
            <div key={item.key} className={`nav-item ${activePage === item.key ? 'active' : ''}`} onClick={() => setActivePage(item.key)}>
              <Icon d={item.icon} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}

          <span className="nav-group-label">System Admin</span>
          {navItems.systemAdmin.map(item => (
            <div key={item.key} className={`nav-item ${activePage === item.key ? 'active' : ''}`} onClick={() => setActivePage(item.key)}>
              <Icon d={item.icon} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}

          <span className="nav-group-label">Finance & Growth</span>
          {navItems.finance.map(item => (
            <div key={item.key} className={`nav-item ${activePage === item.key ? 'active' : ''}`} onClick={() => setActivePage(item.key)}>
              <Icon d={item.icon} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </aside>

        <div className="main-area">
          <div className="page-content">
            {pageMap[activePage] || <PlaceholderPage title={allItems.find(i => i.key === activePage)?.label || activePage} />}
          </div>
        </div>
      </div>
    </>
  );
}
