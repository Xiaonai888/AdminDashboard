import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_SIZE = 10
const STATUSES = [
  { value: 'awaiting_reader', label: 'Awaiting Reader', icon: 'package', color: 'amber' },
  { value: 'under_review', label: 'Under Review', icon: 'clock', color: 'blue' },
  { value: 'released', label: 'Released', icon: 'check', color: 'green' },
  { value: 'refunded', label: 'Refunded', icon: 'undo', color: 'rose' },
]

const ICONS = {
  package: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  undo: <><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 4v7h-7"/></>,
  x: <><path d="M18 6 6 18M6 6l12 12"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  'eye-off': <><path d="m3 3 18 18M10.6 6.1A12.4 12.4 0 0 1 12 6c6.5 0 10 6 10 6a14 14 0 0 1-3 3.5M6.3 6.4A15.3 15.3 0 0 0 2 12s3.5 6 10 6a11 11 0 0 0 4.1-.8"/><path d="M10 10a3 3 0 0 0 4 4"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
}

function Icon({ name, size = 18, className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
}

function token() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}
function isOwner() {
  try {
    const value = sessionStorage.getItem('shadow_admin_user') || localStorage.getItem('shadow_admin_user') || '{}'
    return String(JSON.parse(value)?.role || '').toLowerCase() === 'owner'
  } catch {
    return false
  }
}
function money(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0))
}
function dateLabel(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
const PRIVATE_PROOF_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_PROOF_SIZE = 5 * 1024 * 1024

function proofsFrom(row) {
  const refs = Array.isArray(row?.proof_refs) ? row.proof_refs : []
  return refs.flatMap((item, index) => {
    const proofId = item && typeof item === 'object' ? String(item.proof_id || '') : ''
    // New R2 proofs contain a private UUID reference, never a public URL.
    if (UUID.test(proofId)) return [{ key: `private:${proofId}`, proofId }]
    // Retain support for legacy HTTPS delivery photos.
    const url = typeof item === 'string' ? item : item?.url
    return typeof url === 'string' && /^https:\/\//i.test(url)
      ? [{ key: `legacy:${index}`, url }]
      : []
  })
}
function badgeLabel(value) {
  return STATUSES.find(item => item.value === value)?.label || String(value || 'Unknown').replaceAll('_', ' ')
}

const CSS = `
.sbp { max-width:1600px; margin:0 auto; color:#17254b; font-size:13px; }
.sbp * { box-sizing:border-box; }
.sbp button,.sbp input,.sbp textarea { font:inherit; }
.sbp button { cursor:pointer; }
.sbp button:disabled { cursor:not-allowed; opacity:.55; }
.sbp-summary { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
.sbp-stat { display:flex; gap:14px; min-width:0; align-items:center; background:#fff; border:1px solid #e6e9f1; padding:19px 17px; border-radius:15px; }
.sbp-stat.amber { background:#fffbf2; border-color:#ffedc3; }
.sbp-stat.blue { background:#f6f9ff; border-color:#e3eaff; }
.sbp-stat.green { background:#f5fcf9; border-color:#d8f4e5; }
.sbp-stat.rose { background:#fff7f8; border-color:#ffe1e6; }
.sbp-stat-icon { width:45px; height:45px; border-radius:50%; display:grid; place-items:center; flex:0 0 45px; background:#ffedc5; color:#df9300; }
.sbp-stat.blue .sbp-stat-icon { background:#e3e9ff; color:#4f46e5; }
.sbp-stat.green .sbp-stat-icon { background:#daf7e9; color:#069569; }
.sbp-stat.rose .sbp-stat-icon { background:#ffe1e7; color:#f43f63; }
.sbp-stat-label { font-weight:650; color:#57658a; white-space:normal; }
.sbp-stat-value { font-size:24px; font-weight:850; color:#14234c; margin:4px 0 2px; font-variant-numeric:tabular-nums; }
.sbp-stat-unit { font-size:11px; color:#8090ad; }
.sbp-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin:0 0 15px; }
.sbp-search { display:flex; align-items:center; gap:9px; padding:0 12px; width:min(295px,100%); height:41px; background:#fff; border:1px solid #dde5f1; border-radius:11px; color:#8694b0; }
.sbp-search input { border:0; outline:0; background:transparent; color:#26385f; min-width:0; width:100%; }
.sbp-tabs { display:flex; flex-wrap:wrap; gap:7px; }
.sbp-tab { border:1px solid #e0e6f1; background:#fff; color:#687695; padding:10px 12px; border-radius:10px; font-size:12px !important; }
.sbp-tab.active { background:#4f46e5; border-color:#4f46e5; color:#fff; }
.sbp-refresh { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid #dfe5f3; background:#fff; color:#526381; padding:10px 12px; border-radius:10px; margin-left:auto; }
.sbp-note { display:inline-flex; align-items:center; gap:6px; padding:10px 12px; color:#4f46e5; border-radius:10px; background:#f0efff; font-size:11px; font-weight:700; }
.sbp-layout { display:grid; grid-template-columns:minmax(0,1fr) 338px; align-items:stretch; gap:12px; }
.sbp-panel { background:#fff; border:1px solid #e3e9f3; border-radius:15px; min-width:0; overflow:hidden; }
.sbp-table-scroll { overflow-x:auto; }
.sbp-table { border-collapse:collapse; width:100%; min-width:765px; table-layout:auto; }
.sbp-table th { background:#f8faff; color:#70809f; text-align:left; font-size:11px; padding:16px 12px; font-weight:750; white-space:nowrap; border-bottom:1px solid #e7eaf2; }
.sbp-table td { border-bottom:1px solid #edf1f7; padding:16px 12px; font-size:12px; color:#33456c; vertical-align:middle; }
.sbp-table tbody tr:last-child td { border-bottom:0; }
.sbp-table tbody tr { cursor:pointer; }
.sbp-table tbody tr:hover,.sbp-table tbody tr.selected { background:#f2f1ff; }
.sbp-book { display:flex; align-items:center; gap:9px; min-width:135px; max-width:245px; }
.sbp-book-cover { flex:0 0 34px; width:34px; height:46px; border-radius:5px; background:#eef1f7; color:#9aa6bc; display:grid; place-items:center; }
.sbp-book-title { line-height:1.5; font-weight:650; overflow-wrap:anywhere; }
.sbp-order { color:#20325c; font-weight:750; white-space:nowrap; font-size:11px; }
.sbp-sub { color:#8a98b1; font-size:11px; margin-top:4px; }
.sbp-money { font-weight:800; font-variant-numeric:tabular-nums; white-space:nowrap; }
.sbp-status { display:inline-flex; align-items:center; gap:5px; border-radius:20px; padding:6px 8px; font-size:10px; font-weight:750; white-space:nowrap; }
.sbp-status:before { content:''; width:5px; height:5px; background:currentColor; border-radius:50%; }
.sbp-status.awaiting_reader { background:#fff0cc; color:#cc8300; }
.sbp-status.under_review { background:#edf2ff; color:#4f46e5; }
.sbp-status.released { background:#e0f9ed; color:#0e946b; }
.sbp-status.refunded { background:#ffe8ed; color:#e44462; }
.sbp-review { padding:8px 12px; color:#4f46e5; background:#fff; border:1px solid #8d87ff; border-radius:8px; white-space:nowrap; font-weight:700 !important; font-size:11px !important; }
.sbp-review.primary { color:#fff; background:#4f46e5; border-color:#4f46e5; }
.sbp-empty { padding:45px 20px; text-align:center; color:#8090aa; }
.sbp-footer { display:flex; gap:10px; align-items:center; justify-content:space-between; padding:15px; font-size:12px; color:#8895ab; border-top:1px solid #edf1f7; }
.sbp-pages { display:flex; gap:8px; align-items:center; }
.sbp-pages button { border:1px solid #e2e8f2; border-radius:8px; background:#fff; padding:7px 10px; color:#4f46e5; }
.sbp-detail { padding:17px; display:flex; flex-direction:column; gap:16px; }
.sbp-detail-head { display:flex; justify-content:space-between; align-items:center; font-size:17px; font-weight:800; }
.sbp-icon-btn { border:0; background:transparent; padding:5px; color:#7887a6; display:inline-grid; place-items:center; }
.sbp-detail-order { border:1px solid #e6ebf4; border-radius:11px; padding:13px; }
.sbp-detail-order-id { font-size:14px; font-weight:850; overflow-wrap:anywhere; }
.sbp-detail-grid { display:grid; grid-template-columns:105px minmax(0,1fr); gap:11px 8px; font-size:12px; }
.sbp-detail-key { color:#8694ae; }
.sbp-detail-value { color:#25385f; overflow-wrap:anywhere; font-weight:600; }
.sbp-detail-divider { height:1px; background:#eef0f5; }
.sbp-section-head { display:flex; justify-content:space-between; align-items:center; font-weight:800; }
.sbp-proofs { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
.sbp-proof { display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:77px; gap:5px; color:#4f46e5; background:#f1f4fb; border:1px solid #e1e7f1; border-radius:10px; text-decoration:none; overflow:hidden; font-size:10px; }
.sbp-proof img { width:100%; height:70px; object-fit:cover; }
.sbp-proof-pending { padding:9px 4px; text-align:center; color:#7282a1; }
.sbp-proof-pending.error { color:#b91c1c; background:#fff1f2; border-color:#fecdd3; }
.sbp-textarea { border:1px solid #dce4f0; border-radius:10px; padding:12px; resize:vertical; min-height:85px; width:100%; color:#24365f; background:#fff; outline-color:#4f46e5; }
.sbp-detail-action { border:0; background:#4f46e5; color:#fff; width:100%; padding:13px 12px; border-radius:11px; font-weight:800 !important; display:flex; align-items:center; justify-content:center; gap:8px; }
.sbp-hint { color:#7c8aab; font-size:11px; line-height:1.6; }
.sbp-alert { color:#b91c1c; background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; padding:12px; margin-bottom:12px; }
.sbp-success { background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; padding:12px; border-radius:10px; margin:0 0 12px; }
.sbp-overlay { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; background:rgba(31,41,55,.62); }
.sbp-modal { background:#fff; border-radius:21px; box-shadow:0 20px 55px rgba(15,23,42,.22); width:min(390px,100%); max-height:calc(100vh - 40px); overflow:auto; padding:26px 24px 22px; color:#17234b; }
.sbp-modal-icon { width:64px; height:64px; border-radius:50%; background:#f1efff; color:#4f46e5; display:grid; place-items:center; margin:0 auto 13px; }
.sbp-modal h2 { font-size:20px; text-align:center; margin:0 0 8px; }
.sbp-modal-description { text-align:center; font-size:12px; line-height:1.65; color:#7a86a5; margin:0 0 20px; }
.sbp-modal-field-label { font-size:12px; font-weight:800; display:block; margin:11px 0 7px; }
.sbp-modal-input,.sbp-modal textarea { width:100%; border:1px solid #dce3f0; border-radius:10px; background:#fafbff; padding:11px 12px; outline-color:#4f46e5; color:#263557; }
.sbp-pin-wrap { display:flex; border:1px solid #dce3f0; background:#fafbff; border-radius:10px; align-items:center; gap:8px; padding:0 11px; }
.sbp-pin-wrap input { border:0; padding:12px 0; outline:0; background:transparent; min-width:0; flex:1; letter-spacing:2px; }
.sbp-modal-note { display:flex; align-items:flex-start; gap:10px; color:#4f46e5; background:#f0efff; padding:12px; border-radius:11px; margin:14px 0 16px; font-size:11px; line-height:1.6; }
.sbp-modal-note strong { font-size:12px; }
.sbp-pill { display:flex; justify-content:center; align-items:center; gap:9px; min-height:44px; width:100%; border-radius:999px; font-size:13px !important; font-weight:800 !important; margin-top:10px; }
.sbp-pill.primary { border:1px solid #4f46e5; color:white; background:#4f46e5; }
.sbp-pill.secondary { border:1px solid #dee4ed; color:#273859; background:#fff; }
@media(max-width:1200px) { .sbp-layout { grid-template-columns:minmax(0,1fr); } .sbp-detail { max-width:none; } }
@media(max-width:900px) { .sbp-summary { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:560px) { .sbp-summary { grid-template-columns:1fr 1fr; gap:8px; } .sbp-stat { padding:12px 9px; gap:8px; } .sbp-stat-icon { width:35px; height:35px; flex-basis:35px; } .sbp-stat-value { font-size:20px; } .sbp-stat-label { font-size:11px; } .sbp-toolbar { align-items:stretch; } .sbp-search { width:100%; } .sbp-refresh { margin-left:0; } .sbp-footer { flex-direction:column; } .sbp-modal { padding:24px 18px 18px; } }
`

export default function AdminAuthorBookHoldsPage() {
  const [status, setStatus] = useState('under_review')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [success, setSuccess] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [modal, setModal] = useState(false)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const [privateProofUrls, setPrivateProofUrls] = useState({})
  const [proofLoadErrors, setProofLoadErrors] = useState({})
  const owner = isOwner()
  const selectedProofs = useMemo(() => proofsFrom(selected), [selected])
  const canRelease = owner && selected?.status === 'under_review' && selectedProofs.length > 0 &&
    selectedProofs.every(proof => !proof.proofId || Boolean(privateProofUrls[proof.key]))

  const refresh = useCallback(() => setRevision(value => value + 1), [])

  // Summary counts are requested only on mount / manual refresh / successful approval.
  // Backend returns exact counts but not aggregate dollar totals, so dollar totals are not fabricated.
  useEffect(() => {
    const controller = new AbortController()
    async function loadCounts() {
      const sessionToken = token()
      if (!sessionToken) return
      const results = await Promise.allSettled(STATUSES.map(async item => {
        const response = await fetch(`${API_URL}/api/author-store/admin/books/holds?status=${item.value}&page=1&limit=1`, {
          headers: { Authorization: `Bearer ${sessionToken}` }, cache: 'no-store', signal: controller.signal,
        })
        const json = await response.json().catch(() => ({}))
        if (!response.ok || json.ok !== true) throw new Error('Could not load counts')
        return { status: item.value, total: Number(json.total || 0) }
      }))
      if (controller.signal.aborted) return
      const next = {}
      for (const result of results) if (result.status === 'fulfilled') next[result.value.status] = result.value.total
      setCounts(next)
    }
    void loadCounts()
    return () => controller.abort()
  }, [revision])

  useEffect(() => {
    const controller = new AbortController()
    async function loadOrders() {
      setLoading(true)
      setListError('')
      try {
        const sessionToken = token()
        if (!sessionToken) throw new Error('Admin session expired. Sign in again.')
        const response = await fetch(`${API_URL}/api/author-store/admin/books/holds?status=${status}&page=${page}&limit=${PAGE_SIZE}`, {
          headers: { Authorization: `Bearer ${sessionToken}` }, cache: 'no-store', signal: controller.signal,
        })
        const json = await response.json().catch(() => ({}))
        if (!response.ok || json.ok !== true || !Array.isArray(json.rows)) throw new Error(json.message || 'Could not load book holds')
        if (!controller.signal.aborted) {
          setRows(json.rows)
          setTotal(Number(json.total || 0))
          setCounts(previous => ({ ...previous, [status]: Number(json.total || 0) }))
          setSelected(previous => json.rows.find(item => item.hold_id === previous?.hold_id) || json.rows[0] || null)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setRows([])
          setSelected(null)
          setListError(error.message || 'Unable to load book holds')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void loadOrders()
    return () => controller.abort()
  }, [status, page, revision])

  // Only load private R2 evidence for the currently selected order.
  // Bearer credentials are sent by fetch, never embedded in image URLs.
  useEffect(() => {
    setPrivateProofUrls({})
    setProofLoadErrors({})
    const privateProofs = selectedProofs.filter(item => item.proofId)
    if (!owner || !UUID.test(String(selected?.hold_id || '')) || !privateProofs.length) return undefined

    const controller = new AbortController()
    const objectUrls = []
    let cancelled = false

    async function loadPrivateProofs() {
      const adminToken = token()
      if (!adminToken) {
        setProofLoadErrors(Object.fromEntries(privateProofs.map(item => [item.key, 'Admin session expired'])))
        return
      }
      await Promise.all(privateProofs.map(async item => {
        try {
          const response = await fetch(
            `${API_URL}/api/author-store/admin/books/holds/${encodeURIComponent(selected.hold_id)}/proofs/${encodeURIComponent(item.proofId)}`,
            { headers: { Authorization: `Bearer ${adminToken}` }, cache: 'no-store', signal: controller.signal }
          )
          if (!response.ok) throw new Error(response.status === 403 ? 'Owner access required' : 'Private proof unavailable')
          const mime = String(response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
          const contentLength = Number(response.headers.get('content-length') || '0')
          if (!PRIVATE_PROOF_MIMES.has(mime) || contentLength > MAX_PROOF_SIZE) throw new Error('Invalid proof image')
          const imageBlob = await response.blob()
          if (imageBlob.size < 1 || imageBlob.size > MAX_PROOF_SIZE) throw new Error('Invalid proof size')
          if (cancelled || controller.signal.aborted) return
          const url = URL.createObjectURL(imageBlob)
          objectUrls.push(url)
          setPrivateProofUrls(previous => ({ ...previous, [item.key]: url }))
        } catch (error) {
          if (!cancelled && !controller.signal.aborted) {
            setProofLoadErrors(previous => ({ ...previous, [item.key]: error?.message || 'Unable to load proof' }))
          }
        }
      }))
    }
    void loadPrivateProofs()
    return () => {
      cancelled = true
      controller.abort()
      objectUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [owner, selected?.hold_id, selectedProofs])

  useEffect(() => {
    if (!modal) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = event => {
      if (event.key === 'Escape' && !saving) closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modal, saving])

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(item => [item.order_number, item.order_id, item.title, item.buyer_name, item.tracking_number, item.author_name]
      .some(value => String(value || '').toLowerCase().includes(term)))
  }, [rows, query])

  function switchStatus(next) {
    if (next === status) return
    setStatus(next)
    setPage(1)
    setSelected(null)
    setQuery('')
    setSuccess('')
  }
  function closeModal() {
    setModal(false)
    setPin('')
    setShowPin(false)
    setActionError('')
  }
  function openModal() {
    if (!canRelease) return
    setPin('')
    setShowPin(false)
    setActionError('')
    setModal(true)
  }
  async function approve(event) {
    event.preventDefault()
    if (saving || !canRelease) return
    if (!/^\d{6}$/.test(pin) || Array.from(reason.trim()).length < 15) {
      setActionError('Enter a six-digit Owner Passkey and at least 15 characters of review reason.')
      return
    }
    setSaving(true)
    setActionError('')
    try {
      const sessionToken = token()
      if (!sessionToken) throw new Error('Admin session expired. Sign in again.')
      const response = await fetch(`${API_URL}/api/author-store/admin/books/${encodeURIComponent(selected.order_id)}/approve-hold`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ passkey_pin: pin, review_reason: reason.trim() }),
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok || json.ok !== true || json.status !== 'released') throw new Error(json.message || 'Unable to approve and release funds')
      setSuccess(`Funds for order ${selected.order_number || selected.order_id} were released successfully.`)
      setReason('')
      closeModal()
      refresh()
    } catch (error) {
      setActionError(error.message || 'Unable to release funds')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Book Pending" subtitle="Review held payments for physical books before releasing author funds. Owner release requires Passkey confirmation.">
      <style>{CSS}</style>
      <section className="sbp">
        <div className="sbp-summary" aria-label="Book hold status overview">
          {STATUSES.map(item => (
            <div className={`sbp-stat ${item.color}`} key={item.value}>
              <div className="sbp-stat-icon"><Icon name={item.icon} size={22}/></div>
              <div>
                <div className="sbp-stat-label">{item.label}</div>
                <div className="sbp-stat-value">{counts[item.value] === undefined ? '—' : counts[item.value].toLocaleString('en-US')}</div>
                <div className="sbp-stat-unit">Orders</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sbp-toolbar">
          <label className="sbp-search">
            <Icon name="search" size={17}/>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search current page..." aria-label="Search orders on current page" />
          </label>
          <nav className="sbp-tabs" aria-label="Book hold statuses">
            {STATUSES.map(item => (
              <button type="button" className={`sbp-tab ${status === item.value ? 'active' : ''}`} key={item.value} onClick={() => switchStatus(item.value)}>
                {item.label}{counts[item.value] === undefined ? '' : ` (${counts[item.value]})`}
              </button>
            ))}
          </nav>
          <button type="button" className="sbp-refresh" onClick={refresh} disabled={loading} title="Refresh orders"><Icon name="refresh" size={16}/> Refresh</button>
          <span className="sbp-note"><Icon name="lock" size={14}/> Owner release requires Passkey</span>
        </div>

        {listError && <div className="sbp-alert" role="alert">{listError}</div>}
        {success && <div className="sbp-success" role="status">{success}</div>}

        <div className="sbp-layout">
          <div className="sbp-panel">
            <div className="sbp-table-scroll">
              <table className="sbp-table">
                <thead><tr><th>Order</th><th>Book</th><th>Author</th><th>Reader</th><th>Held Amount</th><th>Shipping Proof</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {!loading && visibleRows.map(row => {
                    const proofCount = proofsFrom(row).length
                    const active = selected?.hold_id === row.hold_id
                    return (
                      <tr key={row.hold_id} className={active ? 'selected' : ''} onClick={() => { setSelected(row); setReason('') }}>
                        <td><div className="sbp-order">{row.order_number || row.order_id || '—'}</div><div className="sbp-sub">{dateLabel(row.created_at)}</div></td>
                        <td><div className="sbp-book"><div className="sbp-book-cover"><Icon name="package" size={17}/></div><div className="sbp-book-title">{row.title || 'Physical Book'}</div></div></td>
                        <td>{row.author_name || '—'}</td>
                        <td>{row.buyer_name || 'Reader'}</td>
                        <td><span className="sbp-money">{money(row.held_amount)}</span></td>
                        <td>{proofCount ? <span style={{color:'#4f46e5',fontWeight:700}}><Icon name="image" size={14}/> {proofCount} file{proofCount > 1 ? 's' : ''}</span> : <span className="sbp-sub">No proof yet</span>}</td>
                        <td><span className={`sbp-status ${row.status}`}>{badgeLabel(row.status)}</span></td>
                        <td><button className={`sbp-review ${active ? 'primary' : ''}`} type="button" onClick={event => {event.stopPropagation();setSelected(row);setReason('')}}>Review</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {loading && <div className="sbp-empty">Loading book holds...</div>}
              {!loading && visibleRows.length === 0 && <div className="sbp-empty">{query ? 'No matches on this page. Search only checks the currently loaded orders.' : 'No orders in this status.'}</div>}
            </div>
            <div className="sbp-footer">
              <span>Showing {visibleRows.length} on this page • {total.toLocaleString('en-US')} total • {PAGE_SIZE} per page</span>
              <div className="sbp-pages">
                <button type="button" disabled={page <= 1 || loading} onClick={() => {setPage(p => p - 1);setQuery('');setSelected(null)}}>Previous</button>
                <strong>Page {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</strong>
                <button type="button" disabled={loading || page * PAGE_SIZE >= total} onClick={() => {setPage(p => p + 1);setQuery('');setSelected(null)}}>Next <Icon name="chevron" size={13}/></button>
              </div>
            </div>
          </div>

          <aside className="sbp-panel sbp-detail" aria-label="Order details">
            <div className="sbp-detail-head"><span>Order Detail</span>{selected && <button className="sbp-icon-btn" title="Close order detail" type="button" onClick={() => setSelected(null)}><Icon name="x" size={18}/></button>}</div>
            {!selected ? <div className="sbp-empty">Select an order to review its payment hold.</div> : <>
              <div className="sbp-detail-order">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,flexWrap:'wrap'}}>
                  <span className="sbp-detail-order-id">{selected.order_number || selected.order_id}</span>
                  <span className={`sbp-status ${selected.status}`}>{badgeLabel(selected.status)}</span>
                </div>
                <div className="sbp-sub">Placed on {dateLabel(selected.created_at)}</div>
              </div>
              <div className="sbp-detail-grid">
                <span className="sbp-detail-key">Book Title</span><span className="sbp-detail-value">{selected.title || 'Physical Book'}</span>
                <span className="sbp-detail-key">Author</span><span className="sbp-detail-value">{selected.author_name || '—'}</span>
                <span className="sbp-detail-key">Reader</span><span className="sbp-detail-value">{selected.buyer_name || 'Reader'}</span>
                <span className="sbp-detail-key">Delivery Company</span><span className="sbp-detail-value">{selected.delivery_company || '—'}</span>
                <span className="sbp-detail-key">Tracking</span><span className="sbp-detail-value">{selected.tracking_number || '—'} {selected.tracking_number && <button className="sbp-icon-btn" aria-label="Copy tracking number" title="Copy tracking number" type="button" onClick={() => {if(navigator.clipboard?.writeText) void navigator.clipboard.writeText(selected.tracking_number).catch(() => {})}}><Icon name="copy" size={14}/></button>}</span>
                <span className="sbp-detail-key">Payment</span><span className="sbp-detail-value">{selected.payment_status || '—'}</span>
                <span className="sbp-detail-key">Delivery</span><span className="sbp-detail-value">{selected.order_status || '—'}</span>
                <span className="sbp-detail-key">Held Amount</span><span className="sbp-detail-value" style={{fontSize:18,fontWeight:850}}>{money(selected.held_amount)}</span>
              </div>
              <div className="sbp-detail-divider"/>
              <div>
                <div className="sbp-section-head"><span>Shipping Proof</span><span className="sbp-sub">{selectedProofs.length} file(s)</span></div>
                {selectedProofs.length ? <div className="sbp-proofs" style={{marginTop:11}}>
                  {selectedProofs.map((proof, index) => {
                    const imageUrl = proof.proofId ? privateProofUrls[proof.key] : proof.url
                    const loadError = proofLoadErrors[proof.key]
                    return imageUrl ? (
                      <a className="sbp-proof" href={imageUrl} target="_blank" rel="noopener noreferrer" key={proof.key} title={`View shipping proof ${index + 1}`}>
                        <img src={imageUrl} alt={`Shipping proof ${index + 1}`} loading="lazy" />
                        <span>Proof {index + 1}</span>
                      </a>
                    ) : (
                      <div className={`sbp-proof sbp-proof-pending ${loadError ? 'error' : ''}`} key={proof.key} role="status">
                        <Icon name="image" size={20}/>
                        <span>{loadError || 'Loading private proof...'}</span>
                      </div>
                    )
                  })}
                </div> : <div className="sbp-hint" style={{marginTop:8}}>No delivery evidence uploaded.</div>}
                {selectedProofs.some(item => item.proofId && !privateProofUrls[item.key]) && (
                  <div className="sbp-hint" style={{marginTop:8}}>Release is disabled until private evidence can be inspected.</div>
                )}
              </div>
              <div className="sbp-detail-divider"/>
              <div>
                <label htmlFor="sbp-review-reason" className="sbp-section-head" style={{marginBottom:8}}>Review Reason {selected.status === 'under_review' ? '(required)' : ''}</label>
                <textarea id="sbp-review-reason" className="sbp-textarea" maxLength={2000} rows={4} value={reason} onChange={event => setReason(event.target.value)} placeholder="Describe verified shipping evidence (minimum 15 characters)..." disabled={selected.status !== 'under_review'}/>
                <div className="sbp-hint" style={{textAlign:'right'}}>{Array.from(reason.trim()).length}/2000</div>
              </div>
              {selected.status === 'under_review' && <>
                <button className="sbp-detail-action" type="button" disabled={!canRelease || Array.from(reason.trim()).length < 15 || saving} onClick={openModal}><Icon name="lock" size={16}/> Release to Author</button>
                <div className="sbp-hint" style={{textAlign:'center'}}>Requires verified shipping evidence, review reason, and Owner Passkey.</div>
              </>}
              {selected.status === 'awaiting_reader' && <div className="sbp-hint">Awaiting reader action. Manual release is unavailable until the order qualifies for review.</div>}
              {selected.status === 'released' && <div className="sbp-hint">This payment has been released.</div>}
              {selected.status === 'refunded' && <div className="sbp-hint">This payment has been refunded.</div>}
            </>}
          </aside>
        </div>
      </section>

      {modal && selected && <div className="sbp-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) closeModal() }}>
        <form className="sbp-modal" role="dialog" aria-modal="true" aria-labelledby="sbp-modal-title" onSubmit={approve}>
          <div className="sbp-modal-icon"><Icon name="lock" size={29}/></div>
          <h2 id="sbp-modal-title">Confirm Release</h2>
          <p className="sbp-modal-description">Release {money(selected.held_amount)} to the author for order {selected.order_number || selected.order_id}. This action requires Owner Passkey confirmation.</p>
          <label className="sbp-modal-field-label" htmlFor="sbp-passkey">Owner Passkey</label>
          <div className="sbp-pin-wrap">
            <Icon name="lock" size={17}/>
            <input id="sbp-passkey" type={showPin ? 'text' : 'password'} autoComplete="off" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={pin} onChange={event => setPin(event.target.value.replace(/\D/g,'').slice(0,6))} placeholder="Enter six-digit passkey" required autoFocus />
            <button className="sbp-icon-btn" type="button" onClick={() => setShowPin(value => !value)} aria-label={showPin ? 'Hide Passkey' : 'Show Passkey'}><Icon name={showPin ? 'eye-off' : 'eye'} size={17}/></button>
          </div>
          <div className="sbp-modal-note"><Icon name="shield" size={20}/><div><strong>Only Owner can manually release funds</strong><div>Funds become withdrawable once approved. Confirm the book was shipped before proceeding.</div></div></div>
          {actionError && <div className="sbp-alert" role="alert">{actionError}</div>}
          <button className="sbp-pill primary" type="submit" disabled={saving || !/^\d{6}$/.test(pin) || Array.from(reason.trim()).length < 15}><Icon name="lock" size={16}/>{saving ? 'Approving...' : 'Approve & Release'}</button>
          <button className="sbp-pill secondary" type="button" onClick={closeModal} disabled={saving}>Go Back</button>
        </form>
      </div>}
    </AdminLayout>
  )
}
