import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const BASE = '/api/admin/events/100-percent'
const DAY = 86400

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function request(path, options = {}) {
  const token = getToken()
  if (!token) throw new Error('Admin login required')
  const response = await fetch(`${API_URL}${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.ok === false) {
    const error = new Error(result.message || 'Request failed')
    error.code = result.code || ''
    throw error
  }
  return result
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function formatRemaining(cycle, now = Date.now()) {
  if (!cycle) return '—'
  const stored = Number(cycle.remaining_seconds || 0)
  const resumed = new Date(cycle.last_resumed_at || '').getTime()
  const elapsed = cycle.status === 'active' && Number.isFinite(resumed)
    ? Math.max(0, Math.floor((now - resumed) / 1000)) : 0
  const seconds = Math.max(0, stored - elapsed)
  const days = Math.floor(seconds / DAY)
  const hours = Math.floor((seconds % DAY) / 3600)
  return `${days}d ${hours}h`
}

function isCurrent(cycle, now = Date.now()) {
  return cycle.status === 'active' && formatRemainingSeconds(cycle, now) > 0
}

function formatRemainingSeconds(cycle, now = Date.now()) {
  const resumed = new Date(cycle?.last_resumed_at || '').getTime()
  const elapsed = cycle?.status === 'active' && Number.isFinite(resumed)
    ? Math.max(0, Math.floor((now - resumed) / 1000)) : 0
  return Math.max(0, Number(cycle?.remaining_seconds || 0) - elapsed)
}

const styles = `
  .a100{display:grid;gap:18px;color:var(--shadow-admin-text,#0f172a)}
  .a100 *{box-sizing:border-box}
  .a100-head,.a100-card{background:var(--shadow-admin-card,#fff);border:1px solid var(--shadow-admin-border,#e2e8f0);border-radius:17px;padding:18px}
  .a100-head{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}
  .a100 h2,.a100 h3,.a100 p{margin:0}
  .a100 h2{font-size:19px;font-weight:900}.a100 h3{font-size:15px;font-weight:850}
  .a100-muted{color:var(--shadow-admin-muted,#64748b);font-size:12px;line-height:1.5}
  .a100-count{font-size:25px;font-weight:950;color:var(--shadow-admin-primary,#4f46e5)}
  .a100-cols{display:grid;grid-template-columns:minmax(260px,1fr) minmax(300px,1.2fr);gap:16px;align-items:start}
  .a100-stack{display:grid;gap:12px}.a100-row{display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap}
  .a100-input{width:100%;min-height:42px;border:1px solid var(--shadow-admin-border,#cbd5e1);border-radius:10px;background:var(--shadow-admin-card,#fff);color:var(--shadow-admin-text,#0f172a);padding:9px 11px;font-size:14px;outline:none}
  .a100-input:focus{border-color:var(--shadow-admin-primary,#4f46e5)}
  .a100-btn{border:0;border-radius:10px;min-height:38px;padding:9px 12px;background:var(--shadow-admin-primary,#4f46e5);color:white;font-size:12px;font-weight:850;cursor:pointer}
  .a100-btn.alt{background:var(--shadow-admin-primary-light,#eef2ff);color:var(--shadow-admin-primary,#4f46e5)}
  .a100-btn.danger{background:#dc2626;color:#fff}.a100-btn:disabled{cursor:not-allowed;opacity:.5}
  .a100-item{display:grid;gap:7px;border:1px solid var(--shadow-admin-border,#e2e8f0);border-radius:11px;padding:12px;text-align:left;width:100%;background:var(--shadow-admin-card,#fff);color:var(--shadow-admin-text,#0f172a)}
  .a100-item.clickable{cursor:pointer}.a100-item.selected{border-color:var(--shadow-admin-primary,#4f46e5);background:var(--shadow-admin-primary-light,#eef2ff)}
  .a100-id{font:11px monospace;overflow-wrap:anywhere;color:var(--shadow-admin-muted,#64748b)}
  .a100-tag{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:850;background:var(--shadow-admin-primary-light,#eef2ff);color:var(--shadow-admin-primary,#4f46e5)}
  .a100-alert{border-radius:10px;padding:11px 12px;font-size:12px;line-height:1.5;background:#eff6ff;color:#1e40af}
  .a100-alert.error{background:#fef2f2;color:#991b1b}
  .a100-list{display:grid;gap:8px;max-height:480px;overflow:auto}
  .a100-divider{border-top:1px solid var(--shadow-admin-border,#e2e8f0);margin:4px 0}
  .a100-modal-bg{position:fixed;inset:0;z-index:110;display:grid;place-items:center;background:rgba(15,23,42,.6);padding:16px}
  .a100-modal{width:min(100%,470px);max-height:90vh;overflow:auto;border-radius:18px;padding:20px;background:var(--shadow-admin-card,#fff);color:var(--shadow-admin-text,#0f172a);display:grid;gap:13px}
  .a100-modal .a100-btn{flex:1}.a100-modal-actions{display:flex;gap:10px}
  @media(max-width:840px){.a100-cols{grid-template-columns:1fr}.a100-head,.a100-card{padding:14px}}
`

export default function AdminAuthor100PercentEventTab() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(null)
  const [cycles, setCycles] = useState([])
  const [history, setHistory] = useState({ cycles: [], history: [] })
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingCycles, setLoadingCycles] = useState(true)
  const [days, setDays] = useState('365')
  const [modal, setModal] = useState(null)
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(Date.now())
  const selectionRef = useRef(0)

  async function refreshCycles() {
    setLoadingCycles(true)
    try {
      const data = await request('/cycles')
      setCycles(Array.isArray(data.cycles) ? data.cycles : [])
    } finally {
      setLoadingCycles(false)
    }
  }

  useEffect(() => {
    refreshCycles().catch((err) => setError(err.message))
    const ticker = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(ticker)
  }, [])

  useEffect(() => {
    const value = query.trim()
    if (value.length < 2 || value.length > 64) {
      setResults([])
      setSearching(false)
      return undefined
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await request(`/authors/search?q=${encodeURIComponent(value)}`)
        if (!cancelled) setResults(Array.isArray(data.authors) ? data.authors.slice(0, 10) : [])
      } catch (err) {
        if (!cancelled) {
          setResults([])
          setError(err.message)
        }
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query])

  async function selectAuthor(author) {
    const ticket = ++selectionRef.current
    setSelected(author)
    setHistory({ cycles: [], history: [] })
    setLoadingHistory(true)
    setError('')
    setNotice('')
    try {
      const data = await request(`/authors/${encodeURIComponent(author.id)}/history`)
      if (ticket === selectionRef.current) {
        setHistory({ cycles: data.cycles || [], history: data.history || [] })
      }
    } catch (err) {
      if (ticket === selectionRef.current) setError(err.message)
    } finally {
      if (ticket === selectionRef.current) setLoadingHistory(false)
    }
  }

  const activeCount = cycles.filter((cycle) => isCurrent(cycle, now)).length
  const openCycle = history.cycles.find((cycle) => cycle.status !== 'completed') || null
  const pastCycles = history.cycles.filter((cycle) => cycle.status === 'completed')
  const canRemove = openCycle?.status === 'active' || openCycle?.status === 'scheduled'
  const canAdd = !openCycle || openCycle.status === 'paused'
  const durationDays = Number(days)

  function showConfirm(action) {
    if (!selected || (action === 'remove' && !canRemove) || (action === 'add' && !canAdd)) return
    if (action === 'add' && (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650)) {
      setError('Duration must be between 1 and 3650 whole days')
      return
    }
    const requiresPin = action === 'remove' || (action === 'add' && (activeCount >= 10 || (!openCycle && pastCycles.length > 0)))
    setPin('')
    setError('')
    setModal({ action, requiresPin, duration: openCycle?.status === 'paused' ? null : durationDays })
  }

  async function confirmAction() {
    if (!selected || !modal || busy) return
    if (modal.requiresPin && !/^\d{6}$/.test(pin)) {
      setError('Enter your 6-digit Admin Passkey')
      return
    }
    setBusy(true)
    setError('')
    try {
      const action = modal.action
      await request(`/authors/${encodeURIComponent(selected.id)}/actions`, {
        method: 'POST',
        body: JSON.stringify({ action, duration_days: modal.duration || 365, ...(pin ? { passkey_pin: pin } : {}) }),
      })
      setPin('')
      setModal(null)
      setNotice(`${selected.page_name || selected.author_name_at_grant || selected.id}: ${action === 'add' ? 'added/resumed' : 'removed'} successfully`)
      const refreshed = await Promise.allSettled([refreshCycles(), selectAuthor(selected)])
      for (const value of refreshed) {
        if (value.status === 'rejected') setError(value.reason?.message || 'Refresh failed')
      }
    } catch (err) {
      setError(err.message)
      if (err.code === 'PASSKEY_REQUIRED') setModal((current) => current ? { ...current, requiresPin: true } : current)
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="a100">
      <style>{styles}</style>
      <div className="a100-head">
        <div className="a100-stack" style={{ gap: 5 }}>
          <h2>100% Author Event</h2>
          <p className="a100-muted">Owner-selected authors · 100% revenue share · one event cycle per Author ID</p>
        </div>
        <div className="a100-row">
          <span className="a100-count">{activeCount}</span>
          <span className="a100-muted">Active authors · Passkey required to add above 10</span>
          <button type="button" className="a100-btn alt" disabled={loadingCycles} onClick={() => refreshCycles().catch((err) => setError(err.message))}>Refresh</button>
        </div>
      </div>
      {notice ? <div className="a100-alert" role="status">{notice}</div> : null}
      {error ? <div className="a100-alert error" role="alert">{error}</div> : null}
      <div className="a100-cols">
        <div className="a100-stack">
          <div className="a100-card a100-stack">
            <h3>Find author</h3>
            <p className="a100-muted">Search by page name (2+ characters) or exact Author ID. Up to 10 matches are returned.</p>
            <input className="a100-input" value={query} maxLength={64} onChange={(event) => setQuery(event.target.value)} placeholder="Page name or Author ID" autoComplete="off" />
            {searching ? <span className="a100-muted">Searching...</span> : null}
            <div className="a100-list">
              {results.map((author) => (
                <button key={author.id} type="button" className={`a100-item clickable ${selected?.id === author.id ? 'selected' : ''}`} onClick={() => selectAuthor(author)}>
                  <strong>{author.page_name || 'Unnamed author'}</strong>
                  <span className="a100-id">Author ID: {author.id}</span>
                </button>
              ))}
              {!searching && query.trim().length >= 2 && results.length === 0 ? <span className="a100-muted">No matching authors.</span> : null}
            </div>
          </div>
          <div className="a100-card a100-stack">
            <div className="a100-row"><h3>Event cycles</h3><span className="a100-muted">Latest 50 · read-only history</span></div>
            {loadingCycles ? <span className="a100-muted">Loading...</span> : null}
            <div className="a100-list">
              {cycles.map((cycle) => (
                <button key={cycle.id} type="button" className={`a100-item clickable ${selected?.id === cycle.author_id ? 'selected' : ''}`} onClick={() => selectAuthor({ id: cycle.author_id, page_name: cycle.author_name_at_grant })}>
                  <div className="a100-row"><strong>{cycle.author_name_at_grant || 'Author'}</strong><span className="a100-tag">{isCurrent(cycle, now) ? 'Active' : cycle.status === 'active' ? 'Expired' : cycle.status}</span></div>
                  <span className="a100-id">{cycle.author_id}</span>
                  <span className="a100-muted">Remaining: {formatRemaining(cycle, now)} · Granted: {Number(cycle.duration_seconds || 0) / DAY} days</span>
                </button>
              ))}
              {!loadingCycles && cycles.length === 0 ? <span className="a100-muted">No event cycles yet.</span> : null}
            </div>
          </div>
        </div>
        <div className="a100-card a100-stack">
          <h3>Selected author</h3>
          {!selected ? <p className="a100-muted">Select an author to inspect their Author ID, previous rewards, remaining time and action history.</p> : (
            <>
              <strong>{selected.page_name || selected.author_name_at_grant || 'Author'}</strong>
              <span className="a100-id">{selected.id}</span>
              {loadingHistory ? <p className="a100-muted">Loading event history...</p> : (
                <>
                  {openCycle ? <div className="a100-item">
                    <div className="a100-row"><strong>Current cycle</strong><span className="a100-tag">{openCycle.status}</span></div>
                    <span className="a100-muted">Originally granted: {Number(openCycle.duration_seconds || 0) / DAY} days</span>
                    <span className="a100-muted">Remaining: {formatRemaining(openCycle, now)}</span>
                    <span className="a100-muted">Started: {formatDate(openCycle.first_started_at)}</span>
                    <span className="a100-muted">Last removed: {formatDate(openCycle.last_paused_at)}</span>
                  </div> : <p className="a100-muted">No current event cycle.</p>}
                  {pastCycles.length > 0 ? <div className="a100-alert">This Author ID has received a previous reward. A new cycle requires a confirmation and the Owner Passkey.</div> : null}
                  {pastCycles.map((cycle) => <div key={cycle.id} className="a100-item">
                    <div className="a100-row"><strong>Previous cycle</strong><span className="a100-tag">Completed</span></div>
                    <span className="a100-muted">Granted: {Number(cycle.duration_seconds || 0) / DAY} days</span>
                    <span className="a100-muted">Started: {formatDate(cycle.first_started_at)}</span>
                    <span className="a100-muted">Completed: {formatDate(cycle.completed_at)}</span>
                  </div>)}
                  <div className="a100-divider" />
                  {!openCycle ? <label className="a100-stack" style={{ gap: 5 }}>
                    <strong>Duration (days)</strong>
                    <input className="a100-input" type="number" min="1" max="3650" step="1" value={days} onChange={(event) => setDays(event.target.value)} />
                  </label> : null}
                  <div className="a100-row">
                    {canAdd ? <button type="button" className="a100-btn" onClick={() => showConfirm('add')}>{openCycle?.status === 'paused' ? 'Resume remaining time' : 'Add author'}</button> : null}
                    {canRemove ? <button type="button" className="a100-btn danger" onClick={() => showConfirm('remove')}>Remove author</button> : null}
                    {!canAdd && !canRemove ? <span className="a100-muted">An event cycle is already running. Refresh after it completes.</span> : null}
                  </div>
                  <div className="a100-divider" />
                  <div className="a100-row"><h3>Action history</h3><span className="a100-muted">Latest 100 entries</span></div>
                  <div className="a100-list">
                    {history.history.map((entry) => <div key={entry.id} className="a100-item">
                      <div className="a100-row"><strong>{entry.action}</strong><span className="a100-tag">{entry.status_after || 'Recorded'}</span></div>
                      <span className="a100-muted">{formatDate(entry.created_at)} · {entry.admin_email || entry.admin_id}</span>
                      <span className="a100-muted">Remaining: {entry.seconds_remaining_before == null ? '—' : `${Math.floor(entry.seconds_remaining_before / DAY)}d`} → {entry.seconds_remaining_after == null ? '—' : `${Math.floor(entry.seconds_remaining_after / DAY)}d`}</span>
                    </div>)}
                    {history.history.length === 0 ? <p className="a100-muted">No recorded actions yet.</p> : null}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {modal && selected ? <div className="a100-modal-bg" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) { setModal(null); setPin(''); setError('') } }}>
        <div className="a100-modal" role="dialog" aria-modal="true" aria-label="Confirm author event action">
          <h2>{modal.action === 'remove' ? 'Confirm removal' : openCycle?.status === 'paused' ? 'Confirm resume' : pastCycles.length > 0 ? 'Confirm another reward' : 'Confirm author enrollment'}</h2>
          <p className="a100-muted">{selected.page_name || selected.author_name_at_grant || 'Author'} · ID: {selected.id}</p>
          {pastCycles.length > 0 ? <div className="a100-alert">Previous reward: started {formatDate(pastCycles[0].first_started_at)}; completed {formatDate(pastCycles[0].completed_at)}. This Author ID has already received a reward.</div> : null}
          <div className="a100-item">
            {modal.action === 'remove' ? <p>Stop the current 100% Author Event and preserve {formatRemaining(openCycle, now)} for a future resume. Other event eligibility will be restored by the backend.</p> : openCycle?.status === 'paused' ? <p>Resume the existing event with {formatRemaining(openCycle, now)} remaining; do not grant a fresh year.</p> : <p>Grant 100% revenue share for {modal.duration} days, starting immediately.</p>}
          </div>
          {modal.requiresPin ? <label className="a100-stack" style={{ gap: 5 }}><strong>Owner Passkey · 6 digits</strong><input className="a100-input" type="password" value={pin} inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="off" onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" /></label> : <p className="a100-muted">Please confirm this action. A permanent event record will be created.</p>}
          {error ? <div className="a100-alert error" role="alert">{error}</div> : null}
          <div className="a100-modal-actions"><button type="button" className="a100-btn alt" disabled={busy} onClick={() => { setModal(null); setPin(''); setError('') }}>Cancel</button><button type="button" className={`a100-btn ${modal.action === 'remove' ? 'danger' : ''}`} disabled={busy || (modal.requiresPin && !/^\d{6}$/.test(pin))} onClick={confirmAction}>{busy ? 'Saving...' : 'Confirm'}</button></div>
        </div>
      </div> : null}
    </section>
  )
}
