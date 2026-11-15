import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  connectAdminFinancialReportsSheet,
  getAdminFinancialReportsStatus,
  syncAdminFinancialReportsMonth,
} from '../services/adminFinancialReportsApi'
import {
  formatAdminFinancialTime,
  getAdminFinancialCurrentMonth,
  getSafeAdminFinancialSheetUrl,
  validateAdminFinancialMonth,
} from '../utils/adminFinancialReportsDates'

const css = `
  .shadow-financial-overlay { position:fixed; inset:0; z-index:100000; background:rgba(8,13,34,.72); display:flex; align-items:center; justify-content:center; padding:18px; overflow-y:auto; }
  .shadow-financial-dialog { box-sizing:border-box; width:min(560px,100%); max-height:calc(100vh - 36px); overflow-y:auto; border-radius:20px; border:1px solid #dae0ed; background:#fff; color:#182033; padding:22px; box-shadow:0 28px 90px rgba(0,0,0,.32); }
  .shadow-financial-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
  .shadow-financial-title { margin:0; font-size:21px; font-weight:800; }
  .shadow-financial-subtitle { margin:7px 0 0; font-size:13px; color:#64748b; line-height:1.6; }
  .shadow-financial-close { flex-shrink:0; background:transparent; border:1px solid #cbd5e1; border-radius:10px; width:34px; height:34px; color:inherit; cursor:pointer; font-size:23px; line-height:1; }
  .shadow-financial-status { display:inline-flex; margin-top:17px; border-radius:999px; padding:6px 10px; font-size:12px; font-weight:800; background:#f0f4ff; color:#31358e; }
  .shadow-financial-status.off { color:#8b4513; background:#fff2e4; }
  .shadow-financial-label { display:block; margin:20px 0 7px; font-size:13px; font-weight:800; }
  .shadow-financial-input { box-sizing:border-box; width:100%; height:43px; border:1px solid #cbd5e1; border-radius:11px; background:#fff; padding:0 12px; color:#182033; font-size:14px; }
  .shadow-financial-actions { display:flex; flex-wrap:wrap; gap:9px; margin-top:14px; }
  .shadow-financial-btn { min-height:42px; padding:10px 16px; border-radius:11px; border:1px solid #cbd5e1; background:#fff; color:#252d44; font-size:13px; font-weight:800; cursor:pointer; }
  .shadow-financial-btn.primary { background:#4338ca; border-color:#4338ca; color:#fff; }
  .shadow-financial-btn:disabled { opacity:.5; cursor:not-allowed; }
  .shadow-financial-line { height:1px; background:#e2e8f0; margin:20px 0; }
  .shadow-financial-hint { font-size:12px; line-height:1.6; color:#64748b; margin:8px 0 0; }
  .shadow-financial-result { margin-top:12px; padding:12px; border-radius:10px; font-size:13px; line-height:1.5; background:#eef9f1; color:#176239; }
  .shadow-financial-result.error { background:#fff0ef; color:#a12f2a; }
  .shadow-financial-details { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:16px; }
  .shadow-financial-details > div { border:1px solid #e2e8f0; border-radius:10px; padding:10px; font-size:12px; line-height:1.5; }
  .shadow-financial-details strong { display:block; margin-bottom:3px; }
  .shadow-financial-link { display:inline-block; margin-top:13px; font-size:13px; color:#4338ca; font-weight:800; text-decoration:underline; }
  .dark .shadow-financial-dialog { background:#151b2e; border-color:#39445a; color:#f7f9ff; }
  .dark .shadow-financial-subtitle, .dark .shadow-financial-hint { color:#b5bfd4; }
  .dark .shadow-financial-close, .dark .shadow-financial-btn:not(.primary) { background:#222d43; border-color:#4b5871; color:#f7f9ff; }
  .dark .shadow-financial-input { background:#20293e; border-color:#4b5871; color:#f7f9ff; }
  .dark .shadow-financial-line { background:#39445a; }
  .dark .shadow-financial-details > div { border-color:#39445a; }
  .dark .shadow-financial-link { color:#b6b6ff; }
  @media (max-width:480px) { .shadow-financial-dialog { padding:17px; } .shadow-financial-details { grid-template-columns:1fr; } }
`

