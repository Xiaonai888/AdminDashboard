import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_PREFIX = 'shadow_admin_boost_insights_v1:'
const PAGE_SIZE = 20
const DAY_MS = 86400000
const cache = new Map()
const pending = new Map()

const css = `
  .boost-page { color:#172033; font-family:inherit; }
  .boost-page * { box-sizing:border-box; }
  .boost-topline { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:19px; }
  .boost-kicker { margin:0 0 5px; font-size:12px; color:#7b8292; font-weight:700; letter-spacing:.02em; }
  .boost-heading { font-size:24px; line-height:1.25; font-weight:850; margin:0; color:#171b31; }
  .boost-subtitle { margin:7px 0 0; color:#7c8596; font-size:13px; }
  .boost-primary-tabs { display:inline-flex; background:#f0edfc; padding:4px; border-radius:14px; gap:3px; }
  .boost-primary-tab { min-width:120px; background:transparent; border:0; color:#6c647f; padding:10px 18px; border-radius:11px; font:inherit; font-size:14px; font-weight:700; cursor:pointer; }
  .boost-primary-tab[aria-selected='true'] { background:#6255d9; color:white; box-shadow:0 3px 9px rgba(83,67,189,.18); }
  .boost-primary-tab:focus-visible, .boost-secondary-tab:focus-visible, .boost-page button:focus-visible { outline:2px solid #6255d9; outline-offset:2px; }
  .boost-secondary-tabs { display:flex; align-items:center; gap:29px; border-bottom:1px solid #e7e9ee; margin:18px 0 23px; }
  .boost-secondary-tab { position:relative; font:inherit; font-size:14px; font-weight:400; background:transparent; color:#72798a; padding:12px 2px 15px; margin:0; border:0; border-bottom:3px solid transparent; cursor:pointer; border-radius:0; }
  .boost-secondary-tab[aria-selected='true'] { color:#151515; border-bottom-color:#151515; }
  .boost-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:18px; }
  .boost-periods { display:flex; align-items:center; flex-wrap:wrap; gap:7px; }
  .boost-period { background:#fff; border:1px solid #e6e8ef; border-radius:9px; color:#647086; cursor:pointer; font:inherit; font-size:12px; font-weight:650; padding:9px 12px; }
  .boost-period[aria-pressed='true'] { color:#5847c9; border-color:#cdc5f6; background:#f6f3ff; }
  .boost-date-range { display:flex; gap:7px; align-items:center; flex-wrap:wrap; }
  .boost-date-range input { border:1px solid #e1e5ed; border-radius:9px; font:inherit; padding:8px; max-width:155px; color:#49566b; background:#fff; }
  .boost-small { color:#81899b; font-size:12px; }
  .boost-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
  .boost-stat { border:1px solid #e9ebf2; background:#fff; border-radius:15px; padding:19px; box-shadow:0 5px 20px rgba(19,30,59,.027); min-width:0; }
  .boost-stat-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .boost-stat-label { color:#758093; font-size:12px; line-height:1.4; font-weight:700; }
  .boost-stat-icon { display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:10px; background:#f3f0ff; color:#6b57d8; font-size:18px; }
  .boost-stat-value { font-size:27px; line-height:1.2; font-weight:850; color:#22263b; margin-top:16px; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .boost-stat-note { font-size:11px; margin-top:8px; color:#9398a4; line-height:1.35; }
  .boost-two { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(290px,1fr); gap:16px; margin-bottom:18px; }
  .boost-two-even { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .boost-panel { border:1px solid #e9ebf2; background:#fff; border-radius:16px; padding:20px; box-shadow:0 5px 20px rgba(19,30,59,.027); min-width:0; }
  .boost-panel-head { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:17px; }
  .boost-panel-title { font-size:15px; font-weight:800; color:#202538; margin:0; }
  .boost-panel-subtitle { font-size:12px; color:#8b93a1; margin:4px 0 0; }
  .boost-empty { min-height:125px; display:flex; justify-content:center; align-items:center; text-align:center; color:#8d95a4; font-size:13px; line-height:1.6; padding:20px; background:#fcfcff; border-radius:12px; }
  .boost-bars { display:flex; align-items:flex-end; gap:10px; height:190px; padding:16px 2px 2px; border-bottom:1px solid #e5e7ed; }
  .boost-bar-cell { flex:1; min-width:6px; height:100%; display:flex; align-items:flex-end; justify-content:center; position:relative; }
  .boost-bar { width:70%; max-width:38px; min-height:2px; background:linear-gradient(180deg,#8a78f6,#6255dc); border-radius:5px 5px 0 0; }
  .boost-bar-label { position:absolute; top:calc(100% + 8px); text-align:center; white-space:nowrap; font-size:10px; color:#929aab; }
  .boost-chart-wrap { padding-bottom:30px; }
  .boost-rank-row { display:flex; align-items:center; gap:11px; margin:15px 0; }
  .boost-rank-label { color:#525c70; font-size:12px; width:95px; flex-shrink:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .boost-rank-track { background:#eff0f6; height:9px; border-radius:10px; flex:1; overflow:hidden; }
  .boost-rank-fill { background:#8d7af2; height:100%; border-radius:10px; }
  .boost-rank-value { font-weight:750; color:#465068; width:42px; font-size:11px; text-align:right; }
  .boost-funnel { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; }
  .boost-funnel-step { background:#f7f5ff; border:1px solid #eee9fe; border-radius:11px; padding:15px 10px; text-align:center; }
  .boost-funnel-value { font-size:22px; font-weight:800; color:#594dbe; }
  .boost-funnel-label { color:#77728e; font-size:11px; line-height:1.4; margin-top:6px; }
  .boost-table-toolbar { display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:15px; }
  .boost-search { background:#fff; border:1px solid #dfe3ed; border-radius:10px; padding:10px 12px; font:inherit; color:#2d3545; font-size:13px; width:min(100%,320px); }
  .boost-table-scroll { overflow-x:auto; width:100%; }
  .boost-table { border-collapse:collapse; width:100%; min-width:750px; font-size:12px; }
  .boost-table th { padding:13px 12px; background:#f9f9fc; color:#8992a2; text-align:left; white-space:nowrap; font-weight:750; border-bottom:1px solid #ebecf0; }
  .boost-table td { padding:14px 12px; border-bottom:1px solid #f0f1f5; color:#4c5567; vertical-align:middle; }
  .boost-work { display:flex; align-items:center; gap:10px; min-width:180px; }
  .boost-cover { width:34px; height:47px; border-radius:5px; object-fit:cover; background:#eae7f7; flex-shrink:0; }
  .boost-cover-fallback { display:flex; align-items:center; justify-content:center; font-size:17px; color:#7465b8; }
  .boost-work-title { font-weight:800; color:#2e3445; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .boost-work-author { color:#9298a7; font-size:11px; margin-top:4px; }
  .boost-status { display:inline-flex; border-radius:20px; padding:5px 10px; background:#f1f1f4; color:#687084; font-size:11px; font-weight:700; }
  .boost-status[data-state='active'] { background:#e6f8ed; color:#198251; }
  .boost-status[data-state='completed'] { background:#edeaff; color:#6751ca; }
  .boost-status[data-state='paused'] { background:#fff1de; color:#a67124; }
  .boost-progress { height:6px; background:#eeeeF5; border-radius:20px; overflow:hidden; width:74px; margin-top:5px; }
  .boost-progress-fill { height:100%; background:#6958df; border-radius:20px; }
  .boost-table-footer { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:17px; flex-wrap:wrap; }
  .boost-page-button { border:1px solid #e3e5ed; background:white; border-radius:8px; padding:8px 13px; color:#4c556a; font:inherit; font-size:12px; cursor:pointer; }
  .boost-page-button:disabled { opacity:.4; cursor:default; }
  .boost-alert { margin:0 0 17px; padding:13px 15px; border:1px solid #f7dcb1; border-radius:11px; color:#896022; background:#fffbf2; font-size:12px; }
  .boost-overview-box { background:#f7f5ff; border:1px solid #eeeafd; border-radius:12px; padding:15px 17px; margin-top:15px; }
  .boost-revenue-row { display:flex; justify-content:space-between; border-bottom:1px solid #e9e6f2; padding:12px 0; gap:10px; color:#72798a; font-size:12px; }
  .boost-revenue-row:last-child { border-bottom:0; }
  .boost-revenue-row strong { color:#2b3050; font-size:13px; }
  @media(max-width:1080px) { .boost-stats { grid-template-columns:repeat(2,minmax(0,1fr)); } .boost-two { grid-template-columns:1fr; } }
  @media(max-width:620px) { .boost-heading { font-size:20px; } .boost-primary-tabs { width:100%; } .boost-primary-tab { flex:1; min-width:0; } .boost-stats { gap:9px; } .boost-stat { padding:13px; } .boost-stat-value { font-size:22px; } .boost-panel { padding:15px; } .boost-funnel { grid-template-columns:repeat(2,minmax(0,1fr)); } .boost-secondary-tabs { gap:21px; } }
  [data-theme='dark'] .boost-page, .dark .boost-page { color:#e9eaf2; }
  [data-theme='dark'] .boost-panel, [data-theme='dark'] .boost-stat, .dark .boost-panel, .dark .boost-stat { background:#1e2433; border-color:#353d4d; }
  [data-theme='dark'] .boost-heading, [data-theme='dark'] .boost-stat-value, [data-theme='dark'] .boost-panel-title, [data-theme='dark'] .boost-work-title, .dark .boost-heading, .dark .boost-stat-value, .dark .boost-panel-title, .dark .boost-work-title { color:#f5f4ff; }
  [data-theme='dark'] .boost-secondary-tab[aria-selected='true'], .dark .boost-secondary-tab[aria-selected='true'] { color:#fff; border-bottom-color:#fff; }
  [data-theme='dark'] .boost-empty, .dark .boost-empty { background:#252b3a; }
  [data-theme='dark'] .boost-period, [data-theme='dark'] .boost-page-button, [data-theme='dark'] .boost-search, [data-theme='dark'] .boost-date-range input, .dark .boost-period, .dark .boost-page-button, .dark .boost-search, .dark .boost-date-range input { background:#222a39; border-color:#454b60; color:#e5e7ef; }
  [data-theme='dark'] .boost-table th, .dark .boost-table th { background:#252c3b; }
`

