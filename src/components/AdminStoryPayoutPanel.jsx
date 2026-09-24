import React, { useEffect, useState } from 'react'
import AdminStoryPayoutConfirmModal from './AdminStoryPayoutConfirmModal'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const WORKFLOW_READY = import.meta.env.VITE_STORY_PAYOUT_WORKFLOW_READY === 'true'

function previousCambodiaMonth() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit',
  }).formatToParts(new Date())
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const previous = new Date(Date.UTC(year, month - 2, 1))
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`
}

function authHeaders(json = false) {
  const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

function authorName(payout) {
  return payout.author_page?.page_name || payout.author_page?.page_username || payout.author_user?.name || payout.author_user?.username || 'Author'
}

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

const styles = `
  .story-pay-card { background:#fff; border:1px solid #e2e8f0; border-radius:24px; margin-bottom:18px; padding:20px; box-shadow:0 12px 30px rgba(15,23,42,.04); min-width:0; }
  .story-pay-head { display:flex; align-items:start; justify-content:space-between; flex-wrap:wrap; gap:12px; }
  .story-pay-title { margin:0; font-size:23px; font-weight:900; color:#0f172a; }
  .story-pay-muted { font-size:12px; line-height:1.5; color:#64748b; }
  .story-pay-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin:15px 0; }
  .story-pay-control { border:1px solid #cbd5e1; border-radius:11px; min-height:40px; padding:8px 11px; background:#fff; color:#0f172a; font-size:12px; font-weight:750; min-width:0; }
  .story-pay-tab { border:1px solid #e2e8f0; background:#f8fafc; color:#334155; border-radius:12px; min-height:39px; padding:8px 12px; font-size:12px; font-weight:800; cursor:pointer; }
  .story-pay-tab[aria-selected="true"] { background:#4f46e5; color:#fff; border-color:#4f46e5; }
  .story-pay-button { border:0; border-radius:11px; min-height:38px; padding:9px 12px; background:#0f766e; color:#fff; font-weight:800; font-size:12px; cursor:pointer; }
  .story-pay-button:disabled { opacity:.55; cursor:not-allowed; }
  .story-pay-export { background:#166534; }
  .story-pay-alert { background:#fffbeb; color:#92400e; border:1px solid #fde68a; border-radius:12px; font-size:12px; padding:10px 12px; margin-bottom:13px; line-height:1.6; }
  .story-pay-error { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
  .story-pay-table-wrap { max-width:100%; overflow-x:auto; border:1px solid #e2e8f0; border-radius:14px; }
  .story-pay-table { width:100%; border-collapse:collapse; min-width:760px; text-align:left; font-size:12px; }
  .story-pay-table th { padding:12px 10px; background:#f8fafc; color:#475569; border-bottom:1px solid #e2e8f0; font-weight:850; }
  .story-pay-table td { padding:12px 10px; border-bottom:1px solid #f1f5f9; color:#334155; vertical-align:top; }
  .story-pay-table tr:last-child td { border-bottom:0; }
  .story-pay-value { font-size:16px; color:#0f172a; font-weight:900; font-variant-numeric:tabular-nums; }
  .story-pay-qr { width:76px; max-height:76px; object-fit:contain; border-radius:9px; background:#fff; border:1px solid #e2e8f0; }
  .story-pay-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:15px; font-size:12px; color:#64748b; }
  .story-pay-pagination { display:flex; gap:8px; }
  @media(max-width:720px) { .story-pay-card { padding:14px; border-radius:18px; } .story-pay-head { flex-direction:column; } .story-pay-title { font-size:20px; } .story-pay-toolbar { align-items:stretch; } .story-pay-control { flex:1 1 140px; } }
`

export default function AdminStoryPayoutPanel() {
  const [month, setMonth] = useState(previousCambodiaMonth)
  const [view, setView] = useState('pending')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [payouts, setPayouts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ month, view, page: String(page) })
        const response = await fetch(`${API_URL}/api/admin/income/payouts/queue?${params}`, {
          headers: authHeaders(), signal: controller.signal,
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok || result.ok === false) {
          throw new Error(result.message || 'Could not load Story Payouts')
        }
        if (controller.signal.aborted) return
        if (page > (result.pagination?.total_pages || 1)) {
          setPage(result.pagination.total_pages)
          return
        }
        setPayouts(result.payouts || [])
        setPagination(result.pagination || { page, limit: 20, total: 0, total_pages: 1, has_next: false, has_prev: false })
      } catch (caught) {
        if (controller.signal.aborted) return
        setError(caught.message || 'Could not load Story Payouts')
        setPayouts([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [month, view, page, revision])

  function refresh() {
    setRevision((value) => value + 1)
  }

  async function downloadExcel() {
    if (exporting || !month) return
    setExporting(true)
    setError('')
    try {
      const params = new URLSearchParams({ month })
      const response = await fetch(`${API_URL}/api/admin/income/payouts/excel?${params}`, {
        headers: authHeaders(), cache: 'no-store',
      })
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}))
        throw new Error(failure.message || 'Failed to download the complete Excel report')
      }
      const blob = await response.blob()
      if (!blob.size) throw new Error('The Excel report was empty')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `story-payouts-${month}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (caught) {
      setError(caught.message || 'Unable to download Excel')
    } finally {
      setExporting(false)
    }
  }

  function changeView(next) {
    setSelectedPayout(null)
    setPage(1)
    setView(next)
  }

  return (
    <section className="story-pay-card" aria-label="Story Payouts">
      <style>{styles}</style>
      <div className="story-pay-head">
        <div>
          <h2 className="story-pay-title">Story Payouts</h2>
          <div className="story-pay-muted">Diamond Story Unlock only · Completed months · Minimum $10 · 20 authors per page</div>
        </div>
        <label className="story-pay-muted">Completed payout month<br />
          <input className="story-pay-control" type="month" value={month} max={previousCambodiaMonth()} onChange={(event) => { setPage(1); setMonth(event.target.value) }} />
        </label>
      </div>
      <div className="story-pay-toolbar" role="tablist" aria-label="Story payout status">
        <button type="button" className="story-pay-tab" role="tab" aria-selected={view === 'pending'} onClick={() => changeView('pending')}>Pending Transfer</button>
        <button type="button" className="story-pay-tab" role="tab" aria-selected={view === 'awaiting_receipt'} onClick={() => changeView('awaiting_receipt')}>Awaiting Receipt</button>
        <button type="button" className="story-pay-tab" role="tab" aria-selected={view === 'paid'} onClick={() => changeView('paid')}>Paid History</button>
        <button type="button" className="story-pay-tab" onClick={refresh} disabled={loading}>Refresh</button>
        <button type="button" className="story-pay-button story-pay-export" onClick={downloadExcel} disabled={exporting || !month}>{exporting ? 'Preparing Excel…' : 'Download Excel · All authors'}</button>
      </div>
      <div className="story-pay-muted">Excel contains every eligible payout in the selected completed month, including recorded transfers and Paid History, not only the 20 rows on screen. Amounts and bank details come from the generated monthly payout records.</div>
      {!WORKFLOW_READY ? <div className="story-pay-alert" role="status">Payout transfers are paused until the full workflow is verified. You can review the list, but do not send money from this page yet.</div> : null}
      {error ? <div className="story-pay-alert story-pay-error" role="alert">{error}</div> : null}
      {loading ? <p className="story-pay-muted">Loading payouts…</p> : payouts.length === 0 ? <p className="story-pay-muted">No {view === 'pending' ? 'eligible unpaid' : view === 'awaiting_receipt' ? 'receipt-pending' : 'paid'} Story Payout records for this month. The monthly payout records must be generated before they appear here.</p> : (
        <div className="story-pay-table-wrap">
          <table className="story-pay-table">
            <thead><tr><th>Author</th><th>Story Payout</th><th>Bank account</th><th>Bank QR</th><th>Status / Action</th></tr></thead>
            <tbody>{payouts.map((payout) => {
              const method = payout.payment_method_snapshot || {}
              const qr = method.qr_image_url || ''
              return <tr key={payout.id}>
                <td><strong>{authorName(payout)}</strong><br /><span className="story-pay-muted">{payout.author_page?.page_username ? `@${payout.author_page.page_username}` : ''}</span></td>
                <td><span className="story-pay-value">{formatUsd(payout.net_payout_usd)}</span><br /><span className="story-pay-muted">{payout.payout_month}</span></td>
                <td>{payout.payment_method_id ? <><strong>{method.bank_name || method.display_name || method.method_type || 'Payment method'}</strong><br />{method.account_name || method.paypal_name || '-'}<br />{method.account_number || method.paypal_email || method.phone_number || '-'}</> : <span className="story-pay-muted">Missing payment method</span>}</td>
                <td>{qr ? <img className="story-pay-qr" src={qr} alt={`Bank QR for ${authorName(payout)}`} loading="lazy" /> : <span className="story-pay-muted">No QR uploaded</span>}</td>
                <td><div className="story-pay-muted">{payout.status.replaceAll('_', ' ')}</div>{view !== 'paid' ? <button type="button" className="story-pay-button" disabled={!WORKFLOW_READY || (view === 'pending' && (payout.status !== 'scheduled' || !payout.payment_method_id))} onClick={() => setSelectedPayout(payout)}>{view === 'awaiting_receipt' ? 'Upload receipt' : 'Record transfer'}</button> : <span className="story-pay-muted">Paid {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : ''}</span>}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      )}
      <div className="story-pay-footer">
        <span>{pagination.total} records · Page {pagination.page} / {pagination.total_pages} · 20 per page</span>
        <div className="story-pay-pagination">
          <button type="button" className="story-pay-tab" disabled={loading || !pagination.has_prev} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <button type="button" className="story-pay-tab" disabled={loading || !pagination.has_next} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </div>
      {selectedPayout && WORKFLOW_READY ? <AdminStoryPayoutConfirmModal
        payout={selectedPayout}
        apiUrl={API_URL}
        authHeaders={authHeaders}
        authorName={authorName}
        formatUsd={formatUsd}
        onClose={() => setSelectedPayout(null)}
        onRecorded={(id, reference) => {
          if (id) setSelectedPayout((current) => current?.id === id ? { ...current, status: 'awaiting_receipt', transfer_reference: reference } : current)
          refresh()
        }}
        onPaid={async () => { setSelectedPayout(null); refresh() }}
      /> : null}
    </section>
  )
}
