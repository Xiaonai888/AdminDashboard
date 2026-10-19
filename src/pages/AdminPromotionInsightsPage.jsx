import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_KEY = 'shadow_admin_promotion_insights_daily_v1'
const DAY_MS = 86400000
const METRIC_KEYS = [
  'discover_visitors',
  'total_visits',
  'quality_visitors',
  'promotion_viewers',
  'promotion_views',
  'promotion_clickers',
  'promotion_clicks',
  'book_purchases',
  'pdf_purchases',
  'story_unlocks',
  'female_visitors',
  'male_visitors',
  'other_visitors',
  'unknown_visitors',
  'female_quality_visitors',
  'male_quality_visitors',
  'other_quality_visitors',
  'unknown_quality_visitors',
  'female_buyers',
  'male_buyers',
  'other_buyers',
  'unknown_buyers',
]
const PERIODS = [
  ['yesterday', 'Yesterday'],
  ['last7', 'Last 7 days'],
  ['week', 'This week'],
  ['month', 'This month'],
  ['last30', 'Last 30 days'],
  ['last12', 'Last 12 months'],
  ['custom', 'Custom'],
]
const TABS = [
  ['Products', '/shadow-mall'],
  ['Review Orders', '/shadow-mall/orders'],
  ['Author Orders', '/author-store/review'],
  ['Promotion', '/shadow-mall/promotion'],
  ['Promotion Insights', '/shadow-mall/promotion/insights'],
  ['Publishers', '/shadow-mall/publishers'],
]

let memoryCache = null
let pending = null

function cambodiaDay() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)
}

function shiftDay(day, offset) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10)
}

function displayNumber(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function displayPercent(numerator, denominator) {
  return denominator > 0 ? `${((numerator / denominator) * 100).toFixed(1)}%` : '0.0%'
}

function tokenFingerprint(token) {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash = Math.imul(hash ^ token.charCodeAt(index), 16777619)
  }
  return (hash >>> 0).toString(16)
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function loadSnapshot() {
  const token = getAdminToken()
  if (!token) throw new Error('Admin session required')
  const key = `${cambodiaDay()}:${tokenFingerprint(token)}`
  if (memoryCache?.key === key) return memoryCache.data

  try {
    const saved = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (saved?.key === key && Array.isArray(saved.data?.days) && saved.data?.as_of) {
      memoryCache = saved
      return saved.data
    }
  } catch {
    sessionStorage.removeItem(CACHE_KEY)
  }

  if (pending?.key === key) return pending.promise

  const promise = (async () => {
    const response = await fetch(`${API_URL}/api/discover-insights/admin/daily`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      throw new Error(response.status === 401 || response.status === 403
        ? 'Admin access denied. Please sign in again.'
        : `Promotion Insights could not be loaded (${response.status}).`)
    }
    const payload = await response.json().catch(() => null)
    if (!payload || payload.ok === false || !Array.isArray(payload.days) || !/^\d{4}-\d{2}-\d{2}$/.test(payload.as_of || '')) {
      throw new Error('Promotion Insights returned an invalid daily snapshot.')
    }
    const data = { as_of: payload.as_of, days: payload.days }
    const entry = { key, data }
    memoryCache = entry
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
    } catch {
      return data
    }
    return data
  })().finally(() => {
    if (pending?.key === key) pending = null
  })

  pending = { key, promise }
  return promise
}

function summarize(rows) {
  const totals = Object.fromEntries(METRIC_KEYS.map((key) => [key, 0]))
  for (const row of rows) {
    for (const key of METRIC_KEYS) {
      totals[key] += Math.max(0, Number(row[key]) || 0)
    }
  }
  return totals
}

function getRange(period, asOf, customStart, customEnd) {
  const today = shiftDay(asOf, 1)
  const monthStart = `${today.slice(0, 7)}-01`
  const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7
  if (period === 'yesterday') return [asOf, asOf]
  if (period === 'last7') return [shiftDay(asOf, -6), asOf]
  if (period === 'week') return [shiftDay(today, -weekday), asOf]
  if (period === 'month') return [monthStart, asOf]
  if (period === 'last30') return [shiftDay(asOf, -29), asOf]
  if (period === 'last12') return [shiftDay(asOf, -364), asOf]
  return [customStart || asOf, customEnd || asOf]
}

