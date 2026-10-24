import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_PREFIX = 'shadow_admin_boost_report_v2:'
const DAY_MS = 86400000
const cache = new Map()
const pending = new Map()

export const PAGE_SIZE = 10

export function cambodiaToday() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function shiftDay(day, offset) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10)
}

export function reportRange(period, customStart, customEnd) {
  const yesterday = shiftDay(cambodiaToday(), -1)
  if (period === 'yesterday') return [yesterday, yesterday]
  if (period === 'last7') return [shiftDay(yesterday, -6), yesterday]
  if (period === 'last30') return [shiftDay(yesterday, -29), yesterday]
  return [customStart, customEnd]
}

function validDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function validRange(start, end) {
  return validDay(start) && validDay(end) && start <= end && end < cambodiaToday() &&
    Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`) <= 365 * DAY_MS
}

export function toNumber(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function formatNumber(value) {
  const n = toNumber(value)
  return n === null ? '—' : n.toLocaleString('en-US')
}

export function formatMoney(value) {
  const n = toNumber(value)
  return n === null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatPercent(value) {
  const n = toNumber(value)
  return n === null ? '—' : `${n.toFixed(1)}%`
}

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function fingerprint(token) {
  let h = 2166136261
  for (let index = 0; index < token.length; index += 1) h = Math.imul(h ^ token.charCodeAt(index), 16777619)
  return (h >>> 0).toString(16)
}

function requestParams({ audience, kind, start, end, page, search, sort }) {
  const params = new URLSearchParams({ audience, start, end, page: String(page), limit: String(PAGE_SIZE) })
  if (audience === 'author') {
    params.set('kind', kind)
    if (search) params.set('search', search)
    if (sort === 'top' || sort === 'low') params.set('sort', sort)
  }
  return params
}

function cacheKey(token, params) {
  return `${cambodiaToday()}:${fingerprint(token)}:${params}`
}

function removeCurrentCache() {
  const token = adminToken()
  const prefix = `${cambodiaToday()}:${fingerprint(token)}:`
  for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key)
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index)
      if (key && key.startsWith(CACHE_PREFIX + prefix)) sessionStorage.removeItem(key)
    }
  } catch {}
}

async function loadReport(options) {
  const token = adminToken()
  if (!token) throw new Error('Admin session required. Please sign in again.')
  const params = requestParams(options)
  const key = cacheKey(token, params)
  if (cache.has(key)) return cache.get(key)

  try {
    const stored = JSON.parse(sessionStorage.getItem(CACHE_PREFIX + key) || 'null')
    if (stored?.ok === true && stored.data && typeof stored.data === 'object') {
      cache.set(key, stored.data)
      return stored.data
    }
  } catch {}

  if (pending.has(key)) return pending.get(key)
  const promise = (async () => {
    const response = await fetch(`${API_URL}/api/admin/boost/insights?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      if (response.status === 404 || response.status === 503) throw new Error('Boost Analytics Backend or SQL has not been connected yet.')
      if (response.status === 401 || response.status === 403) throw new Error('Admin session expired or access denied.')
      throw new Error(`Could not load Boost Analytics (${response.status}).`)
    }
    const body = await response.json().catch(() => null)
    if (!body || body.ok !== true || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
      throw new Error('Invalid Boost Analytics response.')
    }
    if (cache.size >= 200) cache.clear()
    cache.set(key, body.data)
    try { sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ok: true, data: body.data })) } catch {}
    return body.data
  })().finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}

export function useAdminBoostInsights({ audience, kind = 'post', start, end, page = 1, search = '', sort = 'newest' }) {
  const [result, setResult] = useState({ data: null, loading: true, error: '' })
  const [version, setVersion] = useState(0)
  const valid = validRange(start, end)

  useEffect(() => {
    let alive = true
    if (!valid) {
      setResult({ data: null, loading: false, error: 'Select a valid range of completed Cambodia days (up to 366 days).' })
      return () => { alive = false }
    }
    setResult({ data: null, loading: true, error: '' })
    loadReport({ audience, kind, start, end, page, search, sort })
      .then((data) => { if (alive) setResult({ data, loading: false, error: '' }) })
      .catch((error) => { if (alive) setResult({ data: null, loading: false, error: error.message || 'Could not load Boost Analytics.' }) })
    return () => { alive = false }
  }, [audience, kind, start, end, page, search, sort, version, valid])

  const refresh = () => { removeCurrentCache(); setVersion((value) => value + 1) }
  return { ...result, refresh }
}
