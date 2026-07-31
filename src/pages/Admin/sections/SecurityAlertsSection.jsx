import React, { useCallback, useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const sectionStyles = `
  .security-alerts-wrap { display: flex; flex-direction: column; gap: 18px; }
  .security-alerts-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .security-alerts-summary { flex: 1; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
  .security-alerts-stat { border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 16px; padding: 15px; }
  .security-alerts-stat span { display: block; color: #64748B; font-size: 12px; font-weight: 800; }
  .security-alerts-stat strong { display: block; margin-top: 6px; color: #0F172A; font-size: 24px; font-weight: 900; line-height: 1.1; }
  .security-alerts-button-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .security-alerts-button { min-height: 42px; border: none; border-radius: 12px; padding: 0 15px; background: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 0 12px 24px rgba(15,23,42,0.14); transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease; }
  .security-alerts-button:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(15,23,42,0.18); }
  .security-alerts-button:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .security-alerts-button.light { background: #EEF2FF; color: #4F46E5; box-shadow: none; }
  .security-alerts-filters { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
  .security-alerts-filter { min-height: 36px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #475569; border-radius: 999px; padding: 0 13px; font-size: 12px; font-weight: 900; cursor: pointer; transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease; }
  .security-alerts-filter.active { background: #EEF2FF; border-color: #C7D2FE; color: #4F46E5; }
  .security-alerts-message { border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 800; line-height: 1.5; }
  .security-alerts-message.error { background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C; }
  .security-alerts-message.success { background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; }
  .security-alerts-list { display: flex; flex-direction: column; gap: 12px; }
  .security-alert-card { border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 18px; padding: 16px; box-shadow: 0 8px 24px rgba(15,23,42,0.05); }
  .security-alert-card.unread { border-color: #FCA5A5; background: linear-gradient(135deg, #FFFFFF 0%, #FFF7F7 100%); }
  .security-alert-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  .security-alert-title { margin: 0; color: #0F172A; font-size: 15px; font-weight: 900; line-height: 1.35; }
  .security-alert-subtitle { margin: 5px 0 0; color: #64748B; font-size: 12px; font-weight: 800; line-height: 1.45; }
  .security-alert-badges { display: flex; align-items: center; justify-content: flex-end; gap: 7px; flex-wrap: wrap; }
  .security-alert-badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 5px 9px; background: #F1F5F9; color: #475569; font-size: 11px; font-weight: 900; white-space: nowrap; }
  .security-alert-badge.critical { background: #7F1D1D; color: #FFFFFF; }
  .security-alert-badge.high { background: #FEF2F2; color: #B91C1C; }
  .security-alert-badge.medium { background: #FFF7ED; color: #C2410C; }
  .security-alert-badge.low { background: #ECFDF5; color: #047857; }
  .security-alert-badge.unread { background: #EEF2FF; color: #4F46E5; }
  .security-alert-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px 14px; margin: 13px 0; }
  .security-alert-row { display: grid; grid-template-columns: 105px minmax(0, 1fr); gap: 10px; color: #0F172A; font-size: 12px; line-height: 1.45; }
  .security-alert-row span { color: #64748B; font-weight: 900; }
  .security-alert-row strong { color: #0F172A; font-weight: 800; word-break: break-word; }
  .security-alert-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
  .security-alert-details-button { border: none; background: #EEF2FF; color: #4F46E5; border-radius: 10px; padding: 9px 11px; font-size: 12px; font-weight: 900; cursor: pointer; }
  .security-alert-details { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; margin-top: 13px; padding: 14px; display: grid; gap: 10px; }
  .security-alert-detail-row { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 10px; color: #0F172A; font-size: 12px; line-height: 1.5; }
  .security-alert-detail-row span { color: #64748B; font-weight: 900; }
  .security-alert-detail-row strong, .security-alert-detail-row pre { margin: 0; color: #0F172A; font-weight: 800; white-space: pre-wrap; word-break: break-word; font-family: inherit; }
  .security-alerts-empty { border: 1px dashed #CBD5E1; border-radius: 18px; padding: 26px; text-align: center; color: #64748B; font-size: 13px; font-weight: 800; }
  @media (max-width: 980px) {
    .security-alerts-wrap,
    .security-alerts-top,
    .security-alerts-summary,
    .security-alerts-list,
    .security-alert-card,
    .security-alert-head,
    .security-alert-head > div,
    .security-alert-grid,
    .security-alert-row,
    .security-alert-details,
    .security-alert-detail-row {
      min-width: 0;
      max-width: 100%;
    }

    .security-alerts-top {
      align-items: stretch;
      flex-direction: column;
    }

    .security-alerts-summary {
      width: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .security-alerts-button-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .security-alerts-button,
    .security-alert-details-button {
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    .security-alerts-filters {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      padding-bottom: 4px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .security-alerts-filters::-webkit-scrollbar {
      display: none;
    }

    .security-alerts-filter {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .security-alert-grid {
      grid-template-columns: 1fr;
    }

    .security-alert-title,
    .security-alert-subtitle,
    .security-alert-row strong,
    .security-alert-detail-row strong,
    .security-alert-detail-row pre,
    .security-alerts-message,
    .security-alerts-empty,
    .security-alerts-stat span,
    .security-alerts-stat strong {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  }

  @media (max-width: 560px) {
    .security-alerts-wrap {
      gap: 14px;
    }

    .security-alerts-summary {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .security-alerts-stat,
    .security-alert-card {
      border-radius: 16px;
      padding: 14px;
    }

    .security-alerts-stat strong {
      font-size: 21px;
    }

    .security-alerts-button-row,
    .security-alert-actions {
      display: grid;
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    .security-alerts-button,
    .security-alert-details-button {
      width: 100%;
      min-height: 44px;
      height: auto;
      padding: 10px 12px;
      line-height: 1.3;
    }

    .security-alert-head {
      flex-direction: column;
    }

    .security-alert-badges {
      justify-content: flex-start;
    }

    .security-alert-row,
    .security-alert-detail-row {
      grid-template-columns: 1fr;
      gap: 3px;
    }

    .security-alert-details {
      padding: 12px;
    }
  }
`

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function formatType(value) {
  return String(value || 'security_alert')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function shortId(value) {
  const text = String(value || '')
  if (!text) return '—'
  if (text.length <= 12) return text
  return `${text.slice(0, 8)}...${text.slice(-4)}`
}

function safeMetadata(value) {
  if (!value) return {}
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

async function securityRequest(path, options = {}) {
  const token = getToken()

  if (!token) {
    throw new Error('Admin token missing. Please login again.')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Security alerts request failed')
  }

  return data
}

function filterAlerts(alerts, activeFilter) {
  if (activeFilter === 'all') return alerts
  if (activeFilter === 'unread') return alerts.filter((alert) => !alert.is_read)
  return alerts.filter((alert) => alert.severity === activeFilter)
}

export default function SecurityAlertsSection() {
  const [alerts, setAlerts] = useState([])
  const [summary, setSummary] = useState({ total: 0, unread: 0, critical: 0, high: 0, medium: 0, low: 0 })
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedId, setExpandedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const data = await securityRequest('/api/admin/device-access/security-alerts?limit=100')
      setSummary(data.summary || { total: 0, unread: 0, critical: 0, high: 0, medium: 0, low: 0 })
      setAlerts(Array.isArray(data.alerts) ? data.alerts : [])
    } catch (err) {
      setError(err.message || 'Failed to load security alerts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const filteredAlerts = useMemo(
    () => filterAlerts(alerts, activeFilter),
    [alerts, activeFilter]
  )

  async function markRead(alertId) {
    setActionLoading(alertId)
    setError('')
    setMessage('')

    try {
      await securityRequest(`/api/admin/device-access/security-alerts/${alertId}/read`, { method: 'PATCH' })
      setMessage('Security alert marked as read')
      await loadAlerts()
    } catch (err) {
      setError(err.message || 'Failed to mark alert as read')
    } finally {
      setActionLoading('')
    }
  }

  async function markAllRead() {
    const ok = window.confirm('Mark all security alerts as read?')

    if (!ok) return

    setActionLoading('read-all')
    setError('')
    setMessage('')

    try {
      const data = await securityRequest('/api/admin/device-access/security-alerts/read-all', { method: 'PATCH' })
      setMessage(`Marked ${data.updated_count || 0} alert(s) as read`)
      await loadAlerts()
    } catch (err) {
      setError(err.message || 'Failed to mark all alerts as read')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <>
      <style>{sectionStyles}</style>

      <div className="security-alerts-wrap">
        <div className="security-alerts-top">
          <div className="security-alerts-summary">
            <div className="security-alerts-stat"><span>Total Alerts</span><strong>{summary.total || 0}</strong></div>
            <div className="security-alerts-stat"><span>Unread</span><strong>{summary.unread || 0}</strong></div>
            <div className="security-alerts-stat"><span>Critical</span><strong>{summary.critical || 0}</strong></div>
            <div className="security-alerts-stat"><span>High</span><strong>{summary.high || 0}</strong></div>
            <div className="security-alerts-stat"><span>Medium / Low</span><strong>{(summary.medium || 0) + (summary.low || 0)}</strong></div>
          </div>

          <div className="security-alerts-button-row">
            <button type="button" className="security-alerts-button light" onClick={loadAlerts} disabled={loading || Boolean(actionLoading)}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button type="button" className="security-alerts-button" onClick={markAllRead} disabled={loading || Boolean(actionLoading) || !summary.unread}>
              {actionLoading === 'read-all' ? 'Saving...' : 'Mark all read'}
            </button>
          </div>
        </div>

        <div className="security-alerts-filters">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`security-alerts-filter ${activeFilter === filter.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error ? <div className="security-alerts-message error">{error}</div> : null}
        {message ? <div className="security-alerts-message success">{message}</div> : null}

        {loading ? (
          <div className="security-alerts-empty">Loading security alerts...</div>
        ) : filteredAlerts.length ? (
          <div className="security-alerts-list">
            {filteredAlerts.map((alert) => {
              const metadata = safeMetadata(alert.metadata)
              const isExpanded = expandedId === alert.id
              const country = alert.country_name || alert.country_code || '—'

              return (
                <article key={alert.id} className={`security-alert-card ${alert.is_read ? '' : 'unread'}`}>
                  <div className="security-alert-head">
                    <div>
                      <h3 className="security-alert-title">{alert.title || formatType(alert.alert_type)}</h3>
                      <p className="security-alert-subtitle">{alert.message || 'Admin security alert detected.'}</p>
                    </div>

                    <div className="security-alert-badges">
                      {!alert.is_read ? <span className="security-alert-badge unread">Unread</span> : null}
                      <span className={`security-alert-badge ${alert.severity || 'medium'}`}>{alert.severity || 'medium'}</span>
                    </div>
                  </div>

                  <div className="security-alert-grid">
                    <div className="security-alert-row"><span>Time</span><strong>{formatDate(alert.created_at)}</strong></div>
                    <div className="security-alert-row"><span>Type</span><strong>{formatType(alert.alert_type)}</strong></div>
                    <div className="security-alert-row"><span>Country</span><strong>{country}</strong></div>
                    <div className="security-alert-row"><span>IP Address</span><strong>{alert.ip_address || '—'}</strong></div>
                    <div className="security-alert-row"><span>Device</span><strong>{shortId(alert.device_id)}</strong></div>
                    <div className="security-alert-row"><span>Session</span><strong>{shortId(alert.session_id)}</strong></div>
                  </div>

                  <div className="security-alert-actions">
                    <button type="button" className="security-alert-details-button" onClick={() => setExpandedId(isExpanded ? '' : alert.id)}>
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>

                    {!alert.is_read ? (
                      <button type="button" className="security-alerts-button light" onClick={() => markRead(alert.id)} disabled={Boolean(actionLoading)}>
                        {actionLoading === alert.id ? 'Saving...' : 'Mark read'}
                      </button>
                    ) : null}
                  </div>

                  {isExpanded ? (
                    <div className="security-alert-details">
                      <div className="security-alert-detail-row"><span>Alert ID</span><strong>{alert.id || '—'}</strong></div>
                      <div className="security-alert-detail-row"><span>User Agent</span><strong>{alert.user_agent || '—'}</strong></div>
                      <div className="security-alert-detail-row"><span>Admin Email</span><strong>{alert.admin_email || '—'}</strong></div>
                      <div className="security-alert-detail-row"><span>Read At</span><strong>{formatDate(alert.read_at)}</strong></div>
                      <div className="security-alert-detail-row"><span>Metadata</span><pre>{Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '—'}</pre></div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="security-alerts-empty">No security alerts found for this filter.</div>
        )}
      </div>
    </>
  )
}
