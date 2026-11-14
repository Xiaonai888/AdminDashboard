import React, { useMemo, useState } from 'react'

const formatNumber = (value) => Math.max(0, Number(value) || 0).toLocaleString()
const formatBytes = (value) => {
  const bytes = Math.max(0, Number(value) || 0)
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${Math.round(bytes)} B`
}

const signalLabels = {
  CLIENT_REPORTED_HIDDEN_ACTIVITY: 'Request from reported hidden tab',
  RAPID_REPEAT_SUSPECTED: 'Repeated GET requests from the same apparent client',
  PAGE_SOURCE_UNKNOWN: 'Originating page not identified',
  DETAIL_CAP_REACHED: 'Monitoring detail limit reached',
}

export default function AdminPassiveRequestMonitorPanel({ snapshot, loading = false }) {
  const [filter, setFilter] = useState('review')
  const report = snapshot && typeof snapshot === 'object' ? snapshot : null
  const totals = report?.totals || {}
  const rows = useMemo(() => Array.isArray(report?.rows) ? report.rows : [], [report])
  const shown = useMemo(() => filter === 'all'
    ? rows
    : rows.filter((row) => row.classification === 'REVIEW'), [rows, filter])

  return (
    <section className="sc-block" aria-label="Passive Request Monitoring">
      <div className="sc-block-head">
        <div className="sc-block-title-wrap">
          <span className="sc-icon blue">R</span>
          <div>
            <div className="sc-block-title">Passive Request Monitor</div>
            <div className="sc-block-subtitle">Analyzes existing HTTP traffic · No additional background fetches · Read-only</div>
          </div>
        </div>
        <span className="sc-pill low">Monitoring only</span>
      </div>

      {!report ? (
        <div className="sc-empty">{loading ? 'Loading existing System Control snapshot…' : 'No passive request monitoring data available yet.'}</div>
      ) : (
        <div style={{ display: 'grid', gap: 14, padding: 14 }}>
          <div className="sua-summary">
            {[
              ['Observed requests', formatNumber(totals.requests)],
              ['Client-reported hidden', formatNumber(totals.client_reported_hidden_requests)],
              ['Rapid repeats', formatNumber(totals.rapid_repeat_requests)],
              ['Supabase calls', formatNumber(totals.supabase_calls)],
            ].map(([label, value]) => (
              <div className="sua-card" key={label}>
                <div className="sua-card-label">{label}</div>
                <div className="sua-card-value" style={{ fontSize: 19 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="sc-block-subtitle">Last {formatNumber(report.window_minutes || 60)} minutes · {formatNumber(report.windows_observed)} observed minute windows</span>
            <select
              aria-label="Filter passive request monitoring"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '7px 9px', color: 'inherit', background: 'var(--shadow-bg-primary, #fff)' }}
            >
              <option value="review">Review signals</option>
              <option value="all">All observed routes</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 10 }}>
            <table className="sua-table">
              <thead><tr><th>Page / API route</th><th>Requests</th><th>Hidden</th><th>Repeats</th><th>Supabase</th><th>Data</th><th>Finding</th></tr></thead>
              <tbody>
                {shown.map((row) => (
                  <tr key={`${row.page}:${row.route}`}>
                    <td style={{ overflowWrap: 'anywhere', minWidth: 200 }}>
                      <strong>{row.page}</strong>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{row.route}</div>
                    </td>
                    <td>{formatNumber(row.requests)}</td>
                    <td>{formatNumber(row.client_reported_hidden_requests)}</td>
                    <td>{formatNumber(row.rapid_repeat_requests)}</td>
                    <td>{formatNumber(row.supabase_calls)}</td>
                    <td>{formatBytes(row.response_bytes)}</td>
                    <td style={{ minWidth: 200 }}>
                      {row.signals?.length ? row.signals.map((value) => (
                        <div key={value} style={{ fontSize: 11, marginBottom: 4 }}>{signalLabels[value] || value}</div>
                      )) : 'Observed; no review signal'}
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr><td colSpan={7}>No routes in this selection. This does not prove that no unnecessary requests occurred.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="sc-block-subtitle">
            The browser visibility signal is optional and client-reported. Rapid repeats are observations, not proof of polling or wasted work. Page attribution may be unknown. This panel never disables requests.
            {report.detail_capped ? ' Results are ranked and capped.' : ''}
            {report.coverage?.dropped_route_observations ? ' Route detail capacity was reached in some observed windows.' : ''}
          </div>
        </div>
      )}
    </section>
  )
}
