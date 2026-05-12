import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const menuItems = [
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
    <label style={styles.label}>
      {label}
      <div style={styles.passwordWrap}>
        <input
          style={styles.inputWithIcon}
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        <button
          type="button"
          style={styles.eyeButton}
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
    <form onSubmit={handleSubmit} style={styles.passwordForm}>
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

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {message ? <div style={styles.successBox}>{message}</div> : null}

      <button type="submit" style={styles.primaryButton} disabled={loading}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  )
}

export default function AdminSettingsPage() {
  const navigate = useNavigate()
  const [activeKey, setActiveKey] = useState('password')

  const activeItem = menuItems.find((item) => item.key === activeKey) || menuItems[0]

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <button type="button" style={styles.backButton} onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </button>

        <div style={styles.layout}>
          <aside style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <p style={styles.kicker}>ADMIN SETTINGS</p>
              <h1 style={styles.sidebarTitle}>Settings</h1>
              <p style={styles.sidebarText}>Security, login, and admin protection.</p>
            </div>

            <nav style={styles.nav}>
              {menuItems.map((item) => {
                const active = item.key === activeKey

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveKey(item.key)}
                    style={{
                      ...styles.navItem,
                      ...(active ? styles.navItemActive : {}),
                    }}
                  >
                    {active ? <span style={styles.activeLine} /> : null}

                    <span
                      style={{
                        ...styles.navIcon,
                        ...(active ? styles.navIconActive : {}),
                      }}
                    >
                      {item.icon}
                    </span>

                    <span style={styles.navTextWrap}>
                      <span style={styles.navTitleRow}>
                        <span style={styles.navTitle}>{item.title}</span>
                        {!item.available ? <span style={styles.soonBadge}>Soon</span> : null}
                      </span>
                      <span style={styles.navSubtitle}>{item.subtitle}</span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </aside>

          <main style={styles.content}>
            <div style={styles.contentHeader}>
              <div style={styles.contentIcon}>{activeItem.icon}</div>
              <div>
                <h2 style={styles.contentTitle}>{activeItem.title}</h2>
                <p style={styles.contentSubtitle}>{activeItem.subtitle}</p>
              </div>
            </div>

            <div key={activeKey} style={styles.contentBody}>
              {activeKey === 'password' ? (
                <ChangePasswordPanel />
              ) : (
                <div style={styles.comingSoonPanel}>
                  <div style={styles.comingSoonIcon}>🛠️</div>
                  <h3 style={styles.comingSoonTitle}>Coming Soon</h3>
                  <p style={styles.comingSoonText}>
                    This security feature is prepared in the settings menu, but it is not active yet.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
    padding: 24,
    fontFamily: 'Inter, sans-serif',
    color: '#0F172A',
  },
  shell: {
    width: 'min(1180px, 100%)',
    margin: '0 auto',
  },
  backButton: {
    border: 'none',
    background: '#FFFFFF',
    color: '#4F46E5',
    minHeight: 38,
    padding: '0 15px',
    borderRadius: 12,
    fontWeight: 800,
    cursor: 'pointer',
    marginBottom: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    boxShadow: '0 8px 24px rgba(79, 70, 229, 0.10)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '330px 1fr',
    gap: 20,
    alignItems: 'stretch',
  },
  sidebar: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #E2E8F0',
    borderRadius: 24,
    padding: 18,
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
    position: 'sticky',
    top: 20,
    alignSelf: 'start',
  },
  sidebarHeader: {
    padding: '8px 8px 16px',
    borderBottom: '1px solid #E2E8F0',
    marginBottom: 12,
  },
  kicker: {
    margin: 0,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.13em',
    color: '#4F46E5',
  },
  sidebarTitle: {
    margin: '8px 0 0',
    fontSize: 28,
    fontWeight: 950,
    letterSpacing: '-0.04em',
  },
  sidebarText: {
    margin: '8px 0 0',
    color: '#64748B',
    fontSize: 13,
    lineHeight: 1.5,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  navItem: {
    width: '100%',
    position: 'relative',
    border: 'none',
    background: 'transparent',
    borderRadius: 16,
    padding: '12px 12px 12px 14px',
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#334155',
    transition: 'background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease, color 0.18s ease',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)',
    color: '#0F172A',
    boxShadow: '0 10px 28px rgba(79, 70, 229, 0.14)',
    transform: 'translateX(4px)',
  },
  activeLine: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 999,
    background: '#4F46E5',
  },
  navIcon: {
    width: 42,
    height: 42,
    minWidth: 42,
    borderRadius: 14,
    background: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    transition: 'transform 0.18s ease, background 0.18s ease',
  },
  navIconActive: {
    background: '#E0E7FF',
    transform: 'scale(1.06)',
  },
  navTextWrap: {
    minWidth: 0,
    flex: 1,
  },
  navTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navSubtitle: {
    display: 'block',
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 1.35,
  },
  soonBadge: {
    fontSize: 10,
    fontWeight: 900,
    color: '#64748B',
    background: '#F1F5F9',
    borderRadius: 999,
    padding: '4px 7px',
  },
  content: {
    minHeight: 560,
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #E2E8F0',
    borderRadius: 24,
    padding: 30,
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 22,
    borderBottom: '1px solid #E2E8F0',
  },
  contentIcon: {
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: 16,
    background: '#EEF2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 23,
  },
  contentTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 950,
    letterSpacing: '-0.04em',
  },
  contentSubtitle: {
    margin: '6px 0 0',
    color: '#64748B',
    fontSize: 14,
  },
  contentBody: {
    paddingTop: 26,
    animation: 'fadeIn 0.25s ease',
  },
  passwordForm: {
    maxWidth: 520,
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    fontSize: 13,
    fontWeight: 800,
    color: '#0F172A',
    width: '100%',
  },
  passwordWrap: {
    position: 'relative',
    width: '100%',
  },
  inputWithIcon: {
    boxSizing: 'border-box',
    width: '100%',
    height: 46,
    border: '1.5px solid #CBD5E1',
    borderRadius: 12,
    padding: '0 50px 0 14px',
    fontSize: 14,
    outline: 'none',
    color: '#0F172A',
    background: '#FFFFFF',
    lineHeight: '46px',
    display: 'block',
  },
  eyeButton: {
    position: 'absolute',
    right: 9,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 34,
    height: 34,
    border: 'none',
    borderRadius: 10,
    background: '#F1F5F9',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    border: 'none',
    borderRadius: 12,
    background: '#0F172A',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 900,
    cursor: 'pointer',
    marginTop: 4,
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.18)',
  },
  errorBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  successBox: {
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#047857',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  comingSoonPanel: {
    border: '1px dashed #CBD5E1',
    borderRadius: 20,
    padding: 34,
    textAlign: 'center',
    background: '#F8FAFC',
  },
  comingSoonIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  comingSoonTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 950,
  },
  comingSoonText: {
    margin: '8px auto 0',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 420,
  },
}
