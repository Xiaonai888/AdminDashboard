import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20
const responseCache = new Map()
const activeRequests = new Map()
const CACHE_LIMIT = 120
const periods = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
]

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function khDay() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function number(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function percent(value, previous, current) {
  const oldCount = Number(previous || 0)
  const newCount = Number(current || 0)
  if (oldCount === 0) return newCount > 0 ? 'New' : '0%'
  const change = value == null ? ((newCount - oldCount) / oldCount) * 100 : Number(value)
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
}

function percentageTone(value) {
  return Number(value || 0) > 0 ? 'up' : Number(value || 0) < 0 ? 'down' : 'even'
}

function pruneCache() {
  const now = Date.now()
  for (const [key, item] of responseCache) {
    if (item.expires <= now) responseCache.delete(key)
  }
  while (responseCache.size >= CACHE_LIMIT) responseCache.delete(responseCache.keys().next().value)
}

async function fetchPeriod(options) {
  const token = adminToken()
  const params = new URLSearchParams({
    scope: options.scope,
    period: options.period,
    order: options.order,
    sort: options.sort,
    page: String(options.page),
    q: options.q,
  })
  if (options.period === 'custom') {
    params.set('from', options.from)
    params.set('to', options.to)
  }
  if (options.refresh) params.set('refresh', '1')
  const key = `${khDay()}|${token}|${options.scope}|${params.toString().replace(/&refresh=1$/, '')}`
  const cached = responseCache.get(key)
  if (!options.refresh && cached && cached.expires > Date.now()) return cached.data
  if (activeRequests.has(key)) return activeRequests.get(key)
  const task = (async () => {
    const response = await fetch(`${API_URL}/api/admin/community/readers/period?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) {
      sessionStorage.removeItem('shadow_admin_token')
      localStorage.removeItem('shadow_admin_token')
      sessionStorage.removeItem('shadow_admin_user')
      localStorage.removeItem('shadow_admin_user')
      window.location.assign('/login')
      throw new Error('Admin session expired')
    }
    if (!response.ok || data.ok !== true || !Array.isArray(data.items)) {
      throw new Error(data.message || 'Unable to load period comparison')
    }
    pruneCache()
    responseCache.set(key, {
      data,
      expires: Date.now() + (data.period_in_progress ? 2 : 5) * 60 * 1000,
    })
    return data
  })()
  activeRequests.set(key, task)
  try {
    return await task
  } finally {
    if (activeRequests.get(key) === task) activeRequests.delete(key)
  }
}

async function fetchPeriodDetail(options) {
  const token = adminToken()
  const params = new URLSearchParams({
    scope: options.scope,
    id: options.id,
    period: options.period,
    order: options.order,
    sort: options.sort,
    page: String(options.page),
  })
  if (options.period === 'custom') {
    params.set('from', options.from)
    params.set('to', options.to)
  }
  const key = `${khDay()}|${token}|detail|${params.toString()}`
  if (options.refresh) params.set('refresh', '1')
  const cached = responseCache.get(key)
  if (!options.refresh && cached && cached.expires > Date.now()) return cached.data
  if (activeRequests.has(key)) return activeRequests.get(key)
  const task = (async () => {
    const response = await fetch(`${API_URL}/api/admin/community/readers/period/detail?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401) {
      sessionStorage.removeItem('shadow_admin_token')
      localStorage.removeItem('shadow_admin_token')
      sessionStorage.removeItem('shadow_admin_user')
      localStorage.removeItem('shadow_admin_user')
      window.location.assign('/login')
      throw new Error('Admin session expired')
    }
    if (!response.ok || data.ok !== true || !Array.isArray(data.items)) {
      throw new Error(data.message || 'Unable to load period detail')
    }
    pruneCache()
    responseCache.set(key, { data, expires: Date.now() + 5 * 60 * 1000 })
    return data
  })()
  activeRequests.set(key, task)
  try {
    return await task
  } finally {
    if (activeRequests.get(key) === task) activeRequests.delete(key)
  }
}

function PeriodDetailDrawer({ scope, selected, report, onClose }) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('episodes')
  const [order, setOrder] = useState('top')
  const [refreshKey, setRefreshKey] = useState(0)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const lastRefreshed = useRef(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    setDetail(null)
    const forceRefresh = refreshKey > lastRefreshed.current
    if (forceRefresh) lastRefreshed.current = refreshKey
    fetchPeriodDetail({
      scope,
      id: selected.id,
      period: report.period,
      from: report.date_from,
      to: report.date_to,
      page,
      sort,
      order,
      refresh: forceRefresh,
    }).then((data) => {
      if (alive) setDetail(data)
    }).catch((failure) => {
      if (alive) setError(failure.message || 'Unable to load detail')
    }).finally(() => {
      if (alive) setLoading(false)
    })
    return () => { alive = false }
  }, [scope, selected.id, report.period, report.date_from, report.date_to, page, sort, order, refreshKey])

  const detailRows = Array.isArray(detail?.items) ? detail.items : []
  const detailTotal = Number(detail?.total || 0)
  const detailPages = Math.max(1, Math.ceil(detailTotal / PAGE_SIZE))

  return (
    <div className="reader-period-overlay" role="presentation" onMouseDown={onClose}>
      <aside className="reader-period-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="reader-period-drawer-head">
          <div><small>{scope === 'story' ? 'Story readers' : 'Stories read'}</small><h3>{selected.name || 'Unknown'}</h3></div>
          <button type="button" aria-label="Close details" onClick={onClose}>×</button>
        </div>
        <div className="reader-period-drawer-grid">
          <div><span>Current period</span><strong>{number(selected.count)}</strong></div>
          <div><span>Previous period</span><strong>{number(selected.previous_count)}</strong></div>
          <div><span>Change</span><Change value={selected.change} previous={selected.previous_count} current={selected.count}/></div>
          <div><span>Counted views</span><strong>{number(selected.views)}</strong></div>
          {scope === 'reader' ? <div><span>Unique episodes</span><strong>{number(selected.episodes)}</strong></div> : null}
        </div>
        <div className="reader-period-detail-head">
          <strong>{scope === 'story' ? 'Readers in this story' : 'Stories read by this reader'}</strong>
          <span>{report.date_from} → {report.date_to}</span>
        </div>
        <div className="reader-period-detail-controls">
          <select aria-label="Detail rank" value={sort} onChange={(event) => { setPage(1); setSort(event.target.value) }}>
            <option value="episodes">Episodes</option>
            <option value="views">Counted Views</option>
            <option value="change">Episode Change</option>
          </select>
          <button type="button" onClick={() => { setPage(1); setOrder((current) => current === 'top' ? 'low' : 'top') }}>⇅ {order === 'top' ? 'High → Low' : 'Low → High'}</button>
          <button type="button" title="Refresh detail" onClick={() => setRefreshKey((value) => value + 1)}>↻</button>
        </div>
        {loading ? <div className="reader-period-detail-message">Loading details…</div> : null}
        {error ? <div className="reader-period-error" role="alert">{error}</div> : null}
        {detail && !loading ? (
          <>
            <div className="reader-period-detail-list">
              {detailRows.length ? detailRows.map((item) => (
                <div className="reader-period-detail-item" key={item.id}>
                  <div className={`reader-period-image ${scope === 'story' ? 'avatar' : 'cover'}`}>
                    {item.image_url ? <img src={item.image_url} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : scope === 'story' ? '👤' : '📖'}
                  </div>
                  <div className="reader-period-detail-info">
                    <strong title={item.name}>{item.name || item.id}</strong>
                    <small>{item.subtitle ? `${item.subtitle} · ` : ''}{number(item.episodes)} episodes · {number(item.views)} views · {number(item.active_days)} active days</small>
                    <small>Previous: {number(item.previous_episodes)} episodes</small>
                  </div>
                  <div className="reader-period-detail-diff"><Change value={item.change} previous={item.previous_episodes} current={item.episodes} /></div>
                </div>
              )) : <div className="reader-period-detail-message">No recorded details for this period.</div>}
            </div>
            <div className="reader-period-footer reader-period-detail-footer">
              <span>Page {page} of {detailPages} · {number(detailTotal)} total</span>
              <div>
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                <button type="button" disabled={page >= detailPages} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </div>
          </>
        ) : null}
        <p className="reader-period-drawer-note">Daily activity is counted from the recorded episode views. Episodes reflect distinct episodes, not repeat page opens.</p>
      </aside>
    </div>
  )
}

