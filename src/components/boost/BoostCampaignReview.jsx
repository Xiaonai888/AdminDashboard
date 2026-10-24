import React, { useEffect, useMemo, useRef, useState } from 'react'
import { formatMoney, formatNumber, formatPercent } from '../../services/adminBoostInsights'

const API_URL = (import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/$/, '')
const PAGE_SIZE = 10
const CACHE_TTL = 25000
const responseCache = new Map()
const pendingRequests = new Map()
let cacheEpoch = 0
const STATUSES = [
  ['all', 'All statuses'],
  ['pending_review', 'Pending review'],
  ['approved', 'Approved'],
  ['active', 'Active'],
  ['scheduled', 'Scheduled'],
  ['completed', 'Completed'],
  ['rejected', 'Rejected'],
  ['paused', 'Paused'],
  ['draft', 'Draft'],
  ['cancelled', 'Cancelled'],
]

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function fingerprint(token) {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) hash = Math.imul(hash ^ token.charCodeAt(index), 16777619)
  return (hash >>> 0).toString(16)
}

async function readResponse(response) {
  const body = await response.json().catch(() => null)
  if (!response.ok || body?.ok !== true) {
    if (response.status === 404 || response.status === 503) {
      throw new Error('Author Ads Backend or SQL is not connected yet.')
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error('Admin access denied. Please sign in again.')
    }
    throw new Error(String(body?.message || `Request failed (${response.status}).`).slice(0, 220))
  }
  return body
}

