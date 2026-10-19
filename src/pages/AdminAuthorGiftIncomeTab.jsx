import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20
const CACHE_MS = 60 * 1000
const MAX_CACHE = 24
const cache = new Map()

function dateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthStart() {
  const date = new Date()
  return dateInput(new Date(date.getFullYear(), date.getMonth(), 1))
}

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function displayName(person) {
  return person?.page_name || person?.name || person?.username || person?.page_username || 'Unknown'
}

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function readCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.at >= CACHE_MS) {
    cache.delete(key)
    return null
  }
  cache.delete(key)
  cache.set(key, entry)
  return entry.result
}

function saveCache(key, result) {
  cache.delete(key)
  cache.set(key, { at: Date.now(), result })
  while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value)
}

const styles = `
  .author-gift-tab { display: grid; gap: 16px; color: #0f172a; }
  .author-gift-tab *, .author-gift-tab *::before, .author-gift-tab *::after { box-sizing: border-box; }
  .author-gift-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; }
  .author-gift-head h2 { font-size: 21px; font-weight: 850; margin: 0; }
  .author-gift-head p { margin: 5px 0 0; font-size: 12px; color: #64748b; }
  .author-gift-toolbar { display: flex; gap: 9px; flex-wrap: wrap; align-items: center; }
  .author-gift-toolbar input, .author-gift-toolbar select, .author-gift-toolbar button { border: 1px solid #dbe3ef; border-radius: 11px; padding: 10px 12px; font-size: 12px; background: white; color: #0f172a; min-height: 40px; }
  .author-gift-toolbar input[type="search"] { min-width: 230px; flex: 1 1 230px; }
  .author-gift-toolbar button { cursor: pointer; color: #4338ca; font-weight: 750; border-color: #c7d2fe; }
  .author-gift-toolbar button:disabled { cursor: not-allowed; opacity: .5; }
  .author-gift-cards { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
  .author-gift-card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; background: white; }
  .author-gift-card span { display: block; font-size: 10px; font-weight: 850; text-transform: uppercase; color: #64748b; }
  .author-gift-card strong { display: block; margin-top: 8px; font-size: 20px; overflow-wrap: anywhere; }
  .author-gift-note { font-size: 12px; color: #64748b; }
  .author-gift-error { padding: 12px; border: 1px solid #fecaca; border-radius: 12px; color: #991b1b; background: #fff1f2; font-size: 12px; }
  .author-gift-table-wrap { overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 14px; background: white; }
  .author-gift-table { width: 100%; min-width: 950px; border-collapse: collapse; }
  .author-gift-table th { padding: 13px 12px; text-align: left; background: #f8fafc; font-size: 10px; text-transform: uppercase; color: #64748b; }
  .author-gift-table td { border-top: 1px solid #f1f5f9; padding: 13px 12px; font-size: 12px; vertical-align: top; }
  .author-gift-table small { display: block; margin-top: 4px; color: #64748b; }
  .author-gift-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 12px; }
  .author-gift-footer button { border: 1px solid #dbe3ef; background: white; border-radius: 10px; padding: 9px 14px; cursor: pointer; }
  .author-gift-footer button:disabled { opacity: .45; cursor: not-allowed; }
  @media (max-width: 1000px) { .author-gift-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 520px) { .author-gift-cards { grid-template-columns: 1fr; } .author-gift-toolbar input[type="search"] { min-width: 100%; } }
`

