import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API = (import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/$/, '')
const ROOT = `${API}/api/admin/reader-classification`
const LIMIT = 10
const CACHE_TTL = 3 * 60 * 1000
const FILTERS = [
  ['all', 'All Readers'],
  ['kh', 'Khmer Readers'],
  ['international', 'International Readers'],
  ['unknown', 'Unclassified'],
]
const COUNTRY_CODES = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW XK'.split(' ')
const COUNTRY_PRIORITY = ['KH', 'TH', 'VN', 'US', 'CA', 'AU', 'JP', 'KR', 'CN', 'FR', 'GB', 'SG']
const COUNTRY_OPTIONS = [...new Set([...COUNTRY_PRIORITY, ...COUNTRY_CODES])].map(code => {
  let name = code
  try { name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code } catch {}
  return { code, name }
}).sort((a, b) => {
  const left = COUNTRY_PRIORITY.indexOf(a.code)
  const right = COUNTRY_PRIORITY.indexOf(b.code)
  if (left >= 0 || right >= 0) return left < 0 ? 1 : right < 0 ? -1 : left - right
  return a.name.localeCompare(b.name)
})
const responseCache = new Map()
let cacheOwner = ''

const CSS = `
.rcp{display:grid;gap:18px;color:var(--shadow-admin-text,#17213b);--rcp-border:var(--shadow-admin-border,#e2e8f0);--rcp-surface:var(--shadow-admin-card,#fff);--rcp-muted:var(--shadow-admin-muted,#64748b);--rcp-soft:var(--shadow-admin-bg,#f8fafc)}
.rcp *{box-sizing:border-box}
.rcp-heading,.rcp-actions,.rcp-toolbar,.rcp-row,.rcp-card-label{display:flex;align-items:center;gap:12px}
.rcp-heading,.rcp-toolbar{justify-content:space-between;flex-wrap:wrap}
.rcp-heading h2{margin:3px 0 4px;font-size:25px;letter-spacing:-.5px;font-weight:900}
.rcp-heading p,.rcp-muted{font-size:12px;line-height:1.6;color:var(--rcp-muted)}
.rcp-heading p{margin:0}
.rcp-eyebrow{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#6366f1}
.rcp-panel,.rcp-stat{background:var(--rcp-surface);border:1px solid var(--rcp-border);border-radius:17px;box-shadow:0 7px 23px rgba(15,23,42,.025)}
.rcp-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.rcp-stat{padding:17px;min-width:0}
.rcp-card-label{color:var(--rcp-muted);font-size:12px;font-weight:800}
.rcp-card-icon{width:37px;height:37px;border-radius:12px;display:grid;place-items:center;font-size:18px;background:#eef2ff;flex-shrink:0}
.rcp-card-icon.green{background:#ecfdf5}.rcp-card-icon.blue{background:#eff6ff}.rcp-card-icon.amber{background:#fffbeb}
.rcp-stat strong{display:block;font-size:26px;font-weight:900;line-height:1.2;margin-top:12px;font-variant-numeric:tabular-nums}
.rcp-stat small{display:block;font-size:11px;color:var(--rcp-muted);margin-top:4px}
.rcp-panel{padding:17px;min-width:0}
.rcp-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.rcp-panel-heading h3{font-size:15px;font-weight:900;margin:0}
.rcp-analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.rcp-progress-track{height:11px;overflow:hidden;border-radius:999px;background:#e7ebf3;margin:12px 0 9px;display:flex}
.rcp-progress-kh{height:100%;background:#10b981;transition:width .2s}.rcp-progress-international{height:100%;background:#6366f1;transition:width .2s}
.rcp-legend{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--rcp-muted)}
.rcp-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#10b981}.rcp-dot.purple{background:#6366f1}
.rcp-input,.rcp-select{border:1px solid var(--rcp-border);border-radius:11px;background:var(--rcp-surface);color:inherit;padding:10px 12px;min-height:41px;font:inherit;font-size:13px;max-width:100%}
.rcp-input{flex:1;min-width:185px}.rcp-select{min-width:180px}
.rcp-btn{border:1px solid var(--rcp-border);background:var(--rcp-surface);color:inherit;border-radius:11px;padding:10px 14px;min-height:39px;font:inherit;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap}
.rcp-btn:hover:not(:disabled){border-color:#818cf8;color:#4f46e5}
.rcp-btn.primary{background:#4f46e5;border-color:#4f46e5;color:#fff}
.rcp-btn:disabled{opacity:.52;cursor:not-allowed}
.rcp-btn:focus-visible,.rcp-select:focus-visible,.rcp-input:focus-visible{outline:3px solid #c7d2fe;outline-offset:2px}
.rcp-toolbar{margin-bottom:12px}.rcp-toolbar-left{display:flex;flex:1;align-items:center;gap:10px;flex-wrap:wrap}
.rcp-table-wrap{overflow-x:auto}.rcp-table{width:100%;border-collapse:collapse;min-width:1040px;text-align:left}
.rcp-table th{font-size:11px;font-weight:900;background:var(--rcp-soft);color:var(--rcp-muted);padding:13px 11px;white-space:nowrap}
.rcp-table td{font-size:12px;vertical-align:middle;padding:14px 11px;border-bottom:1px solid var(--rcp-border)}
.rcp-table tr:last-child td{border-bottom:0}
.rcp-person{display:flex;align-items:center;gap:11px;min-width:140px}
.rcp-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#eef2ff;color:#4f46e5;font-weight:900;flex-shrink:0}
.rcp-person strong{display:block;font-weight:900;font-size:12px}.rcp-person small{display:block;font-size:11px;color:var(--rcp-muted);margin-top:2px}
.rcp-flag{font-size:19px;vertical-align:middle;margin-right:5px}
.rcp-pill{display:inline-flex;align-items:center;gap:5px;background:#f1f5f9;color:#475569;border-radius:99px;padding:6px 10px;font-size:11px;font-weight:850;white-space:nowrap}
.rcp-pill.kh{background:#ecfdf5;color:#047857}.rcp-pill.intl{background:#eef2ff;color:#4338ca}.rcp-pill.admin{background:#fffbeb;color:#92400e}
.rcp-mini-progress{width:92px;height:6px;border-radius:99px;background:#e2e8f0;overflow:hidden;margin-top:6px}.rcp-mini-progress span{display:block;height:100%;background:#10b981}
.rcp-empty{border:1px dashed var(--rcp-border);border-radius:13px;padding:30px 18px;text-align:center;color:var(--rcp-muted);font-size:13px}
.rcp-alert{padding:13px 15px;border-radius:12px;font-size:12px;line-height:1.65;border:1px solid #fed7aa;background:#fff7ed;color:#9a3412}
.rcp-alert.error{border-color:#fecaca;background:#fef2f2;color:#b91c1c}
.rcp-panel-footer{border-top:1px solid var(--rcp-border);padding-top:13px;margin-top:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--rcp-muted)}
.rcp-overlay{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.6);display:flex;align-items:center;justify-content:center;padding:15px}
.rcp-modal{width:100%;max-width:580px;max-height:min(92vh,790px);overflow-y:auto;background:var(--rcp-surface);color:var(--shadow-admin-text,#17213b);border:1px solid var(--rcp-border);border-radius:19px;box-shadow:0 25px 80px rgba(0,0,0,.25);padding:22px;display:grid;gap:15px}
.rcp-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.rcp-modal-head h3{margin:0 0 4px;font-size:18px}
.rcp-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rcp-info{border:1px solid var(--rcp-border);border-radius:12px;padding:11px;background:var(--rcp-soft)}
.rcp-info small{display:block;font-size:10px;color:var(--rcp-muted);font-weight:800;margin-bottom:5px}.rcp-info strong{font-size:13px}
.rcp-field{display:grid;gap:7px;font-size:12px;font-weight:800}
.rcp-modal-actions{display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap}
.rcp-note{padding:11px 13px;border:1px solid var(--rcp-border);border-radius:12px;color:var(--rcp-muted);font-size:11px;line-height:1.6}
@media(max-width:1050px){.rcp-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.rcp-heading h2{font-size:21px}.rcp-stats,.rcp-analysis-grid,.rcp-modal-grid{grid-template-columns:1fr}.rcp-stat{padding:14px}.rcp-panel,.rcp-modal{padding:14px}.rcp-toolbar-left,.rcp-input,.rcp-select{width:100%}.rcp-toolbar-left{align-items:stretch}}
@media(prefers-color-scheme:dark){.rcp-alert{background:rgba(180,83,9,.13);color:#fbbf24;border-color:rgba(251,191,36,.3)}.rcp-alert.error{background:rgba(185,28,28,.12);color:#fca5a5;border-color:rgba(239,68,68,.25)}.rcp-pill{background:#334155;color:#e2e8f0}.rcp-pill.kh{background:#064e3b;color:#a7f3d0}.rcp-pill.intl{background:#312e81;color:#c7d2fe}.rcp-pill.admin{background:#78350f;color:#fde68a}}
`

