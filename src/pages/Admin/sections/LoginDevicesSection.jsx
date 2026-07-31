import React, { useCallback, useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const sectionStyles = `
  .login-devices-wrap {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .login-devices-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .login-devices-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .login-devices-stat {
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    border-radius: 16px;
    padding: 15px;
  }

  .login-devices-stat span {
    display: block;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .login-devices-stat strong {
    display: block;
    margin-top: 6px;
    color: #0F172A;
    font-size: 24px;
    font-weight: 900;
  }

  .login-devices-button-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .login-devices-button {
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

  .login-devices-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 30px rgba(15,23,42,0.18);
  }

  .login-devices-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .login-devices-button.light {
    background: #EEF2FF;
    color: #4F46E5;
    box-shadow: none;
  }

  .login-devices-button.danger {
    background: #DC2626;
    box-shadow: 0 12px 24px rgba(220,38,38,0.16);
  }

  .login-devices-message {
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.5;
  }

  .login-devices-message.error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #B91C1C;
  }

  .login-devices-message.success {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: #047857;
  }

  .login-devices-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .login-device-card {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(15,23,42,0.05);
  }

  .login-device-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .login-device-name {
    margin: 0;
    color: #0F172A;
    font-size: 16px;
    font-weight: 900;
  }

  .login-device-subtitle {
    margin: 5px 0 0;
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
  }

  .login-device-badges {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .login-device-badge {
    border-radius: 999px;
    padding: 5px 9px;
    background: #F1F5F9;
    color: #475569;
    font-size: 11px;
    font-weight: 900;
    white-space: nowrap;
  }

  .login-device-badge.current {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .login-device-badge.active {
    background: #ECFDF5;
    color: #047857;
  }

  .login-device-badge.revoked {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .login-device-badge.logged_out {
    background: #FFF7ED;
    color: #C2410C;
  }

  .login-device-info {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin: 13px 0;
  }

  .login-device-row {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 10px;
    font-size: 12px;
    line-height: 1.45;
  }

  .login-device-row span {
    color: #64748B;
    font-weight: 800;
  }

  .login-device-row strong {
    color: #0F172A;
    font-weight: 800;
    word-break: break-word;
  }

  .login-devices-events {
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    border-radius: 18px;
    padding: 16px;
  }

  .login-devices-events h3 {
    margin: 0 0 12px;
    color: #0F172A;
    font-size: 15px;
    font-weight: 900;
  }

  .login-device-event {
    display: grid;
    grid-template-columns: 165px minmax(0, 1fr) 110px;
    gap: 10px;
    padding: 10px 0;
    border-top: 1px solid #E2E8F0;
    font-size: 12px;
    align-items: center;
  }

  .login-device-event:first-of-type {
    border-top: none;
  }

  .login-device-event-time {
    color: #64748B;
    font-weight: 800;
  }

  .login-device-event-main {
    color: #0F172A;
    font-weight: 900;
    word-break: break-word;
  }

  .login-device-event-result {
    color: #475569;
    font-weight: 800;
    text-align: right;
  }

  .login-devices-empty {
    border: 1px dashed #CBD5E1;
    border-radius: 18px;
    padding: 24px;
    text-align: center;
    color: #64748B;
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 860px) {
    .login-devices-wrap,
    .login-devices-actions,
    .login-devices-summary,
    .login-devices-grid,
    .login-device-card,
    .login-device-head,
    .login-device-head > div,
    .login-device-info,
    .login-device-row,
    .login-devices-events,
    .login-device-event {
      min-width: 0;
      max-width: 100%;
    }

    .login-devices-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .login-devices-summary {
      width: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .login-devices-grid,
    .login-device-event {
      grid-template-columns: 1fr;
    }

    .login-devices-button-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .login-devices-button {
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    .login-device-event-result {
      text-align: left;
    }

    .login-device-name,
    .login-device-subtitle,
    .login-device-row strong,
    .login-device-event-time,
    .login-device-event-main,
    .login-device-event-result,
    .login-devices-message,
    .login-devices-empty,
    .login-devices-stat span,
    .login-devices-stat strong {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  }

  @media (max-width: 640px) {
    .login-devices-wrap {
      gap: 14px;
    }

    .login-devices-summary {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .login-devices-stat,
    .login-device-card,
    .login-devices-events {
      border-radius: 16px;
      padding: 14px;
    }

    .login-devices-stat strong {
      font-size: 21px;
    }

    .login-device-head {
      flex-direction: column;
    }

    .login-device-badges {
      justify-content: flex-start;
    }

    .login-device-card > .login-devices-button {
      width: 100%;
      min-height: 44px;
      height: auto;
      padding: 10px 12px;
      line-height: 1.3;
    }
  }

  @media (max-width: 520px) {
    .login-device-row {
      grid-template-columns: 1fr;
      gap: 3px;
    }

    .login-devices-button-row {
      grid-template-columns: 1fr;
    }

    .login-devices-button-row .login-devices-button {
      width: 100%;
      min-height: 44px;
      height: auto;
      padding: 10px 12px;
      line-height: 1.3;
    }
  }
`

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function statusClass(status) {
  return String(status || 'active').toLowerCase().replace(/\s+/g, '_')
}

async function deviceRequest(path, options = {}) {
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
    throw new Error(data.message || 'Device access request failed')
  }

  return data
}

