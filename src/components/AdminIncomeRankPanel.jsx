import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 20

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function shortId(value) {
  const text = String(value || '')
  if (text.length <= 10) return text
  return `${text.slice(0, 8)}...`
}

function copyText(value) {
  if (!value) return
  navigator.clipboard?.writeText(String(value)).catch(() => {})
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminIncomeRankPanel() {
  const [authors, setAuthors] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [meta, setMeta] = useState({
    cached: false,
    generated_at: null,
    month_start: null,
    cache_ttl_seconds: 900,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true

    async function loadIncomeRanking() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/ranking/income?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load income ranking')
        }

        if (!alive) return

        setAuthors(data.authors || data.rankings || [])
        setPagination({
          page: data.page || 1,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
        setMeta({
          cached: Boolean(data.cached),
          generated_at: data.generated_at || null,
          month_start: data.month_start || null,
          cache_ttl_seconds: Number(data.cache_ttl_seconds || 900),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load income ranking')
        setAuthors([])
        setPagination({
          page: 1,
          total: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        })
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadIncomeRanking()

    return () => {
      alive = false
    }
  }, [page, debouncedSearch, refreshKey])

  return (
    <>
      {error ? <div className="ranking-alert" style={{ margin: 16 }}>{error}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto', gap: 10, padding: 14, borderBottom: '1px solid #E2E8F0' }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search author name, username, or ID..."
          style={{
            width: '100%',
            height: 42,
            boxSizing: 'border-box',
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            color: '#0F172A',
            borderRadius: 13,
            padding: '0 13px',
            outline: 'none',
            font: 'inherit',
            fontSize: 13,
            fontWeight: 750,
          }}
        />
        <button
          type="button"
          className="ranking-btn"
          style={{ padding: '0 16px' }}
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </div>

      <div style={{ padding: '10px 18px', borderBottom: '1px solid #E2E8F0' }}>
        <div className="ranking-muted">
          Admin only · Total net author payout · This month starts {meta.month_start ? new Date(meta.month_start).toLocaleDateString('en-US') : '-'} · Updated {formatDateTime(meta.generated_at)} · Cache {Math.round(meta.cache_ttl_seconds / 60)} min · {meta.cached ? 'Cached data' : 'Fresh data'}
        </div>
      </div>

      <div className="ranking-table-wrap">
        <table className="ranking-table" style={{ minWidth: 1180 }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Author</th>
              <th>Author ID</th>
              <th>Total Income</th>
              <th>This Month</th>
              <th>Pending</th>
              <th>Paid</th>
              <th>Diamonds</th>
              <th>Transactions</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && authors.map((author) => (
              <tr key={author.id}>
                <td><span className="ranking-rank">#{author.rank}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 190 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 999,
                        overflow: 'hidden',
                        background: '#EEF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {author.avatar_url
                        ? <img src={author.avatar_url} alt={author.page_name || 'Author'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '👤'}
                    </div>
                    <div>
                      <div className="ranking-title">{author.page_name || 'Unknown Author'}</div>
                      <div className="ranking-muted">@{author.page_username || 'no_username'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <button type="button" className="ranking-id-btn" onClick={() => copyText(author.id)}>
                    {shortId(author.id)}
                  </button>
                </td>
                <td><span className="ranking-score">{formatMoney(author.total_income_usd)}</span></td>
                <td>{formatMoney(author.this_month_usd)}</td>
                <td>{formatMoney(author.pending_usd)}</td>
                <td>{formatMoney(author.paid_usd)}</td>
                <td>{formatNumber(author.total_diamonds)}</td>
                <td>{formatNumber(author.transaction_count)}</td>
                <td>
                  <span className={`ranking-status ${author.admin_status === 'active' ? 'green' : 'gray'}`}>
                    {author.admin_status || author.status || '-'}
                  </span>
                </td>
                <td>
                  <div className="ranking-actions">
                    <button type="button" onClick={() => copyText(author.id)}>Copy ID</button>
                    <button type="button" onClick={() => copyText(author.user_id)}>User ID</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <div className="ranking-loading">
            <span className="ranking-spinner" />
            <div className="ranking-empty-title">Loading Income Rank...</div>
            <div className="ranking-empty-text">Loading private author income ranking data.</div>
          </div>
        ) : !authors.length && !error ? (
          <div className="ranking-empty">
            <div className="ranking-empty-icon">💵</div>
            <div className="ranking-empty-title">No Income Rank data</div>
            <div className="ranking-empty-text">No author diamond earnings were found.</div>
          </div>
        ) : null}
      </div>

      <div className="ranking-pagination">
        <span>{formatNumber(pagination.total)} authors · Page {pagination.page} of {pagination.total_pages}</span>
        <button
          type="button"
          disabled={!pagination.has_prev || loading}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!pagination.has_next || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </>
  )
}
