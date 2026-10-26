import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const ROOT = `${(import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/$/, '')}/api/admin/reader-classification`
const LIMIT = 10
const FILTERS = [['all', 'All'], ['kh', 'Khmer Readers'], ['international', 'International Readers'], ['unknown', 'Unclassified']]
const CSS = `
.rcp{display:grid;gap:17px;color:var(--shadow-admin-text,#17213b)}
.rcp *{box-sizing:border-box}
.rcp-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.rcp-heading h2{font-size:23px;font-weight:900;margin:0}
.rcp-muted{color:var(--shadow-admin-muted,#64748b);font-size:12px;line-height:1.55}
.rcp-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.rcp-card,.rcp-panel{background:var(--shadow-admin-card,#fff);border:1px solid var(--shadow-admin-border,#e2e8f0);border-radius:15px;padding:16px;min-width:0}
.rcp-card strong{display:block;font-size:24px;margin-top:7px}
.rcp-tools,.rcp-actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap}
.rcp-tools{justify-content:space-between}
.rcp-input,.rcp-select{border:1px solid var(--shadow-admin-border,#cbd5e1);border-radius:10px;background:var(--shadow-admin-card,#fff);color:inherit;padding:10px 12px;font:inherit;font-size:13px;min-height:42px;max-width:100%}
.rcp-search{flex:1;min-width:170px}
.rcp-btn{border:1px solid var(--shadow-admin-border,#cbd5e1);background:var(--shadow-admin-card,#fff);color:inherit;border-radius:10px;min-height:40px;padding:9px 13px;cursor:pointer;font:inherit;font-size:12px;font-weight:800}
.rcp-btn.primary{background:#4f46e5;border-color:#4f46e5;color:white}
.rcp-btn:disabled{opacity:.5;cursor:not-allowed}
.rcp-table-scroll{overflow:auto}
.rcp-table{width:100%;border-collapse:collapse;min-width:850px;text-align:left}
.rcp-table th,.rcp-table td{padding:13px 10px;border-bottom:1px solid var(--shadow-admin-border,#e2e8f0);font-size:12px}
.rcp-table th{font-weight:900;color:var(--shadow-admin-muted,#64748b)}
.rcp-flag{font-size:20px}
.rcp-pill{display:inline-block;border-radius:99px;padding:5px 9px;background:var(--shadow-admin-soft,#eef2ff);font-weight:750}
.rcp-notice{padding:13px;border:1px solid var(--shadow-admin-border,#e2e8f0);border-radius:11px;font-size:12px}
.rcp-notice.error{color:#b91c1c;background:rgba(220,38,38,.06);border-color:rgba(220,38,38,.25)}
.rcp-dialog{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.58)}
.rcp-dialog form{width:100%;max-width:430px;background:var(--shadow-admin-card,#fff);color:var(--shadow-admin-text,#17213b);border:1px solid var(--shadow-admin-border,#e2e8f0);padding:20px;border-radius:18px;display:grid;gap:14px}
.rcp-field{display:grid;gap:7px;font-size:12px;font-weight:750}
@media(max-width:850px){.rcp-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:460px){.rcp-card{padding:12px}.rcp-heading h2{font-size:20px}}
`

