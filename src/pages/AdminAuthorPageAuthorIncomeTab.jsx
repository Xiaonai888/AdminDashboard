import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20

function authToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function money(value) {
  return Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function integer(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function dateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function localDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function presetRange(key) {
  if (key === 'all' || key === 'custom') return { from: '', to: '' }
  const today = new Date()
  let from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (key === 'week') from.setDate(from.getDate() - ((from.getDay() + 6) % 7))
  if (key === 'month') from = new Date(today.getFullYear(), today.getMonth(), 1)
  if (key === 'year') from = new Date(today.getFullYear(), 0, 1)
  return { from: localDay(from), to: localDay(today) }
}

function dateBoundary(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00+07:00` : value
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }
  return data
}

function ReverseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3v18m0-18L3 7m4-4 4 4M17 21V3m0 18 4-4m-4 4-4-4" />
    </svg>
  )
}

function SummaryCard({ label, value, caption }) {
  return (
    <div className="author-income-card">
      <div className="author-income-card-label">{label}</div>
      <div className="author-income-card-value">{value}</div>
      <div className="author-income-card-sub">{caption}</div>
    </div>
  )
}

function DetailField({ label, value }) {
  return (
    <div className="author-income-field">
      <div className="author-income-field-label">{label}</div>
      <div className="author-income-field-value">{value}</div>
    </div>
  )
}

export default function AdminAuthorPageAuthorIncomeTab() {
  const [draftSearch, setDraftSearch] = useState('')
  const [rangeKey, setRangeKey] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [productType, setProductType] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortField, setSortField] = useState('author_earned')
  const [sortDirection, setSortDirection] = useState('desc')
  const [filters, setFilters] = useState({ q: '', from: '', to: '', type: 'all', status: 'all', sort: 'author_earned_desc' })
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [detailPage, setDetailPage] = useState(1)
  const [detailResult, setDetailResult] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const requestKey = useMemo(() => JSON.stringify([page, filters]), [page, filters])
  const authorId = selectedAuthor?.author_user_id || selectedAuthor?.author_page_id || ''
  const detailKey = useMemo(() => JSON.stringify([authorId, detailPage, filters.from, filters.to, filters.type]), [authorId, detailPage, filters.from, filters.to, filters.type])

  const summary = result?.summary || {}
  const rows = Array.isArray(result?.items) ? result.items : []
  const pagination = result?.pagination || {}
  const transactions = Array.isArray(detailResult?.transactions) ? detailResult.transactions : []
  const detailPagination = detailResult?.pagination || {}

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setMessage('')
      try {
        const params = new URLSearchParams({
          page: String(page), limit: String(PAGE_SIZE), status: filters.status,
          type: filters.type, sort: filters.sort,
        })
        if (filters.q) params.set('q', filters.q)
        if (filters.from) params.set('from', filters.from)
        if (filters.to) params.set('to', filters.to)
        const response = await fetch(`${API_URL}/api/admin/income/author-page/authors?${params}`, {
          headers: { Authorization: `Bearer ${authToken()}` }, signal: controller.signal,
        })
        const data = await readResponse(response)
        if (controller.signal.aborted) return
        setResult(data)
        if (data.truncated_source_scan) setMessage('The source scan reached its limit. Totals may be incomplete.')
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult(null)
          setMessage(error.message || 'Failed to load Book/PDF author income')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [requestKey])

  useEffect(() => {
    if (!authorId) return undefined
    const controller = new AbortController()
    async function load() {
      setDetailLoading(true)
      setDetailError('')
      try {
        const params = new URLSearchParams({ page: String(detailPage), limit: String(PAGE_SIZE), type: filters.type })
        if (filters.from) params.set('from', filters.from)
        if (filters.to) params.set('to', filters.to)
        const response = await fetch(`${API_URL}/api/admin/income/author-page/authors/${encodeURIComponent(authorId)}/transactions?${params}`, {
          headers: { Authorization: `Bearer ${authToken()}` }, signal: controller.signal,
        })
        const data = await readResponse(response)
        if (controller.signal.aborted) return
        setDetailResult(data)
        if (data.truncated_source_scan) setDetailError('The source scan reached its limit. Some orders may be missing.')
      } catch (error) {
        if (!controller.signal.aborted) {
          setDetailResult(null)
          setDetailError(error.message || 'Failed to load Book/PDF orders')
        }
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [detailKey])

  useEffect(() => {
    if (!selectedAuthor) return undefined
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') setSelectedAuthor(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [selectedAuthor])

  function changeRange(event) {
    const value = event.target.value
    setRangeKey(value)
    if (value === 'custom') return
    const range = presetRange(value)
    setPage(1)
    setSelectedAuthor(null)
    setFilters((current) => ({ ...current, ...range }))
  }

  function apply(event) {
    event.preventDefault()
    const range = rangeKey === 'custom' ? { from: dateBoundary(customFrom), to: dateBoundary(customTo) } : presetRange(rangeKey)
    if (rangeKey === 'custom' && range.from && range.to && range.from > range.to) {
      setMessage('Custom start date must be before end date')
      return
    }
    setSelectedAuthor(null)
    setPage(1)
    setFilters({
      q: draftSearch.trim(), ...range, type: productType, status,
      sort: `${sortField}_${sortDirection}`,
    })
  }

  function changeSort(event) {
    const nextField = event.target.value
    setSortField(nextField)
    setPage(1)
    setSelectedAuthor(null)
    setFilters((current) => ({ ...current, sort: `${nextField}_${sortDirection}` }))
  }

  function reverseSort() {
    const next = sortDirection === 'desc' ? 'asc' : 'desc'
    setSortDirection(next)
    setPage(1)
    setSelectedAuthor(null)
    setFilters((current) => ({ ...current, sort: `${sortField}_${next}` }))
  }

  function reset() {
    setDraftSearch('')
    setRangeKey('all')
    setCustomFrom('')
    setCustomTo('')
    setProductType('all')
    setStatus('all')
    setSortField('author_earned')
    setSortDirection('desc')
    setSelectedAuthor(null)
    setPage(1)
    setFilters({ q: '', from: '', to: '', type: 'all', status: 'all', sort: 'author_earned_desc' })
  }

  function openAuthor(author) {
    setSelectedAuthor(author)
    setDetailPage(1)
    setDetailResult(null)
    setDetailError('')
  }

  return (
    <div className="author-income-page">
      <section className="author-income-summary">
        <SummaryCard label="Gross Sales" value={money(summary.gross_sales_usd)} caption="Paid Book/PDF product sales" />
        <SummaryCard label="Author Earnings" value={money(summary.author_earnings_usd)} caption="Author share from sales" />
        <SummaryCard label="Platform Earnings" value={money(summary.platform_income_usd)} caption="Platform fee from sales" />
        <SummaryCard label="Paid Orders" value={integer(summary.paid_orders)} caption={`${integer(summary.author_count)} authors`} />
        <SummaryCard label="Pending Payout" value={money(summary.pending_payout_usd)} caption="In review + approved" />
        <SummaryCard label="Paid Out" value={money(summary.paid_out_usd)} caption="Completed withdrawals" />
      </section>

      <form className="author-income-toolbar" onSubmit={apply}>
        <input className="author-income-input" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search author / username" />
        <select className="author-income-select" value={rangeKey} onChange={changeRange} aria-label="Book/PDF income time range">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Date &amp; Time</option>
        </select>
        <select className="author-income-select" value={productType} onChange={(event) => setProductType(event.target.value)} aria-label="Book/PDF product type">
          <option value="all">All Book/PDF</option>
          <option value="book">Book</option>
          <option value="pdf">PDF</option>
        </select>
        <select className="author-income-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Book/PDF payout status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="available">Available</option>
          <option value="paid">Paid</option>
          <option value="unknown">Unknown</option>
        </select>
        <select className="author-income-select" value={sortField} onChange={changeSort} aria-label="Sort Book/PDF author income">
          <option value="author_earned">Author Earned</option>
          <option value="gross_sales">Gross Sales</option>
          <option value="platform_earned">Platform Earned</option>
          <option value="transactions">Paid Orders</option>
          <option value="pending">Pending Payout</option>
          <option value="paid_out">Paid Out</option>
          <option value="latest">Latest Sale</option>
        </select>
        <button className={`author-income-reverse ${sortDirection === 'asc' ? 'is-asc' : ''}`} type="button" onClick={reverseSort} aria-label={sortDirection === 'desc' ? 'Reverse to low to high' : 'Reverse to top to low'} title={sortDirection === 'desc' ? 'Top → Low' : 'Low → Top'} disabled={loading}>
          <ReverseIcon />
        </button>
        <button className="author-income-sort-test" type="button" onClick={reverseSort} disabled={loading}>{sortDirection === 'desc' ? 'Test ↓' : 'Test ↑'}</button>
        <button className="author-income-button" type="submit" disabled={loading}>Apply</button>
        {rangeKey === 'custom' ? (
          <div className="author-income-custom-range">
            <input className="author-income-input" type="datetime-local" value={customFrom} max={customTo || undefined} onChange={(event) => setCustomFrom(event.target.value)} aria-label="Custom start" />
            <span className="author-income-range-arrow">→</span>
            <input className="author-income-input" type="datetime-local" value={customTo} min={customFrom || undefined} onChange={(event) => setCustomTo(event.target.value)} aria-label="Custom end" />
          </div>
        ) : null}
      </form>

      <div className="author-income-meta">
        <div className="author-income-chips">
          <span className="author-income-chip primary">Source: author_store</span>
          <span className="author-income-chip">{integer(pagination.total)} authors</span>
          <span className="author-income-chip">20 rows / page</span>
        </div>
        <button className="author-income-button secondary" type="button" onClick={reset} disabled={loading}>Reset Filters</button>
      </div>

      {filters.type !== 'all' && <div className="author-income-chip">Payout totals include both Books and PDFs.</div>}
      {message && <div className="author-income-message" role="alert">{message}</div>}

      <section className="author-income-panel">
        <div className="author-income-table-wrap">
          <table className="author-income-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Gross Sales</th>
                <th>Author Earned</th>
                <th>Platform Earned</th>
                <th>Paid Orders</th>
                <th>Pending Payout</th>
                <th>Paid Out</th>
                <th>Status</th>
                <th>Latest Sale</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr><td colSpan={9}><div className="author-income-empty">No Book/PDF author income found.</div></td></tr>
              )}
              {rows.map((author) => (
                <tr key={author.author_user_id || author.author_page_id} className="author-income-row" role="button" tabIndex={0} onClick={() => openAuthor(author)} onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openAuthor(author) }
                }}>
                  <td>
                    <div className="author-income-author">
                      <div className="author-income-author-name">{author.author_name || 'Unknown Author'}</div>
                      <div className="author-income-author-user">{author.author_username ? `@${author.author_username}` : author.author_user_id || '-'}</div>
                    </div>
                  </td>
                  <td><div className="author-income-number">{money(author.gross_sales_usd)}</div></td>
                  <td><div className="author-income-number">{money(author.author_earnings_usd)}</div></td>
                  <td><div className="author-income-number">{money(author.platform_income_usd)}</div></td>
                  <td><div className="author-income-number">{integer(author.transaction_count)}</div><div className="author-income-usd">{integer(author.book_orders)} Book / {integer(author.pdf_orders)} PDF</div></td>
                  <td><div className="author-income-number">{money(author.pending_payout_usd)}</div></td>
                  <td><div className="author-income-number">{money(author.paid_payout_usd)}</div></td>
                  <td><span className={`author-income-status ${author.payout_status || ''}`}>{author.payout_status || 'unknown'}</span></td>
                  <td>{dateTime(author.latest_income_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="author-income-footer">
          <div className="author-income-page-info">{loading ? 'Loading...' : `Page ${pagination.page || 1} of ${pagination.total_pages || 0}`}</div>
          <div className="author-income-pager">
            <button className="author-income-button secondary" type="button" disabled={loading || !pagination.has_prev} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
            <button className="author-income-button secondary" type="button" disabled={loading || !pagination.has_next} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </div>
      </section>

      {selectedAuthor && (
        <div className="author-income-overlay" onClick={() => setSelectedAuthor(null)}>
          <aside className="author-income-drawer" role="dialog" aria-modal="true" aria-label="Book/PDF author income details" onClick={(event) => event.stopPropagation()}>
            <div className="author-income-drawer-head">
              <div>
                <h2 className="author-income-drawer-title">{selectedAuthor.author_name || 'Unknown Author'}</h2>
                <div className="author-income-drawer-subtitle">Book/PDF Sales · {selectedAuthor.author_username ? `@${selectedAuthor.author_username}` : authorId}</div>
              </div>
              <button className="author-income-close" type="button" onClick={() => setSelectedAuthor(null)} aria-label="Close author details">×</button>
            </div>
            <div className="author-income-drawer-body">
              <section className="author-income-detail-summary">
                {[
                  ['Gross Sales', money(selectedAuthor.gross_sales_usd)],
                  ['Author Earned', money(selectedAuthor.author_earnings_usd)],
                  ['Platform Earned', money(selectedAuthor.platform_income_usd)],
                  ['Pending Payout', money(selectedAuthor.pending_payout_usd)],
                ].map(([label, value]) => (
                  <div className="author-income-detail-card" key={label}>
                    <div className="author-income-detail-label">{label}</div>
                    <div className="author-income-detail-value">{value}</div>
                  </div>
                ))}
              </section>
              {detailError && <div className="author-income-message" role="alert">{detailError}</div>}
              {detailLoading ? <div className="author-income-empty">Loading orders...</div> : !transactions.length ? <div className="author-income-empty">No Book/PDF orders found.</div> : (
                <div className="author-income-detail-list">
                  {transactions.map((transaction) => (
                    <article className="author-income-transaction" key={transaction.id}>
                      <div className="author-income-transaction-head">
                        <div>
                          <div className="author-income-transaction-title">Order {transaction.order_id || transaction.id}</div>
                          <div className="author-income-transaction-sub">{dateTime(transaction.paid_at || transaction.created_at)} · {transaction.order_status || 'Paid'}</div>
                        </div>
                        <span className="author-income-status paid">Paid</span>
                      </div>
                      <div className="author-income-transaction-grid">
                        <DetailField label="Gross Sales" value={money(transaction.gross_sales_usd)} />
                        <DetailField label="Author Earned" value={money(transaction.author_income_usd)} />
                        <DetailField label="Platform Earned" value={money(transaction.platform_fee_usd)} />
                        <DetailField label="Transaction Ref" value={transaction.aba_transaction_id || '-'} />
                        {(transaction.items || []).map((item, index) => (
                          <React.Fragment key={`${transaction.id}-${index}`}>
                            <DetailField label="Product" value={item.title} />
                            <DetailField label="Type" value={(item.product_type || 'unknown').toUpperCase()} />
                            <DetailField label="Quantity" value={integer(item.quantity)} />
                            <DetailField label="Product Total" value={money(item.total_usd)} />
                          </React.Fragment>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className="author-income-detail-footer">
                <div className="author-income-page-info">{detailLoading ? 'Loading...' : `Page ${detailPagination.page || 1} of ${detailPagination.total_pages || 0} · ${integer(detailPagination.total)} orders`}</div>
                <div className="author-income-pager">
                  <button className="author-income-button secondary" type="button" disabled={detailLoading || !detailPagination.has_prev} onClick={() => setDetailPage((current) => Math.max(1, current - 1))}>Previous</button>
                  <button className="author-income-button secondary" type="button" disabled={detailLoading || !detailPagination.has_next} onClick={() => setDetailPage((current) => current + 1)}>Next</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
