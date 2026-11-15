import React, { useEffect, useMemo, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const READER_URL = (import.meta.env.VITE_READER_URL || 'https://www.shadowerabook.site').replace(/\/+$/, '')
const PAGE_SIZE = 30
const CACHE_MS = 5 * 60 * 1000

const styles = `
.selection-history{background:#fff;border:1px solid #E2E8F0;border-radius:20px;overflow:hidden}
.selection-history *{box-sizing:border-box}
.selection-history-header{padding:20px;border-bottom:1px solid #E2E8F0}
.selection-history-title{font-size:16px;font-weight:900;color:#0F172A}
.selection-history-description,.selection-history-note{font-size:12px;color:#64748B;line-height:1.6;margin-top:5px}
.selection-history-actions,.selection-history-audiences{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.selection-history-button{border:1px solid #E2E8F0;background:white;color:#334155;font-size:12px;font-weight:800;padding:10px 12px;border-radius:11px;cursor:pointer}
.selection-history-button.active{background:#EEF2FF;border-color:#635BFF;color:#4F46E5}
.selection-history-button:disabled{opacity:.55;cursor:not-allowed}
.selection-history-body{padding:20px}
.selection-history-date-fields{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.selection-history-date-fields label{display:grid;gap:5px;font-size:11px;font-weight:800;color:#64748B}
.selection-history-date-fields input{border:1px solid #CBD5E1;border-radius:10px;padding:9px;color:#0F172A;background:#fff}
.selection-history-audiences{margin:16px 0}
.selection-history-audiences .selection-history-button{flex:1;min-width:160px}
.selection-history-meta{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.selection-history-meta span{font-size:11px;font-weight:800;padding:7px 10px;border-radius:999px;background:#F1F5F9;color:#475569}
.selection-history-message{border:1px solid #E2E8F0;background:#F8FAFC;color:#475569;border-radius:12px;padding:16px;font-size:13px}
.selection-history-message.error{border-color:#FECACA;background:#FEF2F2;color:#B91C1C}
.selection-history-day{margin-top:17px}
.selection-history-day h4{color:#0F172A;font-size:13px;font-weight:900;margin:0 0 10px}
.selection-history-card{border:1px solid #E2E8F0;background:#fff;border-radius:14px;padding:14px;margin-bottom:9px;display:flex;justify-content:space-between;gap:12px}
.selection-history-card.repeat{border-color:#FDBA74;background:#FFFBEB}
.selection-history-card-content{min-width:0}
.selection-history-card-title{font-size:13px;font-weight:900;color:#0F172A;overflow-wrap:anywhere}
.selection-history-card-info{font-size:11px;color:#64748B;margin-top:5px;overflow-wrap:anywhere}
.selection-history-card-labels{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}
.selection-history-card-labels span{font-size:10px;font-weight:800;border-radius:999px;padding:5px 8px;background:#F1F5F9;color:#334155}
.selection-history-card-labels .repeat{background:#FFEDD5;color:#9A3412}
.selection-history-card a{color:#4F46E5;text-decoration:none;font-size:12px;font-weight:800;white-space:nowrap;align-self:flex-start}
.selection-history-more{margin-top:12px;width:100%}
@media(max-width:720px){.selection-history-header,.selection-history-body{padding:14px}.selection-history-card{flex-direction:column}.selection-history-card a{align-self:flex-start}}
`

function dayInCambodia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const field = (name) => parts.find((part) => part.type === name)?.value
  return `${field('year')}-${field('month')}-${field('day')}`
}

