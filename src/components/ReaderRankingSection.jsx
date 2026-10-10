import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20
const MAX_CACHE_ITEMS = 120
const resultCache = new Map()
const pendingRequests = new Map()

function cambodiaDay() {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date()).map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function getKey(options) {
  return [cambodiaDay(), getToken(), options.scope, options.parentId || '', options.order, options.page].join(':')
}

function cleanCache() {
  const now = Date.now()
  for (const [key, entry] of resultCache) {
    if (entry.expiresAt <= now) resultCache.delete(key)
  }
  while (resultCache.size >= MAX_CACHE_ITEMS) resultCache.delete(resultCache.keys().next().value)
}

async function requestRanking(options) {
  const token = getToken()
  if (!token) throw new Error('Admin session required')

  const key = getKey(options)
  const cached = resultCache.get(key)
  if (!options.refresh && cached && cached.expiresAt > Date.now()) return cached.data

  const pendingKey = `${key}:${options.refresh ? 'refresh' : 'normal'}`
  if (pendingRequests.has(pendingKey)) return pendingRequests.get(pendingKey)

  const request = (async () => {
    const params = new URLSearchParams({
      scope: options.scope,
      order: options.order,
      page: String(options.page),
    })
    if (options.parentId) params.set('parent_id', options.parentId)
    if (options.refresh) params.set('refresh', '1')

    const response = await fetch(`${API_URL}/api/admin/community/readers/ranking?${params}`, {
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
      throw new Error(data.message || `Ranking request failed (${response.status})`)
    }

    cleanCache()
    resultCache.set(key, {
      data,
      expiresAt: Date.now() + (options.scope.endsWith('_detail') ? 5 : 2) * 60 * 1000,
    })
    return data
  })()

  pendingRequests.set(pendingKey, request)
  try {
    return await request
  } finally {
    if (pendingRequests.get(pendingKey) === request) pendingRequests.delete(pendingKey)
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Phnom_Penh',
  }).format(date)
}