function adminToken() {
  try { return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || '' } catch { return '' }
}

function flag(value) {
  const code = String(value || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return '🌐'
  return String.fromCodePoint(...[...code].map(letter => 127397 + letter.charCodeAt(0)))
}

function count(value) {
  const number = Number(value)
  return value === null || value === undefined || !Number.isFinite(number) ? '—' : number.toLocaleString()
}

function ratio(value) {
  const number = Number(value)
  return value === null || value === undefined || !Number.isFinite(number) ? null : Math.max(0, Math.min(100, number))
}

function countryLabel(code) {
  const key = String(code || '').toUpperCase()
  return COUNTRY_OPTIONS.find(item => item.code === key)?.name || (key || 'Unknown')
}

function sourceLabel(value) {
  const name = String(value || '').toLowerCase()
  if (name.includes('admin')) return 'Admin'
  if (name.includes('story')) return 'Story Language'
  if (name.includes('ip') || name.includes('cloudflare')) return 'IP Country'
  return 'Not determined'
}

function groupLabel(value) {
  if (value === 'kh') return '🇰🇭 Khmer Reader'
  if (value === 'international') return '🌐 International'
  return 'Unclassified'
}

function entryRatio(entry) {
  const known = ratio(entry.khmer_read_percent)
  if (known !== null) return known
  const total = Number(entry.total_episodes)
  const khmer = Number(entry.khmer_episodes)
  return Number.isFinite(total) && total > 0 && Number.isFinite(khmer) ? ratio(khmer / total * 100) : null
}

function cacheKey(path) {
  const token = adminToken()
  if (!token) throw new Error('Admin session required')
  if (cacheOwner !== token) {
    responseCache.clear()
    cacheOwner = token
  }
  return path
}

async function api(path, { signal, method = 'GET', body, force = false } = {}) {
  const token = adminToken()
  const key = cacheKey(path)
  const item = responseCache.get(key)
  if (method === 'GET' && !force && item && item.expires > Date.now()) return { ...item.result, fromCache: true }
  const response = await fetch(`${ROOT}${path}`, {
    method,
    signal,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.ok !== true) {
    const message = response.status === 404 ? 'Reader Classification Backend API is not connected yet.' : result?.message || `Request failed (${response.status})`
    throw new Error(message)
  }
  if (method === 'GET') {
    responseCache.delete(key)
    responseCache.set(key, { result, expires: Date.now() + CACHE_TTL })
    while (responseCache.size > 24) responseCache.delete(responseCache.keys().next().value)
  } else {
    responseCache.clear()
  }
  return { ...result, fromCache: false }
}

function Progress({ percent }) {
  return <div className="rcp-mini-progress" aria-label={percent === null ? 'No reading data' : `${Math.round(percent)}% Khmer reading`}><span style={{ width: `${percent || 0}%` }} /></div>
}

function CountryEditor({ reader, saving, error, onClose, onSave }) {
  const [country, setCountry] = useState(String(reader.admin_country_override || '').toUpperCase())
  const [group, setGroup] = useState(reader.admin_group_override || '')
  const [lookup, setLookup] = useState('')
  const options = useMemo(() => COUNTRY_OPTIONS.filter(item => item.code === country || `${item.name} ${item.code}`.toLowerCase().includes(lookup.toLowerCase())).slice(0, lookup ? 80 : COUNTRY_OPTIONS.length), [country, lookup])
  useEffect(() => {
    const handler = event => { if (event.key === 'Escape' && !saving) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, saving])

  function submit(event) {
    event.preventDefault()
    onSave(reader, country, group)
  }

  return <div className="rcp-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !saving) onClose() }}>
    <form className="rcp-modal" role="dialog" aria-modal="true" aria-label="Edit Reader Country" onSubmit={submit}>
      <div className="rcp-modal-head"><div><span className="rcp-eyebrow">Reader country management</span><h3>Edit {reader.name || reader.username || 'Reader'}</h3><div className="rcp-muted">Save a country permanently until Admin changes it again.</div></div><button className="rcp-btn" type="button" onClick={onClose} disabled={saving} aria-label="Close dialog">✕</button></div>
      <div className="rcp-modal-grid">
        <div className="rcp-info"><small>Original detected country</small><strong>{flag(reader.detected_country)} {countryLabel(reader.detected_country)}</strong></div>
        <div className="rcp-info"><small>Currently saved country</small><strong>{flag(reader.effective_country)} {countryLabel(reader.effective_country)}</strong></div>
      </div>
      <label className="rcp-field">Find a country
        <input className="rcp-input" value={lookup} placeholder="Type country name or code" onChange={event => setLookup(event.target.value)} maxLength={60} />
      </label>
      <label className="rcp-field">Admin Country Override
        <select className="rcp-select" value={country} onChange={event => setCountry(event.target.value)}>
          <option value="">Keep originally saved IP country</option>
          {options.map(option => <option key={option.code} value={option.code}>{flag(option.code)} {option.name} ({option.code})</option>)}
        </select>
      </label>
      <label className="rcp-field">Reader Group Override
        <select className="rcp-select" value={group} onChange={event => setGroup(event.target.value)}>
          <option value="">Auto from Story Language reading history</option>
          <option value="kh">🇰🇭 Khmer Reader</option>
          <option value="international">🌐 International Reader</option>
        </select>
      </label>
      <div className="rcp-info"><small>Reading evidence</small><strong>{count(reader.khmer_stories)} Khmer stories · {count(reader.international_stories)} foreign stories</strong><div className="rcp-muted">{count(reader.khmer_episodes)} Khmer episodes / {count(reader.total_episodes)} total episodes</div></div>
      <div className="rcp-note">Country controls region-based feature visibility. Reader Group describes Story Language interests and does not replace the saved country. Changes take effect only after Backend confirms Save.</div>
      {error && <div className="rcp-alert error" role="alert">{error}</div>}
      <div className="rcp-modal-actions"><button type="button" className="rcp-btn" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="rcp-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></div>
    </form>
  </div>
}

export default function AdminReaderClassificationPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cached, setCached] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const forceRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim().length >= 2 ? search.trim().slice(0, 90) : ''), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    const force = forceRef.current
    forceRef.current = false
    const params = new URLSearchParams({ page: '1', limit: String(LIMIT), group: filter })
    if (query) params.set('q', query)
    setLoading(true)
    setError('')
    api(`?${params.toString()}`, { signal: controller.signal, force })
      .then(result => {
        if (controller.signal.aborted) return
        setRows(Array.isArray(result.items) ? result.items.slice(0, LIMIT) : [])
        setSummary(result.summary || null)
        setCached(result.fromCache)
      })
      .catch(err => { if (!controller.signal.aborted) setError(err?.message || 'Unable to load readers') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [filter, query, refresh])

  async function save(reader, country, group) {
    if (!reader?.id || saving) return
    if (country && !COUNTRY_OPTIONS.some(item => item.code === country)) { setSaveError('Choose a valid country'); return }
    if (!['', 'kh', 'international'].includes(group)) { setSaveError('Choose a valid reader group'); return }
    setSaving(true)
    setSaveError('')
    try {
      await api(`/${encodeURIComponent(reader.id)}`, { method: 'PATCH', body: { admin_country_override: country || null, admin_group_override: group || null } })
      setEditing(null)
      forceRef.current = true
      setRefresh(value => value + 1)
    } catch (err) {
      setSaveError(err?.message || 'Cannot save changes')
    } finally {
      setSaving(false)
    }
  }

  const k = Number(summary?.khmer_episodes)
  const f = Number(summary?.international_episodes)
  const haveEpisodeTotals = summary?.khmer_episodes != null && summary?.international_episodes != null && Number.isFinite(k) && Number.isFinite(f)
  const khPercent = haveEpisodeTotals && k + f > 0 ? ratio(k / (k + f) * 100) : null
  const stats = [
    { label: 'Total Readers', value: summary?.total, icon: '👥', shade: '' },
    { label: 'Khmer Readers', value: summary?.kh, icon: '🇰🇭', shade: 'green' },
    { label: 'International Readers', value: summary?.international, icon: '🌐', shade: 'blue' },
    { label: 'Unclassified', value: summary?.unknown, icon: '◇', shade: 'amber' },
  ]

  function refreshNow() {
    forceRef.current = true
    setRefresh(value => value + 1)
  }

  return <AdminLayout title="Reader Classification" subtitle="Country Settings · Saved IP country and Story Language insights">
    <style>{CSS}</style>
    <div className="rcp">
      <div className="rcp-heading">
        <div><span className="rcp-eyebrow">Country Settings / Reader Classification</span><h2>Reader Classification</h2><p>Manage saved countries and understand what languages readers actually read.</p></div>
        <div className="rcp-actions"><span className="rcp-pill">10 newest readers</span><button type="button" className="rcp-btn primary" disabled={loading} onClick={refreshNow}>↻ Refresh</button></div>
      </div>
      <div className="rcp-stats">{stats.map(item => <div className="rcp-stat" key={item.label}><div className="rcp-card-label"><span className={`rcp-card-icon ${item.shade}`}>{item.icon}</span>{item.label}</div><strong>{count(item.value)}</strong><small>{item.label === 'Total Readers' ? 'All registered readers' : 'Saved classification summary'}</small></div>)}</div>
      <div className="rcp-analysis-grid">
        <section className="rcp-panel"><div className="rcp-panel-heading"><h3>Story Language Reading</h3><span className="rcp-pill">Historical activity</span></div><div className="rcp-legend"><span><i className="rcp-dot" />Khmer episodes: {count(summary?.khmer_episodes)}</span><span><i className="rcp-dot purple" />Foreign episodes: {count(summary?.international_episodes)}</span></div><div className="rcp-progress-track"><div className="rcp-progress-kh" style={{ width: `${khPercent || 0}%` }} /><div className="rcp-progress-international" style={{ width: `${khPercent === null ? 0 : 100 - khPercent}%` }} /></div><div className="rcp-muted">{khPercent === null ? 'No reading summary available yet.' : `${Math.round(khPercent)}% of counted reading is Khmer Story Language.`}</div></section>
        <section className="rcp-panel"><div className="rcp-panel-heading"><h3>Country Management</h3><span className="rcp-pill admin">Admin can override</span></div><div className="rcp-muted">Country is detected and saved once. It does not change with later IP changes. Admin can change any saved country using the Edit action.</div><div className="rcp-note" style={{ marginTop: 12 }}>Country = feature visibility · Reader Group = reading preference. No automatic country rewrite from Story Language.</div></section>
      </div>
      <section className="rcp-panel">
        <div className="rcp-panel-heading"><div><h3>Readers</h3><div className="rcp-muted">Newest 10 accounts, server-side search and filters. No background polling.</div></div><span className="rcp-pill">{cached ? 'Cached result' : 'On-demand loading'}</span></div>
        <div className="rcp-toolbar"><div className="rcp-toolbar-left"><input className="rcp-input" type="search" value={search} maxLength={90} onChange={event => setSearch(event.target.value)} placeholder="Search name, username or Reader ID" aria-label="Search readers" /><select className="rcp-select" value={filter} onChange={event => setFilter(event.target.value)} aria-label="Reader group filter">{FILTERS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div><button type="button" className="rcp-btn" disabled={loading} onClick={() => { setFilter('all'); setSearch('') }}>Clear Filters</button></div>
        {search.trim().length === 1 && <div className="rcp-muted">Enter at least 2 characters to search all readers.</div>}
        {error && <div className="rcp-alert error" role="alert">{error} {rows.length ? 'Showing previous results.' : 'The UI is ready; connect the Backend Reader Classification route to load real data.'}</div>}
        {loading && <div className="rcp-empty" role="status">Loading the latest readers…</div>}
        {!loading && rows.length === 0 && <div className="rcp-empty">{error ? 'Reader data is not available yet.' : 'No matching readers found.'}</div>}
        {!loading && rows.length > 0 && <div className="rcp-table-wrap"><table className="rcp-table"><thead><tr><th>Reader</th><th>Detected IP Country</th><th>Saved Country</th><th>Story Language Reading</th><th>Khmer Episodes</th><th>Reader Group</th><th>Source</th><th>Action</th></tr></thead><tbody>{rows.map(item => {
          const percent = entryRatio(item)
          return <tr key={item.id}><td><div className="rcp-person"><span className="rcp-avatar">{String(item.name || item.username || 'R').charAt(0).toUpperCase()}</span><div><strong>{item.name || item.username || 'Reader'}</strong><small>{item.username ? `@${item.username}` : String(item.id || '').slice(0, 12)}</small></div></div></td><td><span className="rcp-flag">{flag(item.detected_country)}</span>{countryLabel(item.detected_country)}</td><td><span className="rcp-flag">{flag(item.effective_country)}</span>{countryLabel(item.effective_country)}{item.admin_country_override && <div className="rcp-muted">Admin override</div>}</td><td><strong>{percent === null ? '—' : `${Math.round(percent)}% Khmer`}</strong><Progress percent={percent}/><div className="rcp-muted">{count(item.khmer_stories)} KH / {count(item.international_stories)} Foreign stories</div></td><td>{count(item.khmer_episodes)} / {count(item.total_episodes)}</td><td><span className={`rcp-pill ${item.reader_group === 'kh' ? 'kh' : item.reader_group === 'international' ? 'intl' : ''}`}>{groupLabel(item.reader_group)}</span></td><td><span className={`rcp-pill ${sourceLabel(item.classification_source) === 'Admin' ? 'admin' : ''}`}>{sourceLabel(item.classification_source)}</span></td><td><button type="button" className="rcp-btn" onClick={() => { setEditing(item); setSaveError('') }}>Edit</button></td></tr>
        })}</tbody></table></div>}
        <div className="rcp-panel-footer"><span>Maximum 10 readers per request · Search checks all readers on the server</span><span>Only reloads on page entry, filter/search change or Refresh</span></div>
      </section>
    </div>
    {editing && <CountryEditor key={editing.id} reader={editing} saving={saving} error={saveError} onClose={() => { if (!saving) setEditing(null) }} onSave={save} />}
  </AdminLayout>
}
