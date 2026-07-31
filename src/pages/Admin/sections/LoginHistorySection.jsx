import React, { useCallback, useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const sectionStyles = `
  .login-history-wrap {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .login-history-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
  }

  .login-history-summary {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .login-history-stat {
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    border-radius: 16px;
    padding: 15px;
  }

  .login-history-stat span {
    display: block;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .login-history-stat strong {
    display: block;
    margin-top: 6px;
    color: #0F172A;
    font-size: 22px;
    font-weight: 900;
    line-height: 1.2;
    word-break: break-word;
  }

  .login-history-button {
    min-height: 42px;
    border: none;
    border-radius: 12px;
    padding: 0 15px;
    background: #0F172A;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(15,23,42,0.14);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }

  .login-history-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 30px rgba(15,23,42,0.18);
  }

  .login-history-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .login-history-filters {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }

  .login-history-filter {
    min-height: 36px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #475569;
    border-radius: 999px;
    padding: 0 13px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }

  .login-history-filter.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4F46E5;
  }

  .login-history-message {
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.5;
  }

  .login-history-message.error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #B91C1C;
  }

  .login-history-card {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(15,23,42,0.05);
  }

  .login-history-table {
    width: 100%;
    border-collapse: collapse;
  }

  .login-history-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
    white-space: nowrap;
  }

  .login-history-table td {
    padding: 13px 12px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 12px;
    font-weight: 800;
    vertical-align: top;
  }

  .login-history-table tr:last-child td {
    border-bottom: none;
  }

  .login-history-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .login-history-event {
    color: #0F172A;
    font-size: 13px;
    font-weight: 900;
  }

  .login-history-reason {
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.45;
  }

  .login-history-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 5px 9px;
    background: #F1F5F9;
    color: #475569;
    font-size: 11px;
    font-weight: 900;
    white-space: nowrap;
  }

  .login-history-badge.success {
    background: #ECFDF5;
    color: #047857;
  }

  .login-history-badge.blocked,
  .login-history-badge.failed {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .login-history-badge.revoked,
  .login-history-badge.logged_out {
    background: #FFF7ED;
    color: #C2410C;
  }

  .login-history-device {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #0F172A;
  }

  .login-history-device span {
    color: #64748B;
    font-size: 11px;
    font-weight: 800;
  }

  .login-history-details-button {
    border: none;
    background: #EEF2FF;
    color: #4F46E5;
    border-radius: 10px;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .login-history-details {
    background: #F8FAFC;
    border-top: 1px solid #E2E8F0;
    padding: 14px;
    display: grid;
    gap: 10px;
  }

  .login-history-detail-row {
    display: grid;
    grid-template-columns: 130px minmax(0, 1fr);
    gap: 10px;
    color: #0F172A;
    font-size: 12px;
    line-height: 1.5;
  }

  .login-history-detail-row span {
    color: #64748B;
    font-weight: 900;
  }

  .login-history-detail-row strong,
  .login-history-detail-row pre {
    margin: 0;
    color: #0F172A;
    font-weight: 800;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: inherit;
  }

  .login-history-empty {
    border: 1px dashed #CBD5E1;
    border-radius: 18px;
    padding: 26px;
    text-align: center;
    color: #64748B;
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 980px) {
    .login-history-wrap,
    .login-history-top,
    .login-history-summary,
    .login-history-card,
    .login-history-details,
    .login-history-detail-row {
      min-width: 0;
      max-width: 100%;
    }

    .login-history-top {
      align-items: stretch;
      flex-direction: column;
    }

    .login-history-summary {
      width: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .login-history-button {
      width: 100%;
      min-width: 0;
      min-height: 44px;
      box-sizing: border-box;
    }

    .login-history-filters {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      padding-bottom: 4px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .login-history-filters::-webkit-scrollbar {
      display: none;
    }

    .login-history-filter {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .login-history-card {
      overflow-x: auto;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
    }

    .login-history-table {
      min-width: 850px;
    }

    .login-history-message,
    .login-history-empty,
    .login-history-stat span,
    .login-history-stat strong,
    .login-history-event,
    .login-history-reason,
    .login-history-detail-row strong,
    .login-history-detail-row pre {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  }

  @media (max-width: 560px) {
    .login-history-wrap {
      gap: 14px;
    }

    .login-history-summary {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .login-history-stat {
      border-radius: 16px;
      padding: 14px;
    }

    .login-history-stat strong {
      font-size: 20px;
    }

    .login-history-detail-row {
      grid-template-columns: 1fr;
      gap: 3px;
    }

    .login-history-details-button {
      min-height: 38px;
      padding: 8px 12px;
    }
  }
`

const filters = [
  { key: 'all', label: 'All' },
  { key: 'success', label: 'Success' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'revoked', label: 'Revoked' },
  { key: 'logout', label: 'Logout' },
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

function formatEventName(value) {
  return String(value || 'device_event')
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

function browserFromUserAgent(userAgent) {
  const ua = String(userAgent || '')

  if (/Edg\//i.test(ua)) return 'Microsoft Edge'
  if (/Chrome\//i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua)) return 'Safari'
  return 'Unknown Browser'
}

function osFromUserAgent(userAgent) {
  const ua = String(userAgent || '')

  if (/Windows/i.test(ua)) return 'Windows'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iOS/i.test(ua)) return 'iOS'
  if (/Mac OS|Macintosh/i.test(ua)) return 'macOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown OS'
}

function resultClass(value) {
  return String(value || 'unknown').toLowerCase().replace(/\s+/g, '_')
}

function matchesFilter(event, activeFilter) {
  const eventType = String(event.event_type || '').toLowerCase()
  const result = String(event.result || '').toLowerCase()

  if (activeFilter === 'all') return true
  if (activeFilter === 'success') return result === 'success' || eventType.includes('success')
  if (activeFilter === 'blocked') return result === 'blocked' || eventType.includes('blocked') || eventType.includes('failed')
  if (activeFilter === 'revoked') return result === 'revoked' || eventType.includes('revoked')
  if (activeFilter === 'logout') return result === 'logged_out' || eventType.includes('logout')

  return true
}

async function loadLoginEvents() {
  const token = getToken()

  if (!token) {
    throw new Error('Admin token missing. Please login again.')
  }

  const response = await fetch(`${API_URL}/api/admin/device-access/events?limit=100`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Failed to load login history')
  }

  return Array.isArray(data.events) ? data.events : []
}

export default function LoginHistorySection() {
  const [events, setEvents] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedId, setExpandedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const nextEvents = await loadLoginEvents()
      setEvents(nextEvents)
    } catch (err) {
      setError(err.message || 'Failed to load login history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const summary = useMemo(() => {
    const success = events.filter((event) => matchesFilter(event, 'success')).length
    const blocked = events.filter((event) => matchesFilter(event, 'blocked')).length
    const lastLogin = events.find((event) => matchesFilter(event, 'success'))

    return {
      total: events.length,
      success,
      blocked,
      lastLoginAt: lastLogin?.created_at || '',
    }
  }, [events])

  const filteredEvents = useMemo(
    () => events.filter((event) => matchesFilter(event, activeFilter)),
    [events, activeFilter]
  )

  return (
    <>
      <style>{sectionStyles}</style>

      <div className="login-history-wrap">
        <div className="login-history-top">
          <div className="login-history-summary">
            <div className="login-history-stat">
              <span>Total Events</span>
              <strong>{summary.total}</strong>
            </div>
            <div className="login-history-stat">
              <span>Successful Logins</span>
              <strong>{summary.success}</strong>
            </div>
            <div className="login-history-stat">
              <span>Blocked / Failed</span>
              <strong>{summary.blocked}</strong>
            </div>
            <div className="login-history-stat">
              <span>Last Login</span>
              <strong>{formatDate(summary.lastLoginAt)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="login-history-button"
            onClick={fetchEvents}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="login-history-filters">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`login-history-filter ${activeFilter === filter.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {error ? <div className="login-history-message error">{error}</div> : null}

        {loading ? (
          <div className="login-history-empty">Loading login history...</div>
        ) : filteredEvents.length ? (
          <div className="login-history-card">
            <table className="login-history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Result</th>
                  <th>IP Address</th>
                  <th>Browser / OS</th>
                  <th>Device</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const metadata = safeMetadata(event.metadata)
                  const browser = metadata.browser_name || browserFromUserAgent(event.user_agent)
                  const os = metadata.os_name || osFromUserAgent(event.user_agent)
                  const rowKey = event.id || `${event.created_at}-${event.event_type}`
                  const isExpanded = expandedId === rowKey

                  return (
                    <React.Fragment key={rowKey}>
                      <tr>
                        <td>{formatDate(event.created_at)}</td>
                        <td>
                          <div className="login-history-main">
                            <div className="login-history-event">{formatEventName(event.event_type)}</div>
                            <div className="login-history-reason">{event.reason || '—'}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`login-history-badge ${resultClass(event.result)}`}>
                            {event.result || 'unknown'}
                          </span>
                        </td>
                        <td>{event.ip_address || '—'}</td>
                        <td>
                          <div className="login-history-device">
                            <strong>{browser}</strong>
                            <span>{os}</span>
                          </div>
                        </td>
                        <td>
                          <div className="login-history-device">
                            <strong>{shortId(event.device_id)}</strong>
                            <span>{shortId(event.session_id)}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="login-history-details-button"
                            onClick={() => setExpandedId(isExpanded ? '' : rowKey)}
                          >
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr>
                          <td colSpan="7">
                            <div className="login-history-details">
                              <div className="login-history-detail-row">
                                <span>Device ID</span>
                                <strong>{event.device_id || '—'}</strong>
                              </div>
                              <div className="login-history-detail-row">
                                <span>Session ID</span>
                                <strong>{event.session_id || '—'}</strong>
                              </div>
                              <div className="login-history-detail-row">
                                <span>User Agent</span>
                                <strong>{event.user_agent || '—'}</strong>
                              </div>
                              <div className="login-history-detail-row">
                                <span>Metadata</span>
                                <pre>{Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '—'}</pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="login-history-empty">No login history found for this filter.</div>
        )}
      </div>
    </>
  )
}
