import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --bg: #F8FAFC;
    --card: #FFFFFF;
    --primary: #4F46E5;
    --primary-light: #EEF2FF;
    --text: #0F172A;
    --muted: #64748B;
    --soft: #94A3B8;
    --border: #E2E8F0;
    --success: #10B981;
    --success-light: #D1FAE5;
    --warning: #F59E0B;
    --warning-light: #FEF3C7;
    --danger: #EF4444;
    --danger-light: #FEE2E2;
    --side: 80px;
    --side-open: 260px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--bg);
    color: var(--text);
  }

  .dashboard-wrapper {
    min-height: 100vh;
    display: flex;
    background: var(--bg);
    overflow: hidden;
  }

  .sidebar {
    width: var(--side);
    height: 100vh;
    background: #fff;
    border-right: 1px solid var(--border);
    padding: 20px 14px;
    overflow-y: auto;
    overflow-x: hidden;
    transition: .25s;
    flex-shrink: 0;
    z-index: 1000;
    position: sticky;
    top: 0;
  }

  .sidebar::-webkit-scrollbar { width: 0; }

  .sidebar:hover {
    width: var(--side-open);
    box-shadow: 10px 0 30px rgba(15, 23, 42, .05);
  }

  .sidebar-logo {
    height: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
    padding-left: 10px;
  }

  .logo-badge {
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: #111827;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .logo-text {
    opacity: 0;
    white-space: nowrap;
    color: var(--primary);
    font-weight: 900;
    font-size: 18px;
    transition: opacity .2s;
  }

  .sidebar:hover .logo-text,
  .sidebar:hover .nav-text,
  .sidebar:hover .nav-group-label {
    opacity: 1;
  }

  .nav-group-label {
    opacity: 0;
    display: block;
    margin: 18px 0 8px 12px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--soft);
    white-space: nowrap;
    transition: opacity .2s;
  }

  .nav-item {
    height: 44px;
    display: flex;
    align-items: center;
    border-radius: 12px;
    padding: 0 12px;
    color: var(--muted);
    cursor: pointer;
    margin-bottom: 2px;
    font-weight: 700;
    white-space: nowrap;
    font-size: 14px;
    transition: .15s;
  }

  .nav-item:hover,
  .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }

  .nav-text {
    opacity: 0;
    margin-left: 14px;
    transition: opacity .2s;
  }

  .main-content {
    flex: 1;
    min-width: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .header {
    height: 70px;
    background: #fff;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 36px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header h2 {
    font-size: 17px;
    font-weight: 900;
  }

  .header-subtitle {
    margin-top: 3px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  .refresh-btn {
    height: 40px;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text);
    padding: 0 14px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .refresh-btn:hover { background: var(--bg); }

  .content-body {
    padding: 28px 36px 48px;
    max-width: 1480px;
    margin: 0 auto;
  }

  .page-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 11px;
    border-radius: 999px;
    background: var(--primary-light);
    color: var(--primary);
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .page-title {
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .page-subtitle {
    margin-top: 8px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    max-width: 720px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
  }

  .stat-label {
    color: var(--muted);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .stat-value {
    margin-top: 10px;
    color: var(--text);
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: minmax(340px, 430px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .card-head {
    padding: 20px 22px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .card-title {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .card-note {
    margin-top: 4px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  .form-body {
    padding: 20px 22px 22px;
  }

  .field {
    display: block;
    margin-bottom: 15px;
  }

  .label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 7px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .limit {
    color: var(--soft);
    font-size: 11px;
    font-weight: 800;
  }

  .input,
  .textarea {
    width: 100%;
    border: 1px solid var(--border);
    background: #fff;
    color: var(--text);
    border-radius: 14px;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    transition: border-color .15s, box-shadow .15s;
  }

  .input {
    height: 44px;
    padding: 0 12px;
  }

  .textarea {
    min-height: 138px;
    padding: 12px;
    resize: vertical;
    line-height: 1.6;
  }

  .input:focus,
  .textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .message {
    margin-top: 14px;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.5;
  }

  .message.success {
    background: var(--success-light);
    color: #047857;
  }

  .message.error {
    background: var(--danger-light);
    color: #B91C1C;
  }

  .submit-btn {
    width: 100%;
    height: 46px;
    margin-top: 16px;
    border: 0;
    border-radius: 999px;
    background: #111827;
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 16px 28px rgba(17, 24, 39, .18);
  }

  .submit-btn:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .announcement-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 20px 20px;
  }

  .announcement-card {
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 18px;
    padding: 16px;
    transition: .15s;
  }

  .announcement-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 10px 22px rgba(15, 23, 42, .05);
  }

  .announcement-top {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  .announcement-title {
    margin: 0;
    font-size: 15px;
    font-weight: 900;
    color: var(--text);
  }

  .announcement-message {
    margin: 7px 0 0;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 600;
  }

  .announcement-link {
    display: inline-flex;
    margin-top: 10px;
    max-width: 100%;
    color: var(--primary);
    background: var(--primary-light);
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 900;
    word-break: break-all;
  }

  .unread-pill {
    flex-shrink: 0;
    min-width: 72px;
    text-align: center;
    border-radius: 999px;
    background: var(--warning-light);
    color: #92400E;
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 900;
  }

  .announcement-meta {
    margin-top: 13px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: var(--soft);
    font-size: 11px;
    font-weight: 800;
  }

  .empty-state {
    padding: 52px 24px;
    text-align: center;
    color: var(--muted);
    font-weight: 800;
  }

  .empty-icon {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-light);
    color: var(--primary);
  }

  @media (max-width: 980px) {
    .layout-grid,
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .content-body {
      padding: 22px 16px 42px;
    }

    .header {
      padding: 0 16px;
    }
  }
`

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/shadow-mall', label: 'Shadow Mall', icon: 'M3 3h18v18H3z M7 7h10M7 11h10M7 15h6' },
    { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
    { path: '/authors', label: 'Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { path: '/stories', label: 'Stories', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
    { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { path: '/notifications', label: 'Notifications', icon: 'M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M13.73 21a2 2 0 01-3.46 0' },
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
}

const groupLabels = {
  overview: 'Overview',
  visualMedia: 'Visual Media',
  systemAdmin: 'System Admin',
  finance: 'Finance',
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      recipients: announcements.reduce((sum, item) => sum + Number(item.recipient_count || 0), 0),
      unread: announcements.reduce((sum, item) => sum + Number(item.unread_count || 0), 0),
    }
  }, [announcements])

  async function loadAnnouncements() {
    try {
      setLoading(true)
      setError('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/admin/notifications/announcements`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load announcements')
      }

      setAnnouncements(data.announcements || [])
    } catch (err) {
      setAnnouncements([])
      setError(err.message || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required')
      return
    }

    try {
      setSending(true)
      setNotice('')
      setError('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/admin/notifications/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          message,
          link,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to send announcement')
      }

      setTitle('')
      setMessage('')
      setLink('')
      setNotice(`Announcement sent to ${data.announcement?.recipient_count || 0} readers`)
      await loadAnnouncements()
    } catch (err) {
      setError(err.message || 'Failed to send announcement')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard-wrapper">
        <aside className="sidebar">
          <div className="sidebar-logo" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
            <div className="logo-badge">SH</div>
            <span className="logo-text">SHADOW</span>
          </div>

          {Object.entries(navItems).map(([group, items]) => (
            <div key={group}>
              <span className="nav-group-label">{groupLabels[group]}</span>
              {items.map((item) => {
                const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))

                return (
                  <div
                    key={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    title={item.label}
                  >
                    <Icon d={item.icon} size={20} />
                    <span className="nav-text">{item.label}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </aside>

        <main className="main-content">
          <header className="header">
            <div>
              <h2>Notifications</h2>
              <div className="header-subtitle">Create announcements for readers</div>
            </div>

            <button type="button" onClick={loadAnnouncements} disabled={loading} className="refresh-btn">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </header>

          <section className="content-body">
            <div className="page-head">
              <div>
                <div className="kicker">
                  <Icon d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" size={15} />
                  Reader Announcements
                </div>
                <h1 className="page-title">Notification Center</h1>
                <p className="page-subtitle">
                  Send official announcements to readers. These notifications appear inside the reader app under the Announcements tab only.
                </p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Announcements</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Recipients</div>
                <div className="stat-value">{stats.recipients}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Unread</div>
                <div className="stat-value">{stats.unread}</div>
              </div>
            </div>

            <div className="layout-grid">
              <section className="card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">New Announcement</h2>
                    <p className="card-note">Create one official reader notification.</p>
                  </div>
                </div>

                <div className="form-body">
                  <form onSubmit={handleSubmit}>
                    <label className="field">
                      <span className="label">
                        Title
                        <span className="limit">{title.length}/80</span>
                      </span>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={80}
                        placeholder="Example: Maintenance notice"
                        className="input"
                      />
                    </label>

                    <label className="field">
                      <span className="label">
                        Message
                        <span className="limit">{message.length}/240</span>
                      </span>
                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        maxLength={240}
                        rows={5}
                        placeholder="Write a short announcement..."
                        className="textarea"
                      />
                    </label>

                    <label className="field">
                      <span className="label">Link optional</span>
                      <input
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                        placeholder="/notifications"
                        className="input"
                      />
                    </label>

                    {notice ? <div className="message success">{notice}</div> : null}
                    {error ? <div className="message error">{error}</div> : null}

                    <button type="submit" disabled={sending} className="submit-btn">
                      {sending ? 'Sending...' : 'Send Announcement'}
                    </button>
                  </form>
                </div>
              </section>

              <section className="card">
                <div className="card-head">
                  <div>
                    <h2 className="card-title">Recent Announcements</h2>
                    <p className="card-note">{announcements.length} records from reader notifications</p>
                  </div>
                </div>

                {loading ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Icon d="M21 12a9 9 0 11-6.219-8.56" size={24} />
                    </div>
                    Loading announcements...
                  </div>
                ) : announcements.length ? (
                  <div className="announcement-list">
                    {announcements.map((item) => (
                      <article key={item.reference_id} className="announcement-card">
                        <div className="announcement-top">
                          <div style={{ minWidth: 0 }}>
                            <h3 className="announcement-title">{item.title}</h3>
                            <p className="announcement-message">{item.message}</p>
                            {item.link ? <span className="announcement-link">{item.link}</span> : null}
                          </div>
                          <span className="unread-pill">{item.unread_count} unread</span>
                        </div>

                        <div className="announcement-meta">
                          <span>{formatDate(item.created_at)}</span>
                          <span>{item.recipient_count} readers · {item.reference_id}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Icon d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" size={24} />
                    </div>
                    No announcements yet.
                  </div>
                )}
              </section>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
