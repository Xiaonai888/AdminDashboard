import React, { useEffect, useMemo, useState } from 'react'
import { loadResourceCostOverview } from '../services/resourceCostOverviewApi'
import { formatResourceBytes, formatResourceCount } from '../services/resourceCostApi'
import '../styles/adminResourceCostOverview.css'

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const PERIODS = [
  { key: 'today', label: 'Today' },
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
    note: 'Invoice-verified amounts only. An unverified day is not $0.',
    color: 'linear-gradient(180deg,#34b58e 0%,#087e66 100%)',
  },
  render: {
    heading: 'Render outbound bandwidth',
    note: 'Recorded provider outbound only. Missing and partial hours are not estimated or counted as zero.',
    color: 'linear-gradient(180deg,#8b8bfd 0%,#5547ee 100%)',
  },
  api: {
    heading: 'Observed API payload',
    note: 'Backend-observed API payload is not provider billing or full network traffic; do not add it to Render outbound.',
    color: 'linear-gradient(180deg,#ffa957 0%,#ed8231 100%)',
  },
}

function cambodiaToday() {
  return new Date(Date.now() + 7 * HOUR_MS).toISOString().slice(0, 10)
}

function shiftDate(date, days) {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

function validAmount(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function formatUsd(value) {
  const amount = validAmount(value)
  return amount === null ? '—' : new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4,
  }).format(amount)
}

function graphValue(row, source, metric) {
  if (metric === 'render') return validAmount(row?.render_outbound_bytes)
  if (metric === 'api') return validAmount(row?.sources?.[source]?.observed_api_bytes)
  if (metric === 'cost') return validAmount(row?.sources?.[source]?.verified_cost_usd)
  return null
}

function graphStatus(row, metric, value) {
  const raw = String(metric === 'render'
    ? row?.coverage?.render_status
    : metric === 'api' ? row?.coverage?.observed_usage_status : row?.coverage?.invoiced_cost || '').toLowerCase()
  if (raw === 'pending') return 'Pending'
  if (raw === 'in_progress') return value === null ? 'Collecting' : 'Live'
  if (value === null) return 'Missing'
  if (metric === 'cost') return 'Verified'
  if (raw === 'complete') return 'Complete'
  if (raw === 'partial' || raw === 'partial_breakdown' || raw === 'observed_partial') return 'Partial'
  return 'Observed'
}

function totalRecorded(rows, getter) {
  let sum = 0
  let count = 0
  for (const row of rows) {
    const value = validAmount(getter(row))
    if (value === null) continue
    sum += value
    count += 1
  }
  return count ? sum : null
}

function monthSummary(days) {
  const groups = new Map()
  for (const row of days) {
    const month = String(row?.date || '').slice(0, 7)
    if (!/^\d{4}-\d{2}$/.test(month)) continue
    if (!groups.has(month)) groups.set(month, [])
    groups.get(month).push(row)
  }
  return [...groups].map(([month, group]) => {
    const sources = Object.fromEntries(['all', 'web', 'admin', 'shared'].map((source) => {
      const knownCosts = group.map((row) => graphValue(row, source, 'cost'))
      const verified = knownCosts.length === group.length && knownCosts.every((value) => value !== null)
      return [source, {
        observed_api_bytes: totalRecorded(group, (row) => row?.sources?.[source]?.observed_api_bytes),
        observed_operations: totalRecorded(group, (row) => row?.sources?.[source]?.observed_operations),
        verified_cost_usd: verified ? knownCosts.reduce((sum, value) => sum + value, 0) : null,
      }]
    }))
    const hasEveryRender = group.every((row) => graphValue(row, 'all', 'render') !== null)
    const hasEveryApi = group.every((row) => graphValue(row, 'all', 'api') !== null)
    const renderComplete = hasEveryRender && group.every((row) => row?.coverage?.render_status === 'complete')
    const apiComplete = hasEveryApi && group.every((row) => row?.coverage?.observed_usage_status === 'complete')
    const label = new Date(`${month}-01T00:00:00.000Z`).toLocaleDateString('en-US', {
      month: 'short', year: '2-digit', timeZone: 'UTC',
    })
    return {
      date: month,
      label,
      granularity: 'month',
      render_outbound_bytes: totalRecorded(group, (row) => row.render_outbound_bytes),
      sources,
      coverage: {
        render_status: renderComplete ? 'complete' : 'partial',
        observed_usage_status: apiComplete ? 'complete' : 'partial',
      },
    }
  })
}

