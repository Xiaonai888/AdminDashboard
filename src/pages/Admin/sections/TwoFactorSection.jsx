import React, { useCallback, useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const sectionStyles = `
  .two-factor-wrap { display: flex; flex-direction: column; gap: 18px; }
  .two-factor-top { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .two-factor-stat { border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 16px; padding: 15px; }
  .two-factor-stat span { display: block; color: #64748B; font-size: 12px; font-weight: 800; }
  .two-factor-stat strong { display: block; margin-top: 6px; color: #0F172A; font-size: 20px; font-weight: 900; }
  .two-factor-card { border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 18px; padding: 16px; box-shadow: 0 8px 24px rgba(15,23,42,0.05); }
  .two-factor-card h3 { margin: 0; color: #0F172A; font-size: 16px; font-weight: 900; }
  .two-factor-card p { margin: 6px 0 0; color: #64748B; font-size: 13px; font-weight: 700; line-height: 1.55; }
  .two-factor-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
  .two-factor-button { min-height: 42px; border: none; border-radius: 12px; padding: 0 15px; background: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 0 12px 24px rgba(15,23,42,0.14); transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease; }
  .two-factor-button:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(15,23,42,0.18); }
  .two-factor-button:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .two-factor-button.light { background: #EEF2FF; color: #4F46E5; box-shadow: none; }
  .two-factor-button.danger { background: #DC2626; box-shadow: 0 12px 24px rgba(220,38,38,0.16); }
  .two-factor-message { border-radius: 14px; padding: 12px 14px; font-size: 13px; font-weight: 800; line-height: 1.5; }
  .two-factor-message.error { background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C; }
  .two-factor-message.success { background: #ECFDF5; border: 1px solid #A7F3D0; color: #047857; }
  .two-factor-setup { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 16px; align-items: start; margin-top: 14px; }
  .two-factor-qr { width: 180px; height: 180px; border-radius: 16px; border: 1px solid #E2E8F0; background: #F8FAFC; padding: 10px; }
  .two-factor-input { width: 100%; min-height: 44px; border: 1px solid #CBD5E1; border-radius: 12px; padding: 0 13px; font-size: 14px; font-weight: 800; outline: none; color: #0F172A; background: #FFFFFF; }
  .two-factor-input:focus { border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79,70,229,0.10); }
  .two-factor-field { margin-top: 12px; display: grid; gap: 7px; }
  .two-factor-field label { color: #475569; font-size: 12px; font-weight: 900; }
  .two-factor-code-box { border: 1px dashed #CBD5E1; background: #F8FAFC; color: #0F172A; border-radius: 14px; padding: 12px; font-size: 13px; font-weight: 900; word-break: break-all; }
  .two-factor-recovery-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
  .two-factor-recovery-code { border: 1px solid #E2E8F0; background: #F8FAFC; border-radius: 12px; padding: 10px; color: #0F172A; font-size: 13px; font-weight: 900; text-align: center; letter-spacing: 0.04em; }
  .two-factor-events { display: grid; gap: 8px; margin-top: 12px; }
  .two-factor-event { display: grid; grid-template-columns: 150px minmax(0, 1fr) 80px; gap: 10px; border-top: 1px solid #E2E8F0; padding-top: 9px; color: #0F172A; font-size: 12px; font-weight: 800; }
  .two-factor-event span { color: #64748B; }
  .two-factor-empty { border: 1px dashed #CBD5E1; border-radius: 18px; padding: 24px; text-align: center; color: #64748B; font-size: 13px; font-weight: 800; }
  @media (max-width: 860px) {
    .two-factor-wrap,
    .two-factor-top,
    .two-factor-card,
    .two-factor-setup,
    .two-factor-setup > div,
    .two-factor-field,
    .two-factor-events,
    .two-factor-event {
      min-width: 0;
      max-width: 100%;
    }

    .two-factor-top {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .two-factor-setup,
    .two-factor-recovery-grid {
      grid-template-columns: 1fr;
    }

    .two-factor-event {
      grid-template-columns: 1fr;
    }

    .two-factor-input,
    .two-factor-button {
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    .two-factor-qr {
      display: block;
      max-width: 100%;
      height: auto;
      aspect-ratio: 1;
    }

    .two-factor-card h3,
    .two-factor-card p,
    .two-factor-stat span,
    .two-factor-stat strong,
    .two-factor-message,
    .two-factor-empty,
    .two-factor-event,
    .two-factor-recovery-code {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  }

  @media (max-width: 640px) {
    .two-factor-wrap {
      gap: 14px;
    }

    .two-factor-top {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .two-factor-stat,
    .two-factor-card {
      border-radius: 16px;
      padding: 14px;
    }

    .two-factor-stat strong {
      font-size: 19px;
    }

    .two-factor-actions {
      display: grid;
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    .two-factor-button {
      width: 100%;
      min-height: 44px;
      height: auto;
      padding: 10px 12px;
      line-height: 1.3;
    }

    .two-factor-input {
      font-size: 16px;
    }

    .two-factor-setup {
      gap: 14px;
    }

    .two-factor-qr {
      width: min(180px, 100%);
      margin: 0 auto;
    }

    .two-factor-code-box {
      overflow-wrap: anywhere;
    }

    .two-factor-recovery-code {
      text-align: left;
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

function formatEvent(value) {
  return String(value || 'two_factor_event')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function twoFactorRequest(path, options = {}) {
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
    throw new Error(data.message || 'Two-factor request failed')
  }

  return data
}

export default function TwoFactorSection() {
  const [status, setStatus] = useState({
    authenticator_enabled: false,
    email_otp_enabled: false,
    recovery_codes_enabled: false,
    recovery_codes_remaining: 0,
  })
  const [events, setEvents] = useState([])
  const [setup, setSetup] = useState(null)
  const [setupCode, setSetupCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [regenCode, setRegenCode] = useState('')
  const [emailOtpCode, setEmailOtpCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const qrUrl = useMemo(() => {
    if (!setup?.otpauth_url) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(setup.otpauth_url)}`
  }, [setup])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const [statusData, eventsData] = await Promise.all([
        twoFactorRequest('/api/admin/two-factor/status'),
        twoFactorRequest('/api/admin/two-factor/events?limit=20'),
      ])

      setStatus(statusData.status || {
        authenticator_enabled: false,
        email_otp_enabled: false,
        recovery_codes_enabled: false,
        recovery_codes_remaining: 0,
      })
      setEvents(Array.isArray(eventsData.events) ? eventsData.events : [])
    } catch (err) {
      setError(err.message || 'Failed to load two-factor authentication')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function startSetup() {
    setActionLoading('setup-start')
    setError('')
    setMessage('')
    setRecoveryCodes([])

    try {
      const data = await twoFactorRequest('/api/admin/two-factor/authenticator/setup-start', {
        method: 'POST',
      })

      setSetup(data)
      setMessage('Scan the QR code with Google Authenticator, then enter the 6-digit code.')
    } catch (err) {
      setError(err.message || 'Failed to start authenticator setup')
    } finally {
      setActionLoading('')
    }
  }

  async function verifySetup() {
    if (!setup?.challenge_id) {
      setError('Start setup first')
      return
    }

    setActionLoading('setup-verify')
    setError('')
    setMessage('')

    try {
      const data = await twoFactorRequest('/api/admin/two-factor/authenticator/setup-verify', {
        method: 'POST',
        body: JSON.stringify({
          challengeId: setup.challenge_id,
          code: setupCode,
        }),
      })

      setStatus(data.status || status)
      setRecoveryCodes(Array.isArray(data.recovery_codes) ? data.recovery_codes : [])
      setSetup(null)
      setSetupCode('')
      setMessage('Two-factor authentication enabled. Save your recovery codes now.')
      await loadData()
    } catch (err) {
      setError(err.message || 'Authenticator code is incorrect')
    } finally {
      setActionLoading('')
    }
  }

  async function disableTwoFactor() {
    const ok = window.confirm('Disable two-factor authentication?')

    if (!ok) return

    setActionLoading('disable')
    setError('')
    setMessage('')

    try {
      const data = await twoFactorRequest('/api/admin/two-factor/disable', {
        method: 'POST',
        body: JSON.stringify({ code: disableCode }),
      })

      setStatus(data.status || status)
      setDisableCode('')
      setRecoveryCodes([])
      setMessage('Two-factor authentication disabled')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to disable two-factor authentication')
    } finally {
      setActionLoading('')
    }
  }

  async function enableEmailOtp() {
    setActionLoading('email-enable')
    setError('')
    setMessage('')

    try {
      const data = await twoFactorRequest('/api/admin/two-factor/email/enable', {
        method: 'POST',
        body: JSON.stringify({ code: emailOtpCode }),
      })

      setStatus(data.status || status)
      setEmailOtpCode('')
      setMessage('Email code backup enabled')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to enable email code backup')
    } finally {
      setActionLoading('')
    }
  }

  async function disableEmailOtp() {
    const ok = window.confirm('Disable email code backup?')

    if (!ok) return

    setActionLoading('email-disable')
    setError('')
    setMessage('')

    try {
      const data = await twoFactorRequest('/api/admin/two-factor/email/disable', {
        method: 'POST',
        body: JSON.stringify({ code: emailOtpCode }),
      })

      setStatus(data.status || status)
      setEmailOtpCode('')
      setMessage('Email code backup disabled')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to disable email code backup')
    } finally {
      setActionLoading('')
    }
  }

  async function regenerateCodes() {
    const ok = window.confirm('Regenerate recovery codes? Old recovery codes will stop working.')

    if (!ok) return

    setActionLoading('regenerate')
    setError('')
    setMessage('')

    try {
      const data = await twoFactorRequest('/api/admin/two-factor/recovery-codes/regenerate', {
        method: 'POST',
        body: JSON.stringify({ code: regenCode }),
      })

      setStatus(data.status || status)
      setRecoveryCodes(Array.isArray(data.recovery_codes) ? data.recovery_codes : [])
      setRegenCode('')
      setMessage('Recovery codes regenerated. Save them now.')
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to regenerate recovery codes')
    } finally {
      setActionLoading('')
    }
  }

  function copyRecoveryCodes() {
    const text = recoveryCodes.join('\n')

    navigator.clipboard?.writeText(text)
    setMessage('Recovery codes copied')
  }

  return (
    <>
      <style>{sectionStyles}</style>

      <div className="two-factor-wrap">
        <div className="two-factor-top">
          <div className="two-factor-stat">
            <span>Authenticator App</span>
            <strong>{status.authenticator_enabled ? 'Enabled' : 'Disabled'}</strong>
          </div>
          <div className="two-factor-stat">
            <span>Email Code</span>
            <strong>{status.email_otp_enabled ? 'Enabled' : 'Disabled'}</strong>
          </div>
          <div className="two-factor-stat">
            <span>Recovery Codes</span>
            <strong>{status.recovery_codes_remaining || 0} left</strong>
          </div>
        </div>

        {error ? <div className="two-factor-message error">{error}</div> : null}
        {message ? <div className="two-factor-message success">{message}</div> : null}

        {loading ? (
          <div className="two-factor-empty">Loading two-factor authentication...</div>
        ) : (
          <>
            <section className="two-factor-card">
              <h3>Google Authenticator</h3>
              <p>Use Google Authenticator, Authy, or another authenticator app to protect admin login.</p>

              {!status.authenticator_enabled ? (
                <div className="two-factor-actions">
                  <button
                    type="button"
                    className="two-factor-button"
                    onClick={startSetup}
                    disabled={Boolean(actionLoading)}
                  >
                    {actionLoading === 'setup-start' ? 'Starting...' : 'Set up authenticator'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="two-factor-field">
                    <label>Enter 2FA code to disable</label>
                    <input
                      className="two-factor-input"
                      value={disableCode}
                      onChange={(event) => setDisableCode(event.target.value)}
                      placeholder="123456 or recovery code"
                    />
                  </div>

                  <div className="two-factor-actions">
                    <button
                      type="button"
                      className="two-factor-button danger"
                      onClick={disableTwoFactor}
                      disabled={Boolean(actionLoading) || !disableCode}
                    >
                      {actionLoading === 'disable' ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  </div>
                </>
              )}

              {setup ? (
                <div className="two-factor-setup">
                  {qrUrl ? <img className="two-factor-qr" src={qrUrl} alt="Authenticator QR code" /> : null}

                  <div>
                    <div className="two-factor-field">
                      <label>Manual key</label>
                      <div className="two-factor-code-box">{setup.manual_key}</div>
                    </div>

                    <div className="two-factor-field">
                      <label>6-digit code</label>
                      <input
                        className="two-factor-input"
                        value={setupCode}
                        onChange={(event) => setSetupCode(event.target.value)}
                        placeholder="123456"
                      />
                    </div>

                    <div className="two-factor-actions">
                      <button
                        type="button"
                        className="two-factor-button"
                        onClick={verifySetup}
                        disabled={Boolean(actionLoading) || !setupCode}
                      >
                        {actionLoading === 'setup-verify' ? 'Verifying...' : 'Verify and enable'}
                      </button>
                      <button
                        type="button"
                        className="two-factor-button light"
                        onClick={() => setSetup(null)}
                        disabled={Boolean(actionLoading)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            {status.authenticator_enabled ? (
              <section className="two-factor-card">
                <h3>Email Code Backup</h3>
                <p>Allow Shadow Admin to send a 6-digit login backup code to your admin email if your authenticator app is not available.</p>

                <div className="two-factor-field">
                  <label>Enter authenticator code or recovery code</label>
                  <input
                    className="two-factor-input"
                    value={emailOtpCode}
                    onChange={(event) => setEmailOtpCode(event.target.value)}
                    placeholder="123456 or recovery code"
                  />
                </div>

                <div className="two-factor-actions">
                  {status.email_otp_enabled ? (
                    <button
                      type="button"
                      className="two-factor-button danger"
                      onClick={disableEmailOtp}
                      disabled={Boolean(actionLoading) || !emailOtpCode}
                    >
                      {actionLoading === 'email-disable' ? 'Disabling...' : 'Disable email code'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="two-factor-button"
                      onClick={enableEmailOtp}
                      disabled={Boolean(actionLoading) || !emailOtpCode}
                    >
                      {actionLoading === 'email-enable' ? 'Enabling...' : 'Enable email code'}
                    </button>
                  )}
                </div>
              </section>
            ) : (
              <section className="two-factor-card">
                <h3>Email Code Backup</h3>
                <p>Enable Google Authenticator first before adding email code backup.</p>
              </section>
            )}

            {status.authenticator_enabled ? (
              <section className="two-factor-card">
                <h3>Recovery Codes</h3>
                <p>Recovery codes can unlock your admin account if you lose your authenticator app. They are shown only once.</p>

                <div className="two-factor-field">
                  <label>Enter authenticator code to regenerate</label>
                  <input
                    className="two-factor-input"
                    value={regenCode}
                    onChange={(event) => setRegenCode(event.target.value)}
                    placeholder="123456"
                  />
                </div>

                <div className="two-factor-actions">
                  <button
                    type="button"
                    className="two-factor-button light"
                    onClick={regenerateCodes}
                    disabled={Boolean(actionLoading) || !regenCode}
                  >
                    {actionLoading === 'regenerate' ? 'Regenerating...' : 'Regenerate codes'}
                  </button>
                </div>

                {recoveryCodes.length ? (
                  <>
                    <div className="two-factor-recovery-grid">
                      {recoveryCodes.map((code) => (
                        <div key={code} className="two-factor-recovery-code">{code}</div>
                      ))}
                    </div>

                    <div className="two-factor-actions">
                      <button type="button" className="two-factor-button" onClick={copyRecoveryCodes}>
                        Copy recovery codes
                      </button>
                    </div>
                  </>
                ) : null}
              </section>
            ) : null}

            <section className="two-factor-card">
              <h3>Recent 2FA Events</h3>

              {events.length ? (
                <div className="two-factor-events">
                  {events.slice(0, 8).map((event) => (
                    <div key={event.id} className="two-factor-event">
                      <span>{formatDate(event.created_at)}</span>
                      <strong>{formatEvent(event.event_type)} · {event.reason || '—'}</strong>
                      <span>{event.result || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="two-factor-empty">No 2FA events yet.</div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}
