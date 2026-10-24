import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { uploadMediaLibraryWithProgress } from '../utils/uploadMediaLibraryWithProgress'

const API_URL = (import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/+$/, '')
const ENDPOINT = '/api/admin/profile-frames'
const PAGE_SIZE = 9
const MAX_BYTES = 5 * 1024 * 1024
const CACHE_MS = 5 * 60 * 1000
let listCache = { token: '', pages: new Map(), pending: new Map() }

const css = `
  .sfm{--fg:#171717;--sub:#737373;--line:#e8e8e8;--paper:#fff;--soft:#f9f9f9;--gold:#f9bd27;color:var(--fg);font-family:inherit}
  .sfm *{box-sizing:border-box}
  .sfm button,.sfm input,.sfm select{font:inherit}
  .sfm button{cursor:pointer}
  .sfm button:disabled{opacity:.5;cursor:not-allowed}
  .sfm button:focus-visible,.sfm input:focus-visible,.sfm select:focus-visible{outline:2px solid #c68b06;outline-offset:2px}
  .sfm-header,.sfm-bar,.sfm-actions,.sfm-card-bottom,.sfm-pager{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
  .sfm-header{margin-bottom:22px}
  .sfm-header h2{font-size:26px;font-weight:800;margin:0 0 6px}
  .sfm-header p{font-size:13px;color:var(--sub);margin:0}
  .sfm-button{border:1px solid var(--line);border-radius:10px;background:var(--paper);color:var(--fg);padding:10px 16px;font-size:13px;font-weight:700;min-height:41px}
  .sfm-button.gold{background:var(--gold);border-color:var(--gold);color:#171717}
  .sfm-button.black{background:#171717;border-color:#171717;color:#fff}
  .sfm-button.danger{color:#bd2727}
  .sfm-button.active{border-color:#d29b1b;background:#fff7dc;color:#5a3b00}
  .sfm-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:920px;margin:38px auto 0}
  .sfm-choice{border:1px solid var(--line);background:var(--paper);border-radius:20px;min-height:238px;padding:30px 22px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;transition:transform .15s,border-color .15s}
  .sfm-choice:hover{transform:translateY(-2px);border-color:#ebbe54}
  .sfm-choice:first-child{background:linear-gradient(145deg,#fffef9,#fff9e9);border-color:#f3d484}
  .sfm-choice-icon{width:60px;height:60px;display:grid;place-items:center;border-radius:50%;background:#fff2c6;color:#996100}
  .sfm-choice:nth-child(2) .sfm-choice-icon{background:#f2f2f2;color:#242424}
  .sfm-choice strong{font-size:19px}
  .sfm-choice span{font-size:13px;color:var(--sub)}
  .sfm-panel{border:1px solid var(--line);border-radius:16px;background:var(--paper);padding:22px}
  .sfm-bar{margin-bottom:19px}
  .sfm-title{font-size:18px;font-weight:800;margin:0}
  .sfm-note{font-size:12px;color:var(--sub);line-height:1.6}
  .sfm-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:19px}
  .sfm-field{width:100%;border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:12px;color:var(--fg);font-size:13px}
  .sfm-search{width:min(100%,290px)}
  .sfm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
  .sfm-card{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--paper);min-width:0}
  .sfm-thumb{aspect-ratio:1;background-color:#f1f1f1;background-image:linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%);background-size:24px 24px;background-position:0 0,0 12px,12px -12px,-12px 0;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .sfm-thumb img{height:100%;width:100%;object-fit:contain}
  .sfm-card-body{padding:12px}
  .sfm-card-name{font-weight:750;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 8px}
  .sfm-badge{font-size:10px;font-weight:800;border-radius:20px;padding:4px 8px;background:#f1f1f1;color:#424242;display:inline-flex;align-items:center;gap:4px}
  .sfm-badge.premium{background:#ffe9a2;color:#563b00}
  .sfm-card-bottom{margin-top:11px}
  .sfm-status{font-size:11px;color:#15803d}
  .sfm-status.hidden{color:#9b6a21}
  .sfm-icon-button{width:32px;height:32px;display:grid;place-items:center;border:1px solid var(--line);background:var(--paper);border-radius:8px;color:var(--fg)}
  .sfm-upload{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,340px);gap:24px;max-width:900px}
  .sfm-drop{border:2px dashed #d6d6d6;border-radius:15px;padding:28px 20px;text-align:center;min-height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;cursor:pointer;background:var(--soft);position:relative;overflow:hidden}
  .sfm-drop img{max-width:100%;width:220px;aspect-ratio:1;object-fit:contain}
  .sfm-drop input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
  .sfm-label{font-size:12px;font-weight:800;display:block;margin:17px 0 7px}
  .sfm-form-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
  .sfm-alert{border-radius:11px;padding:13px 15px;font-size:13px;margin-bottom:18px;background:#fff8e5;border:1px solid #edd496;color:#765207}
  .sfm-alert.error{background:#fff0f0;border-color:#f3c9c9;color:#a51f1f}
  .sfm-empty{padding:60px 20px;text-align:center;color:var(--sub);font-size:13px;border:1px dashed var(--line);border-radius:12px}
  .sfm-pager{margin-top:20px;font-size:12px;color:var(--sub)}
  .sfm-caption{font-size:12px;color:var(--sub);margin-top:25px;text-align:center}
  @media(max-width:940px){.sfm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sfm-upload{grid-template-columns:1fr}}
  @media(max-width:600px){.sfm-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.sfm-panel{padding:13px}.sfm-card-body{padding:9px}.sfm-choices{grid-template-columns:1fr;margin-top:15px}.sfm-header h2{font-size:22px}}
  .dark .sfm,[data-theme=dark] .sfm{--fg:#f6f6f6;--sub:#a3a3a3;--line:#454545;--paper:#252525;--soft:#292929}
  .dark .sfm-choice:first-child,[data-theme=dark] .sfm-choice:first-child{background:#302c21}
  .dark .sfm-button.active,[data-theme=dark] .sfm-button.active{background:#41351c;color:#ffe5a1}
  .dark .sfm-thumb,[data-theme=dark] .sfm-thumb{background-color:#3c3c3c}
`