function makeChart(rows, period) {
  if (period === 'yesterday') {
    const hours = Array.isArray(rows[0]?.hourly_visitors) ? rows[0].hourly_visitors : []
    return Array.from({ length: 24 }, (_, hour) => ({
      label: String(hour).padStart(2, '0'),
      visitors: Math.max(0, Number(hours[hour]) || 0),
      quality: null,
    }))
  }

  if (rows.length > 62) {
    const months = new Map()
    for (const row of rows) {
      const month = String(row.day).slice(0, 7)
      const current = months.get(month) || { label: month, visitors: 0, quality: 0 }
      current.visitors += Math.max(0, Number(row.discover_visitors) || 0)
      current.quality += Math.max(0, Number(row.quality_visitors) || 0)
      months.set(month, current)
    }
    return [...months.values()]
  }

  return rows.map((row) => ({
    label: String(row.day).slice(5),
    visitors: Math.max(0, Number(row.discover_visitors) || 0),
    quality: Math.max(0, Number(row.quality_visitors) || 0),
  }))
}

function StatCard({ title, value, subtitle, symbol }) {
  return (
    <article className="pi-stat">
      <span className="pi-stat-icon" aria-hidden="true">{symbol}</span>
      <div className="pi-stat-text">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>
    </article>
  )
}

function BreakdownRow({ label, value }) {
  return (
    <div className="pi-breakdown-row">
      <span>{label}</span>
      <strong>{displayNumber(value)}</strong>
    </div>
  )
}

