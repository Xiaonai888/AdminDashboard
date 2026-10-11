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
  @media (max-width: 1040px) { .recovery-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); } .recovery-controls .recovery-input:first-child { grid-column: 1 / -1; } }
  @media (max-width: 680px) { .recovery-intro { padding: 18px; align-items: flex-start; flex-direction: column; } .recovery-stats { grid-template-columns: 1fr; } .recovery-controls { grid-template-columns: 1fr; padding: 14px; } .recovery-controls .recovery-input:first-child { grid-column: auto; } .recovery-tabs { flex-wrap: wrap; } .recovery-detail-grid, .recovery-preview-grid { grid-template-columns: 1fr; } .recovery-section-head { align-items: flex-start; flex-direction: column; } .recovery-notice, .recovery-error { margin-left: 14px; margin-right: 14px; } }
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

export default function AdminPaymentRecoveryTopUpPage() {
  const [activeTab, setActiveTab] = useState('recovery')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  const loadPayments = useCallback(async (signal) => {
    const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
    if (!token) {
      setError('Admin login required.')
      setPayments([])
      setHasNext(false)
      setHasPrev(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', status: appliedFilters.status })
      if (appliedFilters.q) params.set('q', appliedFilters.q)
      if (appliedFilters.amount) params.set('amount', appliedFilters.amount)
      if (appliedFilters.date) params.set('date', appliedFilters.date)
      const response = await fetch(`${API_URL}/api/admin/purchases/recovery?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to search payment orders.')
      if (signal?.aborted) return
      setPayments(Array.isArray(data.payments) ? data.payments : [])
      setHasNext(Boolean(data.has_next))
      setHasPrev(Boolean(data.has_prev))
    } catch (requestError) {
      if (signal?.aborted) return
      setPayments([])
      setHasNext(false)
      setHasPrev(false)
      setError(requestError.message || 'Unable to search payments.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [page, appliedFilters])

  useEffect(() => {
    if (activeTab !== 'recovery') return undefined
    const controller = new AbortController()
    loadPayments(controller.signal)
    return () => controller.abort()
  }, [activeTab, loadPayments, refreshKey])

  function searchPayments(event) {
    event.preventDefault()
    setSelectedId('')
    setPage(1)
    setAppliedFilters({ q: query.trim(), status, amount: amount.trim(), date })
  }

  function clearFilters() {
    setQuery('')
    setStatus('all')
    setAmount('')
    setDate('')
    setSelectedId('')
    setPage(1)
    setAppliedFilters({ q: '', status: 'all', amount: '', date: '' })
  }

  const selected = payments.find((payment) => payment.id === selectedId)
  const releasedCount = payments.filter(isReleased).length

  return (
    <AdminLayout title="Payment Recovery & Top-Up" subtitle="Investigate missing payments and manage recovery safely.">
      <style>{styles}</style>
      <div className="recovery-page">
        <section className="recovery-card">
          <div className="recovery-intro">
            <div>
              <div className="recovery-eyebrow">Admin payment tools</div>
              <h2 className="recovery-heading">Payment Recovery & Top-Up</h2>
              <div className="recovery-muted">Review an order before any manual payment recovery. Transfers require a verified backend action.</div>
            </div>
            <span className="recovery-tag">Read-only first stage</span>
          </div>
          <div className="recovery-tabs">
            <button type="button" className={`recovery-tab ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => setActiveTab('recovery')}>Payment Recovery</button>
            <button type="button" className={`recovery-tab ${activeTab === 'topup' ? 'active' : ''}`} onClick={() => setActiveTab('topup')}>Manual Top-Up</button>
          </div>
        </section>

        {activeTab === 'recovery' ? (
          <>
            <div className="recovery-stats">
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Orders on this page</span><strong className="recovery-stat-value">{payments.length}</strong></div>
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Released on this page</span><strong className="recovery-stat-value">{releasedCount}</strong></div>
              <div className="recovery-card recovery-stat"><span className="recovery-stat-title">Not released on this page</span><strong className="recovery-stat-value">{payments.length - releasedCount}</strong></div>
            </div>
            <section className="recovery-card">
              <div className="recovery-section-head">
                <div><h3>Payment orders</h3><div className="recovery-muted">Search database by Reader, Author, Username, User ID, Order ID, or payer name.</div></div>
                <button className="recovery-button" type="button" disabled={loading} onClick={() => setRefreshKey((key) => key + 1)}>{loading ? 'Loading...' : 'Refresh'}</button>
              </div>
              <form className="recovery-controls" onSubmit={searchPayments}>
                <input className="recovery-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search account, order, payer..." aria-label="Search payment orders" />
                <select className="recovery-input" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter payment status">
                  <option value="all">All statuses</option><option value="released">Released</option><option value="unreleased">Not released</option><option value="waiting_payment">Waiting</option><option value="pending_review">Need review</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
                </select>
                <input className="recovery-input" value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="0.01" placeholder="USD amount" aria-label="Filter payment amount" />
                <input className="recovery-input" value={date} onChange={(event) => setDate(event.target.value)} type="date" aria-label="Filter payment date in Cambodia" />
                <button className="recovery-button" type="submit" disabled={loading}>Search</button>
                <button className="recovery-button" type="button" onClick={clearFilters} disabled={loading}>Clear</button>
              </form>
              <p className="recovery-notice">Search runs on the payment database, 20 orders per page. Without a name or Order ID, results are limited to the last 30 days. A payment record does not prove that the bank received funds. Verify ABA before release.</p>
              {error ? <p className="recovery-error">{error}</p> : null}
              <div className="recovery-table-wrap">
                <table className="recovery-table">
                  <thead><tr><th>Account</th><th>Order ID</th><th>Amount</th><th>Diamonds</th><th>Status</th><th>Created (KH)</th><th></th></tr></thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className={selectedId === payment.id ? 'recovery-row-active' : ''}>
                        <td><strong>{displayName(payment)}</strong><div className="recovery-sub">@{payment.user?.username || 'unknown'} · {payment.purchase_type || 'diamonds'}</div></td>
                        <td><strong>{payment.order_id || '—'}</strong><div className="recovery-sub">{payment.payer_name || 'Payer not recorded'}</div></td>
                        <td><strong>${Number(payment.amount_usd ?? payment.package_usd ?? 0).toFixed(2)}</strong></td>
                        <td><strong>{Number(payment.diamonds || 0).toLocaleString()}</strong></td>
                        <td><span className={`recovery-pill ${isReleased(payment) ? 'success' : payment.status || ''}`}>{isReleased(payment) ? 'Released' : payment.status || 'Unknown'}</span></td>
                        <td>{formatDate(payment.created_at)}</td>
                        <td><button className="recovery-button" type="button" onClick={() => setSelectedId(payment.id)}>Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && !payments.length ? <div className="recovery-empty">No payment orders found for these filters.</div> : null}
              </div>
              {selected ? (
                <div className="recovery-detail">
                  <h4>Selected payment details</h4>
                  <dl className="recovery-detail-grid">
                    <div><dt>Account name</dt><dd>{displayName(selected)}</dd></div>
                    <div><dt>Username</dt><dd>{selected.user?.username || '—'}</dd></div>
                    <div><dt>User ID</dt><dd>{selected.user_id || '—'}</dd></div>
                    <div><dt>Order ID</dt><dd>{selected.order_id || '—'}</dd></div>
                    <div><dt>ABA Trx ID</dt><dd>{selected.aba_trx_id || 'Not recorded'}</dd></div>
                    <div><dt>Release time</dt><dd>{formatDate(selected.released_at)}</dd></div>
                    <div><dt>Match status</dt><dd>{selected.match_status || '—'}</dd></div>
                    <div><dt>Payment status</dt><dd>{selected.status || '—'}</dd></div>
                    <div><dt>Payment amount</dt><dd>${Number(selected.amount_usd ?? selected.package_usd ?? 0).toFixed(2)}</dd></div>
                  </dl>
                  <p className="recovery-muted">A missing release marker is not proof that payment failed. Bank confirmation, identity checks, and duplicate protection will be required before enabling recovery.</p>
                  <button className="recovery-button" type="button" disabled>Release with Passkey — not enabled</button>
                </div>
              ) : null}
              <div className="recovery-footer">
                <span className="recovery-muted">Page {page} · {payments.length} orders shown</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" className="recovery-button" disabled={loading || !hasPrev} onClick={() => { setSelectedId(''); setPage((current) => Math.max(1, current - 1)) }}>Previous</button>
                  <button type="button" className="recovery-button" disabled={loading || !hasNext} onClick={() => { setSelectedId(''); setPage((current) => current + 1) }}>Next</button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="recovery-card recovery-preview">
            <h3>Manual Diamond Top-Up</h3>
            <div className="recovery-muted">This is a protected feature preview. Recipient lookup, balance validation, server-side six-digit Passkey verification, and audit logging must be connected before any Diamonds can be sent.</div>
            <div className="recovery-preview-grid">
              <label>Reader or Author username<input className="recovery-input" disabled placeholder="Account search will be added" /></label>
              <label>Diamonds to send<input className="recovery-input" disabled placeholder="Amount will be verified" /></label>
              <label>Reference / ABA Trx ID<input className="recovery-input" disabled placeholder="Required reference" /></label>
              <label>Admin Passkey<input className="recovery-input" type="password" disabled placeholder="Six-digit Passkey" /></label>
            </div>
            <div><button className="recovery-button" type="button" disabled>Confirm Top-Up — not enabled</button></div>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}
