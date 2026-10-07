import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_KEY = 'shadow_admin_daily_readers_v1'
const DAY_MS = 86400000
let memoryCache = null
let inflight = null

function cambodiaDay() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function shiftDay(date, amount) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + amount * DAY_MS).toISOString().slice(0, 10)
}

function startOfWeek(date) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  return shiftDay(date, -((weekday + 6) % 7))
}

function getCache() {
  const key = cambodiaDay()

  if (memoryCache?.key === key) return memoryCache.data

  try {
    const entry = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')

    if (
      entry?.key === key &&
      Array.isArray(entry.data?.days) &&
      /^\d{4}-\d{2}-\d{2}$/.test(entry.data?.as_of || '')
    ) {
      memoryCache = entry
      return entry.data
    }
  } catch {
    return null
  }

  return null
}

async function loadSnapshot() {
  const cached = getCache()
  if (cached) return cached

  const key = cambodiaDay()
  if (inflight?.key === key) return inflight.promise

  const promise = (async () => {
    const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
    if (!token) throw new Error('Admin session required')

    const response = await fetch(`${API_URL}/api/admin/community/readers/daily`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `Request failed (${response.status})`)
    }

    if (!Array.isArray(data.days) || !/^\d{4}-\d{2}-\d{2}$/.test(data.as_of || '')) {
      throw new Error('Invalid daily readers snapshot')
    }

    const stored = {
      as_of: data.as_of,
      tracking_since: data.tracking_since || null,
      days: data.days,
    }
    const entry = { key, data: stored }

    memoryCache = entry

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
    } catch {
      return stored
    }

    return stored
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

function getPeriodStart(period, asOf) {
  if (period === 'latest') return asOf
  if (period === '7d') return shiftDay(asOf, -6)
  if (period === '30d') return shiftDay(asOf, -29)
  if (period === 'week') return startOfWeek(asOf)
  if (period === 'month') return `${asOf.slice(0, 7)}-01`
  if (period === 'year') return shiftDay(asOf, -364)
  return shiftDay(asOf, -6)
}

function formatDate(date) {
  if (!date) return '-'

  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function number(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

function average(rows) {
  if (!rows.length) return 0
  return Math.round((rows.reduce((sum, row) => sum + row.count, 0) / rows.length) * 10) / 10
}

export default function DailyReadersSection() {
  const initialCache = getCache()
  const [snapshot, setSnapshot] = useState(initialCache)
  const [loading, setLoading] = useState(!initialCache)
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
      return () => {
        alive = false
      }
    }

    setLoading(true)

    loadSnapshot()
      .then((result) => {
        if (!alive) return
        setSnapshot(result)
        setError('')
      })
      .catch((reason) => {
        if (alive) setError(reason.message || 'Failed to load daily readers')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const days = useMemo(
    () =>
      (snapshot?.days || [])
        .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date || ''))
        .map((row) => ({
          date: row.date,
          count: Math.max(0, Number(row.readers) || 0),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [snapshot]
  )

  const asOf = snapshot?.as_of || ''
  const trackingSince = snapshot?.tracking_since || days[0]?.date || ''
  const firstDay = days[0]?.date || trackingSince || asOf
  const from =
    period === 'custom'
      ? customFrom || getPeriodStart('7d', asOf || '2000-01-01')
      : getPeriodStart(period, asOf || '2000-01-01')
  const to = period === 'custom' ? customTo || asOf : asOf

  const validRange = Boolean(
    asOf &&
      firstDay &&
      from <= to &&
      to <= asOf
  )

  const selected = useMemo(
    () =>
      validRange
        ? days.filter((row) => row.date >= from && row.date <= to)
        : [],
    [days, from, to, validRange]
  )

  const last7 = useMemo(
    () => (asOf ? days.filter((row) => row.date >= shiftDay(asOf, -6) && row.date <= asOf) : []),
    [days, asOf]
  )

  const last30 = useMemo(
    () => (asOf ? days.filter((row) => row.date >= shiftDay(asOf, -29) && row.date <= asOf) : []),
    [days, asOf]
  )

  const yesterday = days.find((row) => row.date === asOf)?.count || 0
  const average7 = average(last7)
  const average30 = average(last30)
  const periodLabel = PERIODS.find((item) => item.key === period)?.label || 'Selected period'
  const monthly = period === 'year' || selected.length > 45

  const bars = useMemo(() => {
    if (!monthly) {
      return selected.map((row) => ({
        key: row.date,
        label: row.date.slice(5),
        count: row.count,
      }))
    }

    const groups = new Map()

    for (const row of selected) {
      const month = row.date.slice(0, 7)
      const current = groups.get(month) || { total: 0, days: 0 }
      current.total += row.count
      current.days += 1
      groups.set(month, current)
    }

    return [...groups].map(([key, value]) => ({
      key,
      label: key.slice(2),
      count: Math.round((value.total / Math.max(1, value.days)) * 10) / 10,
    }))
  }, [selected, monthly])

  const maxValue = Math.max(1, ...bars.map((bar) => bar.count))
  const noCompletedDays = Boolean(snapshot && !loading && days.length === 0)

  return (
    <section className="daily-readers-root">
      <style>{`
        .daily-readers-root { color: #0f172a; }
        .daily-readers-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 18px; box-shadow: 0 2px 8px rgba(15,23,42,.04); }
        .daily-readers-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
        .daily-readers-heading h3 { margin: 0 0 5px; font-size: 20px; font-weight: 950; }
        .daily-readers-muted { margin: 0; color: #64748b; font-size: 12px; font-weight: 700; }
        .daily-readers-pill { display: inline-flex; align-items: center; gap: 7px; padding: 7px 11px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 900; }
        .daily-readers-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }
        .daily-readers-periods { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 16px; }
        .daily-readers-periods button { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; background: #fff; color: #334155; font-weight: 800; font-size: 12px; cursor: pointer; }
        .daily-readers-periods button[aria-pressed="true"] { border-color: #4f46e5; background: #eef2ff; color: #4338ca; }
        .daily-readers-dates { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin: 0 0 16px; }
        .daily-readers-dates label { display: grid; gap: 5px; color: #475569; font-size: 11px; font-weight: 900; }
        .daily-readers-dates input { border: 1px solid #cbd5e1; border-radius: 9px; padding: 8px; color: #0f172a; background: #fff; }
        .daily-readers-cards { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; margin: 16px 0; }
        .daily-readers-card { border: 1px solid #e2e8f0; background: #f8faff; border-radius: 15px; padding: 16px; display: grid; gap: 6px; }
        .daily-readers-card span { color: #64748b; font-size: 11px; font-weight: 850; }
        .daily-readers-card strong { color: #0f172a; font-size: 27px; line-height: 1.1; font-weight: 950; }
        .daily-readers-card small { color: #94a3b8; font-size: 10.5px; font-weight: 750; }
        .daily-readers-chart { border: 1px solid #e2e8f0; border-radius: 15px; padding: 16px; }
        .daily-readers-chart h4 { margin: 0 0 4px; font-size: 15px; font-weight: 950; }
        .daily-readers-scroll { overflow-x: auto; margin-top: 15px; }
        .daily-readers-bars { display: flex; align-items: end; gap: 9px; min-height: 225px; padding: 10px 4px 0; }
        .daily-readers-column { min-width: 34px; flex: 1 0 34px; display: flex; flex-direction: column; justify-content: end; align-items: center; gap: 6px; color: #64748b; font-size: 10px; }
        .daily-readers-value { color: #334155; font-weight: 900; }
        .daily-readers-bar { width: 100%; max-width: 34px; min-height: 2px; border-radius: 6px 6px 0 0; background: linear-gradient(180deg,#818cf8,#4f46e5); }
        .daily-readers-label { white-space: nowrap; text-align: center; }
        .daily-readers-error { margin: 10px 0; border-radius: 11px; padding: 11px 12px; background: #fef2f2; color: #b91c1c; font-size: 12px; font-weight: 850; }
        .daily-readers-empty { min-height: 250px; display: grid; place-items: center; text-align: center; padding: 28px; border: 1px dashed #cbd5e1; border-radius: 15px; background: #f8fafc; }
        .daily-readers-empty strong { display: block; color: #0f172a; margin-bottom: 5px; }
        .daily-readers-footer { margin-top: 12px; line-height: 1.6; }
        @media(max-width:650px) { .daily-readers-panel { padding: 13px; } .daily-readers-cards { grid-template-columns: 1fr; } }
      `}</style>

      <div className="daily-readers-panel">
        <div className="daily-readers-heading">
          <div>
            <h3>Daily Readers</h3>
            <p className="daily-readers-muted">Unique readers per completed day · Cambodia time</p>
          </div>
          <span className="daily-readers-pill">
            <span className="daily-readers-dot" />
            Daily snapshot · today is not included
          </span>
        </div>

        {loading ? <p className="daily-readers-muted" role="status">Loading daily readers...</p> : null}
        {error ? <p className="daily-readers-error" role="alert">{error}</p> : null}

        {snapshot && !loading && !noCompletedDays ? (
          <>
            <div className="daily-readers-periods" aria-label="Daily reader time range">
              {PERIODS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={period === item.key}
                  onClick={() => setPeriod(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {period === 'custom' ? (
              <div className="daily-readers-dates">
                <label>
                  From
                  <input
                    type="date"
                    min={firstDay}
                    max={asOf}
                    value={customFrom || getPeriodStart('7d', asOf)}
                    onChange={(event) => setCustomFrom(event.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    min={firstDay}
                    max={asOf}
                    value={customTo || asOf}
                    onChange={(event) => setCustomTo(event.target.value)}
                  />
                </label>
              </div>
            ) : null}

            {!validRange ? (
              <p className="daily-readers-error" role="alert">
                Choose a valid range within the available tracking history.
              </p>
            ) : null}

            <div className="daily-readers-cards">
              <div className="daily-readers-card">
                <span>Yesterday</span>
                <strong>{number(yesterday)}</strong>
                <small>Unique readers</small>
              </div>
              <div className="daily-readers-card">
                <span>7-day Average</span>
                <strong>{number(average7)}</strong>
                <small>Average unique readers per completed day</small>
              </div>
              <div className="daily-readers-card">
                <span>30-day Average</span>
                <strong>{number(average30)}</strong>
                <small>Average unique readers per completed day</small>
              </div>
            </div>

            <div className="daily-readers-chart">
              <h4>{periodLabel} · {monthly ? 'average readers per day' : 'unique readers'}</h4>
              <p className="daily-readers-muted">
                {validRange ? `${formatDate(from)} – ${formatDate(to)}` : 'Invalid date range'}
              </p>

              {validRange && bars.length ? (
                <div className="daily-readers-scroll">
                  <div className="daily-readers-bars" role="img" aria-label={`${periodLabel} daily reader chart`}>
                    {bars.map((bar) => (
                      <div className="daily-readers-column" key={bar.key} title={`${bar.key}: ${number(bar.count)}`}>
                        <span className="daily-readers-value">{number(bar.count)}</span>
                        <div
                          className="daily-readers-bar"
                          style={{ height: `${Math.max(2, Math.round((bar.count / maxValue) * 165))}px` }}
                        />
                        <span className="daily-readers-label">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : validRange ? (
                <p className="daily-readers-muted">No completed days available in this range.</p>
              ) : null}
            </div>

            <p className="daily-readers-muted daily-readers-footer">
              Available through {formatDate(asOf)} · Today is not included. Tracking history begins from the daily activity system. Changing filters does not request the backend again.
            </p>
          </>
        ) : null}

        {noCompletedDays ? (
          <div className="daily-readers-empty">
            <div>
              <strong>No completed daily reader snapshot yet</strong>
              <p className="daily-readers-muted">The first graph bar will appear after the first tracked day is completed.</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
