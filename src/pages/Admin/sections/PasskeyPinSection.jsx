import React, { useCallback, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .passkey-pin-wrap { display: flex; flex-direction: column; gap: 18px; }
  .passkey-pin-top { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .passkey-pin-stat { border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 16px; padding: 15px; }
  .passkey-pin-stat span { display: block; color: #64748B; font-size: 12px; font-weight: 800; }
  .passkey-pin-stat strong { display: block; margin-top: 6px; color: #0F172A; font-size: 20px; font-weight: 900; }
  .passkey-pin-card { border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 18px; padding: 16px; box-shadow: 0 8px 24px rgba(15,23,42,0.05); }
  .passkey-pin-card h3 { margin: 0; color: #0F172A; font-size: 16px; font-weight: 900; }
  .passkey-pin-card p { margin: 6px 0 0; color: #64748B; font-size: 13px; font-weight: 700; line-height: 1.55; }
  .passkey-pin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
  .passkey-pin-field { display: grid; gap: 7px; }
  .passkey-pin-field label { color: #475569; font-size: 12px; font-weight: 900; }
  .passkey-pin-input { width: 100%; min-height: 44px; border: 1px solid #CBD5E1; border-radius: 12px; padding: 0 13px; font-size: 14px; font-weight: 800; outline: none; color: #0F172A; background: #FFFFFF; }
  .passkey-pin-input:focus { border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79,70,229,0.10); }
  .passkey-pin-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
  .passkey-pin-button { min-height: 42px; border: none; border-radius: 12px; padding: 0 15px; background: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 0 12px 24px rgba(15,23,42,0.14); transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease; }
  .passkey-pin-button:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(15,23,42,0.18); }
  .passkey-pin-button:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .passkey-pin-button.light { background: #EEF2FF; color: #4F46E5; box-shadow: none; }
  .passkey-pin-button.danger { background: #DC2626; box-shadow: 0 12px 24px rgba(220,38,38,0.16); }
  .passkey-pin-message { border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 800; line-height: 1.5; }
  .passkey-pin-message.error { background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C; }
  .passkey-pin-message.success { background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; }
  .passkey-pin-events { display: grid; gap: 8px; margin-top: 12px; }
  .passkey-pin-event { display: grid; grid-template-columns: 150px minmax(0, 1fr) 80px; gap: 10px; border-top: 1px solid #E2E8F0; padding-top: 9px; color: #0F172A; font-size: 12px; font-weight: 800; }
  .passkey-pin-event span { color: #64748B; }
  .passkey-pin-empty { border: 1px dashed #CBD5E1; border-radius: 18px; padding: 24px; text-align: center; color: #64748B; font-size: 13px; font-weight: 800; }
  @media (max-width: 860px) { .passkey-pin-top, .passkey-pin-grid, .passkey-pin-event { grid-template-columns: 1fr; } }
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

function formatEvent(value) {
  return String(value || 'passkey_pin_event')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function passkeyRequest(path, options = {}) {
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
    throw new Error(data.message || 'Passkey PIN request failed')
  }

  return data
}

export default function PasskeyPinSection() {
  const [status, setStatus] = useState({ is_enabled: false, failed_count: 0, locked_until: null, last_verified_at: null, last_changed_at: null })
  const [events, setEvents] = useState([])
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [disablePin, setDisablePin] = useState('')
  const [testPin, setTestPin] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const [statusData, eventsData] = await Promise.all([
        passkeyRequest('/api/admin/passkey-pin/status'),
        passkeyRequest('/api/admin/passkey-pin/events?limit=20'),
      ])

      setStatus(statusData.status || { is_enabled: false, failed_count: 0, locked_until: null, last_verified_at: null, last_changed_at: null })
      setEvents(Array.isArray(eventsData.events) ? eventsData.events : [])
    } catch (err) {
      setError(err.message || 'Failed to load passkey PIN')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function pinOnly(value) {
    return value.replace(/\D/g, '').slice(0, 6)
  }

  async function setupPin() {
    setActionLoading('setup')
    setError('')
    setMessage('')

    try {
      const data = await passkeyRequest('/api/admin/passkey-pin/setup', {
        method: 'POST',
        body: JSON.stringify({ pin, confirmPin, twoFactorCode }),
      })

      setStatus(data.status || status)
      setPin('')
      setConfirmPin('')
      setTwoFactorCode('')
      setMessage('Admin Passkey PIN enabled')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to enable Passkey PIN')
    } finally {
      setActionLoading('')
    }
  }

  async function verifyPin() {
    setActionLoading('verify')
    setError('')
    setMessage('')

    try {
      const data = await passkeyRequest('/api/admin/passkey-pin/verify', {
        method: 'POST',
        body: JSON.stringify({ pin: testPin, purpose: 'settings_test' }),
      })

      setStatus(data.status || status)
      setTestPin('')
      setMessage('Passkey PIN verified successfully')
      await loadData()
    } catch (err) {
      setError(err.message || 'Passkey PIN is incorrect')
    } finally {
      setActionLoading('')
    }
  }

  async function changePin() {
    setActionLoading('change')
    setError('')
    setMessage('')

    try {
      const data = await passkeyRequest('/api/admin/passkey-pin/change', {
        method: 'POST',
        body: JSON.stringify({ currentPin, newPin, confirmPin: confirmNewPin }),
      })

      setStatus(data.status || status)
      setCurrentPin('')
      setNewPin('')
      setConfirmNewPin('')
      setMessage('Passkey PIN changed')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to change Passkey PIN')
    } finally {
      setActionLoading('')
    }
  }

  async function disablePinCode() {
    const ok = window.confirm('Disable Admin Passkey PIN?')
    if (!ok) return

    setActionLoading('disable')
    setError('')
    setMessage('')

    try {
      const data = await passkeyRequest('/api/admin/passkey-pin/disable', {
        method: 'POST',
        body: JSON.stringify({ pin: disablePin }),
      })

      setStatus(data.status || status)
      setDisablePin('')
      setMessage('Passkey PIN disabled')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to disable Passkey PIN')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="passkey-pin-wrap">
        <div className="passkey-pin-top">
          <div className="passkey-pin-stat"><span>Status</span><strong>{status.is_enabled ? 'Enabled' : 'Disabled'}</strong></div>
          <div className="passkey-pin-stat"><span>Failed Attempts</span><strong>{status.failed_count || 0}</strong></div>
          <div className="passkey-pin-stat"><span>Locked Until</span><strong>{formatDate(status.locked_until)}</strong></div>
        </div>

        {error ? <div className="passkey-pin-message error">{error}</div> : null}
        {message ? <div className="passkey-pin-message success">{message}</div> : null}

        {loading ? (
          <div className="passkey-pin-empty">Loading Admin Passkey PIN...</div>
        ) : !status.is_enabled ? (
          <section className="passkey-pin-card">
            <h3>Set Admin Passkey PIN</h3>
            <p>Create a 6-digit PIN for extra protection after 2FA and for sensitive admin actions.</p>

            <div className="passkey-pin-grid">
              <div className="passkey-pin-field"><label>New 6-digit PIN</label><input className="passkey-pin-input" value={pin} onChange={(event) => setPin(pinOnly(event.target.value))} placeholder="123456" inputMode="numeric" /></div>
              <div className="passkey-pin-field"><label>Confirm PIN</label><input className="passkey-pin-input" value={confirmPin} onChange={(event) => setConfirmPin(pinOnly(event.target.value))} placeholder="123456" inputMode="numeric" /></div>
              <div className="passkey-pin-field"><label>Google Authenticator or recovery code</label><input className="passkey-pin-input" value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value)} placeholder="123456 or recovery code" /></div>
            </div>

            <div className="passkey-pin-actions"><button type="button" className="passkey-pin-button" onClick={setupPin} disabled={Boolean(actionLoading) || pin.length !== 6 || confirmPin.length !== 6 || !twoFactorCode}>{actionLoading === 'setup' ? 'Enabling...' : 'Enable Passkey PIN'}</button></div>
          </section>
        ) : (
          <>
            <section className="passkey-pin-card">
              <h3>Test Passkey PIN</h3>
              <p>Verify that your current 6-digit PIN works before using it in login flow.</p>
              <div className="passkey-pin-grid"><div className="passkey-pin-field"><label>Current PIN</label><input className="passkey-pin-input" value={testPin} onChange={(event) => setTestPin(pinOnly(event.target.value))} placeholder="123456" inputMode="numeric" /></div></div>
              <div className="passkey-pin-actions"><button type="button" className="passkey-pin-button" onClick={verifyPin} disabled={Boolean(actionLoading) || testPin.length !== 6}>{actionLoading === 'verify' ? 'Verifying...' : 'Verify PIN'}</button></div>
            </section>

            <section className="passkey-pin-card">
              <h3>Change Passkey PIN</h3>
              <p>Change your current Admin Passkey PIN.</p>
              <div className="passkey-pin-grid">
                <div className="passkey-pin-field"><label>Current PIN</label><input className="passkey-pin-input" value={currentPin} onChange={(event) => setCurrentPin(pinOnly(event.target.value))} placeholder="Current PIN" inputMode="numeric" /></div>
                <div className="passkey-pin-field"><label>New PIN</label><input className="passkey-pin-input" value={newPin} onChange={(event) => setNewPin(pinOnly(event.target.value))} placeholder="New PIN" inputMode="numeric" /></div>
                <div className="passkey-pin-field"><label>Confirm New PIN</label><input className="passkey-pin-input" value={confirmNewPin} onChange={(event) => setConfirmNewPin(pinOnly(event.target.value))} placeholder="Confirm new PIN" inputMode="numeric" /></div>
              </div>
              <div className="passkey-pin-actions"><button type="button" className="passkey-pin-button light" onClick={changePin} disabled={Boolean(actionLoading) || currentPin.length !== 6 || newPin.length !== 6 || confirmNewPin.length !== 6}>{actionLoading === 'change' ? 'Changing...' : 'Change PIN'}</button></div>
            </section>

            <section className="passkey-pin-card">
              <h3>Disable Passkey PIN</h3>
              <p>Disable this extra PIN protection. You can enable it again later.</p>
              <div className="passkey-pin-grid"><div className="passkey-pin-field"><label>Current PIN</label><input className="passkey-pin-input" value={disablePin} onChange={(event) => setDisablePin(pinOnly(event.target.value))} placeholder="123456" inputMode="numeric" /></div></div>
              <div className="passkey-pin-actions"><button type="button" className="passkey-pin-button danger" onClick={disablePinCode} disabled={Boolean(actionLoading) || disablePin.length !== 6}>{actionLoading === 'disable' ? 'Disabling...' : 'Disable PIN'}</button></div>
            </section>
          </>
        )}

        <section className="passkey-pin-card">
          <h3>Recent Passkey PIN Events</h3>
          {events.length ? (
            <div className="passkey-pin-events">
              {events.slice(0, 8).map((event) => (
                <div key={event.id} className="passkey-pin-event"><span>{formatDate(event.created_at)}</span><strong>{formatEvent(event.event_type)} · {event.reason || '—'}</strong><span>{event.result || '—'}</span></div>
              ))}
            </div>
          ) : (
            <div className="passkey-pin-empty">No Passkey PIN events yet.</div>
          )}
        </section>
      </div>
    </>
  )
}
