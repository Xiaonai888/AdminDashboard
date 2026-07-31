import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .income-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .income-wrap {
    display: grid;
    gap: 18px;
  }

  .income-hero {
    background: linear-gradient(135deg, #111827, #312E81);
    color: #FFFFFF;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
  }

  .income-hero-top {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }

  .income-kicker {
    display: inline-flex;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 950;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .income-title {
    margin: 0;
    font-size: 32px;
    font-weight: 950;
    letter-spacing: -0.05em;
  }

  .income-subtitle {
    color: rgba(255, 255, 255, 0.72);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.7;
    margin-top: 8px;
    max-width: 720px;
  }

  .income-filter {
    display: grid;
    grid-template-columns: 160px 160px 110px;
    gap: 10px;
    align-items: center;
  }

  .income-input {
    height: 42px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 900;
    outline: none;
  }

  .income-input::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }

  .income-button {
    height: 42px;
    border: 0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #312E81;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
  }

  .income-rule-strip {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .income-rule {
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .income-rule-label {
    color: rgba(255, 255, 255, 0.62);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .income-rule-value {
    margin-top: 4px;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 950;
  }

  .income-main-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 16px;
  }

  .income-main-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 26px;
    padding: 22px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.045);
  }

  .income-main-card.primary {
    border-color: #C7D2FE;
    background: linear-gradient(180deg, #FFFFFF, #F8FAFF);
  }

  .income-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .income-card-value {
    color: #0F172A;
    font-size: 34px;
    font-weight: 950;
    letter-spacing: -0.05em;
    margin-top: 10px;
  }

  .income-card-sub {
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.6;
    margin-top: 8px;
  }

  .income-mini-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .income-mini-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 16px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.035);
  }

  .income-mini-value {
    color: #0F172A;
    font-size: 22px;
    font-weight: 950;
    letter-spacing: -0.04em;
    margin-top: 8px;
  }

  .income-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 26px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
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
    font-weight: 950;
    color: #0F172A;
  }

  .income-pill {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 950;
  }

  .income-message {
    border-radius: 16px;
    padding: 13px 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 900;
  }

  .income-empty {
    padding: 46px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 950;
  }

  .income-table {
    width: 100%;
    border-collapse: collapse;
  }

  .income-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .04em;
    padding: 13px 20px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }

  .income-table td {
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 850;
    vertical-align: top;
  }

  .income-table tr:last-child td {
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
    font-weight: 750;
    line-height: 1.6;
    margin-top: 4px;
  }

  .income-money {
    font-size: 15px;
    font-weight: 950;
    color: #0F172A;
  }

  .income-withdraw-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 170px;
    gap: 12px;
    padding: 18px 20px;
    align-items: center;
  }

  .income-withdraw-item {
    border-radius: 18px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    padding: 13px;
  }

  .income-withdraw-action {
    height: 44px;
    border: 0;
    border-radius: 15px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
  }

  @media (max-width: 1180px) {
    .income-page,
    .income-wrap {
      min-width: 0;
    }

    .income-hero-top {
      display: grid;
    }

    .income-main-grid,
    .income-mini-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .income-rule-strip,
    .income-withdraw-grid {
      grid-template-columns: 1fr 1fr;
    }

    .income-filter {
      grid-template-columns: 1fr 1fr 110px;
    }
  }

  @media (max-width: 760px) {
    .income-wrap {
      gap: 14px;
    }

    .income-hero {
      min-width: 0;
      border-radius: 22px;
      padding: 18px 16px;
    }

    .income-hero-top > div {
      min-width: 0;
    }

    .income-title {
      font-size: 26px;
      overflow-wrap: anywhere;
    }

    .income-subtitle,
    .income-rule-value,
    .income-card-label,
    .income-card-sub,
    .income-message,
    .income-small,
    .income-panel-title {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .income-filter,
    .income-main-grid,
    .income-mini-grid,
    .income-rule-strip,
    .income-withdraw-grid {
      grid-template-columns: 1fr;
    }

    .income-filter {
      width: 100%;
    }

    .income-input,
    .income-button,
    .income-withdraw-action {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .income-main-card,
    .income-mini-card {
      min-width: 0;
      border-radius: 20px;
      padding: 16px;
    }

    .income-card-value {
      font-size: 28px;
      overflow-wrap: anywhere;
    }

    .income-mini-value {
      font-size: 21px;
      overflow-wrap: anywhere;
    }

    .income-panel {
      min-width: 0;
      border-radius: 20px;
      overflow: hidden;
    }

    .income-panel-head {
      align-items: flex-start;
      padding: 15px;
    }

    .income-panel-head > div {
      min-width: 0;
    }

    .income-pill {
      flex-shrink: 0;
      max-width: 48%;
      text-align: center;
      overflow-wrap: anywhere;
    }

    .income-panel > .income-table {
      display: block;
      width: 100%;
      min-width: 0;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
    }

    .income-panel > .income-table thead,
    .income-panel > .income-table tbody {
      display: table;
      width: 760px;
      table-layout: fixed;
    }

    .income-table th,
    .income-table td {
      padding-left: 14px;
      padding-right: 14px;
    }

    .income-source-name,
    .income-money {
      overflow-wrap: anywhere;
    }

    .income-withdraw-grid {
      padding: 14px;
    }

    .income-withdraw-item {
      min-width: 0;
    }

    .income-empty {
      padding: 40px 16px;
      overflow-wrap: anywhere;
    }
  }

  @media (max-width: 420px) {
    .income-hero {
      padding-left: 14px;
      padding-right: 14px;
    }

    .income-kicker {
      max-width: 100%;
      overflow-wrap: anywhere;
    }

    .income-panel-head {
      flex-direction: column;
    }

    .income-pill {
      max-width: 100%;
    }

    .income-card-value {
      font-size: 25px;
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

function findSource(sources, name) {
  return (sources || []).find((source) => source.source === name) || {}
}

export default function AdminIncomePage() {
  const navigate = useNavigate()
  const [from, setFrom] = useState(getMonthStartInputValue())
  const [to, setTo] = useState(getTodayInputValue())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const summary = data?.summary || {}
  const sources = data?.sources || []
  const withdrawals = data?.withdrawals || {}
  const authorStore = findSource(sources, 'author_store')

  const mainCards = useMemo(() => [
    {
      label: 'Net Platform Income',
      value: formatUsd(summary.net_platform_income_usd),
      sub: 'Real admin income after current rules',
      primary: true,
    },
    {
      label: 'Gross Sales',
      value: formatUsd(summary.gross_sales_usd),
      sub: `${summary.total_orders || 0} paid records`,
    },
    {
      label: 'Pending Author Payout',
      value: formatUsd(summary.pending_payout_usd),
      sub: 'Author money not counted as platform income',
    },
  ], [summary])

  const miniCards = useMemo(() => [
    {
      label: 'Shadow Mall',
      value: formatUsd(summary.shadow_mall_income_usd),
      sub: `Shipping excluded: ${formatUsd(summary.shipping_fee_excluded_usd)}`,
    },
    {
      label: 'Author Page 10%',
      value: formatUsd(summary.author_store_income_usd),
      sub: `${authorStore.order_count || 0} paid records`,
    },
    {
      label: 'Episode Author Payout',
      value: formatUsd(summary.episode_author_payout_usd),
      sub: 'Author gets 100%',
    },
    {
      label: 'Episode Platform Income',
      value: formatUsd(summary.episode_platform_income_usd),
      sub: 'Should stay $0',
    },
  ], [summary, authorStore.order_count])

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
    <AdminLayout title="Income" subtitle="Finance & Growth">
      <style>{styles}</style>

      <div className="income-page">
        <div className="income-wrap">
          <section className="income-hero">
            <div className="income-hero-top">
              <div>
                <div className="income-kicker">Professional Finance View</div>
                <h1 className="income-title">Income Overview</h1>
                <div className="income-subtitle">
                  Focus on real platform income first. Author earnings and shipping fees are shown separately so they do not inflate admin profit.
                </div>
              </div>

              <div className="income-filter">
                <input className="income-input" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                <input className="income-input" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                <button className="income-button" type="button" onClick={fetchIncome}>Refresh</button>
              </div>
            </div>

            <div className="income-rule-strip">
              <div className="income-rule">
                <div className="income-rule-label">Episode Sales</div>
                <div className="income-rule-value">Author 100% · Platform $0</div>
              </div>
              <div className="income-rule">
                <div className="income-rule-label">Author Page</div>
                <div className="income-rule-value">Platform 10% · Author 90%</div>
              </div>
              <div className="income-rule">
                <div className="income-rule-label">Shadow Mall</div>
                <div className="income-rule-value">Admin 100% · Shipping excluded</div>
              </div>
            </div>
          </section>

          {message ? <div className="income-message">{message}</div> : null}

          {loading ? (
            <div className="income-panel">
              <div className="income-empty">Loading income...</div>
            </div>
          ) : (
            <>
              <section className="income-main-grid">
                {mainCards.map((card) => (
                  <div className={`income-main-card ${card.primary ? 'primary' : ''}`} key={card.label}>
                    <div className="income-card-label">{card.label}</div>
                    <div className="income-card-value">{card.value}</div>
                    <div className="income-card-sub">{card.sub}</div>
                  </div>
                ))}
              </section>

              <section className="income-mini-grid">
                {miniCards.map((card) => (
                  <div className="income-mini-card" key={card.label}>
                    <div className="income-card-label">{card.label}</div>
                    <div className="income-mini-value">{card.value}</div>
                    <div className="income-card-sub">{card.sub}</div>
                  </div>
                ))}
              </section>

              <section className="income-panel">
                <div className="income-panel-head">
                  <div className="income-panel-title">Source Breakdown</div>
                  <div className="income-pill">{sources.length} sources</div>
                </div>

                {sources.length === 0 ? (
                  <div className="income-empty">No source data found.</div>
                ) : (
                  <table className="income-table">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th>Gross</th>
                        <th>Platform Income</th>
                        <th>Author Earnings</th>
                        <th>Pending Payout</th>
                        <th>Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((source) => (
                        <tr key={source.source}>
                          <td>
                            <div className="income-source-name">{sourceName(source.source)}</div>
                            <div className="income-small">
                              {source.source === 'shadow_mall'
                                ? `Shipping excluded: ${formatUsd(source.shipping_fee_usd)}`
                                : source.source === 'episode_sales'
                                  ? 'Author payout only'
                                  : 'Platform 10% fee'}
                            </div>
                          </td>
                          <td><div className="income-money">{formatUsd(source.gross_sales_usd)}</div></td>
                          <td><div className="income-money">{formatUsd(source.platform_income_usd)}</div></td>
                          <td><div className="income-money">{formatUsd(source.author_earnings_usd)}</div></td>
                          <td><div className="income-money">{formatUsd(source.pending_payout_usd)}</div></td>
                          <td><div className="income-money">{source.order_count || 0}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className="income-panel">
                <div className="income-panel-head">
                  <div className="income-panel-title">Withdraw Snapshot</div>
                  <div className="income-pill">{withdrawals.request_count || 0} requests</div>
                </div>

                <div className="income-withdraw-grid">
                  <div className="income-withdraw-item">
                    <div className="income-card-label">In Review</div>
                    <div className="income-mini-value">{formatUsd(withdrawals.in_review_usd)}</div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">Approved</div>
                    <div className="income-mini-value">{formatUsd(withdrawals.approved_usd)}</div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">Paid</div>
                    <div className="income-mini-value">{formatUsd(withdrawals.paid_usd)}</div>
                  </div>
                  <div className="income-withdraw-item">
                    <div className="income-card-label">Rejected</div>
                    <div className="income-mini-value">{formatUsd(withdrawals.rejected_usd)}</div>
                  </div>
                  <button className="income-withdraw-action" type="button" onClick={() => navigate('/withdraw')}>
                    Open Withdraw
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
