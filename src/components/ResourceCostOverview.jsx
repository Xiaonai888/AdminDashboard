import React, { useEffect, useMemo, useState } from 'react'
import { loadResourceCostOverview } from '../services/resourceCostOverviewApi'
import { formatResourceBytes, formatResourceCount } from '../services/resourceCostApi'
import '../styles/adminResourceCostOverview.css'

const PERIODS = [
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'last12months', label: 'Last 12 months' },
]
const SOURCES = [
  { key: 'all', label: 'All' },
  { key: 'web', label: 'Web' },
  { key: 'admin', label: 'Admin' },
]
const PROVIDERS = [
  { key: 'render', label: 'Render' },
  { key: 'supabase', label: 'Supabase' },
  { key: 'cloudflare_r2', label: 'Cloudflare R2' },
]
const CHARTS = {
  cost: {
    heading: 'Verified expense (USD)',
    note: 'Only invoice-verified amounts are shown. Missing periods are not zero.',
    color: 'linear-gradient(180deg,#34b58e 0%,#087e66 100%)',
  },
  render: {
    heading: 'Render outbound (not USD)',
    note: 'Provider-measured Render traffic. Partial periods are not full-day totals and cannot be added to API observations.',
    color: 'linear-gradient(180deg,#8b8bfd 0%,#5547ee 100%)',
  },
  api: {
    heading: 'Observed API traffic (not USD)',
    note: 'Application payload observations only. This is not provider billing or a complete Web/Admin traffic split.',
    color: 'linear-gradient(180deg,#ffa957 0%,#ed8231 100%)',
  },
}

function cambodiaToday() {
  return new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10)
}

function formatUsd(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) < 0) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(Number(value))
}

function validAmount(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null
}

function graphValue(row, source, metric) {
  if (metric === 'render') return validAmount(row?.render_outbound_bytes)
  if (metric === 'api') return validAmount(row?.sources?.[source]?.observed_api_bytes)
  if (metric === 'cost') return validAmount(row?.sources?.[source]?.verified_cost_usd)
  return null
}

function graphStatus(row, source, metric, value) {
  if (value === null) return 'Missing'
  if (metric === 'render') {
    const status = String(row?.coverage?.render_status || '').toLowerCase()
    return status === 'complete' ? 'Complete' : 'Partial'
  }
  if (metric === 'api') {
    const coverage = String(row?.coverage?.observed_usage_status || '').toLowerCase()
    return coverage === 'complete' ? 'Complete' : 'Observed'
  }
  return 'Verified'
}

function Chart({ rows, source, metric }) {
  const config = CHARTS[metric]
  const values = useMemo(() => rows.map((row) => graphValue(row, source, metric)), [rows, source, metric])
  const max = Math.max(0, ...values.filter((value) => value !== null))
  const available = values.filter((value) => value !== null).length
  const minWidth = Math.max(400, rows.length * 68)
  return <div className="rco-chart-wrap">
    <div className="rco-chart-heading">
      <strong>{config.heading}</strong>
      <span>{rows.length ? `${rows[0].label} – ${rows[rows.length - 1].label}` : 'No periods'} · {available}/{rows.length} recorded</span>
    </div>
    {rows.length ? <div className="rco-chart-scroll">
      <div className={`rco-chart-bars${rows.length > 14 ? ' rco-chart-dense' : ''}`} style={{ minWidth }} role="img" aria-label={`${config.heading}: ${available} of ${rows.length} periods recorded; missing values are not zero`}>
        {rows.map((row, index) => {
          const value = values[index]
          const percent = value === null ? 0 : max > 0 ? Math.max(3, value / max * 100) : 3
          const display = metric === 'cost' ? formatUsd(value) : formatResourceBytes(value)
          const status = graphStatus(row, source, metric, value)
          const statusColor = status === 'Missing' ? '#a34a55' : status === 'Partial' ? '#986414' : '#76849c'
          return <div key={row.date} className="rco-chart-column" title={`${row.date}: ${display} · ${status}`}>
            <div className="rco-chart-value">{display}</div>
            <div className="rco-chart-column-height">
              {value === null ? <span className="rco-chart-unavailable">—</span>
                : <span className="rco-chart-bar" style={{ height: `${percent}%`, background: config.color }} />}
            </div>
            <span className="rco-chart-label">{row.label}</span>
            <span style={{ fontSize: 9, color: statusColor, lineHeight: 1.2 }}>{status}</span>
          </div>
        })}
      </div>
    </div> : <div className="rco-chart-empty">No reporting periods available.</div>}
    <p className="rco-chart-note">{config.note}</p>
  </div>
}

