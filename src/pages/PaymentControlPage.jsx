import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const tabs = [
  { key: 'success', label: 'Success' },
  { key: 'waiting_payment', label: 'Waiting' },
  { key: 'failed', label: 'Failed' },
  { key: 'expired', label: 'Expired' },
  { key: 'all', label: 'All' },
]

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function getHeaders() {
  const token = getAdminToken()

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function getTransactionId(item) {
  return item.aba_transaction_id || item.transaction_id || item.payment_reference || item.order_id || '-'
}

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'approved') return 'success'
  if (value === 'pending') return 'waiting_payment'
  return value || 'waiting_payment'
}

function StatusBadge({ status }) {
  const value = normalizeStatus(status)
  const styles = {
    success: { background: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Success' },
    waiting_payment: { background: '#FFF7ED', color: '#C2410C', border: '#FED7AA', label: 'Waiting' },
    failed: { background: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Failed' },
    expired: { background: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: 'Expired' },
    cancelled: { background: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: 'Cancelled' },
  }

  const style = styles[value] || styles.waiting_payment

  return (
    <span style={{
      display: 'inline-flex',
      height: 28,
      alignItems: 'center',
      borderRadius: 999,
      border: `1px solid ${style.border}`,
      background: style.background,
      color: style.color,
      padding: '0 11px',
      fontSize: 12,
      fontWeight: 900,
    }}>
      {style.label}
    </span>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box}
  body{margin:0;background:#F8FAFC;font-family:Inter,sans-serif;color:#0F172A}
  .pay-shell{min-height:100vh;background:#F8FAFC}
  .pay-header{height:70px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:20}
  .pay-header h2{margin:0;font-size:17px;font-weight:950}
  .pay-header button{height:40px;border:1px solid #E2E8F0;background:#fff;border-radius:13px;padding:0 14px;font-weight:900;color:#0F172A;cursor:pointer}
  .pay-content{max-width:1240px;margin:0 auto;padding:28px 32px 60px}
  .pay-top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}
  .pay-top h1{margin:0;font-size:30px;font-weight:950;letter-spacing:-.04em}
  .pay-top p{margin:8px 0 0;color:#64748B;font-size:13.5px;font-weight:700;line-height:1.6}
  .pay-refresh{height:44px;border:none;border-radius:14px;background:#0F172A;color:#fff;padding:0 18px;font-weight:950;cursor:pointer}
  .pay-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .pay-tab{height:38px;border:1px solid #E2E8F0;background:#fff;color:#64748B;border-radius:999px;padding:0 15px;font-size:13px;font-weight:950;cursor:pointer}
  .pay-tab.active{background:#0F172A;border-color:#0F172A;color:#fff}
  .pay-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}
  .pay-stat{background:#fff;border:1px solid #E2E8F0;border-radius:20px;padding:16px}
  .pay-stat span{color:#64748B;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
  .pay-stat strong{display:block;margin-top:8px;color:#0F172A;font-size:26px;font-weight:950}
  .pay-message{margin-bottom:16px;border-radius:16px;padding:13px 15px;font-size:13px;font-weight:850;background:#FEF2F2;color:#B91C1C}
  .pay-panel{background:#fff;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 8px 28px rgba(15,23,42,.05);overflow:hidden}
  .pay-panel-head{padding:18px 20px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .pay-panel-head h3{margin:0;font-size:16px;font-weight:950}
  .pay-panel-head p{margin:4px 0 0;color:#64748B;font-size:12.5px;font-weight:700}
  .pay-table-wrap{overflow-x:auto}
  .pay-table{width:100%;border-collapse:collapse;min-width:980px}
  .pay-table th{background:#F8FAFC;color:#64748B;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.08em;text-align:left;padding:13px 16px;border-bottom:1px solid #E2E8F0}
  .pay-table td{padding:15px 16px;border-bottom:1px solid #F1F5F9;font-size:13px;font-weight:800;color:#0F172A;vertical-align:middle}
  .pay-table tr:hover td{background:#FAFBFF}
  .pay-user strong{display:block;font-size:13.5px;font-weight:950;color:#0F172A}
  .pay-user span{display:block;margin-top:3px;font-size:12px;font-weight:750;color:#64748B}
  .pay-money{font-size:15px;font-weight:950;color:#0F172A}
  .pay-id{max-width:210px;word-break:break-word;color:#475569;font-size:12px;font-weight:850}
  .pay-security{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:18px}
  .pay-security-card{background:#fff;border:1px solid #E2E8F0;border-radius:18px;padding:14px}
  .pay-security-card strong{display:block;font-size:13px;font-weight:950;color:#0F172A}
  .pay-security-card span{display:block;margin-top:5px;color:#64748B;font-size:12px;font-weight:750;line-height:1.5}
  .pay-empty{padding:42px 20px;text-align:center;color:#64748B;font-weight:850}
  @media(max-width:960px){.pay-stats,.pay-security{grid-template-columns:repeat(2,minmax(0,1fr))}.pay-content{padding:22px 18px 50px}.pay-header{padding:0 18px}.pay-top{flex-direction:column}.pay-refresh{width:100%}}
  @media(max-width:640px){.pay-stats,.pay-security{grid-template-columns:1fr}}
`

export default function PaymentControlPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('success')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const stats = useMemo(() => {
    const success = payments.filter((item) => normalizeStatus(item.status) === 'success').length
    const waiting = payments.filter((item) => normalizeStatus(item.status) === 'waiting_payment').length
    const failed = payments.filter((item) => normalizeStatus(item.status) === 'failed').length
    const expired = payments.filter((item) => normalizeStatus(item.status) === 'expired').length
    const totalUsd = payments
      .filter((item) => normalizeStatus(item.status) === 'success')
      .reduce((sum, item) => sum + Number(item.package_usd || item.amount_usd || 0), 0)

    return { success, waiting, failed, expired, totalUsd }
  }, [payments])

  async function loadPayments(nextStatus = status) {
    const token = getAdminToken()

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const query = nextStatus === 'all' ? '' : `?status=${nextStatus}`
      const response = await fetch(`${API_URL}/api/admin/purchases${query}`, {
        headers: getHeaders(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load payments.')
      }

      setPayments(data.payments || data.purchases || [])
    } catch (error) {
      setPayments([])
      setMessage(error.message || 'Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments(status)
  }, [])

  return (
    <div className="pay-shell">
      <style>{styles}</style>

      <header className="pay-header">
        <h2>Shadow Admin</h2>
        <button type="button" onClick={() => navigate('/admin')}>Back to Dashboard</button>
      </header>

      <main className="pay-content">
        <div className="pay-top">
          <div>
            <h1>Payment</h1>
            <p>View ABA PayWay payment records and confirmed Diamond releases. This page is read-only for safety.</p>
          </div>

          <button type="button" className="pay-refresh" onClick={() => loadPayments(status)} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="pay-security">
          <div className="pay-security-card">
            <strong>Backend verified</strong>
            <span>Diamonds are released only after ABA callback verification.</span>
          </div>
          <div className="pay-security-card">
            <strong>No manual release</strong>
            <span>Admin cannot approve fake success from this page.</span>
          </div>
          <div className="pay-security-card">
            <strong>No failed report</strong>
            <span>Failed or expired payments stay quiet and do not alert Admin or Telegram.</span>
          </div>
        </div>

        <div className="pay-tabs">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`pay-tab ${status === item.key ? 'active' : ''}`}
              onClick={() => {
                setStatus(item.key)
                loadPayments(item.key)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="pay-stats">
          <div className="pay-stat"><span>Success</span><strong>{stats.success}</strong></div>
          <div className="pay-stat"><span>Waiting</span><strong>{stats.waiting}</strong></div>
          <div className="pay-stat"><span>Failed</span><strong>{stats.failed}</strong></div>
          <div className="pay-stat"><span>Success USD</span><strong>${stats.totalUsd}</strong></div>
        </div>

        {message ? <div className="pay-message">{message}</div> : null}

        <section className="pay-panel">
          <div className="pay-panel-head">
            <div>
              <h3>Payment Records</h3>
              <p>{loading ? 'Loading payments...' : `${payments.length} record(s)`}</p>
            </div>
          </div>

          <div className="pay-table-wrap">
            <table className="pay-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Diamonds</th>
                  <th>Bonus Gems</th>
                  <th>ABA / Order ID</th>
                  <th>Created</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {payments.length ? (
                  payments.map((item) => (
                    <tr key={item.id || item.order_id}>
                      <td>
                        <div className="pay-user">
                          <strong>{item.user?.name || item.user?.username || 'Reader'}</strong>
                          <span>{item.user?.email || item.user_id || '-'}</span>
                        </div>
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                      <td><span className="pay-money">${item.package_usd || item.amount_usd || 0}</span></td>
                      <td>{formatNumber(item.diamonds)}</td>
                      <td>{formatNumber(item.bonus_gems)}</td>
                      <td><div className="pay-id">{getTransactionId(item)}</div></td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{formatDate(item.paid_at || item.approved_at || item.updated_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      <div className="pay-empty">{loading ? 'Loading...' : 'No payment records found.'}</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
