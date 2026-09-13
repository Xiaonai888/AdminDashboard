import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 20
const DETAIL_PAGE_SIZE = 20

const styles = `
  .author-income-page { display: grid; gap: 18px; }
  .author-income-summary { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
  .author-income-card { min-width: 0; padding: 16px; border: 1px solid #E2E8F0; border-radius: 18px; background: #FFFFFF; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04); }
  .author-income-card-label { color: #64748B; font-size: 11px; font-weight: 950; letter-spacing: .04em; text-transform: uppercase; }
  .author-income-card-value { margin-top: 8px; color: #0F172A; font-size: 24px; font-weight: 950; letter-spacing: -0.04em; white-space: nowrap; }
  .author-income-card-sub { margin-top: 6px; color: #94A3B8; font-size: 11px; font-weight: 800; line-height: 1.45; }
  .author-income-toolbar { display: grid; grid-template-columns: minmax(220px, 1fr) 145px 145px 150px 145px 190px auto; gap: 9px; align-items: center; }
  .author-income-input, .author-income-select, .author-income-button { height: 42px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF; color: #0F172A; font: inherit; font-size: 12px; font-weight: 800; outline: none; }
  .author-income-input, .author-income-select { width: 100%; padding: 0 11px; }
  .author-income-input:focus, .author-income-select:focus { border-color: #A5B4FC; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.10); }
  .author-income-button { padding: 0 15px; color: #4338CA; border-color: #C7D2FE; background: #EEF2FF; cursor: pointer; white-space: nowrap; }
  .author-income-button.secondary { color: #475569; border-color: #E2E8F0; background: #FFFFFF; }
  .author-income-button:disabled { opacity: .5; cursor: not-allowed; }
  .author-income-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .author-income-chips { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .author-income-chip { display: inline-flex; min-height: 30px; align-items: center; padding: 0 10px; border: 1px solid #E2E8F0; border-radius: 999px; background: #FFFFFF; color: #64748B; font-size: 11px; font-weight: 850; }
  .author-income-chip.primary { color: #4338CA; border-color: #C7D2FE; background: #EEF2FF; }
  .author-income-message { padding: 13px 14px; border: 1px solid #FDE68A; border-radius: 14px; background: #FFFBEB; color: #92400E; font-size: 12px; font-weight: 850; }
  .author-income-panel { overflow: hidden; border: 1px solid #E2E8F0; border-radius: 20px; background: #FFFFFF; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04); }
  .author-income-table-wrap { overflow-x: auto; }
  .author-income-table { width: 100%; min-width: 1180px; border-collapse: collapse; }
  .author-income-table th { padding: 13px 15px; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; color: #64748B; font-size: 10px; font-weight: 950; letter-spacing: .04em; text-align: left; text-transform: uppercase; white-space: nowrap; }
  .author-income-table td { padding: 15px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-size: 12px; font-weight: 800; vertical-align: middle; }
  .author-income-table tbody tr:last-child td { border-bottom: 0; }
  .author-income-row { cursor: pointer; transition: background .15s ease; }
  .author-income-row:hover, .author-income-row:focus { background: #F8FAFF; outline: none; }
  .author-income-author { min-width: 190px; }
  .author-income-author-name { color: #0F172A; font-size: 13px; font-weight: 950; }
  .author-income-author-user { margin-top: 4px; color: #64748B; font-size: 11px; font-weight: 750; }
  .author-income-number { font-size: 13px; font-weight: 950; white-space: nowrap; }
  .author-income-usd { margin-top: 4px; color: #94A3B8; font-size: 10px; font-weight: 800; white-space: nowrap; }
  .author-income-status { display: inline-flex; min-height: 27px; align-items: center; padding: 0 9px; border-radius: 999px; background: #F1F5F9; color: #475569; font-size: 10px; font-weight: 950; text-transform: capitalize; white-space: nowrap; }
  .author-income-status.paid { color: #047857; background: #ECFDF5; }
  .author-income-status.pending, .author-income-status.available { color: #B45309; background: #FFFBEB; }
  .author-income-status.mixed { color: #4338CA; background: #EEF2FF; }
  .author-income-empty { padding: 46px 20px; color: #94A3B8; font-size: 13px; font-weight: 900; text-align: center; }
  .author-income-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border-top: 1px solid #E2E8F0; background: #FFFFFF; }
  .author-income-page-info { color: #64748B; font-size: 11px; font-weight: 850; }
  .author-income-pager { display: flex; gap: 8px; }
  .author-income-overlay { position: fixed; inset: 0; z-index: 120; display: flex; justify-content: flex-end; background: rgba(15, 23, 42, .42); backdrop-filter: blur(2px); }
  .author-income-drawer { width: min(860px, 94vw); height: 100vh; display: flex; flex-direction: column; background: #F8FAFC; box-shadow: -18px 0 45px rgba(15, 23, 42, .18); }
  .author-income-drawer-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 22px; border-bottom: 1px solid #E2E8F0; background: #FFFFFF; }
  .author-income-drawer-title { margin: 0; color: #0F172A; font-size: 20px; font-weight: 950; }
  .author-income-drawer-subtitle { margin-top: 5px; color: #64748B; font-size: 12px; font-weight: 800; }
  .author-income-close { width: 38px; height: 38px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF; color: #475569; font-size: 20px; font-weight: 900; cursor: pointer; }
  .author-income-drawer-body { min-height: 0; flex: 1; overflow-y: auto; padding: 18px; }
  .author-income-detail-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
  .author-income-detail-card { padding: 13px; border: 1px solid #E2E8F0; border-radius: 15px; background: #FFFFFF; }
  .author-income-detail-label { color: #64748B; font-size: 10px; font-weight: 950; text-transform: uppercase; }
  .author-income-detail-value { margin-top: 6px; color: #0F172A; font-size: 16px; font-weight: 950; }
  .author-income-detail-list { display: grid; gap: 12px; }
  .author-income-transaction { overflow: hidden; border: 1px solid #E2E8F0; border-radius: 17px; background: #FFFFFF; }
  .author-income-transaction-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px 15px; border-bottom: 1px solid #F1F5F9; background: #F8FAFC; }
  .author-income-transaction-title { color: #0F172A; font-size: 13px; font-weight: 950; }
  .author-income-transaction-sub { margin-top: 4px; color: #64748B; font-size: 11px; font-weight: 750; }
  .author-income-transaction-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .author-income-field { min-width: 0; padding: 12px 14px; border-right: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; }
  .author-income-field:nth-child(4n) { border-right: 0; }
  .author-income-field-label { color: #94A3B8; font-size: 9px; font-weight: 950; letter-spacing: .04em; text-transform: uppercase; }
  .author-income-field-value { margin-top: 5px; overflow-wrap: anywhere; color: #0F172A; font-size: 11px; font-weight: 850; line-height: 1.45; }
  .author-income-detail-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 14px; border: 1px solid #E2E8F0; border-radius: 15px; background: #FFFFFF; }

  @media (max-width: 1180px) {
    .author-income-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .author-income-toolbar { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 760px) {
    .author-income-summary, .author-income-toolbar, .author-income-detail-summary, .author-income-transaction-grid { grid-template-columns: 1fr; }
    .author-income-footer, .author-income-detail-footer { align-items: stretch; flex-direction: column; }
    .author-income-pager { display: grid; grid-template-columns: 1fr 1fr; }
    .author-income-button { width: 100%; }
    .author-income-drawer { width: 100vw; }
    .author-income-field { border-right: 0; }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token')
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 6,
  })
}

function formatUsd(value) {
  return Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function authorIdFor(item) {
  return item?.author_page_id || item?.author_user_id || ''
}

async function readResponse(response) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Request failed with status ${response.status}`
    )
  }

  return data
}