function displaySeries(overview) {
  const period = overview?.period || {}
  const days = Array.isArray(overview?.series) ? overview.series : []
  if (period.mode === 'today' || period.mode === 'yesterday') {
    const hours = Array.isArray(overview?.hourly_series) ? overview.hourly_series : []
    return { rows: hours, isHourly: true, unavailable: hours.length !== 24 }
  }
  if (period.mode === 'custom' && days.length > 92 && period.granularity !== 'month') {
    return { rows: monthSummary(days), isHourly: false, unavailable: false }
  }
  return { rows: days, isHourly: false, unavailable: false }
}

function Chart({ rows, source, metric, isHourly }) {
  const config = CHARTS[metric]
  const values = useMemo(() => rows.map((row) => graphValue(row, source, metric)), [rows, source, metric])
  const max = Math.max(0, ...values.filter((value) => value !== null))
  const available = values.filter((value) => value !== null).length
  const minWidth = Math.max(420, rows.length * (isHourly ? 40 : rows.length > 40 ? 36 : rows.length > 14 ? 44 : 62))
  const unit = isHourly ? 'hours' : rows[0]?.granularity === 'month' ? 'months' : 'days'
  return <div className="rco-chart-wrap">
    <div className="rco-chart-heading">
      <strong>{config.heading}</strong>
      <span>{rows.length ? `${rows[0].label} – ${rows[rows.length - 1].label}` : 'No periods'} · {available}/{rows.length} {unit} recorded</span>
    </div>
    {rows.length ? <div className="rco-chart-scroll">
      <div className={`rco-chart-bars${rows.length > 14 ? ' rco-chart-dense' : ''}`} style={{ minWidth }} role="img" aria-label={`${config.heading}: ${available} of ${rows.length} ${unit} have observations; missing is not zero`}>
        {rows.map((row, index) => {
          const value = values[index]
          const percentage = value === null ? 0 : max > 0 ? Math.max(3, value / max * 100) : 0
          const formatted = metric === 'cost' ? formatUsd(value) : formatResourceBytes(value)
          const status = graphStatus(row, metric, value)
          const statusColor = status === 'Missing' ? '#a34a55' : status === 'Partial' || status === 'Collecting' || status === 'Live' ? '#986414' : '#76849c'
          return <div className="rco-chart-column" key={`${metric}-${row.date}`} title={`${row.date}: ${formatted} · ${status}`}>
            <span className="rco-chart-value">{rows.length <= 12 || isHourly ? formatted : '\u00a0'}</span>
            <div className="rco-chart-column-height">
              {value === null ? <span className="rco-chart-unavailable">{status === 'Pending' ? '·' : '—'}</span>
                : <span className="rco-chart-bar" style={{ height: `${percentage}%`, background: config.color, opacity: value === 0 ? 0.35 : 1 }} />}
            </div>
            <span className="rco-chart-label" style={isHourly ? { transform: 'none', fontSize: 10 } : undefined}>{row.label}</span>
            <span style={{ fontSize: 9, lineHeight: 1.3, color: statusColor, whiteSpace: 'nowrap' }}>{status}</span>
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
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    if (period !== 'today') return undefined
    const timer = setInterval(() => setRefreshTick((tick) => tick + 1), 5 * 60_000)
    return () => clearInterval(timer)
  }, [period])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setOverview(null)
    loadResourceCostOverview(period, controller.signal, period === 'custom' ? customRange : null)
      .then((data) => { if (!controller.signal.aborted) setOverview(data) })
      .catch((problem) => {
        if (!controller.signal.aborted) setError(problem?.message || 'Cost Overview unavailable.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [period, customRange?.from, customRange?.to, refreshKey, refreshTick])

  const { rows, isHourly, unavailable } = useMemo(() => displaySeries(overview), [overview])
  const isHourlyPeriod = period === 'today' || period === 'yesterday'
  const displaySource = isHourlyPeriod ? 'all' : source
  const total = overview?.totals?.[displaySource]
  const shared = overview?.totals?.shared
  const isKnownCost = validAmount(total?.verified_cost_usd) !== null
  const hasVerifiedDailyCost = !isHourly && rows.some((row) => graphValue(row, displaySource, 'cost') !== null)
  const renderedBytes = totalRecorded(rows, (row) => row?.render_outbound_bytes)
  const observedBytes = isHourly ? totalRecorded(rows, (row) => row?.sources?.all?.observed_api_bytes) : validAmount(total?.observed_api_bytes)
  const observedOperations = isHourly ? totalRecorded(rows, (row) => row?.sources?.all?.observed_operations) : validAmount(total?.observed_operations)
  const renderRecorded = rows.filter((row) => graphValue(row, 'all', 'render') !== null).length
  const apiRecorded = rows.filter((row) => graphValue(row, displaySource, 'api') !== null).length
  const periodLabel = overview?.period?.mode === 'custom'
    ? `${overview.period.from_date} – ${overview.period.through_date}`
    : PERIODS.find((item) => item.key === (overview?.period?.mode || period))?.label || period
  const today = cambodiaToday()

  function choosePeriod(next) {
    setInputError('')
    if (next === 'today' || next === 'yesterday') setSource('all')
    setPeriod(next)
  }

  function applyCustomDate(event) {
    event.preventDefault()
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    const length = Date.parse(`${toDate}T00:00:00.000Z`) - Date.parse(`${fromDate}T00:00:00.000Z`)
    if (!datePattern.test(fromDate) || !datePattern.test(toDate) || fromDate > toDate || toDate > today ||
      !Number.isFinite(length) || length >= 370 * DAY_MS) {
      setInputError('Choose a valid date range of up to 370 days, ending no later than today.')
      return
    }
    setInputError('')
    if (fromDate === toDate && (fromDate === today || fromDate === shiftDate(today, -1))) {
      choosePeriod(fromDate === today ? 'today' : 'yesterday')
      return
    }
    setCustomRange({ from: fromDate, to: toDate })
    setPeriod('custom')
  }

  return <section className="rco-panel" aria-label="Cost Overview">
    <div className="rco-heading">
      <div><h2>Cost Overview</h2><p>Hourly / daily / monthly · Asia/Phnom_Penh · recorded provider data</p></div>
      <span className={`rco-status${isKnownCost ? ' rco-status-recorded' : ''}`}>{loading ? 'Loading' : isKnownCost ? 'Verified cost' : 'Billing not verified'}</span>
    </div>
    <div className="rco-period-filters" role="group" aria-label="Cost reporting period">
      {PERIODS.map((item) => <button type="button" key={item.key} className={period === item.key ? 'rco-filter rco-filter-active' : 'rco-filter'} aria-pressed={period === item.key} onClick={() => choosePeriod(item.key)}>{item.label}</button>)}
    </div>
    <form className="rco-period-filters" onSubmit={applyCustomDate} aria-label="Custom date range">
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
        From <input className="rco-filter" aria-label="Custom date from" type="date" value={fromDate} max={today} onChange={(event) => setFromDate(event.target.value)} required />
      </label>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
        To <input className="rco-filter" aria-label="Custom date to" type="date" value={toDate} max={today} onChange={(event) => setToDate(event.target.value)} required />
      </label>
      <button type="submit" className={`rco-filter${period === 'custom' ? ' rco-filter-active' : ''}`}>Apply Custom Date</button>
    </form>
    <div className="rco-source-filters" role="group" aria-label="Observed API source">
      {SOURCES.map((item) => <button type="button" key={item.key} disabled={isHourlyPeriod && item.key !== 'all'} title={isHourlyPeriod && item.key !== 'all' ? 'Hourly Web/Admin split is not available from current backend records' : undefined} className={displaySource === item.key ? 'rco-filter rco-filter-active' : 'rco-filter'} aria-pressed={displaySource === item.key} onClick={() => setSource(item.key)} style={isHourlyPeriod && item.key !== 'all' ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}>{item.label}</button>)}
      {isHourlyPeriod && <span className="rco-total-note">Hourly Web/Admin split is not verified; showing All.</span>}
    </div>
    {inputError && <div className="rco-error" role="alert">{inputError}</div>}
    {error && <div className="rco-error" role="alert">{error}</div>}
    {loading && <div className="rco-loading" role="status">Reading stored Cost Overview records…</div>}
    {overview && unavailable && <div className="rco-error" role="alert">The hourly API returned fewer than 24 slots. Deploy the updated Backend and verify the stored observations.</div>}
    {overview && !unavailable && <>
      <div className="rco-grid" aria-busy={loading}>
        <div className="rco-card rco-graph-card" style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          {hasVerifiedDailyCost && <Chart rows={rows} source={displaySource} metric="cost" isHourly={isHourly} />}
          {displaySource === 'all' && <Chart rows={rows} source={displaySource} metric="render" isHourly={isHourly} />}
          <Chart rows={rows} source={displaySource} metric="api" isHourly={isHourly} />
        </div>
        <div className="rco-card rco-total-card">
          <div className="rco-subtitle">Total expense · {periodLabel} · {displaySource === 'all' ? 'All' : displaySource === 'web' ? 'Web' : 'Admin'}</div>
          <strong className="rco-total-amount">{formatUsd(total?.verified_cost_usd)}</strong>
          <div className="rco-total-note">{isKnownCost ? 'Verified invoice for the entire selected period' : 'Unknown until invoice-backed billing is available; not $0'}</div>
          <div className="rco-provider-lines">
            {PROVIDERS.map((provider) => <div key={provider.key} className="rco-provider-line"><span>{provider.label}</span><strong>{formatUsd(total?.provider_costs_usd?.[provider.key])}</strong></div>)}
          </div>
          <div className="rco-usage-aux"><span>{isHourly ? 'Observed API payload (hourly)' : 'Observed API payload'}</span><strong>{formatResourceBytes(observedBytes)}</strong></div>
          {displaySource === 'all' && <div className="rco-usage-aux"><span>Render outbound (recorded)</span><strong>{formatResourceBytes(renderedBytes)}</strong></div>}
          <div className="rco-usage-aux"><span>Observed operations</span><strong>{observedOperations === null ? '—' : formatResourceCount(observedOperations)}</strong></div>
          <div className="rco-total-note">Render observed: {renderRecorded}/{rows.length} {isHourly ? 'hours' : rows[0]?.granularity === 'month' ? 'months' : 'days'} · API observed: {apiRecorded}/{rows.length}. Partial periods are not complete totals.</div>
          {!isHourly && <div className="rco-total-note">Daily API source coverage: {total?.observed_days ?? 0} of {total?.expected_days ?? 0} days recorded.</div>}
          {displaySource === 'all' && !isHourly && <div className="rco-shared-line">Shared / unattributed API payload: {formatResourceBytes(shared?.observed_api_bytes)}</div>}
          {isHourly && <div className="rco-total-note">24 Cambodia clock hours · Future hours are Pending · Current hour may be Live · Refreshes every 5 minutes on Today.</div>}
        </div>
      </div>
      <p className="rco-footer">{overview.period?.from_date}{overview.period?.through_date ? ` – ${overview.period.through_date}` : ''} · Usage is not invoice cost. API payload and Render outbound measure different traffic; never add them. Missing periods are not counted as zero.</p>
    </>}
  </section>
}
