import React, { useEffect, useMemo, useRef, useState } from 'react'

const PAGE_SIZE = 20
const HISTORY_PERIODS = [
  { label: 'Last 1 hour', minutes: 60 },
  { label: 'Last 6 hours', minutes: 360 },
  { label: 'Last 24 hours', minutes: 1440 },
  { label: 'Last 7 days', minutes: 10080 },
]
const HISTORY_BUCKET_MS = 15 * 60 * 1000
const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function amount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function numberText(value) {
  return amount(value).toLocaleString()
}

function bytesText(value) {
  const bytes = amount(value)
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${Math.round(bytes)} B`
}

function isOther(row) {
  return String(row?.page || '').toUpperCase() === 'OTHER'
}

function reviewReasons(row, windowMinutes = 60) {
  if (isOther(row)) return []
  const requests = amount(row.requests)
  const ranges = amount(row.supabase_range_responses)
  const rows = amount(row.observed_supabase_rows)
  const bytes = amount(row.response_bytes)
  const reasons = []
  if (ranges > 0 && rows / ranges >= 1000) reasons.push('Large DB result')
  if (requests / Math.max(1, amount(windowMinutes) / 60) >= 120) reasons.push('Frequent requests')
  if (requests > 0 && bytes / requests >= 1024 * 1024) reasons.push('Large response')
  if (amount(row.errors_5xx) > 0) reasons.push('Server errors')
  return reasons
}

export default function AdminPageRequestWatch({ snapshot }) {
  const [search, setSearch] = useState('')
  const [selectedPage, setSelectedPage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [historyMinutes, setHistoryMinutes] = useState(60)
  const [historyResult, setHistoryResult] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyRequested, setHistoryRequested] = useState(false)
  const historyCache = useRef(new Map())
  const historyController = useRef(null)
  const historyRequestId = useRef(0)
  const historyMounted = useRef(true)

  const activeSnapshot = historyLoading || (historyRequested && !historyResult) ? null : historyResult?.snapshot || snapshot
  const pages = useMemo(() => Array.isArray(activeSnapshot?.pages) ? activeSnapshot.pages : [], [activeSnapshot])
  const routes = useMemo(() => Array.isArray(activeSnapshot?.routes) ? activeSnapshot.routes : [], [activeSnapshot])
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return pages.filter((row) => String(row.page || '').toLowerCase().includes(query))
  }, [pages, search])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, pageCount)
  const shownPages = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const selectedRoutes = useMemo(() => routes.filter((row) => row.page === selectedPage), [routes, selectedPage])
  const totals = activeSnapshot?.totals || {}
  const measuredMinutes = historyResult ? amount(historyResult.snapshot?.window_minutes) : amount(snapshot?.window_minutes || 60)
  const warnings = pages.filter((row) => reviewReasons(row, measuredMinutes).length > 0).length
  const loadedMinutes = amount(historyResult?.snapshot?.window_minutes)
  const selectedMinutes = amount(historyResult?.periodMinutes)
  const coveragePercent = selectedMinutes > 0 ? Math.min(100, (loadedMinutes / selectedMinutes) * 100) : 0
  const partial = historyResult?.snapshot?.partial === true || (historyResult && coveragePercent < 100)
  const showNumbers = activeSnapshot && (!historyResult || amount(historyResult.snapshot?.stored_windows) > 0)

  useEffect(() => {
    historyMounted.current = true
    return () => {
      historyMounted.current = false
      historyRequestId.current += 1
      historyController.current?.abort()
    }
  }, [])

  const clearHistory = () => {
    historyRequestId.current += 1
    historyController.current?.abort()
    historyController.current = null
    setHistoryLoading(false)
    setHistoryResult(null)
    setHistoryRequested(false)
    setHistoryMinutes(60)
    setHistoryError('')
    setSelectedPage('')
    setCurrentPage(1)
  }

  const loadHistory = async (minutes = historyMinutes, force = false) => {
    historyRequestId.current += 1
    const requestId = historyRequestId.current
    historyController.current?.abort()
    historyController.current = null
    setHistoryResult(null)
    setHistoryRequested(true)
    setHistoryError('')
    setSelectedPage('')
    setCurrentPage(1)

    const token = sessionStorage.getItem('shadow_admin_token') ||
      localStorage.getItem('shadow_admin_token') || ''
    if (!token) {
      setHistoryLoading(false)
      setHistoryError('Admin token is missing.')
      return
    }

    const endMs = Math.floor(Date.now() / HISTORY_BUCKET_MS) * HISTORY_BUCKET_MS
    const fromMs = endMs - minutes * 60 * 1000
    const cacheKey = `${minutes}:${endMs}`
    const cached = !force ? historyCache.current.get(cacheKey) : null
    if (cached) {
      setHistoryLoading(false)
      setHistoryResult(cached)
      return
    }

    const controller = new AbortController()
    historyController.current = controller
    setHistoryLoading(true)

    try {
      const query = new URLSearchParams({
        from: new Date(fromMs).toISOString(),
        to: new Date(endMs).toISOString(),
      })
      const response = await fetch(`${API_URL}/api/admin/system-control/history?${query}`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok !== true || !data.history?.page_requests) {
        throw new Error(data.message || 'Page request history is unavailable.')
      }
      if (!historyMounted.current || historyRequestId.current !== requestId) return

      const result = {
        snapshot: data.history.page_requests,
        periodMinutes: minutes,
        requestedAt: endMs,
        usageCoverage: data.history.coverage || null,
      }
      historyCache.current.set(cacheKey, result)
      if (historyCache.current.size > 4) {
        historyCache.current.delete(historyCache.current.keys().next().value)
      }
      setHistoryResult(result)
    } catch (error) {
      if (historyMounted.current && historyRequestId.current === requestId && error?.name !== 'AbortError') {
        setHistoryError(error?.message || 'Failed to load page request history.')
      }
    } finally {
      if (historyMounted.current && historyRequestId.current === requestId) {
        setHistoryLoading(false)
        historyController.current = null
      }
    }
  }

  const changeHistoryPeriod = (value) => {
    const minutes = Number(value)
    setHistoryMinutes(minutes)
    void loadHistory(minutes)
  }

  return (
    <section className="sua-block">
      <div className="sua-head">
        <div>
          <div className="sua-title">Page Request Watch</div>
          <div className="sua-sub">
            {historyLoading
              ? `Loading ${HISTORY_PERIODS.find((item) => item.minutes === historyMinutes)?.label || 'selected range'}…`
              : historyResult
                ? `Stored history · ${HISTORY_PERIODS.find((item) => item.minutes === historyResult.periodMinutes)?.label || 'Selected range'} · 15-minute snapshots`
                : historyRequested
                  ? 'Selected history unavailable · No live numbers substituted'
                  : `Admin and Web pages · Last ${numberText(snapshot?.window_minutes || 60)} minutes · Live memory · Monitoring only`}
          </div>
        </div>
        <span className="sua-pill">{historyLoading ? 'Loading…' : `${numberText(warnings)} pages to review`}</span>
      </div>

      <div style={{ padding: 12, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <label className="sua-muted" htmlFor="sua-page-watch-history-period">History range</label>
          <select
            id="sua-page-watch-history-period"
            value={historyMinutes}
            onChange={(event) => changeHistoryPeriod(event.target.value)}
            style={{ minHeight: 35, border: '1px solid #CBD5E1', borderRadius: 9, padding: '5px 8px', fontSize: 11, background: 'var(--shadow-bg-primary, #fff)', color: 'inherit' }}
          >
            {HISTORY_PERIODS.map((item) => <option key={item.minutes} value={item.minutes}>{item.label}</option>)}
          </select>
          <button type="button" className="sua-btn" disabled={historyLoading} onClick={() => void loadHistory(historyMinutes, true)}>
            {historyLoading ? 'Loading history…' : historyResult ? 'Refresh History' : 'Load History'}
          </button>
          {historyRequested || historyLoading ? (
            <button type="button" className="sua-btn" onClick={clearHistory}>Back to Live</button>
          ) : null}
          <span className="sua-muted">Select a range to load once; repeated ranges use session cache. No automatic polling.</span>
        </div>
        {historyError ? <div className="sua-error" role="alert">{historyError}</div> : null}
        {historyLoading ? <div className="sua-sub">Loading selected history. Previous-range totals are hidden until the new range is ready.</div> : null}
        {historyResult ? (
          <div className="sua-sub" role="status">
            {`Requested: ${new Date(historyResult.snapshot.from).toLocaleString()} – ${new Date(historyResult.snapshot.to).toLocaleString()} · Stored intervals: ${numberText(historyResult.snapshot.stored_windows)} · Covered: ${coveragePercent.toFixed(1)}% (${(loadedMinutes / 60).toFixed(1)} / ${(selectedMinutes / 60).toFixed(1)} hours)`}
            {partial ? ' · Partial history: totals cover stored page-request snapshots only.' : ' · Stored page-request intervals covered.'}
            {' '}Page and route lists are ranked and capped per 15-minute snapshot; OTHER includes unlisted details. Older hourly/daily rollups do not restore individual pages.
          </div>
        ) : null}
        {historyResult && amount(historyResult.snapshot?.stored_windows) === 0 ? (
          <div className="sua-error" role="status">No stored page-request detail exists for this range. Zero measured rows must not be interpreted as zero real requests.</div>
        ) : null}
        <div className="sua-summary">
          {[
            ['API Requests', totals.requests],
            ['Supabase Calls', totals.supabase_calls],
            ['Observed DB Rows', totals.observed_supabase_rows],
            ['Response Data', bytesText(totals.response_bytes)],
          ].map(([label, value]) => (
            <div key={label} className="sua-card">
              <div className="sua-card-label">{label}</div>
              <div className="sua-card-value" style={{ fontSize: 20 }}>
                {!showNumbers ? '—' : typeof value === 'string' ? value : numberText(value)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            aria-label="Find monitored page"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
            placeholder="Search ADMIN:/income or WEB:/story..."
            style={{ flex: '1 1 260px', minHeight: 38, maxWidth: 440, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 12, background: 'var(--shadow-bg-primary, #fff)', color: 'inherit' }}
          />
          <span className="sua-muted">{historyLoading ? 'Loading…' : `${numberText(filtered.length)} recorded pages${historyResult?.snapshot?.detail_capped_per_snapshot ? ' (ranked)' : ''}`}</span>
        </div>

        <div className="sua-table-wrap">
          <table className="sua-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Requests</th>
                <th>Supabase</th>
                <th>Observed Rows</th>
                <th>Response</th>
                <th>Errors</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shownPages.map((row) => {
                const reasons = reviewReasons(row, measuredMinutes)
                return (
                  <tr key={row.page}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedPage((value) => value === row.page ? '' : row.page)}
                        aria-expanded={selectedPage === row.page}
                        style={{ textAlign: 'left', border: 0, background: 'transparent', color: '#6D28D9', cursor: 'pointer', fontSize: 10, fontWeight: 900, overflowWrap: 'anywhere' }}
                      >
                        {row.page || 'UNATTRIBUTED'} {selectedPage === row.page ? '▲' : '▼'}
                      </button>
                    </td>
                    <td>{numberText(row.requests)}</td>
                    <td>{numberText(row.supabase_calls)}</td>
                    <td>{numberText(row.observed_supabase_rows)}</td>
                    <td>{bytesText(row.response_bytes)}</td>
                    <td>{numberText(amount(row.errors_4xx) + amount(row.errors_5xx))}</td>
                    <td>
                      <span className="sua-pill" title={isOther(row) ? 'Unlisted page data' : reasons.join(' · ')}>
                        {isOther(row) ? 'OTHER' : reasons.length ? 'Review' : 'Observed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {historyLoading ? (
            <div className="sua-empty">Loading the selected range…</div>
          ) : !activeSnapshot ? (
            <div className="sua-empty">Page statistics are not available in the current System Control snapshot.</div>
          ) : filtered.length === 0 ? (
            <div className="sua-empty">No page requests matched this search in the available window.</div>
          ) : null}
        </div>

        {pageCount > 1 ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
            <button type="button" className="sua-btn" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>Previous</button>
            <span className="sua-muted">Page {safePage} / {pageCount}</span>
            <button type="button" className="sua-btn" disabled={safePage >= pageCount} onClick={() => setCurrentPage(safePage + 1)}>Next</button>
          </div>
        ) : null}

        {selectedPage && !historyLoading ? (
          <div>
            <div className="sua-title" style={{ marginBottom: 8 }}>Routes for {selectedPage}</div>
            <div className="sua-table-wrap">
              <table className="sua-table">
                <thead>
                  <tr><th>API Route</th><th>Requests</th><th>Supabase</th><th>Observed Rows</th><th>Range Responses</th><th>Avg ms</th><th>Review</th></tr>
                </thead>
                <tbody>
                  {selectedRoutes.map((row) => {
                    const reasons = reviewReasons(row, measuredMinutes)
                    return (
                      <tr key={`${row.page}:${row.route}`}>
                        <td style={{ overflowWrap: 'anywhere' }}>{row.route}</td>
                        <td>{numberText(row.requests)}</td>
                        <td>{numberText(row.supabase_calls)}</td>
                        <td>{numberText(row.observed_supabase_rows)}</td>
                        <td>{numberText(row.supabase_range_responses)}</td>
                        <td>{row.average_duration_ms == null ? '—' : numberText(row.average_duration_ms)}</td>
                        <td>{isOther(row) ? 'Unlisted routes' : reasons.length ? reasons.join(' · ') : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {selectedRoutes.length === 0 ? <div className="sua-empty">No detailed routes in the current ranked snapshot.</div> : null}
            </div>
          </div>
        ) : null}

        <div className="sua-sub">
          Review flags are indicators, not limits. DB rows are counted only when Supabase provides a measurable Content-Range; zero does not prove that no records were read. Live data resets on backend restart; stored history uses available 15-minute snapshots and may have gaps. Old aggregated rollups do not contain page details. No requests are blocked by this panel.
        </div>
      </div>
    </section>
  )
}