function cambodiaDay() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)
}

function shiftDay(day, offset) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10)
}

function getRange(period, start, end) {
  const yesterday = shiftDay(cambodiaDay(), -1)
  if (period === 'yesterday') return [yesterday, yesterday]
  if (period === 'last7') return [shiftDay(yesterday, -6), yesterday]
  if (period === 'last30') return [shiftDay(yesterday, -29), yesterday]
  return [start, end]
}

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function tokenFingerprint(token) {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash = Math.imul(hash ^ token.charCodeAt(index), 16777619)
  }
  return (hash >>> 0).toString(16)
}

function validDay(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function number(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.isFinite(Number(value)) && value != null && value !== '' ? Number(value) : null
}

function formatNumber(value) {
  const n = number(value)
  return n == null ? '—' : n.toLocaleString('en-US')
}

function formatMoney(value) {
  const n = number(value)
  return n == null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function formatPercent(value) {
  const n = number(value)
  return n == null ? '—' : `${n.toFixed(1)}%`
}

async function getInsights(params) {
  const token = getToken()
  if (!token) throw new Error('Admin session required. Please sign in again.')
  const query = new URLSearchParams({
    audience: params.audience,
    start: params.start,
    end: params.end,
    page: String(params.page),
    limit: String(PAGE_SIZE),
  })
  if (params.audience === 'author') query.set('kind', params.kind)
  if (params.search) query.set('search', params.search)
  const key = `${cambodiaDay()}:${tokenFingerprint(token)}:${query.toString()}`
  if (cache.has(key)) return cache.get(key)
  try {
    const saved = JSON.parse(sessionStorage.getItem(CACHE_PREFIX + key) || 'null')
    if (saved && saved.ok === true && saved.data && typeof saved.data === 'object') {
      cache.set(key, saved.data)
      return saved.data
    }
  } catch {
    try { sessionStorage.removeItem(CACHE_PREFIX + key) } catch {}
  }
  if (pending.has(key)) return pending.get(key)
  const promise = (async () => {
    const response = await fetch(`${API_URL}/api/admin/boost/insights?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      if (response.status === 404) throw new Error('Boost analytics is awaiting Backend integration. No figures are available yet.')
      if (response.status === 401 || response.status === 403) throw new Error('Admin access denied. Please sign in again.')
      throw new Error(`Unable to load Boost analytics (${response.status}).`)
    }
    const payload = await response.json().catch(() => null)
    if (!payload || payload.ok !== true || !payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      throw new Error('Boost analytics returned an invalid response.')
    }
    cache.set(key, payload.data)
    try { sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ok: true, data: payload.data })) } catch {}
    return payload.data
  })().finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}

function StatCard({ label, value, note, icon }) {
  return (
    <div className="boost-stat">
      <div className="boost-stat-top"><span className="boost-stat-label">{label}</span><span className="boost-stat-icon" aria-hidden="true">{icon}</span></div>
      <div className="boost-stat-value">{value}</div>
      <div className="boost-stat-note">{note}</div>
    </div>
  )
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="boost-panel">
      <div className="boost-panel-head"><div><h3 className="boost-panel-title">{title}</h3>{subtitle ? <p className="boost-panel-subtitle">{subtitle}</p> : null}</div></div>
      {children}
    </section>
  )
}

function Empty({ label = 'No recorded data for this period.' }) {
  return <div className="boost-empty">{label}</div>
}

function RankList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return <Empty />
  const rows = items.slice(0, 6)
  const max = Math.max(1, ...rows.map((item) => Math.max(0, number(item.count) || 0)))
  return (
    <div>
      {rows.map((item, index) => (
        <div className="boost-rank-row" key={`${item.name}-${index}`}>
          <span className="boost-rank-label" title={String(item.name || '')}>{item.name || 'Unknown'}</span>
          <div className="boost-rank-track"><div className="boost-rank-fill" style={{ width: `${Math.min(100, Math.max(0, (number(item.count) || 0) / max * 100))}%` }} /></div>
          <span className="boost-rank-value">{formatNumber(item.count)}</span>
        </div>
      ))}
    </div>
  )
}

function Trend({ items }) {
  if (!Array.isArray(items) || items.length === 0) return <Empty />
  const rows = items.slice(-31)
  const max = Math.max(1, ...rows.map((item) => Math.max(0, number(item.value) || 0)))
  return (
    <div className="boost-chart-wrap">
      <div className="boost-bars" role="img" aria-label="Daily trend of recorded Boost activity">
        {rows.map((item, index) => <div className="boost-bar-cell" key={`${item.day}-${index}`} title={`${item.day}: ${formatNumber(item.value)}`}>
          <div className="boost-bar" style={{ height: `${Math.max(1, Math.min(100, ((number(item.value) || 0) / max) * 100))}%` }} />
          {(rows.length < 12 || index % Math.ceil(rows.length / 7) === 0) && <span className="boost-bar-label">{String(item.day || '').slice(5)}</span>}
        </div>)}
      </div>
    </div>
  )
}

function Funnel({ items, type }) {
  const keys = type === 'book'
    ? [['impressions', 'Impressions'], ['opens', 'Book Opens'], ['reads', 'Reads Started'], ['unlocks', 'Unlocks']]
    : [['impressions', 'Impressions'], ['clicks', 'Clicks'], ['engagements', 'Engagement'], ['followers', 'Follows']]
  return (
    <div className="boost-funnel">
      {keys.map(([key, label]) => <div className="boost-funnel-step" key={key}>
        <div className="boost-funnel-value">{formatNumber(items?.[key])}</div>
        <div className="boost-funnel-label">{label}</div>
      </div>)}
    </div>
  )
}

function ReaderView({ data }) {
  const metrics = data?.metrics || {}
  return (
    <>
      <div className="boost-stats">
        <StatCard label="Interested Readers" icon="♙" value={formatNumber(metrics.interested_readers)} note="Unique readers engaging with books" />
        <StatCard label="Reading Actions" icon="▤" value={formatNumber(metrics.reading_actions)} note="Reads and episode opens" />
        <StatCard label="Saves & Follows" icon="♡" value={formatNumber(metrics.saves_follows)} note="Library saves and author follows" />
        <StatCard label="Unlocks" icon="◇" value={formatNumber(metrics.unlocks)} note="Paid episode unlocks" />
      </div>
      <div className="boost-two">
        <Panel title="Reader Activity" subtitle="Daily recorded reading interest"><Trend items={data?.trend} /></Panel>
        <Panel title="Reading Journey" subtitle="Reader actions in the selected period"><Funnel items={data?.funnel} type="book" /></Panel>
      </div>
      <div className="boost-two boost-two-even">
        <Panel title="Top Genres" subtitle="Genres with the most reading interest"><RankList items={data?.genres} /></Panel>
        <Panel title="Top Tags" subtitle="Tags readers are exploring"><RankList items={data?.tags} /></Panel>
      </div>
    </>
  )
}

function RevenuePanel({ data, kind }) {
  const revenue = data?.revenue || {}
  return (
    <Panel title="Revenue Sources" subtitle="Boost fees and sales attributed to campaigns">
      <div className="boost-revenue-row"><span>Boost Fees Paid</span><strong>{formatMoney(revenue.boost_fees)}</strong></div>
      <div className="boost-revenue-row"><span>{kind === 'book' ? 'Attributed Episode / Book Sales' : 'Attributed Post Sales'}</span><strong>{formatMoney(revenue.attributed_sales)}</strong></div>
      <div className="boost-revenue-row"><span>Shadow Share from Attributed Sales</span><strong>{formatMoney(revenue.shadow_share)}</strong></div>
      <div className="boost-overview-box">
        <div className="boost-stat-label">Total Platform Revenue from Boost</div>
        <div className="boost-stat-value">{formatMoney(revenue.platform_revenue)}</div>
        <div className="boost-small">Fees + platform share, with no double counting</div>
      </div>
    </Panel>
  )
}

function CampaignTable({ campaigns, total, kind, page, setPage, search, setSearch, loading }) {
  const pages = Math.max(1, Math.ceil(Math.max(0, number(total) || 0) / PAGE_SIZE))
  return (
    <section className="boost-panel">
      <div className="boost-table-toolbar">
        <div><h3 className="boost-panel-title">{kind === 'book' ? 'Boosted Books' : 'Boosted Posts'}</h3><p className="boost-panel-subtitle">View authors, placements, goals, performance and fees</p></div>
        <input className="boost-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder={`Search ${kind === 'book' ? 'books' : 'posts'} or authors...`} aria-label="Search campaigns" />
      </div>
      <div className="boost-table-scroll">
        <table className="boost-table">
          <thead><tr><th>{kind === 'book' ? 'Book / Author' : 'Post / Author'}</th><th>Placement</th><th>Goal</th><th>Goal Achieved</th><th>Boost Fee</th><th>Revenue</th><th>Status</th></tr></thead>
          <tbody>
            {Array.isArray(campaigns) && campaigns.length > 0 ? campaigns.map((item, index) => {
              const achieved = number(item.goal_achieved_percent)
              const state = String(item.status || '').toLowerCase()
              return (
                <tr key={item.id || index}>
                  <td><div className="boost-work">
                    {kind === 'book' && (item.cover_url
                      ? <img className="boost-cover" src={item.cover_url} alt="Book cover" loading="lazy" />
                      : <div className="boost-cover boost-cover-fallback" aria-hidden="true">▤</div>)}
                    <div><div className="boost-work-title" title={item.title || ''}>{item.title || 'Untitled'}</div><div className="boost-work-author">{item.author_name || 'Unknown author'}</div></div>
                  </div></td>
                  <td>{item.placement || '—'}</td>
                  <td>{item.goal || '—'}</td>
                  <td><strong>{formatPercent(achieved)}</strong><div className="boost-progress"><div className="boost-progress-fill" style={{ width: `${Math.min(100, Math.max(0, achieved || 0))}%` }} /></div></td>
                  <td>{formatMoney(item.boost_fee)}</td>
                  <td>{formatMoney(item.attributed_revenue)}</td>
                  <td><span className="boost-status" data-state={state}>{item.status || 'Unknown'}</span></td>
                </tr>
              )
            }) : <tr><td colSpan={7}><Empty label={loading ? 'Loading campaigns...' : 'No campaigns found for these filters.'} /></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="boost-table-footer">
        <span className="boost-small">{formatNumber(total)} campaigns · 20 per page</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="boost-page-button" disabled={loading || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span className="boost-small">{page} / {pages}</span>
          <button type="button" className="boost-page-button" disabled={loading || page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>Next</button>
        </div>
      </div>
    </section>
  )
}

function AuthorView({ data, kind, page, setPage, search, setSearch, loading }) {
  const metrics = data?.metrics || {}
  return (
    <>
      <div className="boost-stats">
        <StatCard label="Boost Revenue" icon="$" value={formatMoney(metrics.boost_revenue)} note="Revenue from paid Boost campaigns" />
        <StatCard label="Active Campaigns" icon="↗" value={formatNumber(metrics.active_campaigns)} note="Campaigns currently running" />
        <StatCard label="Campaign Reach" icon="◎" value={formatNumber(metrics.reach)} note="Unique readers reached" />
        <StatCard label="Goals Achieved" icon="✓" value={formatPercent(metrics.goals_achieved_percent)} note="Achievement against campaign targets" />
      </div>
      <div className="boost-two">
        <Panel title={kind === 'book' ? 'Book Boost Performance' : 'Post Boost Performance'} subtitle="Daily campaign exposure"><Trend items={data?.trend} /></Panel>
        <RevenuePanel data={data} kind={kind} />
      </div>
      <Panel title={kind === 'book' ? 'Book Conversion Funnel' : 'Post Engagement Funnel'} subtitle="Attributed campaign actions, not all organic activity"><Funnel items={data?.funnel} type={kind} /></Panel>
      <div style={{ height: 18 }} />
      <CampaignTable campaigns={data?.campaigns} total={data?.total} kind={kind} page={page} setPage={setPage} search={search} setSearch={setSearch} loading={loading} />
    </>
  )
}

export default function AdminBoostPage() {
  const [audience, setAudience] = useState('reader')
  const [kind, setKind] = useState('post')
  const [period, setPeriod] = useState('last7')
  const [customStart, setCustomStart] = useState(() => shiftDay(cambodiaDay(), -7))
  const [customEnd, setCustomEnd] = useState(() => shiftDay(cambodiaDay(), -1))
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [querySearch, setQuerySearch] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [start, end] = useMemo(() => getRange(period, customStart, customEnd), [period, customStart, customEnd])
  const invalidRange = !validDay(start) || !validDay(end) || start > end || end >= cambodiaDay()

  useEffect(() => {
    const timer = setTimeout(() => setQuerySearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let active = true
    setData(null)
    setError('')
    if (invalidRange) return () => { active = false }
    setLoading(true)
    getInsights({ audience, kind, start, end, page, search: audience === 'author' ? querySearch : '' })
      .then((value) => { if (active) setData(value) })
      .catch((failure) => { if (active) setError(failure.message || 'Unable to load insights.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [audience, kind, start, end, page, querySearch, invalidRange, reloadKey])

  const chooseAudience = (value) => { setAudience(value); setPage(1); setSearch(''); setQuerySearch('') }
  const chooseKind = (value) => { setKind(value); setPage(1); setSearch(''); setQuerySearch('') }
  const choosePeriod = (value) => { setPeriod(value); setPage(1) }

  const refresh = () => {
    const prefix = `${cambodiaDay()}:${tokenFingerprint(getToken())}:`
    for (const key of cache.keys()) if (key.startsWith(prefix)) cache.delete(key)
    try { for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index)
      if (key?.startsWith(CACHE_PREFIX + prefix)) sessionStorage.removeItem(key)
    } } catch {}
    setReloadKey((value) => value + 1)
  }

  return (
    <AdminLayout title="Boost" subtitle="Reader insights and author campaign performance">
      <style>{css}</style>
      <div className="boost-page">
        <div className="boost-topline">
          <div><p className="boost-kicker">SHADOW · AD ANALYTICS</p><h2 className="boost-heading">Boost Analytics</h2><p className="boost-subtitle">Understand what readers do and how author promotions earn revenue.</p></div>
          <div className="boost-primary-tabs" role="tablist" aria-label="Audience analytics">
            <button type="button" role="tab" aria-selected={audience === 'reader'} className="boost-primary-tab" onClick={() => chooseAudience('reader')}>Reader</button>
            <button type="button" role="tab" aria-selected={audience === 'author'} className="boost-primary-tab" onClick={() => chooseAudience('author')}>Author</button>
          </div>
        </div>

        {audience === 'author' && <div className="boost-secondary-tabs" role="tablist" aria-label="Boost campaign type">
          <button type="button" role="tab" aria-selected={kind === 'post'} className="boost-secondary-tab" onClick={() => chooseKind('post')}>Boost Post</button>
          <button type="button" role="tab" aria-selected={kind === 'book'} className="boost-secondary-tab" onClick={() => chooseKind('book')}>Boost Book</button>
        </div>}

        <div className="boost-toolbar">
          <div className="boost-periods" aria-label="Date range">
            {[['yesterday', 'Yesterday'], ['last7', 'Last 7 days'], ['last30', 'Last 30 days'], ['custom', 'Custom']].map(([value, label]) => <button type="button" key={value} className="boost-period" aria-pressed={period === value} onClick={() => choosePeriod(value)}>{label}</button>)}
          </div>
          <div className="boost-date-range">
            {period === 'custom' && <><input type="date" aria-label="Start date" max={shiftDay(cambodiaDay(), -1)} value={customStart} onChange={(event) => { setCustomStart(event.target.value); setPage(1) }} /><span className="boost-small">to</span><input type="date" aria-label="End date" max={shiftDay(cambodiaDay(), -1)} value={customEnd} onChange={(event) => { setCustomEnd(event.target.value); setPage(1) }} /></>}
            <span className="boost-small">{invalidRange ? 'Choose completed dates' : `${start} – ${end} · Cambodia time`}</span>
            <button type="button" className="boost-page-button" onClick={refresh} disabled={loading || invalidRange}>Refresh</button>
          </div>
        </div>

        {invalidRange && <div className="boost-alert" role="alert">Choose a valid date range ending before today. Boost reporting uses completed Cambodia days.</div>}
        {error && <div className="boost-alert" role="alert">{error}</div>}
        {loading && <div className="boost-small" role="status" style={{ marginBottom: 12 }}>Loading {audience === 'reader' ? 'reader' : kind === 'book' ? 'Boost Book' : 'Boost Post'} insights...</div>}

        {audience === 'reader'
          ? <ReaderView data={data} />
          : <AuthorView data={data} kind={kind} page={page} setPage={setPage} search={search} setSearch={setSearch} loading={loading} />}
        <div className="boost-small" style={{ marginTop: 20, textAlign: 'right' }}>Reports are based on recorded events. Boost fees, attributed sales and platform share are separate amounts.</div>
      </div>
    </AdminLayout>
  )
}