function request(path, { method = 'GET', body = null, cache = true } = {}) {
  const token = getAdminToken()
  if (!token) return Promise.reject(new Error('Admin session required. Please sign in again.'))
  const key = `${cacheEpoch}:${fingerprint(token)}:${path}`
  if (method === 'GET' && cache) {
    const previous = responseCache.get(key)
    if (previous && Date.now() - previous.time < CACHE_TTL) return Promise.resolve(previous.value)
    if (pendingRequests.has(key)) return pendingRequests.get(key)
  }
  const promise = fetch(`${API_URL}/api/admin/author-ads${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body == null ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body == null ? {} : { body: JSON.stringify(body) }),
  }).then(readResponse).then((result) => {
    if (method === 'GET' && cache) {
      if (responseCache.size >= 40) responseCache.clear()
      responseCache.set(key, { value: result, time: Date.now() })
    }
    return result
  }).finally(() => {
    if (method === 'GET') pendingRequests.delete(key)
  })
  if (method === 'GET' && cache) pendingRequests.set(key, promise)
  return promise
}

function DisplayCard({ label, value, note, monetary = false }) {
  return <div className="bad-stat">
    <div className="bad-stat-top"><span>{label}</span></div>
    <strong className="bad-stat-value" style={monetary ? { whiteSpace: 'normal', overflowWrap: 'anywhere' } : undefined}>{value}</strong>
    <small>{note}</small>
  </div>
}

function InfoLine({ label, children }) {
  return <div className="bad-revenue-line">
    <span>{label}</span>
    <strong style={{ textAlign: 'right', overflowWrap: 'anywhere' }}>{children || '—'}</strong>
  </div>
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'medium', timeStyle: 'short' })
}

function safePercent(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? Math.max(0, Math.min(100, amount)) : 0
}

export default function BoostCampaignReview() {
  const [kind, setKind] = useState('post')
  const [spendingScope, setSpendingScope] = useState('all')
  const [status, setStatus] = useState('pending_review')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [reload, setReload] = useState(0)
  const [result, setResult] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summaryError, setSummaryError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [decision, setDecision] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const selectionVersion = useRef(0)
  const params = useMemo(() => {
    const query = new URLSearchParams({ kind, status, sort, page: String(page), limit: String(PAGE_SIZE) })
    if (debouncedSearch) query.set('search', debouncedSearch)
    return query.toString()
  }, [kind, status, sort, page, debouncedSearch])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim().slice(0, 80)), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    request(`/campaigns?${params}`, { cache: reload === 0 }).then((value) => {
      if (!active) return
      if (!Array.isArray(value.campaigns) || !Number.isFinite(Number(value.total))) {
        throw new Error('Invalid campaign list response.')
      }
      setResult(value)
      const finalPage = Math.max(1, Math.ceil(Number(value.total) / PAGE_SIZE))
      if (page > finalPage) setPage(finalPage)
    }).catch((failure) => {
      if (active) { setResult(null); setError(failure.message || 'Unable to load campaigns.') }
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [params, page, reload])

  useEffect(() => {
    let active = true
    setSummaryError('')
    request('/campaigns/summary', { cache: reload === 0 }).then((value) => {
      if (!active) return
      if (!value.summary || typeof value.summary !== 'object') throw new Error('Invalid campaign summary.')
      setSummary(value.summary)
    }).catch((failure) => {
      if (active) { setSummary(null); setSummaryError(failure.message || 'Unable to load summary.') }
    })
    return () => { active = false }
  }, [reload])

  useEffect(() => {
    if (!selected) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !submitting) closeDetails()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected, submitting])

  function changeKind(value) {
    setKind(value)
    setPage(1)
  }

  function changeStatus(value) {
    setStatus(value)
    setPage(1)
  }

  function changeSort(value) {
    setSort(value)
    setPage(1)
  }

  function refresh() {
    cacheEpoch += 1
    responseCache.clear()
    pendingRequests.clear()
    setReload((value) => value + 1)
  }

  function closeDetails() {
    if (submitting) return
    selectionVersion.current += 1
    setSelected(null)
    setDetail(null)
    setDetailError('')
    setDecision('')
    setReason('')
  }

  async function openDetails(campaign) {
    const version = ++selectionVersion.current
    setSelected(campaign)
    setDetail(null)
    setDetailError('')
    setDecision('')
    setReason('')
    setDetailLoading(true)
    try {
      const response = await request(`/campaigns/${encodeURIComponent(campaign.id)}`, { cache: false })
      if (selectionVersion.current === version) {
        if (!response.campaign) throw new Error('Invalid campaign detail response.')
        setDetail(response)
      }
    } catch (failure) {
      if (selectionVersion.current === version) setDetailError(failure.message || 'Unable to load campaign details.')
    } finally {
      if (selectionVersion.current === version) setDetailLoading(false)
    }
  }

  async function submitReview() {
    if (submitting || !detail?.campaign || !['approve', 'reject'].includes(decision)) return
    const note = reason.trim()
    if (decision === 'reject' && (note.length < 5 || note.length > 500)) {
      setDetailError('Rejection reason must be 5–500 characters.')
      return
    }
    if (note.length > 500) { setDetailError('Review note must not exceed 500 characters.'); return }
    setSubmitting(true)
    setDetailError('')
    try {
      await request(`/campaigns/${encodeURIComponent(detail.campaign.id)}/review`, {
        method: 'POST',
        cache: false,
        body: { action: decision, reason: note },
      })
      setSubmitting(false)
      closeDetails()
      refresh()
    } catch (failure) {
      setDetailError(failure.message || 'Unable to review campaign.')
      setSubmitting(false)
    }
  }

  const campaigns = Array.isArray(result?.campaigns) ? result.campaigns : []
  const total = Math.max(0, Number(result?.total) || 0)
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const campaign = detail?.campaign || selected
  const canReview = detail?.campaign?.status === 'pending_review' && detail?.campaign?.review_status === 'pending'
  const rejectBlocked = ['funded_usd', 'spent_usd', 'refunded_usd'].some((key) => Number(detail?.campaign?.[key] || 0) > 0)
  const performance = detail?.performance || null
  const spending = summary?.spending_available ? summary.spending?.[spendingScope] : null

  return <section aria-label="Author Ads campaign review" style={{ marginTop: 22 }}>
    <header className="bad-heading-row">
      <div>
        <span className="bad-eyebrow">SHADOW · AUTHOR ADS</span>
        <h2 style={{ fontSize: 21, margin: 0 }}>Campaign Review</h2>
        <p>Inspect author campaigns and approve eligible promotions. Approval does not start delivery or charge a payment.</p>
      </div>
      <button type="button" className="bad-refresh" onClick={refresh} disabled={loading || submitting}>Refresh</button>
    </header>

    {summaryError && <div className="bad-alert" role="alert">{summaryError}</div>}
    <div className="bad-panel bad-panel-space" aria-label="Author campaign spending">
      <div className="bad-panel-header">
        <h3>Campaign Spending · All Time</h3>
        <p>Amounts from recorded campaign budgets. Spent is money used for ad delivery, not the planned budget.</p>
      </div>
      <nav className="bad-secondary-tabs" style={{ flexWrap: 'wrap', gap: 16 }} role="tablist" aria-label="Spending category">
        <button type="button" role="tab" aria-selected={spendingScope === 'all'} onClick={() => setSpendingScope('all')}>All</button>
        <button type="button" role="tab" aria-selected={spendingScope === 'post'} onClick={() => setSpendingScope('post')}>Boost Post</button>
        <button type="button" role="tab" aria-selected={spendingScope === 'book'} onClick={() => setSpendingScope('book')}>Boost Book</button>
      </nav>
      {summary && summary.spending_available === false && <div className="bad-alert" role="alert">Spending totals unavailable. Check the Supabase SQL and Backend deployment. Campaign review remains available.</div>}
      {!summary && !summaryError && <p className="bad-loading" role="status">Loading spending totals...</p>}
      <div className="bad-stats">
        <DisplayCard label="Total Spent" value={formatMoney(spending?.spent_usd)} note="Actual campaign budget used" monetary />
        <DisplayCard label="Total Funded" value={formatMoney(spending?.funded_usd)} note="Recorded campaign funding" monetary />
        <DisplayCard label="Total Budget" value={formatMoney(spending?.budget_usd)} note="Planned budget, not money spent" monetary />
        <DisplayCard label="Total Refunded" value={formatMoney(spending?.refunded_usd)} note="Recorded refunded amount" monetary />
      </div>
      <p className="bad-footnote" style={{ textAlign: 'left', margin: 0 }}>
        {formatNumber(spending?.campaigns_with_spend)} campaigns with spending · Remaining funded balance: {formatMoney(spending?.remaining_funds_usd)}. These totals cover all campaign statuses, regardless of table search or pagination.
      </p>
    </div>
    <div className="bad-stats">
      <DisplayCard label="All Campaigns" value={formatNumber(summary?.total)} note="All submitted and draft campaigns" />
      <DisplayCard label="Pending Review" value={formatNumber(summary?.pending_review)} note="Awaiting admin decision" />
      <DisplayCard label="Approved" value={formatNumber(summary?.approved)} note="Approved, not necessarily funded" />
      <DisplayCard label="Active" value={formatNumber(summary?.active)} note="Verified live delivery only" />
    </div>

    <div className="bad-panel">
      <nav className="bad-secondary-tabs" role="tablist" aria-label="Campaign type">
        <button type="button" role="tab" aria-selected={kind === 'post'} onClick={() => changeKind('post')}>Boost Post</button>
        <button type="button" role="tab" aria-selected={kind === 'book'} onClick={() => changeKind('book')}>Boost Book</button>
      </nav>

      <div className="bad-table-tools">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 9 }}>
          <label htmlFor="author-ad-review-status" style={{ fontSize: 12 }}>Status</label>
          <select id="author-ad-review-status" value={status} onChange={(event) => changeStatus(event.target.value)} className="bad-refresh">
            {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label htmlFor="author-ad-review-sort" style={{ fontSize: 12 }}>Sort by spent</label>
          <select id="author-ad-review-sort" value={sort} onChange={(event) => changeSort(event.target.value)} className="bad-refresh" aria-label="Sort campaigns by money spent">
            <option value="newest">Newest</option>
            <option value="top">Top → Low</option>
            <option value="low">Low → Top</option>
          </select>
          <small>{formatNumber(total)} matching campaigns</small>
        </div>
        <input type="search" value={search} onChange={(event) => { setSearch(event.target.value.slice(0, 80)); setPage(1) }} aria-label="Search campaign title or ID" placeholder="Search content title or campaign ID" maxLength={80} />
      </div>

      {error && <div className="bad-alert" role="alert">{error} <button type="button" onClick={refresh}>Try again</button></div>}
      {loading && <p className="bad-loading" role="status">Loading campaigns...</p>}

      <div className="bad-table-scroll">
        <table className="bad-table" aria-label={`${kind === 'post' ? 'Boost Post' : 'Boost Book'} campaigns`}>
          <thead><tr><th>Content / Author</th><th>Goal</th><th>Audience</th><th>Budget</th><th>Spent</th><th>Budget Used</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {!loading && campaigns.length === 0 && <tr><td colSpan={8}><div className="bad-empty">No campaigns match these filters.</div></td></tr>}
            {!loading && campaigns.map((item) => <tr key={item.id}>
              <td><div className="bad-work"><div>
                <strong title={item.content_title || ''}>{item.content_title || 'Untitled'}</strong>
                <small>{item.author?.page_name || 'Unknown Author'}</small>
              </div></div></td>
              <td>{item.goal || '—'}</td>
              <td>{item.audience_mode || '—'}</td>
              <td>{formatMoney(item.budget_usd)}</td>
              <td>{formatMoney(item.spent_usd)}</td>
              <td><strong>{formatPercent(item.budget_used_percent)}</strong><div className="bad-progress"><div style={{ width: `${safePercent(item.budget_used_percent)}%` }} /></div></td>
              <td><span className="bad-status" data-status={item.status}>{item.status === 'approved' && item.payment_required ? 'Awaiting payment' : String(item.status || '—').replace(/_/g, ' ')}</span></td>
              <td><button type="button" className="bad-refresh" onClick={() => openDetails(item)}>{item.status === 'pending_review' ? 'Review' : 'Details'}</button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="bad-table-footer">
        <small>{formatNumber(total)} campaigns · {PAGE_SIZE} per page</small>
        <div>
          <button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span>{page} / {pages}</span>
          <button type="button" disabled={loading || page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>Next</button>
        </div>
      </div>
    </div>

    {selected && <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(10,15,30,.65)', padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label="Review author ad campaign" className="bad-panel" style={{ width: 'min(650px,100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 55px rgba(0,0,0,.25)' }}>
        <div className="bad-table-tools">
          <div><h3 className="bad-panel-title" style={{ margin: 0 }}>Campaign Details</h3><small>{campaign?.id || '—'}</small></div>
          <button type="button" className="bad-refresh" disabled={submitting} onClick={closeDetails}>Close</button>
        </div>
        {detailLoading && <p className="bad-loading">Loading details...</p>}
        {detailError && <div className="bad-alert" role="alert">{detailError}</div>}
        {!detailLoading && detail && <>
          <InfoLine label="Content">{campaign.content_title}</InfoLine>
          <InfoLine label="Author">{campaign.author?.page_name}</InfoLine>
          <InfoLine label="Type">{`${campaign.kind} · ${campaign.content_type}`}</InfoLine>
          <InfoLine label="Goal">{campaign.goal}</InfoLine>
          <InfoLine label="Audience">{campaign.audience_mode}</InfoLine>
          <InfoLine label="Placement">{(campaign.placements || []).join(', ')}</InfoLine>
          <InfoLine label="Duration">{`${campaign.duration_days || 0} days`}</InfoLine>
          <InfoLine label="Budget">{formatMoney(campaign.budget_usd)}</InfoLine>
          <InfoLine label="Funded / Spent">{`${formatMoney(campaign.funded_usd)} / ${formatMoney(campaign.spent_usd)}`}</InfoLine>
          <InfoLine label="Budget used">{formatPercent(campaign.budget_used_percent)}</InfoLine>
          <InfoLine label="Submitted">{formatDate(campaign.submitted_at)}</InfoLine>
          <InfoLine label="Status">{campaign.status}</InfoLine>
          {campaign.review_reason && <InfoLine label="Review note">{campaign.review_reason}</InfoLine>}
          {performance && <>
            <h4 style={{ margin: '23px 0 7px' }}>Recorded campaign performance</h4>
            <InfoLine label="Impressions / Clicks">{`${formatNumber(performance.impressions)} / ${formatNumber(performance.clicks)}`}</InfoLine>
            <InfoLine label="Reading starts / Follows">{`${formatNumber(performance.reading_starts)} / ${formatNumber(performance.follows)}`}</InfoLine>
            <InfoLine label="Unlocks / Purchases">{`${formatNumber(performance.unlocks)} / ${formatNumber(performance.purchases)}`}</InfoLine>
            <InfoLine label="Unique reach">{performance.unique_reach_available ? formatNumber(performance.unique_reach) : 'Not measured'}</InfoLine>
          </>}
          {canReview && <div style={{ borderTop: '1px solid #e4e7ec', marginTop: 18, paddingTop: 18 }}>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              <button type="button" className="bad-refresh" aria-pressed={decision === 'approve'} onClick={() => { setDecision('approve'); setDetailError('') }}>Approve</button>
              <button type="button" className="bad-refresh" disabled={rejectBlocked} aria-pressed={decision === 'reject'} onClick={() => { setDecision('reject'); setDetailError('') }}>Reject</button>
            </div>
            {rejectBlocked && <p style={{ fontSize: 12, opacity: .75 }}>This funded campaign needs the refund workflow before rejection.</p>}
            {decision && <div style={{ marginTop: 14 }}>
              <label htmlFor="review-author-ad-note" style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>{decision === 'reject' ? 'Rejection reason (required)' : 'Approval note (optional)'}</label>
              <textarea id="review-author-ad-note" value={reason} maxLength={500} rows={3} onChange={(event) => setReason(event.target.value)} placeholder={decision === 'reject' ? 'Explain the reason to the author (5–500 characters)' : 'Optional review note'} style={{ width: '100%', padding: 11, borderRadius: 9, border: '1px solid #cbd1dc', background: 'transparent', color: 'inherit', font: 'inherit' }} />
              <p style={{ fontSize: 12, opacity: .75 }}>Confirm {decision}. Approval does not collect payment or launch the campaign.</p>
              <button type="button" disabled={submitting || (decision === 'reject' && reason.trim().length < 5)} onClick={submitReview} style={{ border: 0, background: decision === 'approve' ? '#256c4d' : '#a83239', color: '#fff', borderRadius: 9, padding: '11px 17px', fontWeight: 700, cursor: 'pointer' }}>{submitting ? 'Saving...' : `Confirm ${decision}`}</button>
            </div>}
          </div>}
        </>}
      </div>
    </div>}
  </section>
}

