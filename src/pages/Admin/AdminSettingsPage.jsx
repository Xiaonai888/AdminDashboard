import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ChangePasswordSection from './sections/ChangePasswordSection'
import ComingSoonSection from './sections/ComingSoonSection'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --bg-main: #F8FAFC;
    --bg-card: #FFFFFF;
    --primary: #4F46E5;
    --primary-light: #EEF2FF;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --border: #E2E8F0;
    --sidebar-collapsed: 80px;
    --sidebar-expanded: 260px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-main); color: var(--text-main); }

  .dashboard-wrapper {
    display: flex;
    height: 100vh;
    background: var(--bg-main);
    overflow: hidden;
  }

  .sidebar {
    width: var(--sidebar-collapsed);
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 20px 14px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1000;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
  }

  .sidebar::-webkit-scrollbar { width: 0px; }

  .sidebar:hover {
    width: var(--sidebar-expanded);
    box-shadow: 10px 0 30px rgba(0,0,0,0.04);
  }

  .sidebar-logo {
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
    padding-left: 10px;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 800;
    color: var(--primary);
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  .sidebar:hover .logo-text { opacity: 1; }

  .nav-group-label {
    font-size: 10px;
    font-weight: 800;
    color: #94A3B8;
    margin: 20px 0 8px 12px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .sidebar:hover .nav-group-label { opacity: 1; }

  .nav-item {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 10px;
    color: var(--text-muted);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2px;
    white-space: nowrap;
    font-size: 14px;
  }

  .nav-item:hover,
  .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }

  .nav-text {
    margin-left: 14px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sidebar:hover .nav-text { opacity: 1; }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .header {
    height: 70px;
    background: #FFFFFF;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 36px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header h2 {
    font-size: 17px;
    font-weight: 800;
    color: var(--text-main);
  }

  .content-body {
    padding: 28px 36px 48px;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
  }

  .page-title-row {
    margin-bottom: 22px;
  }

  .page-title-row h1 {
    font-size: 27px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .page-title-row p {
    font-size: 13.5px;
    color: var(--text-muted);
    margin-top: 5px;
  }

  .settings-shell {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 22px;
    align-items: start;
  }

  .settings-tabs,
  .settings-panel {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: 22px;
    box-shadow: 0 8px 28px rgba(15,23,42,0.06);
  }

  .settings-tabs {
    padding: 18px;
    position: sticky;
    top: 92px;
  }

  .settings-tabs-head {
    padding: 6px 8px 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }

  .settings-kicker {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    color: var(--primary);
  }

  .settings-heading {
    margin-top: 8px;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .settings-desc {
    margin-top: 8px;
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .settings-tab-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settings-tab {
    width: 100%;
    border: none;
    background: transparent;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    position: relative;
    transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }

  .settings-tab:hover {
    background: #F8FAFC;
    transform: translateX(3px);
  }

  .settings-tab.active {
    background: linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%);
    box-shadow: 0 10px 28px rgba(79,70,229,0.13);
    transform: translateX(4px);
  }

  .settings-tab.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 4px;
    border-radius: 999px;
    background: var(--primary);
  }

  .settings-tab-icon {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 14px;
    background: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: transform 0.18s ease, background 0.18s ease;
  }

  .settings-tab:hover .settings-tab-icon {
    transform: scale(1.05);
    background: #EEF2FF;
  }

  .settings-tab.active .settings-tab-icon {
    background: #E0E7FF;
    transform: scale(1.06);
  }

  .settings-tab-main {
    min-width: 0;
    flex: 1;
  }

  .settings-tab-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }

  .settings-tab-title {
    font-size: 14px;
    font-weight: 900;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .settings-tab-desc {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    color: #64748B;
    line-height: 1.35;
  }

  .soon-badge {
    font-size: 10px;
    font-weight: 900;
    color: #64748B;
    background: #F1F5F9;
    border-radius: 999px;
    padding: 4px 7px;
  }

  .settings-panel {
    min-height: 560px;
    padding: 30px;
  }

  .settings-panel-head {
    display: flex;
    gap: 14px;
    align-items: center;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 26px;
  }

  .settings-panel-icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 16px;
    background: #EEF2FF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
  }

  .settings-panel-head h2 {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .settings-panel-head p {
    margin-top: 6px;
    color: #64748B;
    font-size: 14px;
  }

  .section-fade {
    animation: fadeSoft 0.22s ease;
  }

  @keyframes fadeSoft {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 980px) {
    .settings-shell { grid-template-columns: 1fr; }
    .settings-tabs { position: static; }
  }

  @media (max-width: 640px) {
    .content-body { padding: 20px 16px 36px; }
    .header { padding: 0 18px; }
    .settings-panel,
    .settings-tabs {
      border-radius: 18px;
      padding: 18px;
    }
  }
`

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/novels', label: 'Novels Content', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { path: '/admin/settings', label: 'Settings', icon: 'M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .33 1.65 1.65 0 0 0-.82 1.43V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.82-1.43 1.65 1.65 0 0 0-1-.33 1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.33-1 1.65 1.65 0 0 0-1.43-.82H2.75a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.43-.82A1.65 1.65 0 0 0 4.6 7a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.33A1.65 1.65 0 0 0 10.82 2.84V2.75a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 .82 1.43 1.65 1.65 0 0 0 1 .33 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c0 .35.11.69.33 1 .21.31.52.53.88.62h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.43.82c-.22.31-.33.65-.33 1z' },
    { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
}

const settingsTabs = [
  { key: 'password', title: 'Change Password', subtitle: 'Update your admin login password', icon: '🔐', available: true },
  { key: '2fa', title: 'Two-Factor Authentication', subtitle: 'Email or app verification code', icon: '🛡️', available: false },
  { key: 'passkey', title: 'Passkey', subtitle: 'Device passkey or biometrics', icon: '🔑', available: false },
  { key: 'devices', title: 'Login Devices', subtitle: 'Signed-in browsers and devices', icon: '💻', available: false },
  { key: 'history', title: 'Login History', subtitle: 'Recent sign-ins and IP records', icon: '📍', available: false },
  { key: 'alerts', title: 'Security Alerts', subtitle: 'Failed login and risk alerts', icon: '🚨', available: false },
]

const Icon = ({ d, size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const renderGroup = (items) => items.map((item) => (
    <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
      <Icon d={item.icon} size={20} />
      <span className="nav-text">{item.label}</span>
    </div>
  ))

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="#4F46E5" />
        <span className="logo-text">Shadow Exclusive</span>
      </div>

      <span className="nav-group-label">Overview</span>
      {renderGroup(navItems.overview)}

      <span className="nav-group-label">Visual Media</span>
      {renderGroup(navItems.visualMedia)}

      <span className="nav-group-label">System Admin</span>
      {renderGroup(navItems.systemAdmin)}

      <span className="nav-group-label">Finance & Growth</span>
      {renderGroup(navItems.finance)}
    </aside>
  )
}

export default function AdminSettingsPage() {
  const [activeKey, setActiveKey] = useState('password')
  const activeTab = settingsTabs.find((tab) => tab.key === activeKey) || settingsTabs[0]

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard-wrapper">
        <Sidebar />

        <div className="main-content">
          <header className="header">
            <h2>Admin Settings</h2>
          </header>

          <main className="content-body">
            <div className="page-title-row">
              <h1>Settings</h1>
              <p>Manage admin account security, login protection, and access tools.</p>
            </div>

            <div className="settings-shell">
              <section className="settings-tabs">
                <div className="settings-tabs-head">
                  <p className="settings-kicker">ADMIN SETTINGS</p>
                  <h2 className="settings-heading">Security</h2>
                  <p className="settings-desc">Choose a security section to manage.</p>
                </div>

                <div className="settings-tab-list">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`settings-tab ${activeKey === tab.key ? 'active' : ''}`}
                      onClick={() => setActiveKey(tab.key)}
                    >
                      <span className="settings-tab-icon">{tab.icon}</span>

                      <span className="settings-tab-main">
                        <span className="settings-tab-title-row">
                          <span className="settings-tab-title">{tab.title}</span>
                          {!tab.available ? <span className="soon-badge">Soon</span> : null}
                        </span>

                        <span className="settings-tab-desc">{tab.subtitle}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="settings-panel">
                <div className="settings-panel-head">
                  <div className="settings-panel-icon">{activeTab.icon}</div>

                  <div>
                    <h2>{activeTab.title}</h2>
                    <p>{activeTab.subtitle}</p>
                  </div>
                </div>

                <div className="section-fade">
                  {activeKey === 'password' ? (
                    <ChangePasswordSection />
                  ) : (
                    <ComingSoonSection />
                  )}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
