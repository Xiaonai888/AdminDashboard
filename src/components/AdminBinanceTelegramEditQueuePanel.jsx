// STEP 7 — Read-only monitor. Does not retry, resend, edit, or credit anything.
import React, { useCallback, useEffect, useState } from 'react'

const FILTERS = [
  ['all', 'All'],
  ['pending', 'Pending'],
  ['editing', 'Editing'],
  ['retry', 'Retry (edit only)'],
  ['done', 'Done'],
  ['needs_review', 'Needs Review'],
]

function formatCambodiaDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'short', timeStyle: 'short' })} (KH)`
}

function statusText(status) {
  if (status === 'needs_review') return 'Needs Review'
  if (status === 'retry') return 'Retry (edit only)'
  if (status === 'done') return 'Done'
  if (status === 'editing') return 'Editing'
  return 'Pending'
}

export default function AdminBinanceTelegramEditQueuePanel({ request }) {
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [result, setResult] = useState({ items: [], total: 0, has_next: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    request(`/telegram-edit-queue?page=${page}&status=${encodeURIComponent(status)}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (controller.signal.aborted) return
        setResult({
          items: Array.isArray(data.items) ? data.items : [],
          total: Number(data.total || 0),
          has_next: data.has_next === true,
        })
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return
        setResult({ items: [], total: 0, has_next: false })
        setError(requestError?.message || 'Unable to load Telegram Edit Queue')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [request, status, page, refreshKey])

  return (
    <section className="recovery-detail" aria-label="Binance Telegram Edit Queue" style={{ marginTop: 14, marginBottom: 14 }}>
      <div className="recovery-section-head">
        <div>
          <h4 style={{ margin: 0 }}>Telegram Edit Queue</h4>
          <p className="recovery-muted" style={{ margin: '6px 0 0' }}>
            Tracks edits to existing Binance reports. No new Telegram messages or wallet credits are triggered from this panel.
          </p>
        </div>
        <button type="button" className="recovery-button" disabled={loading} onClick={refresh}>Refresh</button>
      </div>
      <div className="recovery-controls" style={{ marginTop: 12 }}>
        <select
          className="recovery-input"
          aria-label="Telegram edit queue status"
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1) }}
          disabled={loading}
        >
          {FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <span className="recovery-muted">{result.total} task(s) in selected status</span>
      </div>
      {error ? <p className="recovery-inline-error" role="alert">{error}</p> : null}
      <div className="recovery-table-wrap">
        <table className="recovery-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Purchase</th>
              <th>Edit Status</th>
              <th>Attempts</th>
              <th>Original Report</th>
              <th>Updated (KH)</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item) => (
              <tr key={item.transaction_id}>
                <td>
                  <strong style={{ wordBreak: 'break-all' }}>{item.transaction_id}</strong>
                  <div className="recovery-sub" style={{ wordBreak: 'break-all' }}>{item.fulfillment_key}</div>
                </td>
                <td>{String(item.purchase_kind || 'unknown').replaceAll('_', ' ')}</td>
                <td>
                  <span className={'recovery-pill ' + (item.edit_status === 'done' ? 'success' : 'pending_review')}>
                    {statusText(item.edit_status)}
                  </span>
                  {item.last_error ? <div className="recovery-sub" style={{ overflowWrap: 'anywhere' }}>{item.last_error}</div> : null}
                </td>
                <td>{item.attempt_count || 0}</td>
                <td>
                  {item.original_report_status || 'unknown'}
                  {item.original_telegram_message_id ? <div className="recovery-sub">Message #{item.original_telegram_message_id}</div> : null}
                </td>
                <td>
                  {formatCambodiaDate(item.updated_at)}
                  {item.telegram_edited_at ? <div className="recovery-sub">Edited: {formatCambodiaDate(item.telegram_edited_at)}</div> : null}
                  {item.edit_status === 'retry' ? <div className="recovery-sub">Next: {formatCambodiaDate(item.next_attempt_at)}</div> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? <p className="recovery-empty">Loading queue...</p> : null}
        {!loading && !error && !result.items.length ? <p className="recovery-empty">No edit tasks. This is normal if no verified Binance fulfillment has been recorded yet.</p> : null}
      </div>
      <div className="recovery-footer">
        <span className="recovery-muted">Page {page} · {result.items.length} displayed · {result.total} total in filter</span>
        <div className="recovery-actions">
          <button type="button" className="recovery-button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={loading || page <= 1}>Previous</button>
          <button type="button" className="recovery-button" onClick={() => setPage((p) => p + 1)} disabled={loading || !result.has_next}>Next</button>
        </div>
      </div>
      <p className="recovery-notice" style={{ marginTop: 12 }}>
        <strong>Needs Review</strong> means the existing Telegram message could not be edited automatically. Verify it manually. This panel never resends messages or grants rewards.
      </p>
    </section>
  )
}
