import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  body {
    margin: 0;
    background: #F8FAFC;
    color: #0F172A;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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

  @media (max-width: 1100px) {
    .withdraw-row {
      grid-template-columns: 1fr;
    }

    .withdraw-toolbar {
      grid-template-columns: 1fr;
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
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

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

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="withdraw-page">
        <div className="withdraw-body">
          <div className="withdraw-top">
            <div className="withdraw-kicker">AUTHOR PAYOUTS</div>
            <h1 className="withdraw-heading">Withdraw Requests</h1>
            <div className="withdraw-note">
              Review author withdrawal requests, payment method snapshots, and payout status.
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
                <option value="in_review">In review</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
              </select>

              <button className="refresh-button" type="button" onClick={() => fetchWithdrawals(1)}>
                Refresh
              </button>
            </div>
          </div>

          <div className="withdraw-card">
            <div className="withdraw-card-head">
              <div className="withdraw-card-title">Withdrawal list</div>
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
                  <div className="withdraw-row" key={withdrawal.id}>
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
                        <div className="small">QR: <span className="strong">{method.qr_image_url}</span></div>
                      ) : null}
                      {withdrawal.paid_transaction_id ? (
                        <div className="small">Paid ref: <span className="strong">{withdrawal.paid_transaction_id}</span></div>
                      ) : null}
                      {withdrawal.paid_proof_url ? (
                        <div className="small">Proof: <span className="strong">{withdrawal.paid_proof_url}</span></div>
                      ) : null}
                    </div>

                    <div>
                      <span className={`status-pill status-${withdrawal.status || 'in_review'}`}>
                        {statusLabel(withdrawal.status || 'in_review')}
                      </span>
                      <div className="small">Paid at: <span className="strong">{formatDate(withdrawal.paid_at)}</span></div>
                      <div className="small">Admin note: <span className="strong">{withdrawal.admin_note || '-'}</span></div>
                      <div className="small">Reject reason: <span className="strong">{withdrawal.reject_reason || '-'}</span></div>
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
