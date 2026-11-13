import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { ResourceCostTrend, ResourceCostTrafficSplit, ResourceCostTopDrivers } from '../components/ResourceCostVisuals'
import { loadResourceCostSummary, downloadResourceCostReport, formatResourceBytes, formatResourceCount, resourceCostDateToday } from '../services/resourceCostApi'
import '../styles/adminResourceCost.css'

const periods = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Dates' },
]
const exports = [
  { value: 'full-zip', title: 'Complete Report', subtitle: 'ZIP · All available evidence' },
  { value: 'daily-csv', title: 'Daily Breakdown', subtitle: 'CSV · Daily provider totals' },
  { value: 'weekly-csv', title: 'Weekly Breakdown', subtitle: 'CSV · Weekly usage totals' },
  { value: 'monthly-csv', title: 'Monthly Breakdown', subtitle: 'CSV · Monthly usage totals' },
  { value: 'provider-csv', title: 'Provider Metrics', subtitle: 'CSV · Supabase / Cloudflare R2' },
  { value: 'upload-csv', title: 'Upload Route Audit', subtitle: 'CSV · Direct / Proxy paths' },
  { value: 'api-csv', title: 'API Attribution', subtitle: 'CSV · Observed app payloads' },
  { value: 'evidence-json', title: 'Full Evidence', subtitle: 'JSON · Detailed source status' },
]

function metricValue(report, provider, predicate) {
  const metrics = report?.totals?.provider_metrics || []
  const candidate = metrics.find((metric) => metric.provider === provider && predicate(metric) && metric.value !== null && metric.value !== undefined && metric.samples > 0)
  return candidate || null
}

function valueForRender(day, name = 'total_bytes') {
  if (!Number(day?.render?.observed_service_hours)) return '—'
  return formatResourceBytes(day.render[name])
}

function renderCoverage(coverage) {
  const labels = {
    complete: 'Complete', partial: 'Partial', partial_breakdown: 'Partial breakdown',
    pending_provider_data: 'Pending', missing: 'Missing', unknown_services: 'Service IDs unknown',
  }
  return labels[coverage] || 'Not verified'
}

function Badge({ state, children }) {
  return <span className={`rc-pill rc-pill-${state}`}>{children}</span>
}

function InfoCard({ title, value, note, tone = 'purple' }) {
  return <div className={`rc-stat rc-stat-${tone}`}>
    <div className="rc-stat-heading">{title}<span className="rc-stat-indicator" /></div>
    <strong className="rc-stat-value">{value}</strong>
    <div className="rc-stat-note">{note}</div>
  </div>
}

