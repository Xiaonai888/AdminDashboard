import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_KEY = 'shadow_admin_story_growth_daily_v1'
const CAMBODIA_OFFSET_MS = 7 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const SNAPSHOT_DAYS = 365

const PERIODS = [
  { key: 'latest', label: 'Latest day' },
  { key: '7d', label: 'Last 7 days' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'year', label: 'Last 12 months' },
  { key: 'custom', label: 'Custom' },
]

let memoryCache = null
let inFlight = null

function todayKH() {
  return new Date(Date.now() + CAMBODIA_OFFSET_MS).toISOString().slice(0, 10)
}

function shiftDay(day, count) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + count * DAY_MS)
    .toISOString().slice(0, 10)
}

function adminToken() {
  try {
    return sessionStorage.getItem('shadow_admin_token') ||
      localStorage.getItem('shadow_admin_token') || ''
  } catch {
    return ''
  }
}

// Separate cache for admin sessions, without storing the token itself as a cache key.
function sessionKey(token) {
  let hash = 2166136261
  for (let i = 0; i < token.length; i += 1) {
    hash = Math.imul(hash ^ token.charCodeAt(i), 16777619)
  }
  return `${CACHE_KEY}_${(hash >>> 0).toString(16)}`
}

function normalizeSnapshot(data, expectedDay) {
  if (!data || data.as_of !== shiftDay(expectedDay, -1) ||
      !Array.isArray(data.days) || data.days.length !== SNAPSHOT_DAYS) {
    throw new Error('Invalid or incomplete Story Growth daily snapshot')
  }

  const days = data.days.map((row) => {
    const updatedStories = Number(row?.updated_stories)
    const newEpisodes = Number(row?.new_episodes)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row?.date || '') ||
        !Number.isSafeInteger(updatedStories) || updatedStories < 0 ||
        !Number.isSafeInteger(newEpisodes) || newEpisodes < 0) {
      throw new Error('Story Growth returned invalid daily counts')
    }
    return { date: row.date, updated_stories: updatedStories, new_episodes: newEpisodes }
  }).sort((a, b) => a.date.localeCompare(b.date))

  if (days[0]?.date !== shiftDay(data.as_of, -(SNAPSHOT_DAYS - 1)) ||
      days[days.length - 1]?.date !== data.as_of ||
      days.some((row, index) => index > 0 && row.date !== shiftDay(days[index - 1].date, 1))) {
    throw new Error('Story Growth snapshot has missing or duplicate dates')
  }
  return { as_of: data.as_of, days }
}

function readCache(token, day) {
  if (!token) return null
  const cacheKey = sessionKey(token)
  if (memoryCache?.key === cacheKey && memoryCache.day === day) {
    return memoryCache.snapshot
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(cacheKey) || 'null')
    if (saved?.day !== day) return null
    const snapshot = normalizeSnapshot(saved.snapshot, day)
    memoryCache = { key: cacheKey, day, snapshot }
    return snapshot
  } catch {
    return null
  }
}

async function fetchDailySnapshot() {
  const token = adminToken()
  if (!token) throw new Error('Admin session required')
  const day = todayKH()
  const cached = readCache(token, day)
  if (cached) return cached

  const cacheKey = sessionKey(token)
  const requestKey = `${cacheKey}_${day}`
  if (inFlight?.key === requestKey) return inFlight.promise

  const promise = (async () => {
    const response = await fetch(`${API_URL}/api/admin/stories/growth/daily`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) {
      try {
        sessionStorage.removeItem(cacheKey)
        sessionStorage.removeItem('shadow_admin_token')
        localStorage.removeItem('shadow_admin_token')
        sessionStorage.removeItem('shadow_admin_user')
        localStorage.removeItem('shadow_admin_user')
      } catch { /* storage unavailable */ }
      window.location.assign('/login')
      throw new Error('Admin session expired')
    }
    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `Story Growth request failed (${response.status})`)
    }
    const snapshot = normalizeSnapshot(data, day)
    memoryCache = { key: cacheKey, day, snapshot }
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ day, snapshot }))
    } catch { /* memory cache remains available */ }
    return snapshot
  })()

  inFlight = { key: requestKey, promise }
  try {
    return await promise
  } finally {
    if (inFlight?.promise === promise) inFlight = null
  }
}

function periodStart(period, asOf) {
  if (period === 'latest') return asOf
  if (period === '7d') return shiftDay(asOf, -6)
  if (period === '30d') return shiftDay(asOf, -29)
  if (period === 'year') return shiftDay(asOf, -(SNAPSHOT_DAYS - 1))
  const today = todayKH()
  if (period === 'month') return `${today.slice(0, 7)}-01`
  if (period === 'week') {
    const weekday = new Date(`${today}T00:00:00Z`).getUTCDay()
    return shiftDay(today, -((weekday + 6) % 7))
  }
  return shiftDay(asOf, -6)
}

