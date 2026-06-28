import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .admin-notification-root { position: relative; }
  .admin-notification-button { position: relative; width: 34px; height: 34px; border: none; background: transparent; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .admin-notification-button:hover { background: #F1F5F9; }
  .admin-notification-badge { position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: #EF4444; color: #FFFFFF; border: 2px solid #FFFFFF; font-size: 9px; font-weight: 900; display: flex; align-items: center; justify-content: center; line-height: 1; }
  .admin-notification-panel { position: absolute; top: calc(100% + 10px); right: -12px; width: 390px; max-width: calc(100vw - 22px); max-height: 620px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 24px; box-shadow: 0 22px 56px rgba(15, 23, 42, 0.18); overflow: hidden; z-index: 600; animation: adminNotificationIn 0.18s ease; }
  .admin-notification-head { padding: 22px 20px 14px; background: #FFFFFF; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .admin-notification-title { margin: 0; color: #111827; font-size: 20px; font-weight: 900; letter-spacing: -0.03em; }
  .admin-notification-check { width: 40px; height: 40px; border: none; border-radius: 999px; background: #F8FAFC; color: #94A3B8; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: 900; }
  .admin-notification-check:hover { background: #EEF2FF; color: #4F46E5; }
  .admin-notification-tabs { padding: 10px 16px 12px; background: #FFFFFF; display: flex; gap: 9px; overflow-x: auto; border-bottom: 1px solid #E2E8F0; }
  .admin-notification-tab { border: 1px solid #E2E8F0; background: #FFFFFF; color: #475569; border-radius: 999px; min-height: 30px; padding: 0 14px; font-size: 11px; font-weight: 900; cursor: pointer; white-space: nowrap; }
  .admin-notification-tab.active { background: #111827; border-color: #111827; color: #FFFFFF; }
  .admin-notification-list { padding: 12px 14px 16px; max-height: 440px; overflow-y: auto; display: grid; gap: 12px; }
  .admin-notification-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 20px; padding: 14px; box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06); display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 12px; }
  .admin-notification-card.unread { border-color: #FCA5A5; background: linear-gradient(135deg, #FFFFFF 0%, #FFF7F7 100%); }
  .admin-notification-icon { width: 44px; height: 44px; border-radius: 999px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 19px; }
  .admin-notification-content { min-width: 0; }
  .admin-notification-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .admin-notification-item-title { color: #111827; font-size: 13px; font-weight: 900; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; }
  .admin-notification-time { color: #94A3B8; font-size: 11px; font-weight: 900; white-space: nowrap; }
  .admin-notification-message { margin-top: 5px; color: #64748B; font-size: 12px; font-weight: 700; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .admin-notification-meta { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .admin-notification-pill { border-radius: 999px; background: #F1F5F9; color: #64748B; font-size: 10px; font-weight: 900; padding: 4px 8px; }
  .admin-notification-pill.critical { background: #7F1D1D; color: #FFFFFF; }
  .admin-notification-pill.high { background: #FEF2F2; color: #B91C1C; }
  .admin-notification-pill.medium { background: #FFF7ED; color: #C2410C; }
  .admin-notification-pill.low { background: #ECFDF5; color: #047857; }
  .admin-notification-actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
  .admin-notification-action { border: none; background: #EEF2FF; color: #4F46E5; border-radius: 10px; min-height: 28px; padding: 0 10px; font-size: 11px; font-weight: 900; cursor: pointer; }
  .admin-notification-action.dark { background: #111827; color: #FFFFFF; }
  .admin-notification-empty { background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 20px; padding: 28px 18px; text-align: center; color: #64748B; font-size: 12px; font-weight: 800; line-height: 1.55; }
  .admin-notification-footer { padding: 0 14px 14px; background: #F8FAFC; }
  .admin-notification-footer-button { width: 100%; border: none; min-height: 42px; background: #111827; color: #FFFFFF; border-radius: 14px; font-size: 12px; font-weight: 900; cursor: pointer; }
  @keyframes adminNotificationIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
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

    const timer = window.setInterval(loadNotifications, 60000)

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
          <div className="admin-notification-panel">
            <div className="admin-notification-head">
              <h3 className="admin-notification-title">Shadow Notification</h3>
              <button type="button" className="admin-notification-check" onClick={markAllRead} title="Mark all read">
                <CheckIcon />
              </button>
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
                filteredItems.map((item) => (
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
        ) : null}
      </div>
    </>
  )
}