function RankingAvatar({ item, isStory = false }) {
  const [failed, setFailed] = useState(false)
  const url = item?.image_url
  return (
    <span className={`rr-avatar ${isStory ? 'rr-cover' : ''}`}>
      {url && !failed ? (
        <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span>{isStory ? '📖' : String(item?.name || 'R').trim().slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  )
}

function ReverseButton({ order, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className="rr-reverse"
      onClick={() => onChange(order === 'top' ? 'low' : 'top')}
      aria-label={order === 'top' ? 'Change to low to high' : 'Change to high to low'}
      title={order === 'top' ? 'Top to Low' : 'Low to Top'}
      disabled={disabled}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 16 4 4 4-4" />
        <path d="M7 20V4" />
        <path d="m21 8-4-4-4 4" />
        <path d="M17 4v16" />
      </svg>
      {order === 'top' ? 'Top → Low' : 'Low → Top'}
    </button>
  )
}

function RankingPager({ page, total, onPage, loading }) {
  const lastPage = Math.max(1, Math.ceil(Number(total || 0) / PAGE_SIZE))
  return (
    <div className="rr-pager">
      <span>Page {page} of {lastPage} · {formatNumber(total)} results · {PAGE_SIZE}/page</span>
      <div>
        <button type="button" disabled={loading || page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <button type="button" disabled={loading || page >= lastPage} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  )
}

function DetailDrawer({ parent, scope, onClose }) {
  const [order, setOrder] = useState('top')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const detailScope = scope === 'story' ? 'story_detail' : 'reader_detail'

  useEffect(() => {
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onEscape)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', onEscape)
    }
  }, [onClose])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setData(null)
    requestRanking({
      scope: detailScope,
      parentId: String(parent.id),
      order,
      page,
    }).then((result) => {
      if (active) setData(result)
    }).catch((reason) => {
      if (active) setError(reason.message || 'Failed to load details')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [detailScope, parent.id, order, page])

  function changeOrder(value) {
    setOrder(value)
    setPage(1)
  }

  return (
    <div className="rr-overlay" onMouseDown={onClose}>
      <aside className="rr-drawer" role="dialog" aria-modal="true" aria-label={`${parent.name} reading details`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="rr-drawer-head">
          <div className="rr-title-with-image">
            <RankingAvatar item={parent} isStory={scope === 'story'} />
            <div>
              <span className="rr-eyebrow">{scope === 'story' ? 'Story · Reader Ranking' : 'Reader · Story Ranking'}</span>
              <h3>{parent.name || 'Unknown'}</h3>
              <p>{scope === 'story' ? `${formatNumber(parent.count)} unique readers today` : `${formatNumber(parent.count)} stories read today`}</p>
            </div>
          </div>
          <button type="button" className="rr-close" onClick={onClose} aria-label="Close details">×</button>
        </div>

        <div className="rr-drawer-toolbar">
          <div>
            <strong>{scope === 'story' ? 'Readers who read this story' : 'Stories read by this reader'}</strong>
            <span>{scope === 'story' ? 'Completed reading first, then more episodes viewed' : 'Completed stories first, then more episodes viewed'}</span>
          </div>
          <ReverseButton order={order} onChange={changeOrder} />
        </div>

        {loading ? <div className="rr-status">Loading details...</div> : null}
        {error ? <p className="rr-error" role="alert">{error}</p> : null}
        {!loading && !error && data ? (
          <>
            {data.items.length ? (
              <div className="rr-detail-list">
                {data.items.map((item, index) => (
                  <div className="rr-detail-item" key={item.id}>
                    <span className="rr-position">{(page - 1) * PAGE_SIZE + index + 1}</span>
                    <RankingAvatar item={item} isStory={scope === 'reader'} />
                    <div className="rr-detail-copy">
                      <strong>{item.name || 'Unknown'}</strong>
                      {scope === 'story' && item.username ? <span>@{item.username}</span> : null}
                      <span>{formatNumber(item.episodes_viewed ?? item.count)} episodes viewed today · Latest EP {formatNumber(item.episode_number)}</span>
                      <span>{formatDate(item.last_activity_at)}</span>
                    </div>
                    <div className="rr-detail-metrics">
                      {item.completed ? <span className="rr-finished">Finished</span> : null}
                      <strong>{Number(item.reading_percent || 0)}%</strong>
                      <span>Saved progress</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="rr-status">No reading details found today.</div>}
            <RankingPager page={page} total={data.total} onPage={setPage} loading={loading} />
          </>
        ) : null}
        <p className="rr-note">Results are based on today's episode-view records. Completion and percentage use saved reading progress and may differ from today's views. Each details page loads only when requested.</p>
      </aside>
    </div>
  )
}

export default function ReaderRankingSection() {
  const [scope, setScope] = useState('story')
  const [order, setOrder] = useState('top')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [refreshRequest, setRefreshRequest] = useState({ id: 0, key: '' })

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setData(null)
    requestRanking({ scope, order, page, refresh: refreshRequest.id > 0 && refreshRequest.key === `${scope}:${order}:${page}` })
      .then((result) => { if (active) setData(result) })
      .catch((reason) => { if (active) setError(reason.message || 'Failed to load ranking') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [scope, order, page, refreshRequest])

  function changeScope(value) {
    setScope(value)
    setOrder('top')
    setPage(1)
    setSelected(null)
    setRefreshRequest({ id: 0, key: '' })
  }

  function changeOrder(value) {
    setOrder(value)
    setPage(1)
    setRefreshRequest({ id: 0, key: '' })
  }

  return (
    <section className="rr-root">
      <style>{`
        .rr-root { border:1px solid #e2e8f0; border-radius:20px; background:#fff; color:#0f172a; overflow:hidden; box-shadow:0 2px 8px rgba(15,23,42,.04); }
        .rr-top { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:20px; }
        .rr-top h3 { font-size:20px; font-weight:900; margin:0 0 6px; }
        .rr-subtitle,.rr-note { font-size:12px; color:#64748b; line-height:1.6; margin:0; }
        .rr-switch { display:flex; gap:5px; padding:4px; border:1px solid #e2e8f0; background:#f8fafc; border-radius:12px; }
        .rr-switch button { cursor:pointer; border:0; background:transparent; color:#64748b; border-radius:9px; padding:9px 18px; font-size:12px; font-weight:900; }
        .rr-switch button[aria-pressed="true"] { color:#fff; background:#4f46e5; }
        .rr-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 20px; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; flex-wrap:wrap; }
        .rr-toolbar p { font-size:12px; color:#64748b; margin:4px 0 0; }
        .rr-toolbar-actions { display:flex; gap:8px; }
        .rr-toolbar-actions button,.rr-reverse,.rr-pager button { display:inline-flex; align-items:center; justify-content:center; gap:7px; border:1px solid #e2e8f0; border-radius:10px; cursor:pointer; color:#4338ca; background:#eef2ff; padding:9px 12px; font-size:12px; font-weight:850; }
        .rr-list { display:flex; flex-direction:column; }
        .rr-item { display:flex; align-items:center; width:100%; border:0; border-bottom:1px solid #f1f5f9; background:#fff; color:#0f172a; text-align:left; padding:13px 18px; cursor:pointer; gap:13px; }
        .rr-item:hover,.rr-item:focus-visible { background:#f8faff; }
        .rr-item:last-child { border-bottom:0; }
        .rr-position { width:28px; flex:none; font-size:13px; font-weight:900; color:#6366f1; text-align:center; }
        .rr-avatar { display:flex; flex:none; align-items:center; justify-content:center; width:42px; height:42px; border-radius:50%; background:#eef2ff; color:#4f46e5; font-weight:900; overflow:hidden; }
        .rr-avatar.rr-cover { border-radius:8px; height:55px; }
        .rr-avatar img { width:100%; height:100%; object-fit:cover; }
        .rr-item-copy { display:flex; flex-direction:column; gap:5px; min-width:0; flex:1; }
        .rr-item-copy strong { font-size:13px; font-weight:900; color:#0f172a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .rr-item-copy small { color:#64748b; font-size:11px; }
        .rr-amount { text-align:right; flex:none; min-width:96px; }
        .rr-amount strong { display:block; color:#4f46e5; font-size:20px; }
        .rr-amount span { display:block; color:#64748b; font-size:11px; }
        .rr-chevron { font-size:23px; color:#64748b; margin-left:4px; }
        .rr-status { text-align:center; padding:48px 16px; font-size:13px; color:#64748b; }
        .rr-error { margin:12px 20px; background:#fef2f2; color:#b91c1c; border-radius:10px; padding:12px; font-size:12px; }
        .rr-pager { border-top:1px solid #e2e8f0; padding:13px 18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; color:#64748b; font-size:12px; }
        .rr-pager>div { display:flex; gap:8px; }
        .rr-pager button:disabled,.rr-toolbar button:disabled { cursor:not-allowed; opacity:.45; }
        .rr-note { padding:10px 20px 17px; }
        .rr-overlay { position:fixed; z-index:1600; inset:0; background:rgba(15,23,42,.48); display:flex; justify-content:flex-end; }
        .rr-drawer { display:flex; flex-direction:column; width:min(720px,100%); height:100%; overflow-y:auto; background:#fff; color:#0f172a; box-shadow:-15px 0 45px rgba(15,23,42,.18); }
        .rr-drawer-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:22px; border-bottom:1px solid #e2e8f0; }
        .rr-title-with-image { display:flex; gap:12px; align-items:center; min-width:0; }
        .rr-title-with-image h3 { font-size:18px; margin:4px 0; overflow-wrap:anywhere; }
        .rr-title-with-image p { font-size:12px; color:#64748b; margin:0; }
        .rr-eyebrow { font-size:11px; font-weight:900; color:#4f46e5; }
        .rr-close { flex:none; font-size:24px; border:0; cursor:pointer; border-radius:50%; background:#f1f5f9; color:#475569; width:34px; height:34px; }
        .rr-drawer-toolbar { padding:15px 22px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; border-bottom:1px solid #e2e8f0; }
        .rr-drawer-toolbar>div { display:grid; gap:4px; }
        .rr-drawer-toolbar strong { font-size:13px; }
        .rr-drawer-toolbar span { font-size:11px; color:#64748b; }
        .rr-detail-list { display:flex; flex-direction:column; }
        .rr-detail-item { display:flex; align-items:center; padding:12px 18px; gap:11px; border-bottom:1px solid #f1f5f9; }
        .rr-detail-copy { flex:1; min-width:0; display:grid; gap:4px; }
        .rr-detail-copy strong { font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .rr-detail-copy span { font-size:11px; color:#64748b; }
        .rr-detail-metrics { display:grid; justify-items:end; gap:4px; }
        .rr-detail-metrics strong { color:#4f46e5; }
        .rr-detail-metrics span { color:#64748b; font-size:10px; text-align:right; }
        .rr-detail-metrics .rr-finished { color:#15803d; background:#dcfce7; border-radius:20px; padding:4px 7px; font-weight:900; }
        .dark .rr-root,[data-theme="dark"] .rr-root,.dark-mode .rr-root,.dark .rr-drawer,[data-theme="dark"] .rr-drawer,.dark-mode .rr-drawer { background:#151b2b; color:#f8fafc; border-color:#334155; }
        .dark .rr-item,[data-theme="dark"] .rr-item,.dark-mode .rr-item { background:#151b2b; color:#f8fafc; border-color:#334155; }
        .dark .rr-item:hover,[data-theme="dark"] .rr-item:hover,.dark-mode .rr-item:hover { background:#1e293b; }
        .dark .rr-item-copy strong,[data-theme="dark"] .rr-item-copy strong,.dark-mode .rr-item-copy strong { color:#f8fafc; }
        .dark .rr-toolbar,[data-theme="dark"] .rr-toolbar,.dark-mode .rr-toolbar,.dark .rr-drawer-head,[data-theme="dark"] .rr-drawer-head,.dark-mode .rr-drawer-head,.dark .rr-drawer-toolbar,[data-theme="dark"] .rr-drawer-toolbar,.dark-mode .rr-drawer-toolbar { border-color:#334155; }
        .dark .rr-detail-item,[data-theme="dark"] .rr-detail-item,.dark-mode .rr-detail-item { border-color:#334155; }
        @media(max-width:650px) { .rr-top { padding:15px; } .rr-toolbar { padding:12px 14px; } .rr-item { padding:12px 10px; gap:8px; } .rr-amount { min-width:75px; } .rr-amount strong { font-size:17px; } .rr-item-copy strong { font-size:12px; } .rr-pager { padding:12px; } .rr-drawer-head { padding:16px; } .rr-drawer-toolbar { padding:12px; } .rr-detail-item { padding:11px 8px; gap:7px; } .rr-detail-metrics { min-width:55px; } .rr-detail-copy span { font-size:10px; } }
      `}</style>

      <div className="rr-top">
        <div>
          <h3>Reader Ranking</h3>
          <p className="rr-subtitle">Today · Cambodia time · Summary only until you open details</p>
        </div>
        <div className="rr-switch" aria-label="Ranking type">
          <button type="button" aria-pressed={scope === 'story'} onClick={() => changeScope('story')}>Story</button>
          <button type="button" aria-pressed={scope === 'reader'} onClick={() => changeScope('reader')}>Reader</button>
        </div>
      </div>
      <div className="rr-toolbar">
        <div>
          <strong>{scope === 'story' ? 'Stories ranked by unique readers' : 'Readers ranked by stories read'}</strong>
          <p>{scope === 'story' ? 'Tap a story to see who read it' : 'Tap a reader to see which stories they read'}</p>
        </div>
        <div className="rr-toolbar-actions">
          <ReverseButton order={order} onChange={changeOrder} />
          <button type="button" onClick={() => setRefreshRequest((value) => ({ id: value.id + 1, key: `${scope}:${order}:${page}` }))}>Refresh</button>
        </div>
      </div>

      {loading ? <div className="rr-status" role="status">Loading ranking...</div> : null}
      {error ? <p className="rr-error" role="alert">{error}</p> : null}
      {!loading && !error && data ? (
        <>
          {data.items.length ? (
            <div className="rr-list">
              {data.items.map((item, index) => (
                <button type="button" className="rr-item" key={item.id} onClick={() => setSelected(item)}>
                  <span className="rr-position">{(page - 1) * PAGE_SIZE + index + 1}</span>
                  <RankingAvatar item={item} isStory={scope === 'story'} />
                  <span className="rr-item-copy">
                    <strong>{item.name || 'Unknown'}</strong>
                    <small>{scope === 'story' ? (item.story_type || 'Story') : (item.username ? `@${item.username}` : 'Reader')}</small>
                    <small>Last activity: {formatDate(item.last_activity_at)}</small>
                  </span>
                  <span className="rr-amount"><strong>{formatNumber(item.count)}</strong><span>{scope === 'story' ? 'unique readers' : 'stories read'}</span></span>
                  <span className="rr-chevron">›</span>
                </button>
              ))}
            </div>
          ) : <div className="rr-status">No ranking activity recorded for today.</div>}
          <RankingPager page={page} total={data.total} onPage={(value) => { setPage(value); setRefreshRequest({ id: 0, key: '' }) }} loading={loading} />
        </>
      ) : null}
      <p className="rr-note">List data is cached briefly. Reader and story details are not requested until a row is opened. Rankings are sorted on the server before pagination.</p>
      {selected ? <DetailDrawer key={`${scope}:${selected.id}`} scope={scope} parent={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  )
}
