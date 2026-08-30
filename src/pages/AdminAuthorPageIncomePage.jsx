import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 20

const styles = `
  .author-income-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .author-income-wrap {
    display: grid;
    gap: 18px;
  }

  .author-income-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .author-income-title {
    margin: 0;
    color: #0F172A;
    font-size: 40px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .author-income-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 700;
  }

  .author-income-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .author-income-input {
    height: 44px;
    border: 1px solid #D8E0F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .author-income-button {
    height: 44px;
    border: 1px solid #C7D2FE;
    border-radius: 14px;
    background: #FFFFFF;
    color: #4F46E5;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .author-income-button.primary {
    border: 0;
    background: linear-gradient(135deg, #4F46E5, #312E81);
    color: #FFFFFF;
  }

  .author-income-button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .author-income-summary {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  .author-income-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .author-income-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .author-income-card-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .author-income-card-sub {
    margin-top: 8px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .author-income-card-sub.good {
    color: #16A34A;
  }

  .author-income-card-sub.warn {
    color: #D97706;
  }

  .author-income-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .author-income-search {
    width: 100%;
    height: 46px;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .author-income-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .author-income-chip {
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .author-income-chip.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  .author-income-message {
    border: 1px solid #FDE68A;
    background: #FFFBEB;
    color: #92400E;
    border-radius: 16px;
    padding: 13px 15px;
    font-size: 12px;
    font-weight: 850;
  }

  .author-income-main {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) 380px;
    gap: 16px;
    align-items: start;
  }

  .author-income-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .author-income-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .author-income-panel-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .author-income-panel-sub {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .author-income-tabs {
    display: flex;
    gap: 6px;
    border-bottom: 1px solid #E2E8F0;
    padding: 0 12px;
  }

  .author-income-tab {
    border: 0;
    background: transparent;
    color: #64748B;
    padding: 13px 18px;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
    border-bottom: 3px solid transparent;
  }

  .author-income-tab.active {
    color: #4F46E5;
    border-bottom-color: #4F46E5;
  }

  .author-income-table-wrap {
    overflow-x: auto;
  }

  .author-income-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1120px;
  }

  .author-income-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
    padding: 14px 18px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
    white-space: nowrap;
  }

  .author-income-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
    vertical-align: top;
  }

  .author-income-table tbody tr {
    cursor: pointer;
  }

  .author-income-table tbody tr.active {
    background: #F5F3FF;
  }

  .author-income-name {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .author-income-small {
    margin-top: 3px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.45;
  }

  .author-income-money {
    font-weight: 950;
    white-space: nowrap;
  }

  .author-income-money.good {
    color: #16A34A;
  }

  .author-income-type,
  .author-income-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
  }

  .author-income-type {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .author-income-type.pdf {
    background: #DBEAFE;
    color: #2563EB;
  }

  .author-income-type.mixed {
    background: #F3E8FF;
    color: #7E22CE;
  }

  .author-income-status {
    background: #DCFCE7;
    color: #15803D;
  }

  .author-income-empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .author-income-detail {
    display: grid;
    gap: 18px;
    padding: 20px;
  }

  .author-income-section {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
    background: #FFFFFF;
  }

  .author-income-section-title {
    color: #4F46E5;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 12px;
  }

  .author-income-kv {
    display: grid;
    grid-template-columns: 125px 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .author-income-kv:last-child {
    margin-bottom: 0;
  }

  .author-income-k {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .author-income-v {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .author-income-v.good {
    color: #16A34A;
  }

  .author-income-list {
    display: grid;
    gap: 9px;
  }

  .author-income-list-item {
    padding: 10px 11px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
  }

  .author-income-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .author-income-pages {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .author-income-page-btn {
    height: 36px;
    min-width: 36px;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #475569;
    padding: 0 11px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .author-income-page-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  @media (max-width: 1380px) {
    .author-income-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .author-income-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .author-income-header,
    .author-income-tools {
      display: grid;
      grid-template-columns: 1fr;
    }

    .author-income-summary {
      grid-template-columns: 1fr;
    }

    .author-income-actions,
    .author-income-filters {
      justify-content: stretch;
    }

    .author-income-input,
    .author-income-button,
    .author-income-chip {
      width: 100%;
      box-sizing: border-box;
    }

    .author-income-tabs {
      overflow-x: auto;
    }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem(
      'shadow_admin_token'
    ) ||
    localStorage.getItem(
      'shadow_admin_token'
    )
  )
}

function authHeaders() {
  const token = getAdminToken()

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function inputDate(date) {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0')
  const day = String(
    date.getDate()
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function todayInput() {
  return inputDate(new Date())
}

function monthStartInput() {
  const date = new Date()

  return inputDate(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    )
  )
}

function daysAgoInput(days) {
  const date = new Date()

  date.setDate(
    date.getDate() - Math.max(0, days)
  )

  return inputDate(date)
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buyerName(item) {
  return (
    item?.buyer?.name ||
    item?.buyer?.username ||
    'Reader'
  )
}

function buyerUsername(item) {
  const username =
    item?.buyer?.username || ''

  return username
    ? `@${username.replace(/^@/, '')}`
    : item?.buyer?.email || '-'
}

function authorName(item) {
  return (
    item?.author?.page_name ||
    item?.author?.page_username ||
    'Author'
  )
}

function authorUsername(item) {
  const username =
    item?.author?.page_username || ''

  return username
    ? `@${username.replace(/^@/, '')}`
    : '-'
}

function typeLabel(type) {
  if (type === 'pdf') return 'PDF'
  if (type === 'book') return 'Book'
  if (type === 'mixed') return 'Mixed'

  return 'Order'
}

function csvCell(value) {
  const text = String(value ?? '')

  return `"${text.replace(/"/g, '""')}"`
}

