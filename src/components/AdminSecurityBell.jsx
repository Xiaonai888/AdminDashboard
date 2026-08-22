import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .admin-notification-root { position: relative; }

  .admin-notification-button {
    position: relative;
    width: 38px;
    height: 38px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background .16s, border-color .16s, transform .16s;
  }

  .admin-notification-button:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
    transform: translateY(-1px);
  }

  .admin-notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: #EF4444;
    color: #FFFFFF;
    border: 2px solid #FFFFFF;
    font-size: 10px;
    font-weight: 950;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .admin-notification-backdrop {
    position: fixed;
    inset: 0;
    z-index: 590;
    border: 0;
    background: rgba(15, 23, 42, .34);
    backdrop-filter: blur(3px);
    animation: adminNotificationFade .18s ease;
  }

  .admin-notification-panel {
    position: fixed;
    top: 78px;
    right: 28px;
    z-index: 600;
    width: min(640px, calc(100vw - 40px));
    max-height: calc(100vh - 104px);
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 30px;
    box-shadow: 0 30px 90px rgba(15, 23, 42, .30);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: adminNotificationSlide .2s ease;
  }

  .admin-notification-handle {
    width: 58px;
    height: 6px;
    border-radius: 999px;
    background: #CBD5E1;
    margin: 12px auto 4px;
    flex-shrink: 0;
  }

  .admin-notification-head {
    padding: 18px 24px 16px;
    background: #FFFFFF;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-shrink: 0;
  }

  .admin-notification-title-wrap { min-width: 0; }

  .admin-notification-title {
    margin: 0;
    color: #111827;
    font-size: 25px;
    font-weight: 950;
    letter-spacing: -0.045em;
  }

  .admin-notification-subtitle {
    margin-top: 5px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.45;
  }

  .admin-notification-head-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
  }

  .admin-notification-check,
  .admin-notification-close {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 999px;
    background: #F8FAFC;
    color: #94A3B8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 950;
    transition: background .16s, color .16s;
  }

  .admin-notification-check:hover { background: #EEF2FF; color: #4F46E5; }
  .admin-notification-close:hover { background: #FEF2F2; color: #DC2626; }

  .admin-notification-tabs {
    padding: 13px 22px 14px;
    background: #FFFFFF;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    border-bottom: 1px solid #E2E8F0;
    flex-shrink: 0;
  }

  .admin-notification-tabs::-webkit-scrollbar { height: 0; }

  .admin-notification-tab {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #475569;
    border-radius: 999px;
    min-height: 34px;
    padding: 0 17px;
    font-size: 12px;
    font-weight: 950;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(15, 23, 42, .03);
  }

  .admin-notification-tab.active {
    background: #111827;
    border-color: #111827;
    color: #FFFFFF;
    box-shadow: 0 12px 24px rgba(17, 24, 39, .18);
  }

  .admin-notification-list {
    padding: 18px 22px 20px;
    overflow-y: auto;
    display: grid;
    gap: 14px;
    flex: 1;
    min-height: 260px;
  }

  .admin-notification-list::-webkit-scrollbar { width: 10px; }
  .admin-notification-list::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 999px;
    border: 3px solid #F8FAFC;
  }

  .admin-notification-date {
    margin: 2px 0;
    color: #111827;
    font-size: 13px;
    font-weight: 950;
    letter-spacing: .03em;
    text-transform: uppercase;
  }

  .admin-notification-card {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 24px;
    padding: 16px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, .07);
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 14px;
    transition: border-color .16s, box-shadow .16s, transform .16s;
  }

  .admin-notification-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 16px 34px rgba(15, 23, 42, .10);
    transform: translateY(-1px);
  }

  .admin-notification-card.unread {
    border-color: #FCA5A5;
    background: linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 100%);
  }

  .admin-notification-icon {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    background: #FEF3C7;
    color: #D97706;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    box-shadow: inset 0 0 0 1px rgba(245, 158, 11, .13);
  }

  .admin-notification-content { min-width: 0; }

  .admin-notification-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .admin-notification-item-title {
    color: #111827;
    font-size: 14px;
    font-weight: 950;
    line-height: 1.35;
    word-break: break-word;
  }

  .admin-notification-time {
    color: #94A3B8;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
    padding-top: 2px;
  }

  .admin-notification-message {
    margin-top: 6px;
    color: #64748B;
    font-size: 12.5px;
    font-weight: 750;
    line-height: 1.55;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .admin-notification-meta {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
  }

  .admin-notification-pill {
    border-radius: 999px;
    background: #F1F5F9;
    color: #64748B;
    font-size: 10.5px;
    font-weight: 950;
    padding: 5px 9px;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-notification-pill.critical { background: #7F1D1D; color: #FFFFFF; }
  .admin-notification-pill.high { background: #FEF2F2; color: #B91C1C; }
  .admin-notification-pill.medium { background: #FFF7ED; color: #C2410C; }
  .admin-notification-pill.low { background: #ECFDF5; color: #047857; }

  .admin-notification-actions {
    margin-top: 12px;
    display: flex;
    gap: 9px;
    flex-wrap: wrap;
  }

  .admin-notification-action {
    border: none;
    background: #EEF2FF;
    color: #4F46E5;
    border-radius: 12px;
    min-height: 32px;
    padding: 0 13px;
    font-size: 11.5px;
    font-weight: 950;
    cursor: pointer;
  }

  .admin-notification-action.dark { background: #111827; color: #FFFFFF; }

  .admin-notification-empty {
    background: #FFFFFF;
    border: 1px dashed #CBD5E1;
    border-radius: 24px;
    padding: 40px 20px;
    text-align: center;
    color: #64748B;
    font-size: 13px;
    font-weight: 850;
    line-height: 1.6;
  }

  .admin-notification-footer {
    padding: 0 22px 20px;
    background: #F8FAFC;
    flex-shrink: 0;
  }

  .admin-notification-footer-button {
    width: 100%;
    border: none;
    min-height: 46px;
    background: #111827;
    color: #FFFFFF;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
    box-shadow: 0 16px 28px rgba(17, 24, 39, .18);
  }

  @keyframes adminNotificationFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes adminNotificationSlide {
    from { opacity: 0; transform: translateY(12px) scale(.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 720px) {
    .admin-notification-panel {
      top: auto;
      right: 0;
      bottom: 0;
      width: 100vw;
      max-width: 100vw;
      max-height: 86vh;
      border-radius: 30px 30px 0 0;
      border-left: 0;
      border-right: 0;
      border-bottom: 0;
    }

    .admin-notification-head { padding: 16px 16px 14px; }
    .admin-notification-title { font-size: 21px; }
    .admin-notification-subtitle { display: none; }
    .admin-notification-tabs { padding: 12px 16px; }
    .admin-notification-list { padding: 16px; }

    .admin-notification-card {
      grid-template-columns: 46px minmax(0, 1fr);
      gap: 12px;
      padding: 14px;
      border-radius: 22px;
    }

    .admin-notification-icon {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      font-size: 18px;
    }

    .admin-notification-footer { padding: 0 16px 16px; }
  }
`

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'actions', label: 'Actions' },
  { key: 'system', label: 'System' },
]

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const diff = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.floor(diff / 60000))

  if (minutes < 1) return 'Now'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  return date.toLocaleDateString()
}

function formatDateHeader(value) {
  if (!value) return 'Recent'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Recent'

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

function BellIcon({ color = '#64748B' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function normalizeAlert(alert) {
  return {
    id: alert.id,
    type: 'alert',
    icon: '🚨',
    title: alert.title || 'Security Alert',
    message: alert.message || 'Admin security risk detected.',
    severity: alert.severity || 'medium',
    country: alert.country_name || alert.country_code || 'Unknown country',
    ip: alert.ip_address || 'No IP',
    isRead: Boolean(alert.is_read),
    time: alert.created_at,
  }
}

export default function AdminSecurityBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items]
  )

  const filteredItems = useMemo(() => {
    if (activeTab === 'unread') return items.filter((item) => !item.isRead)
    if (activeTab === 'alerts') return items.filter((item) => item.type === 'alert')
    if (activeTab === 'all') return items
    return []
  }, [activeTab, items])

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((groups, item) => {
      const key = formatDateHeader(item.time)

      if (!groups[key]) groups[key] = []
      groups[key].push(item)

      return groups
    }, {})
  }, [filteredItems])

  const loadNotifications = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setItems([])
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/api/admin/device-access/security-alerts?limit=30`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load admin notifications')
      }

      const alertItems = Array.isArray(data.alerts) ? data.alerts.map(normalizeAlert) : []
      setItems(alertItems)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()

    const timer = window.setInterval(() => {
  if (!document.hidden) loadNotifications()
}, 300000)

    return () => window.clearInterval(timer)
  }, [loadNotifications])

  async function markRead(item) {
    const token = getToken()

    if (!token || !item?.id || item.type !== 'alert') return

    try {
      await fetch(`${API_URL}/api/admin/device-access/security-alerts/${item.id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setItems((current) => current.map((record) => (
        record.id === item.id ? { ...record, isRead: true } : record
      )))
    } catch {
    }
  }

  async function markAllRead() {
    const token = getToken()

    if (!token) return

    try {
      await fetch(`${API_URL}/api/admin/device-access/security-alerts/read-all`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setItems((current) => current.map((item) => ({ ...item, isRead: true })))
    } catch {
    }
  }

  function viewDetails() {
    setOpen(false)
    navigate('/admin/settings?tab=alerts')
  }

  return (
    <>
      <style>{styles}</style>

      <div className="admin-notification-root">
        <button
          type="button"
          className="admin-notification-button"
          onClick={() => setOpen((value) => !value)}
          title="Admin Notifications"
        >
          <BellIcon color={unreadCount ? '#EF4444' : '#64748B'} />
          {unreadCount ? <span className="admin-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
        </button>

        {open ? (
          <>
            <button
              type="button"
              aria-label="Close notifications"
              className="admin-notification-backdrop"
              onClick={() => setOpen(false)}
            />

            <div className="admin-notification-panel">
              <div className="admin-notification-handle" />

              <div className="admin-notification-head">
                <div className="admin-notification-title-wrap">
                  <h3 className="admin-notification-title">Shadow Notification</h3>
                  <div className="admin-notification-subtitle">
                    Admin security alerts, device activity, and system warnings.
                  </div>
                </div>

                <div className="admin-notification-head-actions">
                  <button type="button" className="admin-notification-check" onClick={markAllRead} title="Mark all read">
                    <CheckIcon />
                  </button>

                  <button type="button" className="admin-notification-close" onClick={() => setOpen(false)} title="Close">
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="admin-notification-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`admin-notification-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="admin-notification-list">
                {filteredItems.length ? (
                  Object.entries(groupedItems).map(([dateLabel, group]) => (
                    <React.Fragment key={dateLabel}>
                      <div className="admin-notification-date">{dateLabel}</div>

                      {group.map((item) => (
                        <div key={`${item.type}-${item.id}`} className={`admin-notification-card ${item.isRead ? '' : 'unread'}`}>
                          <div className="admin-notification-icon">{item.icon}</div>

                          <div className="admin-notification-content">
                            <div className="admin-notification-row">
                              <div className="admin-notification-item-title">{item.title}</div>
                              <div className="admin-notification-time">{formatTime(item.time)}</div>
                            </div>

                            <div className="admin-notification-message">{item.message}</div>

                            <div className="admin-notification-meta">
                              <span className={`admin-notification-pill ${item.severity}`}>{item.severity}</span>
                              <span className="admin-notification-pill">Security</span>
                              <span className="admin-notification-pill">{item.country}</span>
                              <span className="admin-notification-pill">{item.ip}</span>
                            </div>

                            <div className="admin-notification-actions">
                              {!item.isRead ? (
                                <button type="button" className="admin-notification-action" onClick={() => markRead(item)}>
                                  Mark read
                                </button>
                              ) : null}
                              <button type="button" className="admin-notification-action dark" onClick={viewDetails}>
                                View details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="admin-notification-empty">
                    {loading ? 'Loading notifications...' : activeTab === 'actions' ? 'Actions notifications will be added later.' : activeTab === 'system' ? 'System notifications will be added later.' : 'No notifications yet.'}
                  </div>
                )}
              </div>

              <div className="admin-notification-footer">
                <button type="button" className="admin-notification-footer-button" onClick={viewDetails}>
                  View all security alerts
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}
