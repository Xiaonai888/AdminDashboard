import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import useAdminIncomeEventRefreshKey from '../hooks/useAdminIncomeEventRefreshKey'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 20

const styles = `
  .mall-income-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .mall-income-wrap {
    display: grid;
    gap: 18px;
  }

  .mall-income-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .mall-income-back {
  border: 0;
  background: transparent;
  color: #4F46E5;
  padding: 0;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

  .mall-income-title {
    margin: 0;
    color: #0F172A;
    font-size: 40px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .mall-income-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 700;
  }

  .mall-income-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .mall-income-input {
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

  .mall-income-button {
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

  .mall-income-button.primary {
    border: 0;
    background: linear-gradient(135deg, #4F46E5, #312E81);
    color: #FFFFFF;
  }

  .mall-income-button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .mall-income-summary {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  .mall-income-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .mall-income-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .mall-income-card-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .mall-income-card-sub {
    margin-top: 8px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .mall-income-card-sub.good {
    color: #16A34A;
  }

  .mall-income-card-sub.warn {
    color: #D97706;
  }

  .mall-income-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .mall-income-search {
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

  .mall-income-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .mall-income-chip,
  .mall-income-select {
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    outline: none;
  }

  .mall-income-chip.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  .mall-income-message {
    border: 1px solid #FDE68A;
    background: #FFFBEB;
    color: #92400E;
    border-radius: 16px;
    padding: 13px 15px;
    font-size: 12px;
    font-weight: 850;
  }

  .mall-income-main {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) 380px;
    gap: 16px;
    align-items: start;
  }

  .mall-income-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .mall-income-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .mall-income-panel-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .mall-income-panel-sub {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .mall-income-table-wrap {
    overflow-x: auto;
  }

  .mall-income-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1160px;
  }

  .mall-income-table th {
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

  .mall-income-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
    vertical-align: top;
  }

  .mall-income-table tbody tr {
    cursor: pointer;
  }

  .mall-income-table tbody tr.active {
    background: #F5F3FF;
  }

  .mall-income-name {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .mall-income-small {
    margin-top: 3px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.45;
  }

  .mall-income-money {
    font-weight: 950;
    white-space: nowrap;
  }

  .mall-income-money.good {
    color: #16A34A;
  }

  .mall-income-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
    background: #F1F5F9;
    color: #64748B;
  }

  .mall-income-status.under_review {
    background: #FEF3C7;
    color: #92400E;
  }

  .mall-income-status.confirmed {
    background: #DBEAFE;
    color: #1D4ED8;
  }

  .mall-income-status.preparing {
    background: #F3E8FF;
    color: #7E22CE;
  }

  .mall-income-status.shipped {
    background: #DCFCE7;
    color: #15803D;
  }

  .mall-income-status.completed {
    background: #D1FAE5;
    color: #047857;
  }

  .mall-income-empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .mall-income-detail {
    display: grid;
    gap: 18px;
    padding: 20px;
  }

  .mall-income-section {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
    background: #FFFFFF;
  }

  .mall-income-section-title {
    color: #4F46E5;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 12px;
  }

  .mall-income-kv {
    display: grid;
    grid-template-columns: 125px 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .mall-income-kv:last-child {
    margin-bottom: 0;
  }

  .mall-income-k {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .mall-income-v {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .mall-income-v.good {
    color: #16A34A;
  }

  .mall-income-list {
    display: grid;
    gap: 9px;
  }

  .mall-income-list-item {
    padding: 10px 11px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
  }

  .mall-income-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .mall-income-pages {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .mall-income-page-btn {
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

  .mall-income-page-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  @media (max-width: 1380px) {
    .mall-income-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .mall-income-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .mall-income-header,
    .mall-income-tools {
      display: grid;
      grid-template-columns: 1fr;
    }

    .mall-income-summary {
      grid-template-columns: 1fr;
    }

    .mall-income-actions,
    .mall-income-filters {
      justify-content: stretch;
    }

    .mall-income-input,
    .mall-income-button,
    .mall-income-chip,
    .mall-income-select {
      width: 100%;
      box-sizing: border-box;
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

function statusText(status) {
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    )
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

function deliveryName(item) {
  return (
    item?.delivery?.short_name ||
    item?.delivery?.name ||
    '-'
  )
}

function csvCell(value) {
  const text = String(value ?? '')

  return `"${text.replace(/"/g, '""')}"`
}