function fmtDate(day) {
  if (!day) return '—'
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric',
  })
}

const number = (value) => Number(value || 0).toLocaleString('en-US')

function sumMetric(days, metric) {
  return days.reduce((sum, row) => sum + row[metric], 0)
}

const STYLES = `
  .sg-root{padding:22px;color:#0f172a}
  .sg-heading,.sg-chart-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
  .sg-heading h3{font-size:21px;font-weight:850;margin:0 0 5px}
  .sg-muted{margin:0;color:#64748b;font-size:12px;line-height:1.6}
  .sg-pill{color:#047857;background:#ecfdf5;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:750}
  .sg-periods,.sg-series{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
  .sg-periods button,.sg-series button{cursor:pointer;background:#fff;border:1px solid #e2e8f0;color:#334155;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:750}
  .sg-periods button[aria-pressed=true],.sg-series button[aria-pressed=true]{border-color:#6366f1;color:#4338ca;background:#eef2ff}
  .sg-dates{display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin:12px 0}
  .sg-dates label{display:grid;gap:6px;color:#334155;font-size:12px;font-weight:750}
  .sg-dates input{border:1px solid #cbd5e1;border-radius:9px;padding:8px;color:#0f172a;background:#fff}
  .sg-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:16px 0}
  .sg-card{border:1px solid #dce4f0;background:#f8faff;padding:16px;border-radius:14px;display:grid;gap:8px}
  .sg-card.green{background:#effcf7;border-color:#bbf7d0}
  .sg-card.purple{background:#f5f3ff;border-color:#ddd6fe}
  .sg-card span{color:#64748b;font-size:12px}
  .sg-card strong{font-size:27px;line-height:1.2;color:#0f172a}
  .sg-card small{font-size:11px;color:#64748b}
  .sg-chart{border:1px solid #e2e8f0;padding:16px;border-radius:14px;overflow:hidden}
  .sg-chart h4{font-size:15px;margin:0 0 4px}
  .sg-series{margin:8px 0 0}
  .sg-scroll{overflow-x:auto;max-width:100%;margin-top:14px;padding-bottom:5px}
  .sg-bars{display:flex;align-items:flex-end;gap:8px;min-height:225px;padding:12px 4px 0}
  .sg-column{flex:1 0 36px;min-width:36px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;color:#64748b}
  .sg-value{font-size:10px;font-weight:800;color:#334155}
  .sg-bar{max-width:32px;width:100%;min-height:2px;border-radius:5px 5px 0 0;background:linear-gradient(180deg,#818cf8,#4f46e5)}
  .sg-bar.episodes{background:linear-gradient(180deg,#34d399,#059669)}
  .sg-label{font-size:10px;white-space:nowrap;text-align:center}
  .sg-footer{margin-top:13px}
  .sg-error{background:#fef2f2;color:#b91c1c;padding:12px;border-radius:10px;font-size:13px;margin:12px 0}
  @media(max-width:650px){.sg-root{padding:13px}.sg-cards{grid-template-columns:1fr}}
`

