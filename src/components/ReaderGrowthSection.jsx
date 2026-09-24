import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_KEY = 'shadow_admin_reader_growth_daily_v1'
const DAY_MS = 86400000
let memoryCache = null
let inflight = null

function cacheDay() {
  return new Date(Date.now() + 390 * 60000).toISOString().slice(0, 10)
}

function shiftDay(date, amount) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + amount * DAY_MS).toISOString().slice(0, 10)
}

function getCache() {
  const key = cacheDay()
  if (memoryCache?.key === key) return memoryCache.data
  try {
    const entry = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (entry?.key === key && Array.isArray(entry.data?.days) && /^\d{4}-\d{2}-\d{2}$/.test(entry.data?.as_of || '')) {
      memoryCache = entry
      return entry.data
    }
  } catch {
    return null
  }
  return null
}

async function loadSnapshot() {
  const fromCache = getCache()
  if (fromCache) return fromCache
  const key = cacheDay()
  if (inflight?.key === key) return inflight.promise
  const promise = (async () => {
    const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
    if (!token) throw new Error('Admin session required')
    const response = await fetch(`${API_URL}/api/admin/community/reader-growth/daily`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.ok === false) throw new Error(data.message || `Request failed (${response.status})`)
    if (!Array.isArray(data.days) || !/^\d{4}-\d{2}-\d{2}$/.test(data.as_of || '')) {
      throw new Error('Invalid reader growth snapshot')
    }
    const entry = { key, data: { as_of: data.as_of, days: data.days } }
    memoryCache = entry
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
    } catch {
      return entry.data
    }
    return entry.data
  })()
  inflight = { key, promise }
  try {
    return await promise
  } finally {
    if (inflight?.promise === promise) inflight = null
  }
}

const PERIODS = [
  { key: 'latest', label: 'Latest day' },
  { key: '7d', label: 'Last 7 days' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'year', label: 'Last 12 months' },
  { key: 'custom', label: 'Custom' },
]

function startOfLast12Months(date) {
  const [year, month] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 12, 1)).toISOString().slice(0, 10)
}

function getPeriodStart(period, asOf) {
  if (period === 'latest') return asOf
  if (period === '7d') return shiftDay(asOf, -6)
  if (period === '30d') return shiftDay(asOf, -29)
  if (period === 'month') return `${new Date(Date.now() + 420 * 60000).toISOString().slice(0, 7)}-01`
  if (period === 'year') return startOfLast12Months(asOf)
  if (period === 'week') {
    const today = new Date(Date.now() + 420 * 60000).toISOString().slice(0, 10)
    const weekday = new Date(`${today}T00:00:00Z`).getUTCDay()
    return shiftDay(today, -((weekday + 6) % 7))
  }
  return shiftDay(asOf, -6)
}

function sumDays(days, from, to) {
  return days.reduce((total, row) => total + (row.date >= from && row.date <= to ? row.count : 0), 0)
}

