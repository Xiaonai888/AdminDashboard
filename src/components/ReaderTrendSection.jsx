import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_KEY = 'shadow_admin_reader_trend_v2'
const DAY_MS = 86400000
let memoryCache = null
let inFlight = null

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

function shiftDay(day, amount) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + amount * DAY_MS).toISOString().slice(0, 10)
}

function startOfWeek(day) {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay()
  return shiftDay(day, -((weekday + 6) % 7))
}

function getCache() {
  const key = cambodiaDay()
  if (memoryCache?.key === key) return memoryCache.data

  try {
    const entry = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (
      entry?.key === key &&
      /^\d{4}-\d{2}-\d{2}$/.test(entry.data?.as_of || '') &&
      Array.isArray(entry.data?.days)
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
  if (inFlight?.key === key) return inFlight.promise

  const promise = (async () => {
    const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
    if (!token) throw new Error('Admin session required')

    const response = await fetch(`${API_URL}/api/admin/community/readers/daily?source=activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || `Failed to load reader trend (${response.status})`)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.as_of || '') || !Array.isArray(data.days)) {
      throw new Error('Invalid daily reader snapshot')
    }

    const snapshot = {
      as_of: data.as_of,
      tracking_since: data.tracking_since || null,
      days: data.days,
    }
    const entry = { key, data: snapshot }
    memoryCache = entry

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
    } catch {
      return snapshot
    }

    return snapshot
  })()

  inFlight = { key, promise }
  try {
    return await promise
  } finally {
    if (inFlight?.promise === promise) inFlight = null
  }
}

const PERIODS = [
  { key: 'latest', label: 'Latest day' },
  { key: '7d', label: 'Last 7 days' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'custom', label: 'Custom' },
]

function getPeriodStart(period, asOf) {
  if (period === 'latest') return asOf
  if (period === '7d') return shiftDay(asOf, -6)
  if (period === '30d') return shiftDay(asOf, -29)
  if (period === 'week') return startOfWeek(cambodiaDay())
  if (period === 'month') return `${cambodiaDay().slice(0, 7)}-01`
  return shiftDay(asOf, -6)
}

function formatDate(day) {
  if (!day) return '—'
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function number(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
}

function average(rows) {
  if (!rows.length) return null
  return Math.round((rows.reduce((sum, row) => sum + row.count, 0) / rows.length) * 10) / 10
}

export default function ReaderTrendSection() {
  const [snapshot, setSnapshot] = useState(() => getCache())
  const [loading, setLoading] = useState(() => !getCache())
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('7d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    let alive = true
    const cached = getCache()

    if (cached) {
      setSnapshot(cached)
      setLoading(false)
      return () => { alive = false }
    }

    setLoading(true)
    loadSnapshot()
      .then((data) => {
        if (!alive) return
        setSnapshot(data)
        setError('')
      })
      .catch((reason) => {
        if (alive) setError(reason.message || 'Failed to load reader trend')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => { alive = false }
  }, [])

  const days = useMemo(() => (snapshot?.days || [])
    .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date || '') && Number.isFinite(Number(row.readers)))
    .map((row) => ({ date: row.date, count: Math.max(0, Number(row.readers)) }))
    .sort((a, b) => a.date.localeCompare(b.date)), [snapshot])

  const asOf = snapshot?.as_of || ''
  const firstDay = days[0]?.date || ''
  const customDefaultFrom = asOf
    ? firstDay && shiftDay(asOf, -6) < firstDay ? firstDay : shiftDay(asOf, -6)
    : ''
  const from = period === 'custom'
    ? customFrom || customDefaultFrom
    : asOf ? getPeriodStart(period, asOf) : ''
  const to = period === 'custom' ? customTo || asOf : asOf
  const validRange = Boolean(
    asOf && from && to && to <= asOf &&
    (from <= to || ['week', 'month'].includes(period))
  )
  const selected = useMemo(() => validRange
    ? days.filter((row) => row.date >= from && row.date <= to)
    : [], [days, from, to, validRange])

  const yesterday = days.find((row) => row.date === asOf)
  const last7 = days.filter((row) => asOf && row.date >= shiftDay(asOf, -6) && row.date <= asOf)
  const last30 = days.filter((row) => asOf && row.date >= shiftDay(asOf, -29) && row.date <= asOf)
  const average7 = average(last7)
  const average30 = average(last30)
  const maxValue = Math.max(1, ...selected.map((row) => row.count))
  const periodLabel = PERIODS.find((item) => item.key === period)?.label || 'Selected period'
  const partlyAvailable = Boolean(validRange && firstDay && from < firstDay)
  const noCompletedDays = Boolean(snapshot && !loading && !days.length)

  return (
    <section className="rt-root">
      <style>{`
        .rt-root { padding: 22px; border: 1px solid #e2e8f0; border-radius: 20px; background: #fff; color: #0f172a; }
        .rt-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 16px; }
        .rt-heading h3 { margin: 0 0 5px; font-size: 21px; font-weight: 850; }
        .rt-muted { margin: 0; color: #64748b; font-size: 12px; line-height: 1.6; }
        .rt-pill { padding: 7px 12px; border-radius: 999px; color: #047857; background: #ecfdf5; font-size: 12px; font-weight: 750; }
        .rt-periods { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
        .rt-periods button { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; background: #fff; color: #334155; font-weight: 700; font-size: 12px; cursor: pointer; }
        .rt-periods button[aria-pressed="true"] { border-color: #4f46e5; background: #eef2ff; color: #4338ca; }
        .rt-dates { display: flex; flex-wrap: wrap; align-items: end; gap: 12px; margin: 12px 0; }
        .rt-dates label { display: grid; gap: 5px; font-size: 12px; color: #475569; font-weight: 700; }
        .rt-dates input { border: 1px solid #cbd5e1; border-radius: 9px; padding: 7px; color: #0f172a; background: #fff; max-width: 100%; }
        .rt-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 17px 0; }
        .rt-card { border: 1px solid #e2e8f0; background: #f8faff; border-radius: 14px; padding: 16px; display: grid; gap: 7px; }
        .rt-card span { font-size: 12px; color: #64748b; }
        .rt-card strong { color: #0f172a; font-size: 26px; line-height: 1.2; }
        .rt-card small { color: #64748b; font-size: 11px; }
        .rt-chart { border: 1px solid #e2e8f0; border-radius: 14px; padding: 15px; overflow: hidden; }
        .rt-chart h4 { margin: 0 0 5px; font-size: 15px; }
        .rt-scroll { overflow-x: auto; margin-top: 15px; }
        .rt-bars { display: flex; align-items: end; gap: 8px; min-height: 212px; padding: 12px 4px 0; }
        .rt-column { min-width: 32px; flex: 1 0 32px; display: flex; flex-direction: column; justify-content: end; align-items: center; gap: 6px; font-size: 10px; color: #64748b; }
        .rt-value { font-weight: 750; color: #334155; }
        .rt-bar { width: 100%; max-width: 32px; border-radius: 5px 5px 0 0; background: linear-gradient(180deg, #818cf8, #4f46e5); min-height: 2px; }
        .rt-label { white-space: nowrap; text-align: center; }
        .rt-error { background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 10px; }
        .rt-note { margin-top: 12px; line-height: 1.6; }
        .rt-empty { padding: 34px 12px; text-align: center; }
        .dark .rt-root, [data-theme="dark"] .rt-root, .dark-mode .rt-root { background: #151b2b; border-color: #334155; color: #f8fafc; }
        .dark .rt-card, [data-theme="dark"] .rt-card, .dark-mode .rt-card { background: #1e293b; border-color: #334155; }
        .dark .rt-card strong, [data-theme="dark"] .rt-card strong, .dark-mode .rt-card strong { color: #f8fafc; }
        .dark .rt-chart, [data-theme="dark"] .rt-chart, .dark-mode .rt-chart { border-color: #334155; }
        .dark .rt-periods button, [data-theme="dark"] .rt-periods button, .dark-mode .rt-periods button { background: #1e293b; border-color: #334155; color: #cbd5e1; }
        .dark .rt-periods button[aria-pressed="true"], [data-theme="dark"] .rt-periods button[aria-pressed="true"], .dark-mode .rt-periods button[aria-pressed="true"] { background: #312e81; border-color: #818cf8; color: #fff; }
        .dark .rt-value, [data-theme="dark"] .rt-value, .dark-mode .rt-value { color: #e2e8f0; }
        @media(max-width:650px) { .rt-root { padding: 13px; } .rt-cards { grid-template-columns: 1fr; } }
      `}</style>

      <div className="rt-heading">
        <div>
          <h3>Reader Trend</h3>
          <p className="rt-muted">Daily unique readers · completed days only · Cambodia time</p>
        </div>
        <span className="rt-pill">Daily snapshot · not real time</span>
      </div>

      {loading ? <p className="rt-muted" role="status">Loading daily reader snapshot...</p> : null}
      {error ? <p className="rt-error" role="alert">{error}</p> : null}

      {snapshot && !loading ? (
        <>
          <div className="rt-periods" aria-label="Reader trend time range">
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
            <div className="rt-dates">
              <label>
                From
                <input
                  type="date"
                  min={firstDay}
                  max={asOf}
                  value={customFrom || customDefaultFrom}
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

          {!validRange ? <p className="rt-error" role="alert">Choose a valid date range.</p> : null}

          <div className="rt-cards">
            <div className="rt-card">
              <span>Yesterday</span>
              <strong>{yesterday ? number(yesterday.count) : '—'}</strong>
              <small>Unique readers on {formatDate(asOf)}</small>
            </div>
            <div className="rt-card">
              <span>Last 7 days</span>
              <strong>{average7 === null ? '—' : number(average7)}</strong>
              <small>Average readers per recorded day</small>
            </div>
            <div className="rt-card">
              <span>Last 30 days</span>
              <strong>{average30 === null ? '—' : number(average30)}</strong>
              <small>Average readers per recorded day</small>
            </div>
          </div>

          <div className="rt-chart">
            <h4>{periodLabel} · daily unique readers</h4>
            <p className="rt-muted">
              {validRange
                ? `${formatDate(from)} – ${formatDate(to)}`
                : 'Invalid date range'}
            </p>

            {validRange && selected.length ? (
              <div className="rt-scroll">
                <div className="rt-bars" role="img" aria-label={`${periodLabel} reader counts by day`}>
                  {selected.map((row) => (
                    <div className="rt-column" key={row.date} title={`${row.date}: ${number(row.count)} readers`}>
                      <span className="rt-value">{number(row.count)}</span>
                      <div
                        className="rt-bar"
                        style={{ height: `${Math.max(2, Math.round(row.count / maxValue * 155))}px` }}
                      />
                      <span className="rt-label">{row.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : validRange ? (
              <div className="rt-empty rt-muted">
                {noCompletedDays ? 'No completed reader records available yet.' : 'No completed reader records in this date range.'}
              </div>
            ) : null}
          </div>

          {partlyAvailable ? (
            <p className="rt-muted rt-note">The selected range starts before the available history. Only recorded dates are shown; missing history is not shown as zero.</p>
          ) : null}
          <p className="rt-muted rt-note">
            Available from {formatDate(firstDay || snapshot.tracking_since)} through {formatDate(asOf)}. Today is excluded. Recovered historical logs may be incomplete. Changing the date filter does not make another backend request.
          </p>
        </>
      ) : null}
    </section>
  )
}
