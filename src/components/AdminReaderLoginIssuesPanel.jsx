import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

export default function AdminReaderLoginIssuesPanel() {
  const [hours, setHours] = useState(24)
  const [refreshKey, setRefreshKey] = useState(0)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
    if (!token) {
      setError('Admin session is required.')
      return () => controller.abort()
    }
    setLoading(true)
    setError('')
    fetch(`${API_URL}/api/admin/reader-health/login-issues?hours=${hours}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}))
      if (!response.ok || body.ok !== true) throw new Error(body.message || body.code || 'Unable to load login issues.')
      return body.report
    }).then((value) => {
      if (!controller.signal.aborted) setReport(value)
    }).catch((failure) => {
      if (!controller.signal.aborted) {
        setReport(null)
        setError(failure?.message || 'Unable to load login issues.')
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [hours, refreshKey])

  const issues = Array.isArray(report?.issues) ? report.issues : []

  return (
    <section className="sc-block" aria-label="Reader Login Issues">
      <div className="sc-block-head" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div className="sc-block-title-wrap">
          <span className="sc-icon blue">LI</span>
          <div>
            <div className="sc-block-title">Reader Login Issues</div>
            <div className="sc-block-subtitle">Monitor only · No automatic session changes · Deduplicated reports</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sc-detail-btn" type="button" onClick={() => setHours(24)} disabled={loading}>24h</button>
          <button className="sc-detail-btn" type="button" onClick={() => setHours(168)} disabled={loading}>7d</button>
          <button className="sc-detail-btn" type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
        </div>
      </div>
      {error ? <div className="sc-empty" role="alert">{error}</div> : null}
      {!error && report ? (
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            {Number(report.affected_users || 0).toLocaleString()} identified accounts · {Number(report.observations || 0).toLocaleString()} recorded issue reports · {Number(report.dropped_since_restart || 0).toLocaleString()} dropped since Backend restart
          </div>
          {issues.length === 0 ? <div className="sc-empty">No recorded login issues in this period.</div> : null}
          {issues.map((issue) => (
            <div key={issue.error_code} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, background: '#FFFFFF', display: 'grid', gap: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong style={{ fontSize: 12, color: '#0F172A' }}>{issue.error_code}</strong>
                <span style={{ fontSize: 11, color: issue.classification === 'COMMON' ? '#B45309' : '#64748B' }}>
                  {issue.classification === 'COMMON' ? 'Common Issue (11+ in 24h)' : issue.classification === 'HISTORICAL' ? 'Historical group' : 'Individual / Unidentified'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748B' }}>
                {Number(issue.affected_users || 0)} identified accounts · {Number(issue.affected_users_last_24h || 0)} in 24h · {Number(issue.observations || 0)} observations · {issue.sources}
              </div>
              {issue.classification !== 'COMMON' && Array.isArray(issue.users) && issue.users.length ? (
                <div style={{ fontSize: 12, color: '#0F172A', overflowWrap: 'anywhere' }}>
                  {issue.users.map((user) => `@${String(user.username || 'Unknown').replace(/^@/, '')}`).join(', ')}
                </div>
              ) : null}
              {Number(issue.unidentified_observations || 0) > 0 ? (
                <div style={{ fontSize: 11, color: '#64748B' }}>
                  {issue.unidentified_observations} reports could not be attributed to a verified reader.
                </div>
              ) : null}
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#64748B' }}>
            Counts are best-effort observations, not all login attempts. Unknown identifiers are never stored. Monitoring does not recover sessions or override security limits.
          </div>
        </div>
      ) : null}
    </section>
  )
}
