import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const TARGET_OPTIONS = [
  { key: 'all', label: 'All readers', note: 'Send to every reader account.' },
  { key: 'single', label: 'Single reader', note: 'Send to one reader by email or username.' },
  { key: 'selected', label: 'Selected readers', note: 'Send to multiple readers only.' },
]

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

function targetLabel(value) {
  if (value === 'single') return 'Single reader'
  if (value === 'selected') return 'Selected readers'
  return 'All readers'
}

const styles = `
  .notification-admin-page {
    max-width: 1480px;
    margin: 0 auto;
  }

  .notification-admin-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
  }

  .notification-admin-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 11px;
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .notification-admin-title {
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
    color: #0F172A;
  }

  .notification-admin-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    max-width: 720px;
  }

  .notification-admin-refresh {
    height: 42px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 16px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .notification-admin-refresh:hover {
    background: #F8FAFC;
  }

  .notification-admin-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .notification-admin-stat {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 18px 20px;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
  }

  .notification-admin-stat-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  .notification-admin-stat-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .notification-admin-grid {
    display: grid;
    grid-template-columns: minmax(340px, 460px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .notification-admin-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .notification-admin-card-head {
    padding: 20px 22px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .notification-admin-card-title {
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0;
    color: #0F172A;
  }

  .notification-admin-card-note {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  .notification-admin-form {
    padding: 20px 22px 22px;
  }

  .notification-admin-target-grid {
    display: grid;
    gap: 9px;
    margin-bottom: 16px;
  }

  .notification-admin-target-button {
    width: 100%;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #475569;
    border-radius: 16px;
    padding: 12px 13px;
    text-align: left;
    font-family: inherit;
    cursor: pointer;
  }

  .notification-admin-target-button.active {
    border-color: #4F46E5;
    background: linear-gradient(135deg, #EEF2FF, #FFFFFF);
    color: #0F172A;
    box-shadow: 0 10px 22px rgba(79, 70, 229, .09);
  }

  .notification-admin-target-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    font-weight: 900;
  }

  .notification-admin-target-note {
    margin-top: 4px;
    color: #64748B;
    font-size: 11.5px;
    font-weight: 650;
    line-height: 1.45;
  }

  .notification-admin-target-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #CBD5E1;
  }

  .notification-admin-target-button.active .notification-admin-target-dot {
    background: #4F46E5;
  }

  .notification-admin-field {
    display: block;
    margin-bottom: 15px;
  }

  .notification-admin-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 7px;
    color: #334155;
    font-size: 12px;
    font-weight: 900;
  }

  .notification-admin-limit {
    color: #94A3B8;
    font-size: 11px;
    font-weight: 800;
  }

  .notification-admin-input,
  .notification-admin-textarea {
    width: 100%;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #0F172A;
    border-radius: 14px;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    transition: border-color .15s, box-shadow .15s;
  }

  .notification-admin-input {
    height: 44px;
    padding: 0 12px;
  }

  .notification-admin-textarea {
    min-height: 138px;
    padding: 12px;
    resize: vertical;
    line-height: 1.6;
  }

  .notification-admin-recipient-box {
    min-height: 92px;
  }

  .notification-admin-input:focus,
  .notification-admin-textarea:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
  }

  .notification-admin-help {
    margin-top: -7px;
    margin-bottom: 14px;
    color: #64748B;
    font-size: 11.5px;
    font-weight: 650;
    line-height: 1.5;
  }

  .notification-admin-preview {
    margin-top: 6px;
    border: 1px dashed #CBD5E1;
    background: #F8FAFC;
    border-radius: 18px;
    padding: 13px;
  }

  .notification-admin-preview-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 9px;
  }

  .notification-admin-preview-card {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 16px;
    padding: 12px;
  }

  .notification-admin-preview-title {
    color: #0F172A;
    font-size: 13px;
    font-weight: 900;
  }

  .notification-admin-preview-message {
    margin-top: 5px;
    color: #475569;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
  }

  .notification-admin-message {
    margin-top: 14px;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.5;
  }

  .notification-admin-message.success {
    background: #D1FAE5;
    color: #047857;
  }

  .notification-admin-message.error {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .notification-admin-not-found {
    margin-top: 8px;
    color: #B45309;
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1.45;
  }

  .notification-admin-submit {
    width: 100%;
    height: 46px;
    margin-top: 16px;
    border: 0;
    border-radius: 999px;
    background: #111827;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 16px 28px rgba(17, 24, 39, .18);
  }

  .notification-admin-submit:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .notification-admin-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 20px 20px;
  }

  .notification-admin-item {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 18px;
    padding: 16px;
    transition: .15s;
  }

  .notification-admin-item:hover {
    border-color: #CBD5E1;
    box-shadow: 0 10px 22px rgba(15, 23, 42, .05);
  }

  .notification-admin-item-top {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  .notification-admin-item-title {
    margin: 0;
    font-size: 15px;
    font-weight: 900;
    color: #0F172A;
  }

  .notification-admin-item-message {
    margin: 7px 0 0;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 600;
  }

  .notification-admin-link {
    display: inline-flex;
    margin-top: 10px;
    max-width: 100%;
    color: #4F46E5;
    background: #EEF2FF;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 900;
    word-break: break-all;
  }

  .notification-admin-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 11px;
  }

  .notification-admin-target-badge,
  .notification-admin-unread {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 9px;
    font-size: 11px;
    font-weight: 900;
  }

  .notification-admin-target-badge {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .notification-admin-unread {
    background: #FEF3C7;
    color: #92400E;
  }

  .notification-admin-meta {
    margin-top: 13px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 800;
  }

  .notification-admin-empty {
    padding: 52px 24px;
    text-align: center;
    color: #64748B;
    font-weight: 800;
  }

  .notification-admin-empty-icon {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    margin: 0 auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EEF2FF;
    color: #4F46E5;
  }

  @media (max-width: 980px) {
    .notification-admin-grid,
    .notification-admin-stats {
      grid-template-columns: 1fr;
    }
  }
`

