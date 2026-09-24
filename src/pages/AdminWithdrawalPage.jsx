import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import AdminStoryPayoutPanel from '../components/AdminStoryPayoutPanel'
import AdminAuthorStoreExcelButton from '../components/AdminAuthorStoreExcelButton'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  body {
    margin: 0;
    background: #F8FAFC;
    color: #0F172A;
  }

  .withdraw-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .withdraw-body {
    padding: 26px;
    max-width: 1380px;
    margin: 0 auto;
  }

  .withdraw-top {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    margin-bottom: 16px;
  }

  .withdraw-kicker {
    color: #4F46E5;
    background: #EEF2FF;
    border-radius: 999px;
    padding: 7px 11px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .withdraw-heading {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
  }

  .withdraw-note {
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
    line-height: 1.6;
  }

  .withdraw-toolbar {
    margin-top: 18px;
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 190px 120px;
    gap: 10px;
  }

  .input,
  .select {
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .refresh-button {
    border: 0;
    border-radius: 14px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .withdraw-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .withdraw-card-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .withdraw-card-title {
    font-size: 16px;
    font-weight: 900;
  }

  .count-pill {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
  }

  .message {
    margin: 14px 20px 0;
    border-radius: 14px;
    padding: 12px 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 800;
  }

  .empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .withdraw-row {
    padding: 18px 20px;
    border-bottom: 1px solid #F1F5F9;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 1fr) minmax(260px, 1fr) 150px;
    gap: 16px;
    align-items: start;
  }

  .withdraw-row:last-child {
    border-bottom: 0;
  }

  .strong {
    font-weight: 900;
    color: #0F172A;
  }

  .small {
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
    margin-top: 4px;
    word-break: break-word;
  }

  .withdraw-qr { width: 92px; max-width: 100%; max-height: 92px; object-fit: contain; margin-top: 7px; border-radius: 10px; border: 1px solid #e2e8f0; }

  .amount {
    font-size: 22px;
    font-weight: 950;
    color: #0F172A;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 900;
    background: #F1F5F9;
    color: #334155;
    text-transform: capitalize;
  }

  .status-in_review { background: #FEF3C7; color: #92400E; }
  .status-approved { background: #DBEAFE; color: #1D4ED8; }
  .status-awaiting_receipt { background: #FFF7ED; color: #9A3412; }
  .status-paid { background: #DCFCE7; color: #166534; }
  .status-rejected { background: #FEE2E2; color: #991B1B; }
  .status-cancelled { background: #F1F5F9; color: #475569; }
  .status-archived { background: #E2E8F0; color: #334155; }

  .pagination {
    padding: 16px 20px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    align-items: center;
  }

  .page-button {
    height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .page-button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }


  .action-stack {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }

  .action-button {
    height: 36px;
    border: 0;
    border-radius: 12px;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .action-button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .approve-button {
    background: #2563EB;
  }

  .reject-button {
    background: #DC2626;
  }

  .paid-button {
    background: #16A34A;
  }

  @media (max-width: 1100px) {
    .withdraw-page,
    .withdraw-body {
      min-width: 0;
    }

    .withdraw-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .withdraw-toolbar {
      grid-template-columns: 1fr 190px 120px;
    }

    .withdraw-row > div {
      min-width: 0;
    }
  }

  @media (max-width: 760px) {
    .withdraw-body {
      padding: 18px 14px 40px;
    }

    .withdraw-top {
      min-width: 0;
      border-radius: 20px;
      padding: 17px 15px;
    }

    .withdraw-heading {
      font-size: 24px;
      overflow-wrap: anywhere;
    }

    .withdraw-note,
    .message,
    .empty,
    .small,
    .strong,
    .withdraw-card-title {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .withdraw-toolbar {
      grid-template-columns: 1fr;
    }

    .input,
    .select,
    .refresh-button {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .refresh-button {
      min-height: 42px;
    }

    .withdraw-card {
      min-width: 0;
      border-radius: 20px;
    }

    .withdraw-card-head {
      align-items: flex-start;
      padding: 15px;
    }

    .withdraw-card-head > div {
      min-width: 0;
    }

    .count-pill {
      flex-shrink: 0;
      max-width: 48%;
      text-align: center;
      overflow-wrap: anywhere;
    }

    .message {
      margin: 13px 14px 0;
    }

    .withdraw-row {
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 16px 15px;
    }

    .withdraw-row > div {
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 13px;
    }

    .withdraw-row > div:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    .amount {
      font-size: 21px;
      overflow-wrap: anywhere;
    }

    .status-pill {
      max-width: 100%;
      overflow-wrap: anywhere;
      white-space: normal;
    }

    .action-stack {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .action-button {
      width: 100%;
      min-width: 0;
      min-height: 40px;
      height: auto;
      padding: 8px 7px;
      line-height: 1.3;
    }

    .pagination {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      justify-content: stretch;
      padding: 14px 15px;
    }

    .page-button {
      width: 100%;
      min-width: 0;
      min-height: 40px;
    }

    .pagination .small {
      margin: 0;
      align-self: center;
      text-align: center;
    }

    .empty {
      padding: 42px 16px;
    }
  }

  @media (max-width: 480px) {
    .withdraw-card-head {
      flex-direction: column;
    }

    .count-pill {
      max-width: 100%;
    }

    .action-stack,
    .pagination {
      grid-template-columns: 1fr;
    }

    .pagination .small {
      order: -1;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function formatUsd(value) {
  const number = Number(value || 0)
  return `$${number.toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function statusLabel(status) {
  return String(status || '').replace(/_/g, ' ')
}

function getPaymentMethodText(method) {
  if (!method) return '-'

  return [
    method.type,
    method.bank_name,
    method.account_name,
    method.account_number,
    method.phone_number,
  ].filter(Boolean).join(' · ') || '-'
}

export default function AdminWithdrawalPage() {
  const [withdrawals, setWithdrawals] = useState([])
  const [status, setStatus] = useState('in_review')
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('withdrawal') || '')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')
  const [receiptSelection, setReceiptSelection] = useState({ id: '', file: null })

  const totalText = useMemo(() => `${meta.total || 0} withdrawals`, [meta.total])

  async function fetchWithdrawals(nextPage = page) {
    try {
      setLoading(true)
      setMessage('')

      const token = getAdminToken()
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '20',
        status,
        q: query.trim(),
      })

      const response = await fetch(`${API_URL}/api/author-store/admin/withdrawals?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load withdrawal requests')
      }

      setWithdrawals(data.withdrawals || [])
      setMeta({
        total: data.total || 0,
        total_pages: data.total_pages || 1,
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
      setPage(nextPage)
    } catch (error) {
      setMessage(error.message || 'Failed to load withdrawal requests')
      setWithdrawals([])
      setMeta({ total: 0, total_pages: 1, has_next: false, has_prev: false })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals(1)
  }, [status])


  async function updateWithdrawalStatus(withdrawal, nextStatus) {
    if (busyId || loading || !['approved', 'rejected'].includes(nextStatus)) return
    if (withdrawal.paid_transaction_id) {
      setMessage('A bank transfer is already recorded. Finish its receipt workflow; do not reject or transfer again.')
      return
    }
    let reason = ''
    let note = ''
    if (nextStatus === 'rejected') {
      reason = window.prompt('Reason for rejecting this withdrawal:')
      if (reason === null) return
      if (!reason.trim()) { setMessage('Reject reason is required.'); return }
    } else {
      note = window.prompt('Admin note (optional):')
      if (note === null) return
    }
    if (!window.confirm(`${nextStatus === 'approved' ? 'Approve' : 'Reject'} this withdrawal request?`)) return
    setBusyId(withdrawal.id)
    try {
      const response = await fetch(`${API_URL}/api/author-store/admin/withdrawals/${encodeURIComponent(withdrawal.id)}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(true) },
        body: JSON.stringify({ status: nextStatus, admin_note: note, reject_reason: reason }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Unable to update withdrawal')
      await fetchWithdrawals(page)
      setMessage(`Withdrawal ${nextStatus}.`)
    } catch (error) {
      setMessage(`${error.message || 'Unable to update withdrawal'}. Refresh and verify the current status before trying again.`)
    } finally { setBusyId('') }
  }

  function authHeaders(json = false) {
    const token = getAdminToken()
    return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) }
  }

  async function recordTransfer(withdrawal) {
    if (busyId || loading || withdrawal.status !== 'approved' || withdrawal.paid_transaction_id) return
    const bank = withdrawal.payment_method_snapshot || {}
    if (!withdrawal.payment_method_id || !bank.account_number && !bank.paypal_email && !bank.phone_number) {
      setMessage('Verify the saved payment destination before recording any bank transfer.')
      return
    }
    const details = `${bank.bank_name || bank.type || 'Bank'} · ${bank.account_name || ''} · ${bank.account_number || bank.paypal_email || bank.phone_number || ''}`
    if (!window.confirm(`Only continue if you ALREADY sent ${formatUsd(withdrawal.amount_usd)} to ${details} outside this app. This button will NOT send money. Have you completed the bank transfer?`)) return
    const reference = window.prompt('Reference shown on your completed bank transfer:')
    if (reference === null) return
    if (reference.trim().length < 4 || reference.trim().length > 120) { setMessage('Enter the actual bank reference (4–120 characters).'); return }
    const pin = window.prompt('Six-digit Owner Passkey to record the completed transfer:')
    if (pin === null) return
    if (!/^\d{6}$/.test(pin.trim())) { setMessage('Enter a valid six-digit Owner Passkey.'); return }
    setBusyId(withdrawal.id)
    try {
      const response = await fetch(`${API_URL}/api/author-store/admin/withdrawals/${encodeURIComponent(withdrawal.id)}/transfer-record`, {
        method: 'POST', headers: authHeaders(true),
        body: JSON.stringify({ transfer_confirmed: true, transfer_reference: reference.trim(), passkey_pin: pin.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Could not record transfer')
      await fetchWithdrawals(page)
      setMessage('Bank transfer recorded. Upload its real receipt. Never send this payment again.')
    } catch (error) {
      setMessage(`${error.message || 'Transfer record failed'} Check the request status BEFORE taking any further action; do not send money again.`)
    } finally { setBusyId('') }
  }

  function chooseReceipt(withdrawalId, file) {
    if (!file) { setReceiptSelection({ id: '', file: null }); return }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size < 100 || file.size > 2 * 1024 * 1024) {
      setReceiptSelection({ id: '', file: null })
      setMessage('Select a PNG, JPG or WEBP bank receipt of 100 bytes–2 MB.')
      return
    }
    setReceiptSelection({ id: withdrawalId, file })
    setMessage('')
  }

  async function uploadReceipt(withdrawal) {
    if (busyId || loading || receiptSelection.id !== withdrawal.id || !receiptSelection.file) return
    setBusyId(withdrawal.id)
    try {
      const body = new FormData()
      body.append('receipt', receiptSelection.file)
      const response = await fetch(`${API_URL}/api/author-store/admin/withdrawals/${encodeURIComponent(withdrawal.id)}/receipt`, {
        method: 'POST', headers: authHeaders(), body,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Could not upload receipt')
      setReceiptSelection({ id: '', file: null })
      await fetchWithdrawals(page)
      setMessage('Bank receipt saved. Verify it before confirming Paid.')
    } catch (error) {
      setMessage(`${error.message || 'Receipt upload failed'}. Check the request before trying again; do not send money again.`)
    } finally { setBusyId('') }
  }

  async function confirmPaid(withdrawal) {
    if (busyId || loading || withdrawal.status !== 'approved' || !withdrawal.paid_transaction_id || !/^store-withdrawals\//.test(withdrawal.paid_proof_url || '')) return
    if (!window.confirm(`Confirm that ${formatUsd(withdrawal.amount_usd)} was sent and this saved bank receipt belongs to this withdrawal. This records Paid; it does NOT send money.`)) return
    const pin = window.prompt('Six-digit Owner Passkey to confirm Paid:')
    if (pin === null) return
    if (!/^\d{6}$/.test(pin.trim())) { setMessage('Enter a valid six-digit Owner Passkey.'); return }
    setBusyId(withdrawal.id)
    try {
      const response = await fetch(`${API_URL}/api/author-store/admin/withdrawals/${encodeURIComponent(withdrawal.id)}/status`, {
        method: 'PATCH', headers: authHeaders(true),
        body: JSON.stringify({
          status: 'paid', paid_amount_usd: Number(withdrawal.amount_usd),
          paid_transaction_id: withdrawal.paid_transaction_id,
          paid_proof_url: withdrawal.paid_proof_url,
          passkey_pin: pin.trim(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Could not confirm Paid')
      await fetchWithdrawals(page)
      setMessage('Paid recorded. This request is now available in Paid History.')
    } catch (error) {
      setMessage(`${error.message || 'Paid confirmation failed'}. Refresh the request before trying again. Do not send the money again.`)
    } finally { setBusyId('') }
  }

  async function viewReceipt(withdrawal) {
    if (busyId || !/^store-withdrawals\//.test(withdrawal.paid_proof_url || '')) return
    const windowRef = window.open('', '_blank')
    try {
      const response = await fetch(`${API_URL}/api/author-store/admin/withdrawals/${encodeURIComponent(withdrawal.id)}/receipt`, { headers: authHeaders(), cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.receipt_url) throw new Error(data.message || 'Receipt unavailable')
      if (windowRef) windowRef.location.replace(data.receipt_url)
      else window.open(data.receipt_url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      windowRef?.close()
      setMessage(error.message || 'Could not open receipt')
    }
  }

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="withdraw-page">
        <div className="withdraw-body">
          <AdminStoryPayoutPanel />
          <div className="withdraw-top">
            <div className="withdraw-kicker">AUTHOR STORE · REQUEST-BASED</div>
            <h1 className="withdraw-heading">Author Store Withdrawals</h1>
            <div className="withdraw-note">
              Request-based payouts only. Story Payouts are listed separately above. Paid requests remain available in Paid History.
            </div>

            <div className="withdraw-toolbar">
              <input
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') fetchWithdrawals(1)
                }}
                placeholder="Search author, email, account, transaction..."
              />

              <select
                className="select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="in_review">New requests</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid History</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
              </select>

              <button className="refresh-button" type="button" onClick={() => fetchWithdrawals(1)}>
                Refresh
              </button>
            </div>
            <AdminAuthorStoreExcelButton status={status} query={query} />
          </div>

          <div className="withdraw-card">
            <div className="withdraw-card-head">
              <div className="withdraw-card-title">Author Store withdrawal list</div>
              <div className="count-pill">{totalText}</div>
            </div>

            {message ? <div className="message">{message}</div> : null}

            {loading ? (
              <div className="empty">Loading withdrawals...</div>
            ) : withdrawals.length === 0 ? (
              <div className="empty">No withdrawal requests found.</div>
            ) : (
              withdrawals.map((withdrawal) => {
                const authorPage = withdrawal.author_page || {}
                const authorUser = withdrawal.author_user || {}
                const method = withdrawal.payment_method_snapshot || {}

                return (
                  <div className="withdraw-row" key={withdrawal.id} data-withdrawal-id={withdrawal.id}>
                    <div>
                      <div className="amount">{formatUsd(withdrawal.amount_usd)}</div>
                      <div className="small">Withdrawal ID: <span className="strong">{withdrawal.id}</span></div>
                      <div className="small">Created: <span className="strong">{formatDate(withdrawal.created_at)}</span></div>
                      <div className="small">Updated: <span className="strong">{formatDate(withdrawal.updated_at)}</span></div>
                    </div>

                    <div>
                      <div className="strong">Author</div>
                      <div className="small">Page: <span className="strong">{authorPage.page_name || '-'}</span></div>
                      <div className="small">Username: <span className="strong">{authorPage.page_username ? `@${authorPage.page_username}` : '-'}</span></div>
                      <div className="small">Name: <span className="strong">{authorUser.name || authorUser.username || '-'}</span></div>
                      <div className="small">Email: <span className="strong">{authorUser.email || '-'}</span></div>
                    </div>

                    <div>
                      <div className="strong">Payment method</div>
                      <div className="small">{getPaymentMethodText(method)}</div>
                      {method.qr_image_url ? (
                        <div className="small">
                          <a href={method.qr_image_url} target="_blank" rel="noopener noreferrer" aria-label="Open author bank QR">
                            <img src={method.qr_image_url} alt="Author bank QR" loading="lazy" style={{ width: 90, maxHeight: 90, objectFit: 'contain', borderRadius: 10, border: '1px solid #E2E8F0' }} />
                          </a>
                        </div>
                      ) : <div className="small">Bank QR not uploaded</div>}
                      {withdrawal.paid_transaction_id ? (
                        <div className="small">Paid ref: <span className="strong">{withdrawal.paid_transaction_id}</span></div>
                      ) : null}
                      {withdrawal.paid_proof_url ? (
                        <div className="small">
                          {String(withdrawal.paid_proof_url).startsWith('store-withdrawals/') ? (
                            <button type="button" disabled={Boolean(busyId)} onClick={() => viewReceipt(withdrawal)}>View saved receipt</button>
                          ) : /^https:\/\//i.test(withdrawal.paid_proof_url) ? (
                            <a href={withdrawal.paid_proof_url} target="_blank" rel="noopener noreferrer">View previous payment receipt</a>
                          ) : <span>Receipt saved</span>}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <span className={`status-pill status-${withdrawal.status === 'approved' && withdrawal.paid_transaction_id && !withdrawal.paid_proof_url ? 'awaiting_receipt' : withdrawal.status || 'in_review'}`}>
                        {withdrawal.status === 'approved' && withdrawal.paid_transaction_id && !withdrawal.paid_proof_url ? 'Awaiting Receipt' : statusLabel(withdrawal.status || 'in_review')}
                      </span>
                      <div className="small">Paid at: <span className="strong">{formatDate(withdrawal.paid_at)}</span></div>
                      <div className="small">Admin note: <span className="strong">{withdrawal.admin_note || '-'}</span></div>
                      <div className="small">Reject reason: <span className="strong">{withdrawal.reject_reason || '-'}</span></div>

                      <div className="action-stack">
                        <button
                          className="action-button approve-button"
                          type="button"
                          disabled={Boolean(busyId) || loading || withdrawal.status !== 'in_review'}
                          onClick={() => updateWithdrawalStatus(withdrawal, 'approved')}
                        >
                          Approve
                        </button>

                        <button
                          className="action-button reject-button"
                          type="button"
                          disabled={Boolean(busyId) || loading || !['in_review', 'approved'].includes(withdrawal.status) || Boolean(withdrawal.paid_transaction_id)}
                          onClick={() => updateWithdrawalStatus(withdrawal, 'rejected')}
                        >
                          Reject
                        </button>

                        {withdrawal.status === 'approved' && !withdrawal.paid_transaction_id ? (
                          <button className="action-button paid-button" type="button" disabled={Boolean(busyId) || loading} onClick={() => recordTransfer(withdrawal)}>Record bank transfer</button>
                        ) : null}
                        {withdrawal.status === 'approved' && withdrawal.paid_transaction_id && !withdrawal.paid_proof_url ? (
                          <>
                            <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Bank transfer receipt" disabled={Boolean(busyId) || loading} style={{ width: '100%', maxWidth: '100%', fontSize: 11 }} onChange={event => chooseReceipt(withdrawal.id, event.target.files?.[0])} />
                            <button className="action-button paid-button" type="button" disabled={Boolean(busyId) || loading || receiptSelection.id !== withdrawal.id || !receiptSelection.file} onClick={() => uploadReceipt(withdrawal)}>Upload receipt</button>
                          </>
                        ) : null}
                        {withdrawal.status === 'approved' && withdrawal.paid_transaction_id && String(withdrawal.paid_proof_url || '').startsWith('store-withdrawals/') ? (
                          <button className="action-button paid-button" type="button" disabled={Boolean(busyId) || loading} onClick={() => confirmPaid(withdrawal)}>Confirm Paid</button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            <div className="pagination">
              <button
                className="page-button"
                type="button"
                disabled={!meta.has_prev || loading}
                onClick={() => fetchWithdrawals(Math.max(page - 1, 1))}
              >
                Previous
              </button>
              <div className="small">Page {page} / {meta.total_pages || 1}</div>
              <button
                className="page-button"
                type="button"
                disabled={!meta.has_next || loading}
                onClick={() => fetchWithdrawals(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