export default function AdminResourceCostPage() {
  const [period, setPeriod] = useState('today')
  const [from, setFrom] = useState(resourceCostDateToday)
  const [to, setTo] = useState(resourceCostDateToday)
  const [reload, setReload] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState('')
  const [error, setError] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [showAllDays, setShowAllDays] = useState(false)
  const [providerFilter, setProviderFilter] = useState('all')

  const request = useMemo(() => ({ period, from, to }), [period, from, to])
  const validDates = period !== 'custom' || Boolean(from && to && from <= to)
  useEffect(() => {
    if (!validDates) {
      setError('Choose a valid date range.')
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setResult(null)
    loadResourceCostSummary(request, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setResult(data) })
      .catch((problem) => {
        if (!controller.signal.aborted) setError(problem?.message || 'Unable to load resource usage.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [request, reload, validDates])

  const report = result?.report || null
  const days = report?.days || []
  const totals = report?.totals || null
  const render = totals?.render || null
  const renderRecorded = Number(report?.sources?.render?.rows) > 0
  const supabase = metricValue(report, 'supabase', (metric) => metric.unit === 'bytes' && /egress|bandwidth/i.test(metric.metric))
  const r2Storage = metricValue(report, 'cloudflare_r2', (metric) => metric.unit === 'bytes' && /storage/i.test(metric.metric))
  const proxyRoutes = days.flatMap((day) => day.upload_audit?.by_route || []).filter((route) => route.upload_mode === 'proxy')
  const proxyBytes = proxyRoutes.reduce((sum, route) => sum + (Number(route.ingress_bytes) || 0), 0)
  const proxyAttempts = proxyRoutes.reduce((sum, route) => sum + (Number(route.attempts) || 0), 0)
  const uploadAudited = Number(report?.sources?.upload?.rows) > 0
  const allRoutes = useMemo(() => {
    const grouped = new Map()
    for (const day of days) for (const item of day.upload_audit?.by_route || []) {
      const key = `${item.feature}|${item.route}|${item.upload_mode}`
      const row = grouped.get(key) || { feature: item.feature, route: item.route, upload_mode: item.upload_mode, attempts: 0, successes: 0, failures: 0, ingress_bytes: 0, egress_bytes: 0, object_bytes: 0 }
      for (const field of ['attempts', 'successes', 'failures', 'ingress_bytes', 'egress_bytes', 'object_bytes']) row[field] += Number(item[field]) || 0
      grouped.set(key, row)
    }
    return [...grouped.values()].sort((a, b) => b.ingress_bytes + b.egress_bytes - a.ingress_bytes - a.egress_bytes).slice(0, 12)
  }, [days])
  const coverage = render?.expected_service_hours > 0
    ? Math.min(100, Math.round((render.observed_service_hours || 0) / render.expected_service_hours * 100))
    : null
  const providerMetrics = (totals?.provider_metrics || []).filter((row) => providerFilter === 'all' || row.provider === providerFilter)
  const visibleDays = showAllDays ? [...days].reverse() : [...days].reverse().slice(0, 8)
  const insights = [
    {
      title: 'Render coverage',
      note: renderRecorded ? `${renderCoverage(render?.coverage)} · ${formatResourceCount(render.observed_service_hours)} of ${formatResourceCount(render.expected_service_hours)} expected service-hours` : 'No stored provider records for this range',
      state: render?.coverage === 'complete' ? 'good' : 'watch',
    },
    {
      title: 'Service-initiated traffic',
      note: render?.service_initiated_bytes !== null && render?.http_response_bytes !== null && renderRecorded
        ? `${formatResourceBytes(render.service_initiated_bytes)} service-initiated vs ${formatResourceBytes(render.http_response_bytes)} HTTP responses`
        : 'Breakdown is incomplete or unavailable',
      state: renderRecorded && render?.service_initiated_bytes > render?.http_response_bytes ? 'watch' : 'neutral',
    },
    {
      title: 'Image upload route',
      note: !uploadAudited ? 'Audit data not connected. No upload path verified yet.' : proxyAttempts ? `${formatResourceCount(proxyAttempts)} proxy attempts observed · ${formatResourceBytes(proxyBytes)} received by backend` : 'No proxy attempts found in the stored audit records',
      state: !uploadAudited ? 'watch' : proxyAttempts ? 'investigate' : 'good',
    },
    {
      title: 'Application attribution',
      note: report?.sources?.application?.note || 'Application detail may be incomplete',
      state: report?.sources?.application?.status === 'partial_attribution' ? 'watch' : 'neutral',
    },
  ]

  const handleDownload = useCallback(async (format, options = request) => {
    if (downloading) return
    try {
      setExportOpen(false)
      setDownloading(format)
      setError('')
      await downloadResourceCostReport(options, format)
    } catch (problem) {
      setError(problem?.message || 'Report download failed.')
    } finally {
      setDownloading('')
    }
  }, [downloading, request])

  return <AdminLayout title="Resource & Cost" subtitle="Daily, weekly and monthly infrastructure usage summaries with downloadable evidence.">
    <div className="rc-page">
      <div className="rc-toolbar">
        <div className="rc-range-controls">
          <label className="rc-field-label" htmlFor="rc-period">Reporting period</label>
          <select id="rc-period" value={period} onChange={(event) => { setPeriod(event.target.value); setShowAllDays(false) }}>
            {periods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {period === 'custom' ? <div className="rc-dates">
            <input aria-label="Start date" type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} />
            <span>to</span>
            <input aria-label="End date" type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} />
          </div> : null}
          <span className="rc-update">{report ? `Generated ${new Date(report.generated_at).toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })} (ICT)` : 'Not loaded'}</span>
        </div>
        <div className="rc-buttons">
          <button type="button" className="rc-btn rc-btn-primary" disabled={!report || downloading || loading} onClick={() => handleDownload('full-zip')}>{downloading === 'full-zip' ? 'Preparing…' : '↓ Download ZIP'}</button>
          <div className="rc-export-wrap">
            <button type="button" className="rc-btn" disabled={!report || Boolean(downloading) || loading} onClick={() => setExportOpen((value) => !value)}>Export options ▾</button>
            {exportOpen && <div className="rc-export-menu">{exports.map((item) => <button type="button" key={item.value} onClick={() => handleDownload(item.value)}><strong>{item.title}</strong><small>{item.subtitle}</small></button>)}</div>}
          </div>
          <button type="button" className="rc-btn" onClick={() => setReload((value) => value + 1)} disabled={loading}>↻ Refresh view</button>
        </div>
      </div>

      {error && <div className="rc-error" role="alert">{error}</div>}
      {!report && <div className="rc-loading">{loading ? 'Loading stored provider summaries…' : 'Resource & Cost report is unavailable.'}</div>}
      {report && <>
        <div className="rc-stats">
          <InfoCard title="Render outbound" value={renderRecorded ? formatResourceBytes(render.total_bytes) : '—'} note={`Provider-measured · ${renderCoverage(render?.coverage)}`} />
          <InfoCard title="Service-initiated" value={renderRecorded ? formatResourceBytes(render?.service_initiated_bytes) : '—'} note="Render outbound category · Partial where coverage is missing" tone="violet" />
          <InfoCard title="Supabase egress" value={supabase ? formatResourceBytes(supabase.value) : '—'} note={supabase ? 'Observed provider metric · Not added to Render' : 'Egress provider metric not yet stored'} tone="green" />
          <InfoCard title="Cloudflare R2 storage" value={r2Storage ? formatResourceBytes(r2Storage.value) : '—'} note={r2Storage ? 'Latest stored storage measurement' : 'Storage metric not yet stored'} tone="orange" />
          <InfoCard title="Verified invoice cost" value={totals.invoiced_cost_usd === null ? '—' : `$${Number(totals.invoiced_cost_usd).toFixed(2)}`} note="No invoice data = unknown, not free" tone="rose" />
        </div>

        <div className="rc-main-charts">
          <section className="rc-panel rc-trend-panel"><div className="rc-panel-head"><div><h2>Daily Render Trend</h2><p>Provider outbound usage in the selected reporting range</p></div><Badge state={render?.coverage === 'complete' ? 'good' : 'watch'}>{renderCoverage(render?.coverage)}</Badge></div><ResourceCostTrend days={days} /></section>
          <section className="rc-panel"><div className="rc-panel-head"><div><h2>Render Traffic Split</h2><p>Measured outgoing categories, not provider totals added together</p></div></div><ResourceCostTrafficSplit render={render} hasSource={renderRecorded} /></section>
          <section className="rc-panel"><div className="rc-panel-head"><div><h2>Top API Drivers</h2><p>Ranked by observed payload bytes</p></div></div><ResourceCostTopDrivers days={days} attributionStatus={report.sources?.application?.status} /></section>
        </div>

        <section className="rc-panel"><div className="rc-panel-head"><div><h2>Usage Insights</h2><p>Important signals only · No per-minute activity feed</p></div>{coverage !== null ? <Badge state={coverage === 100 ? 'good' : 'watch'}>{coverage}% Render hours covered</Badge> : <Badge state="watch">Coverage unknown</Badge>}</div><div className="rc-insights">{insights.map((item) => <div className="rc-insight" key={item.title}><div className="rc-insight-top"><strong>{item.title}</strong><Badge state={item.state}>{item.state === 'good' ? 'Recorded' : item.state === 'investigate' ? 'Investigate' : item.state === 'watch' ? 'Review' : 'Info'}</Badge></div><p>{item.note}</p></div>)}</div></section>

        <div className="rc-lower-grid"><section className="rc-panel"><div className="rc-panel-head"><div><h2>Upload Route Audit</h2><p>Direct R2, Render proxy and background operations</p></div><Badge state={uploadAudited ? 'good' : 'watch'}>{uploadAudited ? 'Observed' : 'No audit records'}</Badge></div><div className="rc-table-scroll"><table className="rc-table"><thead><tr><th>Feature / Route</th><th>Mode</th><th>Attempts</th><th>Incoming</th><th>Object bytes</th></tr></thead><tbody>{allRoutes.map((row) => <tr key={`${row.feature}-${row.route}-${row.upload_mode}`}><td><strong>{row.feature}</strong><small>{row.route}</small></td><td><Badge state={row.upload_mode === 'proxy' ? 'investigate' : row.upload_mode === 'direct' ? 'good' : 'neutral'}>{row.upload_mode}</Badge></td><td>{formatResourceCount(row.attempts)}</td><td>{formatResourceBytes(row.ingress_bytes)}</td><td>{formatResourceBytes(row.object_bytes)}</td></tr>)}{!allRoutes.length && <tr><td colSpan="5" className="rc-no-rows">No upload events have been connected to the new audit yet.</td></tr>}</tbody></table></div></section>
        <section className="rc-panel"><div className="rc-panel-head"><div><h2>Downloadable Reports</h2><p>Export concise evidence for independent review</p></div></div><div className="rc-download-list">{exports.slice(1, 7).map((item) => <button type="button" key={item.value} disabled={Boolean(downloading)} onClick={() => handleDownload(item.value)}><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="rc-download-icon">↓</span></button>)}</div></section></div>

        <section className="rc-panel"><div className="rc-panel-head"><div><h2>Daily Breakdown</h2><p>Cambodia dates · Render bytes are not summed with Supabase or R2 bytes</p></div><span className="rc-subtle">{days.length} days</span></div><div className="rc-table-scroll"><table className="rc-table"><thead><tr><th>Date</th><th>Render total</th><th>HTTP responses</th><th>Service-initiated</th><th>Coverage</th><th>Upload attempts</th><th>Report</th></tr></thead><tbody>{visibleDays.map((day) => <tr key={day.date}><td><strong>{day.date}</strong></td><td>{valueForRender(day)}</td><td>{valueForRender(day, 'http_response_bytes')}</td><td>{valueForRender(day, 'service_initiated_bytes')}</td><td><Badge state={day.render.coverage === 'complete' ? 'good' : 'watch'}>{renderCoverage(day.render.coverage)}</Badge></td><td>{uploadAudited ? formatResourceCount(day.upload_audit?.attempts) : '—'}</td><td><button className="rc-text-btn" type="button" disabled={Boolean(downloading)} onClick={() => handleDownload('full-zip', { period: 'custom', from: day.date, to: day.date })}>↓ ZIP</button></td></tr>)}</tbody></table></div>{days.length > 8 && <button type="button" className="rc-more" onClick={() => setShowAllDays((value) => !value)}>{showAllDays ? 'Show fewer days' : `Show all ${days.length} days`}</button>}</section>

        <section className="rc-panel"><div className="rc-panel-head"><div><h2>Provider Evidence</h2><p>Stored measurements, source coverage and reconciliation</p></div><select aria-label="Provider filter" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}><option value="all">All providers</option><option value="supabase">Supabase</option><option value="cloudflare_r2">Cloudflare R2</option></select></div><div className="rc-table-scroll"><table className="rc-table"><thead><tr><th>Provider</th><th>Metric</th><th>Value</th><th>Samples</th><th>Incomplete</th></tr></thead><tbody>{providerMetrics.slice(0, 20).map((metric) => <tr key={metric.identity}><td>{metric.provider}</td><td><strong>{metric.metric}</strong><small>{metric.scope} · {metric.aggregation}</small></td><td>{metric.value === null ? '—' : metric.unit === 'bytes' ? formatResourceBytes(metric.value) : `${formatResourceCount(metric.value)} ${metric.unit}`}</td><td>{formatResourceCount(metric.samples)}</td><td>{formatResourceCount(metric.incomplete_samples)}</td></tr>)}{!providerMetrics.length && <tr><td colSpan="5" className="rc-no-rows">No provider observations stored for the selected period.</td></tr>}</tbody></table></div></section>
        <div className="rc-disclaimer"><strong>How to interpret this report:</strong> Render totals come from stored provider measurements. Supabase, R2 and application counters use different billing units and may overlap; they must not be added into one bandwidth number. Missing hours and missing measurements are not zero. Invoice costs remain unavailable until verified.</div>
      </>}
    </div>
  </AdminLayout>
}