export default function AdminShadowMallIncomePage() {
  const navigate = useNavigate()
  const [from, setFrom] =
    useState(monthStartInput())
  const [to, setTo] =
    useState(todayInput())
  const [search, setSearch] =
    useState('')
  const [searchQuery, setSearchQuery] =
    useState('')
  const [status, setStatus] =
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
  const eventRefreshKey =
    useAdminIncomeEventRefreshKey(
      API_URL,
      'shadow_mall'
    )

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
      if (searchQuery) {
        params.set('q', searchQuery)
      }
      if (status !== 'all') {
        params.set('status', status)
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
        `${API_URL}/api/admin/income/shadow-mall?${params.toString()}`,
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
            'Failed to load Shadow Mall income'
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
          'Failed to load Shadow Mall income'
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

    fetchIncome(
      controller.signal
    )

    return () => {
      controller.abort()
    }
  }, [
    from,
    to,
    searchQuery,
    status,
    page,
    eventRefreshKey,
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
        'Created At',
        'Buyer',
        'Buyer Username',
        'Product',
        'Publisher',
        'Quantity',
        'Product Total USD',
        'Shipping USD',
        'Total Paid USD',
        'Platform Income USD',
        'Status',
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
          item.publisher || '',
          item.quantity || 0,
          item.subtotal_usd || 0,
          item.delivery_fee_usd || 0,
          item.total_paid_usd || 0,
          item.platform_income_usd ||
            0,
          statusText(item.status),
          'Paid',
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
      `shadow-mall-income-${from}-to-${to}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="mall-income-page">
        <div className="mall-income-wrap">
          <div className="mall-income-header">
  <div>
    <button
      className="mall-income-back"
      type="button"
      onClick={() => navigate('/income')}
    >
      ← Back to Income
    </button>
    <h1 className="mall-income-title">
      Shadow Mall
    </h1>
              <div className="mall-income-subtitle">
                Real paid product orders. Shipping is excluded from platform income.
              </div>
            </div>

            <div className="mall-income-actions">
              <input
                className="mall-income-input"
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
                className="mall-income-input"
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
                className="mall-income-button"
                type="button"
                onClick={exportCsv}
                disabled={
                  !transactions.length
                }
              >
                Export
              </button>
              <button
                className="mall-income-button primary"
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

          <div className="mall-income-summary">
            <div className="mall-income-card">
              <div className="mall-income-card-label">
                Gross Product Sales
              </div>
              <div className="mall-income-card-value">
                {formatUsd(
                  summary.gross_product_sales_usd
                )}
              </div>
              <div className="mall-income-card-sub">
                Shipping excluded
              </div>
            </div>

            <div className="mall-income-card">
              <div className="mall-income-card-label">
                Platform Income
              </div>
              <div className="mall-income-card-value">
                {formatUsd(
                  summary.platform_income_usd
                )}
              </div>
              <div className="mall-income-card-sub good">
                Product sales only
              </div>
            </div>

            <div className="mall-income-card">
              <div className="mall-income-card-label">
                Shipping Collected
              </div>
              <div className="mall-income-card-value">
                {formatUsd(
                  summary.shipping_collected_usd
                )}
              </div>
              <div className="mall-income-card-sub warn">
                Excluded from platform income
              </div>
            </div>

            <div className="mall-income-card">
              <div className="mall-income-card-label">
                Total Orders
              </div>
              <div className="mall-income-card-value">
                {summary.total_orders || 0}
              </div>
              <div className="mall-income-card-sub">
                Paid order records
              </div>
            </div>

            <div className="mall-income-card">
              <div className="mall-income-card-label">
                Completed Orders
              </div>
              <div className="mall-income-card-value">
                {summary.completed_orders ||
                  0}
              </div>
              <div className="mall-income-card-sub good">
                Completed
              </div>
            </div>

            <div className="mall-income-card">
              <div className="mall-income-card-label">
                Active Orders
              </div>
              <div className="mall-income-card-value">
                {summary.active_orders || 0}
              </div>
              <div className="mall-income-card-sub">
                Review to shipped
              </div>
            </div>
          </div>

          <div className="mall-income-tools">
            <input
              className="mall-income-search"
              placeholder="Search buyer, product, publisher, order ID, or transaction ID..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return

                const nextSearch =
                  search.trim()

                if (
                  nextSearch === searchQuery &&
                  page === 1
                ) {
                  fetchIncome()
                  return
                }

                setSearchQuery(nextSearch)
                setPage(1)
              }}
            />

            <div className="mall-income-filters">
              <button
                type="button"
                className={`mall-income-chip ${rangeKey === 'today' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('today')
                }
              >
                Today
              </button>
              <button
                type="button"
                className={`mall-income-chip ${rangeKey === '7d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('7d')
                }
              >
                7D
              </button>
              <button
                type="button"
                className={`mall-income-chip ${rangeKey === '30d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('30d')
                }
              >
                30D
              </button>
              <button
                type="button"
                className={`mall-income-chip ${rangeKey === 'month' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('month')
                }
              >
                This Month
              </button>

              <select
                className="mall-income-select"
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target.value
                  )
                  setPage(1)
                }}
              >
                <option value="all">
                  All Status
                </option>
                <option value="under_review">
                  Under Review
                </option>
                <option value="confirmed">
                  Confirmed
                </option>
                <option value="preparing">
                  Preparing
                </option>
                <option value="shipped">
                  Shipped
                </option>
                <option value="completed">
                  Completed
                </option>
              </select>
            </div>
          </div>

          {message ? (
            <div className="mall-income-message">
              {message}
            </div>
          ) : null}

          <div className="mall-income-main">
            <section className="mall-income-panel">
              <div className="mall-income-panel-head">
                <div className="mall-income-panel-title">
                  Shadow Mall Orders
                </div>
                <div className="mall-income-panel-sub">
                  {pagination.total || 0}{' '}
                  paid order(s)
                </div>
              </div>

              {loading &&
              !transactions.length ? (
                <div className="mall-income-empty">
                  Loading Shadow Mall orders...
                </div>
              ) : !transactions.length ? (
                <div className="mall-income-empty">
                  No paid Shadow Mall orders found.
                </div>
              ) : (
                <>
                  <div className="mall-income-table-wrap">
                    <table className="mall-income-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Buyer</th>
                          <th>Product</th>
                          <th>Publisher</th>
                          <th>Qty</th>
                          <th>Product Total</th>
                          <th>Shipping</th>
                          <th>Order Status</th>
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
                                <div className="mall-income-name">
                                  {formatDateTime(
                                    item.created_at
                                  )}
                                </div>
                                <div className="mall-income-small">
                                  {item.order_id ||
                                    '-'}
                                </div>
                              </td>
                              <td>
                                <div className="mall-income-name">
                                  {buyerName(
                                    item
                                  )}
                                </div>
                                <div className="mall-income-small">
                                  {buyerUsername(
                                    item
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="mall-income-name">
                                  {item.product_title ||
                                    'Order'}
                                </div>
                                <div className="mall-income-small">
                                  {item.item_count ||
                                    0}{' '}
                                  item(s)
                                </div>
                              </td>
                              <td>
                                <div className="mall-income-name">
                                  {item.publisher ||
                                    '-'}
                                </div>
                              </td>
                              <td>
                                {item.quantity || 0}
                              </td>
                              <td className="mall-income-money good">
                                {formatUsd(
                                  item.subtotal_usd
                                )}
                              </td>
                              <td className="mall-income-money">
                                {formatUsd(
                                  item.delivery_fee_usd
                                )}
                              </td>
                              <td>
                                <span
                                  className={`mall-income-status ${item.status || ''}`}
                                >
                                  {statusText(
                                    item.status
                                  )}
                                </span>
                              </td>
                              <td>
                                <span className="mall-income-status completed">
                                  Paid
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mall-income-pagination">
                    <div className="mall-income-small">
                      Page{' '}
                      {pagination.page || 1}{' '}
                      of{' '}
                      {pagination.total_pages ||
                        1}
                    </div>

                    <div className="mall-income-pages">
                      <button
                        className="mall-income-page-btn"
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
                        className="mall-income-page-btn"
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

            <aside className="mall-income-panel">
              <div className="mall-income-panel-head">
                <div className="mall-income-panel-title">
                  Order Detail
                </div>
                <div className="mall-income-panel-sub">
                  {selected
                    ? selected.order_id
                    : 'No order selected'}
                </div>
              </div>

              {!selected ? (
                <div className="mall-income-empty">
                  Select an order.
                </div>
              ) : (
                <div className="mall-income-detail">
                  <div className="mall-income-section">
                    <div className="mall-income-section-title">
                      Overview
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Created At
                      </div>
                      <div className="mall-income-v">
                        {formatDateTime(
                          selected.created_at
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Paid At
                      </div>
                      <div className="mall-income-v">
                        {formatDateTime(
                          selected.paid_at
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Status
                      </div>
                      <div className="mall-income-v">
                        {statusText(
                          selected.status
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Order ID
                      </div>
                      <div className="mall-income-v">
                        {selected.order_id ||
                          '-'}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Transaction
                      </div>
                      <div className="mall-income-v">
                        {selected.aba_transaction_id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="mall-income-section">
                    <div className="mall-income-section-title">
                      Buyer
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Name
                      </div>
                      <div className="mall-income-v">
                        {buyerName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Username
                      </div>
                      <div className="mall-income-v">
                        {buyerUsername(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        User ID
                      </div>
                      <div className="mall-income-v">
                        {selected.buyer?.id ||
                          '-'}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Phone
                      </div>
                      <div className="mall-income-v">
                        {selected.buyer
                          ?.phone || '-'}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Province
                      </div>
                      <div className="mall-income-v">
                        {selected.buyer
                          ?.province_city ||
                          '-'}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Address
                      </div>
                      <div className="mall-income-v">
                        {selected.buyer
                          ?.delivery_address ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="mall-income-section">
                    <div className="mall-income-section-title">
                      Products
                    </div>
                    <div className="mall-income-list">
                      {(selected.items || [])
                        .length ? (
                        selected.items.map(
                          (item) => (
                            <div
                              className="mall-income-list-item"
                              key={
                                item.product_id ||
                                item.title
                              }
                            >
                              <div className="mall-income-name">
                                {item.title}
                              </div>
                              <div className="mall-income-small">
                                {item.author_name ||
                                  'Author'}
                              </div>
                              <div className="mall-income-small">
                                {item.publisher ||
                                  'No publisher'}{' '}
                                · {item.quantity} ×{' '}
                                {formatUsd(
                                  item.unit_price_usd
                                )}
                              </div>
                              <div className="mall-income-small">
                                Total{' '}
                                {formatUsd(
                                  item.total_usd
                                )}
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="mall-income-small">
                          No item detail.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mall-income-section">
                    <div className="mall-income-section-title">
                      Payment & Amount
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Product Total
                      </div>
                      <div className="mall-income-v good">
                        {formatUsd(
                          selected.subtotal_usd
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Shipping
                      </div>
                      <div className="mall-income-v">
                        {formatUsd(
                          selected.delivery_fee_usd
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Total Paid
                      </div>
                      <div className="mall-income-v">
                        {formatUsd(
                          selected.total_paid_usd
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Platform Income
                      </div>
                      <div className="mall-income-v good">
                        {formatUsd(
                          selected.platform_income_usd
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mall-income-section">
                    <div className="mall-income-section-title">
                      Shipping
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Company
                      </div>
                      <div className="mall-income-v">
                        {deliveryName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="mall-income-kv">
                      <div className="mall-income-k">
                        Delivery Note
                      </div>
                      <div className="mall-income-v">
                        {selected.buyer
                          ?.delivery_note ||
                          '-'}
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
