import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const PAGE_SIZE = 20
const CACHE_TTL_MS = 60 * 1000
const CACHE_MAX_ENTRIES = 100
const pageCache = new Map()
const historyCache = new Map()

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

  .balance-row {
    cursor: pointer;
    transition: background .15s ease;
  }

  .balance-row:hover,
  .balance-row:focus {
    background: #F8FAFF;
    outline: none;
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

  .balance-avatar.large {
    width: 52px;
    height: 52px;
    flex-basis: 52px;
    font-size: 17px;
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

  .balance-drawer-layer {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, .42);
  }

  .balance-drawer {
    width: min(560px, 94vw);
    height: 100dvh;
    overflow-y: auto;
    background: #FFFFFF;
    box-shadow: -20px 0 48px rgba(15, 23, 42, .18);
  }

  .balance-drawer-header {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
    padding: 20px;
    border-bottom: 1px solid #E2E8F0;
    background: rgba(255, 255, 255, .96);
    backdrop-filter: blur(14px);
  }

  .balance-drawer-reader {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .balance-drawer-title {
    margin: 0;
    color: #0F172A;
    font-size: 18px;
    font-weight: 950;
  }

  .balance-drawer-close {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #475569;
    font-size: 22px;
    cursor: pointer;
  }

  .balance-wallet-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    padding: 18px 20px;
  }

  .balance-wallet-card {
    min-width: 0;
    padding: 13px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #F8FAFC;
  }

  .balance-wallet-label {
    color: #64748B;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .balance-wallet-value {
    margin-top: 6px;
    color: #0F172A;
    font-size: 16px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .balance-history-head {
    padding: 2px 20px 12px;
  }

  .balance-history-head h3 {
    margin: 0;
    color: #0F172A;
    font-size: 15px;
    font-weight: 950;
  }

  .balance-history-head p {
    margin: 4px 0 0;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 750;
  }

  .balance-history-list {
    display: grid;
    gap: 10px;
    padding: 0 20px 20px;
  }

  .balance-history-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    padding: 14px;
    border: 1px solid #E2E8F0;
    border-radius: 15px;
    background: #FFFFFF;
  }

  .balance-history-title {
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
  }

  .balance-history-detail {
    margin-top: 5px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.45;
  }

  .balance-history-date {
    margin-top: 6px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 750;
  }

  .balance-history-amount {
    align-self: start;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 950;
  }

  .balance-history-amount.credit {
    color: #059669;
  }

  .balance-history-amount.debit {
    color: #DC2626;
  }

  .balance-history-load {
    width: 100%;
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

    .balance-wallet-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
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

function formatMoney(value) {
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

function cacheKey({ page, search, sort }) {
  return JSON.stringify([
    page,
    search.trim().toLowerCase(),
    sort,
  ])
}

function historyCacheKey(userId, cursor) {
  return JSON.stringify([
    userId,
    cursor?.created_at || '',
    cursor?.event_key || '',
  ])
}

function readTimedCache(map, key) {
  const cached = map.get(key)

  if (!cached) return null

  if (Date.now() >= cached.expiresAt) {
    map.delete(key)
    return null
  }

  return cached.data
}

function writeTimedCache(map, key, data) {
  const now = Date.now()

  for (const [entryKey, entry] of map) {
    if (now >= entry.expiresAt) {
      map.delete(entryKey)
    }
  }

  if (map.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = map.keys().next().value

    if (oldestKey) {
      map.delete(oldestKey)
    }
  }

  map.set(key, {
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
    const cached = readTimedCache(pageCache, key)

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

  if (search) params.set('q', search)
  if (refresh) params.set('refresh', '1')

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

  writeTimedCache(pageCache, key, data)

  return {
    data,
    source: data?.cached ? 'server-cache' : 'database',
  }
}

async function loadDiamondHistory({
  userId,
  cursor = null,
  signal,
}) {
  const key = historyCacheKey(userId, cursor)
  const cached = readTimedCache(historyCache, key)

  if (cached) return cached

  const params = new URLSearchParams({
    limit: '20',
  })

  if (cursor?.created_at && cursor?.event_key) {
    params.set('before', cursor.created_at)
    params.set('before_key', cursor.event_key)
  }

  const token = getAdminToken()
  const response = await fetch(
    `${API_URL}/api/admin/balance/${encodeURIComponent(userId)}/diamond-history?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }
  )

  const data = await readResponse(response)
  writeTimedCache(historyCache, key, data)

  return data
}

function ReaderAvatar({ item, large = false }) {
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
    <div className={`balance-avatar ${large ? 'large' : ''}`}>
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

function historyDetail(item) {
  const parts = []

  if (item.author_name) {
    parts.push(`Author: ${item.author_name}`)
  }

  if (item.story_title) {
    parts.push(`Story: ${item.story_title}`)
  }

  if (item.episode_number) {
    parts.push(
      `EP ${item.episode_number}${
        item.episode_title
          ? ` — ${item.episode_title}`
          : ''
      }`
    )
  }

  if (
    item.event_type === 'purchase' &&
    Number(item.amount_usd || 0) > 0
  ) {
    parts.push(formatMoney(item.amount_usd))
  }

  if (item.order_id) {
    parts.push(`Order: ${item.order_id}`)
  }

  if (!parts.length && item.detail) {
    parts.push(item.detail)
  }

  return parts.join(' • ')
}

function DiamondHistoryDrawer({
  reader,
  items,
  pagination,
  loading,
  loadingMore,
  error,
  onClose,
  onLoadMore,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!reader) return null

  return (
    <div
      className="balance-drawer-layer"
      role="presentation"
      onMouseDown={onClose}
    >
      <aside
        className="balance-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Reader Diamond history"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="balance-drawer-header">
          <div className="balance-drawer-reader">
            <ReaderAvatar item={reader} large />
            <div>
              <h2 className="balance-drawer-title">
                {reader.name || reader.username || 'Reader'}
              </h2>
              <div className="balance-username">
                {reader.username
                  ? `@${reader.username}`
                  : 'No username'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="balance-drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="balance-wallet-grid">
          <div className="balance-wallet-card">
            <div className="balance-wallet-label">Diamond</div>
            <div className="balance-wallet-value">
              💎 {formatNumber(reader.diamond_balance)}
            </div>
          </div>

          <div className="balance-wallet-card">
            <div className="balance-wallet-label">Coin</div>
            <div className="balance-wallet-value">
              {formatNumber(reader.coin_balance)}
            </div>
          </div>

          <div className="balance-wallet-card">
            <div className="balance-wallet-label">Voucher</div>
            <div className="balance-wallet-value">
              {formatNumber(reader.voucher_balance)}
            </div>
          </div>

          <div className="balance-wallet-card">
            <div className="balance-wallet-label">Story Card</div>
            <div className="balance-wallet-value">
              {formatNumber(reader.story_card_balance)}
            </div>
          </div>
        </div>

        <div className="balance-history-head">
          <h3>Diamond History</h3>
          <p>Loads 20 transactions at a time.</p>
        </div>

        <div className="balance-history-list">
          {error ? (
            <div className="balance-error">{error}</div>
          ) : null}

          {loading ? (
            <div className="balance-state">
              Loading Diamond history…
            </div>
          ) : items.length ? (
            items.map((item) => (
              <div
                className="balance-history-item"
                key={item.event_key}
              >
                <div>
                  <div className="balance-history-title">
                    {item.title || 'Diamond Transaction'}
                  </div>
                  <div className="balance-history-detail">
                    {historyDetail(item) || '-'}
                  </div>
                  <div className="balance-history-date">
                    {formatDateTime(item.created_at)}
                  </div>
                </div>

                <div
                  className={`balance-history-amount ${
                    item.direction === 'credit'
                      ? 'credit'
                      : 'debit'
                  }`}
                >
                  {item.direction === 'credit' ? '+' : '-'}
                  {formatNumber(item.amount_diamonds)} 💎
                </div>
              </div>
            ))
          ) : (
            <div className="balance-state">
              No Diamond history found.
            </div>
          )}

          {pagination?.has_next ? (
            <button
              type="button"
              className="balance-button balance-history-load"
              onClick={onLoadMore}
              disabled={loadingMore}
            >
              {loadingMore
                ? 'Loading…'
                : 'Load 20 more'}
            </button>
          ) : null}
        </div>
      </aside>
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
  const [selectedReader, setSelectedReader] = useState(null)
  const [historyItems, setHistoryItems] = useState([])
  const [historyPagination, setHistoryPagination] = useState({
    has_next: false,
    next_cursor: null,
  })
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const requestIdRef = useRef(0)
  const historyRequestIdRef = useRef(0)

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
          loadError?.status === 429 &&
          loadError?.retryAfter
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

  async function openReaderHistory(reader) {
    const requestId = ++historyRequestIdRef.current
    const controller = new AbortController()

    setSelectedReader(reader)
    setHistoryItems([])
    setHistoryPagination({
      has_next: false,
      next_cursor: null,
    })
    setHistoryError('')
    setHistoryLoading(true)

    try {
      const data = await loadDiamondHistory({
        userId: reader.user_id,
        signal: controller.signal,
      })

      if (requestId !== historyRequestIdRef.current) return

      setHistoryItems(
        Array.isArray(data?.items) ? data.items : []
      )
      setHistoryPagination(
        data?.pagination || {
          has_next: false,
          next_cursor: null,
        }
      )
    } catch (historyLoadError) {
      if (historyLoadError?.name === 'AbortError') return
      if (requestId !== historyRequestIdRef.current) return

      setHistoryError(
        historyLoadError?.status === 429 &&
        historyLoadError?.retryAfter
          ? `Too many requests. Try again in ${historyLoadError.retryAfter}s.`
          : historyLoadError?.message ||
            'Failed to load Diamond history'
      )
    } finally {
      if (requestId === historyRequestIdRef.current) {
        setHistoryLoading(false)
      }
    }
  }

  async function loadMoreHistory() {
    if (
      !selectedReader?.user_id ||
      !historyPagination?.has_next ||
      !historyPagination?.next_cursor ||
      historyLoadingMore
    ) {
      return
    }

    const requestId = ++historyRequestIdRef.current
    const controller = new AbortController()

    try {
      setHistoryLoadingMore(true)
      setHistoryError('')

      const data = await loadDiamondHistory({
        userId: selectedReader.user_id,
        cursor: historyPagination.next_cursor,
        signal: controller.signal,
      })

      if (requestId !== historyRequestIdRef.current) return

      const nextItems = Array.isArray(data?.items)
        ? data.items
        : []

      setHistoryItems((current) => {
        const map = new Map(
          current.map((item) => [item.event_key, item])
        )

        for (const item of nextItems) {
          map.set(item.event_key, item)
        }

        return [...map.values()]
      })

      setHistoryPagination(
        data?.pagination || {
          has_next: false,
          next_cursor: null,
        }
      )
    } catch (historyLoadError) {
      if (historyLoadError?.name === 'AbortError') return
      if (requestId !== historyRequestIdRef.current) return

      setHistoryError(
        historyLoadError?.status === 429 &&
        historyLoadError?.retryAfter
          ? `Too many requests. Try again in ${historyLoadError.retryAfter}s.`
          : historyLoadError?.message ||
            'Failed to load more history'
      )
    } finally {
      if (requestId === historyRequestIdRef.current) {
        setHistoryLoadingMore(false)
      }
    }
  }

  function closeReaderHistory() {
    historyRequestIdRef.current += 1
    setSelectedReader(null)
    setHistoryItems([])
    setHistoryError('')
    setHistoryLoading(false)
    setHistoryLoadingMore(false)
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
            onChange={(event) =>
              setSearch(event.target.value)
            }
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
                    <tr
                      className="balance-row"
                      key={item.user_id}
                      tabIndex={0}
                      onClick={() => openReaderHistory(item)}
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault()
                          openReaderHistory(item)
                        }
                      }}
                    >
                      <td className="balance-rank">
                        {(page - 1) * PAGE_SIZE +
                          index +
                          1}
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
                        {formatDateTime(
                          item.wallet_updated_at
                        )}
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

      <DiamondHistoryDrawer
        reader={selectedReader}
        items={historyItems}
        pagination={historyPagination}
        loading={historyLoading}
        loadingMore={historyLoadingMore}
        error={historyError}
        onClose={closeReaderHistory}
        onLoadMore={loadMoreHistory}
      />
    </AdminLayout>
  )
}
