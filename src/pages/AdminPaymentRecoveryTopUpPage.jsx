import React, { useCallback, useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .recovery-page { display: grid; gap: 18px; color: #0F172A; }
  .recovery-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; }
  .recovery-intro { padding: 23px 25px; background: linear-gradient(110deg, #FFFFFF, #F5F6FF); display: flex; justify-content: space-between; gap: 16px; align-items: center; }
  .recovery-eyebrow { font-size: 11px; font-weight: 900; color: #4F46E5; text-transform: uppercase; letter-spacing: 1px; }
  .recovery-heading { margin: 7px 0; font-size: 24px; font-weight: 900; }
  .recovery-muted { font-size: 13px; line-height: 1.6; color: #64748B; }
  .recovery-tag { font-size: 11px; font-weight: 900; padding: 8px 12px; color: #4338CA; border-radius: 20px; background: #EEF2FF; white-space: nowrap; }
  .recovery-tabs { display: flex; gap: 8px; padding: 14px 18px; border-top: 1px solid #E2E8F0; }
  .recovery-tab { border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF; color: #475569; cursor: pointer; font-size: 13px; font-weight: 800; padding: 11px 17px; }
  .recovery-tab.active { color: #FFFFFF; border-color: #4F46E5; background: #4F46E5; }
  .recovery-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .recovery-stat { padding: 18px; }
  .recovery-stat-title { display: block; color: #64748B; font-size: 12px; font-weight: 750; }
  .recovery-stat-value { display: block; margin-top: 7px; font-size: 25px; font-weight: 900; }
  .recovery-section-head { padding: 18px 20px; display: flex; justify-content: space-between; gap: 14px; align-items: center; border-bottom: 1px solid #E2E8F0; }
  .recovery-section-head h3 { margin: 0 0 4px; font-size: 16px; font-weight: 900; }
  .recovery-controls { display: grid; grid-template-columns: minmax(180px, 1fr) 155px 125px 145px auto auto; gap: 9px; padding: 17px 20px; }
  .recovery-input { width: 100%; min-width: 0; min-height: 41px; background: #FFFFFF; color: #0F172A; border: 1px solid #D8E2EF; border-radius: 11px; font: inherit; font-size: 13px; padding: 0 12px; outline: none; }
  .recovery-input:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px #EEF2FF; }
  .recovery-button { min-height: 41px; background: #FFFFFF; color: #4338CA; border: 1px solid #C7D2FE; border-radius: 11px; padding: 0 14px; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
  .recovery-button:disabled { cursor: not-allowed; color: #94A3B8; background: #F1F5F9; border-color: #E2E8F0; }
  .recovery-notice { margin: 0 20px 16px; padding: 11px 14px; color: #92400E; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 11px; font-size: 12px; line-height: 1.6; }
  .recovery-error { margin: 0 20px 16px; padding: 11px 14px; color: #B91C1C; background: #FEF2F2; border-radius: 11px; font-size: 12px; }
  .recovery-table-wrap { overflow-x: auto; }
  .recovery-table { width: 100%; border-collapse: collapse; min-width: 850px; }
  .recovery-table th { background: #F8FAFC; color: #64748B; font-size: 11px; font-weight: 900; text-align: left; padding: 13px 17px; }
  .recovery-table td { border-top: 1px solid #F1F5F9; padding: 13px 17px; font-size: 12px; vertical-align: middle; }
  .recovery-table strong { font-size: 13px; }
  .recovery-sub { color: #64748B; font-size: 11px; margin-top: 4px; overflow-wrap: anywhere; }
  .recovery-row-active { background: #F5F6FF; }
  .recovery-pill { display: inline-block; border-radius: 999px; padding: 6px 10px; font-size: 11px; background: #F1F5F9; font-weight: 850; color: #475569; }
  .recovery-pill.success { background: #DCFCE7; color: #166534; }
  .recovery-pill.pending_review { background: #FEF3C7; color: #92400E; }
  .recovery-empty { padding: 30px; text-align: center; color: #64748B; font-size: 13px; }
  .recovery-detail { margin: 16px 20px 20px; padding: 18px; border: 1px solid #E2E8F0; border-radius: 14px; }
  .recovery-detail h4 { margin: 0 0 15px; font-size: 15px; font-weight: 900; }
  .recovery-detail-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .recovery-detail-grid dt { color: #64748B; font-size: 11px; margin-bottom: 5px; }
  .recovery-detail-grid dd { margin: 0; font-size: 12px; font-weight: 750; overflow-wrap: anywhere; }
  .recovery-footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; align-items: center; padding: 14px 20px; border-top: 1px solid #E2E8F0; }
  .recovery-preview { padding: 23px; display: grid; gap: 15px; }
  .recovery-preview h3 { margin: 0; font-size: 19px; }
  .recovery-preview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .recovery-preview label { display: grid; gap: 7px; color: #475569; font-size: 12px; font-weight: 800; }
  .recovery-preview input:disabled { background: #F8FAFC; }
  .recovery-result-list { display: grid; gap: 8px; margin-top: 10px; }
  .recovery-person { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 13px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF; }
  .recovery-person.chosen { border-color: #6366F1; background: #EEF2FF; }
  .recovery-form { display: grid; gap: 15px; padding-top: 16px; }
  .recovery-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .recovery-form label { display: grid; gap: 7px; color: #475569; font-size: 12px; font-weight: 800; }
  .recovery-form textarea { min-height: 80px; resize: vertical; padding: 12px; }
  .recovery-check { display: flex !important; align-items: flex-start; gap: 10px !important; font-weight: 650 !important; line-height: 1.5; }
  .recovery-check input { width: 16px; height: 16px; flex: 0 0 16px; margin-top: 2px; }
  .recovery-primary { color: #FFFFFF; background: #4F46E5; border-color: #4F46E5; }
  .recovery-primary:disabled { color: #94A3B8; }
  .recovery-success { padding: 14px; border: 1px solid #86EFAC; background: #F0FDF4; color: #166534; font-size: 13px; font-weight: 700; border-radius: 12px; }
  .recovery-subheading { font-size: 13px; color: #0F172A; font-weight: 900; }
  .recovery-history { padding: 18px; display: grid; gap: 12px; }
  .recovery-history-item { padding: 14px; border: 1px solid #E2E8F0; border-radius: 12px; }
  .recovery-actions { display: flex; gap: 9px; flex-wrap: wrap; align-items: center; }
  @media (max-width: 1040px) { .recovery-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); } .recovery-controls .recovery-input:first-child { grid-column: 1 / -1; } }
  @media (max-width: 680px) { .recovery-intro { padding: 18px; align-items: flex-start; flex-direction: column; } .recovery-stats { grid-template-columns: 1fr; } .recovery-controls { grid-template-columns: 1fr; padding: 14px; } .recovery-controls .recovery-input:first-child { grid-column: auto; } .recovery-tabs { flex-wrap: wrap; } .recovery-detail-grid, .recovery-preview-grid, .recovery-form-grid { grid-template-columns: 1fr; } .recovery-section-head { align-items: flex-start; flex-direction: column; } .recovery-notice, .recovery-error { margin-left: 14px; margin-right: 14px; } }
`

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'medium', timeStyle: 'short' })} (KH)`
}

function displayName(payment) {
  return payment.user?.name || payment.user?.username || 'Unknown account'
}

function isReleased(payment) {
  return ['success', 'approved', 'confirmed'].includes(String(payment.status || '').toLowerCase()) || Boolean(payment.released_at)
}

function canRecover(payment) {
  return payment && !isReleased(payment) && ['aba_payment_link', 'premium_aba_payment_link'].includes(payment.payment_method) && ['waiting_payment', 'pending_review', 'callback_received', 'expired', 'cancelled'].includes(String(payment.status || '').toLowerCase())
}

export default function AdminPaymentRecoveryTopUpPage() {
  const [activeTab, setActiveTab] = useState('recovery')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [appliedFilters, setAppliedFilters] = useState({ q: '', status: 'all', amount: '', date: '' })
  const [working, setWorking] = useState(false)
  const [recoveryRef, setRecoveryRef] = useState('')
  const [verifiedUsd, setVerifiedUsd] = useState('')
  const [bankPaidTime, setBankPaidTime] = useState('')
  const [recoveryReason, setRecoveryReason] = useState('')
  const [recoveryPin, setRecoveryPin] = useState('')
  const [bankVerified, setBankVerified] = useState(false)
  const [recipientVerified, setRecipientVerified] = useState(false)
  const [walletResult, setWalletResult] = useState(null)
  const [recipientSearch, setRecipientSearch] = useState('')
  const [recipients, setRecipients] = useState([])
  const [recipient, setRecipient] = useState(null)
  const [topupAmount, setTopupAmount] = useState('')
  const [topupRef, setTopupRef] = useState('')
  const [topupReason, setTopupReason] = useState('')
  const [topupPin, setTopupPin] = useState('')
  const [topupConfirmed, setTopupConfirmed] = useState(false)
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyHasNext, setHistoryHasNext] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyRefresh, setHistoryRefresh] = useState(0)

  function token() {
    return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  }

  async function request(path, options = {}) {
    const adminToken = token()
    if (!adminToken) throw new Error('Admin login required')
    const response = await fetch(`${API_URL}/api/admin/purchases/recovery${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${adminToken}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
      cache: 'no-store',
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.ok === false) throw new Error(result.message || 'Payment request failed')
    return result
  }

  const loadPayments = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', status: appliedFilters.status })
      if (appliedFilters.q) params.set('q', appliedFilters.q)
      if (appliedFilters.amount) params.set('amount', appliedFilters.amount)
      if (appliedFilters.date) params.set('date', appliedFilters.date)
      const response = await fetch(`${API_URL}/api/admin/purchases/recovery?${params.toString()}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''}` },
        signal,
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to search payment orders')
      if (signal.aborted) return
      setPayments(Array.isArray(data.payments) ? data.payments : [])
      setHasNext(Boolean(data.has_next))
      setHasPrev(Boolean(data.has_prev))
    } catch (requestError) {
      if (signal.aborted) return
      setError(requestError.message || 'Unable to search payments')
      setPayments([])
      setHasNext(false)
      setHasPrev(false)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [page, appliedFilters])

  useEffect(() => {
    if (activeTab !== 'recovery') return undefined
    const controller = new AbortController()
    loadPayments(controller.signal)
    return () => controller.abort()
  }, [activeTab, loadPayments, refreshKey])

  useEffect(() => {
    if (activeTab !== 'history') return undefined
    const controller = new AbortController()
    setHistoryLoading(true)
    setError('')
    request(`/history?page=${historyPage}`, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return
        setHistory(data.items || [])
        setHistoryHasNext(Boolean(data.has_next))
      })
      .catch((e) => { if (!controller.signal.aborted) setError(e.message) })
      .finally(() => { if (!controller.signal.aborted) setHistoryLoading(false) })
    return () => controller.abort()
  }, [activeTab, historyPage, historyRefresh])

  function clearSensitive() {
    setRecoveryPin('')
    setTopupPin('')
    setBankVerified(false)
    setRecipientVerified(false)
    setTopupConfirmed(false)
  }

  function openPayment(payment) {
    setSelectedId(payment.id)
    setFeedback('')
    setError('')
    setRecoveryRef(payment.aba_trx_id || '')
    setVerifiedUsd(String(payment.amount_usd ?? payment.package_usd ?? ''))
    setBankPaidTime('')
    setRecoveryReason('')
    setWalletResult(null)
    clearSensitive()
  }

  function searchPayments(event) {
    event.preventDefault()
    setSelectedId('')
    setPage(1)
    setFeedback('')
    setAppliedFilters({ q: query.trim(), status, amount: amount.trim(), date })
    if (page === 1 && query.trim() === appliedFilters.q && status === appliedFilters.status && amount.trim() === appliedFilters.amount && date === appliedFilters.date) setRefreshKey((v) => v + 1)
  }

  function clearFilters() {
    setQuery('')
    setStatus('all')
    setAmount('')
    setDate('')
    setSelectedId('')
    setPage(1)
    setAppliedFilters({ q: '', status: 'all', amount: '', date: '' })
    setRefreshKey((v) => v + 1)
  }

  async function checkWallet(userId) {
    try {
      setError('')
      const data = await request(`/recipients?q=${encodeURIComponent(userId)}`)
      setWalletResult((data.users || []).find((user) => user.id === userId) || null)
    } catch (e) { setError(e.message) }
  }

  async function handleRecovery(event) {
    event.preventDefault()
    const selected = payments.find((payment) => payment.id === selectedId)
    if (!canRecover(selected) || working) return
    if (!bankVerified || !recipientVerified) { setError('Confirm both bank payment and recipient checks'); return }
    if (!/^\d{6}$/.test(recoveryPin)) { setError('Enter six-digit Passkey'); return }
    if (!bankPaidTime) { setError('Enter ABA transaction time in Cambodia'); return }
    const bankDate = new Date(`${bankPaidTime}:00+07:00`)
    if (Number.isNaN(bankDate.getTime())) { setError('Invalid ABA time'); return }
    if (!window.confirm(`Confirm release for ${displayName(selected)}\nOrder: ${selected.order_id}\nDiamonds: ${selected.diamonds}\nABA: ${recoveryRef}\nThis will credit the real wallet.`)) return
    setWorking(true)
    setError('')
    setFeedback('')
    try {
      const data = await request(`/${encodeURIComponent(selected.id)}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          user_id: selected.user_id,
          reference: recoveryRef.trim(),
          verified_amount_usd: Number(verifiedUsd),
          bank_paid_at: bankDate.toISOString(),
          reason: recoveryReason.trim(),
          passkey: recoveryPin,
          bank_verified: bankVerified,
          confirm_recipient: recipientVerified,
        }),
      })
      setFeedback(`Success: ${Number(data.result?.diamonds || 0)} Diamonds released · Wallet ${Number(data.result?.balance_before || 0)} → ${Number(data.result?.balance_after || 0)}`)
      setSelectedId('')
      setWalletResult(null)
      setRefreshKey((v) => v + 1)
      setHistoryRefresh((v) => v + 1)
      clearSensitive()
    } catch (e) { setError(e.message) }
    finally { setWorking(false); setRecoveryPin('') }
  }

  async function searchRecipient(event) {
    event.preventDefault()
    setError('')
    setFeedback('')
    setRecipient(null)
    setRecipients([])
    setTopupConfirmed(false)
    setWorking(true)
    try {
      const data = await request(`/recipients?q=${encodeURIComponent(recipientSearch.trim())}`)
      setRecipients(data.users || [])
    } catch (e) { setError(e.message) }
    finally { setWorking(false) }
  }

  async function handleTopUp(event) {
    event.preventDefault()
    if (!recipient || !topupConfirmed || working) { setError('Select and confirm the correct recipient'); return }
    if (!/^\d{6}$/.test(topupPin)) { setError('Enter six-digit Passkey'); return }
    if (!window.confirm(`Manual Top-Up\nRecipient: ${recipient.name} (@${recipient.username})\nAmount: ${topupAmount} Diamonds\nReference: ${topupRef}\nThis credits the wallet immediately.`)) return
    setWorking(true)
    setError('')
    setFeedback('')
    try {
      const data = await request('/topup', {
        method: 'POST',
        body: JSON.stringify({
          user_id: recipient.id,
          diamonds: Number(topupAmount),
          reference: topupRef.trim(),
          reason: topupReason.trim(),
          passkey: topupPin,
          confirmed: topupConfirmed,
        }),
      })
      setFeedback(`Success: ${Number(data.result?.diamonds || 0)} Diamonds credited · Wallet ${Number(data.result?.balance_before || 0)} → ${Number(data.result?.balance_after || 0)}`)
      setRecipient({ ...recipient, diamond_balance: Number(data.result?.balance_after || 0) })
      setTopupAmount('')
      setTopupRef('')
      setTopupReason('')
      setHistoryRefresh((v) => v + 1)
      clearSensitive()
    } catch (e) { setError(e.message) }
    finally { setWorking(false); setTopupPin('') }
  }

  function changeTab(tab) {
    setActiveTab(tab)
    setError('')
    setFeedback('')
    clearSensitive()
  }

  const selected = payments.find((payment) => payment.id === selectedId)
  const releasedCount = payments.filter(isReleased).length

  return (
    <AdminLayout title="Payment Recovery & Top-Up" subtitle="Review ABA transfers before changing real Diamond balances.">
      <style>{styles}</style>
      <div className="recovery-page">
        <section className="recovery-card">
          <div className="recovery-intro">
            <div>
              <div className="recovery-eyebrow">Admin payment tools</div>
              <h2 className="recovery-heading">Payment Recovery & Top-Up</h2>
              <div className="recovery-muted">Separate recovery, manual adjustment, and auditable payment history.</div>
            </div>
            <span className="recovery-tag">Six-digit Passkey required</span>
          </div>
          <div className="recovery-tabs">
            <button type="button" className={`recovery-tab ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => changeTab('recovery')}>Payment Recovery</button>
            <button type="button" className={`recovery-tab ${activeTab === 'topup' ? 'active' : ''}`} onClick={() => changeTab('topup')}>Manual Top-Up</button>
            <button type="button" className={`recovery-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => changeTab('history')}>Action History</button>
          </div>
        </section>

        {feedback ? <div className="recovery-success" role="status">{feedback}</div> : null}
        {error ? <div className="recovery-error" role="alert" style={{ margin: 0 }}>{error}</div> : null}

        {activeTab === 'recovery' ? (
          <>
            <div className="recovery-stats">
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Orders on this page</span><strong className="recovery-stat-value">{payments.length}</strong></div>
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Marked released</span><strong className="recovery-stat-value">{releasedCount}</strong></div>
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Not marked released</span><strong className="recovery-stat-value">{payments.length - releasedCount}</strong></div>
            </div>
            <section className="recovery-card">
              <div className="recovery-section-head">
                <div><h3>Payment orders</h3><div className="recovery-muted">Database search: username, Order ID, ABA reference, payer, date, or amount.</div></div>
                <button className="recovery-button" type="button" disabled={loading || working} onClick={() => setRefreshKey((v) => v + 1)}>{loading ? 'Loading...' : 'Refresh'}</button>
              </div>
              <form className="recovery-controls" onSubmit={searchPayments}>
                <input className="recovery-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search account, order, ABA reference..." aria-label="Search payment orders" />
                <select className="recovery-input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Payment status">
                  <option value="all">All statuses</option><option value="released">Released</option><option value="unreleased">Not released</option><option value="waiting_payment">Waiting</option><option value="pending_review">Need review</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
                </select>
                <input className="recovery-input" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="USD amount" aria-label="USD amount" />
                <input className="recovery-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date Cambodia" />
                <button className="recovery-button recovery-primary" type="submit" disabled={loading}>Search</button>
                <button className="recovery-button" type="button" disabled={loading} onClick={clearFilters}>Clear</button>
              </form>
              <p className="recovery-notice">20 records per page. Without a search term, results cover the last 30 days. The database cannot independently prove ABA settlement. Always verify the official bank transaction before recovery.</p>
              <div className="recovery-table-wrap">
                <table className="recovery-table">
                  <thead><tr><th>Account</th><th>Order ID</th><th>USD</th><th>Diamonds</th><th>Status</th><th>Created (KH)</th><th></th></tr></thead>
                  <tbody>{payments.map((payment) => (
                    <tr key={payment.id} className={selectedId === payment.id ? 'recovery-row-active' : ''}>
                      <td><strong>{displayName(payment)}</strong><div className="recovery-sub">@{payment.user?.username || 'unknown'} · {payment.purchase_type || 'diamonds'}</div></td>
                      <td><strong>{payment.order_id || '—'}</strong><div className="recovery-sub">{payment.payer_name || 'Payer not recorded'}</div></td>
                      <td>${Number(payment.amount_usd ?? payment.package_usd ?? 0).toFixed(2)}</td>
                      <td>{Number(payment.diamonds || 0).toLocaleString()}</td>
                      <td><span className={`recovery-pill ${isReleased(payment) ? 'success' : payment.status || ''}`}>{isReleased(payment) ? 'Released' : payment.status || 'Unknown'}</span></td>
                      <td>{formatDate(payment.created_at)}</td>
                      <td><button className="recovery-button" type="button" onClick={() => openPayment(payment)}>Details</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                {!loading && !payments.length ? <div className="recovery-empty">No matching orders. Try a username or Order ID.</div> : null}
              </div>
              {selected ? (
                <div className="recovery-detail">
                  <h4>Selected payment details</h4>
                  <dl className="recovery-detail-grid">
                    <div><dt>Account</dt><dd>{displayName(selected)} @{selected.user?.username || ''}</dd></div>
                    <div><dt>User ID</dt><dd>{selected.user_id || '—'}</dd></div>
                    <div><dt>Order ID</dt><dd>{selected.order_id || '—'}</dd></div>
                    <div><dt>Purchase</dt><dd>{selected.purchase_type || 'diamonds'} · {selected.premium_plan_months || 0} Premium months · {selected.payment_method || 'unknown method'}</dd></div>
                    <div><dt>ABA Trx ID</dt><dd>{selected.aba_trx_id || 'Not recorded'}</dd></div>
                    <div><dt>Release time</dt><dd>{formatDate(selected.released_at)}</dd></div>
                    <div><dt>Match status</dt><dd>{selected.match_status || '—'}</dd></div>
                    <div><dt>Payment status</dt><dd>{selected.status || '—'}</dd></div>
                    <div><dt>Order amount</dt><dd>${Number(selected.amount_usd ?? selected.package_usd ?? 0).toFixed(2)} · {selected.diamonds} Diamonds · {selected.bonus_gems || 0} Coins</dd></div>
                  </dl>
                  <div className="recovery-actions" style={{ marginTop: 14 }}>
                    <button type="button" className="recovery-button" disabled={working} onClick={() => checkWallet(selected.user_id)}>Check current wallet</button>
                    {walletResult?.id === selected.user_id ? <strong>Wallet: {Number(walletResult.diamond_balance || 0).toLocaleString()} Diamonds</strong> : null}
                  </div>
                  {isReleased(selected) ? (
                    <p className="recovery-notice" style={{ margin: '16px 0 0' }}>This order is already marked released and cannot be credited again here.</p>
                  ) : !canRecover(selected) ? (
                    <p className="recovery-notice" style={{ margin: '16px 0 0' }}>This payment method or order status cannot be released by the ABA recovery tool.</p>
                  ) : (
                    <form className="recovery-form" onSubmit={handleRecovery}>
                      <h4 style={{ margin: 0 }}>Verify bank transfer, then release</h4>
                      <div className="recovery-form-grid">
                        <label>ABA transaction ID or bank reference<input className="recovery-input" value={recoveryRef} onChange={(e) => setRecoveryRef(e.target.value)} required maxLength={100} placeholder="Actual ABA transaction reference" /></label>
                        <label>Bank payment amount (USD)<input className="recovery-input" type="number" step="0.01" min="0.01" value={verifiedUsd} onChange={(e) => setVerifiedUsd(e.target.value)} required /></label>
                        <label>ABA payment time (Cambodia +07:00)<input className="recovery-input" type="datetime-local" value={bankPaidTime} onChange={(e) => setBankPaidTime(e.target.value)} required /></label>
                        <label>Six-digit Admin Passkey<input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={recoveryPin} onChange={(e) => setRecoveryPin(e.target.value)} placeholder="******" required /></label>
                      </div>
                      <label>Why does this order need recovery?<textarea className="recovery-input" value={recoveryReason} onChange={(e) => setRecoveryReason(e.target.value)} maxLength={500} minLength={12} required placeholder="Explain the verified ABA payment and missing automatic release" /></label>
                      <label className="recovery-check"><input type="checkbox" checked={bankVerified} onChange={(e) => setBankVerified(e.target.checked)} /> I verified the actual transfer in official ABA bank records (amount, reference, date/time).</label>
                      <label className="recovery-check"><input type="checkbox" checked={recipientVerified} onChange={(e) => setRecipientVerified(e.target.checked)} /> I confirmed the account, Order ID, and that the user was not credited already.</label>
                      <div className="recovery-actions"><button className="recovery-button recovery-primary" disabled={working || !bankVerified || !recipientVerified} type="submit">{working ? 'Processing...' : 'Release with Passkey'}</button></div>
                    </form>
                  )}
                </div>
              ) : null}
              <div className="recovery-footer">
                <span className="recovery-muted">Page {page} · {payments.length} orders shown</span>
                <div className="recovery-actions">
                  <button type="button" className="recovery-button" disabled={loading || !hasPrev} onClick={() => { setSelectedId(''); setPage((p) => Math.max(1, p - 1)) }}>Previous</button>
                  <button type="button" className="recovery-button" disabled={loading || !hasNext} onClick={() => { setSelectedId(''); setPage((p) => p + 1) }}>Next</button>
                </div>
              </div>
            </section>
          </>
        ) : activeTab === 'topup' ? (
          <section className="recovery-card recovery-preview">
            <h3>Manual Diamond Top-Up</h3>
            <p className="recovery-muted">Only Owner/Admin accounts with Passkey can credit Diamonds. Use Payment Recovery when an existing ABA order is available. Manual adjustments require a unique reference and detailed reason.</p>
            <form className="recovery-actions" onSubmit={searchRecipient}>
              <input className="recovery-input" style={{ flex: '1 1 220px' }} value={recipientSearch} onChange={(e) => setRecipientSearch(e.target.value)} placeholder="Exact username, name, email or User ID" minLength={2} required />
              <button type="submit" className="recovery-button" disabled={working}>{working ? 'Searching...' : 'Find account'}</button>
            </form>
            {recipients.length ? <div className="recovery-result-list">
              {recipients.map((user) => <div key={user.id} className={`recovery-person ${recipient?.id === user.id ? 'chosen' : ''}`}>
                <div><strong>{user.name || user.username}</strong><div className="recovery-sub">@{user.username} · {user.id}</div><div className="recovery-sub">Wallet: {Number(user.diamond_balance || 0).toLocaleString()} Diamonds</div></div>
                <button type="button" className="recovery-button" onClick={() => { setRecipient(user); setTopupConfirmed(false); setTopupPin(''); setFeedback('') }}>Select account</button>
              </div>)}
            </div> : null}
            {recipient ? (
              <form className="recovery-form" onSubmit={handleTopUp}>
                <div className="recovery-subheading">Selected: {recipient.name || recipient.username} (@{recipient.username}) · {recipient.id}</div>
                <div className="recovery-form-grid">
                  <label>Diamonds to credit (1–10,000)<input className="recovery-input" type="number" min="1" max="10000" step="1" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} required /></label>
                  <label>Unique ABA / adjustment reference<input className="recovery-input" value={topupRef} onChange={(e) => setTopupRef(e.target.value)} maxLength={100} required placeholder="ABA reference or ADJ-XXXXXX" /></label>
                  <label>Six-digit Admin Passkey<input className="recovery-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={topupPin} onChange={(e) => setTopupPin(e.target.value)} required placeholder="******" /></label>
                </div>
                <label>Detailed reason<textarea className="recovery-input" minLength={12} maxLength={500} required value={topupReason} onChange={(e) => setTopupReason(e.target.value)} placeholder="Explain why this adjustment was approved and identify the supporting record" /></label>
                <label className="recovery-check"><input type="checkbox" checked={topupConfirmed} onChange={(e) => setTopupConfirmed(e.target.checked)} /> I confirm this exact recipient, Diamond amount, reference, and that this credit is authorized and not a duplicate of an order.</label>
                <button type="submit" className="recovery-button recovery-primary" disabled={working || !topupConfirmed}>{working ? 'Processing...' : 'Confirm Manual Top-Up'}</button>
              </form>
            ) : <p className="recovery-notice" style={{ margin: 0 }}>Select a recipient first. No Diamonds will be credited until Passkey is verified by the Backend.</p>}
          </section>
        ) : (
          <section className="recovery-card recovery-history">
            <div className="recovery-section-head" style={{ padding: 0, border: 0 }}>
              <div><h3>Recovery & Top-Up Action History</h3><p className="recovery-muted">Permanent server-side audit trail. 20 records per page.</p></div>
              <button className="recovery-button" onClick={() => setHistoryRefresh((v) => v + 1)} disabled={historyLoading}>Refresh</button>
            </div>
            {historyLoading ? <p className="recovery-muted">Loading action history...</p> : null}
            {!historyLoading && !history.length ? <div className="recovery-empty">No recovery actions have been recorded.</div> : null}
            {history.map((action) => <div className="recovery-history-item" key={action.id}>
              <strong>{action.user_name || 'Unknown account'} · {Number(action.diamonds || 0).toLocaleString()} Diamonds</strong>
              <div className="recovery-sub">User {action.user_id} · Reference {action.reference}</div>
              <div className="recovery-sub">Wallet {Number(action.balance_before || 0).toLocaleString()} → {Number(action.balance_after || 0).toLocaleString()} · {formatDate(action.created_at)}</div>
              <div className="recovery-sub">Admin {action.admin_email} · {action.reason}</div>
            </div>)}
            <div className="recovery-actions">
              <button className="recovery-button" disabled={historyLoading || historyPage <= 1} onClick={() => setHistoryPage((v) => Math.max(1, v - 1))}>Previous</button>
              <span className="recovery-muted">Page {historyPage}</span>
              <button className="recovery-button" disabled={historyLoading || !historyHasNext} onClick={() => setHistoryPage((v) => v + 1)}>Next</button>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}
