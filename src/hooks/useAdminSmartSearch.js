import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Shared Admin search behavior. Each page supplies its own authorized API searcher.
// Usage:
// const { query, setQuery, items, loading, status, refresh } = useAdminSmartSearch({
//   searcher: ({ query, signal, limit }) => fetchPageResults(query, signal, limit),
//   scope: 'readers:all',
// })
// A searcher returns { items, has_next } (or an array) and must search on the server.

const DEFAULT_LIMIT = 10
const DEFAULT_DEBOUNCE = 400
const DEFAULT_CACHE_MS = 3 * 60 * 1000
const CACHE_MAX_ENTRIES = 40

const boundedInteger = (value, fallback, min, max) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback
}

export function normalizeAdminSearch(value, maxLength = 90) {
  const length = boundedInteger(maxLength, 90, 1, 500)
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/gu, '')
    .replace(/[\u0000-\u001F\u007F]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, length)
}

export function isAdminSearchReady(value, minLength = 2) {
  const normalized = normalizeAdminSearch(value)
  const meaningful = normalized.replace(/^@+/, '').trim()
  return Array.from(meaningful).length >= boundedInteger(minLength, 2, 1, 20)
}

function unpackResult(value, limit) {
  if (Array.isArray(value)) {
    return { items: value.slice(0, limit), hasNext: value.length > limit }
  }
  if (!value || typeof value !== 'object' || value.ok === false) {
    throw new Error(value?.message || 'Search returned an invalid response')
  }
  const items = Array.isArray(value.items)
    ? value.items
    : Array.isArray(value.results) ? value.results : null
  if (!items) throw new Error('Search response is missing items')
  return {
    items: items.slice(0, limit),
    hasNext: Boolean(value.has_next ?? value.hasNext ?? items.length > limit),
  }
}

export function useAdminSmartSearch({
  searcher,
  scope = 'default',
  limit = DEFAULT_LIMIT,
  minLength = 2,
  maxLength = 90,
  debounceMs = DEFAULT_DEBOUNCE,
  cacheMs = DEFAULT_CACHE_MS,
  initialQuery = '',
  enabled = true,
} = {}) {
  const [query, setQuery] = useState(() => String(initialQuery ?? ''))
  const [settledQuery, setSettledQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [state, setState] = useState({ key: '', items: [], hasNext: false, loading: false, error: '', fromCache: false })
  const cacheRef = useRef(new Map())
  // Store the latest adapter without re-running effects for inline callbacks.
  // Change scope when server-side filters or account identity change.
  const searcherRef = useRef(searcher)
  searcherRef.current = searcher
  const controllerRef = useRef(null)
  const bypassCacheRef = useRef(false)
  const normalizedQuery = useMemo(() => normalizeAdminSearch(query, maxLength), [query, maxLength])
  const valid = isAdminSearchReady(normalizedQuery, minLength)
  const pending = Boolean(enabled && valid && normalizedQuery !== settledQuery)
  const safeLimit = boundedInteger(limit, DEFAULT_LIMIT, 1, 100)
  const waitMs = boundedInteger(debounceMs, DEFAULT_DEBOUNCE, 0, 2000)
  const ttlMs = boundedInteger(cacheMs, DEFAULT_CACHE_MS, 0, 3600000)
  const activeKey = JSON.stringify([String(scope), normalizedQuery.toLocaleLowerCase(), safeLimit])

  // A keystroke cancels obsolete requests immediately, not after the debounce.
  useEffect(() => {
    controllerRef.current?.abort()
    if (!enabled || !valid) {
      setSettledQuery('')
      setState({ key: '', items: [], hasNext: false, loading: false, error: '', fromCache: false })
      return undefined
    }
    const timer = setTimeout(() => setSettledQuery(normalizedQuery), waitMs)
    return () => clearTimeout(timer)
  }, [normalizedQuery, valid, enabled, waitMs])

  useEffect(() => {
    if (!enabled || !valid || !settledQuery || settledQuery !== normalizedQuery) return undefined
    const controller = new AbortController()
    controllerRef.current = controller
    const key = JSON.stringify([String(scope), settledQuery.toLocaleLowerCase(), safeLimit])
    const now = Date.now()
    const cached = cacheRef.current.get(key)
    const force = bypassCacheRef.current
    bypassCacheRef.current = false

    if (!force && ttlMs > 0 && cached && cached.expires > now) {
      setState({ key, ...cached.data, loading: false, error: '', fromCache: true })
      return () => controller.abort()
    }

    setState({ key, items: [], hasNext: false, loading: true, error: '', fromCache: false })
    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return null
        if (typeof searcherRef.current !== 'function') throw new Error('A server-side searcher is required')
        return searcherRef.current({ query: settledQuery, signal: controller.signal, limit: safeLimit })
      })
      .then(result => {
        if (controller.signal.aborted || result === null) return
        const data = unpackResult(result, safeLimit)
        if (ttlMs > 0) {
          const cache = cacheRef.current
          cache.delete(key)
          cache.set(key, { data, expires: Date.now() + ttlMs })
          while (cache.size > CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value)
        }
        setState({ key, ...data, loading: false, error: '', fromCache: false })
      })
      .catch(error => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setState({ key, items: [], hasNext: false, loading: false, error: error?.message || 'Search failed', fromCache: false })
      })
    return () => controller.abort()
  }, [enabled, valid, normalizedQuery, settledQuery, scope, safeLimit, ttlMs, refreshKey])

  useEffect(() => () => controllerRef.current?.abort(), [])

  const refresh = useCallback(() => {
    bypassCacheRef.current = true
    setRefreshKey(value => value + 1)
  }, [])
  const clear = useCallback(() => setQuery(''), [])

  const status = !enabled || !normalizedQuery ? 'idle'
    : !valid ? 'too_short'
    : pending ? 'typing'
    : state.key !== activeKey ? 'loading'
    : state.loading ? 'loading'
    : state.error ? 'error' : 'ready'

  // Never show old results while a new query is being typed or is pending.
  return {
    query,
    setQuery,
    normalizedQuery,
    items: status === 'ready' ? state.items : [],
    hasNext: status === 'ready' ? state.hasNext : false,
    loading: status === 'typing' || status === 'loading',
    error: status === 'error' ? state.error : '',
    fromCache: status === 'ready' && state.fromCache,
    status,
    refresh,
    clear,
  }
}
