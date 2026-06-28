import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .admin-security-bell { position: relative; }
  .admin-security-bell-btn { position: relative; cursor: pointer; padding: 6px; border-radius: 10px; border: none; background: transparent; display: flex; align-items: center; justify-content: center; }
  .admin-security-bell-btn:hover { background: #F1F5F9; }
  .admin-security-bell-dot { position: absolute; top: 4px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: #EF4444; color: #FFFFFF; border: 2px solid #FFFFFF; font-size: 9px; font-weight: 900; display: flex; align-items: center; justify-content: center; line-height: 1; }
  .admin-security-bell-panel { position: absolute; top: calc(100% + 10px); right: -8px; width: 360px; max-width: calc(100vw - 24px); background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; box-shadow: 0 18px 48px rgba(15,23,42,0.16); overflow: hidden; z-index: 500; animation: securityBellIn 0.16s ease; }
  .admin-security-bell-head { padding: 15px; background: linear-gradient(135deg, #FFF7F7 0%, #EEF2FF 100%); border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .admin-security-bell-head h3 { margin: 0; color: #0F172A; font-size: 14px; font-weight: 900; }
  .admin-security-bell-head span { color: #64748B; font-size: 11px; font-weight: 800; }
  .admin-security-bell-refresh { border: none; background: #FFFFFF; color: #4F46E5; border-radius: 10px; padding: 7px 10px; font-size: 11px; font-weight: 900; cursor: pointer; }
  .admin-security-bell-list { max-height: 340px; overflow-y: auto; }
  .admin-security-alert-item { padding: 13px 15px; border-bottom: 1px solid #F1F5F9; display: grid; gap: 7px; }
  .admin-security-alert-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .admin-security-alert-title { color: #0F172A; font-size: 12px; font-weight: 900; line-height: 1.35; }
  .admin-security-alert-text { color: #64748B; font-size: 11px; font-weight: 700; line-height: 1.45; }
  .admin-security-alert-meta { color: #475569; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .admin-security-severity { border-radius: 999px; padding: 4px 7px; font-size: 10px; font-weight: 900; white-space: nowrap; }
  .admin-security-severity.critical { background: #7F1D1D; color: #FFFFFF; }
  .admin-security-severity.high { background: #FEF2F2; color: #B91C1C; }
  .admin-security-severity.medium { background: #FFF7ED; color: #C2410C; }
  .admin-security-severity.low { background: #ECFDF5; color: #047857; }
  .admin-security-alert-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .admin-security-alert-action { border: none; background: #EEF2FF; color: #4F46E5; border-radius: 9px; padding: 7px 9px; font-size: 11px; font-weight: 900; cursor: pointer; }
  .admin-security-bell-empty { padding: 24px 15px; color: #64748B; text-align: center; font-size: 12px; font-weight: 800; }
  .admin-security-bell-footer { padding: 12px; background: #F8FAFC; border-top: 1px solid #E2E8F0; }
  .admin-security-bell-view-all { width: 100%; border: none; background: #0F172A; color: #FFFFFF; min-height: 38px; border-radius: 12px; font-size: 12px; font-weight: 900; cursor: pointer; }
  @keyframes securityBellIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.floor(diff / 60000))

  if (Number.isNaN(date.getTime())) return '—'
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleString()
}

function BellIcon({ color = '#64748B' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export default function AdminSecurityBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [summary, setSummary] = useState({ unread: 0, critical: 0, high: 0 })
  const [loading, setLoading] = useState(false)

  const dangerCount = useMemo(
    () => Number(summary.critical || 0) + Number(summary.high || 0),
    [summary]
  )

  const loadAlerts = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setAlerts([])
      setSummary({ unread: 0, critical: 0, high: 0 })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_URL}/api/admin/device-access/security-alerts?status=unread&limit=10`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load security alerts')
      }

      setAlerts(Array.isArray(data.alerts) ? data.alerts : [])
      setSummary(data.summary || { unread: 0, critical: 0, high: 0 })
    } catch {
      setAlerts([])
      setSummary({ unread: 0, critical: 0, high: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()

    const timer = window.setInterval(loadAlerts, 60000)

    return () => window.clearInterval(timer)
  }, [loadAlerts])

  async function markRead(alertId) {
    const token = getToken()

    if (!token || !alertId) return

    try {
      await fetch(`${API_URL}/api/admin/device-access/security-alerts/${alertId}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      await loadAlerts()
    } catch {
    }
  }

  function goToSecurityAlerts() {
    setOpen(false)
    navigate('/admin/settings?tab=alerts')
  }

  return (
    <>
      <style>{styles}</style>

      <div className="admin-security-bell">
        <button
          type="button"
          className="admin-security-bell-btn"
          onClick={() => setOpen((value) => !value)}
          title="Security Alerts"
        >
          <BellIcon color={dangerCount ? '#EF4444' : '#64748B'} />
          {summary.unread ? <span className="admin-security-bell-dot">{summary.unread > 9 ? '9+' : summary.unread}</span> : null}
        </button>

        {open ? (
          <div className="admin-security-bell-panel">
            <div className="admin-security-bell-head">
              <div>
                <h3>Security Alerts</h3>
                <span>{summary.unread || 0} unread · {dangerCount} critical/high</span>
              </div>
              <button type="button" className="admin-security-bell-refresh" onClick={loadAlerts}>
                {loading ? '...' : 'Refresh'}
              </button>
            </div>

            <div className="admin-security-bell-list">
              {alerts.length ? (
                alerts.map((alert) => (
                  <div key={alert.id} className="admin-security-alert-item">
                    <div className="admin-security-alert-top">
                      <div>
                        <div className="admin-security-alert-title">{alert.title || 'Security alert'}</div>
                        <div className="admin-security-alert-text">{alert.message || 'Admin security risk detected.'}</div>
                      </div>
                      <span className={`admin-security-severity ${alert.severity || 'medium'}`}>
                        {alert.severity || 'medium'}
                      </span>
                    </div>

                    <div className="admin-security-alert-meta">
                      <span>{formatTime(alert.created_at)}</span>
                      <span>•</span>
                      <span>{alert.country_name || alert.country_code || 'Unknown country'}</span>
                      <span>•</span>
                      <span>{alert.ip_address || 'No IP'}</span>
                    </div>

                    <div className="admin-security-alert-actions">
                      <button type="button" className="admin-security-alert-action" onClick={() => markRead(alert.id)}>
                        Mark read
                      </button>
                      <button type="button" className="admin-security-alert-action" onClick={goToSecurityAlerts}>
                        View details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-security-bell-empty">
                  {loading ? 'Loading security alerts...' : 'No unread security alerts.'}
                </div>
              )}
            </div>

            <div className="admin-security-bell-footer">
              <button type="button" className="admin-security-bell-view-all" onClick={goToSecurityAlerts}>
                View all security alerts
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
