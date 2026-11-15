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

function formatUsd(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value)) || Number(value) < 0) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(Number(value))
}

function validAmount(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null
}

function chartMode(rows, source) {
  if (rows.some((item) => validAmount(item?.sources?.[source]?.verified_cost_usd) !== null)) return 'cost'
  if (rows.some((item) => validAmount(item?.sources?.[source]?.observed_api_bytes) !== null)) return 'api'
  if (source === 'all' && rows.some((item) => validAmount(item?.render_outbound_bytes) !== null)) return 'render'
  return 'missing'
}

function graphValue(row, source, mode) {
  if (mode === 'render') return validAmount(row?.render_outbound_bytes)
  if (mode === 'api') return validAmount(row?.sources?.[source]?.observed_api_bytes)
  if (mode === 'cost') return validAmount(row?.sources?.[source]?.verified_cost_usd)
  return null
}

function Chart({ rows, source }) {
  const mode = useMemo(() => chartMode(rows, source), [rows, source])
  const values = useMemo(() => rows.map((row) => graphValue(row, source, mode)), [rows, source, mode])
  const max = Math.max(0, ...values.filter((value) => value !== null))
  const heading = mode === 'cost' ? 'Daily expense (USD)'
    : mode === 'api' ? 'Observed API traffic (not USD)'
      : mode === 'render' ? 'Render outbound (not USD)' : 'Daily expense (USD)'
  return <div className="rco-chart-wrap">
    <div className="rco-chart-heading">
      <strong>{heading}</strong>
      <span>{rows.length ? `${rows[0].label} – ${rows[rows.length - 1].label}` : 'No completed days'}</span>
    </div>
    {mode === 'missing' ? <div className="rco-chart-empty">No verified cost or source usage available for this period.</div>
      : <div className="rco-chart-scroll">
        <div className={`rco-chart-bars${rows.length > 14 ? ' rco-chart-dense' : ''}`} role="img" aria-label={`${heading}: available recorded periods only`}>
          {rows.map((row, index) => {
            const value = values[index]
            const percent = value === null ? 0 : max > 0 ? Math.max(3, value / max * 100) : 3
            const display = mode === 'cost' ? formatUsd(value) : formatResourceBytes(value)
            return <div key={row.date} className="rco-chart-column" title={`${row.label}: ${display}`}>
              <div className="rco-chart-value">{rows.length <= 12 ? display : '\u00a0'}</div>
              <div className="rco-chart-column-height">
                {value === null ? <span className="rco-chart-unavailable">—</span>
                  : <span className="rco-chart-bar" style={{ height: `${percent}%` }} />}
              </div>
              <span className="rco-chart-label">{row.label}</span>
            </div>
          })}
        </div>
      </div>}
    <p className="rco-chart-note">{mode === 'cost' ? 'Verified daily amounts only. Missing days are not zero.'
      : mode === 'api' ? 'API payload observation is not provider billing or complete client attribution.'
        : mode === 'render' ? 'Measured Render bandwidth is not a monetary expense or a Web/Admin split.'
          : 'Costs stay unknown until billing evidence is recorded.'}</p>
  </div>
}

export default function ResourceCostOverview({ refreshKey = 0 }) {
  const [period, setPeriod] = useState('last7')
  const [source, setSource] = useState('all')
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    loadResourceCostOverview(period, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setOverview(data) })
      .catch((problem) => {
        if (!controller.signal.aborted) {
          setOverview(null)
          setError(problem?.message || 'Cost Overview unavailable.')
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [period, refreshKey])

  const total = overview?.totals?.[source]
  const shared = overview?.totals?.shared
  const rows = overview?.series || []
  const selectedPeriod = PERIODS.find((item) => item.key === period)?.label || period
  const isKnownCost = validAmount(total?.verified_cost_usd) !== null
  return <section className="rco-panel" aria-label="Cost Overview">
    <div className="rco-heading">
      <div><h2>Cost Overview</h2><p>Daily snapshots · Cambodia time · stored observations</p></div>
      <span className={`rco-status${isKnownCost ? ' rco-status-recorded' : ''}`}>{loading ? 'Loading' : isKnownCost ? 'Verified cost' : 'Billing not verified'}</span>
    </div>
    <div className="rco-source-filters" role="group" aria-label="Expense source">
      {SOURCES.map((item) => <button type="button" key={item.key} className={source === item.key ? 'rco-filter rco-filter-active' : 'rco-filter'} aria-pressed={source === item.key} onClick={() => setSource(item.key)}>{item.label}</button>)}
    </div>
    <div className="rco-period-filters" role="group" aria-label="Cost reporting period">
      {PERIODS.map((item) => <button type="button" key={item.key} className={period === item.key ? 'rco-filter rco-filter-active' : 'rco-filter'} aria-pressed={period === item.key} onClick={() => setPeriod(item.key)}>{item.label}</button>)}
    </div>
    {error && <div className="rco-error" role="alert">{error}</div>}
    {loading && !overview && <div className="rco-loading" role="status">Reading saved Cost Overview records…</div>}
    {overview && <>
      <div className="rco-grid" aria-busy={loading}>
        <div className="rco-card rco-graph-card"><Chart rows={rows} source={source} /></div>
        <div className="rco-card rco-total-card">
          <div className="rco-subtitle">Total expense · {selectedPeriod} · {source === 'all' ? 'All' : source === 'web' ? 'Web' : 'Admin'}</div>
          <strong className="rco-total-amount">{formatUsd(total?.verified_cost_usd)}</strong>
          <div className="rco-total-note">{isKnownCost ? 'Recorded cost for the full selected period' : 'Unknown until verified billing is available'}</div>
          <div className="rco-provider-lines">
            {PROVIDERS.map((provider) => <div key={provider.key} className="rco-provider-line"><span>{provider.label}</span><strong>{formatUsd(total?.provider_costs_usd?.[provider.key])}</strong></div>)}
          </div>
          <div className="rco-usage-aux"><span>Observed API payload</span><strong>{formatResourceBytes(total?.observed_api_bytes)}</strong></div>
          <div className="rco-usage-aux"><span>Observed operations</span><strong>{total?.observed_operations == null ? '—' : formatResourceCount(total.observed_operations)}</strong></div>
          {source === 'all' && <div className="rco-shared-line">Shared / unattributed API payload: {formatResourceBytes(shared?.observed_api_bytes)}</div>}
          <div className="rco-total-note">{total?.observed_days || 0} of {total?.expected_days || 0} days have source observations</div>
        </div>
      </div>
      <p className="rco-footer">{overview.period?.from_date}{overview.period?.through_date ? ` – ${overview.period.through_date}` : ''} · Source classification is based on recorded API categories, not verified provider costs. Missing data is never counted as $0.</p>
    </>}
  </section>
}
