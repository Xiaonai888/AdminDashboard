import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 20

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const CACHE_PREFIX =
  'shadow_admin_income_diamond_gifts:'

function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const cached = JSON.parse(raw)
    if (
      !cached?.saved_at ||
      Date.now() - cached.saved_at >=
        CACHE_TTL_MS
    ) {
      localStorage.removeItem(key)
      return null
    }

    return cached.data || null
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        saved_at: Date.now(),
        data,
      })
    )
  } catch {
    return
  }
}

const styles = `
  .diamond-gifts-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .diamond-gifts-wrap {
    display: grid;
    gap: 18px;
  }

  .diamond-gifts-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .diamond-gifts-back {
    border: 0;
    background: transparent;
    color: #4F46E5;
    padding: 0;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .diamond-gifts-title {
    margin: 0;
    color: #0F172A;
    font-size: 40px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .diamond-gifts-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 700;
  }

  .diamond-gifts-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .diamond-gifts-input {
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

  .diamond-gifts-button {
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

  .diamond-gifts-button.primary {
    border: 0;
    background: linear-gradient(135deg, #4F46E5, #312E81);
    color: #FFFFFF;
  }

  .diamond-gifts-button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .diamond-gifts-summary {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  .diamond-gifts-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .diamond-gifts-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .diamond-gifts-card-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .diamond-gifts-card-sub {
    margin-top: 8px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .diamond-gifts-card-sub.good {
    color: #16A34A;
  }

  .diamond-gifts-card-sub.warn {
    color: #D97706;
  }

  .diamond-gifts-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .diamond-gifts-search {
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

  .diamond-gifts-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .diamond-gifts-chip,
  .diamond-gifts-select {
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

  .diamond-gifts-chip.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  .diamond-gifts-message {
    border: 1px solid #FDE68A;
    background: #FFFBEB;
    color: #92400E;
    border-radius: 16px;
    padding: 13px 15px;
    font-size: 12px;
    font-weight: 850;
  }

  .diamond-gifts-main {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) 380px;
    gap: 16px;
    align-items: start;
  }

  .diamond-gifts-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .diamond-gifts-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .diamond-gifts-panel-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .diamond-gifts-panel-sub {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .diamond-gifts-table-wrap {
    overflow-x: auto;
  }

  .diamond-gifts-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1120px;
  }

  .diamond-gifts-table th {
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

  .diamond-gifts-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
    vertical-align: top;
  }

  .diamond-gifts-table tbody tr {
    cursor: pointer;
  }

  .diamond-gifts-table tbody tr.active {
    background: #F5F3FF;
  }

  .diamond-gifts-name {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .diamond-gifts-small {
    margin-top: 3px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.45;
  }

  .diamond-gifts-money {
    font-weight: 950;
    white-space: nowrap;
  }

  .diamond-gifts-money.good {
    color: #16A34A;
  }

  .diamond-gifts-status {
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

  .diamond-gifts-status.pending {
    background: #FEF3C7;
    color: #B45309;
  }

  .diamond-gifts-status.available {
    background: #DBEAFE;
    color: #2563EB;
  }

  .diamond-gifts-status.paid {
    background: #DCFCE7;
    color: #15803D;
  }

  .diamond-gifts-empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .diamond-gifts-detail {
    display: grid;
    gap: 18px;
    padding: 20px;
  }

  .diamond-gifts-section {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
    background: #FFFFFF;
  }

  .diamond-gifts-section-title {
    color: #4F46E5;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 12px;
  }

  .diamond-gifts-kv {
    display: grid;
    grid-template-columns: 125px 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .diamond-gifts-kv:last-child {
    margin-bottom: 0;
  }

  .diamond-gifts-k {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .diamond-gifts-v {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .diamond-gifts-v.good {
    color: #16A34A;
  }

  .diamond-gifts-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .diamond-gifts-pages {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .diamond-gifts-page-btn {
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

  .diamond-gifts-page-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  @media (max-width: 1380px) {
    .diamond-gifts-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .diamond-gifts-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .diamond-gifts-header,
    .diamond-gifts-tools {
      display: grid;
      grid-template-columns: 1fr;
    }

    .diamond-gifts-summary {
      grid-template-columns: 1fr;
    }

    .diamond-gifts-actions,
    .diamond-gifts-filters {
      justify-content: stretch;
    }

    .diamond-gifts-input,
    .diamond-gifts-button,
    .diamond-gifts-chip,
    .diamond-gifts-select {
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

function senderName(item) {
  return (
    item?.buyer?.name ||
    item?.buyer?.username ||
    'Reader'
  )
}

function senderUsername(item) {
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

function sourceTypeLabel(value) {
  return value === 'story'
    ? 'Story'
    : 'Author Page'
}

function statusLabel(value) {
  if (value === 'pending') return 'Pending'
  if (value === 'available') {
    return 'Available'
  }
  if (value === 'paid') return 'Paid'

  return 'Unknown'
}

function csvCell(value) {
  const text = String(value ?? '')

  return `"${text.replace(/"/g, '""')}"`
}