export default function AdminFinancialReportsPanel({ onClose }) {
  const [month, setMonth] = useState(() => getAdminFinancialCurrentMonth())
  const [status, setStatus] = useState(null)
  const [sheetLink, setSheetLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const mounted = useRef(false)
  const pending = useRef(false)
  const linkInput = useRef(null)

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    getAdminFinancialReportsStatus({ signal: controller.signal })
      .then((result) => {
        if (!mounted.current) return
        setStatus(result)
        setSheetLink((current) => current || getSafeAdminFinancialSheetUrl(result.spreadsheet_url))
      })
      .catch((failure) => {
        if (mounted.current && failure?.name !== 'AbortError') setError(failure.message)
      })
      .finally(() => { if (mounted.current) setLoading(false) })
    linkInput.current?.focus()
    return () => { mounted.current = false; controller.abort() }
  }, [])

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && !pending.current) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function run(action) {
    if (pending.current) return
    if (action === 'connect' && !getSafeAdminFinancialSheetUrl(sheetLink)) {
      setError('Please enter a valid Google Sheets link first.')
      return
    }
    pending.current = true
    setWorking(action)
    setError('')
    setNotice('')
    try {
      if (action === 'status') {
        const result = await getAdminFinancialReportsStatus()
        if (mounted.current) setStatus(result)
      } else if (action === 'connect') {
        const result = await connectAdminFinancialReportsSheet(sheetLink)
        if (mounted.current) {
          setSheetLink(getSafeAdminFinancialSheetUrl(result.spreadsheet_url) || sheetLink)
          setNotice('Google Sheet connected and tested successfully.')
        }
        const latest = await getAdminFinancialReportsStatus()
        if (mounted.current) setStatus(latest)
      } else if (action === 'sync') {
        const result = await syncAdminFinancialReportsMonth(validateAdminFinancialMonth(month))
        if (mounted.current) setNotice(result.reused
          ? 'This month was synced recently. No duplicate request was sent.'
          : `Sync completed: ${Number(result.processed || 0)} rows, ${Number(result.appended || 0)} added, ${Number(result.updated || 0)} updated.`)
        const latest = await getAdminFinancialReportsStatus()
        if (mounted.current) setStatus(latest)
      }
    } catch (failure) {
      if (mounted.current) setError(failure?.message || 'Unable to complete this request.')
    } finally {
      pending.current = false
      if (mounted.current) setWorking('')
    }
  }

  const configured = Boolean(status?.configured)
  const busy = loading || Boolean(working) || Boolean(status?.busy)
  const connected = Boolean(status?.connected_in_this_process)
  const resolvedLink = getSafeAdminFinancialSheetUrl(status?.spreadsheet_url || sheetLink)
  const body = (
    <div className="shadow-financial-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending.current) onClose?.() }}>
      <style>{css}</style>
      <section className="shadow-financial-dialog" role="dialog" aria-modal="true" aria-labelledby="shadow-financial-modal-title">
        <div className="shadow-financial-head">
          <div>
            <h2 className="shadow-financial-title" id="shadow-financial-modal-title">Google Sheets · Financial Reports</h2>
            <p className="shadow-financial-subtitle">Connect the Admin financial sheet and sync transactions when needed.</p>
          </div>
          <button className="shadow-financial-close" type="button" aria-label="Close" onClick={onClose} disabled={Boolean(working)}>×</button>
        </div>
        <span className={`shadow-financial-status ${!configured ? 'off' : ''}`}>
          {loading ? 'Checking configuration…' : !configured ? 'Backend setup required' : connected ? 'Connected' : 'Backend configured'}
        </span>
        <label className="shadow-financial-label" htmlFor="shadow-financial-sheet-url">Google Sheets link</label>
        <input ref={linkInput} id="shadow-financial-sheet-url" className="shadow-financial-input" inputMode="url" type="url" spellCheck={false} autoComplete="off" placeholder="https://docs.google.com/spreadsheets/d/.../edit" value={sheetLink} onChange={(event) => setSheetLink(event.target.value)} disabled={Boolean(working)} />
        <p className="shadow-financial-hint">The sheet must match SHADOW_ADMIN_FINANCIAL_SHEET_ID configured on Render. A different sheet requires updating that setting first.</p>
        <div className="shadow-financial-actions">
          <button className="shadow-financial-btn primary" type="button" onClick={() => run('connect')} disabled={busy || !configured}>
            {working === 'connect' ? 'Connecting…' : 'Connect / Test Sheet'}
          </button>
          <button className="shadow-financial-btn" type="button" onClick={() => run('status')} disabled={busy}>
            {working === 'status' ? 'Checking…' : 'Refresh Status'}
          </button>
        </div>
        <div className="shadow-financial-line" />
        <label className="shadow-financial-label" htmlFor="shadow-financial-month" style={{ marginTop: 0 }}>Reporting month (Cambodia)</label>
        <input id="shadow-financial-month" className="shadow-financial-input" type="month" value={month} max={getAdminFinancialCurrentMonth()} onChange={(event) => setMonth(event.target.value)} disabled={Boolean(working)} />
        <div className="shadow-financial-actions">
          <button type="button" className="shadow-financial-btn primary" disabled={busy || !configured || !connected} onClick={() => run('sync')}>
            {working === 'sync' ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
        <p className="shadow-financial-hint">Income data keeps its existing automatic refresh. Only Connect and Sync send requests to Google Sheets.</p>
        {error ? <div role="alert" className="shadow-financial-result error">{error}</div> : null}
        {notice ? <div role="status" className="shadow-financial-result">{notice}</div> : null}
        {status ? (
          <div className="shadow-financial-details">
            <div><strong>Last connection</strong>{formatAdminFinancialTime(status.last_connected_at)}</div>
            <div><strong>Last sync</strong>{formatAdminFinancialTime(status.last_sync?.synced_at)}</div>
            <div><strong>Rows in last sync</strong>{Number(status.last_sync?.processed || 0).toLocaleString()}</div>
          </div>
        ) : null}
        {resolvedLink ? <a className="shadow-financial-link" target="_blank" rel="noopener noreferrer" href={resolvedLink}>Open Google Sheet</a> : null}
      </section>
    </div>
  )
  return createPortal(body, document.body)
}
