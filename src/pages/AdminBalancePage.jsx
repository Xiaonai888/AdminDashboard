import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 20
const CACHE_TTL_MS = 60 * 1000
const CACHE_MAX_ENTRIES = 100
const pageCache = new Map()

const styles = `
  .balance-page {
    display: grid;
    gap: 18px;
  }

  .balance-toolbar {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) auto auto;
    gap: 10px;
    align-items: center;
  }

  .balance-search,
  .balance-button {
    height: 44px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #FFFFFF;
    color: #0F172A;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
  }

  .balance-search {
    width: 100%;
    padding: 0 14px;
    outline: none;
  }

  .balance-search:focus {
    border-color: #A5B4FC;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.10);
  }

  .balance-button {
    padding: 0 15px;
    cursor: pointer;
    white-space: nowrap;
  }

  .balance-button:hover {
    border-color: #C7D2FE;
    background: #F8FAFF;
  }

  .balance-button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .balance-sort {
    color: #4338CA;
    background: #EEF2FF;
    border-color: #C7D2FE;
  }

  .balance-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .balance-chip {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 11px;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    background: #FFFFFF;
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .balance-chip.primary {
    border-color: #C7D2FE;
    background: #EEF2FF;
    color: #4338CA;
  }

  .balance-panel {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    background: #FFFFFF;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
  }

  .balance-table-wrap {
    overflow-x: auto;
  }

  .balance-table {
    width: 100%;
    min-width: 980px;
    border-collapse: collapse;
  }

  .balance-table th {
    padding: 13px 16px;
    background: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    letter-spacing: .04em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .balance-table td {
    padding: 15px 16px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 750;
    vertical-align: middle;
  }

  .balance-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .balance-rank {
    width: 62px;
    color: #94A3B8;
    font-weight: 900;
  }

  .balance-reader {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 220px;
  }

  .balance-avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 999px;
    background: #EEF2FF;
    color: #4338CA;
    font-size: 13px;
    font-weight: 950;
  }

  .balance-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .balance-name {
    font-weight: 950;
  }

  .balance-username {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 12px;
    font-weight: 750;
  }

  .balance-diamond {
    color: #2563EB;
    font-size: 15px;
    font-weight: 950;
    white-space: nowrap;
  }

  .balance-number {
    font-weight: 900;
    white-space: nowrap;
  }

  .balance-muted {
    color: #94A3B8;
    font-size: 12px;
    white-space: nowrap;
  }

  .balance-state {
    padding: 54px 20px;
    text-align: center;
    color: #64748B;
    font-size: 13px;
    font-weight: 850;
  }

  .balance-error {
    border: 1px solid #FECACA;
    border-radius: 14px;
    background: #FEF2F2;
    color: #B91C1C;
    padding: 12px 14px;
    font-size: 12px;
    font-weight: 850;
  }

  .balance-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-top: 1px solid #E2E8F0;
    background: #FFFFFF;
  }

  .balance-page-info {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .balance-pager {
    display: flex;
    gap: 8px;
  }

  @media (max-width: 760px) {
    .balance-toolbar {
      grid-template-columns: 1fr;
    }

    .balance-button {
      width: 100%;
    }

    .balance-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .balance-pager {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token')
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
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

function cacheKey({ page, search, sort }) {
  return JSON.stringify([
    page,
    search.trim().toLowerCase(),
    sort,
  ])
}

function readCache(key) {
  const cached = pageCache.get(key)

  if (!cached) return null

  if (Date.now() >= cached.expiresAt) {
    pageCache.delete(key)
    return null
  }

  return cached.data
}

function writeCache(key, data) {
  const now = Date.now()

  for (const [entryKey, entry] of pageCache) {
    if (now >= entry.expiresAt) {
      pageCache.delete(entryKey)
    }
  }

  if (pageCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = pageCache.keys().next().value

    if (oldestKey) {
      pageCache.delete(oldestKey)
    }
  }

  pageCache.set(key, {
    data,
    expiresAt: now + CACHE_TTL_MS,
  })
}

async function readResponse(response) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
      `Request failed with status ${response.status}`
    )

    error.status = response.status
    error.retryAfter = Number(
      data?.retry_after_seconds ||
      response.headers.get('Retry-After') ||
      0
    )

    throw error
  }

  return data
}

async function loadBalancePage({
  page,
  search,
  sort,
  refresh = false,
  signal,
}) {
  const key = cacheKey({ page, search, sort })

  if (!refresh) {
    const cached = readCache(key)

    if (cached) {
      return {
        data: cached,
        source: 'browser-cache',
      }
    }
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    sort,
  })

  if (search) {
    params.set('q', search)
  }

  if (refresh) {
    params.set('refresh', '1')
  }

  const token = getAdminToken()
  const response = await fetch(
    `${API_URL}/api/admin/balance?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }
  )

  const data = await readResponse(response)

  writeCache(key, data)

  return {
    data,
    source: data?.cached ? 'server-cache' : 'database',
  }
}