function Icon({ name, size = 22 }) {
  const paths = {
    upload: <><path d="M12 16V3m0 0 5 5m-5-5L7 8"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    back: <path d="m15 18-6-6 6-6"/>,
    edit: <><path d="M12 20h9"/><path d="M16 4a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6M10 10v6m4-6v6"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 9a8 8 0 0 1 14-2l1 5M4 12l1 5a8 8 0 0 0 14-2"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.image}</svg>
}

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function canManage() {
  try {
    const admin = JSON.parse(sessionStorage.getItem('shadow_admin_user') || localStorage.getItem('shadow_admin_user') || '{}')
    return admin.has_all_permissions === true || ['owner', 'admin'].includes(String(admin.role || '').toLowerCase()) || admin.permission_keys?.includes('media_library.manage') === true
  } catch {
    return false
  }
}

function cleanUrl(value) {
  try {
    const url = new URL(String(value || ''))
    return url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

function cacheForUser() {
  const current = getToken()
  if (listCache.token !== current) listCache = { token: current, pages: new Map(), pending: new Map() }
  return listCache
}

function clearPages() {
  listCache = { token: getToken(), pages: new Map(), pending: new Map() }
}

async function request(path = '', { method = 'GET', body, token = getToken() } = {}) {
  if (!token || token !== getToken()) throw new Error('Please sign in again')
  const response = await fetch(`${API_URL}${ENDPOINT}${path}`, {
    method,
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (token !== getToken()) throw new Error('Admin account changed. Please open the page again')
  if (!response.ok || data.ok === false) {
    if (response.status === 401) throw new Error('Session expired. Sign in again')
    if (response.status === 403) throw new Error('You do not have permission to manage frames')
    throw new Error(data.message || `Request failed (${response.status})`)
  }
  return data
}

function loadFrames(query, refresh = false) {
  const scope = cacheForUser()
  const item = scope.pages.get(query)
  if (!refresh && item && Date.now() - item.at < CACHE_MS) return Promise.resolve(item.value)
  if (scope.pending.has(query)) return scope.pending.get(query)
  const promise = request(`?${query}`, { token: scope.token }).then(value => {
    if (scope === listCache) {
      if (scope.pages.size >= 12) scope.pages.delete(scope.pages.keys().next().value)
      scope.pages.set(query, { at: Date.now(), value })
    }
    return value
  }).finally(() => scope.pending.delete(query))
  scope.pending.set(query, promise)
  return promise
}

function validateFrame(file) {
  if (!file || !['image/png', 'image/webp'].includes(file.type)) return Promise.reject(new Error('Choose a transparent PNG or WebP image'))
  if (file.size < 16 || file.size > MAX_BYTES) return Promise.reject(new Error('Frame must be 5 MB or smaller'))
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const valid = image.naturalWidth === image.naturalHeight && image.naturalWidth >= 400
      URL.revokeObjectURL(url)
      valid ? resolve(file) : reject(new Error('Frame must be square (1:1) and at least 400 × 400 pixels'))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Unable to read this image'))
    }
    image.src = url
  })
}

const emptyForm = () => ({ id: '', name: '', access_tier: 'free', is_active: true, sort_order: 0 })

export default function AdminFrameManagementPage() {
  const [mode, setMode] = useState('home')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [querySearch, setQuerySearch] = useState('')
  const [refreshId, setRefreshId] = useState(0)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0, has_more: false })
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const uploadedRef = useRef(null)
  const requestId = useRef(0)
  const allowed = canManage()

  useEffect(() => {
    if (!file) { setPreview(''); return undefined }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (mode !== 'view') return undefined
    const timer = window.setTimeout(() => { setPage(1); setQuerySearch(search.trim()) }, 350)
    return () => window.clearTimeout(timer)
  }, [search, mode])

  const query = useMemo(() => new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), access: filter, status, search: querySearch }).toString(), [page, filter, status, querySearch])

  useEffect(() => {
    if (mode !== 'view' || !allowed) return undefined
    const id = ++requestId.current
    setLoading(true)
    setError('')
    loadFrames(query).then(data => {
      if (id !== requestId.current) return
      const list = Array.isArray(data.items) ? data.items : Array.isArray(data.frames) ? data.frames : []
      setRows(list.slice(0, PAGE_SIZE))
      setPagination(data.pagination || { page, total_pages: page, total: list.length, has_more: list.length === PAGE_SIZE })
    }).catch(failure => { if (id === requestId.current) setError(failure.message || 'Unable to load frames') }).finally(() => { if (id === requestId.current) setLoading(false) })
    return () => { requestId.current += 1 }
  }, [mode, query, refreshId, allowed, page])

  const changeMode = next => { setMode(next); setError(''); setNotice('') }
  const startAdd = () => { setForm(emptyForm()); setFile(null); uploadedRef.current = null; changeMode('upload') }
  const startEdit = item => { setForm({ id: item.id, name: item.name || '', access_tier: item.access_tier || 'free', is_active: item.is_active !== false, sort_order: Number(item.sort_order || 0), image_url: item.image_url || '' }); setFile(null); uploadedRef.current = null; changeMode('upload') }
  const refresh = () => { clearPages(); setRefreshId(value => value + 1) }

  const chooseFile = async nextFile => {
    if (!nextFile) return
    setError('')
    try { await validateFrame(nextFile); setFile(nextFile); uploadedRef.current = null }
    catch (failure) { setError(failure.message || 'Invalid frame image') }
  }

  const save = async event => {
    event.preventDefault()
    if (!allowed || busy) return
    const name = form.name.trim()
    if (!name || name.length > 100) { setError('Frame name must be 1–100 characters'); return }
    if (!form.id && !file) { setError('Select a square transparent image'); return }
    const account = getToken()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (file && !uploadedRef.current) {
        const result = await uploadMediaLibraryWithProgress({ apiUrl: API_URL, token: account, files: [file] })
        const image = result.images?.[0]
        if (!image?.storage_key || !cleanUrl(image.image_url)) throw new Error('Upload completed without a valid image URL')
        uploadedRef.current = image
      }
      const payload = { name, access_tier: form.access_tier, is_active: form.is_active, sort_order: Number(form.sort_order) || 0, ...(uploadedRef.current ? { image_url: uploadedRef.current.image_url, storage_key: uploadedRef.current.storage_key } : {}) }
      await request(form.id ? `/${encodeURIComponent(form.id)}` : '', { method: form.id ? 'PATCH' : 'POST', body: payload, token: account })
      clearPages()
      setFile(null)
      uploadedRef.current = null
      setNotice(form.id ? 'Frame updated successfully' : 'Frame uploaded successfully')
      setMode('view')
      setPage(1)
      setRefreshId(value => value + 1)
    } catch (failure) { setError(failure.message || 'Unable to save frame') }
    finally { setBusy(false) }
  }

  const remove = async item => {
    if (!allowed || busy || !window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return
    setBusy(true)
    setError('')
    try {
      await request(`/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      setNotice('Frame deleted')
      refresh()
    } catch (failure) { setError(failure.message || 'Unable to delete frame') }
    finally { setBusy(false) }
  }

  return <AdminLayout title="Frame Management" subtitle="Free and Premium profile frames for Shadow readers">
    <div className="sfm">
      <style>{css}</style>
      <header className="sfm-header">
        <div><h2>Frame Management</h2><p>Square 1:1 frames · Cloudflare media · Load only when requested</p></div>
        {mode !== 'home' && <div className="sfm-actions"><button className="sfm-button" onClick={() => changeMode('home')}><Icon name="back" size={14}/> Back</button><button className="sfm-button" onClick={() => changeMode('view')}>View Frames</button>{allowed && <button className="sfm-button gold" onClick={startAdd}>Upload Frame</button>}</div>}
      </header>
      {notice && <div className="sfm-alert" role="status">{notice}</div>}
      {error && <div className="sfm-alert error" role="alert">{error}</div>}
      {!allowed && <div className="sfm-alert error">Your account does not have permission to manage frames.</div>}
      {mode === 'home' && <><div className="sfm-choices">
        {allowed && <button className="sfm-choice" onClick={startAdd}><span className="sfm-choice-icon"><Icon name="upload" size={30}/></span><strong>Upload Frame</strong><span>Add a new Free or Premium frame</span><span className="sfm-button gold">Open Upload</span></button>}
        <button className="sfm-choice" disabled={!allowed} onClick={() => changeMode('view')}><span className="sfm-choice-icon"><Icon name="grid" size={30}/></span><strong>View Frames</strong><span>Browse and manage saved frames</span><span className="sfm-button">Open Library</span></button>
      </div><p className="sfm-caption">The Frame Library is not requested until you select View Frames.</p></>}
      {mode === 'upload' && allowed && <section className="sfm-panel">
        <div className="sfm-bar"><h3 className="sfm-title">{form.id ? 'Edit Frame' : 'Upload New Frame'}</h3><span className="sfm-note">PNG / WebP · 1:1 · 400 × 400 minimum · 5 MB maximum</span></div>
        <form className="sfm-upload" onSubmit={save}>
          <label className="sfm-drop" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!busy) chooseFile(event.dataTransfer.files?.[0]) }}>
            {(preview || cleanUrl(form.image_url)) ? <img src={preview || cleanUrl(form.image_url)} alt="Frame preview"/> : <><Icon name="upload" size={38}/><strong>Drop a square frame here</strong><span className="sfm-note">Or click to browse for a transparent image</span></>}
            <input type="file" accept="image/png,image/webp" disabled={busy} onChange={event => chooseFile(event.target.files?.[0])}/>
          </label>
          <div>
            <label className="sfm-label" htmlFor="sfm-name">Frame Name</label><input id="sfm-name" className="sfm-field" maxLength={100} required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Enter frame name"/>
            <label className="sfm-label" htmlFor="sfm-access">Access</label><select id="sfm-access" className="sfm-field" value={form.access_tier} onChange={event => setForm(current => ({ ...current, access_tier: event.target.value }))}><option value="free">Free</option><option value="premium">Premium</option></select>
            <label className="sfm-label" htmlFor="sfm-order">Display Order</label><input id="sfm-order" className="sfm-field" type="number" min={0} max={100000} value={form.sort_order} onChange={event => setForm(current => ({ ...current, sort_order: event.target.value }))}/>
            <label className="sfm-label" htmlFor="sfm-active">Visibility</label><select id="sfm-active" className="sfm-field" value={form.is_active ? 'active' : 'hidden'} onChange={event => setForm(current => ({ ...current, is_active: event.target.value === 'active' }))}><option value="active">Active</option><option value="hidden">Hidden</option></select>
            <div className="sfm-form-actions"><button type="submit" className="sfm-button gold" disabled={busy}>{busy ? 'Saving…' : 'Save Frame'}</button><button type="button" className="sfm-button" disabled={busy} onClick={() => changeMode('home')}>Cancel</button></div>
          </div>
        </form>
      </section>}
      {mode === 'view' && allowed && <section className="sfm-panel">
        <div className="sfm-bar"><div><h3 className="sfm-title">Saved Frames</h3><p className="sfm-note">9 frames per page. Images are loaded only in this view.</p></div><button className="sfm-button" disabled={loading || busy} onClick={refresh}><Icon name="refresh" size={14}/> Refresh</button></div>
        <div className="sfm-toolbar"><input className="sfm-field sfm-search" value={search} onChange={event => setSearch(event.target.value.slice(0, 80))} placeholder="Search frame name…" aria-label="Search frames"/><div className="sfm-actions">{[['all', 'All'], ['free', 'Free'], ['premium', 'Premium']].map(([value,label]) => <button key={value} type="button" className={`sfm-button ${filter === value ? 'active' : ''}`} onClick={() => { setFilter(value); setPage(1) }}>{label}</button>)}</div><select className="sfm-field" style={{ width: 135 }} aria-label="Frame status" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="all">All statuses</option><option value="active">Active</option><option value="hidden">Hidden</option></select></div>
        {loading ? <div className="sfm-empty">Loading 9 frames…</div> : error ? <div className="sfm-empty">Could not load frames. Try Refresh.</div> : rows.length ? <div className="sfm-grid">{rows.map(item => <article className="sfm-card" key={item.id}><div className="sfm-thumb">{cleanUrl(item.image_url) ? <img src={cleanUrl(item.image_url)} loading="lazy" alt={item.name || 'Frame'}/> : <Icon name="image" size={35}/>}</div><div className="sfm-card-body"><p className="sfm-card-name" title={item.name}>{item.name}</p><span className={`sfm-badge ${item.access_tier === 'premium' ? 'premium' : ''}`}>{item.access_tier === 'premium' ? '♛ PREMIUM' : 'FREE'}</span><div className="sfm-card-bottom"><span className={`sfm-status ${item.is_active === false ? 'hidden' : ''}`}>{item.is_active === false ? '● Hidden' : '● Active'}</span><div className="sfm-actions" style={{ gap: 5 }}><button className="sfm-icon-button" disabled={busy} title="Edit" aria-label={`Edit ${item.name}`} onClick={() => startEdit(item)}><Icon name="edit" size={16}/></button><button className="sfm-icon-button" disabled={busy} title="Delete" aria-label={`Delete ${item.name}`} onClick={() => remove(item)}><Icon name="trash" size={16}/></button></div></div></div></article>)}</div> : <div className="sfm-empty">No frames found for these filters.</div>}
        <div className="sfm-pager"><span>Page {page}{Number(pagination.total_pages) > 0 ? ` of ${pagination.total_pages}` : ''} · 9 per page</span><div className="sfm-actions"><button className="sfm-button" disabled={page <= 1 || loading} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button><button className="sfm-button" disabled={loading || !(pagination.has_more || page < Number(pagination.total_pages || page))} onClick={() => setPage(value => value + 1)}>Next</button></div></div>
      </section>}
    </div>
  </AdminLayout>
}
