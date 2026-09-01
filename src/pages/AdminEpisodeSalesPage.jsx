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

const styles = `
  .episode-sales-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .episode-sales-wrap {
    display: grid;
    gap: 18px;
  }

  .episode-sales-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .episode-sales-back {
  border: 0;
  background: transparent;
  color: #4F46E5;
  padding: 0;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

  .episode-sales-title {
    margin: 0;
    color: #0F172A;
    font-size: 40px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .episode-sales-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 700;
  }

  .episode-sales-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .episode-sales-input {
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

  .episode-sales-button {
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

  .episode-sales-button.primary {
    background: linear-gradient(135deg, #4F46E5, #312E81);
    color: #FFFFFF;
    border: 0;
  }

  .episode-sales-button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .episode-sales-summary {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  .episode-sales-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .episode-sales-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .episode-sales-card-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .episode-sales-card-sub {
    margin-top: 8px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .episode-sales-card-sub.good {
    color: #16A34A;
  }

  .episode-sales-card-sub.warn {
    color: #D97706;
  }

  .episode-sales-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .episode-sales-search {
    height: 46px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .episode-sales-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .episode-sales-chip,
  .episode-sales-select {
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

  .episode-sales-chip.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  .episode-sales-message {
    border: 1px solid #FDE68A;
    background: #FFFBEB;
    color: #92400E;
    border-radius: 16px;
    padding: 13px 15px;
    font-size: 12px;
    font-weight: 850;
  }

  .episode-sales-main {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) 380px;
    gap: 16px;
    align-items: start;
  }

  .episode-sales-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .episode-sales-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .episode-sales-panel-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .episode-sales-panel-sub {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .episode-sales-table-wrap {
    overflow-x: auto;
  }

  .episode-sales-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1040px;
  }

  .episode-sales-table th {
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

  .episode-sales-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
    vertical-align: top;
  }

  .episode-sales-table tbody tr {
    cursor: pointer;
  }

  .episode-sales-table tbody tr.active {
    background: #F5F3FF;
  }

  .episode-sales-name {
    font-size: 14px;
    font-weight: 950;
    color: #0F172A;
  }

  .episode-sales-small {
    margin-top: 3px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.45;
  }

  .episode-sales-money {
    font-weight: 950;
    white-space: nowrap;
  }

  .episode-sales-money.good {
    color: #16A34A;
  }

  .episode-sales-status {
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

  .episode-sales-status.pending {
    background: #FEF3C7;
    color: #B45309;
  }

  .episode-sales-status.available {
    background: #DBEAFE;
    color: #2563EB;
  }

  .episode-sales-status.paid {
    background: #DCFCE7;
    color: #15803D;
  }

  .episode-sales-empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .episode-sales-detail {
    padding: 20px;
    display: grid;
    gap: 18px;
  }

  .episode-sales-section {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
    background: #FFFFFF;
  }

  .episode-sales-section-title {
    color: #4F46E5;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 12px;
  }

  .episode-sales-kv {
    display: grid;
    grid-template-columns: 125px 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .episode-sales-kv:last-child {
    margin-bottom: 0;
  }

  .episode-sales-k {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .episode-sales-v {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .episode-sales-v.good {
    color: #16A34A;
  }

  .episode-sales-list {
    display: grid;
    gap: 9px;
  }

  .episode-sales-list-item {
    padding: 10px 11px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
  }

  .episode-sales-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .episode-sales-pages {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .episode-sales-page-btn {
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

  .episode-sales-page-btn:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  @media (max-width: 1380px) {
    .episode-sales-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .episode-sales-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .episode-sales-header,
    .episode-sales-tools {
      display: grid;
      grid-template-columns: 1fr;
    }

    .episode-sales-summary {
      grid-template-columns: 1fr;
    }

    .episode-sales-actions,
    .episode-sales-filters {
      justify-content: stretch;
    }

    .episode-sales-button,
    .episode-sales-input,
    .episode-sales-chip,
    .episode-sales-select {
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
  const day = String(date.getDate()).padStart(
    2,
    '0'
  )

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

function episodeSummary(item) {
  const episodes = item?.episodes || []

  if (!episodes.length) {
    const first = item?.first_episode

    if (!first) {
      return {
        main: 'Episode',
        sub: `${item?.episode_count || 0} episode(s)`,
      }
    }

    return {
      main:
        first.episode_number > 0
          ? `EP ${first.episode_number}`
          : 'Episode',
      sub:
        first.title ||
        `${item?.episode_count || 1} episode(s)`,
    }
  }

  const first = episodes[0]
  const extra = Math.max(
    0,
    episodes.length - 1
  )

  return {
    main:
      first.episode_number > 0
        ? `EP ${first.episode_number}${extra ? ` +${extra}` : ''}`
        : `${episodes.length} Episode(s)`,
    sub:
      first.title ||
      `${episodes.length} episode(s)`,
  }
}

function statusLabel(value) {
  const status = String(value || 'unknown')

  if (status === 'pending') return 'Pending'
  if (status === 'available') {
    return 'Available'
  }
  if (status === 'paid') return 'Paid'

  return 'Unknown'
}

function csvCell(value) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export default function AdminEpisodeSalesPage() {
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
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] =
    useState(true)
  const [message, setMessage] =
    useState('')
  const [selectedKey, setSelectedKey] =
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
        (item) =>
          item.purchase_key === selectedKey
      ) ||
      transactions[0] ||
      null,
    [transactions, selectedKey]
  )

  async function fetchEpisodeSales(
    signal
  ) {
    try {
      setLoading(true)
      setMessage('')

      const params = new URLSearchParams()

      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (searchQuery) {
  params.set('q', searchQuery)
}
      if (status !== 'all') {
        params.set('status', status)
      }

      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))

      const response = await fetch(
        `${API_URL}/api/admin/income/episode-sales?${params.toString()}`,
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
            'Failed to load episode sales'
        )
      }

      setData(result)

      const nextTransactions =
        result.transactions || []

      if (
        !nextTransactions.some(
          (item) =>
            item.purchase_key ===
            selectedKey
        )
      ) {
        setSelectedKey(
          nextTransactions[0]
            ?.purchase_key || ''
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
      if (error.name === 'AbortError') {
        return
      }

      setMessage(
        error.message ||
          'Failed to load episode sales'
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

  fetchEpisodeSales(
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

  function exportCsv() {
    if (!transactions.length) return

    const rows = [
      [
        'Purchased At',
        'Buyer',
        'Username',
        'Story',
        'Package',
        'Episodes',
        'Paid Diamonds',
        'Gross USD',
        'Author Earnings USD',
        'Platform Income USD',
        'Payout Status',
        'Purchase Key',
      ],
      ...transactions.map((item) => [
        formatDateTime(item.created_at),
        buyerName(item),
        buyerUsername(item),
        item.story?.title || '',
        item.package_key || '',
        item.episode_count || 0,
        item.paid_diamonds || 0,
        item.gross_sales_usd || 0,
        item.author_earnings_usd || 0,
        item.platform_income_usd || 0,
        statusLabel(
          item.payout_status
        ),
        item.purchase_key || '',
      ]),
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
      `episode-sales-${from}-to-${to}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const rangeKey = useMemo(() => {
    const today = todayInput()

    if (from === today && to === today) {
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

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="episode-sales-page">
        <div className="episode-sales-wrap">
          <div className="episode-sales-header">
  <div>
    <button
      className="episode-sales-back"
      type="button"
      onClick={() => navigate('/income')}
    >
      ← Back to Income
    </button>
    <h1 className="episode-sales-title">
      Episode Sales
    </h1>
              <div className="episode-sales-subtitle">
                Real Diamond episode unlock income from the backend.
              </div>
            </div>

            <div className="episode-sales-actions">
              <input
                className="episode-sales-input"
                type="date"
                value={from}
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
    fetchEpisodeSales()
    return
  }

  setSearchQuery(nextSearch)
  setPage(1)
}}
              />
              <input
                className="episode-sales-input"
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value)
                  setPage(1)
                }}
              />
              <button
                className="episode-sales-button"
                type="button"
                onClick={exportCsv}
                disabled={!transactions.length}
              >
                Export
              </button>
              <button
                className="episode-sales-button primary"
                type="button"
                onClick={() =>
                  fetchEpisodeSales()
                }
                disabled={loading}
              >
                {loading
                  ? 'Loading...'
                  : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="episode-sales-summary">
            <div className="episode-sales-card">
              <div className="episode-sales-card-label">
                Gross Sales
              </div>
              <div className="episode-sales-card-value">
                {formatUsd(
                  summary.gross_sales_usd
                )}
              </div>
              <div className="episode-sales-card-sub">
                Diamond unlock gross value
              </div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">
                Platform Income
              </div>
              <div className="episode-sales-card-value">
                {formatUsd(
                  summary.platform_income_usd
                )}
              </div>
              <div className="episode-sales-card-sub">
                Actual platform share
              </div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">
                Author Earnings
              </div>
              <div className="episode-sales-card-value">
                {formatUsd(
                  summary.author_earnings_usd
                )}
              </div>
              <div className="episode-sales-card-sub good">
                Actual author share
              </div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">
                Pending Payout
              </div>
              <div className="episode-sales-card-value">
                {formatUsd(
                  summary.pending_payout_usd
                )}
              </div>
              <div className="episode-sales-card-sub warn">
                Pending + available author payout
              </div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">
                Sales / Records
              </div>
              <div className="episode-sales-card-value">
                {summary.order_count || 0}
              </div>
              <div className="episode-sales-card-sub">
                Unique Diamond purchases
              </div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">
                Paid Out
              </div>
              <div className="episode-sales-card-value">
                {formatUsd(
                  summary.paid_payout_usd
                )}
              </div>
              <div className="episode-sales-card-sub good">
                Author payout already paid
              </div>
            </div>
          </div>

          <div className="episode-sales-tools">
            <input
              className="episode-sales-search"
              placeholder="Search buyer, story, author, episode, package, or purchase key..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />

            <div className="episode-sales-filters">
              <button
                className={`episode-sales-chip ${rangeKey === 'today' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('today')
                }
                type="button"
              >
                Today
              </button>
              <button
                className={`episode-sales-chip ${rangeKey === '7d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('7d')
                }
                type="button"
              >
                7D
              </button>
              <button
                className={`episode-sales-chip ${rangeKey === '30d' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('30d')
                }
                type="button"
              >
                30D
              </button>
              <button
                className={`episode-sales-chip ${rangeKey === 'month' ? 'active' : ''}`}
                onClick={() =>
                  applyRange('month')
                }
                type="button"
              >
                This Month
              </button>

              <select
                className="episode-sales-select"
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
            <div className="episode-sales-message">
              {message}
            </div>
          ) : null}

          <div className="episode-sales-main">
            <section className="episode-sales-panel">
              <div className="episode-sales-panel-head">
                <div className="episode-sales-panel-title">
                  Episode Sales Transactions
                </div>
                <div className="episode-sales-panel-sub">
                  {pagination.total || 0} purchase record(s)
                </div>
              </div>

              {loading &&
              !transactions.length ? (
                <div className="episode-sales-empty">
                  Loading episode sales...
                </div>
              ) : !transactions.length ? (
                <div className="episode-sales-empty">
                  No episode sales found.
                </div>
              ) : (
                <>
                  <div className="episode-sales-table-wrap">
                    <table className="episode-sales-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Buyer</th>
                          <th>Story / Episode</th>
                          <th>Author</th>
                          <th>Paid</th>
                          <th>Author Earnings</th>
                          <th>Platform Income</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {transactions.map(
                          (item) => {
                            const episode =
                              episodeSummary(
                                item
                              )

                            return (
                              <tr
                                key={
                                  item.purchase_key
                                }
                                className={
                                  selected
                                    ?.purchase_key ===
                                  item.purchase_key
                                    ? 'active'
                                    : ''
                                }
                                onClick={() =>
                                  setSelectedKey(
                                    item.purchase_key
                                  )
                                }
                              >
                                <td>
                                  <div className="episode-sales-name">
                                    {formatDateTime(
                                      item.created_at
                                    )}
                                  </div>
                                  <div className="episode-sales-small">
                                    {item.package_key ||
                                      'single'}
                                  </div>
                                </td>
                                <td>
                                  <div className="episode-sales-name">
                                    {buyerName(
                                      item
                                    )}
                                  </div>
                                  <div className="episode-sales-small">
                                    {buyerUsername(
                                      item
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="episode-sales-name">
                                    {item.story
                                      ?.title ||
                                      'Story'}
                                  </div>
                                  <div className="episode-sales-small">
                                    {episode.main} ·{' '}
                                    {episode.sub}
                                  </div>
                                </td>
                                <td>
                                  <div className="episode-sales-name">
                                    {authorName(
                                      item
                                    )}
                                  </div>
                                  <div className="episode-sales-small">
                                    {authorUsername(
                                      item
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="episode-sales-name">
                                    {item.paid_diamonds ||
                                      0}{' '}
                                    💎
                                  </div>
                                  <div className="episode-sales-small">
                                    {formatUsd(
                                      item.gross_sales_usd
                                    )}
                                  </div>
                                </td>
                                <td className="episode-sales-money good">
                                  {formatUsd(
                                    item.author_earnings_usd
                                  )}
                                </td>
                                <td className="episode-sales-money">
                                  {formatUsd(
                                    item.platform_income_usd
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`episode-sales-status ${item.payout_status || ''}`}
                                  >
                                    {statusLabel(
                                      item.payout_status
                                    )}
                                  </span>
                                </td>
                              </tr>
                            )
                          }
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="episode-sales-pagination">
                    <div className="episode-sales-small">
                      Page{' '}
                      {pagination.page || 1}{' '}
                      of{' '}
                      {pagination.total_pages ||
                        1}
                    </div>

                    <div className="episode-sales-pages">
                      <button
                        className="episode-sales-page-btn"
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
                        className="episode-sales-page-btn"
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

            <aside className="episode-sales-panel">
              <div className="episode-sales-panel-head">
                <div className="episode-sales-panel-title">
                  Transaction Detail
                </div>
                <div className="episode-sales-panel-sub">
                  {selected
                    ? selected.purchase_key
                    : 'No transaction selected'}
                </div>
              </div>

              {!selected ? (
                <div className="episode-sales-empty">
                  Select a transaction.
                </div>
              ) : (
                <div className="episode-sales-detail">
                  <div className="episode-sales-section">
                    <div className="episode-sales-section-title">
                      Overview
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Purchased At
                      </div>
                      <div className="episode-sales-v">
                        {formatDateTime(
                          selected.created_at
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Package
                      </div>
                      <div className="episode-sales-v">
                        {selected.package_key ||
                          'single'}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Episodes
                      </div>
                      <div className="episode-sales-v">
                        {selected.episode_count ||
                          0}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Payout Status
                      </div>
                      <div className="episode-sales-v">
                        {statusLabel(
                          selected.payout_status
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="episode-sales-section">
                    <div className="episode-sales-section-title">
                      Buyer
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Name
                      </div>
                      <div className="episode-sales-v">
                        {buyerName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Username
                      </div>
                      <div className="episode-sales-v">
                        {buyerUsername(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        User ID
                      </div>
                      <div className="episode-sales-v">
                        {selected.buyer?.id ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="episode-sales-section">
                    <div className="episode-sales-section-title">
                      Story & Episodes
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Story
                      </div>
                      <div className="episode-sales-v">
                        {selected.story
                          ?.title || '-'}
                      </div>
                    </div>

                    <div className="episode-sales-list">
                      {(selected.episodes ||
                        []).length ? (
                        selected.episodes.map(
                          (episode) => (
                            <div
                              className="episode-sales-list-item"
                              key={
                                episode.unlock_transaction_id ||
                                episode.id
                              }
                            >
                              <div className="episode-sales-name">
                                {episode.episode_number >
                                0
                                  ? `EP ${episode.episode_number}`
                                  : 'Episode'}
                                {episode.title
                                  ? ` · ${episode.title}`
                                  : ''}
                              </div>
                              <div className="episode-sales-small">
                                {
                                  episode.paid_diamonds
                                }{' '}
                                💎 · Author{' '}
                                {
                                  episode.author_earned_diamonds
                                }{' '}
                                💎 · Platform{' '}
                                {
                                  episode.platform_earned_diamonds
                                }{' '}
                                💎
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="episode-sales-small">
                          Episode detail is unavailable for this older purchase.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="episode-sales-section">
                    <div className="episode-sales-section-title">
                      Author
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Name
                      </div>
                      <div className="episode-sales-v">
                        {authorName(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Username
                      </div>
                      <div className="episode-sales-v">
                        {authorUsername(
                          selected
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Author ID
                      </div>
                      <div className="episode-sales-v">
                        {selected.author?.id ||
                          '-'}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Share
                      </div>
                      <div className="episode-sales-v">
                        {Number(
                          selected.author_share_percent ||
                            0
                        ).toFixed(2)}
                        %
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Share Source
                      </div>
                      <div className="episode-sales-v">
                        {selected.share_source ||
                          '-'}
                      </div>
                    </div>
                  </div>

                  <div className="episode-sales-section">
                    <div className="episode-sales-section-title">
                      Payment & Amount
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Original
                      </div>
                      <div className="episode-sales-v">
                        {selected.original_diamonds ||
                          0}{' '}
                        💎
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Paid
                      </div>
                      <div className="episode-sales-v">
                        {selected.paid_diamonds ||
                          0}{' '}
                        💎
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Diamond → USD
                      </div>
                      <div className="episode-sales-v">
                        {formatUsd(
                          selected.diamond_to_usd_rate
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Gross
                      </div>
                      <div className="episode-sales-v">
                        {formatUsd(
                          selected.gross_sales_usd
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Direct Cost
                      </div>
                      <div className="episode-sales-v">
                        {formatUsd(
                          selected.direct_cost_usd
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="episode-sales-section">
                    <div className="episode-sales-section-title">
                      Revenue Breakdown
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Distributable
                      </div>
                      <div className="episode-sales-v">
                        {formatUsd(
                          selected.distributable_revenue_usd
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Author Earnings
                      </div>
                      <div className="episode-sales-v good">
                        {formatUsd(
                          selected.author_earnings_usd
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Platform Income
                      </div>
                      <div className="episode-sales-v">
                        {formatUsd(
                          selected.platform_income_usd
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Withholding
                      </div>
                      <div className="episode-sales-v">
                        {formatUsd(
                          selected.withholding_usd
                        )}
                      </div>
                    </div>
                    <div className="episode-sales-kv">
                      <div className="episode-sales-k">
                        Author Net Payout
                      </div>
                      <div className="episode-sales-v good">
                        {formatUsd(
                          selected.author_net_payout_usd
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
