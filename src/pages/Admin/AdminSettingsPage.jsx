import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const globalStyles = `
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

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: var(--bg-main);
    color: var(--text-main);
  }

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

  .sidebar::-webkit-scrollbar {
    width: 0px;
  }

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

  .sidebar:hover .logo-text {
    opacity: 1;
  }

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

  .sidebar:hover .nav-group-label {
    opacity: 1;
  }

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

  .sidebar:hover .nav-text {
    opacity: 1;
  }

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
    margin: 0;
  }

  .content-body {
    padding: 28px 36px 48px;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
  }

  .settings-shell {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 22px;
    align-items: start;
  }

  .settings-side-panel,
  .settings-content-panel {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: 22px;
    box-shadow: 0 8px 28px rgba(15,23,42,0.06);
  }

  .settings-side-panel {
    padding: 18px;
    position: sticky;
    top: 96px;
  }

  .settings-title-block {
    padding: 6px 8px 16px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }

  .settings-kicker {
    margin: 0;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    color: var(--primary);
  }

  .settings-title {
    margin: 8px 0 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .settings-subtitle {
    margin: 8px 0 0;
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

  .settings-content-panel {
    min-height: 560px;
    padding: 30px;
  }

  .content-head {
    display: flex;
    gap: 14px;
    align-items: center;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 26px;
  }

  .content-head-icon {
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

  .content-head h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .content-head p {
    margin: 6px 0 0;
    color: #64748B;
    font-size: 14px;
  }

  .password-form {
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    animation: fadeSoft 0.22s ease;
  }

  @keyframes fadeSoft {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .field-label {
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-size: 13px;
    font-weight: 800;
    color: #0F172A;
    width: 100%;
  }

  .password-wrap {
    position: relative;
    width: 100%;
  }

  .password-input {
    box-sizing: border-box;
    width: 100%;
    height: 46px;
    border: 1.5px solid #CBD5E1;
    border-radius: 12px;
    padding: 0 50px 0 14px;
    font-size: 14px;
    outline: none;
    color: #0F172A;
    background: #FFFFFF;
    line-height: 46px;
    display: block;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .password-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79,70,229,0.10);
  }

  .eye-button {
    position: absolute;
    right: 9px;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 10px;
    background: #F1F5F9;
    color: #475569;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .primary-button {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 12px;
    background: #0F172A;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    margin-top: 4px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.18);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .primary-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(15,23,42,0.22);
  }

  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .logout-other-button {
    width: 100%;
    height: 44px;
    border: 1px solid #CBD5E1;
    border-radius: 12px;
    background: #F8FAFC;
    color: #475569;
    font-size: 13px;
    font-weight: 900;
    cursor: not-allowed;
    opacity: 0.75;
  }

  .message-box {
    border-radius: 12px;
    padding: 12px;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 700;
  }

  .message-box.error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #B91C1C;
  }

  .message-box.success {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: #047857;
  }

  .coming-soon-panel {
    border: 1px dashed #CBD5E1;
    border-radius: 20px;
    padding: 34px;
    text-align: center;
    background: #F8FAFC;
    animation: fadeSoft 0.22s ease;
  }

  .coming-soon-icon {
    font-size: 34px;
    margin-bottom: 10px;
  }

  .coming-soon-panel h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
  }

  .coming-soon-panel p {
    margin: 8px auto 0;
    color: #64748B;
    font-size: 14px;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 980px) {
    .settings-shell {
      grid-template-columns: 1fr;
    }

    .settings-side-panel {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .content-body {
      padding: 20px 16px 36px;
    }

    .header {
      padding: 0 18px;
    }

    .settings-content-panel,
    .settings-side-panel {
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
  {
    key: 'password',
    title: 'Change Password',
    subtitle: 'Update your admin login password',
    icon: '🔐',
    available: true,
  },
  {
    key: '2fa',
    title: 'Two-Factor Authentication',
    subtitle: 'Email or app verification code',
    icon: '🛡️',
    available: false,
  },
  {
    key: 'passkey',
    title: 'Passkey',
    subtitle: 'Device passkey or biometrics',
    icon: '🔑',
    available: false,
  },
  {
    key: 'devices',
    title: 'Login Devices',
    subtitle: 'Signed-in browsers and devices',
    icon: '💻',
    available: false,
  },
  {
    key: 'history',
    title: 'Login History',
    subtitle: 'Recent sign-ins and IP records',
    icon: '📍',
    available: false,
  },
  {
    key: 'alerts',
    title: 'Security Alerts',
    subtitle: 'Failed login and risk alerts',
    icon: '🚨',
    available: false,
  },
]

const Icon = ({ d, size = 20, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color || 'currentColor'}
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ minWidth: `${size}px`, flexShrink: 0 }}
  >
    <path d={d} />
  </svg>
)

function EyeIcon({ hidden = false }) {
  if (hidden) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.7 10.7A2 2 0 0 0 13.3 13.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.88C17 4.88 20.73 8.11 22 12C21.5 13.53 20.55 14.92 19.31 16.03" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.61 6.61C4.44 7.76 2.79 9.66 2 12C3.27 15.89 7 19.12 12 19.12C13.48 19.12 14.84 18.84 16.04 18.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12C3.27 8.11 7 4.88 12 4.88C17 4.88 20.73 8.11 22 12C20.73 15.89 17 19.12 12 19.12C7 19.12 3.27 15.89 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const renderGroup = (items) =>
    items.map((item) => (
      <div
        key={item.path}
        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        onClick={() => navigate(item.path)}
      >
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

function PasswordField({
  label,
  name,
  value,
  visible,
  placeholder,
  autoComplete,
  onChange,
  onToggle,
}) {
  return (
    <label className="field-label">
      {label}
      <div className="password-wrap">
        <input
          className="password-input"
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        <button
          type="button"
          className="eye-button"
          onClick={() => onToggle(name)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
    </label>
  )
}

function ChangePasswordPanel() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setMessage('')
    setError('')
  }

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const token = sessionStorage.getItem('shadow_admin_token')

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to change password')
      }

      setMessage(data.message || 'Admin password changed successfully')

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <PasswordField
        label="Current Password"
        name="currentPassword"
        value={form.currentPassword}
        visible={showPassword.currentPassword}
        placeholder="Enter current password"
        autoComplete="current-password"
        onChange={handleChange}
        onToggle={togglePassword}
      />

      <PasswordField
        label="New Password"
        name="newPassword"
        value={form.newPassword}
        visible={showPassword.newPassword}
        placeholder="Enter new password"
        autoComplete="new-password"
        onChange={handleChange}
        onToggle={togglePassword}
      />

      <PasswordField
        label="Confirm New Password"
        name="confirmPassword"
        value={form.confirmPassword}
        visible={showPassword.confirmPassword}
        placeholder="Confirm new password"
        autoComplete="new-password"
        onChange={handleChange}
        onToggle={togglePassword}
      />

      {error ? <div className="message-box error">{error}</div> : null}
      {message ? <div className="message-box success">{message}</div> : null}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>

      <button type="button" className="logout-other-button" disabled>
        Logout Other Devices
      </button>
    </form>
  )
}

export default function AdminSettingsPage() {
  const [activeKey, setActiveKey] = useState('password')
  const activeTab = settingsTabs.find((tab) => tab.key === activeKey) || settingsTabs[0]

  return (
    <>
      <style>{globalStyles}</style>

      <div className="dashboard-wrapper">
        <Sidebar />

        <div className="main-content">
          <header className="header">
            <h2>Admin Settings</h2>
          </header>

          <main className="content-body">
            <div className="settings-shell">
              <section className="settings-side-panel">
                <div className="settings-title-block">
                  <p className="settings-kicker">ADMIN SETTINGS</p>
                  <h1 className="settings-title">Settings</h1>
                  <p className="settings-subtitle">
                    Security, login, and admin protection.
                  </p>
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

              <section className="settings-content-panel">
                <div className="content-head">
                  <div className="content-head-icon">{activeTab.icon}</div>

                  <div>
                    <h1>{activeTab.title}</h1>
                    <p>{activeTab.subtitle}</p>
                  </div>
                </div>

                {activeKey === 'password' ? (
                  <ChangePasswordPanel />
                ) : (
                  <div className="coming-soon-panel">
                    <div className="coming-soon-icon">🛠️</div>
                    <h3>Coming Soon</h3>
                    <p>
                      This security feature is prepared in the settings menu, but it is not active yet.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