function Change({ value, previous, current }) {
  const amount = Number(value || 0)
  const tone = percentageTone(amount)
  return (
    <div className={`reader-period-change ${tone}`}>
      <strong>{amount > 0 ? '+' : ''}{number(amount)}</strong>
      <span>{percent(null, previous, current)}</span>
    </div>
  )
}

export default function ReaderPeriodSection({ scope }) {
  const [period, setPeriod] = useState('today')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('count')
  const [order, setOrder] = useState('top')
  const [search, setSearch] = useState('')
  const [result, setResult] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const counter = useRef(0)

  useEffect(() => () => { counter.current += 1 }, [])

  function clearResult() {
    counter.current += 1
    setResult(null)
    setSelected(null)
    setError('')
    setLoading(false)
  }

  async function viewReport(overrides = {}) {
    const chosen = { scope, period, from, to, sort, order, q: search.trim(), page: 1, refresh: false, ...overrides }
    if (chosen.period === 'custom') {
      const today = khDay()
      const begin = new Date(`${chosen.from}T12:00:00Z`)
      const end = new Date(`${chosen.to}T12:00:00Z`)
      if (!chosen.from || !chosen.to || !Number.isFinite(begin.getTime()) || !Number.isFinite(end.getTime()) || chosen.from > chosen.to || chosen.to > today || (end - begin) / 86400000 > 365) {
        setError('Choose a valid Custom date range of up to 366 days, ending no later than today.')
        setResult(null)
        return
      }
    }
    const callId = ++counter.current
    setLoading(true)
    setResult(null)
    setError('')
    setSelected(null)
    try {
      const data = await fetchPeriod(chosen)
      if (callId === counter.current) setResult(data)
    } catch (err) {
      if (callId === counter.current) {
        setError(err.message || 'Unable to load statistics')
        setResult(null)
      }
    } finally {
      if (callId === counter.current) setLoading(false)
    }
  }

  const rows = Array.isArray(result?.items) ? result.items : []
  const total = Number(result?.total || 0)
  const currentPage = Number(result?.page || 1)
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const label = scope === 'story' ? 'Unique readers' : 'Stories read'

  return (
    <div className="reader-period-root">
      <style>{periodStyles}</style>
      <div className="reader-period-controls">
        <div className="reader-period-heading">
          <div>
            <h3>{scope === 'story' ? 'Story audience comparison' : 'Reader activity comparison'}</h3>
            <p>Compare with the previous matching period · Cambodia time</p>
          </div>
          <span className="reader-period-tag">20 / page</span>
        </div>
        <div className="reader-period-filters">
          <label>
            <span>Period</span>
            <select value={period} onChange={(e) => { setPeriod(e.target.value); clearResult() }}>
              {periods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          {period === 'custom' ? (
            <>
              <label><span>From</span><input type="date" value={from} max={khDay()} onChange={(e) => { setFrom(e.target.value); clearResult() }} /></label>
              <label><span>To</span><input type="date" value={to} max={khDay()} onChange={(e) => { setTo(e.target.value); clearResult() }} /></label>
            </>
          ) : null}
          <label>
            <span>Rank by</span>
            <select value={sort} onChange={(e) => { setSort(e.target.value); clearResult() }}>
              <option value="count">{label}</option>
              <option value="change">Growth change</option>
              <option value="views">Counted views</option>
            </select>
          </label>
          <label className="reader-period-search">
            <span>Search</span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); clearResult() }} placeholder={scope === 'story' ? 'Story name or ID' : 'Reader name or ID'} onKeyDown={(e) => { if (e.key === 'Enter') viewReport() }} />
          </label>
          <div className="reader-period-control-buttons">
            <button type="button" className="reader-period-order" title="Reverse sorting" onClick={() => { const next = order === 'top' ? 'low' : 'top'; setOrder(next); if (result) viewReport({ order: next }); else clearResult() }}>
              ⇅ {order === 'top' ? 'High → Low' : 'Low → High'}
            </button>
            <button type="button" className="reader-period-view" disabled={loading} onClick={() => viewReport()}>{loading ? 'Loading…' : 'View'}</button>
          </div>
        </div>
      </div>

      {error ? <div className="reader-period-error" role="alert">{error}</div> : null}
      {!result && !loading && !error ? (
        <div className="reader-period-placeholder">
          <span>▥</span>
          <strong>Choose a period and select View</strong>
          <p>No period statistics are requested until you ask to view them.</p>
        </div>
      ) : null}
      {loading ? <div className="reader-period-loading">Loading period statistics…</div> : null}
      {result && !loading ? (
        <div className="reader-period-report">
          <div className="reader-period-meta">
            <div><strong>{result.date_from} → {result.date_to}</strong><span>Previous: {result.previous_from} → {result.previous_to}</span></div>
            <div className="reader-period-meta-right"><span>{number(total)} {scope === 'story' ? 'stories' : 'readers'}</span>{result.period_in_progress ? <em>Period still in progress</em> : null}<button type="button" onClick={() => viewReport({ page: currentPage, refresh: true })}>Refresh</button></div>
          </div>
          <div className="reader-period-table-wrap">
            <table className="reader-period-table">
              <thead><tr>
                <th>{scope === 'story' ? 'Story' : 'Reader'}</th>
                <th>Previous</th>
                <th>{label}</th>
                <th>Change</th>
                <th>Views</th>
                {scope === 'reader' ? <th>Episodes</th> : null}
                <th>Details</th>
              </tr></thead>
              <tbody>
                {rows.length ? rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="reader-period-person">
                        <div className={`reader-period-image ${scope === 'story' ? 'cover' : 'avatar'}`}>{item.image_url ? <img src={item.image_url} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : scope === 'story' ? '📖' : '👤'}</div>
                        <div><strong>{item.name || 'Unknown'}</strong><span>{scope === 'story' ? (item.story_type || 'Story') : item.username ? `@${item.username}` : 'Reader'}</span></div>
                      </div>
                    </td>
                    <td>{number(item.previous_count)}</td>
                    <td><strong className="reader-period-value">{number(item.count)}</strong></td>
                    <td><Change value={item.change} previous={item.previous_count} current={item.count} /></td>
                    <td>{number(item.views)}</td>
                    {scope === 'reader' ? <td>{number(item.episodes)}</td> : null}
                    <td><button type="button" className="reader-period-more" onClick={() => setSelected(item)} aria-label={`Details for ${item.name}`}>›</button></td>
                  </tr>
                )) : (
                  <tr><td className="reader-period-no-data" colSpan={scope === 'reader' ? 7 : 6}>No recorded activity in this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="reader-period-footer">
            <span>Page {currentPage} of {pages} · {number(total)} total</span>
            <div><button type="button" disabled={loading || currentPage <= 1} onClick={() => viewReport({ page: currentPage - 1 })}>Previous</button><button type="button" disabled={loading || currentPage >= pages} onClick={() => viewReport({ page: currentPage + 1 })}>Next</button></div>
          </div>
        </div>
      ) : null}
      {selected && result ? (
        <PeriodDetailDrawer
          key={`${scope}:${selected.id}:${result.date_from}:${result.date_to}`}
          scope={scope}
          selected={selected}
          report={result}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  )
}