export default function LoginDevicesSection() {
  const [summary, setSummary] = useState({
    active_devices: 0,
    max_devices: 2,
    available_slots: 2,
    total_devices: 0,
  })
  const [devices, setDevices] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const activeDevices = useMemo(
    () => devices.filter((device) => device.status === 'active').length,
    [devices]
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const [overviewData, devicesData, eventsData] = await Promise.all([
        deviceRequest('/api/admin/device-access/overview'),
        deviceRequest('/api/admin/device-access/devices'),
        deviceRequest('/api/admin/device-access/events?limit=30'),
      ])

      setSummary(overviewData.summary || {
        active_devices: devicesData.active_devices || 0,
        max_devices: devicesData.max_devices || 2,
        available_slots: Math.max(0, (devicesData.max_devices || 2) - (devicesData.active_devices || 0)),
        total_devices: Array.isArray(devicesData.devices) ? devicesData.devices.length : 0,
      })
      setDevices(Array.isArray(devicesData.devices) ? devicesData.devices : [])
      setEvents(Array.isArray(eventsData.events) ? eventsData.events : [])
    } catch (err) {
      setError(err.message || 'Failed to load login devices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleRevoke(deviceId) {
    const ok = window.confirm('Revoke this admin device now?')

    if (!ok) return

    setActionLoading(deviceId)
    setError('')
    setMessage('')

    try {
      const data = await deviceRequest(`/api/admin/device-access/devices/${deviceId}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: 'Revoked from admin settings' }),
      })

      setMessage(data.message || 'Device revoked')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to revoke device')
    } finally {
      setActionLoading('')
    }
  }

  async function handleLogoutCurrent() {
    const ok = window.confirm('Logout this current admin device now?')

    if (!ok) return

    setActionLoading('logout-current')
    setError('')
    setMessage('')

    try {
      const data = await deviceRequest('/api/admin/device-access/logout-current', {
        method: 'POST',
      })

      sessionStorage.removeItem('shadow_admin_token')
      sessionStorage.removeItem('shadow_admin_user')
      localStorage.removeItem('shadow_admin_token')
      localStorage.removeItem('shadow_admin_user')
      setMessage(data.message || 'Current device logged out')
      window.setTimeout(() => {
        window.location.href = '/login'
      }, 700)
    } catch (err) {
      setError(err.message || 'Failed to logout current device')
    } finally {
      setActionLoading('')
    }
  }

  async function handleEmergencyReset() {
    const firstOk = window.confirm('Emergency reset will logout all admin devices. Continue?')
    if (!firstOk) return

    const secondOk = window.confirm('Confirm emergency reset now?')
    if (!secondOk) return

    setActionLoading('emergency-reset')
    setError('')
    setMessage('')

    try {
      const data = await deviceRequest('/api/admin/device-access/emergency-reset', {
        method: 'POST',
      })

      sessionStorage.removeItem('shadow_admin_token')
      sessionStorage.removeItem('shadow_admin_user')
      localStorage.removeItem('shadow_admin_token')
      localStorage.removeItem('shadow_admin_user')
      setMessage(data.message || 'All devices reset')
      window.setTimeout(() => {
        window.location.href = '/login'
      }, 900)
    } catch (err) {
      setError(err.message || 'Failed to reset devices')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <>
      <style>{sectionStyles}</style>

      <div className="login-devices-wrap">
        <div className="login-devices-actions">
          <div className="login-devices-summary">
            <div className="login-devices-stat">
              <span>Active Devices</span>
              <strong>{summary.active_devices ?? activeDevices} / {summary.max_devices || 2}</strong>
            </div>
            <div className="login-devices-stat">
              <span>Available Slots</span>
              <strong>{summary.available_slots ?? Math.max(0, (summary.max_devices || 2) - activeDevices)}</strong>
            </div>
            <div className="login-devices-stat">
              <span>Total Records</span>
              <strong>{summary.total_devices ?? devices.length}</strong>
            </div>
          </div>

          <div className="login-devices-button-row">
            <button
              type="button"
              className="login-devices-button light"
              onClick={loadData}
              disabled={loading || Boolean(actionLoading)}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              type="button"
              className="login-devices-button danger"
              onClick={handleEmergencyReset}
              disabled={loading || Boolean(actionLoading)}
            >
              Reset All
            </button>
          </div>
        </div>

        {error ? <div className="login-devices-message error">{error}</div> : null}
        {message ? <div className="login-devices-message success">{message}</div> : null}

        {loading ? (
          <div className="login-devices-empty">Loading login devices...</div>
        ) : devices.length ? (
          <div className="login-devices-grid">
            {devices.map((device) => {
              const status = statusClass(device.status)
              const canRevoke = device.status === 'active' && !device.is_current
              const canLogoutCurrent = device.status === 'active' && device.is_current

              return (
                <article key={device.id} className="login-device-card">
                  <div className="login-device-head">
                    <div>
                      <h3 className="login-device-name">{device.device_label || 'Admin device'}</h3>
                      <p className="login-device-subtitle">
                        {(device.browser_name || 'Unknown Browser')} · {(device.os_name || 'Unknown OS')}
                      </p>
                    </div>

                    <div className="login-device-badges">
                      {device.is_current ? <span className="login-device-badge current">This Device</span> : null}
                      <span className={`login-device-badge ${status}`}>{device.status || 'active'}</span>
                    </div>
                  </div>

                  <div className="login-device-info">
                    <div className="login-device-row">
                      <span>Last IP</span>
                      <strong>{device.last_ip || '—'}</strong>
                    </div>
                    <div className="login-device-row">
                      <span>First Login</span>
                      <strong>{formatDate(device.first_login_at)}</strong>
                    </div>
                    <div className="login-device-row">
                      <span>Last Login</span>
                      <strong>{formatDate(device.last_login_at)}</strong>
                    </div>
                    <div className="login-device-row">
                      <span>Last Seen</span>
                      <strong>{formatDate(device.last_seen_at)}</strong>
                    </div>
                  </div>

                  {canLogoutCurrent ? (
                    <button
                      type="button"
                      className="login-devices-button danger"
                      onClick={handleLogoutCurrent}
                      disabled={Boolean(actionLoading)}
                    >
                      {actionLoading === 'logout-current' ? 'Logging out...' : 'Logout this device'}
                    </button>
                  ) : null}

                  {canRevoke ? (
                    <button
                      type="button"
                      className="login-devices-button danger"
                      onClick={() => handleRevoke(device.id)}
                      disabled={Boolean(actionLoading)}
                    >
                      {actionLoading === device.id ? 'Revoking...' : 'Revoke device'}
                    </button>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="login-devices-empty">No admin devices found. Login again to register this browser.</div>
        )}

        <div className="login-devices-events">
          <h3>Recent Device Events</h3>

          {events.length ? (
            events.slice(0, 8).map((event) => (
              <div key={event.id} className="login-device-event">
                <div className="login-device-event-time">{formatDate(event.created_at)}</div>
                <div className="login-device-event-main">
                  {event.event_type || 'device_event'}
                  {event.reason ? ` · ${event.reason}` : ''}
                </div>
                <div className="login-device-event-result">{event.result || '—'}</div>
              </div>
            ))
          ) : (
            <div className="login-devices-empty">No recent device events.</div>
          )}
        </div>
      </div>
    </>
  )
}