export default function StoryGrowthSection() {
  const [snapshot, setSnapshot] = useState(() => readCache(adminToken(), todayKH()))
  const [loading, setLoading] = useState(() => !readCache(adminToken(), todayKH()))
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('7d')
  const [metric, setMetric] = useState('updated_stories')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    let active = true
    const stored = readCache(adminToken(), todayKH())
    if (stored) {
      setSnapshot(stored)
      setLoading(false)
    } else {
      setLoading(true)
      fetchDailySnapshot()
        .then((data) => { if (active) { setSnapshot(data); setError('') } })
        .catch((reason) => { if (active) setError(reason.message || 'Failed to load Story Growth') })
        .finally(() => { if (active) setLoading(false) })
    }
    return () => { active = false }
  }, [])

  const days = snapshot?.days || []
  const asOf = snapshot?.as_of || ''
  const firstDay = days[0]?.date || ''
  const periodLabel = PERIODS.find((item) => item.key === period)?.label || 'Selected period'
  const from = period === 'custom' ? (customFrom || shiftDay(asOf, -6)) : periodStart(period, asOf || '2000-01-01')
  const to = period === 'custom' ? (customTo || asOf) : asOf
  const validRange = Boolean(asOf && firstDay && from >= firstDay && to <= asOf &&
    (from <= to || period === 'week' || period === 'month'))

  const selected = useMemo(() => (
    validRange && from <= to
      ? days.filter((row) => row.date >= from && row.date <= to)
      : []
  ), [days, from, to, validRange])

  const updatedStories = sumMetric(selected, 'updated_stories')
  const newEpisodes = sumMetric(selected, 'new_episodes')
  const last30 = sumMetric(days.filter((row) => row.date >= shiftDay(asOf || '2000-01-01', -29)), 'updated_stories')
  const last365 = sumMetric(days, 'updated_stories')

  const monthly = period === 'year' || selected.length > 45
  const bars = useMemo(() => {
    if (!monthly) return selected.map((row) => ({
      key: row.date, label: row.date.slice(5), value: row[metric],
    }))
    const groups = new Map()
    for (const row of selected) {
      const month = row.date.slice(0, 7)
      groups.set(month, (groups.get(month) || 0) + row[metric])
    }
    return [...groups].map(([key, value]) => ({
      key, label: key.slice(2), value,
    }))
  }, [selected, monthly, metric])

  const maxValue = Math.max(1, ...bars.map((bar) => bar.value))
  const seriesLabel = metric === 'updated_stories' ? 'Updated Stories' : 'New Episodes'

  return (
    <section className="sg-root">
      <style>{STYLES}</style>
      <div className="sg-heading">
        <div>
          <h3>Story Growth</h3>
          <p className="sg-muted">First-time published episodes · Unique stories per day · Cambodia time</p>
        </div>
        <span className="sg-pill">Daily snapshot · Not real time</span>
      </div>

      {loading ? <p className="sg-muted" role="status">Loading Story Growth snapshot...</p> : null}
      {error ? <div className="sg-error" role="alert">{error}</div> : null}

      {snapshot ? (
        <>
          <div className="sg-periods" aria-label="Story growth date range">
            {PERIODS.map((item) => (
              <button key={item.key} type="button" aria-pressed={period === item.key}
                onClick={() => setPeriod(item.key)}>{item.label}</button>
            ))}
          </div>

          {period === 'custom' ? (
            <div className="sg-dates">
              <label>From
                <input type="date" min={firstDay} max={asOf}
                  value={customFrom || shiftDay(asOf, -6)}
                  onChange={(event) => setCustomFrom(event.target.value)} />
              </label>
              <label>To
                <input type="date" min={firstDay} max={asOf}
                  value={customTo || asOf}
                  onChange={(event) => setCustomTo(event.target.value)} />
              </label>
            </div>
          ) : null}

          {!validRange ? (
            <div className="sg-error" role="alert">Select a date range within the saved 365-day history.</div>
          ) : null}

          <div className="sg-cards">
            <div className="sg-card">
              <span>{periodLabel} · Updated Stories</span>
              <strong>{validRange ? number(updatedStories) : '—'}</strong>
              <small>Daily distinct stories, summed over selected days</small>
            </div>
            <div className="sg-card green">
              <span>{periodLabel} · New Episodes</span>
              <strong>{validRange ? number(newEpisodes) : '—'}</strong>
              <small>First-time published episodes only</small>
            </div>
            <div className="sg-card purple">
              <span>Last 30 days · Updated Stories</span>
              <strong>{number(last30)}</strong>
              <small>Last 365 days: {number(last365)} daily story updates</small>
            </div>
          </div>

          <div className="sg-chart">
            <div className="sg-chart-heading">
              <div>
                <h4>{periodLabel} · {seriesLabel}</h4>
                <p className="sg-muted">{from <= to && validRange
                  ? `${fmtDate(from)} – ${fmtDate(to)}`
                  : 'No completed days in this period yet'}</p>
              </div>
              <div className="sg-series" aria-label="Chart metric">
                <button type="button" aria-pressed={metric === 'updated_stories'}
                  onClick={() => setMetric('updated_stories')}>Updated Stories</button>
                <button type="button" aria-pressed={metric === 'new_episodes'}
                  onClick={() => setMetric('new_episodes')}>New Episodes</button>
              </div>
            </div>

            {validRange && bars.length ? (
              <div className="sg-scroll">
                <div className="sg-bars" role="img"
                  aria-label={`${periodLabel}: ${number(sumMetric(selected, metric))} ${seriesLabel.toLowerCase()}`}>
                  {bars.map((bar) => (
                    <div className="sg-column" key={bar.key}
                      title={`${bar.key}: ${number(bar.value)} ${seriesLabel.toLowerCase()}`}>
                      <span className="sg-value">{number(bar.value)}</span>
                      <div className={`sg-bar ${metric === 'new_episodes' ? 'episodes' : ''}`}
                        style={{ height: `${Math.max(2, Math.round(bar.value / maxValue * 155))}px` }} />
                      <span className="sg-label">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : validRange ? (
              <p className="sg-muted" style={{ marginTop: 12 }}>No completed days in this range.</p>
            ) : null}
          </div>

          <p className="sg-muted sg-footer">
            Available through {fmtDate(asOf)}. Today is excluded. Historical snapshots are
            retained for 365 days and do not decrease after author deletions.
            Changing chart filters does not request Supabase or the backend.
          </p>
        </>
      ) : null}
    </section>
  )
}
