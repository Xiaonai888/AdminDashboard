import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  connectAdminFinancialReportsSheet,
  getAdminFinancialReportsHistoryRange,
  getAdminFinancialReportsStatus,
  syncAdminFinancialReportsMonth,
} from '../services/adminFinancialReportsApi'
import {
  formatAdminFinancialTime,
  getSafeAdminFinancialSheetUrl,
} from '../utils/adminFinancialReportsDates'
import {
  getAdminFinancialHistoryProgress,
  listAdminFinancialHistoryMonths,
} from '../utils/adminFinancialReportsHistory'

const STORAGE_PREFIX = 'shadow_admin_financial_history_v1:'
const REQUEST_GAP_MS = 13000

function storageKey(url) {
  try {
    const safeUrl = getSafeAdminFinancialSheetUrl(url)
    const match = safeUrl && new URL(safeUrl).pathname.match(/^\/spreadsheets\/d\/([A-Za-z0-9_-]+)/)
    return match ? `${STORAGE_PREFIX}${match[1]}` : ''
  } catch {
    return ''
  }
}

function readCheckpoint(url) {
  const key = storageKey(url)
  if (!key) return null
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null')
    if (!data || !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.start_month) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.end_month)) return null
    if (!Number.isSafeInteger(data.next_index) || data.next_index < 0) return null
    return data
  } catch {
    return null
  }
}