function flag(value) {
  const code = String(value || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return '🌐'
  return String.fromCodePoint(...[...code].map(letter => 127397 + letter.charCodeAt(0)))
}

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function api(path, options = {}) {
  const token = adminToken()
  if (!token) throw new Error('Admin session required')
  const response = await fetch(`${ROOT}${path}`, {
    cache: 'no-store', ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.ok !== true) throw new Error(result?.message || `Request failed (${response.status})`)
  return result
}

function displayGroup(group) {
  if (group === 'kh') return '🇰🇭 Khmer'
  if (group === 'international') return '🌐 International'
  return 'Unclassified'
}

export default function AdminReaderClassificationPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [country, setCountry] = useState('')
  const [group, setGroup] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const delay = setTimeout(() => { setQuery(search.trim().slice(0, 90)); setPage(1) }, 350)
    return () => clearTimeout(delay)
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), group: filter })
    if (query) params.set('q', query)
    api(`?${params}`, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        setRows(Array.isArray(result.items) ? result.items.slice(0, LIMIT) : [])
        setSummary(result.summary || null)
        setHasNext(result.has_next === true)
      })
      .catch(err => {
        if (!controller.signal.aborted) { setRows([]); setError(err?.message || 'Unable to load readers') }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [filter, page, query, refresh])

  function openEdit(reader) {
    setEditing(reader)
    setCountry(reader.admin_country_override || '')
    setGroup(reader.admin_group_override || '')
    setSaveError('')
  }

  async function save(event) {
    event.preventDefault()
    if (!editing?.id || saving) return
    const code = country.trim().toUpperCase()
    if (code && !/^[A-Z]{2}$/.test(code)) { setSaveError('Enter a two-letter country code'); return }
    if (!['', 'kh', 'international'].includes(group)) { setSaveError('Invalid reader group'); return }
    setSaving(true)
    setSaveError('')
    try {
      await api(`/${encodeURIComponent(editing.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_country_override: code || null, admin_group_override: group || null }),
      })
      setEditing(null)
      setRefresh(value => value + 1)
    } catch (err) {
      setSaveError(err.message || 'Cannot save changes')
    } finally {
      setSaving(false)
    }
  }

  const cards = [['All Readers', 'total'], ['🇰🇭 Khmer', 'kh'], ['🌐 International', 'international'], ['Unclassified', 'unknown']]

  return <AdminLayout title="Reader Classification" subtitle="Story Language analytics · Country Settings">
    <style>{CSS}</style>
    <div className="rcp">
      <div className="rcp-heading">
        <div><h2>Reader Classification</h2><p className="rcp-muted">Classify by Story Language read, independently from physical IP country.</p></div>
        <button className="rcp-btn" type="button" onClick={() => setRefresh(value => value + 1)} disabled={loading}>Refresh</button>
      </div>
      <div className="rcp-cards">{cards.map(([label, key]) => <div className="rcp-card" key={key}><span className="rcp-muted">{label}</span><strong>{summary?.[key] == null ? '—' : Number(summary[key]).toLocaleString()}</strong></div>)}</div>
      <div className="rcp-panel">
        <div className="rcp-tools">
          <input className="rcp-input rcp-search" value={search} onChange={event => setSearch(event.target.value)} maxLength={90} placeholder="Search name / username / Reader ID" aria-label="Search readers" />
          <select className="rcp-select" aria-label="Reader group filter" value={filter} onChange={event => { setFilter(event.target.value); setPage(1) }}>{FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
        {error && <p className="rcp-notice error" role="alert">{error}</p>}
        {loading && <p className="rcp-notice">Loading readers...</p>}
        {!loading && !error && !rows.length && <p className="rcp-notice">No readers found.</p>}
        {!loading && rows.length > 0 && <div className="rcp-table-scroll"><table className="rcp-table">
          <thead><tr><th>Reader</th><th>Detected IP</th><th>Effective Country</th><th>Khmer Story Language</th><th>Reader Group</th><th>Source</th><th>Action</th></tr></thead>
          <tbody>{rows.map(item => <tr key={item.id}>
            <td><strong>{item.name || item.username || 'Reader'}</strong><div className="rcp-muted">@{item.username || item.id}</div></td>
            <td><span className="rcp-flag">{flag(item.detected_country)}</span> {item.detected_country || 'Unknown'}</td>
            <td><span className="rcp-flag">{flag(item.effective_country)}</span> {item.effective_country || 'Unknown'}</td>
            <td>{item.khmer_read_percent == null ? 'No evidence' : `${Math.round(Number(item.khmer_read_percent))}%`}<div className="rcp-muted">{Number(item.khmer_episodes || 0)} Khmer / {Number(item.total_episodes || 0)} episodes</div></td>
            <td><span className="rcp-pill">{displayGroup(item.reader_group)}</span></td>
            <td>{item.classification_source || 'Unknown'}</td>
            <td><button className="rcp-btn" type="button" onClick={() => openEdit(item)}>Edit</button></td>
          </tr>)}</tbody>
        </table></div>}
        <div className="rcp-actions">
          <button type="button" className="rcp-btn" disabled={loading || page <= 1} onClick={() => setPage(n => n - 1)}>Previous</button>
          <span className="rcp-muted">Page {page} · 10/page</span>
          <button type="button" className="rcp-btn" disabled={loading || !hasNext} onClick={() => setPage(n => n + 1)}>Next</button>
        </div>
      </div>
      <p className="rcp-muted">Story Language determines reading interest, not payment location. Admin overrides are persistent until cleared.</p>
    </div>
    {editing && <div className="rcp-dialog" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setEditing(null) }}>
      <form role="dialog" aria-modal="true" aria-label="Edit Reader Classification" onSubmit={save}>
        <div><strong>Edit: {editing.name || editing.username || 'Reader'}</strong><p className="rcp-muted">Admin can change country and reader group independently.</p></div>
        <label className="rcp-field">Country Override (ISO 2-letter code)
          <input className="rcp-input" value={country} maxLength={2} placeholder="Auto (e.g. KH)" onChange={event => setCountry(event.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} />
        </label>
        <p className="rcp-muted">Original IP: {flag(editing.detected_country)} {editing.detected_country || 'Unknown'}</p>
        <label className="rcp-field">Reader Group Override
          <select className="rcp-select" value={group} onChange={event => setGroup(event.target.value)}>
            <option value="">Auto from Story Language</option>
            <option value="kh">🇰🇭 Khmer Reader</option>
            <option value="international">🌐 International Reader</option>
          </select>
        </label>
        {saveError && <p role="alert" className="rcp-notice error">{saveError}</p>}
        <div className="rcp-actions">
          <button type="button" className="rcp-btn" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
          <button type="submit" className="rcp-btn primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>}
  </AdminLayout>
}