export default function AdminAuthorGiftIncomeTab() {
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(() => dateInput(new Date()))
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const sequence = useRef(0)

  async function load({ force = false, signal } = {}) {
    const current = ++sequence.current
    const token = getToken()
    const params = new URLSearchParams({ from, to, page: String(page), limit: String(PAGE_SIZE) })
    if (query) params.set('q', query)
    if (status !== 'all') params.set('status', status)
    const key = `${token}|${params.toString()}`
    setLoading(true)
    setError('')

    if (!force) {
      const cached = readCache(key)
      if (cached) {
        setResult(cached)
        setLoading(false)
        return
      }
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/income/diamond-gifts?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load Gift Income.')
      }
      if (signal?.aborted || current !== sequence.current) return
      setResult(data)
      saveCache(key, data)
    } catch (failure) {
      if (signal?.aborted || current !== sequence.current) return
      setError(failure.message || 'Failed to load Gift Income.')
      setResult(null)
    } finally {
      if (!signal?.aborted && current === sequence.current) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    load({ signal: controller.signal })
    return () => controller.abort()
  }, [from, to, query, status, page])

  function applySearch(event) {
    event.preventDefault()
    const next = search.trim()
    if (next === query && page === 1) load({ force: true })
    else {
      setPage(1)
      setQuery(next)
    }
  }

  const summary = result?.summary || {}
  const pagination = result?.pagination || {}
  const rows = result?.transactions || []
  const cards = [
    ['Gift Transactions', summary.gift_transaction_count || 0],
    ['Paid Diamonds', `${Number(summary.total_gift_diamonds || 0).toLocaleString()} D`],
    ['Author Gift Income', formatUsd(summary.author_earnings_usd)],
    ['Platform Income', formatUsd(summary.platform_income_usd)],
    ['Pending Payout', formatUsd(summary.pending_payout_usd)],
  ]

  return (
    <div className="author-gift-tab">
      <style>{styles}</style>
      <div className="author-gift-head">
        <div>
          <h2>Gift Income</h2>
          <p>Gift earnings report only. Amounts remain included in existing author payouts.</p>
        </div>
        <div className="author-gift-toolbar">
          <input aria-label="Gift start date" type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1) }} />
          <input aria-label="Gift end date" type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1) }} />
          <button type="button" onClick={() => load({ force: true })} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>
      <div className="author-gift-cards">
        {cards.map(([name, value]) => <div key={name} className="author-gift-card"><span>{name}</span><strong>{loading && !result ? '...' : value}</strong></div>)}
      </div>
      <form className="author-gift-toolbar" onSubmit={applySearch}>
        <input type="search" aria-label="Search Gift Income" placeholder="Search reader, author, story or gift..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Gift payout status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="available">Available</option>
          <option value="paid">Paid</option>
          <option value="unknown">Unknown</option>
        </select>
        <button type="submit">Search</button>
      </form>
      {error ? <div role="alert" className="author-gift-error">{error}</div> : null}
      {result?.truncated_source_scan ? <div className="author-gift-note">Large result set: narrow the dates if older gifts are missing.</div> : null}
      <div className="author-gift-table-wrap">
        <table className="author-gift-table">
          <thead><tr><th>Time</th><th>Reader</th><th>Author</th><th>Gift / Story</th><th>Diamonds</th><th>Author Earned</th><th>Platform</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}<small>{String(item.id || '').slice(0, 8)}</small></td>
                <td>{displayName(item.buyer)}<small>{item.buyer?.username ? `@${item.buyer.username}` : ''}</small></td>
                <td>{displayName(item.author)}<small>{item.author?.page_username ? `@${item.author.page_username}` : ''}</small></td>
                <td>{item.gift_quantity || 1} × {item.gift_name || 'Gift'}<small>{item.source_label || item.story?.title || '-'}</small></td>
                <td>{Number(item.paid_diamonds || 0).toLocaleString()} D<small>{formatUsd(item.gross_value_usd)}</small></td>
                <td>{formatUsd(item.author_earnings_usd)}</td>
                <td>{formatUsd(item.platform_income_usd)}</td>
                <td>{item.earning_status || 'unknown'}</td>
              </tr>
            ))}
            {!loading && !rows.length ? <tr><td colSpan={8}>No Gift transactions found.</td></tr> : null}
            {loading && !rows.length ? <tr><td colSpan={8}>Loading Gift income...</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="author-gift-footer">
        <span>Page {pagination.page || page} of {pagination.total_pages || 1} · {Number(pagination.total || 0).toLocaleString()} records · 20 rows/page</span>
        <div className="author-gift-toolbar">
          <button type="button" disabled={loading || !pagination.has_prev} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <button type="button" disabled={loading || !pagination.has_next} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