function shiftDay(value, days) {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function getToken() {
  const session = sessionStorage.getItem('shadow_admin_token') || ''
  const token = session || localStorage.getItem('shadow_admin_token') || ''
  if (token && !session) sessionStorage.setItem('shadow_admin_token', token)
  return token
}

function timeInCambodia(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Phnom_Penh', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(date)
    : '—'
}

function safeStoryHref(value) {
  const match = String(value || '').match(/^\/story\/[a-zA-Z0-9_-]+(?:[/?#].*)?$/)
  return match ? `/story/${String(value).split('/')[2].split(/[?#]/)[0]}` : ''
}

function datesFor(preset, today) {
  if (preset === 'today') return { start: today, end: today }
  const yesterday = shiftDay(today, -1)
  const lengths = { yesterday: 1, week: 7, month: 30 }
  const days = lengths[preset] || 1
  return { start: shiftDay(yesterday, -(days - 1)), end: yesterday }
}

export default function TaskCenterSelectionHistoryPanel({ active = true }) {
  const [audience, setAudience] = useState('khmer')
  const [preset, setPreset] = useState('yesterday')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [entries, setEntries] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cache = useRef(new Map())
  const request = useRef(null)
  const today = dayInCambodia()
  const range = preset === 'custom'
    ? { start: customStart, end: customEnd }
    : datesFor(preset, today)
  const rangeValid = /^\d{4}-\d{2}-\d{2}$/.test(range.start) &&
    /^\d{4}-\d{2}-\d{2}$/.test(range.end) &&
    range.start <= range.end && range.end <= today &&
    (Date.parse(`${range.end}T00:00:00Z`) - Date.parse(`${range.start}T00:00:00Z`)) / 86400000 < 90
  const key = `${audience}:${range.start}:${range.end}`

  useEffect(() => {
    if (!active || !rangeValid) return undefined
    const controller = new AbortController()
    request.current?.abort()
    request.current = controller
    const cached = cache.current.get(key)
    if (cached && Date.now() - cached.when < CACHE_MS) {
      setEntries(cached.entries)
      setPage(cached.page)
      setTotal(cached.total)
      setHasMore(cached.hasMore)
      setLoading(false)
      setError('')
      return () => controller.abort()
    }
    setLoading(true)
    setError('')
    setEntries([])
    setPage(0)
    setTotal(0)
    setHasMore(false)
    const url = new URL(`${API_URL}/api/task-center/admin/selection-history`)
    url.searchParams.set('audience', audience)
    url.searchParams.set('start', range.start)
    url.searchParams.set('end', range.end)
    url.searchParams.set('page', '1')
    url.searchParams.set('limit', String(PAGE_SIZE))
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` }, signal: controller.signal })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.message || 'Unable to load selection history')
        return data
      })
      .then((data) => {
        if (controller.signal.aborted) return
        const next = {
          entries: data.entries || [], page: 1,
          total: Number(data.pagination?.total || 0),
          hasMore: Boolean(data.pagination?.has_more), when: Date.now(),
        }
        cache.current.set(key, next)
        setEntries(next.entries)
        setPage(next.page)
        setTotal(next.total)
        setHasMore(next.hasMore)
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message || 'Unable to load selection history')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [active, key, rangeValid])

  async function loadMore() {
    if (loading || !hasMore || request.current?.signal?.aborted) return
    setLoading(true)
    setError('')
    const nextPage = page + 1
    const url = new URL(`${API_URL}/api/task-center/admin/selection-history`)
    url.searchParams.set('audience', audience)
    url.searchParams.set('start', range.start)
    url.searchParams.set('end', range.end)
    url.searchParams.set('page', String(nextPage))
    url.searchParams.set('limit', String(PAGE_SIZE))
    const controller = request.current
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` }, signal: controller.signal,
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || 'Unable to load more entries')
      if (controller.signal.aborted) return
      const next = {
        entries: [...entries, ...(data.entries || [])],
        page: nextPage,
        total: Number(data.pagination?.total || 0),
        hasMore: Boolean(data.pagination?.has_more), when: Date.now(),
      }
      cache.current.set(key, next)
      setEntries(next.entries)
      setPage(next.page)
      setTotal(next.total)
      setHasMore(next.hasMore)
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message || 'Unable to load more entries')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  const days = useMemo(() => entries.reduce((result, entry) => {
    const date = String(entry.selection_date || '')
    if (!result.has(date)) result.set(date, [])
    result.get(date).push(entry)
    return result
  }, new Map()), [entries])
  const repeated = entries.filter((entry) => entry.is_repeat).length

  return (
    <section className="selection-history">
      <style>{styles}</style>
      <div className="selection-history-header">
        <div className="selection-history-title">Selection History</div>
        <div className="selection-history-description">Reading Mission selections · Cambodia time · Saved history, not live reader activity</div>
        <div className="selection-history-actions">
          {[['yesterday', 'Yesterday'], ['today', 'Today'], ['week', 'Last 7 days'], ['month', 'Last 30 days'], ['custom', 'Custom']].map(([value, label]) => (
            <button key={value} type="button" className={`selection-history-button ${preset === value ? 'active' : ''}`} onClick={() => {
              if (value === 'custom' && !customStart) {
                setCustomStart(shiftDay(today, -6))
                setCustomEnd(today)
              }
              setPreset(value)
            }}>{label}</button>
          ))}
        </div>
        {preset === 'custom' && <div className="selection-history-date-fields">
          <label>From<input type="date" value={customStart} max={today} onChange={(event) => setCustomStart(event.target.value)} /></label>
          <label>To<input type="date" value={customEnd} max={today} onChange={(event) => setCustomEnd(event.target.value)} /></label>
        </div>}
        <div className="selection-history-audiences">
          <button type="button" className={`selection-history-button ${audience === 'khmer' ? 'active' : ''}`} onClick={() => setAudience('khmer')}>🇰🇭 Khmer Reading Mission</button>
          <button type="button" className={`selection-history-button ${audience === 'international' ? 'active' : ''}`} onClick={() => setAudience('international')}>🌐 International Reading Mission</button>
        </div>
      </div>
      <div className="selection-history-body">
        <div className="selection-history-meta">
          <span>{range.start || '—'} – {range.end || '—'}</span>
          <span>{total} selections</span>
          <span>{repeated} repeated on this page</span>
          <span>30 per page · no background polling</span>
        </div>
        {!rangeValid && <div className="selection-history-message error">Select a valid date range of up to 90 days.</div>}
        {error && <div className="selection-history-message error" role="alert">{error}</div>}
        {loading && page === 0 && <div className="selection-history-message">Loading selection history...</div>}
        {!loading && !error && rangeValid && entries.length === 0 && <div className="selection-history-message">No recorded selections for this period. Older Manual choices were not recorded before the history tracker was installed.</div>}
        {[...days].map(([date, items]) => (
          <div className="selection-history-day" key={date}>
            <h4>{date} · {items.length} recorded</h4>
            {items.map((entry) => (
              <div key={entry.id} className={`selection-history-card ${entry.is_repeat ? 'repeat' : ''}`}>
                <div className="selection-history-card-content">
                  <div className="selection-history-card-title">{entry.slot ? `Mission ${entry.slot} · ` : ''}{entry.story_title}</div>
                  <div className="selection-history-card-info">Story ID: {entry.story_id} · Selected {timeInCambodia(entry.selected_at)}</div>
                  <div className="selection-history-card-labels">
                    <span>{entry.selection_mode === 'auto' ? 'Auto' : 'Manual'}</span>
                    <span>{entry.selection_reason === 'reconfirmed' ? 'Reconfirmed' : entry.selection_reason}</span>
                    {entry.is_repeat && <span className="repeat">Repeat · previous {entry.previous_selection_date}</span>}
                  </div>
                </div>
                {safeStoryHref(`/story/${entry.story_id}`) && <a href={`${READER_URL}${safeStoryHref(`/story/${entry.story_id}`)}`} target="_blank" rel="noopener noreferrer">View story</a>}
              </div>
            ))}
          </div>
        ))}
        {hasMore && <button type="button" className="selection-history-button selection-history-more" disabled={loading} onClick={loadMore}>{loading ? 'Loading...' : 'Load more'}</button>}
        <div className="selection-history-note">Repeats are detected across recorded Khmer or International history separately, including Auto and Manual. Data before tracking began is available only where historical Auto records exist.</div>
      </div>
    </section>
  )
}
