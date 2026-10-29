import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { uploadMediaLibraryWithProgress } from '../utils/uploadMediaLibraryWithProgress'

const API_URL = (import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/+$/, '')
const ENDPOINT = '/api/admin/profile-frames'
const PAGE_SIZE = 9
const MAX_FILES = 20
const MAX_BYTES = 5 * 1024 * 1024
const CACHE_MS = 5 * 60 * 1000
let listCache = { token: '', pages: new Map(), pending: new Map() }
let folderCache = { token: '', at: 0, folders: [], pending: null }

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
  .sfm-button.danger{color:#bd2727}
  .sfm-button.active{border-color:#d29b1b;background:#fff7dc;color:#5a3b00}
  .sfm-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:920px;margin:38px auto 0}
  .sfm-choice{border:1px solid var(--line);background:var(--paper);border-radius:20px;min-height:238px;padding:30px 22px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px}
  .sfm-choice:hover{border-color:#ebbe54}
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
  .sfm-search{width:min(100%,260px)}
  .sfm-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
  .sfm-card{border:1px solid var(--line);border-radius:14px;min-width:0;background:var(--paper);overflow:hidden}
  .sfm-thumb{aspect-ratio:1;background-color:#f1f1f1;background-image:linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%);background-size:24px 24px;background-position:0 0,0 12px,12px -12px,-12px 0;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .sfm-thumb img{height:100%;width:100%;object-fit:contain}
  .sfm-card-body{padding:12px}
  .sfm-card-name{font-weight:750;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 8px}
  .sfm-badge{font-size:10px;font-weight:800;border-radius:20px;padding:4px 8px;background:#f1f1f1;color:#424242;display:inline-flex;align-items:center;gap:4px}
  .sfm-badge.premium{background:#ffe9a2;color:#563b00}
  .sfm-badge.coins{background:#e1f0ff;color:#174a80}
  .sfm-badge.diamonds{background:#f1e8ff;color:#62338f}
  .sfm-folder-badge{display:inline-block;margin:8px 0 0;font-size:11px;color:var(--sub);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sfm-card-bottom{margin-top:11px}
  .sfm-status{font-size:11px;color:#15803d}
  .sfm-status.hidden{color:#9b6a21}
  .sfm-icon-button{width:32px;height:32px;display:grid;place-items:center;border:1px solid var(--line);background:var(--paper);border-radius:8px;color:var(--fg)}
  .sfm-card-menu{margin-top:9px;padding-top:8px;border-top:1px solid var(--line)}
  .sfm-card-menu summary{cursor:pointer;list-style:none;font-size:12px;font-weight:750;color:var(--fg)}
  .sfm-card-menu summary::-webkit-details-marker{display:none}
  .sfm-move{margin-top:8px;display:flex;align-items:center;gap:8px}
  .sfm-move .sfm-field{padding:8px}
  .sfm-upload{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:24px;max-width:1030px}
  .sfm-drop{border:2px dashed #d6d6d6;border-radius:15px;padding:28px 20px;text-align:center;min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;cursor:pointer;background:var(--soft);position:relative;overflow:hidden}
  .sfm-drop input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
  .sfm-selected{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:14px}
  .sfm-selected-item{border:1px solid var(--line);border-radius:11px;padding:9px;min-width:0;background:var(--paper)}
  .sfm-selected-item img{width:100%;aspect-ratio:1;object-fit:contain;background:var(--soft);border-radius:7px}
  .sfm-selected-item .sfm-field{margin-top:7px;padding:9px}
  .sfm-selected-item small{display:block;color:var(--sub);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sfm-selected-head{display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:10px}
  .sfm-label{font-size:12px;font-weight:800;display:block;margin:17px 0 7px}
  .sfm-form-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
  .sfm-alert{border-radius:11px;padding:13px 15px;font-size:13px;margin-bottom:18px;background:#fff8e5;border:1px solid #edd496;color:#765207}
  .sfm-alert.error{background:#fff0f0;border-color:#f3c9c9;color:#a51f1f}
  .sfm-empty{padding:60px 20px;text-align:center;color:var(--sub);font-size:13px;border:1px dashed var(--line);border-radius:12px}
  .sfm-pager{margin-top:20px;font-size:12px;color:var(--sub)}
  .sfm-caption{font-size:12px;color:var(--sub);margin-top:25px;text-align:center}
  .sfm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.47);display:grid;place-items:center;padding:16px;z-index:2500}
  .sfm-dialog{background:var(--paper);color:var(--fg);border-radius:17px;padding:23px;width:min(100%,490px);max-height:85vh;overflow:auto;box-shadow:0 15px 45px rgba(0,0,0,.15)}
  .sfm-folder-row{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid var(--line);padding:10px 0}
  .sfm-folder-row span{min-width:0;overflow-wrap:anywhere;font-size:13px}
  .sfm-folder-row .sfm-button{min-height:32px;padding:6px 10px}
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
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M12 13v6m-3-3h6"/></>,
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
  } catch { return false }
}

function cleanUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}

// Permit preview images only when this page created their Blob URLs itself.
const activeFramePreviewUrls = new Set()
function cleanOwnedPreviewUrl(value, registry) {
  if (typeof value !== 'string' || !registry?.has(value)) return ''
  try {
    const url = new URL(value)
    return url.protocol === 'blob:' &&
      url.origin === window.location.origin ? url.href : ''
  } catch {
    return ''
  }
}

function SafeFrameImage({ src, alt, loading, ownedBlobUrls }) {
  const safeSrc = ownedBlobUrls
    ? cleanOwnedPreviewUrl(src, ownedBlobUrls)
    : cleanUrl(src)

  if (!safeSrc) return null

  return <img src={safeSrc} alt={alt || 'Frame'}
    loading={loading} decoding="async"
    referrerPolicy="no-referrer" />
}
function cacheForUser() {
  const current = getToken()
  if (listCache.token !== current) listCache = { token: current, pages: new Map(), pending: new Map() }
  return listCache
}

function clearPages() { listCache = { token: getToken(), pages: new Map(), pending: new Map() } }

async function request(path = '', { method = 'GET', body, token = getToken() } = {}) {
  if (!token || token !== getToken()) throw new Error('Please sign in again')
  const response = await fetch(`${API_URL}${ENDPOINT}${path}`, {
    method,
    cache: 'no-store',
    signal: AbortSignal.timeout(25000),
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (token !== getToken()) throw new Error('Admin account changed. Please open the page again')
  if (!response.ok || data.ok === false) {
    if (response.status === 401) throw new Error('Session expired. Sign in again')
    if (response.status === 403) throw new Error('You do not have permission to manage frames')
    const error = new Error(data.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return data
}

function loadFrames(query) {
  const scope = cacheForUser()
  const item = scope.pages.get(query)
  if (item && Date.now() - item.at < CACHE_MS) return Promise.resolve(item.value)
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

function invalidateFolders() { folderCache = { token: getToken(), at: 0, folders: [], pending: null } }

function loadFolders() {
  const token = getToken()
  if (folderCache.token !== token) invalidateFolders()
  const scope = folderCache
  if (scope.at && Date.now() - scope.at < CACHE_MS) return Promise.resolve(scope.folders)
  if (scope.pending) return scope.pending
  const pending = request('/folders', { token }).then(data => {
    if (!Array.isArray(data.folders)) throw new Error('Folder list is unavailable')
    const folders = data.folders.some(item => item.id === null) ? data.folders : [{ id: null, name: 'General' }, ...data.folders]
    if (scope === folderCache) { scope.folders = folders; scope.at = Date.now() }
    return folders
  }).finally(() => { if (scope === folderCache) scope.pending = null })
  scope.pending = pending
  return pending
}

function validateFrame(file) {
  if (!file || !['image/png', 'image/webp'].includes(file.type)) return Promise.reject(new Error(`${file?.name || 'Image'}: use PNG or WebP`))
  if (file.size < 16 || file.size > MAX_BYTES) return Promise.reject(new Error(`${file.name}: max 5 MB`))
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const valid = image.naturalWidth === image.naturalHeight && image.naturalWidth >= 400
      URL.revokeObjectURL(url)
      valid ? resolve(file) : reject(new Error(`${file.name}: must be square 1:1 and at least 400 × 400`))
    }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`${file.name}: unable to read image`)) }
    image.src = url
  })
}

function imageName(file) { return file.name.replace(/\.(png|webp)$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 100) || 'New Frame' }
function newForm() { return { id: '', name: '', folder_id: '', access_tier: 'free', coin_price: '', diamond_price: '', is_active: true, sort_order: 0 } }
function accessLabel(item) {
  if (item.access_tier === 'premium') return '♛ PREMIUM'
  if (item.access_tier === 'coins') return `COINS · ${Number(item.coin_price || 0)}`
  if (item.access_tier === 'diamonds') return `DIAMONDS · ${Number(item.diamond_price || 0)}`
  return 'FREE'
}

export default function AdminFrameManagementPage() {
  const [mode, setMode] = useState('home')
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState('all')
  const [folderFilter, setFolderFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [querySearch, setQuerySearch] = useState('')
  const [refreshId, setRefreshId] = useState(0)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0, has_more: false })
  const [folders, setFolders] = useState([{ id: null, name: 'General' }])
  const [folderError, setFolderError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [folderDialog, setFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [form, setForm] = useState(newForm)
  const [picked, setPicked] = useState([])
  const [previews, setPreviews] = useState([])
  const [batchCount, setBatchCount] = useState(0)
  const batchRef = useRef({ uploads: [], saved: new Set() })
  const requestId = useRef(0)
  const allowed = canManage()

  useEffect(() => {
    const urls = picked.map(item => {
      const url = URL.createObjectURL(item.file)
      activeFramePreviewUrls.add(url)
      return url
    })
    setPreviews(urls)
    return () => urls.forEach(url => {
      activeFramePreviewUrls.delete(url)
      URL.revokeObjectURL(url)
    })
  }, [picked])

  useEffect(() => {
    if (mode === 'home' || !allowed) return undefined
    let active = true
    loadFolders().then(items => { if (active) { setFolders(items); setFolderError('') } })
      .catch(err => { if (active) setFolderError(err.message || 'Unable to load folders') })
    return () => { active = false }
  }, [mode, allowed])

  useEffect(() => {
    if (mode !== 'view') return undefined
    const timer = window.setTimeout(() => { setPage(1); setQuerySearch(search.trim()) }, 350)
    return () => window.clearTimeout(timer)
  }, [search, mode])

  const query = useMemo(() => new URLSearchParams({
    page: String(page), limit: String(PAGE_SIZE), access: filter,
    status, search: querySearch, folder_id: folderFilter,
  }).toString(), [page, filter, status, querySearch, folderFilter])

  useEffect(() => {
    if (mode !== 'view' || !allowed) return undefined
    const id = ++requestId.current
    setLoading(true)
    setError('')
    loadFrames(query).then(data => {
      if (id !== requestId.current) return
      const items = Array.isArray(data.items) ? data.items : Array.isArray(data.frames) ? data.frames : []
      setRows(items.slice(0, PAGE_SIZE))
      setPagination(data.pagination || { page, total_pages: page, total: items.length, has_more: items.length === PAGE_SIZE })
    }).catch(err => { if (id === requestId.current) setError(err.message || 'Unable to load frames') })
      .finally(() => { if (id === requestId.current) setLoading(false) })
    return () => { requestId.current += 1 }
  }, [mode, query, refreshId, allowed, page])

  const folderLabel = id => folders.find(item => item.id === (id || null))?.name || 'General'
  const folderOptions = <><option value="">General</option>{folders.filter(item => item.id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</>
  const refresh = () => { clearPages(); setRefreshId(value => value + 1) }
  const reloadFolders = async () => { invalidateFolders(); const items = await loadFolders(); setFolders(items); setFolderError(''); return items }
  const changeMode = next => { if (busy) return; setMode(next); setError(''); setNotice('') }
  const startAdd = () => {
    if (busy) return
    setForm({ ...newForm(), folder_id: folderFilter !== 'all' && folderFilter !== 'general' ? folderFilter : '' })
    setPicked([])
    setBatchCount(0)
    batchRef.current = { uploads: [], saved: new Set() }
    changeMode('upload')
  }
  const startEdit = item => {
    if (busy) return
    setForm({ id: item.id, name: item.name || '', folder_id: item.folder_id || '', access_tier: item.access_tier || 'free', coin_price: item.coin_price || '', diamond_price: item.diamond_price || '', is_active: item.is_active !== false, sort_order: Number(item.sort_order || 0), image_url: item.image_url || '' })
    setPicked([])
    setBatchCount(0)
    batchRef.current = { uploads: [], saved: new Set() }
    changeMode('upload')
  }

  const chooseFiles = async fileList => {
    if (busy || batchRef.current.saved.size) return
    const incoming = Array.from(fileList || [])
    if (!incoming.length) return
    if (form.id && incoming.length > 1) { setError('Editing a frame accepts one image'); return }
    const existing = form.id ? [] : picked
    if (existing.length + incoming.length > MAX_FILES) { setError(`Maximum ${MAX_FILES} frames per batch`); return }
    setError('')
    const checked = await Promise.allSettled(incoming.map(validateFrame))
    const invalid = checked.filter(item => item.status === 'rejected').map(item => item.reason.message)
    const valid = checked.filter(item => item.status === 'fulfilled').map(item => item.value)
    const seen = new Set(existing.map(item => `${item.file.name}:${item.file.size}:${item.file.lastModified}`))
    const added = valid.filter(file => {
      const key = `${file.name}:${file.size}:${file.lastModified}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).map(file => ({ key: `${file.name}:${file.size}:${file.lastModified}`, file, name: imageName(file) }))
    setPicked(form.id ? added.slice(0, 1) : [...existing, ...added])
    batchRef.current = { uploads: [], saved: new Set() }
    setBatchCount(0)
    if (invalid.length) setError(`${invalid.slice(0, 3).join('; ')}${invalid.length > 3 ? ` (+${invalid.length - 3} more)` : ''}`)
  }

  const updatePickedName = (index, name) => setPicked(current => current.map((item, i) => i === index ? { ...item, name } : item))
  const removePicked = index => {
    if (busy || batchRef.current.saved.size) return
    setPicked(current => current.filter((_, i) => i !== index))
    batchRef.current = { uploads: [], saved: new Set() }
  }

  const createFolder = async event => {
    event.preventDefault()
    const name = folderName.trim()
    if (!name || name.length > 80) { setError('Folder name must be 1–80 characters'); return }
    if (busy) return
    setBusy(true); setError('')
    try {
      const result = await request('/folders', { method: 'POST', body: { name, sort_order: 0 } })
      await reloadFolders()
      setFolderName('')
      setFolderDialog(false)
      if (mode === 'upload') setForm(current => ({ ...current, folder_id: result.folder.id }))
      else { setFolderFilter(result.folder.id); setPage(1) }
      setNotice(`Folder “${name}” created`)
    } catch (err) { setError(err.message || 'Unable to create folder') }
    finally { setBusy(false) }
  }

  const renameFolder = async folder => {
    if (busy) return
    const proposed = window.prompt('Rename folder', folder.name)
    if (proposed === null || proposed.trim() === folder.name) return
    const name = proposed.trim()
    if (!name || name.length > 80) { setError('Folder name must be 1–80 characters'); return }
    setBusy(true); setError('')
    try { await request(`/folders/${encodeURIComponent(folder.id)}`, { method: 'PATCH', body: { name } }); await reloadFolders(); setNotice('Folder renamed') }
    catch (err) { setError(err.message || 'Unable to rename folder') }
    finally { setBusy(false) }
  }

  const deleteFolder = async folder => {
    if (busy || !window.confirm(`Delete “${folder.name}”? Frames will move to General; images and purchases will remain.`)) return
    setBusy(true); setError('')
    try {
      await request(`/folders/${encodeURIComponent(folder.id)}`, { method: 'DELETE' })
      await reloadFolders()
      if (folderFilter === folder.id) setFolderFilter('all')
      if (form.folder_id === folder.id) setForm(current => ({ ...current, folder_id: '' }))
      refresh()
      setNotice('Folder deleted. Its frames moved to General.')
    } catch (err) { setError(err.message || 'Unable to delete folder') }
    finally { setBusy(false) }
  }

  const moveFrame = async (item, folderId) => {
    if (busy || (item.folder_id || '') === folderId) return
    setBusy(true); setError('')
    try {
      await request(`/${encodeURIComponent(item.id)}`, { method: 'PATCH', body: { folder_id: folderId || null } })
      setNotice(`Moved “${item.name}” to ${folderLabel(folderId)}`)
      refresh()
    } catch (err) { setError(err.message || 'Unable to move frame') }
    finally { setBusy(false) }
  }

  const save = async event => {
    event.preventDefault()
    if (!allowed || busy) return
    if (!form.id && (!picked.length || picked.length > MAX_FILES)) { setError('Choose 1–20 images'); return }
    if (form.id && !form.name.trim()) { setError('Frame name is required'); return }
    const coinPrice = form.access_tier === 'coins' ? Number(form.coin_price) : 0
    const diamondPrice = form.access_tier === 'diamonds' ? Number(form.diamond_price) : 0
    if (form.access_tier === 'coins' && (!Number.isSafeInteger(coinPrice) || coinPrice < 1 || coinPrice > 1000000000)) { setError('Enter a valid Coin price'); return }
    if (form.access_tier === 'diamonds' && (!Number.isSafeInteger(diamondPrice) || diamondPrice < 1 || diamondPrice > 1000000000)) { setError('Enter a valid Diamond price'); return }
    if (!form.id && picked.some(item => !item.name.trim() || item.name.trim().length > 100)) { setError('Each frame needs a name of 1–100 characters'); return }
    if (form.folder_id && !folders.some(item => item.id === form.folder_id)) { setError('Select an existing folder'); return }
    setBusy(true); setError(''); setNotice('')
    const token = getToken()
    try {
      const uploads = batchRef.current.uploads
      if (picked.length && uploads.length !== picked.length) {
        const result = await uploadMediaLibraryWithProgress({ apiUrl: API_URL, token, files: picked.map(item => item.file) })
        if (!Array.isArray(result.images) || result.images.length !== picked.length || result.images.some(image => !image?.storage_key || !cleanUrl(image.image_url))) throw new Error('Upload did not return all valid Cloudflare images')
        batchRef.current.uploads = result.images
      }
      const common = { folder_id: form.folder_id || null, access_tier: form.access_tier, coin_price: coinPrice, diamond_price: diamondPrice, is_active: form.is_active, sort_order: Number(form.sort_order) || 0 }
      if (form.id) {
        await request(`/${encodeURIComponent(form.id)}`, { method: 'PATCH', token, body: {
          ...common, name: form.name.trim(), ...(picked.length ? { image_url: batchRef.current.uploads[0].image_url, storage_key: batchRef.current.uploads[0].storage_key } : {}),
        } })
      } else {
        for (let i = 0; i < picked.length; i += 1) {
          if (batchRef.current.saved.has(i)) continue
          const image = batchRef.current.uploads[i]
          await request('', { method: 'POST', token, body: { ...common, name: picked[i].name.trim(), sort_order: Math.min(100000, Number(common.sort_order) + i), image_url: image.image_url, storage_key: image.storage_key } })
          batchRef.current.saved.add(i)
          setBatchCount(batchRef.current.saved.size)
        }
      }
      const completed = form.id ? 1 : picked.length
      clearPages()
      batchRef.current = { uploads: [], saved: new Set() }
      setPicked([])
      setBatchCount(0)
      setNotice(form.id ? 'Frame updated successfully' : `${completed} frames uploaded to ${folderLabel(common.folder_id)} successfully`)
      setMode('view'); setPage(1); setRefreshId(value => value + 1)
    } catch (err) {
      const count = batchRef.current.saved.size
      setError(count ? `${count}/${picked.length} frames saved. ${err.message} — click Retry to save the rest without re-uploading.` : err.message || 'Unable to save frames')
    } finally { setBusy(false) }
  }

  const remove = async item => {
    if (!allowed || busy || !window.confirm(`Delete “${item.name}”? This cannot be undone.`)) return
    setBusy(true); setError('')
    try { await request(`/${encodeURIComponent(item.id)}`, { method: 'DELETE' }); setNotice('Frame deleted'); refresh() }
    catch (err) { setError(err.message || 'Unable to delete frame') }
    finally { setBusy(false) }
  }

  return <AdminLayout title="Frame Management" subtitle="Free, Premium, Coin and Diamond profile frames for Shadow readers">
    <div className="sfm">
      <style>{css}</style>
      <header className="sfm-header">
        <div><h2>Frame Management</h2><p>Square 1:1 frames · Cloudflare media · Load only when requested</p></div>
        {mode !== 'home' && <div className="sfm-actions">
          <button className="sfm-button" disabled={busy} onClick={() => changeMode('home')}><Icon name="back" size={14}/> Back</button>
          <button className="sfm-button" disabled={busy} onClick={() => changeMode('view')}>View Frames</button>
          {allowed && <button className="sfm-button" disabled={busy} onClick={() => setFolderDialog(true)}><Icon name="folder" size={15}/> + New Folder</button>}
          {allowed && <button className="sfm-button gold" disabled={busy} onClick={startAdd}>Upload Frame</button>}
        </div>}
      </header>
      {notice && <div className="sfm-alert" role="status">{notice}</div>}
      {error && <div className="sfm-alert error" role="alert">{error}</div>}
      {folderError && mode !== 'home' && <div className="sfm-alert error">Folder service: {folderError} <button className="sfm-button" disabled={busy} onClick={() => reloadFolders().catch(err => setFolderError(err.message))}>Retry</button></div>}
      {!allowed && <div className="sfm-alert error">Your account does not have permission to manage frames.</div>}
      {mode === 'home' && <><div className="sfm-choices">
        {allowed && <button className="sfm-choice" onClick={startAdd}><span className="sfm-choice-icon"><Icon name="upload" size={30}/></span><strong>Upload Frame</strong><span>Add 1–20 Free, Premium, Coin or Diamond frames</span><span className="sfm-button gold">Open Upload</span></button>}
        <button className="sfm-choice" disabled={!allowed} onClick={() => changeMode('view')}><span className="sfm-choice-icon"><Icon name="grid" size={30}/></span><strong>View Frames</strong><span>Browse and manage saved frames</span><span className="sfm-button">Open Library</span></button>
      </div><p className="sfm-caption">Frames and folders are not requested until you open View Frames or Upload Frame.</p></>}
      {mode === 'upload' && allowed && <section className="sfm-panel">
        <div className="sfm-bar"><h3 className="sfm-title">{form.id ? 'Edit Frame' : 'Upload New Frames'}</h3><span className="sfm-note">PNG / WebP · 1:1 · minimum 400 × 400 · max 5 MB each · up to 20 frames</span></div>
        <form className="sfm-upload" onSubmit={save}>
          <div>
            <label className="sfm-drop" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); chooseFiles(event.dataTransfer.files) }}>
              <Icon name="upload" size={38}/><strong>Drop {form.id ? 'a new image' : '1–20 frames'} here</strong><span className="sfm-note">Or click to browse PNG / WebP images</span>
              <input type="file" accept="image/png,image/webp" multiple={!form.id} disabled={busy || batchCount > 0} onChange={event => { chooseFiles(event.target.files); event.target.value = '' }}/>
            </label>
            {picked.length > 0 && <>
              <div className="sfm-selected-head"><strong>{picked.length} selected {picked.length === 1 ? 'image' : 'images'}</strong><span className="sfm-note">Each will be saved as a separate frame</span></div>
              <div className="sfm-selected">{picked.map((item, i) => <div className="sfm-selected-item" key={item.key}>
                {cleanPreviewUrl(previews[i]) && <img src={cleanPreviewUrl(previews[i])} alt={item.name || `Frame ${i + 1}`} loading="lazy"/>}
                {!form.id && <input className="sfm-field" aria-label={`Name for frame ${i + 1}`} maxLength={100} disabled={busy || batchCount > 0} value={item.name} onChange={event => updatePickedName(i, event.target.value)}/>}
                <small>{item.file.name}</small>
                {!busy && !batchCount && <button type="button" className="sfm-button danger" style={{ padding: '5px 9px', minHeight: 28, marginTop: 8 }} onClick={() => removePicked(i)}>Remove</button>}
                {batchCount && batchRef.current.saved.has(i) ? <small>✓ Saved</small> : null}
              </div>)}</div>
            </>}
            {!picked.length && form.id && cleanUrl(form.image_url) && <div className="sfm-selected"><div className="sfm-selected-item"><img src={cleanUrl(form.image_url)} alt={form.name || 'Current frame'}/><small>Current frame image</small></div></div>}
          </div>
          <div>
            {form.id && <><label className="sfm-label" htmlFor="sfm-name">Frame Name</label><input id="sfm-name" className="sfm-field" maxLength={100} required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))}/></>}
            <label className="sfm-label" htmlFor="sfm-folder">Folder</label><select id="sfm-folder" className="sfm-field" disabled={busy || !!folderError} value={form.folder_id} onChange={event => setForm(current => ({ ...current, folder_id: event.target.value }))}>{folderOptions}</select>
            <label className="sfm-label" htmlFor="sfm-access">Access</label><select id="sfm-access" className="sfm-field" disabled={busy} value={form.access_tier} onChange={event => setForm(current => ({ ...current, access_tier: event.target.value }))}><option value="free">Free</option><option value="premium">Premium</option><option value="coins">Coins</option><option value="diamonds">Diamonds</option></select>
            {form.access_tier === 'coins' && <><label className="sfm-label" htmlFor="sfm-coin-price">Coin Price</label><input id="sfm-coin-price" className="sfm-field" type="number" min="1" max="1000000000" step="1" required disabled={busy} value={form.coin_price} onChange={event => setForm(current => ({ ...current, coin_price: event.target.value }))}/><p className="sfm-note">Reader access expires 30 days after purchase.</p></>}
            {form.access_tier === 'diamonds' && <><label className="sfm-label" htmlFor="sfm-diamond-price">Diamond Price</label><input id="sfm-diamond-price" className="sfm-field" type="number" min="1" max="1000000000" step="1" required disabled={busy} value={form.diamond_price} onChange={event => setForm(current => ({ ...current, diamond_price: event.target.value }))}/><p className="sfm-note">Reader access does not expire.</p></>}
            <label className="sfm-label" htmlFor="sfm-order">Display Order</label><input id="sfm-order" className="sfm-field" type="number" min={0} max={100000} disabled={busy} value={form.sort_order} onChange={event => setForm(current => ({ ...current, sort_order: event.target.value }))}/>
            <label className="sfm-label" htmlFor="sfm-active">Visibility</label><select id="sfm-active" className="sfm-field" disabled={busy} value={form.is_active ? 'active' : 'hidden'} onChange={event => setForm(current => ({ ...current, is_active: event.target.value === 'active' }))}><option value="active">Active</option><option value="hidden">Hidden</option></select>
            {!!batchCount && <p className="sfm-note">Saved {batchCount}/{picked.length}. Retry keeps completed frames.</p>}
            <div className="sfm-form-actions"><button type="submit" className="sfm-button gold" disabled={busy || (!form.id && !picked.length) || !!folderError}>{busy ? 'Processing…' : batchCount ? `Retry remaining ${picked.length - batchCount}` : form.id ? 'Save Frame' : `Upload ${picked.length || ''} ${picked.length === 1 ? 'Frame' : 'Frames'}`}</button><button type="button" className="sfm-button" disabled={busy} onClick={() => changeMode('home')}>Cancel</button></div>
            <p className="sfm-note">Images upload directly to Cloudflare R2 when available. The existing upload fallback remains unchanged.</p>
          </div>
        </form>
      </section>}
      {mode === 'view' && allowed && <section className="sfm-panel">
        <div className="sfm-bar"><div><h3 className="sfm-title">Saved Frames</h3><p className="sfm-note">9 frames per page. Images are loaded only in this view.</p></div><button className="sfm-button" disabled={loading || busy} onClick={refresh}><Icon name="refresh" size={14}/> Refresh</button></div>
        <div className="sfm-toolbar">
          <input className="sfm-field sfm-search" value={search} onChange={event => setSearch(event.target.value.slice(0, 80))} placeholder="Search frame name…" aria-label="Search frames"/>
          <div className="sfm-actions">{[['all', 'All'], ['free', 'Free'], ['premium', 'Premium'], ['coins', 'Coins'], ['diamonds', 'Diamonds']].map(([value, label]) => <button key={value} type="button" className={`sfm-button ${filter === value ? 'active' : ''}`} onClick={() => { setFilter(value); setPage(1) }}>{label}</button>)}</div>
          <select className="sfm-field" style={{ width: 165 }} aria-label="Folder filter" value={folderFilter} onChange={event => { setFolderFilter(event.target.value); setPage(1) }}><option value="all">All Folders</option><option value="general">General</option>{folders.filter(item => item.id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select className="sfm-field" style={{ width: 135 }} aria-label="Frame status" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="all">All statuses</option><option value="active">Active</option><option value="hidden">Hidden</option></select>
        </div>
        {loading ? <div className="sfm-empty">Loading 9 frames…</div> : error ? <div className="sfm-empty">Could not load frames. Try Refresh.</div> : rows.length ? <div className="sfm-grid">{rows.map(item => <article className="sfm-card" key={item.id}>
          <div className="sfm-thumb">{cleanUrl(item.image_url) ? <img src={cleanUrl(item.image_url)} loading="lazy" alt={item.name || 'Frame'}/> : <Icon name="image" size={35}/>}</div>
          <div className="sfm-card-body">
            <p className="sfm-card-name" title={item.name}>{item.name}</p>
            <span className={`sfm-badge ${item.access_tier || 'free'}`}>{accessLabel(item)}</span>
            <div className="sfm-folder-badge" title={folderLabel(item.folder_id)}>Folder: {folderLabel(item.folder_id)}</div>
            <div className="sfm-card-bottom"><span className={`sfm-status ${item.is_active === false ? 'hidden' : ''}`}>{item.is_active === false ? '● Hidden' : '● Active'}</span>
              <div className="sfm-actions" style={{ gap: 5 }}><button className="sfm-icon-button" disabled={busy} title="Edit" aria-label={`Edit ${item.name}`} onClick={() => startEdit(item)}><Icon name="edit" size={16}/></button><button className="sfm-icon-button" disabled={busy} title="Delete" aria-label={`Delete ${item.name}`} onClick={() => remove(item)}><Icon name="trash" size={16}/></button></div>
            </div>
            <details className="sfm-card-menu"><summary>⋯ Move to Folder</summary><div className="sfm-move"><select className="sfm-field" aria-label={`Move ${item.name} to folder`} disabled={busy} value={item.folder_id || ''} onChange={event => moveFrame(item, event.target.value)}>{folderOptions}</select></div></details>
          </div>
        </article>)}</div> : <div className="sfm-empty">No frames found for these filters.</div>}
        <div className="sfm-pager"><span>Page {page}{Number(pagination.total_pages) > 0 ? ` of ${pagination.total_pages}` : ''} · 9 per page</span><div className="sfm-actions"><button className="sfm-button" disabled={page <= 1 || loading} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button><button className="sfm-button" disabled={loading || !(pagination.has_more || page < Number(pagination.total_pages || page))} onClick={() => setPage(value => value + 1)}>Next</button></div></div>
      </section>}
      {folderDialog && mode !== 'home' && <div className="sfm-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setFolderDialog(false) }}><section className="sfm-dialog" role="dialog" aria-modal="true" aria-label="Manage frame folders">
        <div className="sfm-bar"><h3 className="sfm-title">Frame Folders</h3><button className="sfm-button" disabled={busy} onClick={() => setFolderDialog(false)}>Close</button></div>
        {error && <div className="sfm-alert error" role="alert">{error}</div>}
        <form onSubmit={createFolder}><label className="sfm-label" htmlFor="sfm-create-folder">Create New Folder</label><input id="sfm-create-folder" className="sfm-field" maxLength={80} required placeholder="e.g. Halloween Collection" value={folderName} disabled={busy} onChange={event => setFolderName(event.target.value)}/><button className="sfm-button gold" style={{ marginTop: 10 }} type="submit" disabled={busy}>+ Create Folder</button></form>
        <div style={{ marginTop: 24 }}><h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Existing Folders</h4><div className="sfm-folder-row"><span>General <small className="sfm-note">(Default)</small></span></div>{folders.filter(item => item.id).map(item => <div key={item.id} className="sfm-folder-row"><span>{item.name}</span><div className="sfm-actions" style={{ gap: 5 }}><button className="sfm-button" disabled={busy} onClick={() => renameFolder(item)}>Rename</button><button className="sfm-button danger" disabled={busy} onClick={() => deleteFolder(item)}>Delete</button></div></div>)}</div>
        <p className="sfm-note">Deleting a folder only moves its frames to General. Frame images and purchases are kept.</p>
      </section></div>}
    </div>
  </AdminLayout>
}