function formatDate(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

const number = (value) => new Intl.NumberFormat('en-US').format(value)

export default function ReaderGrowthSection() {
  const [snapshot, setSnapshot] = useState(() => getCache())
  const [loading, setLoading] = useState(() => !getCache())
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    let alive = true
    const stored = getCache()
    if (stored) {
      setSnapshot(stored)
      setLoading(false)
      return () => { alive = false }
    }
    setLoading(true)
    loadSnapshot().then((result) => {
      if (!alive) return
      setSnapshot(result)
      setError('')
    }).catch((reason) => {
      if (alive) setError(reason.message || 'Failed to load reader growth')
    }).finally(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const days = useMemo(() => (snapshot?.days || [])
    .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date || ''))
    .map((row) => ({ date: row.date, count: Math.max(0, Number(row.new_readers) || 0) }))
    .sort((a, b) => a.date.localeCompare(b.date)), [snapshot])
  const asOf = snapshot?.as_of || ''
  const firstDay = days[0]?.date || asOf
  const from = period === 'custom' ? (customFrom || shiftDay(asOf, -6)) : getPeriodStart(period, asOf || '2000-01-01')
  const to = period === 'custom' ? (customTo || asOf) : asOf
  const validRange = Boolean(asOf && from >= firstDay && to <= asOf && (from <= to || ['week', 'month'].includes(period)))
  const selected = useMemo(() => validRange ? days.filter((row) => row.date >= from && row.date <= to) : [], [days, from, to, validRange])
  const total = selected.reduce((sum, row) => sum + row.count, 0)
  const last30 = asOf ? sumDays(days, shiftDay(asOf, -29), asOf) : 0
  const last12 = asOf ? sumDays(days, startOfLast12Months(asOf), asOf) : 0
  const monthly = period === 'year' || selected.length > 45
  const bars = useMemo(() => {
    if (!monthly) return selected.map((row) => ({ key: row.date, label: row.date.slice(5), count: row.count }))
    const groups = new Map()
    for (const row of selected) {
      const month = row.date.slice(0, 7)
      groups.set(month, (groups.get(month) || 0) + row.count)
    }
    return [...groups].map(([key, count]) => ({ key, label: key.slice(2), count }))
  }, [selected, monthly])
  const maxValue = Math.max(1, ...bars.map((bar) => bar.count))
  const periodLabel = PERIODS.find((item) => item.key === period)?.label || 'Selected period'

  return (
    <section className="rg-root">
      <style>{`
        .rg-root { padding: 22px; color: #0f172a; }
        .rg-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 16px; }
        .rg-heading h3 { margin: 0 0 5px; font-size: 21px; font-weight: 850; }
        .rg-muted { margin: 0; color: #64748b; font-size: 12px; }
        .rg-pill { padding: 7px 12px; border-radius: 999px; color: #047857; background: #ecfdf5; font-size: 12px; font-weight: 750; }
        .rg-periods { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
        .rg-periods button { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; background: #fff; color: #334155; font-weight: 700; font-size: 12px; cursor: pointer; }
        .rg-periods button[aria-pressed="true"] { border-color: #4f46e5; background: #eef2ff; color: #4338ca; }
        .rg-dates { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin: 12px 0; }
        .rg-dates label { display: grid; gap: 5px; font-size: 12px; font-weight: 700; }
        .rg-dates input { border: 1px solid #cbd5e1; border-radius: 9px; padding: 7px; max-width: 100%; }
        .rg-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 17px 0; }
        .rg-card { border: 1px solid #e2e8f0; background: #f8faff; border-radius: 14px; padding: 16px; display: grid; gap: 7px; }
        .rg-card span { font-size: 12px; color: #64748b; }
        .rg-card strong { color: #0f172a; font-size: 26px; line-height: 1.2; }
        .rg-chart { border: 1px solid #e2e8f0; border-radius: 14px; padding: 15px; overflow: hidden; }
        .rg-chart h4 { margin: 0 0 5px; font-size: 15px; }
        .rg-scroll { overflow-x: auto; margin-top: 15px; }
        .rg-bars { display: flex; align-items: end; gap: 8px; min-height: 212px; padding: 12px 4px 0; }
        .rg-column { min-width: 32px; flex: 1 0 32px; display: flex; flex-direction: column; justify-content: end; align-items: center; gap: 6px; font-size: 10px; color: #64748b; }
        .rg-value { font-weight: 750; color: #334155; }
        .rg-bar { width: 100%; max-width: 32px; border-radius: 5px 5px 0 0; background: linear-gradient(180deg, #818cf8, #4f46e5); min-height: 2px; }
        .rg-label { white-space: nowrap; text-align: center; }
        .rg-error { background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 10px; }
        .rg-footer { margin-top: 12px; line-height: 1.6; }
        @media(max-width: 650px) { .rg-root { padding: 13px; } .rg-cards { grid-template-columns: 1fr; } }
      `}</style>
      <div className="rg-heading">
        <div>
          <h3>Reader Growth</h3>
          <p className="rg-muted">New registered accounts · counts only · Cambodia time</p>
        </div>
        <span className="rg-pill">Daily snapshot · not real time</span>
      </div>
      {loading ? <p className="rg-muted" role="status">Loading daily snapshot...</p> : null}
      {error ? <p className="rg-error" role="alert">{error}</p> : null}
      {snapshot && !loading ? (
        <>
          <div className="rg-periods" aria-label="Reader growth time range">
            {PERIODS.map((item) => (
              <button key={item.key} type="button" aria-pressed={period === item.key} onClick={() => setPeriod(item.key)}>{item.label}</button>
            ))}
          </div>
          {period === 'custom' ? (
            <div className="rg-dates">
              <label>From<input type="date" min={firstDay} max={asOf} value={customFrom || shiftDay(asOf, -6)} onChange={(event) => setCustomFrom(event.target.value)} /></label>
              <label>To<input type="date" min={firstDay} max={asOf} value={customTo || asOf} onChange={(event) => setCustomTo(event.target.value)} /></label>
            </div>
          ) : null}
          {!validRange ? <p className="rg-error" role="alert">Choose a valid range within the available snapshot.</p> : null}
          <div className="rg-cards">
            <div className="rg-card"><span>{periodLabel}</span><strong>{validRange ? number(total) : '—'}</strong></div>
            <div className="rg-card"><span>Last 30 days</span><strong>{number(last30)}</strong></div>
            <div className="rg-card"><span>Last 12 months</span><strong>{number(last12)}</strong></div>
          </div>
          <div className="rg-chart">
            <h4>{periodLabel} · new readers</h4>
            <p className="rg-muted">{validRange ? (from > to ? 'No completed days yet' : `${formatDate(from)} – ${formatDate(to)}`) : 'Invalid date range'}</p>
            {validRange && bars.length ? (
              <div className="rg-scroll">
                <div className="rg-bars" role="img" aria-label={`New reader registrations: ${number(total)} total`}>
                  {bars.map((bar) => (
                    <div className="rg-column" key={bar.key} title={`${bar.key}: ${number(bar.count)} new readers`}>
                      <span className="rg-value">{number(bar.count)}</span>
                      <div className="rg-bar" style={{ height: `${Math.max(2, Math.round(bar.count / maxValue * 155))}px` }} />
                      <span className="rg-label">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : validRange ? <p className="rg-muted">No completed days available in this range.</p> : null}
          </div>
          <p className="rg-muted rg-footer">Available through {formatDate(asOf)} · Today is not included. Data is cached for the snapshot day; changing filters does not request the backend.</p>
        </>
      ) : null}
    </section>
  )
}