export default function AdminAuthorIncomePage() {
  const [draftSearch, setDraftSearch] = useState('')
  const [draftFrom, setDraftFrom] = useState('')
  const [draftTo, setDraftTo] = useState('')
  const [draftShareSource, setDraftShareSource] = useState('')
  const [draftStatus, setDraftStatus] = useState('all')
  const [draftSort, setDraftSort] = useState('author_earned_desc')

  const [filters, setFilters] = useState({
    q: '',
    from: '',
    to: '',
    share_source: '',
    status: 'all',
    sort: 'author_earned_desc',
  })

  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [detailPage, setDetailPage] = useState(1)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailMessage, setDetailMessage] = useState('')

  const summary = data?.summary || {}
  const items = Array.isArray(data?.items) ? data.items : []
  const pagination = data?.pagination || {}
  const detailTransactions = Array.isArray(
    detailData?.transactions
  )
    ? detailData.transactions
    : []
  const detailPagination = detailData?.pagination || {}

  const requestKey = useMemo(
    () => JSON.stringify([page, filters]),
    [page, filters]
  )

  const detailRequestKey = useMemo(
    () =>
      JSON.stringify([
        authorIdFor(selectedAuthor),
        detailPage,
        filters.from,
        filters.to,
        filters.share_source,
        filters.status,
      ]),
    [
      selectedAuthor,
      detailPage,
      filters.from,
      filters.to,
      filters.share_source,
      filters.status,
    ]
  )

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setMessage('')

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          status: filters.status,
          sort: filters.sort,
        })

        if (filters.q) params.set('q', filters.q)
        if (filters.from) params.set('from', filters.from)
        if (filters.to) params.set('to', filters.to)
        if (filters.share_source) {
          params.set('share_source', filters.share_source)
        }

        const token = getAdminToken()
        const response = await fetch(
          `${API_URL}/api/admin/income/author-income?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        )

        const result = await readResponse(response)
        setData(result)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setMessage(
            error.message || 'Failed to load author income'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => controller.abort()
  }, [requestKey])

  useEffect(() => {
    if (!selectedAuthor) return undefined

    const authorId = authorIdFor(selectedAuthor)

    if (!authorId) {
      setDetailMessage('Missing author ID')
      return undefined
    }

    const controller = new AbortController()

    async function loadDetail() {
      setDetailLoading(true)
      setDetailMessage('')

      try {
        const params = new URLSearchParams({
          page: String(detailPage),
          limit: String(DETAIL_PAGE_SIZE),
          status: filters.status,
        })

        if (filters.from) params.set('from', filters.from)
        if (filters.to) params.set('to', filters.to)
        if (filters.share_source) {
          params.set('share_source', filters.share_source)
        }

        const token = getAdminToken()
        const response = await fetch(
          `${API_URL}/api/admin/income/author-income/${encodeURIComponent(
            authorId
          )}/transactions?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        )

        const result = await readResponse(response)
        setDetailData(result)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setDetailMessage(
            error.message ||
            'Failed to load author transactions'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false)
        }
      }
    }

    loadDetail()
    return () => controller.abort()
  }, [detailRequestKey])

  useEffect(() => {
    if (!selectedAuthor) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedAuthor(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedAuthor])

  function applyFilters(event) {
    event.preventDefault()
    setPage(1)
    setSelectedAuthor(null)
    setFilters({
      q: draftSearch.trim(),
      from: draftFrom,
      to: draftTo,
      share_source: draftShareSource,
      status: draftStatus,
      sort: draftSort,
    })
  }

  function resetFilters() {
    setDraftSearch('')
    setDraftFrom('')
    setDraftTo('')
    setDraftShareSource('')
    setDraftStatus('all')
    setDraftSort('author_earned_desc')
    setPage(1)
    setSelectedAuthor(null)
    setFilters({
      q: '',
      from: '',
      to: '',
      share_source: '',
      status: 'all',
      sort: 'author_earned_desc',
    })
  }

  function openAuthor(item) {
    if (!authorIdFor(item)) return
    setSelectedAuthor(item)
    setDetailPage(1)
    setDetailData(null)
    setDetailMessage('')
  }

  function closeAuthor() {
    setSelectedAuthor(null)
    setDetailPage(1)
    setDetailData(null)
    setDetailMessage('')
  }

  return (
    <AdminLayout
      title="Author Income"
      subtitle="Author earnings, paid Diamonds, platform share and payout status."
    >
      <style>{styles}</style>

      <div className="author-income-page">
        <section className="author-income-summary">
          <div className="author-income-card">
            <div className="author-income-card-label">Paid Diamonds</div>
            <div className="author-income-card-value">
              {formatNumber(summary.paid_diamonds)}
            </div>
            <div className="author-income-card-sub">
              Net {formatNumber(summary.net_paid_diamonds)} D
            </div>
          </div>

          <div className="author-income-card">
            <div className="author-income-card-label">Author Earnings</div>
            <div className="author-income-card-value">
              {formatNumber(summary.author_earned_diamonds)} D
            </div>
            <div className="author-income-card-sub">
              {formatUsd(summary.author_earnings_usd)}
            </div>
          </div>

          <div className="author-income-card">
            <div className="author-income-card-label">Platform Earnings</div>
            <div className="author-income-card-value">
              {formatNumber(summary.platform_earned_diamonds)} D
            </div>
            <div className="author-income-card-sub">
              {formatUsd(summary.platform_income_usd)}
            </div>
          </div>

          <div className="author-income-card">
            <div className="author-income-card-label">Transactions</div>
            <div className="author-income-card-value">
              {formatNumber(summary.transaction_count)}
            </div>
            <div className="author-income-card-sub">
              {formatNumber(summary.author_count)} authors
            </div>
          </div>

          <div className="author-income-card">
            <div className="author-income-card-label">Pending Payout</div>
            <div className="author-income-card-value">
              {formatUsd(summary.pending_payout_usd)}
            </div>
            <div className="author-income-card-sub">Awaiting payout</div>
          </div>

          <div className="author-income-card">
            <div className="author-income-card-label">Reconciliation</div>
            <div className="author-income-card-value">
              {formatNumber(
                summary.reconciliation_difference_diamonds
              )} D
            </div>
            <div className="author-income-card-sub">
              Net − Author − Platform
            </div>
          </div>
        </section>

        <form className="author-income-toolbar" onSubmit={applyFilters}>
          <input
            className="author-income-input"
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Search author / username"
          />

          <input
            className="author-income-input"
            type="date"
            value={draftFrom}
            onChange={(event) => setDraftFrom(event.target.value)}
          />

          <input
            className="author-income-input"
            type="date"
            value={draftTo}
            onChange={(event) => setDraftTo(event.target.value)}
          />

          <select
            className="author-income-select"
            value={draftShareSource}
            onChange={(event) =>
              setDraftShareSource(event.target.value)
            }
          >
            <option value="">All share sources</option>
            <option value="quest_stage">Quest Stage</option>
            <option value="event">Event</option>
            <option value="creator_boost">Creator Boost</option>
          </select>

          <select
            className="author-income-select"
            value={draftStatus}
            onChange={(event) => setDraftStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="available">Available</option>
            <option value="paid">Paid</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            className="author-income-select"
            value={draftSort}
            onChange={(event) => setDraftSort(event.target.value)}
          >
            <option value="author_earned_desc">Author Earned</option>
            <option value="paid_diamonds_desc">Paid Diamonds</option>
            <option value="platform_earned_desc">Platform Earned</option>
            <option value="transactions_desc">Transactions</option>
            <option value="latest_desc">Latest Income</option>
          </select>

          <button
            className="author-income-button"
            type="submit"
            disabled={loading}
          >
            Apply
          </button>
        </form>

        <div className="author-income-meta">
          <div className="author-income-chips">
            <span className="author-income-chip primary">
              Source: author_earnings
            </span>
            <span className="author-income-chip">
              {formatNumber(pagination.total)} authors
            </span>
            <span className="author-income-chip">20 rows / page</span>
          </div>

          <button
            className="author-income-button secondary"
            type="button"
            onClick={resetFilters}
            disabled={loading}
          >
            Reset Filters
          </button>
        </div>

        {message ? (
          <div className="author-income-message">{message}</div>
        ) : null}

        <section className="author-income-panel">
          <div className="author-income-table-wrap">
            <table className="author-income-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Paid Diamonds</th>
                  <th>Author Earned</th>
                  <th>Platform Earned</th>
                  <th>Transactions</th>
                  <th>Pending Payout</th>
                  <th>Paid Payout</th>
                  <th>Status</th>
                  <th>Latest Income</th>
                </tr>
              </thead>

              <tbody>
                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <div className="author-income-empty">
                        No author income found.
                      </div>
                    </td>
                  </tr>
                ) : null}

                {items.map((item) => (
                  <tr
                    className="author-income-row"
                    key={item.author_page_id || item.author_user_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openAuthor(item)}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault()
                        openAuthor(item)
                      }
                    }}
                  >
                    <td>
                      <div className="author-income-author">
                        <div className="author-income-author-name">
                          {item.author_name || 'Unknown Author'}
                        </div>
                        <div className="author-income-author-user">
                          {item.author_username
                            ? `@${item.author_username}`
                            : item.author_user_id || '-'}
                        </div>
                      </div>
                    </td>

                    <td><div className="author-income-number">{formatNumber(item.paid_diamonds)} D</div></td>
                    <td>
                      <div className="author-income-number">
                        {formatNumber(item.author_earned_diamonds)} D
                      </div>
                      <div className="author-income-usd">
                        {formatUsd(item.author_earnings_usd)}
                      </div>
                    </td>
                    <td>
                      <div className="author-income-number">
                        {formatNumber(item.platform_earned_diamonds)} D
                      </div>
                      <div className="author-income-usd">
                        {formatUsd(item.platform_income_usd)}
                      </div>
                    </td>
                    <td><div className="author-income-number">{formatNumber(item.transaction_count)}</div></td>
                    <td><div className="author-income-number">{formatUsd(item.pending_payout_usd)}</div></td>
                    <td><div className="author-income-number">{formatUsd(item.paid_payout_usd)}</div></td>
                    <td>
                      <span className={`author-income-status ${item.payout_status || ''}`}>
                        {item.payout_status || 'unknown'}
                      </span>
                    </td>
                    <td>{formatDateTime(item.latest_income_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="author-income-footer">
            <div className="author-income-page-info">
              {loading
                ? 'Loading...'
                : `Page ${pagination.page || 1} of ${pagination.total_pages || 0}`}
            </div>

            <div className="author-income-pager">
              <button
                className="author-income-button secondary"
                type="button"
                disabled={loading || !pagination.has_prev}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
              >
                Previous
              </button>

              <button
                className="author-income-button secondary"
                type="button"
                disabled={loading || !pagination.has_next}
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedAuthor ? (
        <div
          className="author-income-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAuthor()
            }
          }}
        >
          <aside
            className="author-income-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Author income transaction detail"
          >
            <div className="author-income-drawer-head">
              <div>
                <h2 className="author-income-drawer-title">
                  {selectedAuthor.author_name || 'Unknown Author'}
                </h2>
                <div className="author-income-drawer-subtitle">
                  {selectedAuthor.author_username
                    ? `@${selectedAuthor.author_username}`
                    : selectedAuthor.author_user_id || '-'}
                  {' · '}
                  {formatNumber(selectedAuthor.transaction_count)} transactions
                </div>
              </div>

              <button
                className="author-income-close"
                type="button"
                onClick={closeAuthor}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="author-income-drawer-body">
              <section className="author-income-detail-summary">
                <div className="author-income-detail-card">
                  <div className="author-income-detail-label">Paid Diamonds</div>
                  <div className="author-income-detail-value">
                    {formatNumber(selectedAuthor.paid_diamonds)} D
                  </div>
                </div>

                <div className="author-income-detail-card">
                  <div className="author-income-detail-label">Author Earned</div>
                  <div className="author-income-detail-value">
                    {formatNumber(selectedAuthor.author_earned_diamonds)} D
                  </div>
                </div>

                <div className="author-income-detail-card">
                  <div className="author-income-detail-label">Platform Earned</div>
                  <div className="author-income-detail-value">
                    {formatNumber(selectedAuthor.platform_earned_diamonds)} D
                  </div>
                </div>

                <div className="author-income-detail-card">
                  <div className="author-income-detail-label">Pending Payout</div>
                  <div className="author-income-detail-value">
                    {formatUsd(selectedAuthor.pending_payout_usd)}
                  </div>
                </div>
              </section>

              {detailMessage ? (
                <div className="author-income-message">{detailMessage}</div>
              ) : null}

              {!detailLoading &&
              !detailMessage &&
              detailTransactions.length === 0 ? (
                <div className="author-income-empty">
                  No transactions found.
                </div>
              ) : null}

              <div className="author-income-detail-list">
                {detailTransactions.map((transaction) => (
                  <article
                    className="author-income-transaction"
                    key={transaction.id}
                  >
                    <div className="author-income-transaction-head">
                      <div>
                        <div className="author-income-transaction-title">
                          {transaction.story?.title || 'Author Income'}
                        </div>
                        <div className="author-income-transaction-sub">
                          {transaction.episode
                            ? `EP ${formatNumber(
                                transaction.episode.episode_number
                              )}${
                                transaction.episode.title
                                  ? ` · ${transaction.episode.title}`
                                  : ''
                              }`
                            : transaction.source_type || 'Transaction'}
                        </div>
                      </div>

                      <span className={`author-income-status ${transaction.earning_status || ''}`}>
                        {transaction.earning_status || 'unknown'}
                      </span>
                    </div>

                    <div className="author-income-transaction-grid">
                      <div className="author-income-field">
                        <div className="author-income-field-label">Reader</div>
                        <div className="author-income-field-value">
                          {transaction.reader?.name ||
                            transaction.reader?.username ||
                            '-'}
                          {transaction.reader?.username
                            ? ` (@${transaction.reader.username})`
                            : ''}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Paid / Net</div>
                        <div className="author-income-field-value">
                          {formatNumber(transaction.paid_diamonds)} D /{' '}
                          {formatNumber(transaction.net_paid_diamonds)} D
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Share</div>
                        <div className="author-income-field-value">
                          {formatNumber(transaction.author_share_percent)}% ·{' '}
                          {transaction.share_source || '-'}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Date</div>
                        <div className="author-income-field-value">
                          {formatDateTime(transaction.created_at)}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Author Earned</div>
                        <div className="author-income-field-value">
                          {formatNumber(transaction.author_earned_diamonds)} D ·{' '}
                          {formatUsd(transaction.author_earnings_usd)}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Platform Earned</div>
                        <div className="author-income-field-value">
                          {formatNumber(transaction.platform_earned_diamonds)} D ·{' '}
                          {formatUsd(transaction.platform_income_usd)}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Author Net Payout</div>
                        <div className="author-income-field-value">
                          {formatUsd(transaction.author_net_payout_usd)}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Withholding</div>
                        <div className="author-income-field-value">
                          {formatNumber(transaction.withholding_percent)}% ·{' '}
                          {formatUsd(transaction.withholding_amount_usd)}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Purchase Ref</div>
                        <div className="author-income-field-value">
                          {transaction.purchase_reference || '-'}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Transaction Ref</div>
                        <div className="author-income-field-value">
                          {transaction.transaction_reference || '-'}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Reader Email</div>
                        <div className="author-income-field-value">
                          {transaction.reader?.email || '-'}
                        </div>
                      </div>

                      <div className="author-income-field">
                        <div className="author-income-field-label">Available At</div>
                        <div className="author-income-field-value">
                          {formatDateTime(transaction.available_at)}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="author-income-detail-footer">
                <div className="author-income-page-info">
                  {detailLoading
                    ? 'Loading transactions...'
                    : `Page ${detailPagination.page || 1} of ${
                        detailPagination.total_pages || 0
                      } · ${formatNumber(
                        detailPagination.total
                      )} transactions`}
                </div>

                <div className="author-income-pager">
                  <button
                    className="author-income-button secondary"
                    type="button"
                    disabled={
                      detailLoading ||
                      !detailPagination.has_prev
                    }
                    onClick={() =>
                      setDetailPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                  >
                    Previous
                  </button>

                  <button
                    className="author-income-button secondary"
                    type="button"
                    disabled={
                      detailLoading ||
                      !detailPagination.has_next
                    }
                    onClick={() =>
                      setDetailPage((current) => current + 1)
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </AdminLayout>
  )
}
