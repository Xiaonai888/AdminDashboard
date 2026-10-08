import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_KEY = 'shadow_admin_reader_trend_v1'
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
  const date = new Date(`${day}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

function cachedSnapshot() {
  const key = cambodiaDay()
  if (memoryCache?.key === key) return memoryCache.data
  try {
    const item = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (item?.key === key && Array.isArray(item.data?.days)) {
      memoryCache = item
      return item.data
    }
  } catch {}
  return null
}

async function loadTrend() {
  const saved = cachedSnapshot()
  if (saved) return saved

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
      throw new Error(data.message || 'Failed to load reader trend')
    }
    if (!Array.isArray(data.days) || !/^\d{4}-\d{2}-\d{2}$/.test(data.as_of || '')) {
      throw new Error('Invalid reader trend data')
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
    } catch {}
    return snapshot
  })()

  inFlight = { key, promise }
  try {
    return await promise
  } finally {
    if (inFlight?.promise === promise) inFlight = null
  }
}

function prettyDay(value, language) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00Z`).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function ReaderTrendSection() {
  const [snapshot, setSnapshot] = useState(() => cachedSnapshot())
  const [loading, setLoading] = useState(!cachedSnapshot())
  const [error, setError] = useState('')
  const [range, setRange] = useState(30)
  const preferredLanguage = String(document.documentElement.lang || localStorage.getItem('i18nextLng') || 'en').toLowerCase()
  const language = preferredLanguage.startsWith('km') ? 'km' : 'en'
  const t = language === 'km'
    ? {
        title: 'ក្រាបអ្នកអានប្រចាំថ្ងៃ',
        subtitle: 'អ្នកអានម្នាក់ រាប់តែម្តងក្នុងមួយថ្ងៃ · ម៉ោងកម្ពុជា',
        last7: '៧ ថ្ងៃ',
        last30: '៣០ ថ្ងៃ',
        yesterday: 'ម្សិលមិញ',
        average: 'មធ្យមប្រចាំថ្ងៃ',
        peak: 'ច្រើនបំផុត',
        loading: 'កំពុងទាញទិន្នន័យ...',
        empty: 'មិនទាន់មានទិន្នន័យអ្នកអានប្រចាំថ្ងៃទេ។',
        tracked: 'មានទិន្នន័យចាប់ពី',
        note: 'បង្ហាញតែថ្ងៃដែលបានបញ្ចប់ មិនរាប់បញ្ចូលថ្ងៃនេះ។ កាលបរិច្ឆេទមុនពេលចាប់ផ្ដើមកត់ត្រាមិនត្រូវបានសន្មតថាសូន្យទេ។',
        readers: 'អ្នកអាន',
      }
    : {
        title: 'Reader Trend',
        subtitle: 'One unique reader per completed day · Cambodia time',
        last7: '7 days',
        last30: '30 days',
        yesterday: 'Yesterday',
        average: 'Daily average',
        peak: 'Peak day',
        loading: 'Loading reader trend...',
        empty: 'No completed reader activity data yet.',
        tracked: 'Tracking available from',
        note: 'Completed days only; today is excluded. Dates before activity tracking started are not treated as zero.',
        readers: 'readers',
      }

  useEffect(() => {
    let alive = true
    const saved = cachedSnapshot()
    if (saved) {
      setSnapshot(saved)
      setLoading(false)
      return () => { alive = false }
    }

    setLoading(true)
    loadTrend()
      .then((result) => {
        if (!alive) return
        setSnapshot(result)
        setError('')
      })
      .catch((reason) => { if (alive) setError(reason.message || 'Failed to load reader trend') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const allDays = useMemo(() =>
    (snapshot?.days || [])
      .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date || ''))
      .map((row) => ({ date: row.date, count: Math.max(0, Number(row.readers) || 0) }))
      .sort((a, b) => a.date.localeCompare(b.date)), [snapshot]
  )
  const asOf = snapshot?.as_of || ''
  const rangeStart = asOf ? shiftDay(asOf, 1 - range) : ''
  const days = allDays.filter((row) => row.date >= rangeStart && row.date <= asOf)
  const yesterday = allDays.find((row) => row.date === asOf)
  const peak = Math.max(0, ...days.map((row) => row.count))
  const average = days.length ? days.reduce((sum, row) => sum + row.count, 0) / days.length : 0
  const maxValue = Math.max(1, peak)
  const formatNumber = (n) => Number(n || 0).toLocaleString(language === 'km' ? 'km-KH' : 'en-US')
  const points = days.map((row, index) => ({
    ...row,
    x: days.length === 1 ? 460 : 58 + (804 * index) / (days.length - 1),
    y: 222 - (row.count / maxValue) * 172,
  }))
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPoints = points.length > 1
    ? `58,222 ${linePoints} 862,222`
    : ''

  return (
    <section className="reader-trend-panel">
      <style>{`
        .reader-trend-panel { color: #0f172a; background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; }
        .reader-trend-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .reader-trend-header h3 { margin: 0 0 5px; font-size: 19px; font-weight: 900; }
        .reader-trend-secondary { font-size: 12px; font-weight: 650; color: #64748b; margin: 0; line-height: 1.6; }
        .reader-trend-controls { display: flex; gap: 6px; padding: 4px; border-radius: 12px; background: #f1f5f9; }
        .reader-trend-controls button { border: 0; border-radius: 9px; padding: 9px 14px; background: transparent; color: #475569; cursor: pointer; font-size: 12px; font-weight: 850; }
        .reader-trend-controls button[aria-pressed="true"] { background: #4f46e5; color: #fff; }
        .reader-trend-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
        .reader-trend-stat { padding: 15px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8faff; display: grid; gap: 7px; }
        .reader-trend-stat span { font-size: 11px; color: #64748b; font-weight: 800; }
        .reader-trend-stat strong { font-size: 25px; color: #0f172a; font-weight: 900; }
        .reader-trend-chart { border: 1px solid #e2e8f0; border-radius: 15px; background: #fff; overflow: hidden; padding: 10px 10px 0; }
        .reader-trend-chart svg { display: block; width: 100%; min-width: 300px; height: auto; }
        .reader-trend-chart .axis { fill: #64748b; font-size: 12px; font-weight: 700; }
        .reader-trend-chart .grid { stroke: #e2e8f0; stroke-dasharray: 3 5; }
        .reader-trend-empty { padding: 48px 12px; text-align: center; color: #64748b; font-weight: 700; }
        .reader-trend-note { margin: 14px 0 0; }
        .dark .reader-trend-panel, [data-theme="dark"] .reader-trend-panel, .dark-mode .reader-trend-panel { background: #151b2b; border-color: #334155; color: #f8fafc; }
        .dark .reader-trend-header h3, [data-theme="dark"] .reader-trend-header h3, .dark-mode .reader-trend-header h3, .dark .reader-trend-stat strong, [data-theme="dark"] .reader-trend-stat strong, .dark-mode .reader-trend-stat strong { color: #f8fafc; }
        .dark .reader-trend-stat, [data-theme="dark"] .reader-trend-stat, .dark-mode .reader-trend-stat { background: #1e293b; border-color: #334155; }
        .dark .reader-trend-chart, [data-theme="dark"] .reader-trend-chart, .dark-mode .reader-trend-chart { background: #151b2b; border-color: #334155; }
        .dark .reader-trend-chart .grid, [data-theme="dark"] .reader-trend-chart .grid, .dark-mode .reader-trend-chart .grid { stroke: #334155; }
        .dark .reader-trend-controls, [data-theme="dark"] .reader-trend-controls, .dark-mode .reader-trend-controls { background: #334155; }
        .dark .reader-trend-controls button, [data-theme="dark"] .reader-trend-controls button, .dark-mode .reader-trend-controls button { color: #cbd5e1; }
        .dark .reader-trend-controls button[aria-pressed="true"], [data-theme="dark"] .reader-trend-controls button[aria-pressed="true"], .dark-mode .reader-trend-controls button[aria-pressed="true"] { color: #fff; }
        @media(max-width:640px) { .reader-trend-panel { padding: 13px; } .reader-trend-stats { gap: 7px; } .reader-trend-stat { padding: 10px; } .reader-trend-stat strong { font-size: 19px; } }
      `}</style>
      <div className="reader-trend-header">
        <div>
          <h3>{t.title}</h3>
          <p className="reader-trend-secondary">{t.subtitle}</p>
        </div>
        <div className="reader-trend-controls">
          <button type="button" aria-pressed={range === 7} onClick={() => setRange(7)}>{t.last7}</button>
          <button type="button" aria-pressed={range === 30} onClick={() => setRange(30)}>{t.last30}</button>
        </div>
      </div>
      {loading ? <p className="reader-trend-secondary" role="status">{t.loading}</p> : null}
      {error ? <p role="alert" style={{ color: '#dc2626' }}>{error}</p> : null}
      {!loading && !error && snapshot ? (
        <>
          <div className="reader-trend-stats">
            <div className="reader-trend-stat"><span>{t.yesterday}</span><strong>{yesterday ? formatNumber(yesterday.count) : '—'}</strong></div>
            <div className="reader-trend-stat"><span>{t.average}</span><strong>{days.length ? formatNumber(average.toFixed(1)) : '—'}</strong></div>
            <div className="reader-trend-stat"><span>{t.peak}</span><strong>{days.length ? formatNumber(peak) : '—'}</strong></div>
          </div>
          <div className="reader-trend-chart">
            {points.length ? (
              <svg viewBox="0 0 920 284" role="img" aria-label={`${t.title}: ${days.length} days`}>
                <defs>
                  <linearGradient id="readerTrendFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.26" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((value) => (
                  <g key={value}>
                    <line className="grid" x1="58" y1={222 - value * 172} x2="862" y2={222 - value * 172} />
                    <text className="axis" x="46" y={226 - value * 172} textAnchor="end">{formatNumber(Math.round(maxValue * value))}</text>
                  </g>
                ))}
                {areaPoints ? <polygon points={areaPoints} fill="url(#readerTrendFill)" /> : null}
                {points.length > 1 ? <polyline points={linePoints} fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /> : null}
                {points.map((point, index) => (
                  <g key={point.date}>
                    <circle cx={point.x} cy={point.y} r="5" fill="#6366f1" stroke="#fff" strokeWidth="2">
                      <title>{`${point.date}: ${formatNumber(point.count)} ${t.readers}`}</title>
                    </circle>
                    {(index === 0 || index === points.length - 1 || index % Math.max(1, Math.ceil(points.length / 7)) === 0) ? (
                      <text className="axis" x={point.x} y="253" textAnchor="middle">{point.date.slice(5)}</text>
                    ) : null}
                  </g>
                ))}
              </svg>
            ) : (
              <p className="reader-trend-empty">{t.empty}</p>
            )}
          </div>
          {snapshot.tracking_since ? (
            <p className="reader-trend-secondary reader-trend-note">{t.tracked} {prettyDay(snapshot.tracking_since, language)} · {t.note}</p>
          ) : (
            <p className="reader-trend-secondary reader-trend-note">{t.note}</p>
          )}
        </>
      ) : null}
    </section>
  )
}