export default function AdminAuthorPageIncomePage() {
  const [from, setFrom] =
    useState(monthStartInput())
  const [to, setTo] =
    useState(todayInput())
  const [search, setSearch] =
    useState('')
  const [type, setType] =
    useState('all')
  const [page, setPage] =
    useState(1)
  const [data, setData] =
    useState(null)
  const [loading, setLoading] =
    useState(true)
  const [message, setMessage] =
    useState('')
  const [selectedId, setSelectedId] =
    useState('')

  const transactions =
    data?.transactions || []
  const summary = data?.summary || {}
  const pagination =
    data?.pagination || {
      page: 1,
      total: 0,
      total_pages: 1,
      has_prev: false,
      has_next: false,
    }

  const selected = useMemo(
    () =>
      transactions.find(
        (item) => item.id === selectedId
      ) ||
      transactions[0] ||
      null,
    [transactions, selectedId]
  )

  async function fetchIncome(signal) {
    try {
      setLoading(true)
      setMessage('')

      const params =
        new URLSearchParams()

      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (search.trim()) {
        params.set('q', search.trim())
      }
      if (type !== 'all') {
        params.set('type', type)
      }

      params.set(
        'page',
        String(page)
      )
      params.set(
        'limit',
        String(PAGE_SIZE)
      )

      const response = await fetch(
        `${API_URL}/api/admin/income/author-page?${params.toString()}`,
        {
          headers: authHeaders(),
          signal,
        }
      )

      const result =
        await response.json().catch(
          () => ({})
        )

      if (
        !response.ok ||
        result.ok === false
      ) {
        throw new Error(
          result.message ||
            'Failed to load Author Page income'
        )
      }

      setData(result)

      const nextTransactions =
        result.transactions || []

      if (
        !nextTransactions.some(
          (item) =>
            item.id === selectedId
        )
      ) {
        setSelectedId(
          nextTransactions[0]?.id || ''
        )
      }

      if (
        result.truncated_source_scan
      ) {
        setMessage(
          'This date range is very large. Narrow the date filter if older records are missing.'
        )
      }
    } catch (error) {
      if (
        error.name === 'AbortError'
      ) {
        return
      }

      setData(null)
      setMessage(
        error.message ||
          'Failed to load Author Page income'
      )
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const controller =
      new AbortController()
    const timer = setTimeout(
      () =>
        fetchIncome(
          controller.signal
        ),
      search.trim() ? 300 : 0
    )

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [
    from,
    to,
    search,
    type,
    page,
  ])

  function applyRange(key) {
    if (key === 'today') {
      const today = todayInput()
      setFrom(today)
      setTo(today)
    } else if (key === '7d') {
      setFrom(daysAgoInput(6))
      setTo(todayInput())
    } else if (key === '30d') {
      setFrom(daysAgoInput(29))
      setTo(todayInput())
    } else if (key === 'month') {
      setFrom(monthStartInput())
      setTo(todayInput())
    }

    setPage(1)
  }

  const rangeKey = useMemo(() => {
    const today = todayInput()

    if (
      from === today &&
      to === today
    ) {
      return 'today'
    }

    if (
      from === daysAgoInput(6) &&
      to === today
    ) {
      return '7d'
    }

    if (
      from === daysAgoInput(29) &&
      to === today
    ) {
      return '30d'
    }

    if (
      from === monthStartInput() &&
      to === today
    ) {
      return 'month'
    }

    return ''
  }, [from, to])

  function exportCsv() {
    if (!transactions.length) return

    const rows = [
      [
        'Purchased At',
        'Buyer',
        'Buyer Username',
        'Product',
        'Type',
        'Author',
        'Product Total USD',
        'Delivery USD',
        'Total Paid USD',
        'Platform Fee USD',
        'Author Income USD',
        'Payment',
        'Order ID',
        'ABA Transaction ID',
      ],
      ...transactions.map(
        (item) => [
          formatDateTime(
            item.created_at
          ),
          buyerName(item),
          buyerUsername(item),
          item.product_title || '',
          typeLabel(
            item.order_type
          ),
          authorName(item),
          item.product_subtotal_usd ||
            0,
          item.delivery_fee_usd || 0,
          item.total_paid_usd || 0,
          item.platform_fee_usd || 0,
          item.author_income_usd || 0,
          item.payment_status || '',
          item.order_id || '',
          item.aba_transaction_id ||
            '',
        ]
      ),
    ]

    const csv = rows
      .map((row) =>
        row.map(csvCell).join(',')
      )
      .join('\n')
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8',
    })
    const url =
      URL.createObjectURL(blob)
    const anchor =
      document.createElement('a')

    anchor.href = url
    anchor.download =
      `author-page-income-${from}-to-${to}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="author-income-page">
        <div className="author-income-wrap">
          <div className="author-income-header">
            <div>
              <h1 className="author-income-title">
                Author Page Book/PDF
              </h1>
              <div className="author-income-subtitle">
                Real paid Book and PDF orders from Author Pages.
              </div>
            </div>

            <div className="author-income-actions">
              <input
                className="author-income-input"
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(
                    event.target.value
                  )
                  setPage(1)
                }}
              />
              <input
                className="author-income-input"
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(
                    event.target.value
                  )
                  setPage(1)
                }}
              />
              <button
                className="author-income-button"
                type="button"
                onClick={exportCsv}
                disabled={
                  !transactions.length
                }
              >
                Export
              </button>
              <button
                className="author-income-button primary"
                type="button"
                onClick={() =>
                  fetchIncome()
                }
                disabled={loading}
              >
                {loading
                  ? 'Loading...'
                  : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="author-income-summary">
            <div className="author-income-card">
              <div className="author-income-card-label">
                Gross Sales
              </div>
              <div className="author-income-card-value">
                {formatUsd(
                  summary.gross_sales_usd
                )}
              </div>
              <div className="author-income-card-sub">
                Paid product subtotal
              </div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">
                Platform Income
              </div>
              <div className="author-income-card-value">
                {formatUsd(
                  summary.platform_income_usd
                )}
              </div>
              <div className="author-income-card-sub">
                Actual stored platform fee
              </div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">
                Author Earnings
              </div>
              <div className="author-income-card-value">
                {formatUsd(
                  summary.author_earnings_usd
                )}
              </div>
              <div className="author-income-card-sub good">
                Actual stored author income
              </div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">
                Paid Orders
              </div>
              <div className="author-income-card-value">
                {summary.paid_orders || 0}
              </div>
              <div className="author-income-card-sub">
                Payment status paid
              </div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">
                Pending Author Payout
              </div>
              <div className="author-income-card-value">
                {formatUsd(
                  summary.pending_payout_usd
                )}
              </div>
              <div className="author-income-card-sub warn">
                In review + approved withdrawals
              </div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">
                Paid Out
              </div>
              <div className="author-income-card-value">
                {formatUsd(
                  summary.paid_out_usd
                )}
              </div>
              <div className="author-income-card-sub good">
                Paid withdrawals
              </div>
            </div>
          </div>

          <div className="author-income-tools">
            <input
              className="author-income-search"
              placeholder="Search buyer, product, author, order ID, or transaction ID..."
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                )
                setPage(1)
              }}
            />

            <div className="author-income-filters">
              <button
                type="button"
                className={`author-income-chip ${rangeKey === 'today' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('today')
                }
              >
                Today
              </button>
              <button
                type="button"
                className={`author-income-chip ${rangeKey === '7d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('7d')
                }
              >
                7D
              </button>
              <button
                type="button"
                className={`author-income-chip ${rangeKey === '30d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('30d')
                }
              >
                30D
              </button>
              <button
                type="button"
                className={`author-income-chip ${rangeKey === 'month' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('month')
                }
              >
                This Month
              </button>
            </div>
          </div>

          {message ? (
            <div className="author-income-message">
              {message}
            </div>
          ) : null}

          <div className="author-income-main">
            <section className="author-income-panel">
              <div className="author-income-panel-head">
                <div className="author-income-panel-title">
                  Author Page Orders
                </div>
                <div className="author-income-panel-sub">
                  {pagination.total || 0}{' '}
                  paid order(s)
                </div>
              </div>

              <div className="author-income-tabs">
                {[
                  ['all', 'All'],
                  ['book', 'Book'],
                  ['pdf', 'PDF'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`author-income-tab ${type === key ? 'active' : ''}`}
                    onClick={() => {
                      setType(key)
                      setPage(1)
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {loading &&
              !transactions.length ? (
                <div className="author-income-empty">
                  Loading Author Page orders...
                </div>
              ) : !transactions.length ? (
                <div className="author-income-empty">
                  No paid Author Page orders found.
                </div>
              ) : (
                <>
                  <div className="author-income-table-wrap">
                    <table className="author-income-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Buyer</th>
                          <th>Product</th>
                          <th>Type</th>
                          <th>Author</th>
                          <th>Product Total</th>
                          <th>Platform Fee</th>
                          <th>Author Income</th>
                          <th>Payment</th>
                        </tr>
                      </thead>

                      <tbody>
                        {transactions.map(
                          (item) => (
                            <tr
                              key={item.id}
                              className={
                                selected?.id ===
                                item.id
                                  ? 'active'
                                  : ''
                              }
                              onClick={() =>
                                setSelectedId(
                                  item.id
                                )
                              }
                            >
                              <td>
                                <div className="author-income-name">
                                  {formatDateTime(
                                    item.created_at
                                  )}
                                </div>
                                <div className="author-income-small">
                                  {item.order_id ||
                                    '-'}
                                </div>
                              </td>
                              <td>
                                <div className="author-income-name">
                                  {buyerName(
                                    item
                                  )}
                                </div>
                                <div className="author-income-small">
                                  {buyerUsername(
                                    item
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="author-income-name">
                                  {item.product_title ||
                                    'Order'}
                                </div>
                                <div className="author-income-small">
                                  {item.item_count ||
                                    0}{' '}
                                  item(s)
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`author-income-type ${item.order_type || ''}`}
                                >
                                  {typeLabel(
                                    item.order_type
                                  )}
                                </span>
                              </td>
                              <td>
                                <div className="author-income-name">
                                  {authorName(
                                    item
                                  )}
                                </div>
                                <div className="author-income-small">
                                  {authorUsername(
                                    item
                                  )}
                                </div>
                              </td>
                              <td className="author-income-money">
                                {formatUsd(
                                  item.product_subtotal_usd
                                )}
                              </td>
                              <td className="author-income-money">
                                {formatUsd(
                                  item.platform_fee_usd
                                )}
                              </td>
                              <td className="author-income-money good">
                                {formatUsd(
                                  item.author_income_usd
                                )}
                              </td>
                              <td>
                                <span className="author-income-status">
                                  {String(
                                    item.payment_status ||
                                      'paid'
                                  ).toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="author-income-pagination">
                    <div className="author-income-small">
                      Page{' '}
                      {pagination.page || 1}{' '}
                      of{' '}
                      {pagination.total_pages ||
                        1}
                    </div>

                    <div className="author-income-pages">
                      <button
                        className="author-income-page-btn"
                        type="button"
                        disabled={
                          !pagination.has_prev
                        }
                        onClick={() =>
                          setPage((value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                          )
                        }
                      >
                        Previous
                      </button>

                      <button
                        className="author-income-page-btn"
                        type="button"
                        disabled={
                          !pagination.has_next
                        }
                        onClick={() =>
                          setPage((value) =>
                            value + 1
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            <aside className="author-income-panel">
              <div className="author-income-panel-head">
                <div className="author-income-panel-title">
                  Order Detail
                </div>
                <div className="author-income-panel-sub">
                  {selected
                    ? selected.order_id
                    : 'No order selected'}
                </div>
              </div>

              {!selected ? (
                <div className="author-income-empty">
                  Select an order.
                </div>
              ) : (
                <div className="author-income-detail">
                  <div className="author-income-section">
                    <div className="author-income-section-title">
                      Overview
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Purchased At
                      </div>
                      <div className="author-income-v">
                        {formatDateTime(
                          selected.created_at
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Payment
                      </div>
                      <div className="author-income-v">
                        {String(
                          selected.payment_status ||
                            'paid'
                        ).toUpperCase()}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Order Status
                      </div>
                      <div className="author-income-v">
                        {selected.order_status ||
                          '-'}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Order ID
                      </div>
                      <div className="author-income-v">
                        {selected.order_id ||
                          '-'}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Transaction
                      </div>
                      <div className="author-income-v">
                        {selected.aba_transaction_id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="author-income-section">
                    <div className="author-income-section-title">
                      Buyer
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Name
                      </div>
                      <div className="author-income-v">
                        {buyerName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Username
                      </div>
                      <div className="author-income-v">
                        {buyerUsername(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        User ID
                      </div>
                      <div className="author-income-v">
                        {selected.buyer?.id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="author-income-section">
                    <div className="author-income-section-title">
                      Products
                    </div>
                    <div className="author-income-list">
                      {(selected.items || [])
                        .length ? (
                        selected.items.map(
                          (item) => (
                            <div
                              className="author-income-list-item"
                              key={
                                item.id ||
                                item.product_id ||
                                item.title
                              }
                            >
                              <div className="author-income-name">
                                {item.title}
                              </div>
                              <div className="author-income-small">
                                {typeLabel(
                                  item.product_type
                                )}{' '}
                                × {item.quantity}
                              </div>
                              <div className="author-income-small">
                                {formatUsd(
                                  item.unit_price_usd
                                )}{' '}
                                each ·{' '}
                                {formatUsd(
                                  item.total_usd
                                )}
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="author-income-small">
                          No item detail.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="author-income-section">
                    <div className="author-income-section-title">
                      Author
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Name
                      </div>
                      <div className="author-income-v">
                        {authorName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Username
                      </div>
                      <div className="author-income-v">
                        {authorUsername(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Author ID
                      </div>
                      <div className="author-income-v">
                        {selected.author?.id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="author-income-section">
                    <div className="author-income-section-title">
                      Payment & Amount
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Product Subtotal
                      </div>
                      <div className="author-income-v">
                        {formatUsd(
                          selected.product_subtotal_usd
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Delivery
                      </div>
                      <div className="author-income-v">
                        {formatUsd(
                          selected.delivery_fee_usd
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Total Paid
                      </div>
                      <div className="author-income-v">
                        {formatUsd(
                          selected.total_paid_usd
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="author-income-section">
                    <div className="author-income-section-title">
                      Revenue Breakdown
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Platform Fee
                      </div>
                      <div className="author-income-v">
                        {formatUsd(
                          selected.platform_fee_usd
                        )}
                      </div>
                    </div>
                    <div className="author-income-kv">
                      <div className="author-income-k">
                        Author Income
                      </div>
                      <div className="author-income-v good">
                        {formatUsd(
                          selected.author_income_usd
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
