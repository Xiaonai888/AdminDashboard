import React, { useEffect, useRef, useState } from 'react'
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

export default function AdminFinancialReportsPanel() {
  const [month, setMonth] = useState(() => getAdminFinancialCurrentMonth())
  const [status, setStatus] = useState(null)
  const [sheetUrl, setSheetUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const mounted = useRef(true)
  const pending = useRef(false)

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    getAdminFinancialReportsStatus({ signal: controller.signal })
      .then((data) => {
        if (mounted.current) setStatus(data)
      })
      .catch((failure) => {
        if (mounted.current && failure?.name !== 'AbortError') setError(failure.message)
      })
      .finally(() => {
        if (mounted.current) setLoading(false)
      })
    return () => {
      mounted.current = false
      controller.abort()
    }
  }, [])

  async function run(operation) {
    if (pending.current) return
    pending.current = true
    setWorking(operation)
    setError('')
    setNotice('')
    try {
      if (operation === 'status') {
        const data = await getAdminFinancialReportsStatus()
        if (mounted.current) setStatus(data)
      } else if (operation === 'connect') {
        const data = await connectAdminFinancialReportsSheet()
        if (mounted.current) {
          setSheetUrl(getSafeAdminFinancialSheetUrl(data.spreadsheet_url))
          setNotice('Google Sheet connection checked successfully.')
          const current = await getAdminFinancialReportsStatus()
          if (mounted.current) setStatus(current)
        }
      } else if (operation === 'sync') {
        const selected = validateAdminFinancialMonth(month)
        const data = await syncAdminFinancialReportsMonth(selected)
        if (mounted.current) {
          setNotice(data.reused
            ? 'This month was synced recently. No new request was needed.'
            : `Sync completed: ${Number(data.processed || 0)} rows processed, ${Number(data.appended || 0)} added, ${Number(data.updated || 0)} updated, ${Number(data.skipped || 0)} unchanged.`)
          const current = await getAdminFinancialReportsStatus()
          if (mounted.current) setStatus(current)
        }
      }
    } catch (failure) {
      if (mounted.current) setError(failure?.message || 'Unable to complete the request.')
    } finally {
      pending.current = false
      if (mounted.current) setWorking('')
    }
  }

  const configured = Boolean(status?.configured)
  const disabled = loading || Boolean(working) || !configured || status?.busy
  const lastSync = status?.last_sync
  const url = getSafeAdminFinancialSheetUrl(sheetUrl)

  return (
    <section aria-label="Admin Google Sheets financial reports" className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Sheets · Financial Reports</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Admin-only report · Manual sync · Diamond Top-Up, Episode, Gift, PDF and Book</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loading ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' : configured ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'}`}>
          {loading ? 'Checking…' : configured ? 'Backend configured' : 'Setup required'}
        </span>
      </div>

      {!loading && !configured ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Configure SHADOW_ADMIN_FINANCIAL_WEB_APP_URL, SHADOW_ADMIN_FINANCIAL_SECRET and SHADOW_ADMIN_FINANCIAL_SHEET_ID in Render first. Do not put secrets in Admin frontend code.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[165px] flex-1 sm:flex-none">
          <label htmlFor="admin-financial-report-month" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Reporting month (Cambodia)</label>
          <input
            id="admin-financial-report-month"
            type="month"
            value={month}
            max={getAdminFinancialCurrentMonth()}
            onChange={(event) => setMonth(event.target.value)}
            disabled={Boolean(working)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <button type="button" disabled={disabled} onClick={() => run('connect')} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {working === 'connect' ? 'Connecting…' : 'Connect / Test Sheet'}
        </button>
        <button type="button" disabled={disabled} onClick={() => run('sync')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-600">
          {working === 'sync' ? 'Syncing…' : 'Sync Now'}
        </button>
        <button type="button" disabled={loading || Boolean(working)} onClick={() => run('status')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">
          {working === 'status' ? 'Checking…' : 'Refresh Status'}
        </button>
        {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-700 underline dark:text-indigo-300">Open Google Sheet</a> : null}
      </div>

      {error ? <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">{notice}</p> : null}

      {status ? (
        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-xs text-slate-600 sm:grid-cols-3 dark:border-slate-700 dark:text-slate-300">
          <div><span className="block font-bold text-slate-800 dark:text-white">Last connection test</span>{formatAdminFinancialTime(status.last_connected_at)}</div>
          <div><span className="block font-bold text-slate-800 dark:text-white">Last sync on this server</span>{formatAdminFinancialTime(lastSync?.synced_at)}</div>
          <div><span className="block font-bold text-slate-800 dark:text-white">Rows in last sync</span>{Number(lastSync?.processed || 0).toLocaleString()}</div>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Only button clicks start Connect or Sync. Report status resets when the Backend restarts. Shipping is not platform earnings; Diamond spending is not new cash.</p>
    </section>
  )
}