function saveCheckpoint(url, value) {
  const key = storageKey(url)
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

function validResume(saved, range, months) {
  return saved && saved.start_month === range.start_month && saved.end_month <= range.end_month && saved.next_index <= months.length
}

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
  .shadow-financial-result { margin-top:12px; padding:12px; border-radius:10px; font-size:13px; line-height:1.5; background:#eef9f1; color:#176239; white-space:pre-wrap; overflow-wrap:anywhere; }
  .shadow-financial-result.error { background:#fff0ef; color:#a12f2a; }
  .shadow-financial-details { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:16px; }
  .shadow-financial-details > div { border:1px solid #e2e8f0; border-radius:10px; padding:10px; font-size:12px; line-height:1.5; }
  .shadow-financial-details strong { display:block; margin-bottom:3px; }
  .shadow-financial-link { display:inline-block; margin-top:13px; font-size:13px; color:#4338ca; font-weight:800; text-decoration:underline; }
  .shadow-financial-progress { margin-top:17px; border:1px solid #e2e8f0; border-radius:12px; padding:13px; }
  .shadow-financial-progress-header { display:flex; justify-content:space-between; gap:8px; font-size:13px; font-weight:800; }
  .shadow-financial-progress-track { height:9px; border-radius:999px; background:#e2e8f0; overflow:hidden; margin:10px 0; }
  .shadow-financial-progress-fill { height:100%; background:#4f46e5; transition:width .2s; }
  .shadow-financial-progress-note { font-size:12px; color:#64748b; line-height:1.5; }
  .dark .shadow-financial-dialog { background:#151b2e; border-color:#39445a; color:#f7f9ff; }
  .dark .shadow-financial-subtitle, .dark .shadow-financial-hint, .dark .shadow-financial-progress-note { color:#b5bfd4; }
  .dark .shadow-financial-close, .dark .shadow-financial-btn:not(.primary) { background:#222d43; border-color:#4b5871; color:#f7f9ff; }
  .dark .shadow-financial-input { background:#20293e; border-color:#4b5871; color:#f7f9ff; }
  .dark .shadow-financial-line, .dark .shadow-financial-progress-track { background:#39445a; }
  .dark .shadow-financial-details > div, .dark .shadow-financial-progress { border-color:#39445a; }
  .dark .shadow-financial-link { color:#b6b6ff; }
  @media (max-width:480px) { .shadow-financial-dialog { padding:17px; } .shadow-financial-details { grid-template-columns:1fr; } }
`

export default function AdminFinancialReportsPanel({ onClose }) {
  const [status, setStatus] = useState(null)
  const [sheetLink, setSheetLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [historyRange, setHistoryRange] = useState(null)
  const [checkpoint, setCheckpoint] = useState(null)
  const [progress, setProgress] = useState(null)
  const mounted = useRef(false)
  const pending = useRef(false)
  const pauseRequested = useRef(false)
  const linkInput = useRef(null)

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    getAdminFinancialReportsStatus({ signal: controller.signal })
      .then((result) => {
        if (!mounted.current) return
        setStatus(result)
        const link = getSafeAdminFinancialSheetUrl(result.spreadsheet_url)
        setSheetLink((current) => current || link)
        setCheckpoint(readCheckpoint(link))
      })
      .catch((failure) => {
        if (mounted.current && failure?.name !== 'AbortError') setError(failure.message)
      })
      .finally(() => { if (mounted.current) setLoading(false) })
    linkInput.current?.focus()
    return () => { mounted.current = false; controller.abort(); pauseRequested.current = true }
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
        const data = await getAdminFinancialReportsStatus()
        if (mounted.current) setStatus(data)
      } else if (action === 'connect') {
        const data = await connectAdminFinancialReportsSheet(sheetLink)
        const link = getSafeAdminFinancialSheetUrl(data.spreadsheet_url) || getSafeAdminFinancialSheetUrl(sheetLink)
        if (mounted.current) {
          setSheetLink(link)
          setCheckpoint(readCheckpoint(link))
          setNotice('Google Sheet connected and tested successfully.')
        }
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

  async function waitForNextRequest() {
    for (let elapsed = 0; elapsed < REQUEST_GAP_MS; elapsed += 1000) {
      if (pauseRequested.current || !mounted.current) break
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  async function syncAllHistory(resume = false) {
    if (pending.current) return
    pending.current = true
    pauseRequested.current = false
    setWorking('history')
    setError('')
    setNotice('')
    setProgress(null)
    try {
      const range = await getAdminFinancialReportsHistoryRange()
      const months = listAdminFinancialHistoryMonths(range.start_month, range.end_month)
      const url = getSafeAdminFinancialSheetUrl(sheetLink)
      const previous = readCheckpoint(url)
      const canResume = validResume(previous, range, months)
      const start = resume && canResume ? previous.next_index : 0
      let processed = start && canResume ? Number(previous.rows_processed || 0) : 0
      if (!resume || !canResume) {
        const initial = {
          start_month: range.start_month,
          end_month: range.end_month,
          next_index: 0,
          rows_processed: 0,
          updated_at: new Date().toISOString(),
          complete: false,
        }
        saveCheckpoint(url, initial)
        setCheckpoint(initial)
      }
      setHistoryRange(range)
      setProgress({ completed: start, total: months.length, month: months[start] || '', phase: 'running', rows: processed })
      if (!range.has_transactions) {
        setNotice('No financial transactions found in the connected sources yet.')
      }
      for (let index = start; index < months.length; index += 1) {
        if (pauseRequested.current || !mounted.current) break
        const month = months[index]
        setProgress({ completed: index, total: months.length, month, phase: 'running', rows: processed })
        const result = await syncAdminFinancialReportsMonth(month)
        processed += Number(result.processed || 0)
        const saved = {
          start_month: range.start_month,
          end_month: range.end_month,
          next_index: index + 1,
          rows_processed: processed,
          updated_at: new Date().toISOString(),
          complete: index + 1 === months.length,
        }
        saveCheckpoint(url, saved)
        if (mounted.current) {
          setCheckpoint(saved)
          setStatus((current) => ({ ...current, last_sync: result }))
          setProgress({ completed: index + 1, total: months.length, month, phase: 'running', rows: processed })
        }
        if (index + 1 < months.length && !pauseRequested.current) {
          setNotice('Waiting between months to limit backend requests…')
          await waitForNextRequest()
        }
      }
      if (mounted.current) {
        const saved = readCheckpoint(url)
        if (saved?.next_index >= months.length) {
          setProgress({ completed: months.length, total: months.length, month: months[months.length - 1], phase: 'complete', rows: processed })
          setNotice(`All available financial history synced successfully. ${months.length} months processed.`)
        } else {
          setProgress((current) => current && { ...current, phase: 'paused' })
          setNotice('Paused. Use Resume to continue from the next unsynced month.')
        }
      }
    } catch (failure) {
      if (mounted.current) {
        setProgress((current) => current && { ...current, phase: 'error' })
        setError(failure?.message || 'Financial history sync failed. Resume to retry the incomplete month.')
      }
    } finally {
      pending.current = false
      pauseRequested.current = false
      if (mounted.current) setWorking('')
    }
  }

  const configured = Boolean(status?.configured)
  const busy = loading || Boolean(working) || Boolean(status?.busy)
  const connected = Boolean(status?.connected_in_this_process)
  const sheetConfirmed = connected && Boolean(storageKey(sheetLink)) && storageKey(sheetLink) === storageKey(status?.spreadsheet_url)
  const resolvedLink = getSafeAdminFinancialSheetUrl(status?.spreadsheet_url || sheetLink)
  const savedProgress = checkpoint && historyRange && checkpoint.start_month === historyRange.start_month
    ? getAdminFinancialHistoryProgress(checkpoint.next_index, historyRange.months_total)
    : null
  const shownProgress = progress ? getAdminFinancialHistoryProgress(progress.completed, progress.total) : savedProgress
  const canResume = Boolean(checkpoint && checkpoint.next_index > 0 && (!checkpoint.complete || (historyRange && checkpoint.end_month < historyRange.end_month)))
  const body = (
    <div className="shadow-financial-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending.current) onClose?.() }}>
      <style>{css}</style>
      <section className="shadow-financial-dialog" role="dialog" aria-modal="true" aria-labelledby="shadow-financial-modal-title">
        <div className="shadow-financial-head">
          <div>
            <h2 className="shadow-financial-title" id="shadow-financial-modal-title">Google Sheets · Financial Reports</h2>
            <p className="shadow-financial-subtitle">Connect your Admin financial sheet and sync all available income history.</p>
          </div>
          <button className="shadow-financial-close" type="button" aria-label="Close" onClick={onClose} disabled={Boolean(working)}>×</button>
        </div>
        <span className={`shadow-financial-status ${!configured ? 'off' : ''}`}>
          {loading ? 'Checking configuration…' : !configured ? 'Backend setup required' : connected ? 'Connected' : 'Backend configured'}
        </span>
        <label className="shadow-financial-label" htmlFor="shadow-financial-sheet-url">Google Sheets link</label>
        <input ref={linkInput} id="shadow-financial-sheet-url" className="shadow-financial-input" inputMode="url" type="url" spellCheck={false} autoComplete="off" placeholder="https://docs.google.com/spreadsheets/d/.../edit" value={sheetLink} onChange={(event) => { setSheetLink(event.target.value); setCheckpoint(readCheckpoint(event.target.value)) }} disabled={Boolean(working)} />
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
        <h3 className="shadow-financial-label" style={{ marginTop: 0 }}>All Income History</h3>
        <p className="shadow-financial-hint">From the oldest recorded transaction through the current month (Cambodia time). No month selection is required.</p>
        {connected && !sheetConfirmed ? <p className="shadow-financial-hint">The entered link differs from the connected Sheet. Restore the original link and use Connect / Test Sheet.</p> : null}
        {historyRange ? <p className="shadow-financial-hint">Available history: {historyRange.start_month} to {historyRange.end_month} · {historyRange.months_total} months</p> : null}
        <div className="shadow-financial-actions">
          <button type="button" className="shadow-financial-btn primary" disabled={busy || !configured || !sheetConfirmed} onClick={() => syncAllHistory(false)}>
            {working === 'history' ? 'Syncing History…' : 'Sync All History'}
          </button>
          {canResume && working !== 'history' ? (
            <button type="button" className="shadow-financial-btn" disabled={busy || !configured || !sheetConfirmed} onClick={() => syncAllHistory(true)}>Resume</button>
          ) : null}
          {working === 'history' ? (
            <button type="button" className="shadow-financial-btn" disabled={pauseRequested.current} onClick={() => { pauseRequested.current = true; setNotice('Pausing after the current month…') }}>Pause</button>
          ) : null}
        </div>
        {shownProgress ? (
          <div className="shadow-financial-progress" role="status" aria-live="polite">
            <div className="shadow-financial-progress-header"><span>{shownProgress.completed} / {shownProgress.total} months</span><span>{shownProgress.percent}%</span></div>
            <div className="shadow-financial-progress-track"><div className="shadow-financial-progress-fill" style={{ width: `${shownProgress.percent}%` }} /></div>
            <div className="shadow-financial-progress-note">{progress?.month ? `Month: ${progress.month} · ` : ''}{progress?.phase === 'complete' ? 'Complete' : progress?.phase === 'error' ? 'Stopped on error' : progress?.phase === 'paused' ? 'Paused' : working === 'history' ? 'Syncing one month at a time' : 'Ready to resume'}{progress?.rows != null ? ` · ${progress.rows} rows processed` : ''}</div>
          </div>
        ) : checkpoint ? <p className="shadow-financial-hint">Saved history checkpoint: {checkpoint.next_index} month(s) previously processed.</p> : null}
        <p className="shadow-financial-hint">Only a button click starts syncing. Keep this popup open while it runs. A saved checkpoint lets you resume after interruption. Syncing the same transaction again uses an upsert rather than adding a duplicate.</p>
        {error ? <div role="alert" className="shadow-financial-result error">{error}</div> : null}
        {notice ? <div className="shadow-financial-result">{notice}</div> : null}
        {status ? (
          <div className="shadow-financial-details">
            <div><strong>Last connection</strong>{formatAdminFinancialTime(status.last_connected_at)}</div>
            <div><strong>Last month synced</strong>{formatAdminFinancialTime(status.last_sync?.synced_at)}</div>
            <div><strong>Rows in last month</strong>{Number(status.last_sync?.processed || 0).toLocaleString()}</div>
          </div>
        ) : null}
        {resolvedLink ? <a className="shadow-financial-link" target="_blank" rel="noopener noreferrer" href={resolvedLink}>Open Google Sheet</a> : null}
      </section>
    </div>
  )
  return createPortal(body, document.body)
}