export default function AdminNotificationsPage() {
  const [targetType, setTargetType] = useState('all')
  const [recipient, setRecipient] = useState('')
  const [recipients, setRecipients] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [totalReaders, setTotalReaders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState([])

  const selectedCount = useMemo(() => {
    return String(recipients || '')
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean).length
  }, [recipients])

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
      setTotalReaders(Number(data.total_readers || 0))
    } catch (err) {
      setAnnouncements([])
      setTotalReaders(0)
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

    if (targetType === 'single' && !recipient.trim()) {
      setError('Reader email or username is required')
      return
    }

    if (targetType === 'selected' && selectedCount < 1) {
      setError('Add at least one reader email or username')
      return
    }

    try {
      setSending(true)
      setNotice('')
      setError('')
      setNotFound([])

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/admin/notifications/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          target_type: targetType,
          recipient,
          recipients,
          title,
          message,
          link,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        setNotFound(data.not_found || [])
        throw new Error(data.message || 'Failed to send announcement')
      }

      setTitle('')
      setMessage('')
      setLink('')
      setRecipient('')
      setRecipients('')
      setNotFound(data.announcement?.not_found || [])
      setNotice(data.message || `Announcement sent to ${data.announcement?.recipient_count || 0} readers`)
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
    <AdminLayout title="Notifications" subtitle="Create announcements for readers">
      <style>{styles}</style>

      <div className="notification-admin-page">
        <div className="notification-admin-head">
          <div>
            <div className="notification-admin-kicker">
              Reader Announcements
            </div>
            <h1 className="notification-admin-title">Notification Center</h1>
            <p className="notification-admin-subtitle">
              Send official reader notifications to everyone, one reader, or selected readers only. Author Dashboard notifications stay separate.
            </p>
          </div>

          <button type="button" onClick={loadAnnouncements} disabled={loading} className="notification-admin-refresh">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="notification-admin-stats">
          <div className="notification-admin-stat">
            <div className="notification-admin-stat-label">Announcements</div>
            <div className="notification-admin-stat-value">{stats.total}</div>
          </div>
          <div className="notification-admin-stat">
            <div className="notification-admin-stat-label">Total Recipients</div>
            <div className="notification-admin-stat-value">{stats.recipients}</div>
          </div>
          <div className="notification-admin-stat">
            <div className="notification-admin-stat-label">Unread</div>
            <div className="notification-admin-stat-value">{stats.unread}</div>
          </div>
        </div>

        <div className="notification-admin-grid">
          <section className="notification-admin-card">
            <div className="notification-admin-card-head">
              <div>
                <h2 className="notification-admin-card-title">New Announcement</h2>
                <p className="notification-admin-card-note">Choose who receives this notification.</p>
              </div>
            </div>

            <div className="notification-admin-form">
              <form onSubmit={handleSubmit}>
                <div className="notification-admin-field">
                  <span className="notification-admin-label">Send to</span>
                  <div className="notification-admin-target-grid">
                    {TARGET_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setTargetType(option.key)
                          setError('')
                          setNotice('')
                          setNotFound([])
                        }}
                        className={`notification-admin-target-button ${targetType === option.key ? 'active' : ''}`}
                      >
                        <span className="notification-admin-target-title">
                          {option.label}
                          <span className="notification-admin-target-dot" />
                        </span>
                        <span className="notification-admin-target-note">{option.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {targetType === 'single' ? (
                  <label className="notification-admin-field">
                    <span className="notification-admin-label">Reader email or username</span>
                    <input
                      value={recipient}
                      onChange={(event) => setRecipient(event.target.value)}
                      placeholder="reader@gmail.com or username"
                      className="notification-admin-input"
                    />
                  </label>
                ) : null}

                {targetType === 'selected' ? (
                  <label className="notification-admin-field">
                    <span className="notification-admin-label">
                      Reader emails or usernames
                      <span className="notification-admin-limit">{selectedCount} selected</span>
                    </span>
                    <textarea
                      value={recipients}
                      onChange={(event) => setRecipients(event.target.value)}
                      placeholder={'reader1@gmail.com\nreader_two\nreader3@gmail.com'}
                      className="notification-admin-textarea notification-admin-recipient-box"
                    />
                  </label>
                ) : null}

                {targetType === 'all' ? (
                  <div className="notification-admin-help">
                    This will send to all current reader accounts. Current reader count: {totalReaders}
                  </div>
                ) : null}

                <label className="notification-admin-field">
                  <span className="notification-admin-label">
                    Title
                    <span className="notification-admin-limit">{title.length}/80</span>
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={80}
                    placeholder="Example: Maintenance notice"
                    className="notification-admin-input"
                  />
                </label>

                <label className="notification-admin-field">
                  <span className="notification-admin-label">
                    Message
                    <span className="notification-admin-limit">{message.length}/240</span>
                  </span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={240}
                    rows={5}
                    placeholder="Write a short announcement..."
                    className="notification-admin-textarea"
                  />
                </label>

                <label className="notification-admin-field">
                  <span className="notification-admin-label">Link optional</span>
                  <input
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    placeholder="/notifications"
                    className="notification-admin-input"
                  />
                </label>

                <div className="notification-admin-preview">
                  <div className="notification-admin-preview-label">Preview in reader notification</div>
                  <div className="notification-admin-preview-card">
                    <div className="notification-admin-preview-title">{title.trim() || 'Announcement title'}</div>
                    <div className="notification-admin-preview-message">{message.trim() || 'Announcement message will appear here.'}</div>
                  </div>
                </div>

                {notice ? <div className="notification-admin-message success">{notice}</div> : null}
                {error ? <div className="notification-admin-message error">{error}</div> : null}
                {notFound.length ? (
                  <div className="notification-admin-not-found">
                    Not found: {notFound.slice(0, 8).join(', ')}{notFound.length > 8 ? ` +${notFound.length - 8} more` : ''}
                  </div>
                ) : null}

                <button type="submit" disabled={sending} className="notification-admin-submit">
                  {sending ? 'Sending...' : 'Send Announcement'}
                </button>
              </form>
            </div>
          </section>

          <section className="notification-admin-card">
            <div className="notification-admin-card-head">
              <div>
                <h2 className="notification-admin-card-title">Recent Announcements</h2>
                <p className="notification-admin-card-note">{announcements.length} records from reader notifications</p>
              </div>
            </div>

            {loading ? (
              <div className="notification-admin-empty">
                <div className="notification-admin-empty-icon">
                  <i className="fas fa-spinner" />
                </div>
                Loading announcements...
              </div>
            ) : announcements.length ? (
              <div className="notification-admin-list">
                {announcements.map((item) => (
                  <article key={item.reference_id} className="notification-admin-item">
                    <div className="notification-admin-item-top">
                      <div style={{ minWidth: 0 }}>
                        <h3 className="notification-admin-item-title">{item.title}</h3>
                        <p className="notification-admin-item-message">{item.message}</p>
                        {item.link ? <span className="notification-admin-link">{item.link}</span> : null}
                        <div className="notification-admin-badges">
                          <span className="notification-admin-target-badge">{item.target_label || targetLabel(item.target_type)}</span>
                          <span className="notification-admin-unread">{item.unread_count} unread</span>
                        </div>
                      </div>
                    </div>

                    <div className="notification-admin-meta">
                      <span>{formatDate(item.created_at)}</span>
                      <span>{item.recipient_count} readers · {item.reference_id}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="notification-admin-empty">
                <div className="notification-admin-empty-icon">
                  <i className="far fa-bell" />
                </div>
                No announcements yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
