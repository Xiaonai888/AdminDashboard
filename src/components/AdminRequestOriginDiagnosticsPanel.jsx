import React, { useMemo, useState } from 'react'

const formatNumber = (value) => Math.max(0, Number(value) || 0).toLocaleString()
const formatTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString()
}
const formatWindow = (value) => Number(value) === 10000 ? '10 seconds' : '60 seconds'

export default function AdminRequestOriginDiagnosticsPanel({ snapshot, loading = false }) {
  const [pageFilter, setPageFilter] = useState('ALL')
  const [showUnattributedOnly, setShowUnattributedOnly] = useState(false)
  const report = snapshot && typeof snapshot === 'object' ? snapshot : null
  const rows = useMemo(() => Array.isArray(report?.rows) ? report.rows : [], [report])
  const visibleRows = useMemo(() => rows.filter((row) =>
    (pageFilter === 'ALL' || row.page === pageFilter) &&
    (!showUnattributedOnly || row.source_file === 'UNATTRIBUTED')
  ), [rows, pageFilter, showUnattributedOnly])
  const totalReports = rows.reduce((sum, row) => sum + (Number(row.reports) || 0), 0)
  const totalInvocations = rows.reduce((sum, row) => sum + (Number(row.observed_fetch_invocations_in_reported_windows) || 0), 0)

  return (
    <section className="sc-block" aria-label="Request Origin Diagnostics">
      <div className="sc-block-head">
        <div className="sc-block-title-wrap">
          <span className="sc-icon blue">O</span>
          <div>
            <div className="sc-block-title">Request Origin Diagnostics</div>
            <div className="sc-block-subtitle">Discover &amp; Reader · Sampled client anomaly signals · Existing System Control snapshot</div>
          </div>
        </div>
        <span className="sc-pill low">Read-only</span>
      </div>

      {!report ? (
        <div className="sc-empty">{loading ? 'Loading request origin snapshot…' : 'Request origin diagnostics not available in the snapshot yet.'}</div>
      ) : (
        <div style={{ padding: 14, display: 'grid', gap: 14 }}>
          <div className="sua-summary">
            {[
              ['Anomaly groups', report.group_count],
              ['Received reports in shown groups', totalReports],
              ['Observed fetch calls in reported windows', totalInvocations],
              ['Source unknown (reports)', report.coverage?.source_unattributed],
            ].map(([label, value]) => (
              <div className="sua-card" key={label}>
                <div className="sua-card-label">{label}</div>
                <div className="sua-card-value" style={{ fontSize: 19 }}>{formatNumber(value)}</div>
              </div>
            ))}
          </div>

          <div className="sc-block-subtitle">
            Last {formatNumber(report.window_minutes || 60)} minutes · {formatNumber(report.windows_observed)} observed minute windows · {Math.round((Number(report.sampling_rate) || 0) * 100)}% browser sampling · Memory only
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="sc-block-subtitle">Page</span>
              <select
                aria-label="Filter request origin page"
                value={pageFilter}
                onChange={(event) => setPageFilter(event.target.value)}
                style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '7px 9px', color: 'inherit', background: 'var(--shadow-bg-primary, #fff)' }}
              >
                <option value="ALL">All</option>
                <option value="DISCOVER">Discover</option>
                <option value="READER">Reader</option>
              </select>
            </label>
            <label style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={showUnattributedOnly}
                onChange={(event) => setShowUnattributedOnly(event.target.checked)}
              />
              Unattributed sources only
            </label>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 10 }}>
            <table className="sua-table">
              <thead>
                <tr>
                  <th>Page / API</th>
                  <th>Source file</th>
                  <th>Trigger</th>
                  <th>Reports</th>
                  <th>Fetch invocations</th>
                  <th>Hidden / Errors</th>
                  <th>Window / Build</th>
                  <th>Last observed</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={`${row.page}:${row.method}:${row.route}:${row.source_file}:${row.trigger}:${row.build}:${index}`}>
                    <td style={{ minWidth: 175, overflowWrap: 'anywhere' }}>
                      <strong>{row.page}</strong>
                      <div style={{ fontSize: 11 }}>{row.method} {row.route}</div>
                    </td>
                    <td style={{ minWidth: 180, overflowWrap: 'anywhere' }}>{row.source_file === 'UNATTRIBUTED' ? 'Source not identified yet' : row.source_file}</td>
                    <td>{row.trigger === 'unknown' ? 'Unknown' : row.trigger}</td>
                    <td>{formatNumber(row.reports)}</td>
                    <td>{formatNumber(row.observed_fetch_invocations_in_reported_windows)}</td>
                    <td>{formatNumber(row.client_reported_hidden)} / {formatNumber(row.client_reported_errors)}</td>
                    <td style={{ minWidth: 115 }}>
                      {formatWindow(row.shortest_window_ms)}
                      <div style={{ fontSize: 11 }}>{row.build || 'unknown'}</div>
                    </td>
                    <td style={{ minWidth: 135 }}>{formatTime(row.last_seen_at)}</td>
                  </tr>
                ))}
                {!visibleRows.length && (
                  <tr><td colSpan={8}>{rows.length ? 'No results for the selected filters.' : 'No sampled request anomalies reported yet.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="sc-block-subtitle">
            These counts are sampled reports of possibly overlapping browser fetch invocations, not exact backend HTTP requests or confirmed bugs. Source and trigger are client-declared. The current collector may show UNATTRIBUTED and unknown until source-specific calls are connected.
            {report.detail_capped ? ' Displayed groups are capped.' : ''}
            {report.coverage?.dropped_group_observations ? ` ${formatNumber(report.coverage.dropped_group_observations)} groups exceeded memory capacity.` : ''}
            {report.coverage?.rejected_reports ? ` ${formatNumber(report.coverage.rejected_reports)} reports were rejected by validation.` : ''}
          </div>
        </div>
      )}
    </section>
  )
}
