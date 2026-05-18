import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

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

function StatusBadge({ status }) {
  const styles = {
    pending: { background: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
    approved: { background: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    rejected: { background: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
  }

  const style = styles[status] || styles.pending

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
      textTransform: 'capitalize',
    }}>
      {status || 'pending'}
    </span>
  )
}

function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: size, flexShrink: 0 }}>
      <path d={d} />
    </svg>
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
  .pay-message{margin-bottom:16px;border-radius:16px;padding:13px 15px;font-size:13px;font-weight:850}
  .pay-message.success{background:#ECFDF5;color:#047857}
  .pay-message.error{background:#FEF2F2;color:#B91C1C}
  .pay-layout{display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:18px;align-items:start}
  .pay-panel{background:#fff;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 8px 28px rgba(15,23,42,.05);overflow:hidden}
  .pay-panel-head{padding:18px 20px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .pay-panel-head h3{margin:0;font-size:16px;font-weight:950}
  .pay-panel-head p{margin:4px 0 0;color:#64748B;font-size:12.5px;font-weight:700}
  .pay-list{padding:14px;display:grid;gap:10px}
  .pay-item{width:100%;border:1px solid #EEF2F7;background:#fff;border-radius:18px;padding:14px;text-align:left;cursor:pointer;transition:.16s ease}
  .pay-item:hover,.pay-item.active{border-color:#0F172A;box-shadow:0 10px 24px rgba(15,23,42,.08)}
  .pay-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .pay-user{font-size:14px;font-weight:950;color:#0F172A}
  .pay-sub{margin-top:4px;color:#64748B;font-size:12px;font-weight:750;line-height:1.5}
  .pay-amount{font-size:18px;font-weight:950;color:#0F172A;text-align:right}
  .pay-empty{padding:38px 20px;text-align:center;color:#64748B;font-weight:850}
  .pay-detail{padding:20px}
  .pay-detail-title{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:16px}
  .pay-detail-title h3{margin:0;font-size:20px;font-weight:950}
  .pay-detail-grid{display:grid;gap:10px}
  .pay-row{display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid #F1F5F9;padding:11px 0}
  .pay-row span{color:#64748B;font-size:12px;font-weight:850}
  .pay-row strong{color:#0F172A;font-size:13px;font-weight:950;text-align:right;word-break:break-word}
  .pay-note{width:100%;min-height:86px;border:1px solid #E2E8F0;border-radius:15px;padding:12px 13px;resize:vertical;outline:none;font-family:Inter,sans-serif;font-weight:700;color:#0F172A;margin-top:16px}
  .pay-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
  .pay-approve,.pay-reject{height:44px;border:none;border-radius:14px;font-weight:950;color:#fff;cursor:pointer}
  .pay-approve{background:#047857}
  .pay-reject{background:#B91C1C}
  .pay-actions button:disabled{opacity:.55;cursor:not-allowed}
  .pay-proof{display:block;margin-top:10px;border-radius:14px;border:1px solid #E2E8F0;background:#F8FAFC;padding:11px 12px;color:#0F172A;text-decoration:none;font-size:13px;font-weight:900;word-break:break-word}
  @media(max-width:960px){.pay-layout{grid-template-columns:1fr}.pay-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.pay-content{padding:22px 18px 50px}.pay-header{padding:0 18px}.pay-top{flex-direction:column}.pay-refresh{width:100%}}
`

export default function PaymentControlPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('pending')
  const [purchases, setPurchases] = useState([])
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const stats = useMemo(() => {
    const pending = purchases.filter((item) => item.status === 'pending').length
    const approved = purchases.filter((item) => item.status === 'approved').length
    const rejected = purchases.filter((item) => item.status === 'rejected').length
    const totalUsd = purchases.reduce((sum, item) => sum + Number(item.package_usd || 0), 0)

    return { pending, approved, rejected, totalUsd }
  }, [purchases])

  async function loadPurchases(nextStatus = status) {
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
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to load purchases.')
      }

      setPurchases(data.purchases || [])
      setSelected((data.purchases || [])[0] || null)
      setNote('')
    } catch (error) {
      setMessage(error.message || 'Failed to load purchases.')
    } finally {
      setLoading(false)
    }
  }

  async function updateRequest(action) {
    if (!selected || busy) return

    try {
      setBusy(true)
      setMessage('')

      const response = await fetch(`${API_URL}/api/admin/purchases/${selected.id}/${action}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          admin_note: note,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || `Failed to ${action} request.`)
      }

      setMessage(`Purchase request ${action}d successfully.`)
      await loadPurchases(status)
    } catch (error) {
      setMessage(error.message || `Failed to ${action} request.`)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadPurchases(status)
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
            <h1>Payment Control</h1>
            <p>Review purchase requests, approve valid payments, and add Diamonds/Gems to reader wallets.</p>
          </div>

          <button type="button" className="pay-refresh" onClick={() => loadPurchases(status)} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="pay-tabs">
          {['pending', 'approved', 'rejected', 'all'].map((item) => (
            <button
              key={item}
              type="button"
              className={`pay-tab ${status === item ? 'active' : ''}`}
              onClick={() => {
                setStatus(item)
                loadPurchases(item)
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="pay-stats">
          <div className="pay-stat"><span>Pending</span><strong>{stats.pending}</strong></div>
          <div className="pay-stat"><span>Approved</span><strong>{stats.approved}</strong></div>
          <div className="pay-stat"><span>Rejected</span><strong>{stats.rejected}</strong></div>
          <div className="pay-stat"><span>Total USD</span><strong>${stats.totalUsd}</strong></div>
        </div>

        {message ? (
          <div className={`pay-message ${message.toLowerCase().includes('failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        ) : null}

        <div className="pay-layout">
          <section className="pay-panel">
            <div className="pay-panel-head">
              <div>
                <h3>Purchase Requests</h3>
                <p>{loading ? 'Loading requests...' : `${purchases.length} request(s)`}</p>
              </div>
            </div>

            <div className="pay-list">
              {purchases.length ? (
                purchases.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pay-item ${selected?.id === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelected(item)
                      setNote(item.admin_note || '')
                    }}
                  >
                    <div className="pay-item-top">
                      <div>
                        <div className="pay-user">{item.user?.name || item.user?.username || 'Reader'}</div>
                        <div className="pay-sub">
                          {item.user?.email || '-'}<br />
                          {formatDate(item.created_at)}
                        </div>
                      </div>

                      <div>
                        <div className="pay-amount">${item.package_usd}</div>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="pay-empty">{loading ? 'Loading...' : 'No purchase requests found.'}</div>
              )}
            </div>
          </section>

          <aside className="pay-panel">
            {selected ? (
              <div className="pay-detail">
                <div className="pay-detail-title">
                  <div>
                    <h3>${selected.package_usd}</h3>
                    <p style={{ margin: '5px 0 0', color: '#64748B', fontSize: 12, fontWeight: 800 }}>
                      Request detail
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="pay-detail-grid">
                  <div className="pay-row"><span>User</span><strong>{selected.user?.name || '-'}</strong></div>
                  <div className="pay-row"><span>Username</span><strong>{selected.user?.username || '-'}</strong></div>
                  <div className="pay-row"><span>Email</span><strong>{selected.user?.email || '-'}</strong></div>
                  <div className="pay-row"><span>Diamonds</span><strong>{formatNumber(selected.diamonds)}</strong></div>
                  <div className="pay-row"><span>Bonus Gems</span><strong>{formatNumber(selected.bonus_gems)}</strong></div>
                  <div className="pay-row"><span>Payer Name</span><strong>{selected.payer_name || '-'}</strong></div>
                  <div className="pay-row"><span>Reference</span><strong>{selected.payment_reference || '-'}</strong></div>
                  <div className="pay-row"><span>Created</span><strong>{formatDate(selected.created_at)}</strong></div>
                  <div className="pay-row"><span>Approved By</span><strong>{selected.approved_by || '-'}</strong></div>
                </div>

                {selected.proof_url ? (
                  <a className="pay-proof" href={selected.proof_url} target="_blank" rel="noreferrer">
                    Open Payment Proof
                  </a>
                ) : null}

                <textarea
                  className="pay-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Admin note"
                />

                <div className="pay-actions">
                  <button
                    type="button"
                    className="pay-approve"
                    onClick={() => updateRequest('approve')}
                    disabled={busy || selected.status !== 'pending'}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="pay-reject"
                    onClick={() => updateRequest('reject')}
                    disabled={busy || selected.status !== 'pending'}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="pay-empty">
                <Icon d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" size={26} />
                <div style={{ marginTop: 10 }}>Select a request to review.</div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
