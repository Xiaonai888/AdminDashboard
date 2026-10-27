import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_MS = 2 * 60 * 1000
const PAGE_SIZE = 20
const historyCache = new Map()

const css = `
  .seh-root{border:1px solid #E2E8F0;border-radius:16px;background:#fff;overflow:hidden;color:#334155}
  .seh-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:17px;border-bottom:1px solid #EEF2F7}
  .seh-title{font-size:14px;font-weight:900;color:#0F172A}
  .seh-sub{margin-top:4px;color:#64748B;font-size:11px;line-height:1.5}
  .seh-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .seh-btn,.seh-select,.seh-input{min-height:36px;border:1px solid #CBD5E1;border-radius:9px;background:#fff;padding:7px 12px;font:inherit;font-size:11px;color:#334155}
  .seh-btn{font-weight:800;cursor:pointer}
  .seh-btn.active{color:#5B21B6;background:#F5F3FF;border-color:#C4B5FD}
  .seh-btn.primary{color:#fff;background:#6D28D9;border-color:#6D28D9}
  .seh-btn:disabled{opacity:.55;cursor:not-allowed}
  .seh-body{padding:15px;display:grid;gap:14px}
  .seh-meta{display:flex;flex-wrap:wrap;gap:8px}
  .seh-chip{display:inline-flex;gap:6px;padding:8px 10px;border-radius:9px;background:#F8FAFC;border:1px solid #E2E8F0;font-size:11px}
  .seh-chip strong{font-weight:900;color:#0F172A}
  .seh-note{font-size:11px;line-height:1.6;color:#64748B}
  .seh-notice{padding:11px 12px;border-radius:10px;font-size:11px;line-height:1.6;border:1px solid #FDE68A;background:#FFFBEB;color:#92400E}
  .seh-error{padding:11px 12px;border-radius:10px;font-size:11px;border:1px solid #FECACA;background:#FEF2F2;color:#B91C1C}
  .seh-filters{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
  .seh-input{flex:1;min-width:180px;max-width:420px}
  .seh-table-wrap{overflow:auto;border:1px solid #E2E8F0;border-radius:10px}
  .seh-table{width:100%;min-width:790px;border-collapse:collapse;text-align:left;font-size:11px}
  .seh-table th{padding:11px;background:#F8FAFC;color:#64748B;border-bottom:1px solid #E2E8F0;font-weight:900}
  .seh-table td{padding:11px;border-bottom:1px solid #F1F5F9;vertical-align:top}
  .seh-table tr:last-child td{border-bottom:0}
  .seh-route{font-weight:850;overflow-wrap:anywhere;color:#1E293B}
  .seh-mini{font-size:10px;color:#64748B;margin-top:5px;overflow-wrap:anywhere;line-height:1.5}
  .seh-code{font-weight:900;font-variant-numeric:tabular-nums;color:#92400E}
  .seh-code.server{color:#B91C1C}
  .seh-count{font-weight:900;font-variant-numeric:tabular-nums}
  .seh-detail{margin-top:7px;padding:8px;border:1px solid #E2E8F0;border-radius:8px;background:#FAFAFA;white-space:pre-wrap;overflow-wrap:anywhere}
  .seh-pagination{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;color:#64748B}
  @media(max-width:720px){.seh-head{align-items:flex-start}.seh-controls{width:100%}.seh-btn{flex:0 0 auto}}
`

function safeCount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function countText(value) {
  return safeCount(value).toLocaleString()
}

function dateText(value) {
  const time = new Date(value || '').getTime()
  return Number.isFinite(time) ? new Date(time).toLocaleString() : '—'
}

function token() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

