import React, { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function ownerRequest(path, options = {}) {
  const token = adminToken()
  if (!token) throw new Error('Admin session missing. Sign in again.')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || `Request failed (HTTP ${response.status})`)
  }
  return data
}

function targetParams(record) {
  return new URLSearchParams({ method: 'GET', path: record.path }).toString()
}

function canTest(record) {
  return record.enabled && record.target_type === 'api' && record.source === 'ALL' &&
    record.mode === 'automatic' && record.method === 'GET' && !record.expires_at &&
    record.path.startsWith('/api/') && !record.path.includes(':') &&
    !record.path.includes('*') && !record.path.includes('//') &&
    !record.path.startsWith('/api/admin/work')
}

export default function CriticalCanaryPanel({ record, onReleased }) {
  const [trial, setTrial] = useState(null)
  const [canaryToken, setCanaryToken] = useState('')
  const [query, setQuery] = useState('')
  const [reason, setReason] = useState('')
  const [reviewedMetrics, setReviewedMetrics] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const eligible = canTest(record)
  const ready = trial?.state === 'ready' && !trial?.in_flight &&
    new Date(trial.expires_at).getTime() > Date.now()
  const boxStyle = { width: '100%', marginTop: 12, padding: 14, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, display: 'grid', gap: 10 }
  const buttonStyle = { minHeight: 38, border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', background: '#fff', cursor: 'pointer' }
  const inputStyle = { width: '100%', minHeight: 38, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box' }

  async function startTrial() {
    if (!window.confirm(`Start a limited 5-minute test for ${record.method} ${record.path}? The Kill Switch stays ON.`)) return
    setBusy('start')
    setError('')
    setMessage('')
    setReviewedMetrics(false)
    setTrial(null)
    setCanaryToken('')
    try {
      const data = await ownerRequest('/api/admin/work/kill-switches/half-open', {
        method: 'POST',
        body: JSON.stringify({ method: 'GET', path: record.path }),
      })
      setTrial(data.trial)
      setCanaryToken(data.trial?.canary_token || '')
      setMessage('Limited test started. The route remains blocked for normal traffic.')
    } catch (err) {
      setError(err.message || 'Could not start the limited test.')
    } finally {
      setBusy('')
    }
  }

  async function refreshStatus() {
    setBusy('status')
    setError('')
    try {
      const data = await ownerRequest(`/api/admin/work/kill-switches/half-open?${targetParams(record)}`)
      setTrial(data.trial)
    } catch (err) {
      setError(err.message || 'Could not read the test status.')
    } finally {
      setBusy('')
    }
  }

  async function testRequest() {
    if (!canaryToken || trial?.state !== 'testing') return
    const suffix = query.trim()
    if (suffix && (!suffix.startsWith('?') || suffix.includes('#'))) {
      setError('Optional test parameters must start with ? and must not include #.')
      return
    }
    setBusy('test')
    setError('')
    setMessage('')
    try {
      const token = adminToken()
      if (!token) throw new Error('Admin session missing. Sign in again.')
      const response = await fetch(`${API_URL}${record.path}${suffix}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Shadow-Circuit-Canary': canaryToken,
        },
      })
      setMessage(`Test HTTP ${response.status}. Check the test status and actual backend metrics before approving release.`)
      if (!response.ok) setError(`Test returned HTTP ${response.status}. The Kill Switch remains ON.`)
    } catch (err) {
      setError(err.message || 'Test request failed; the Kill Switch remains ON.')
    }
    try {
      const data = await ownerRequest(`/api/admin/work/kill-switches/half-open?${targetParams(record)}`)
      setTrial(data.trial)
    } catch (err) {
      setError(err.message || 'Test status could not be confirmed. Do not release.')
    } finally {
      setBusy('')
    }
  }

  async function release() {
    if (!ready || !reviewedMetrics || reason.trim().length < 12) return
    if (!window.confirm(`Release ${record.method} ${record.path} for ALL users? Confirm the bug is repaired and request/Supabase metrics are safe.`)) return
    setBusy('release')
    setError('')
    setMessage('')
    try {
      await ownerRequest('/api/admin/work/kill-switches', {
        method: 'PUT',
        body: JSON.stringify({
          target_type: record.target_type,
          source: record.source,
          method: record.method,
          path: record.path,
          enabled: false,
          approved: true,
          mode: record.mode,
          reason: reason.trim(),
          incident_id: record.incident_id || null,
          expires_at: null,
        }),
      })
      setCanaryToken('')
      setTrial(null)
      setMessage('Owner release confirmed. The route can now accept normal traffic.')
      if (onReleased) await onReleased()
    } catch (err) {
      setError(err.message || 'Release failed; the Kill Switch remains ON.')
    } finally {
      setBusy('')
    }
  }

  return (
    <section style={boxStyle} aria-label="Critical circuit recovery">
      <strong style={{ color: '#991b1b' }}>Critical circuit: owner-controlled recovery</strong>
      {!eligible ? (
        <p style={{ margin: 0, color: '#92400e' }}>
          Half-open testing currently supports only exact GET API routes. This circuit stays ON; do not use the normal toggle to bypass the recovery check.
        </p>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 13 }}>Run at most 5 authenticated owner-only GET requests within 5 minutes. Two successful responses permit review, but do not prove that request volume or Supabase usage is safe.</p>
          <label style={{ fontSize: 13 }}>Optional test query (for example ?limit=1)
            <input style={inputStyle} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="?limit=1" disabled={Boolean(busy)} />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={buttonStyle} disabled={Boolean(busy)} onClick={startTrial}>{busy === 'start' ? 'Starting…' : 'Start / Restart limited test'}</button>
            <button type="button" style={buttonStyle} disabled={Boolean(busy) || !canaryToken || trial?.state !== 'testing'} onClick={testRequest}>{busy === 'test' ? 'Testing…' : 'Send one test GET'}</button>
            <button type="button" style={buttonStyle} disabled={Boolean(busy) || !trial} onClick={refreshStatus}>Refresh test status</button>
          </div>
          {trial && (
            <div style={{ fontSize: 13 }} role="status">
              State: <strong>{trial.state}</strong> · Successes: {trial.successes}/{trial.min_successes} · Attempts: {trial.attempts}/{trial.max_requests} · Expires: {new Date(trial.expires_at).toLocaleString()}
            </div>
          )}
          {ready && (
            <>
              <label style={{ fontSize: 13 }}>Repair / release reason (minimum 12 characters)
                <textarea style={{ ...inputStyle, minHeight: 66, resize: 'vertical' }} value={reason} onChange={(event) => setReason(event.target.value)} disabled={Boolean(busy)} placeholder="Describe the fix and verification" />
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={reviewedMetrics} onChange={(event) => setReviewedMetrics(event.target.checked)} disabled={Boolean(busy)} />
                I verified the repair and checked current request, error and Supabase usage outside this limited HTTP test.
              </label>
              <button type="button" style={{ ...buttonStyle, background: '#991b1b', color: '#fff' }} disabled={Boolean(busy) || reason.trim().length < 12 || !reviewedMetrics} onClick={release}>Owner approve full release</button>
            </>
          )}
        </>
      )}
      {error && <p role="alert" style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{error}</p>}
      {message && <p role="status" style={{ margin: 0, color: '#166534', fontSize: 13 }}>{message}</p>}
    </section>
  )
}
