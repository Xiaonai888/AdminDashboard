import React, { useEffect, useMemo, useRef, useState } from 'react'
import './StoryAnalyticsSection.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const BASE_PATH = '/api/admin/community/readers/story-analytics'
const TIME_ZONE = 'Asia/Phnom_Penh'
const CACHE_LIMIT = 60
const resultCache = new Map()
const inflight = new Map()
let cacheOwner = ''

const periods = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
]

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function cambodiaDay() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date()).map((item) => [item.type, item.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

function cleanCache() {
  for (const [key, entry] of resultCache) {
    if (entry.expiresAt <= Date.now()) resultCache.delete(key)
  }
  while (resultCache.size >= CACHE_LIMIT) resultCache.delete(resultCache.keys().next().value)
}

async function request(path, params, options = {}) {
  const token = getToken()
  if (!token) throw new Error('Admin session required')
  if (cacheOwner !== token) {
    cacheOwner = token
    resultCache.clear()
    inflight.clear()
  }

  const query = new URLSearchParams(params)
  const key = `${cambodiaDay()}:${path}:${query.toString()}`
  cleanCache()
  const cached = resultCache.get(key)
  if (!options.refresh && cached && cached.expiresAt > Date.now()) return cached.data
  if (inflight.has(key)) return inflight.get(key)

  const task = (async () => {
    if (options.refresh) query.set('refresh', '1')
    const response = await fetch(`${API_URL}${BASE_PATH}${path}?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) {
      resultCache.clear()
      sessionStorage.removeItem('shadow_admin_token')
      localStorage.removeItem('shadow_admin_token')
      sessionStorage.removeItem('shadow_admin_user')
      localStorage.removeItem('shadow_admin_user')
      window.location.assign('/login')
      throw new Error('Admin session expired')
    }
    if (!response.ok || data.ok !== true) throw new Error(data.message || `Request failed (${response.status})`)
    const ttl = path === '/search'
      ? 10 * 60 * 1000
      : data.period === 'yesterday' && data.snapshot_complete
        ? 30 * 24 * 60 * 60 * 1000
        : data.period === 'today' || data.period === 'yesterday'
          ? 2 * 60 * 1000
          : 5 * 60 * 1000
    cleanCache()
    resultCache.set(key, { data, expiresAt: Date.now() + ttl })
    return data
  })()

  inflight.set(key, task)
  try {
    return await task
  } finally {
    if (inflight.get(key) === task) inflight.delete(key)
  }
}

function number(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function formatBucket(key, period) {
  if (period === 'today') return `${key}:00`
  if (period === 'year') return key
  return key.slice(5)
}

function periodLabel(period) {
  return periods.find((entry) => entry.value === period)?.label || period
}

function timeLabel(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

export default function StoryAnalyticsSection() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selected, setSelected] = useState(null)
  const [period, setPeriod] = useState('week')
  const [report, setReport] = useState(null)
  const [reportError, setReportError] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const forceRefresh = useRef(false)
  const [activeBar, setActiveBar] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (selected || query.length < 2 || query !== search.trim()) {
      setSearchResults([])
      setSearching(false)
      return undefined
    }
    let alive = true
    setSearching(true)
    setSearchError('')
    request('/search', { q: query })
      .then((data) => { if (alive) setSearchResults(data.items || []) })
      .catch((error) => { if (alive) setSearchError(error.message || 'Search failed') })
      .finally(() => { if (alive) setSearching(false) })
    return () => { alive = false }
  }, [query, selected])

  useEffect(() => {
    if (!selected?.id) {
      setReport(null)
      setLoading(false)
      return undefined
    }
    let alive = true
    setLoading(true)
    setReportError('')
    setActiveBar(null)
    const refresh = forceRefresh.current
    forceRefresh.current = false
    request('', { story_id: selected.id, period }, { refresh })
      .then((data) => { if (alive) setReport(data) })
      .catch((error) => { if (alive) { setReport(null); setReportError(error.message || 'Failed to load analytics') } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [selected?.id, period, refreshKey])

  const bars = Array.isArray(report?.buckets) ? report.buckets : []
  const maximum = useMemo(() => Math.max(1, ...bars.map((bar) => Number(bar.readers || 0))), [bars])
  const prior = report?.previous && typeof report.previous === 'object' ? report.previous : null

  function selectStory(item) {
    setSelected(item)
    setSearch(item.title || '')
    setSearchResults([])
    setReport(null)
    setReportError('')
    setRefreshKey(0)
  }

  function clearStory() {
    setSelected(null)
    setSearch('')
    setSearchResults([])
    setReport(null)
    setReportError('')
    setRefreshKey(0)
  }

  return (
    <section className="story-analytics" aria-label="Story Analytics">
      <div className="story-analytics-header">
        <div>
          <h3>Story Analytics</h3>
          <p>Search and select a story to view its recorded reading activity · Cambodia time</p>
        </div>
        <span className="story-analytics-chip">On-demand</span>
      </div>

      <div className="story-analytics-controls">
        <div className="story-analytics-search">
          <label htmlFor="story-analytics-search-input">Story</label>
          <div className="story-analytics-search-wrap">
            <input
              id="story-analytics-search-input"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setSearchResults([])
                if (selected) {
                  setSelected(null)
                  setReport(null)
                  setRefreshKey(0)
                }
              }}
              placeholder="Search story name or ID..."
              autoComplete="off"
              aria-controls="story-analytics-results"
            />
            {selected ? <button className="story-analytics-clear" type="button" aria-label="Clear selected story" onClick={clearStory}>×</button> : null}
          </div>
          {!selected && query.length >= 2 && query === search.trim() ? (
            <div className="story-analytics-results" id="story-analytics-results">
              {searching ? <p>Searching…</p> : null}
              {searchError ? <p role="alert">{searchError}</p> : null}
              {!searching && !searchError && searchResults.length === 0 ? <p>No matching stories</p> : null}
              {!searching && searchResults.map((item) => (
                <button key={item.id} type="button" onClick={() => selectStory(item)}>
                  {item.cover_url ? <img src={item.cover_url} alt="" loading="lazy" /> : <span className="story-analytics-fallback">📖</span>}
                  <span><strong>{item.title || 'Untitled story'}</strong><small>{item.story_type || 'Story'}</small></span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {selected ? (
          <button type="button" className="story-analytics-refresh" disabled={loading} onClick={() => { forceRefresh.current = true; setRefreshKey((value) => value + 1) }}>
            Refresh
          </button>
        ) : null}
      </div>

      {selected ? (
        <>
          <div className="story-analytics-selected">
            {selected.cover_url ? <img src={selected.cover_url} alt="" /> : <span>📖</span>}
            <div><strong>{selected.title}</strong><small>{selected.story_type || 'Story'}</small></div>
          </div>
          <div className="story-analytics-periods" role="group" aria-label="Select time period">
            {periods.map((item) => (
              <button key={item.value} className={period === item.value ? 'active' : ''}
                type="button" aria-pressed={period === item.value} onClick={() => setPeriod(item.value)}>{item.label}</button>
            ))}
          </div>
          {loading ? <p className="story-analytics-status" role="status">Loading story analytics…</p> : null}
          {reportError ? <p className="story-analytics-error" role="alert">{reportError}</p> : null}
          {report && !loading ? (
            <>
              <div className="story-analytics-stats">
                <div><span>Unique Readers</span><strong>{number(report.unique_readers)}</strong><small>Distinct readers across the selected period</small></div>
                <div><span>Recorded Episode Reads</span><strong>{number(report.episode_reads)}</strong><small>One recorded read per reader, episode and day</small></div>
                <div>
                  <span>Reader Change</span>
                  <strong>{!prior ? '—' : prior.readers === 0 ? (Number(report.unique_readers) > 0 ? 'New' : '—') : `${Number(prior.change_percent) > 0 ? '+' : ''}${prior.change_percent}%`}</strong>
                  <small>{prior ? `Compared with ${prior.from} – ${prior.to}` : 'No complete comparable history'}</small>
                </div>
              </div>
              <div className="story-analytics-chart-card">
                <h4>{periodLabel(period)} · Unique Readers</h4>
                <p>{report.date_from} – {report.date_to} · {period === 'year' ? 'Monthly bars (max 12)' : period === 'today' ? 'Hourly bars (max 24)' : 'Daily bars (max 31)'}</p>
                {bars.length > 0 ? (
                  <div className="story-analytics-chart-scroll">
                    <div className="story-analytics-chart" role="group" aria-label="Recorded reading activity chart">
                      {bars.map((bar) => (
                        <button key={bar.key} className={`story-analytics-bar-wrap ${activeBar === bar.key ? 'selected' : ''}`} type="button"
                          title={`${bar.key}: ${number(bar.readers)} readers · ${number(bar.episode_reads)} episode reads`}
                          aria-label={`${bar.key}: ${number(bar.readers)} unique readers, ${number(bar.episode_reads)} episode reads`}
                          onClick={() => setActiveBar(activeBar === bar.key ? null : bar.key)}>
                          <span className="story-analytics-bar-value">{number(bar.readers)}</span>
                          <span className="story-analytics-bar" style={{ height: `${Math.max(5, Math.round(Number(bar.readers || 0) / maximum * 164))}px` }} />
                          <span className="story-analytics-bar-label">{formatBucket(bar.key, period)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : <p className="story-analytics-status">No recorded activity for this period.</p>}
                {activeBar && bars.some((bar) => bar.key === activeBar) ? (
                  <div className="story-analytics-bar-detail">
                    {bars.filter((bar) => bar.key === activeBar).map((bar) => (
                      <span key={bar.key}><strong>{bar.key}</strong> · {number(bar.readers)} unique readers · {number(bar.episode_reads)} recorded episode reads</span>
                    ))}
                  </div>
                ) : null}
              </div>
              {!report.history_complete ? (
                <p className="story-analytics-warning">Historical data is partial. Recorded story-level history begins from the new daily snapshots; older records cannot be reconstructed after detail retention.</p>
              ) : null}
              {period === 'yesterday' && !report.snapshot_complete ? (
                <p className="story-analytics-warning">Yesterday's snapshot is not yet complete. Check again after the daily snapshot finishes.</p>
              ) : null}
              <p className="story-analytics-footnote">Last updated: {timeLabel(report.generated_at)} · Cambodia time · Historical counts are reconstructed from saved daily reader-story records; this is not a raw page-view counter.</p>
            </>
          ) : null}
        </>
      ) : (
        <div className="story-analytics-empty">
          <strong>No story selected</strong>
          <p>Analytics are requested only after you select a story. Search results are cached separately.</p>
        </div>
      )}
    </section>
  )
}