export default function AdminStoredErrorHistory() {
  const [range, setRange] = useState('24h')
  const [loadedRange, setLoadedRange] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const requestRef = useRef(null)
  const requestNumber = useRef(0)

  useEffect(() => () => {
    requestNumber.current += 1
    requestRef.current?.abort()
  }, [])

  const load = useCallback(async (force = false) => {
    const id = ++requestNumber.current
    requestRef.current?.abort()
    requestRef.current = null
    const accessToken = token()
    if (!accessToken) {
      setError('Admin session is missing. Please sign in again.')
      setLoadedRange('')
      setData(null)
      return
    }

    const cached = historyCache.get(range)
    if (!force && cached && Date.now() - cached.time < CACHE_MS) {
      setData(cached.data)
      setLoadedRange(range)
      setUpdatedAt(new Date(cached.time))
      setError('')
      setLoading(false)
      setPage(1)
      return
    }

    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/admin/system-control/diagnostics/error-history?range=${range}`,
        {
          credentials: 'include',
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || payload?.ok !== true || !Array.isArray(payload.errors)) {
        throw new Error(payload?.message || `Error History request failed (HTTP ${response.status}).`)
      }
      if (requestNumber.current !== id || controller.signal.aborted) return
      const now = Date.now()
      historyCache.set(range, { data: payload, time: now })
      setData(payload)
      setLoadedRange(range)
      setUpdatedAt(new Date(now))
      setPage(1)
    } catch (reason) {
      if (requestNumber.current !== id || controller.signal.aborted) return
      setError(reason?.message || 'Unable to load stored Error History.')
      setData(null)
      setLoadedRange('')
    } finally {
      if (requestNumber.current === id) {
        requestRef.current = null
        setLoading(false)
      }
    }
  }, [range])

  const active = loadedRange === range ? data : null
  const rows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return (active?.errors || []).filter((entry) => {
      const status = safeCount(entry.http_status)
      if (filter === '5xx' && status < 500) return false
      if (filter === '4xx' && (status < 400 || status >= 500)) return false
      if (filter === 'provider' && safeCount(entry.external_error_count) === 0) return false
      if (!search) return true
      return [entry.route, entry.response_code, entry.error_class, entry.provider, entry.target, entry.sample_error]
        .some((value) => String(value || '').toLowerCase().includes(search))
    })
  }, [active, query, filter])

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages)
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const expected = safeCount(active?.expected_windows)
  const measured = safeCount(active?.evidence_windows)
  const capped = safeCount(active?.possibly_capped_windows)
  const incomplete = active && (active.history_complete === false || measured < expected || capped > 0 || active.has_more)

  return (
    <section className="seh-root" aria-label="Stored Error History">
      <style>{css}</style>
      <div className="seh-head">
        <div>
          <div className="seh-title">Stored Error History</div>
          <div className="seh-sub">Recorded HTTP / provider errors from 15-minute snapshots · Loads only when requested</div>
        </div>
        <div className="seh-controls">
          <button type="button" className={`seh-btn ${range === '24h' ? 'active' : ''}`} onClick={() => { setRange('24h'); setPage(1) }}>24 Hours</button>
          <button type="button" className={`seh-btn ${range === '7d' ? 'active' : ''}`} onClick={() => { setRange('7d'); setPage(1) }}>7 Days</button>
          <button type="button" className="seh-btn primary" disabled={loading} onClick={() => load(Boolean(active))}>
            {loading ? 'Loading…' : active ? 'Refresh History' : 'Load History'}
          </button>
        </div>
      </div>
      <div className="seh-body">
        {error ? <div className="seh-error" role="alert">{error}</div> : null}
        {!active && !loading && !error ? <div className="seh-note">Choose a period and click Load History. No background polling or automatic database request is added.</div> : null}
        {active ? (
          <>
            <div className="seh-meta">
              <span className="seh-chip">Observed errors <strong>{countText(active.total_observed)}</strong></span>
              <span className="seh-chip">Affected routes <strong>{countText(active.affected_routes)}</strong></span>
              <span className="seh-chip">Evidence windows <strong>{countText(measured)} / {countText(expected)}</strong></span>
              <span className="seh-chip">Groups <strong>{countText(active.returned_groups)}</strong></span>
            </div>
            {incomplete ? <div className="seh-notice">Partial evidence: results cover available stored snapshots, not necessarily every request. {capped ? `${countText(capped)} window(s) may have capped error details. ` : ''}{active.has_more ? 'Only the top error groups are returned.' : ''}</div> : null}
            <div className="seh-note">Recorded from {dateText(active.window_start)} to {dateText(active.window_end)} · Last loaded {dateText(updatedAt)} · Source: {active.source || 'stored snapshots'}</div>
            <div className="seh-filters">
              <input className="seh-input" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search API, error, provider, code..." aria-label="Search Error History" />
              <select className="seh-select" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1) }} aria-label="Error type">
                <option value="all">All Errors</option>
                <option value="5xx">Server 5xx</option>
                <option value="4xx">Client 4xx</option>
                <option value="provider">Provider Failures</option>
              </select>
            </div>
            <div className="seh-table-wrap">
              <table className="seh-table">
                <thead><tr><th>HTTP</th><th>Route / Details</th><th>Source</th><th>Occurrences</th><th>Last Seen</th></tr></thead>
                <tbody>
                  {visible.map((entry, index) => (
                    <tr key={`${entry.route}:${entry.http_status}:${entry.response_code || ''}:${entry.target}:${index}`}>
                      <td><span className={`seh-code ${safeCount(entry.http_status) >= 500 ? 'server' : ''}`}>{entry.http_status ?? '—'}</span><div className="seh-mini">{entry.response_code || 'No code'}</div></td>
                      <td>
                        <div className="seh-route">{entry.route || 'UNKNOWN'}</div>
                        <div className="seh-mini">{entry.error_class || '—'}</div>
                        {entry.sample_error ? <div className="seh-detail">{entry.sample_error}</div> : null}
                        <div className="seh-mini">Request: {entry.sample_request_id || '—'} · Duration: {entry.sample_duration_ms == null ? '—' : `${Math.round(safeCount(entry.sample_duration_ms))} ms`}</div>
                      </td>
                      <td>{entry.provider || '—'}<div className="seh-mini">{entry.target || '—'}</div><div className="seh-mini">External failures: {countText(entry.external_error_count)}</div></td>
                      <td className="seh-count">{countText(entry.count)}</td>
                      <td>{dateText(entry.last_seen_at)}<div className="seh-mini">First: {dateText(entry.first_seen_at)}</div></td>
                    </tr>
                  ))}
                  {!visible.length ? <tr><td colSpan={5}><div className="seh-note">No matching errors in the available stored evidence.</div></td></tr> : null}
                </tbody>
              </table>
            </div>
            <div className="seh-pagination">
              <span>{countText(rows.length)} matching groups · Page {currentPage} / {pages}</span>
              <div className="seh-controls">
                <button type="button" className="seh-btn" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
                <button type="button" className="seh-btn" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>Next</button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