const periodStyles = `
.reader-period-root{display:flex;flex-direction:column;gap:12px;color:#1e293b}
.reader-period-controls,.reader-period-report{background:#fff;border:1px solid #e2e8f0;border-radius:15px;overflow:hidden}
.reader-period-controls{padding:17px}
.reader-period-heading{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:16px}
.reader-period-heading h3{font-size:16px;margin:0 0 4px;font-weight:850;color:#0f172a}
.reader-period-heading p{font-size:12px;margin:0;color:#64748b}
.reader-period-tag{color:#4f46e5;background:#eef2ff;border-radius:20px;padding:5px 10px;font-size:11px;font-weight:750;white-space:nowrap}
.reader-period-filters{display:flex;flex-wrap:wrap;gap:9px;align-items:flex-end}
.reader-period-filters label{display:flex;flex-direction:column;gap:5px;min-width:116px;flex:0 1 auto;font-size:11px;font-weight:750;color:#64748b}
.reader-period-filters input,.reader-period-filters select{font-size:12px;color:#334155;background:#fff;border:1px solid #cbd5e1;border-radius:9px;outline:0;min-height:37px;padding:0 10px;max-width:100%}
.reader-period-filters input:focus,.reader-period-filters select:focus{border-color:#818cf8;box-shadow:0 0 0 2px #e0e7ff}
.reader-period-filters .reader-period-search{flex:1 1 170px}
.reader-period-control-buttons{display:flex;gap:8px;align-items:center}
.reader-period-control-buttons button,.reader-period-meta button,.reader-period-footer button{min-height:37px;border-radius:9px;border:1px solid #cbd5e1;background:white;color:#334155;font-weight:750;font-size:12px;padding:0 12px;cursor:pointer;white-space:nowrap}
.reader-period-control-buttons .reader-period-view{border-color:#4f46e5;background:#4f46e5;color:white;min-width:85px}
.reader-period-control-buttons button:disabled,.reader-period-footer button:disabled{cursor:default;opacity:.45}
.reader-period-placeholder{padding:52px 15px;text-align:center;border:1px dashed #cbd5e1;border-radius:15px;background:#f8fafc}
.reader-period-placeholder>span{font-size:26px;color:#6366f1;display:block;margin-bottom:11px}
.reader-period-placeholder strong{font-size:14px;color:#334155}
.reader-period-placeholder p{font-size:12px;color:#64748b;margin:7px 0 0}
.reader-period-error{color:#b91c1c;background:#fef2f2;padding:13px;border-radius:11px;font-size:12px}
.reader-period-loading{padding:40px;text-align:center;color:#64748b;font-size:12px}
.reader-period-meta{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:15px 17px;border-bottom:1px solid #e2e8f0}
.reader-period-meta>div{display:flex;flex-direction:column;gap:4px}
.reader-period-meta strong{font-size:12px;font-weight:850}
.reader-period-meta span{font-size:11px;color:#64748b}
.reader-period-meta .reader-period-meta-right{flex-direction:row;align-items:center;flex-wrap:wrap;gap:9px}
.reader-period-meta-right em{font-style:normal;color:#92400e;background:#fffbeb;padding:5px 8px;border-radius:7px;font-size:10px}
.reader-period-table-wrap{overflow-x:auto}
.reader-period-table{border-collapse:collapse;width:100%;min-width:720px;font-size:12px;text-align:left}
.reader-period-table th{font-size:11px;font-weight:850;color:#64748b;background:#f8fafc;padding:13px 16px;white-space:nowrap}
.reader-period-table td{padding:12px 16px;border-top:1px solid #f1f5f9;vertical-align:middle;color:#334155}
.reader-period-table td:not(:first-child){white-space:nowrap}
.reader-period-person{display:flex;align-items:center;gap:10px;min-width:170px}
.reader-period-person>div:last-child{display:flex;flex-direction:column;min-width:0;gap:3px}
.reader-period-person strong{max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0f172a;font-size:12px}
.reader-period-person span{font-size:10px;color:#94a3b8}
.reader-period-image{width:37px;height:43px;background:#eef2ff;border-radius:8px;overflow:hidden;display:grid;place-items:center;flex:0 0 auto;font-size:19px}
.reader-period-image.avatar{height:37px;border-radius:50%}
.reader-period-image img{width:100%;height:100%;object-fit:cover}
.reader-period-value{font-size:15px;color:#111827}
.reader-period-change{display:flex;flex-direction:column;gap:3px}
.reader-period-change strong{font-size:13px}
.reader-period-change span{font-size:10px;font-weight:700}
.reader-period-change.up{color:#15803d}
.reader-period-change.down{color:#dc2626}
.reader-period-change.even{color:#64748b}
.reader-period-more{border:1px solid #ddd6fe;border-radius:8px;color:#4f46e5;background:#eef2ff;cursor:pointer;padding:2px 12px;font-size:20px}
.reader-period-no-data{text-align:center!important;color:#94a3b8!important;padding:40px!important}
.reader-period-footer{display:flex;justify-content:space-between;gap:12px;padding:13px 16px;align-items:center;color:#64748b;font-size:12px}
.reader-period-footer div{display:flex;gap:7px}
.reader-period-overlay{position:fixed;inset:0;background:rgba(15,23,42,.54);z-index:1500;display:flex;justify-content:flex-end}
.reader-period-drawer{background:#fff;width:min(490px,100%);height:100%;overflow-y:auto;padding:24px;box-shadow:-5px 0 35px rgba(0,0,0,.18)}
.reader-period-drawer-head{display:flex;justify-content:space-between;gap:10px;align-items:start;border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:18px}
.reader-period-drawer-head h3{font-size:19px;margin:4px 0;color:#0f172a}
.reader-period-drawer-head small{font-size:11px;color:#64748b}
.reader-period-drawer-head button{background:#f1f5f9;border:0;border-radius:8px;font-size:22px;width:34px;height:34px;cursor:pointer}
.reader-period-drawer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.reader-period-drawer-grid>div{display:flex;flex-direction:column;gap:7px;background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:11px}
.reader-period-drawer-grid>div>span{font-size:11px;color:#64748b}
.reader-period-drawer-grid>div>strong{font-size:18px;color:#0f172a}
.reader-period-drawer-note{margin-top:17px;font-size:12px;line-height:1.6;color:#64748b}
.dark .reader-period-root,[data-theme="dark"] .reader-period-root,.dark-mode .reader-period-root{color:#e2e8f0}
.dark .reader-period-controls,.dark .reader-period-report,.dark .reader-period-drawer,[data-theme="dark"] .reader-period-controls,[data-theme="dark"] .reader-period-report,[data-theme="dark"] .reader-period-drawer{background:#0f172a;border-color:#334155}
.dark .reader-period-heading h3,.dark .reader-period-person strong,.dark .reader-period-value,.dark .reader-period-meta strong,.dark .reader-period-drawer-head h3,[data-theme="dark"] .reader-period-heading h3,[data-theme="dark"] .reader-period-person strong,[data-theme="dark"] .reader-period-value{color:#f8fafc}
.dark .reader-period-table th,.dark .reader-period-placeholder,.dark .reader-period-drawer-grid>div,[data-theme="dark"] .reader-period-table th{background:#1e293b}
.dark .reader-period-table td,.dark .reader-period-meta,.dark .reader-period-drawer-head{border-color:#334155;color:#cbd5e1}
.dark .reader-period-filters input,.dark .reader-period-filters select,[data-theme="dark"] .reader-period-filters input,[data-theme="dark"] .reader-period-filters select{background:#1e293b;color:#f8fafc;border-color:#475569}
@media(max-width:680px){.reader-period-heading{align-items:flex-start}.reader-period-filters label{flex:1 1 130px}.reader-period-filters .reader-period-search{flex:1 1 100%}.reader-period-control-buttons{width:100%}.reader-period-control-buttons button{flex:1}.reader-period-footer{flex-wrap:wrap}.reader-period-drawer{padding:16px}}
.reader-period-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-top:22px;margin-bottom:11px}
.reader-period-detail-head strong{font-size:13px;color:#0f172a}
.reader-period-detail-head span{color:#64748b;font-size:11px}
.reader-period-detail-controls{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.reader-period-detail-controls select,.reader-period-detail-controls button{min-height:34px;border:1px solid #cbd5e1;background:#fff;border-radius:8px;color:#334155;font-size:11px;padding:0 9px;cursor:pointer}
.reader-period-detail-controls select{flex:1 1 125px}
.reader-period-detail-list{border:1px solid #e2e8f0;border-radius:11px;overflow:hidden}
.reader-period-detail-item{display:flex;gap:10px;padding:11px 9px;align-items:center;border-bottom:1px solid #f1f5f9}
.reader-period-detail-item:last-child{border-bottom:0}
.reader-period-detail-info{display:flex;flex:1;min-width:0;flex-direction:column;gap:4px}
.reader-period-detail-info strong{color:#0f172a;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:12px}
.reader-period-detail-info small{color:#64748b;font-size:10px;line-height:1.4}
.reader-period-detail-diff{min-width:65px;text-align:right}
.reader-period-detail-diff .reader-period-change{align-items:flex-end}
.reader-period-detail-message{padding:24px;text-align:center;color:#64748b;font-size:12px}
.reader-period-detail-footer{padding:13px 0}
.dark .reader-period-detail-list,.dark .reader-period-detail-item,.dark .reader-period-detail-controls select,.dark .reader-period-detail-controls button{border-color:#334155}
.dark .reader-period-detail-controls select,.dark .reader-period-detail-controls button,[data-theme="dark"] .reader-period-detail-controls select{background:#1e293b;color:#e2e8f0}
.dark .reader-period-detail-info strong,.dark .reader-period-detail-head strong{color:#f8fafc}
`
