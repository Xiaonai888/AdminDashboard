import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20

const tabs = [
  { key: 'waiting_payment', label: 'Verifying' },
  { key: 'pending_review', label: 'Need Review' },
  { key: 'success', label: 'Released' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'expired', label: 'Expired' },
  { key: 'all', label: 'All' },
]

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
    { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
    { path: '/comments', label: 'Comments', icon: 'M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' },
    { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { path: '/payment', label: 'Payment', icon: 'M21 12V7H5v10h16v-5z M5 7l8 5 8-5 M7 17h10' },
    { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
}

function Icon({ d, size = 20, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function getHeaders() {
  const token = getAdminToken()
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'approved') return 'success'
  if (value === 'confirmed') return 'success'
  if (value === 'pending') return 'waiting_payment'
  if (value === 'created') return 'waiting_payment'
  return value || 'waiting_payment'
}

function searchText(item) {
  return [
    item.user?.username,
    item.user?.name,
    item.user?.email,
    item.user_id,
    item.order_id,
    item.aba_trx_id,
    item.aba_apv,
    item.payer_name,
    item.match_reason,
    item.admin_note,
    item.status,
    item.amount_usd,
    item.package_usd,
  ].filter(Boolean).join(' ').toLowerCase()
}

function StatusBadge({ status }) {
  const value = normalizeStatus(status)
  const styles = {
    success: { background: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Released' },
    pending_review: { background: '#FFF7ED', color: '#C2410C', border: '#FED7AA', label: 'Need Review' },
    waiting_payment: { background: '#F8FAFC', color: '#475569', border: '#E2E8F0', label: 'Verifying' },
    rejected: { background: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Rejected' },
    expired: { background: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: 'Expired' },
    cancelled: { background: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: 'Cancelled' },
  }
  const style = styles[value] || styles.waiting_payment
  return <span className="status-badge" style={{ borderColor: style.border, background: style.background, color: style.color }}>{style.label}</span>
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const renderGroup = (items) => items.map((item) => (
    <button key={item.path} type="button" className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
      <Icon d={item.icon} size={20} />
      <span className="nav-text">{item.label}</span>
    </button>
  ))
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="#4F46E5" /><span className="logo-text">Shadow Admin</span></div>
      <span className="nav-group-label">Overview</span>{renderGroup(navItems.overview)}
      <span className="nav-group-label">Visual Media</span>{renderGroup(navItems.visualMedia)}
      <span className="nav-group-label">System Admin</span>{renderGroup(navItems.systemAdmin)}
      <span className="nav-group-label">Finance & Growth</span>{renderGroup(navItems.finance)}
    </aside>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  :root{--bg:#F8FAFC;--card:#fff;--primary:#4F46E5;--light:#EEF2FF;--text:#0F172A;--muted:#64748B;--border:#E2E8F0;--side:80px;--sideOpen:260px}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);font-family:Inter,sans-serif;color:var(--text)}
  .dashboard-wrapper{height:100vh;display:flex;background:var(--bg);overflow:hidden}.sidebar{width:var(--side);background:#fff;border-right:1px solid var(--border);padding:20px 14px;overflow:auto;overflow-x:hidden;transition:.25s;flex-shrink:0}.sidebar:hover{width:var(--sideOpen);box-shadow:10px 0 30px rgba(15,23,42,.05)}.sidebar::-webkit-scrollbar{width:0}.sidebar-logo{height:40px;display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-left:10px}.logo-text{opacity:0;white-space:nowrap;color:var(--primary);font-weight:900;font-size:18px;transition:.2s}.sidebar:hover .logo-text,.sidebar:hover .nav-text,.sidebar:hover .nav-group-label{opacity:1}.nav-group-label{opacity:0;display:block;margin:18px 0 8px 12px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;white-space:nowrap;transition:.2s}.nav-item{width:100%;border:0;background:transparent;height:44px;display:flex;align-items:center;border-radius:12px;padding:0 12px;color:var(--muted);cursor:pointer;margin-bottom:2px;font-weight:600;white-space:nowrap;font-family:inherit;font-size:14px;text-align:left}.nav-item:hover,.nav-item.active{background:var(--light);color:var(--primary)}.nav-text{opacity:0;margin-left:14px;transition:.2s}.main-content{flex:1;overflow:auto}.header{height:70px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 36px;position:sticky;top:0;z-index:10}.header h2{font-size:17px;font-weight:900;margin:0}.header button{height:40px;border:1px solid var(--border);background:#fff;border-radius:13px;padding:0 14px;font-weight:900;color:var(--text);cursor:pointer}.content-body{padding:28px 36px 60px;max-width:1600px;width:100%;margin:0 auto}
  .pay-top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.pay-top h1{margin:0;font-size:30px;font-weight:950;letter-spacing:-.04em}.pay-top p{margin:8px 0 0;color:var(--muted);font-size:13.5px;font-weight:700;line-height:1.6}.pay-live{height:34px;border-radius:999px;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;display:flex;align-items:center;padding:0 13px;font-size:12px;font-weight:950;white-space:nowrap}.pay-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.pay-tab{height:38px;border:1px solid var(--border);background:#fff;color:var(--muted);border-radius:999px;padding:0 15px;font-size:13px;font-weight:950;cursor:pointer}.pay-tab.active{background:#0F172A;border-color:#0F172A;color:#fff}.pay-tools{display:grid;grid-template-columns:1fr 180px;gap:12px;margin-bottom:18px}.pay-search,.pay-select{height:44px;border:1px solid var(--border);border-radius:14px;background:#fff;color:var(--text);font-family:inherit;font-size:13px;font-weight:800;padding:0 14px;outline:none}.pay-search::placeholder{color:#94A3B8}.pay-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.pay-stat{background:#fff;border:1px solid var(--border);border-radius:20px;padding:16px}.pay-stat span{color:var(--muted);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.pay-stat strong{display:block;margin-top:8px;color:var(--text);font-size:26px;font-weight:950}.pay-message{margin-bottom:16px;border-radius:16px;padding:13px 15px;font-size:13px;font-weight:850;background:#FEF2F2;color:#B91C1C}.pay-panel{background:#fff;border:1px solid var(--border);border-radius:24px;box-shadow:0 8px 28px rgba(15,23,42,.05);overflow:hidden}.pay-panel-head{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.pay-panel-head h3{margin:0;font-size:16px;font-weight:950}.pay-panel-head p{margin:4px 0 0;color:var(--muted);font-size:12.5px;font-weight:700}.pay-page-info{font-size:12px;font-weight:900;color:var(--muted);white-space:nowrap}.pay-table-wrap{overflow-x:auto}.pay-table{width:100%;border-collapse:collapse;min-width:1180px}.pay-table th{background:#F8FAFC;color:var(--muted);font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;text-align:left;padding:13px 16px;border-bottom:1px solid var(--border)}.pay-table td{padding:15px 16px;border-bottom:1px solid #F1F5F9;font-size:13px;font-weight:800;color:var(--text);vertical-align:middle}.pay-user strong{display:block;font-size:13.5px;font-weight:950;color:var(--text)}.pay-user span{display:block;margin-top:3px;font-size:12px;font-weight:750;color:var(--muted)}.pay-money{font-size:15px;font-weight:950;color:var(--text)}.pay-id{max-width:220px;word-break:break-word;color:#475569;font-size:12px;font-weight:850}.status-badge{display:inline-flex;height:28px;align-items:center;border-radius:999px;border:1px solid;padding:0 11px;font-size:12px;font-weight:900;white-space:nowrap}.pay-actions{display:flex;gap:8px;align-items:center}.pay-action{height:34px;border:0;border-radius:999px;padding:0 13px;font-size:12px;font-weight:950;cursor:pointer;white-space:nowrap}.pay-action.confirm{background:#0F172A;color:#fff}.pay-action.reject{background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA}.pay-action:disabled{opacity:.45;cursor:not-allowed}.pay-empty{padding:42px 20px;text-align:center;color:var(--muted);font-weight:850}.pay-reason{max-width:260px;color:#64748B;font-size:12px;line-height:1.5;font-weight:750}.pagination{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 20px;border-top:1px solid var(--border);background:#fff}.pagination span{font-size:12px;font-weight:900;color:var(--muted)}.pagination-buttons{display:flex;gap:8px}.pagination button{height:34px;border:1px solid var(--border);background:#fff;border-radius:999px;padding:0 14px;font-size:12px;font-weight:950;color:var(--text);cursor:pointer}.pagination button:disabled{opacity:.45;cursor:not-allowed}
  @media(max-width:960px){.pay-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.content-body{padding:22px 18px 50px}.header{padding:0 18px}.pay-top{flex-direction:column}.pay-tools{grid-template-columns:1fr}.pay-panel-head{flex-direction:column}.pay-live{width:100%;justify-content:center}}@media(max-width:640px){.pay-stats{grid-template-columns:1fr}.pagination{flex-direction:column;align-items:flex-start}}
`

export default function PaymentControlPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('all')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [amountFilter, setAmountFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filteredPayments = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return payments.filter((item) => {
      const matchesSearch = !keyword || searchText(item).includes(keyword)
      const amount = Number(item.package_usd || item.amount_usd || 0)
      const matchesAmount = amountFilter === 'all' || Number(amountFilter) === amount
      return matchesSearch && matchesAmount
    })
  }, [payments, search, amountFilter])

  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE))
  const paginatedPayments = filteredPayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = useMemo(() => {
    const waiting = payments.filter((item) => normalizeStatus(item.status) === 'waiting_payment').length
    const review = payments.filter((item) => normalizeStatus(item.status) === 'pending_review').length
    const success = payments.filter((item) => normalizeStatus(item.status) === 'success').length
    const totalUsd = payments.filter((item) => normalizeStatus(item.status) === 'success').reduce((sum, item) => sum + Number(item.package_usd || item.amount_usd || 0), 0)
    return { waiting, review, success, totalUsd }
  }, [payments])

  async function loadPayments(nextStatus = status, silent = false) {
    const token = getAdminToken()
    if (!token) {
      navigate('/login')
      return
    }

    try {
      if (!silent) setLoading(true)
      setMessage('')
      const query = nextStatus === 'all' ? '?status=all&limit=200' : `?status=${encodeURIComponent(nextStatus)}&limit=200`
      const response = await fetch(`${API_URL}/api/admin/purchases/manual${query}`, { headers: getHeaders() })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load payments.')
      setPayments(data.payments || data.purchases || [])
    } catch (error) {
      if (!silent) setPayments([])
      setMessage(error.message || 'Failed to load payments.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function reviewPayment(payment, action) {
    const isConfirm = action === 'confirm'
    const label = isConfirm ? 'approve and release Diamonds' : 'reject this payment'
    const ok = window.confirm(`Are you sure you want to ${label}?`)
    if (!ok) return
    const adminNote = window.prompt('Admin note (optional):', '') || ''

    try {
      setWorkingId(payment.id)
      setMessage('')
      const response = await fetch(`${API_URL}/api/admin/purchases/manual/${encodeURIComponent(payment.id)}/${action}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ admin_note: adminNote }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || `Failed to ${action} payment.`)
      await loadPayments(status, true)
    } catch (error) {
      setMessage(error.message || `Failed to ${action} payment.`)
    } finally {
      setWorkingId('')
    }
  }

  useEffect(() => {
    loadPayments(status)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadPayments(status, true)
    }, 15000)

    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => {
    setPage(1)
  }, [status, search, amountFilter])

  return (
    <div className="dashboard-wrapper">
      <style>{styles}</style>
      <Sidebar />
      <main className="main-content">
        <header className="header"><h2>Shadow Admin</h2><button type="button" onClick={() => navigate('/admin')}>Back to Dashboard</button></header>
        <div className="content-body">
          <div className="pay-top">
            <div>
              <h1>Payment Control</h1>
              <p>Use this as backup approval when the bot is slow. Confirm only after checking the ABA PayWay alert.</p>
            </div>
            <div className="pay-live">Live auto update</div>
          </div>

          <div className="pay-tabs">
            {tabs.map((item) => (
              <button key={item.key} type="button" className={`pay-tab ${status === item.key ? 'active' : ''}`} onClick={() => { setStatus(item.key); loadPayments(item.key) }}>{item.label}</button>
            ))}
          </div>

          <div className="pay-tools">
            <input className="pay-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search username, email, order ID, Trx ID, payer, reason..." />
            <select className="pay-select" value={amountFilter} onChange={(event) => setAmountFilter(event.target.value)}>
              <option value="all">All amounts</option>
              <option value="1">$1.00</option>
              <option value="5">$5.00</option>
              <option value="10">$10.00</option>
              <option value="20">$20.00</option>
              <option value="50">$50.00</option>
              <option value="100">$100.00</option>
            </select>
          </div>

          <div className="pay-stats">
            <div className="pay-stat"><span>Verifying</span><strong>{stats.waiting}</strong></div>
            <div className="pay-stat"><span>Need Review</span><strong>{stats.review}</strong></div>
            <div className="pay-stat"><span>Released</span><strong>{stats.success}</strong></div>
            <div className="pay-stat"><span>Released USD</span><strong>${stats.totalUsd.toFixed(2)}</strong></div>
          </div>

          {message ? <div className="pay-message">{message}</div> : null}

          <section className="pay-panel">
            <div className="pay-panel-head">
              <div>
                <h3>Payment Orders</h3>
                <p>{loading ? 'Loading payments...' : `${filteredPayments.length} result(s), 20 per page`}</p>
              </div>
              <div className="pay-page-info">Page {page} / {pageCount}</div>
            </div>

            <div className="pay-table-wrap">
              <table className="pay-table">
                <thead>
                  <tr>
                    <th>User</th><th>Status</th><th>Amount</th><th>Diamonds</th><th>Bonus</th><th>Order ID</th><th>Trx ID</th><th>Reason</th><th>Created</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.length ? paginatedPayments.map((item) => {
                    const currentStatus = normalizeStatus(item.status)
                    const canReview = currentStatus === 'waiting_payment' || currentStatus === 'pending_review'
                    const disabled = workingId === item.id
                    return (
                      <tr key={item.id || item.order_id}>
                        <td><div className="pay-user"><strong>{item.user?.username ? `@${item.user.username}` : item.user?.name || 'Reader'}</strong><span>{item.user?.email || item.user_id || '-'}</span></div></td>
                        <td><StatusBadge status={item.status} /></td>
                        <td><span className="pay-money">{formatMoney(item.package_usd || item.amount_usd || 0)}</span></td>
                        <td>{formatNumber(item.diamonds)}</td>
                        <td>{formatNumber(item.bonus_gems)}</td>
                        <td><div className="pay-id">{item.order_id || '-'}</div></td>
                        <td><div className="pay-id">{item.aba_trx_id || '-'}</div></td>
                        <td><div className="pay-reason">{item.match_reason || item.admin_note || '-'}</div></td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <div className="pay-actions">
                            <button type="button" className="pay-action confirm" disabled={!canReview || disabled} onClick={() => reviewPayment(item, 'confirm')}>Approve</button>
                            <button type="button" className="pay-action reject" disabled={!canReview || disabled} onClick={() => reviewPayment(item, 'reject')}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan="10"><div className="pay-empty">{loading ? 'Loading...' : 'No payment orders found.'}</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Showing {paginatedPayments.length ? ((page - 1) * PAGE_SIZE) + 1 : 0} - {Math.min(page * PAGE_SIZE, filteredPayments.length)} of {filteredPayments.length}</span>
              <div className="pagination-buttons">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
                <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