function ReaderAvatar({ item }) {
  const [failed, setFailed] = useState(false)
  const imageUrl = item?.avatar_url || ''
  const showImage = imageUrl && !failed
  const initial = String(
    item?.name ||
    item?.username ||
    'R'
  )
    .trim()
    .slice(0, 1)
    .toUpperCase()

  return (
    <div className="balance-avatar">
      {showImage ? (
        <img
          src={imageUrl}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  )
}

export default function AdminBalancePage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('desc')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    has_prev: false,
    has_next: false,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState('')
  const requestIdRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    async function run() {
      try {
        setLoading(true)
        setError('')

        const result = await loadBalancePage({
          page,
          search: debouncedSearch,
          sort,
          signal: controller.signal,
        })

        if (requestId !== requestIdRef.current) return

        const data = result.data || {}

        setItems(Array.isArray(data.items) ? data.items : [])
        setPagination(
          data.pagination || {
            page,
            limit: PAGE_SIZE,
            has_prev: page > 1,
            has_next: false,
          }
        )
        setSource(result.source)

        if (data.pagination?.has_next) {
          loadBalancePage({
            page: page + 1,
            search: debouncedSearch,
            sort,
            signal: controller.signal,
          }).catch(() => {})
        }
      } catch (loadError) {
        if (loadError?.name === 'AbortError') return
        if (requestId !== requestIdRef.current) return

        setItems([])
        setError(
          loadError?.status === 429 && loadError?.retryAfter
            ? `Too many requests. Try again in ${loadError.retryAfter}s.`
            : loadError?.message || 'Failed to load balances'
        )
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }

    run()

    return () => controller.abort()
  }, [page, debouncedSearch, sort])

  const orderLabel = useMemo(
    () =>
      sort === 'desc'
        ? 'Diamond: High → Low'
        : 'Diamond: Low → High',
    [sort]
  )

  async function refreshCurrentPage() {
    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    try {
      setRefreshing(true)
      setError('')

      const key = cacheKey({
        page,
        search: debouncedSearch,
        sort,
      })

      pageCache.delete(key)

      const result = await loadBalancePage({
        page,
        search: debouncedSearch,
        sort,
        refresh: true,
        signal: controller.signal,
      })

      if (requestId !== requestIdRef.current) return

      const data = result.data || {}

      setItems(Array.isArray(data.items) ? data.items : [])
      setPagination(
        data.pagination || {
          page,
          limit: PAGE_SIZE,
          has_prev: page > 1,
          has_next: false,
        }
      )
      setSource(result.source)
    } catch (refreshError) {
      if (refreshError?.name === 'AbortError') return
      if (requestId !== requestIdRef.current) return

      setError(
        refreshError?.status === 429 &&
        refreshError?.retryAfter
          ? `Too many requests. Try again in ${refreshError.retryAfter}s.`
          : refreshError?.message || 'Failed to refresh balances'
      )
    } finally {
      if (requestId === requestIdRef.current) {
        setRefreshing(false)
      }
    }
  }

  function toggleSort() {
    setSort((current) =>
      current === 'desc' ? 'asc' : 'desc'
    )
    setPage(1)
  }

  return (
    <AdminLayout
      title="Balance"
      subtitle="Reader wallet balances ranked by Diamonds."
    >
      <style>{styles}</style>

      <div className="balance-page">
        <div className="balance-toolbar">
          <input
            className="balance-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or username"
            autoComplete="off"
          />

          <button
            type="button"
            className="balance-button balance-sort"
            onClick={toggleSort}
            disabled={loading}
          >
            ⇅ {orderLabel}
          </button>

          <button
            type="button"
            className="balance-button"
            onClick={refreshCurrentPage}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className="balance-meta">
          <span className="balance-chip primary">
            20 readers per request
          </span>
          <span className="balance-chip">
            Page {pagination.page || page}
          </span>
          {source ? (
            <span className="balance-chip">
              Source: {source}
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="balance-error">{error}</div>
        ) : null}

        <section className="balance-panel">
          <div className="balance-table-wrap">
            <table className="balance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reader</th>
                  <th>Diamond</th>
                  <th>Coin</th>
                  <th>Voucher</th>
                  <th>Story Card</th>
                  <th>Wallet Updated</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">
                      <div className="balance-state">
                        Loading balances…
                      </div>
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((item, index) => (
                    <tr key={item.user_id}>
                      <td className="balance-rank">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td>
                        <div className="balance-reader">
                          <ReaderAvatar item={item} />
                          <div>
                            <div className="balance-name">
                              {item.name ||
                                item.username ||
                                'Reader'}
                            </div>
                            <div className="balance-username">
                              {item.username
                                ? `@${item.username}`
                                : 'No username'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="balance-diamond">
                        💎 {formatNumber(item.diamond_balance)}
                      </td>
                      <td className="balance-number">
                        {formatNumber(item.coin_balance)}
                      </td>
                      <td className="balance-number">
                        {formatNumber(item.voucher_balance)}
                      </td>
                      <td className="balance-number">
                        {formatNumber(item.story_card_balance)}
                      </td>
                      <td className="balance-muted">
                        {formatDateTime(item.wallet_updated_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="balance-state">
                        No readers found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="balance-footer">
            <div className="balance-page-info">
              {orderLabel}
            </div>

            <div className="balance-pager">
              <button
                type="button"
                className="balance-button"
                disabled={
                  loading ||
                  !pagination.has_prev
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
              >
                Previous
              </button>

              <button
                type="button"
                className="balance-button"
                disabled={
                  loading ||
                  !pagination.has_next
                }
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
    </AdminLayout>
  )
}
