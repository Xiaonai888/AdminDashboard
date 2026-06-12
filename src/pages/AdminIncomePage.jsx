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

  .income-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .income-body {
    padding: 26px;
    max-width: 1380px;
    margin: 0 auto;
  }

  .income-top {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    margin-bottom: 16px;
  }

  .income-kicker {
    color: #4F46E5;
    background: #EEF2FF;
    border-radius: 999px;
    padding: 7px 11px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .income-heading {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
  }

  .income-note {
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
    line-height: 1.6;
  }

  .income-toolbar {
    margin-top: 18px;
    display: grid;
    grid-template-columns: 190px 190px 120px;
    gap: 10px;
  }

  .income-input {
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

  .income-button {
    border: 0;
    border-radius: 14px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .income-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  .income-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .income-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .income-card-value {
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
    margin-top: 8px;
  }

  .income-card-sub {
    color: #94A3B8;
    font-size: 12px;
    font-weight: 800;
    margin-top: 8px;
    line-height: 1.5;
  }

  .income-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
    margin-bottom: 16px;
  }

  .income-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .income-panel-title {
    font-size: 16px;
    font-weight: 900;
  }

  .income-pill {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
  }

  .income-message {
    margin: 14px 20px 0;
    border-radius: 14px;
    padding: 12px 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 800;
  }

  .income-empty {
    padding: 44px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .income-source-row {
    padding: 18px 20px;
    border-bottom: 1px solid #F1F5F9;
    display: grid;
    grid-template-columns: 1.2fr repeat(4, 1fr);
    gap: 14px;
    align-items: center;
  }

  .income-source-row:last-child {
    border-bottom: 0;
  }

  .income-source-name {
    font-size: 14px;
    font-weight: 950;
    color: #0F172A;
  }

  .income-small {
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
    margin-top: 4px;
  }

  .income-strong {
    font-weight: 900;
    color: #0F172A;
  }

  .income-amount {
    font-size: 18px;
    font-weight: 950;
    color: #0F172A;
  }

  @media (max-width: 1100px) {
    .income-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .income-toolbar {
      grid-template-columns: 1fr;
    }

    .income-source-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .income-grid {
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

function sourceName(source) {
  if (source === 'episode_sales') return 'Episode Sales'
  if (source === 'author_store') return 'Author Page Book/PDF'
  if (source === 'shadow_mall') return 'Shadow Mall'
  return String(source || '-').replace(/_/g, ' ')
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function getMonthStartInputValue() {
  const date = new Date()
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)).toISOString().slice(0, 10)
}

export default function AdminIncomePage() {
  const [from, setFrom] = useState(getMonthStartInputValue())
  const [to, setTo] = useState(getTodayInputValue())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const summary = data?.summary || {}
  const sources = data?.sources || []
  const withdrawals = data?.withdrawals || {}

  const cardItems = useMemo(() => [
    {
      label: 'Net Platform Income',
      value: formatUsd(summary.net_platform_income_usd),
      sub: 'Admin real income',
    },
    {
      label: 'Shadow Mall Income',
      value: formatUsd(summary.shadow_mall_income_usd),
      sub: `Shipping excluded: ${formatUsd(summary.shipping_fee_excluded_usd)}`,
    },
    {
      label: 'Author Page 10%',
      value: formatUsd(summary.author_store_income_usd),
      sub: 'Books/PDF platform fee',
    },
    {
      label: 'Gross Sales',
      value: formatUsd(summary.gross_sales_usd),
      sub: `${summary.total_orders || 0} paid orders/unlocks`,
    },
    {
      label: 'Author Earnings',
      value: formatUsd(summary.author_earnings_usd),
      sub: 'Episode + Author Page earnings',
    },
    {
      label: 'Pending Payout',
      value: formatUsd(summary.pending_payout_usd),
      sub: 'Money owed to authors',
    },
    {
      label: 'Episode Platform Income',
      value: formatUsd(summary.episode_platform_income_usd),
      sub: 'Should be $0 with current rule',
    },
    {
      label: 'Episode Author Payout',
      value: formatUsd(summary.episode_author_payout_usd),
      sub: 'Author gets 100%',
    },
  ], [summary])

  async function fetchIncome() {
    try {
      setLoading(true)
      setMessage('')

      const token = getAdminToken()
      const params = new URLSearchParams()

      if (from) params.set('from', from)
      if (to) params.set('to', to)

      const response = await fetch(`${API_URL}/api/admin/income/summary?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok || result.ok === false) {
        throw new Error(result.message || 'Failed to load income summary')
      }

      setData(result)
    } catch (error) {
      setMessage(error.message || 'Failed to load income summary')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncome()
  }, [])

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="income-page">
        <div className="income-body">
          <div className="income-top">
            <div className="income-kicker">ADMIN INCOME</div>
            <h1 className="income-heading">Income Overview</h1>
            <div className="income-note">
              Track real platform income, author earnings, pending payouts, and Shadow Mall sales without counting shipping as profit.
            </div>

            <div className="income-toolbar">
              <input
                className="income-input"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
              <input
                className="income-input"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
              <button className="income-button" type="button" onClick={fetchIncome}>
                Refresh
              </button>
            </div>
          </div>

          {message ? <div className="income-message">{message}</div> : null}

          {loading ? (
            <div className="income-panel">
              <div className="income-empty">Loading income...</div>
            </div>
          ) : (
            <>
              <div className="income-grid">
                {cardItems.map((item) => (
                  <div className="income-card" key={item.label}>
                    <div className="income-card-label">{item.label}</div>
                    <div className="income-card-value">{item.value}</div>
                    <div className="income-card-sub">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="income-panel">
                <div className="income-panel-head">
                  <div className="income-panel-title">Income by Source</div>
                  <div className="income-pill">{sources.length} sources</div>
                </div>

                {sources.length === 0 ? (
                  <div className="income-empty">No income source data found.</div>
                ) : (
                  sources.map((source) => (
                    <div className="income-source-row" key={source.source}>
                      <div>
                        <div className="income-source-name">{sourceName(source.source)}</div>
                        <div className="income-small">{source.order_count || 0} paid records</div>
                      </div>
                      <div>
                        <div className="income-small">Gross Sales</div>
                        <div className="income-amount">{formatUsd(source.gross_sales_usd)}</div>
                      </div>
                      <div>
                        <div className="income-small">Platform Income</div>
                        <div className="income-amount">{formatUsd(source.platform_income_usd)}</div>
                      </div>
                      <div>
                        <div className="income-small">Author/Seller Earnings</div>
                        <div className="income-amount">{formatUsd(source.author_earnings_usd)}</div>
                      </div>
                      <div>
                        <div className="income-small">Pending Payout</div>
                        <div className="income-amount">{formatUsd(source.pending_payout_usd)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="income-panel">
                <div className="income-panel-head">
                  <div className="income-panel-title">Author Page Withdraw Status</div>
                  <div className="income-pill">{withdrawals.request_count || 0} requests</div>
                </div>

                <div className="income-source-row">
                  <div>
                    <div className="income-source-name">Withdraw Requests</div>
                    <div className="income-small">Only Author Page Book/PDF withdraws</div>
                  </div>
                  <div>
                    <div className="income-small">In Review</div>
                    <div className="income-amount">{formatUsd(withdrawals.in_review_usd)}</div>
                  </div>
                  <div>
                    <div className="income-small">Approved</div>
                    <div className="income-amount">{formatUsd(withdrawals.approved_usd)}</div>
                  </div>
                  <div>
                    <div className="income-small">Paid</div>
                    <div className="income-amount">{formatUsd(withdrawals.paid_usd)}</div>
                  </div>
                  <div>
                    <div className="income-small">Rejected</div>
                    <div className="income-amount">{formatUsd(withdrawals.rejected_usd)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