export default function ResourceCostOverview({ refreshKey = 0 }) {
  const [period, setPeriod] = useState('last7')
  const [source, setSource] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [customRange, setCustomRange] = useState(null)
  const [inputError, setInputError] = useState('')
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    loadResourceCostOverview(period, controller.signal, period === 'custom' ? customRange : null)
      .then((data) => { if (!controller.signal.aborted) setOverview(data) })
      .catch((problem) => {
        if (!controller.signal.aborted) setError(problem?.message || 'Cost Overview unavailable.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [period, customRange?.from, customRange?.to, refreshKey])

  const total = overview?.totals?.[source]
  const shared = overview?.totals?.shared
  const rows = overview?.series || []
  const renderRows = rows.filter((row) => validAmount(row?.render_outbound_bytes) !== null)
  const renderBytes = renderRows.length ? renderRows.reduce((sum, row) => sum + Number(row.render_outbound_bytes), 0) : null
  const hasVerifiedDailyCost = rows.some((row) => graphValue(row, source, 'cost') !== null)
  const selectedPeriod = overview?.period?.mode === 'custom'
    ? `${overview.period.from_date} – ${overview.period.through_date}`
    : PERIODS.find((item) => item.key === (overview?.period?.mode || period))?.label || period
  const today = cambodiaToday()
  function applyCustomDate(event) {
    event.preventDefault()
    if (!fromDate || !toDate || fromDate > toDate || toDate > today ||
        (Date.parse(`${toDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) >= 370 * 86_400_000) {
      setInputError('Choose a valid range of up to 370 days, ending no later than today.')
      return
    }
    setInputError('')
    setCustomRange({ from: fromDate, to: toDate })
    setPeriod('custom')
  }
  const isKnownCost = validAmount(total?.verified_cost_usd) !== null
  return <section className="rco-panel" aria-label="Cost Overview">
    <div className="rco-heading">
      <div><h2>Cost Overview</h2><p>Daily / monthly periods · Cambodia time · stored observations</p></div>
      <span className={`rco-status${isKnownCost ? ' rco-status-recorded' : ''}`}>{loading ? 'Loading' : isKnownCost ? 'Verified cost' : 'Billing not verified'}</span>
    </div>
    <div className="rco-source-filters" role="group" aria-label="Expense source">
      {SOURCES.map((item) => <button type="button" key={item.key} className={source === item.key ? 'rco-filter rco-filter-active' : 'rco-filter'} aria-pressed={source === item.key} onClick={() => setSource(item.key)}>{item.label}</button>)}
    </div>
    <div className="rco-period-filters" role="group" aria-label="Cost reporting period">
      {PERIODS.map((item) => <button type="button" key={item.key} className={period === item.key ? 'rco-filter rco-filter-active' : 'rco-filter'} aria-pressed={period === item.key} onClick={() => setPeriod(item.key)}>{item.label}</button>)}
    </div>
    <form className="rco-period-filters" onSubmit={applyCustomDate} aria-label="Custom Date range">
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
        From <input className="rco-filter" aria-label="Custom date from" type="date" value={fromDate} max={today} onChange={(event) => setFromDate(event.target.value)} required />
      </label>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
        To <input className="rco-filter" aria-label="Custom date to" type="date" value={toDate} max={today} onChange={(event) => setToDate(event.target.value)} required />
      </label>
      <button className={`rco-filter${period === 'custom' ? ' rco-filter-active' : ''}`} type="submit">Apply Custom Date</button>
    </form>
    {inputError && <div className="rco-error" role="alert">{inputError}</div>}
    {error && <div className="rco-error" role="alert">{error}{overview ? ' Previous saved results remain displayed.' : ''}</div>}
    {loading && !overview && <div className="rco-loading" role="status">Reading saved Cost Overview records…</div>}
    {overview && <>
      <div className="rco-grid" aria-busy={loading}>
        <div className="rco-card rco-graph-card" style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          {hasVerifiedDailyCost && <Chart rows={rows} source={source} metric="cost" />}
          {source === 'all' && <Chart rows={rows} source={source} metric="render" />}
          <Chart rows={rows} source={source} metric="api" />
        </div>
        <div className="rco-card rco-total-card">
          <div className="rco-subtitle">Total expense · {selectedPeriod} · {source === 'all' ? 'All' : source === 'web' ? 'Web' : 'Admin'}</div>
          <strong className="rco-total-amount">{formatUsd(total?.verified_cost_usd)}</strong>
          <div className="rco-total-note">{isKnownCost ? 'Recorded cost for the full selected period' : 'Unknown until verified billing is available'}</div>
          <div className="rco-provider-lines">
            {PROVIDERS.map((provider) => <div key={provider.key} className="rco-provider-line"><span>{provider.label}</span><strong>{formatUsd(total?.provider_costs_usd?.[provider.key])}</strong></div>)}
          </div>
          <div className="rco-usage-aux"><span>Observed API payload</span><strong>{formatResourceBytes(total?.observed_api_bytes)}</strong></div>
          {source === 'all' && <div className="rco-usage-aux"><span>Render outbound (recorded)</span><strong>{renderBytes === null ? '—' : formatResourceBytes(renderBytes)}</strong></div>}
          {source === 'all' && <div className="rco-total-note">Render measured: {renderRows.length}/{rows.length} periods. API payload and Render outbound are different measurements and must not be added. Missing data is not zero.</div>}
          <div className="rco-usage-aux"><span>Observed operations</span><strong>{total?.observed_operations == null ? '—' : formatResourceCount(total.observed_operations)}</strong></div>
          {source === 'all' && <div className="rco-shared-line">Shared / unattributed API payload: {formatResourceBytes(shared?.observed_api_bytes)}</div>}
          <div className="rco-total-note">{total?.observed_days || 0} of {total?.expected_days || 0} days have source observations</div>
        </div>
      </div>
      <p className="rco-footer">{overview.period?.from_date}{overview.period?.through_date ? ` – ${overview.period.through_date}` : ''} · Source classification is based on recorded API categories, not verified provider costs. Missing data is never counted as $0.</p>
    </>}
  </section>
}
