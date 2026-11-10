import React, { useCallback, useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const TEXT = '#0F172A'
const MUTED = '#64748B'
const BORDER = '1px solid #E2E8F0'
const EVENT_LABELS = {
  js_error: 'JavaScript error',
  promise_rejection: 'Unhandled promise rejection',
  script_load_failure: 'Script or app file failed',
  long_task: 'Long main-thread task',
  event_loop_delay: 'Suspected UI stall',
  slow_api: 'Slow API response',
  slow_boot: 'Slow page startup',
}

const count = (value) => Math.max(0, Number(value) || 0).toLocaleString()

function Metric({ label, value, description }) {
  return (
    <div style={{ border: BORDER, borderRadius: 12, padding: 12, minWidth: 0, background: '#FFFFFF' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 850, color: TEXT, marginTop: 5 }}>{value}</div>
      <div style={{ fontSize: 10, color: MUTED, marginTop: 5, lineHeight: 1.5 }}>{description}</div>
    </div>
  )
}

function DataTable({ title, columns, rows, render }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: TEXT }}>{title}</div>
      <div style={{ border: BORDER, borderRadius: 12, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 490, fontSize: 11 }}>
          <thead style={{ background: '#F8FAFC' }}>
            <tr>{columns.map((column) => <th key={column} style={{ textAlign: 'left', padding: 10, color: MUTED, borderBottom: BORDER }}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={index} style={{ borderBottom: index + 1 === rows.length ? 'none' : BORDER }}>
                {render(row).map((cell, cellIndex) => <td key={cellIndex} style={{ padding: 10, color: TEXT, overflowWrap: 'anywhere' }}>{cell}</td>)}
              </tr>
            )) : <tr><td colSpan={columns.length} style={{ padding: 12, color: MUTED }}>No reported events in this window.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminReaderHealthPanel() {
  const [hours, setHours] = useState(24)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshIndex, setRefreshIndex] = useState(0)

  const refresh = useCallback(() => setRefreshIndex((previous) => previous + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
    if (!token) {
      setError('Admin token is missing.')
      setReport(null)
      return () => controller.abort()
    }
    setLoading(true)
    setError('')
    fetch(`${API_URL}/api/admin/system-control/reader-health?hours=${hours}`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}))
      if (!response.ok || body.ok !== true) throw new Error(body.message || body.code || 'Reader Health request failed')
      return body.report
    }).then((data) => {
      if (!controller.signal.aborted) setReport(data)
    }).catch((failure) => {
      if (controller.signal.aborted) return
      setReport(null)
      setError(failure?.message || 'Reader Health request failed')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [hours, refreshIndex])

  const totals = report?.totals || {}
  const categories = Array.isArray(report?.categories) ? report.categories : []
  const pages = Array.isArray(report?.pages) ? report.pages : []
  const browsers = Array.isArray(report?.browsers) ? report.browsers : []
  const signatures = Array.isArray(report?.signatures) ? report.signatures : []

  return (
    <section className="sc-block" aria-label="Reader Health Monitoring">
      <div className="sc-block-head" style={{ gap: 10, flexWrap: 'wrap' }}>
        <div className="sc-block-title-wrap">
          <span className="sc-icon blue">RH</span>
          <div>
            <div className="sc-block-title">Reader Health Monitoring</div>
            <div className="sc-block-subtitle">Issue-only reports · No idle heartbeat · 10% sampled performance signals</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[1, 6, 24, 168].map((item) => (
            <button key={item} type="button" className="sc-detail-btn" onClick={() => setHours(item)}
              aria-pressed={hours === item} style={{ fontWeight: hours === item ? 850 : 600 }}>
              {item === 168 ? '7d' : `${item}h`}
            </button>
          ))}
          <button type="button" className="sc-detail-btn" disabled={loading} onClick={refresh}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? <div className="sc-empty" role="alert">{error}</div> : null}
      {!error && report?.available === false ? (
        <div className="sc-empty">Reader Health SQL is not installed or cannot be queried. Check Backend installation and permissions. Status: {report.status || 'unavailable'}.</div>
      ) : null}
      {!error && !report && !loading ? <div className="sc-empty">No Reader Health report available.</div> : null}
      {report?.available ? (
        <div style={{ display: 'grid', gap: 16, padding: 14 }}>
          <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
            Last {hours === 168 ? '7 days' : `${hours} hours`} · {count(totals.event_count)} browser events · Observations are incomplete and do not prove the cause of a freeze.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', gap: 9 }}>
            <Metric label="Observed affected sessions" value={count(totals.affected_sessions_observed)} description="Reported issues, sampled and critical; not a count of people" />
            <Metric label="Confirmed error sessions" value={count(totals.confirmed_error_sessions)} description="JavaScript, promise or app file errors" />
            <Metric label="Slowdown signal sessions" value={count(totals.slowdown_signal_sessions)} description="Timing warnings; may not be true freezes" />
            <Metric label="Suspected stall events" value={count(totals.suspected_freeze_events)} description="Browser event-loop delays, not verified hard freezes" />
          </div>
          <DataTable title="Issue categories" columns={['Signal', 'Events', 'Affected sessions', 'Longest']} rows={categories}
            render={(row) => [EVENT_LABELS[row.event_type] || row.event_type, count(row.event_count), count(row.affected_sessions), row.max_metric_ms ? `${count(row.max_metric_ms)} ms` : '—']} />
          <DataTable title="Most affected pages" columns={['Page', 'Events', 'Affected sessions', 'Error events']} rows={pages}
            render={(row) => [row.page_group, count(row.event_count), count(row.affected_sessions), count(row.error_events)]} />
          <DataTable title="Browser and device combinations" columns={['Browser', 'OS', 'Device', 'Sessions']} rows={browsers}
            render={(row) => [row.browser, row.os, row.device, count(row.affected_sessions)]} />
          <DataTable title="Repeated error fingerprints" columns={['Type', 'Page', 'Fingerprint', 'Sessions']} rows={signatures}
            render={(row) => [EVENT_LABELS[row.event_type] || row.event_type, row.page_group, row.fingerprint || '—', count(row.affected_sessions)]} />
          <div style={{ color: MUTED, fontSize: 11, lineHeight: 1.7 }}>
            Session counts are not unique people. No routine session records are sent, so an affected-user percentage cannot be calculated from this dataset alone. Performance signals are sampled at 10%, and critical JavaScript errors are captured outside the sample, with per-tab daily limits. Browser reports can be lost when a tab or device freezes completely. Error fingerprints contain no raw messages or private page IDs. Reports are retained until cleanup after subsequent incident writes.
          </div>
          <div style={{ color: MUTED, fontSize: 10 }}>
            Ingestion queue: {count(report.ingestion?.queued)} · Dropped since Backend restart: {count(report.ingestion?.events_dropped_since_restart)}
          </div>
        </div>
      ) : null}
    </section>
  )
}