export default function AdminDiamondGiftsPage() {
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

  const transactions =
    data?.transactions || []
  const summary =
    data?.summary || {}
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

  function applyResult(result) {
    setData(result)

    const nextTransactions =
      result?.transactions || []

    setSelectedId((current) =>
      nextTransactions.some(
        (item) => item.id === current
      )
        ? current
        : nextTransactions[0]?.id || ''
    )
  }

  async function fetchDiamondGifts(
    signal,
    { force = false } = {}
  ) {
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

      const cacheKey =
        `${CACHE_PREFIX}${params.toString()}`

      if (!force) {
        const cached = readCache(cacheKey)

        if (cached) {
          applyResult(cached)
          return
        }
      }

      const response = await fetch(
        `${API_URL}/api/admin/income/diamond-gifts?${params.toString()}`,
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
            'Failed to load diamond gifts'
        )
      }

      applyResult(result)
      writeCache(cacheKey, result)

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

      setMessage(
        error.message ||
          'Failed to load diamond gifts'
      )
      setData(null)
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    const controller =
      new AbortController()

    fetchDiamondGifts(
      controller.signal
    )

    return () => {
      controller.abort()
    }
  }, [from, to, searchQuery, status, page])

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
        'Sent At',
        'Sender',
        'Sender Username',
        'Receiver',
        'Source',
        'Gift',
        'Quantity',
        'Paid Diamonds',
        'Gift Value USD',
        'Author Earnings USD',
        'Platform Income USD',
        'Payout Status',
        'Transaction ID',
      ],
      ...transactions.map(
        (item) => [
          formatDateTime(
            item.created_at
          ),
          senderName(item),
          senderUsername(item),
          authorName(item),
          item.source_label || '',
          item.gift_name || '',
          item.gift_quantity || 1,
          item.paid_diamonds || 0,
          item.gross_value_usd || 0,
          item.author_earnings_usd ||
            0,
          item.platform_income_usd ||
            0,
          statusLabel(
            item.earning_status
          ),
          item.id || '',
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
      `diamond-gifts-${from}-to-${to}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="diamond-gifts-page">
        <div className="diamond-gifts-wrap">
          <div className="diamond-gifts-header">
  <div>
    <button
      className="diamond-gifts-back"
      type="button"
      onClick={() => navigate('/income')}
    >
      ← Back to Income
    </button>
    <h1 className="diamond-gifts-title">
      Diamond Gifts
    </h1>
              <div className="diamond-gifts-subtitle">
                Real Diamond gift income from author earnings records.
              </div>
            </div>

            <div className="diamond-gifts-actions">
              <input
                className="diamond-gifts-input"
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
                className="diamond-gifts-input"
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value)
                  setPage(1)
                }}
              />
              <button
                className="diamond-gifts-button"
                type="button"
                onClick={exportCsv}
                disabled={
                  !transactions.length
                }
              >
                Export
              </button>
              <button
                className="diamond-gifts-button primary"
                type="button"
                onClick={() =>
  fetchDiamondGifts(
    undefined,
    { force: true }
  )
}
                disabled={loading}
              >
                {loading
                  ? 'Loading...'
                  : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="diamond-gifts-summary">
            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">
                Total Gifts
              </div>
              <div className="diamond-gifts-card-value">
                {summary.gift_transaction_count ||
                  0}
              </div>
              <div className="diamond-gifts-card-sub">
                Gift earning records
              </div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">
                Gift Value
              </div>
              <div className="diamond-gifts-card-value">
                {Number(
                  summary.total_gift_diamonds ||
                    0
                ).toLocaleString()}{' '}
                💎
              </div>
              <div className="diamond-gifts-card-sub">
                {formatUsd(
                  summary.gross_sales_usd
                )}
              </div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">
                Author Earnings
              </div>
              <div className="diamond-gifts-card-value">
                {formatUsd(
                  summary.author_earnings_usd
                )}
              </div>
              <div className="diamond-gifts-card-sub good">
                Actual author gift earnings
              </div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">
                Platform Income
              </div>
              <div className="diamond-gifts-card-value">
                {formatUsd(
                  summary.platform_income_usd
                )}
              </div>
              <div className="diamond-gifts-card-sub">
                Actual platform gift income
              </div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">
                Pending Payout
              </div>
              <div className="diamond-gifts-card-value">
                {formatUsd(
                  summary.pending_payout_usd
                )}
              </div>
              <div className="diamond-gifts-card-sub warn">
                Pending + available
              </div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">
                Paid Payout
              </div>
              <div className="diamond-gifts-card-value">
                {formatUsd(
                  summary.paid_payout_usd
                )}
              </div>
              <div className="diamond-gifts-card-sub good">
                Already paid to authors
              </div>
            </div>
          </div>

          <div className="diamond-gifts-tools">
            <input
              className="diamond-gifts-search"
              placeholder="Search sender, receiver, story, gift, or transaction ID..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return

                const nextSearch =
                  search.trim()

                if (
                  nextSearch === searchQuery &&
                  page === 1
                ) {
                  fetchDiamondGifts(
                    undefined,
                    { force: true }
                  )
                  return
                }

                setSearchQuery(nextSearch)
                setPage(1)
              }}
            />

            <div className="diamond-gifts-filters">
              <button
                type="button"
                className={`diamond-gifts-chip ${rangeKey === 'today' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('today')
                }
              >
                Today
              </button>
              <button
                type="button"
                className={`diamond-gifts-chip ${rangeKey === '7d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('7d')
                }
              >
                7D
              </button>
              <button
                type="button"
                className={`diamond-gifts-chip ${rangeKey === '30d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('30d')
                }
              >
                30D
              </button>
              <button
                type="button"
                className={`diamond-gifts-chip ${rangeKey === 'month' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('month')
                }
              >
                This Month
              </button>

              <select
                className="diamond-gifts-select"
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
                <option value="pending">
                  Pending
                </option>
                <option value="available">
                  Available
                </option>
                <option value="paid">
                  Paid
                </option>
                <option value="unknown">
                  Unknown
                </option>
              </select>
            </div>
          </div>

          {message ? (
            <div className="diamond-gifts-message">
              {message}
            </div>
          ) : null}

          <div className="diamond-gifts-main">
            <section className="diamond-gifts-panel">
              <div className="diamond-gifts-panel-head">
                <div className="diamond-gifts-panel-title">
                  Diamond Gift Transactions
                </div>
                <div className="diamond-gifts-panel-sub">
                  {pagination.total || 0}{' '}
                  record(s)
                </div>
              </div>

              {loading &&
              !transactions.length ? (
                <div className="diamond-gifts-empty">
                  Loading diamond gifts...
                </div>
              ) : !transactions.length ? (
                <div className="diamond-gifts-empty">
                  No diamond gifts found.
                </div>
              ) : (
                <>
                  <div className="diamond-gifts-table-wrap">
                    <table className="diamond-gifts-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Sender</th>
                          <th>Receiver</th>
                          <th>Story / Source</th>
                          <th>Gift</th>
                          <th>Value USD</th>
                          <th>Author Earnings</th>
                          <th>Platform Income</th>
                          <th>Status</th>
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
                                <div className="diamond-gifts-name">
                                  {formatDateTime(
                                    item.created_at
                                  )}
                                </div>
                                <div className="diamond-gifts-small">
                                  {sourceTypeLabel(
                                    item.source_type
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="diamond-gifts-name">
                                  {senderName(
                                    item
                                  )}
                                </div>
                                <div className="diamond-gifts-small">
                                  {senderUsername(
                                    item
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="diamond-gifts-name">
                                  {authorName(
                                    item
                                  )}
                                </div>
                                <div className="diamond-gifts-small">
                                  {authorUsername(
                                    item
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="diamond-gifts-name">
                                  {item.source_label ||
                                    '-'}
                                </div>
                                <div className="diamond-gifts-small">
                                  {sourceTypeLabel(
                                    item.source_type
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="diamond-gifts-name">
                                  {item.gift_quantity ||
                                    1}
                                  {' × '}
                                  {item.gift_name ||
                                    'Diamond Gift'}
                                </div>
                                <div className="diamond-gifts-small">
                                  {item.paid_diamonds ||
                                    0}{' '}
                                  💎
                                </div>
                              </td>
                              <td className="diamond-gifts-money">
                                {formatUsd(
                                  item.gross_value_usd
                                )}
                              </td>
                              <td className="diamond-gifts-money good">
                                {formatUsd(
                                  item.author_earnings_usd
                                )}
                              </td>
                              <td className="diamond-gifts-money">
                                {formatUsd(
                                  item.platform_income_usd
                                )}
                              </td>
                              <td>
                                <span
                                  className={`diamond-gifts-status ${item.earning_status || ''}`}
                                >
                                  {statusLabel(
                                    item.earning_status
                                  )}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="diamond-gifts-pagination">
                    <div className="diamond-gifts-small">
                      Page{' '}
                      {pagination.page || 1}{' '}
                      of{' '}
                      {pagination.total_pages ||
                        1}
                    </div>

                    <div className="diamond-gifts-pages">
                      <button
                        className="diamond-gifts-page-btn"
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
                        className="diamond-gifts-page-btn"
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

            <aside className="diamond-gifts-panel">
              <div className="diamond-gifts-panel-head">
                <div className="diamond-gifts-panel-title">
                  Gift Transaction Detail
                </div>
                <div className="diamond-gifts-panel-sub">
                  {selected
                    ? `ID: ${selected.id}`
                    : 'No transaction selected'}
                </div>
              </div>

              {!selected ? (
                <div className="diamond-gifts-empty">
                  Select a gift transaction.
                </div>
              ) : (
                <div className="diamond-gifts-detail">
                  <div className="diamond-gifts-section">
                    <div className="diamond-gifts-section-title">
                      Overview
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Sent At
                      </div>
                      <div className="diamond-gifts-v">
                        {formatDateTime(
                          selected.created_at
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Status
                      </div>
                      <div className="diamond-gifts-v">
                        {statusLabel(
                          selected.earning_status
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Transaction ID
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.id}
                      </div>
                    </div>
                  </div>

                  <div className="diamond-gifts-section">
                    <div className="diamond-gifts-section-title">
                      Sender
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Name
                      </div>
                      <div className="diamond-gifts-v">
                        {senderName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Username
                      </div>
                      <div className="diamond-gifts-v">
                        {senderUsername(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        User ID
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.buyer?.id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="diamond-gifts-section">
                    <div className="diamond-gifts-section-title">
                      Receiver
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Author
                      </div>
                      <div className="diamond-gifts-v">
                        {authorName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Username
                      </div>
                      <div className="diamond-gifts-v">
                        {authorUsername(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Author ID
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.author?.id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="diamond-gifts-section">
                    <div className="diamond-gifts-section-title">
                      Story / Source
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Type
                      </div>
                      <div className="diamond-gifts-v">
                        {sourceTypeLabel(
                          selected.source_type
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Source
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.source_label ||
                          '-'}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Story ID
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.story?.id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="diamond-gifts-section">
                    <div className="diamond-gifts-section-title">
                      Gift
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Gift
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.gift_name ||
                          'Diamond Gift'}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Gift Key
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.gift_key ||
                          '-'}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Quantity
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.gift_quantity ||
                          1}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Support Points
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.gift_support_points ||
                          0}
                      </div>
                    </div>
                  </div>

                  <div className="diamond-gifts-section">
                    <div className="diamond-gifts-section-title">
                      Payment & Amount
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Paid
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.paid_diamonds ||
                          0}{' '}
                        💎
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Diamond → USD
                      </div>
                      <div className="diamond-gifts-v">
                        {formatUsd(
                          selected.diamond_to_usd_rate
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Gift Value
                      </div>
                      <div className="diamond-gifts-v">
                        {formatUsd(
                          selected.gross_value_usd
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Distributable
                      </div>
                      <div className="diamond-gifts-v">
                        {formatUsd(
                          selected.distributable_value_usd
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="diamond-gifts-section">
                    <div className="diamond-gifts-section-title">
                      Revenue Breakdown
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Author Share
                      </div>
                      <div className="diamond-gifts-v">
                        {Number(
                          selected.author_share_percent ||
                            0
                        ).toFixed(2)}
                        %
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Author Earnings
                      </div>
                      <div className="diamond-gifts-v good">
                        {formatUsd(
                          selected.author_earnings_usd
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Platform Income
                      </div>
                      <div className="diamond-gifts-v">
                        {formatUsd(
                          selected.platform_income_usd
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Withholding
                      </div>
                      <div className="diamond-gifts-v">
                        {formatUsd(
                          selected.withholding_usd
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Net Payout
                      </div>
                      <div className="diamond-gifts-v good">
                        {formatUsd(
                          selected.author_net_payout_usd
                        )}
                      </div>
                    </div>
                    <div className="diamond-gifts-kv">
                      <div className="diamond-gifts-k">
                        Share Source
                      </div>
                      <div className="diamond-gifts-v">
                        {selected.share_source ||
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