export default function AdminPromotionInsightsPage() {
  const navigate = useNavigate()
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('yesterday')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [retryNumber, setRetryNumber] = useState(0)

  useEffect(() => {
    let alive = true
    loadSnapshot()
      .then((result) => {
        if (alive) setSnapshot(result)
      })
      .catch((reason) => {
        if (alive) setError(reason.message || 'Unable to load Promotion Insights.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => { alive = false }
  }, [retryNumber])

  const asOf = snapshot?.as_of || shiftDay(cambodiaDay(), -1)
  const firstAvailable = snapshot?.days?.[0]?.day || shiftDay(asOf, -369)
  const [rangeStart, rangeEnd] = useMemo(
    () => getRange(period, asOf, customStart, customEnd),
    [period, asOf, customStart, customEnd]
  )
  const validRange = rangeStart <= rangeEnd && rangeStart <= asOf
  const rows = useMemo(() => validRange
    ? (snapshot?.days || []).filter((row) => row.day >= rangeStart && row.day <= rangeEnd)
      .sort((a, b) => a.day.localeCompare(b.day))
    : [], [snapshot, rangeStart, rangeEnd, validRange])
  const totals = useMemo(() => summarize(rows), [rows])
  const chart = useMemo(() => makeChart(rows, period), [rows, period])
  const chartMax = Math.max(1, ...chart.map((item) => item.visitors))
  const purchaseTotal = totals.book_purchases + totals.pdf_purchases + totals.story_unlocks
  const hasActivity = totals.discover_visitors > 0 || totals.total_visits > 0
  const groups = [
    { title: 'Discover visitors', prefix: '', values: [totals.female_visitors, totals.male_visitors, totals.other_visitors, totals.unknown_visitors] },
    { title: 'Quality visitors', prefix: 'quality', values: [totals.female_quality_visitors, totals.male_quality_visitors, totals.other_quality_visitors, totals.unknown_quality_visitors] },
    { title: 'Buyers', prefix: 'buyers', values: [totals.female_buyers, totals.male_buyers, totals.other_buyers, totals.unknown_buyers] },
  ]
  const labels = ['Female', 'Male', 'Other', 'Unknown']

  return (
    <AdminLayout
      title="Promotion Insights"
      subtitle="Discover engagement and promotion sales · daily snapshot · Cambodia time"
    >
      <style>{styles}</style>
      <div className="pi-page">
        <div className="pi-container">
          <header className="pi-hero">
            <div className="pi-eyebrow">Discover &amp; Shadow Mall</div>
            <h1>Promotion Insights</h1>
            <p>Track who visits Discover, engages with promotions and completes purchases.</p>
            <nav className="pi-tabs" aria-label="Shadow Mall navigation">
              {TABS.map(([label, path]) => (
                <button
                  key={path}
                  type="button"
                  className={path === '/shadow-mall/promotion/insights' ? 'pi-tab pi-tab-active' : 'pi-tab'}
                  aria-current={path === '/shadow-mall/promotion/insights' ? 'page' : undefined}
                  onClick={() => { if (path !== '/shadow-mall/promotion/insights') navigate(path) }}
                >
                  {label}
                </button>
              ))}
            </nav>
          </header>

          <section className="pi-report">
            <div className="pi-report-header">
              <div>
                <h2>Discover Activity</h2>
                <p>Numbers through {asOf} · updated daily, not real time</p>
              </div>
              <span className="pi-snapshot-label">Cached Daily Snapshot</span>
            </div>

            <div className="pi-filters" aria-label="Select reporting period">
              {PERIODS.map(([value, name]) => (
                <button
                  type="button"
                  key={value}
                  className={period === value ? 'pi-filter pi-filter-active' : 'pi-filter'}
                  onClick={() => setPeriod(value)}
                  aria-pressed={period === value}
                >
                  {name}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="pi-custom">
                <label>From <input type="date" value={customStart} min={firstAvailable} max={asOf} onChange={(event) => setCustomStart(event.target.value)} /></label>
                <label>To <input type="date" value={customEnd} min={firstAvailable} max={asOf} onChange={(event) => setCustomEnd(event.target.value)} /></label>
              </div>
            )}

            {loading ? (
              <div className="pi-empty" role="status">Loading cached analytics...</div>
            ) : error ? (
              <div className="pi-empty pi-error" role="alert">
                <p>{error}</p>
                <button type="button" className="pi-filter" onClick={() => { setError(''); setLoading(true); setRetryNumber((value) => value + 1) }}>Retry</button>
              </div>
            ) : !validRange ? (
              <div className="pi-empty">Choose a date range ending on or before {asOf}.</div>
            ) : (
              <>
                <div className="pi-stats">
                  <StatCard title="Discover Visitors" value={displayNumber(totals.discover_visitors)} subtitle="Daily unique visitors" symbol="◎" />
                  <StatCard title="Total Visits" value={displayNumber(totals.total_visits)} subtitle="Including repeat visits" symbol="↻" />
                  <StatCard title="Quality Visitors" value={displayNumber(totals.quality_visitors)} subtitle="Scrolled or interacted" symbol="✦" />
                  <StatCard title="Engagement Rate" value={displayPercent(totals.quality_visitors, totals.discover_visitors)} subtitle="Quality / Discover visitors" symbol="%" />
                  <StatCard title="Promotion Viewers" value={displayNumber(totals.promotion_viewers)} subtitle="Saw at least one ad" symbol="◉" />
                  <StatCard title="Promotion Views" value={displayNumber(totals.promotion_views)} subtitle="Per-ad daily unique views" symbol="◈" />
                  <StatCard title="Promotion Clickers" value={displayNumber(totals.promotion_clickers)} subtitle="Clicked at least one ad" symbol="↗" />
                  <StatCard title="Total Purchases" value={displayNumber(purchaseTotal)} subtitle="Book units + PDF units + story unlocks" symbol="◆" />
                </div>

                <div className="pi-columns">
                  <section className="pi-panel pi-chart-panel">
                    <div className="pi-section-header">
                      <div>
                        <h3>{period === 'yesterday' ? 'Yesterday · hourly visitors' : rows.length > 62 ? 'Discover visitors · by month' : 'Discover visitors · by day'}</h3>
                        <p>{rangeStart}{rangeStart !== rangeEnd ? ` — ${rangeEnd}` : ''}</p>
                      </div>
                      <div className="pi-legend"><span><i className="pi-dot pi-dot-visitors" />Visitors</span>{period !== 'yesterday' && <span><i className="pi-dot pi-dot-quality" />Quality</span>}</div>
                    </div>
                    {hasActivity ? (
                      <div className="pi-chart-scroll">
                        <div className="pi-bars" style={{ minWidth: `${Math.max(500, chart.length * 37)}px` }}>
                          {chart.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="pi-bar-col" title={`${item.label} · ${displayNumber(item.visitors)} visitors${item.quality === null ? '' : ` · ${displayNumber(item.quality)} quality visitors`}`}>
                              <span className="pi-bar-value">{displayNumber(item.visitors)}</span>
                              <div className="pi-bar-track">
                                <div className="pi-bar-set">
                                  <div className="pi-bar-visitor" style={{ height: `${item.visitors ? Math.max(3, item.visitors / chartMax * 100) : 0}%` }} />
                                  {item.quality !== null && <div className="pi-bar-quality" style={{ height: `${item.quality ? Math.max(3, item.quality / chartMax * 100) : 0}%` }} />}
                                </div>
                              </div>
                              <small>{item.label}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pi-no-data">No recorded Discover activity for this period.</div>
                    )}
                    <div className="pi-chart-summary">
                      <div><span>Promotion Clicks</span><strong>{displayNumber(totals.promotion_clicks)}</strong></div>
                      <div><span>Ad Click-through</span><strong>{displayPercent(totals.promotion_clickers, totals.promotion_viewers)}</strong></div>
                      <div><span>Story Unlocks</span><strong>{displayNumber(totals.story_unlocks)}</strong></div>
                    </div>
                  </section>

                  <aside className="pi-panel pi-breakdown">
                    <h3>Purchases &amp; Audience</h3>
                    <p>Only purchases recorded from Discover promotions</p>
                    <div className="pi-breakdown-group">
                      <BreakdownRow label="Book purchases (units)" value={totals.book_purchases} />
                      <BreakdownRow label="PDF purchases (units)" value={totals.pdf_purchases} />
                      <BreakdownRow label="Story unlocks" value={totals.story_unlocks} />
                      <BreakdownRow label="Total purchase actions" value={purchaseTotal} />
                    </div>
                    <div className="pi-breakdown-group">
                      <BreakdownRow label="Promotion viewers" value={totals.promotion_viewers} />
                      <BreakdownRow label="Promotion clicks" value={totals.promotion_clicks} />
                    </div>
                    {groups.map((group) => (
                      <div className="pi-breakdown-group" key={group.title}>
                        <h4>{group.title} · gender</h4>
                        {labels.map((label, index) => <BreakdownRow key={label} label={label} value={group.values[index]} />)}
                      </div>
                    ))}
                  </aside>
                </div>

                <p className="pi-note">
                  Figures are Cambodia-time daily snapshots through {asOf}. Visitors, viewers, clickers and buyers are unique within each day; when viewing multiple days, the totals represent summed daily unique counts, not unique people across the whole period. Promotion views are per-ad daily counts. Gender is based on known account details; unknown is not estimated. This report does not track browsing duration.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}

const styles = `
.pi-page{background:#f8fafc;color:#0f172a;min-height:100vh;font-family:inherit}
.pi-container{max-width:1380px;margin:0 auto;padding:26px}
.pi-hero,.pi-report{background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:23px;box-shadow:0 12px 30px rgba(15,23,42,.04)}
.pi-hero{margin-bottom:18px}
.pi-eyebrow{display:inline-flex;border-radius:999px;padding:7px 12px;background:#eef2ff;color:#4f46e5;font-size:11px;font-weight:900}
.pi-hero h1{margin:12px 0 6px;font-size:29px;font-weight:900;letter-spacing:-.035em}
.pi-hero p,.pi-report-header p,.pi-section-header p,.pi-breakdown>p{margin:0;color:#64748b;font-size:12px;line-height:1.55}
.pi-tabs{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.pi-tab,.pi-filter{border:1px solid #e2e8f0;background:#fff;color:#334155;cursor:pointer;font-size:12px;font-weight:800;border-radius:12px;min-height:40px;padding:0 14px}
.pi-tab-active,.pi-filter-active{background:#eef2ff;color:#4f46e5;border-color:#c7d2fe;cursor:default}
.pi-tab:hover:not(.pi-tab-active),.pi-filter:hover:not(.pi-filter-active){background:#f8fafc}
.pi-report-header,.pi-section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.pi-report-header h2{margin:0 0 6px;font-size:21px;font-weight:900}
.pi-snapshot-label{border-radius:999px;padding:9px 12px;background:#ecfdf5;color:#047857;font-size:11px;font-weight:800;white-space:nowrap}
.pi-filters{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0 16px}
.pi-custom{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px}
.pi-custom label{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#475569}
.pi-custom input{border:1px solid #cbd5e1;border-radius:9px;padding:9px;font:inherit;background:#fff;color:#0f172a;max-width:170px}
.pi-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:17px}
.pi-stat{display:flex;gap:12px;align-items:flex-start;min-width:0;border:1px solid #e2e8f0;border-radius:16px;padding:17px;background:#fff}
.pi-stat-icon{display:inline-flex;align-items:center;justify-content:center;width:41px;height:41px;flex-shrink:0;border-radius:12px;background:#eef2ff;color:#4f46e5;font-size:21px;font-weight:800}
.pi-stat-text{display:flex;flex-direction:column;gap:5px;min-width:0}
.pi-stat-text>span{font-size:12px;color:#475569;font-weight:800}
.pi-stat-text>strong{font-size:27px;font-weight:900;line-height:1.2;overflow-wrap:anywhere}
.pi-stat-text>small{color:#94a3b8;font-size:10px;line-height:1.4}
.pi-columns{display:grid;grid-template-columns:minmax(0,2fr) minmax(270px,1fr);gap:16px;align-items:start}
.pi-panel{border:1px solid #e2e8f0;border-radius:17px;padding:19px;background:#fff;min-width:0}
.pi-panel h3{margin:0 0 6px;font-size:16px;font-weight:900}
.pi-legend{display:flex;gap:12px;flex-wrap:wrap;color:#64748b;font-size:11px;font-weight:700}
.pi-legend span{display:inline-flex;align-items:center;gap:5px}
.pi-dot{height:9px;width:9px;border-radius:3px;display:inline-block}
.pi-dot-visitors{background:#6366f1}.pi-dot-quality{background:#10b981}
.pi-chart-scroll{overflow-x:auto;max-width:100%;padding-bottom:6px;margin-top:18px}
.pi-bars{display:flex;height:260px;align-items:stretch;gap:7px;padding-top:18px}
.pi-bar-col{display:flex;flex:1;min-width:25px;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0}
.pi-bar-value{font-size:10px;font-weight:800;color:#475569;margin-bottom:8px;min-height:14px}
.pi-bar-track{width:100%;height:194px;display:flex;align-items:flex-end;border-bottom:1px solid #cbd5e1;background:repeating-linear-gradient(to top,transparent 0,transparent 47px,#f1f5f9 48px)}
.pi-bar-set{width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;gap:2px}
.pi-bar-visitor,.pi-bar-quality{width:43%;max-width:24px;border-radius:5px 5px 0 0}
.pi-bar-visitor{background:#6366f1}.pi-bar-quality{background:#10b981}
.pi-bar-col small{margin-top:10px;color:#64748b;font-size:10px;font-weight:700;white-space:nowrap}
.pi-chart-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;border-top:1px solid #e2e8f0;margin-top:15px;padding-top:17px}
.pi-chart-summary>div{display:flex;flex-direction:column;gap:5px}.pi-chart-summary span{font-size:11px;color:#64748b;font-weight:700}.pi-chart-summary strong{font-size:20px;font-weight:900}
.pi-breakdown-group{padding:15px 0;border-top:1px solid #e2e8f0}
.pi-breakdown-group:first-of-type{margin-top:18px}
.pi-breakdown-group h4{margin:0 0 10px;color:#334155;font-size:12px;font-weight:900}
.pi-breakdown-row{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:7px 0;color:#64748b;font-size:12px}
.pi-breakdown-row strong{color:#0f172a;font-size:13px;font-weight:900}
.pi-empty,.pi-no-data{padding:35px 20px;color:#64748b;text-align:center;font-size:13px}
.pi-error{color:#b91c1c;background:#fef2f2;border-radius:14px}
.pi-note{font-size:11px;color:#64748b;line-height:1.7;margin:18px 0 0}
@media(max-width:1160px){.pi-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.pi-columns{grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr)}}
@media(max-width:790px){.pi-container{padding:14px}.pi-hero,.pi-report{padding:17px;border-radius:18px}.pi-columns{grid-template-columns:1fr}}
@media(max-width:520px){.pi-stats{grid-template-columns:1fr 1fr;gap:8px}.pi-stat{padding:11px;gap:8px}.pi-stat-icon{width:32px;height:32px;font-size:16px}.pi-stat-text>strong{font-size:22px}.pi-report-header h2{font-size:19px}.pi-chart-summary strong{font-size:16px}.pi-tab,.pi-filter{padding:0 10px;font-size:11px;min-height:36px}}
`
