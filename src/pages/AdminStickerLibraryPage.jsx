import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ImageDropZone from '../components/common/ImageDropZone'
import { useAdminStickerLibrary } from '../hooks/useAdminStickerLibrary'
import { STICKER_COVER_LIMIT, STICKER_FILE_LIMIT } from '../utils/stickerImageOptimizer'

const TYPES = ['none', 'bounce', 'shake', 'pulse', 'float']
const SPEEDS = ['slow', 'normal', 'fast']
const REPEATS = ['once', 'loop']
const MAX_FILES = 20
const accepted = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const titleCase = (text) => text.charAt(0).toUpperCase() + text.slice(1)
const blankAnimation = { animationType: 'none', animationSpeed: 'normal', animationRepeat: 'loop' }
const newFolder = () => ({ name: '', icon: '📁', description: '', sortOrder: 0, active: true, coverFile: null, removeCover: false })

// Accept only browser-safe image URLs. Never pass data:, javascript: or other
// executable/unexpected schemes from stored records to an image element.
function safeStickerSrc(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined
  try {
    const url = new URL(value.trim(), window.location.origin)
    if (url.username || url.password) return undefined
    if (url.protocol === 'blob:') {
      return url.origin === window.location.origin ? url.href : undefined
    }
    if (url.protocol === 'https:') return url.href
    // Allow HTTP image URLs only while developing on localhost.
    const local = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    if (local && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) return url.href
  } catch {
    // Ignore malformed URL values rather than rendering them.
  }
  return undefined
}

function AnimatedSticker({ item, className = '' }) {
  const kind = TYPES.includes(item.animationType) ? item.animationType : 'none'
  const speed = SPEEDS.includes(item.animationSpeed) ? item.animationSpeed : 'normal'
  const repeat = REPEATS.includes(item.animationRepeat) ? item.animationRepeat : 'loop'
  return (
    <img
      className={`sticker-preview-img sticker-${kind} sticker-${speed} sticker-${repeat} ${className}`}
      src={safeStickerSrc(item.previewUrl) || safeStickerSrc(item.imageUrl)}
      alt={item.altText || item.title || 'Sticker'}
      loading="lazy"
      decoding="async"
    />
  )
}

function Dialog({ title, children, onClose, busy }) {
  return (
    <div className="sticker-shade" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <section className="sticker-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <header className="sticker-dialog-head">
          <h2>{title}</h2>
          <button className="sticker-icon-button" type="button" disabled={busy} onClick={onClose} aria-label="Close">×</button>
        </header>
        {children}
      </section>
    </div>
  )
}

function AnimationFields({ draft, onChange }) {
  return (
    <div className="sticker-animation-fields">
      <label>Animation
        <select value={draft.animationType} onChange={(e) => onChange({ animationType: e.target.value })}>
          {TYPES.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
        </select>
      </label>
      <label>Speed
        <select value={draft.animationSpeed} onChange={(e) => onChange({ animationSpeed: e.target.value })}>
          {SPEEDS.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
        </select>
      </label>
      <label>Repeat
        <select value={draft.animationRepeat} onChange={(e) => onChange({ animationRepeat: e.target.value })}>
          {REPEATS.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
        </select>
      </label>
    </div>
  )
}

const STYLES = `
.sticker-page{max-width:1500px;margin:0 auto;color:#0f172a;font-size:14px}
.sticker-page *{box-sizing:border-box}.sticker-page button,.sticker-page input,.sticker-page textarea,.sticker-page select{font:inherit}
.sticker-page button{cursor:pointer}.sticker-page button:disabled{opacity:.5;cursor:not-allowed}
.sticker-page button:focus-visible,.sticker-page input:focus-visible,.sticker-page select:focus-visible,.sticker-page textarea:focus-visible{outline:2px solid #6366f1;outline-offset:2px}
.sticker-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:17px}
.sticker-bar h2{margin:0;font-size:22px;font-weight:850}.sticker-bar p{margin:5px 0 0;color:#64748b;font-size:12px}
.sticker-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#0f172a;padding:9px 13px;font-weight:700;font-size:12px;white-space:nowrap}
.sticker-button.primary{color:#fff;background:#4f46e5;border-color:#4f46e5}.sticker-button.danger{color:#be123c;border-color:#fecdd3;background:#fff1f2}
.sticker-button.small{padding:7px 9px;font-size:11px}.sticker-button.selected{color:#4f46e5;border-color:#a5b4fc;background:#eef2ff}
.sticker-shell{display:grid;grid-template-columns:minmax(240px,290px) minmax(0,1fr);align-items:start;gap:18px}
.sticker-panel{border:1px solid #e2e8f0;border-radius:18px;background:#fff;padding:18px;min-width:0}
.sticker-panel-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}.sticker-panel-title h3{margin:0;font-size:16px}
.sticker-folders{display:grid;gap:9px;margin:0;padding:0;list-style:none}
.sticker-folder{display:flex;align-items:center;gap:9px;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px;min-width:0}
.sticker-folder.selected{border-color:#818cf8;background:#eef2ff}.sticker-folder[draggable=true]{cursor:grab}
.sticker-folder-cover{width:46px;height:46px;flex-shrink:0;border-radius:9px;display:grid;place-items:center;background:#f1f5f9;overflow:hidden;font-size:23px}
.sticker-folder-cover img{width:100%;height:100%;object-fit:cover}
.sticker-folder-open{border:0;background:transparent;flex:1;min-width:0;text-align:left;padding:1px;color:inherit}
.sticker-folder-open strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.sticker-folder-open small{display:block;color:#64748b;margin-top:2px;font-size:10px}
.sticker-folder-actions{display:flex;flex-direction:column;gap:4px}.sticker-folder-actions button{padding:3px 5px;border:0;background:transparent;color:#475569;font-size:10px}
.sticker-contents-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.sticker-contents-head h3{margin:0;font-size:18px}.sticker-contents-head p{color:#64748b;margin:5px 0;font-size:12px}
.sticker-search{width:100%;border:1px solid #cbd5e1;border-radius:10px;background:#fff;padding:11px;margin:17px 0 18px;color:#0f172a}
.sticker-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.sticker-card{overflow:hidden;border:1px solid #e2e8f0;border-radius:13px;background:#fff;min-width:0}
.sticker-picture{position:relative;aspect-ratio:1;background:#f1f5f9;display:grid;place-items:center;overflow:hidden}
.sticker-preview-img{width:100%;height:100%;object-fit:contain;transform-origin:center}
.sticker-card-body{padding:11px}.sticker-card-body strong{font-size:12px;display:block;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.sticker-card-body small{display:block;color:#64748b;margin-top:4px;font-size:10px}
.sticker-card-tools{display:flex;gap:5px;flex-wrap:wrap;margin-top:11px}
.sticker-pill{position:absolute;top:8px;left:8px;background:#fff;border-radius:99px;padding:4px 7px;font-size:10px;font-weight:750}
.sticker-empty{border:1px dashed #cbd5e1;border-radius:15px;padding:35px 15px;text-align:center;color:#64748b}
.sticker-notice{margin:10px 0;padding:12px;border-radius:10px;background:#f0fdf4;color:#166534}
.sticker-error{margin:10px 0;padding:12px;border-radius:10px;background:#fff1f2;color:#be123c;white-space:pre-wrap}
.sticker-more{display:flex;justify-content:flex-end;margin-top:18px}
.sticker-shade{position:fixed;inset:0;z-index:1300;background:#0f172a88;padding:20px;display:flex;justify-content:center;align-items:center}
.sticker-dialog{width:min(710px,100%);max-height:calc(100dvh - 40px);overflow-y:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 20px 60px #0f172a44}
.sticker-dialog-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}
.sticker-dialog-head h2{font-size:19px;margin:0}.sticker-icon-button{border:0;background:#f1f5f9;border-radius:50%;width:34px;height:34px;font-size:24px;line-height:1}
.sticker-field{display:grid;gap:6px;margin-bottom:13px;font-size:12px;font-weight:700}.sticker-field input,.sticker-field select,.sticker-field textarea{border:1px solid #cbd5e1;border-radius:9px;padding:10px;background:#fff;color:#0f172a;width:100%}
.sticker-field textarea{min-height:70px;resize:vertical}
.sticker-check{display:flex;align-items:center;gap:8px;margin:10px 0 15px;font-weight:650;font-size:12px}
.sticker-animation-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}
.sticker-animation-fields label{display:grid;gap:6px;font-size:12px;font-weight:700}
.sticker-animation-fields select{width:100%;border:1px solid #cbd5e1;border-radius:9px;padding:9px;background:#fff;color:#0f172a}
.sticker-dialog-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px;flex-wrap:wrap}
.sticker-mini-preview{height:170px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:13px;display:grid;place-items:center;overflow:hidden;margin:8px 0 14px}
.sticker-mini-preview img{width:150px;height:150px}
.sticker-drop{border:2px dashed #cbd5e1;border-radius:13px;padding:18px;text-align:center;margin:9px 0 15px;background:#f8fafc}
.sticker-upload-items{display:grid;gap:14px;max-height:47vh;overflow:auto}
.sticker-upload-item{display:grid;grid-template-columns:95px minmax(0,1fr);gap:12px;border:1px solid #e2e8f0;border-radius:13px;padding:11px}
.sticker-upload-item .sticker-mini-preview{height:100px;margin:0}.sticker-upload-item .sticker-mini-preview img{width:88px;height:88px}
.sticker-upload-item .sticker-animation-fields{margin:8px 0}
.sticker-tiny{color:#64748b;font-size:11px;margin:7px 0}
.image-drop-zone{position:relative}.image-drop-zone.dragging{outline:2px dashed #4f46e5;outline-offset:3px}
.image-drop-zone-overlay{position:absolute;inset:0;z-index:20;background:#eef2ffee;display:grid;place-items:center;font-weight:800;border-radius:12px;pointer-events:none}
.sticker-bounce,.sticker-shake,.sticker-pulse,.sticker-float{will-change:transform}
.sticker-bounce{animation:sticker-bounce 1.5s ease-in-out infinite}.sticker-shake{animation:sticker-shake 1.5s ease-in-out infinite}
.sticker-pulse{animation:sticker-pulse 1.5s ease-in-out infinite}.sticker-float{animation:sticker-float 1.5s ease-in-out infinite}
.sticker-slow{animation-duration:2.5s}.sticker-normal{animation-duration:1.5s}.sticker-fast{animation-duration:.8s}.sticker-once{animation-iteration-count:1}.sticker-loop{animation-iteration-count:infinite}
@keyframes sticker-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12%)}}
@keyframes sticker-shake{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-6deg)}40%,80%{transform:rotate(6deg)}}
@keyframes sticker-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}
@keyframes sticker-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7%)}}
@media(max-width:1100px){.sticker-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:850px){.sticker-shell{grid-template-columns:1fr}.sticker-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:520px){.sticker-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sticker-bar{align-items:flex-start}.sticker-dialog{padding:16px}.sticker-animation-fields{grid-template-columns:1fr 1fr}.sticker-upload-item{grid-template-columns:1fr}.sticker-upload-item .sticker-mini-preview{height:125px}}
@media(prefers-reduced-motion:reduce){.sticker-preview-img{animation:none!important}}
`

export default function AdminStickerLibraryPage() {
  const navigate = useNavigate()
  const lib = useAdminStickerLibrary()
  const [search, setSearch] = useState('')
  const [folderDraft, setFolderDraft] = useState(null)
  const [imageDraft, setImageDraft] = useState(null)
  const [uploadsOpen, setUploadsOpen] = useState(false)
  const [pending, setPending] = useState([])
  const [dragging, setDragging] = useState('')
  const [notice, setNotice] = useState('')
  const folder = lib.folders.find((x) => x.id === lib.folderId)
  const ordered = [...lib.folders].sort((a, b) => a.sortOrder - b.sortOrder)
  const visible = useMemo(() => lib.images.filter((x) => x.folderId === lib.folderId && x.title.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder), [lib.images, lib.folderId, search])

  const doAction = async (callback, done) => {
    try {
      await callback()
      if (done) { setNotice(done); setTimeout(() => setNotice(''), 3200) }
      return true
    } catch { return false } // Hook displays the precise API error.
  }

  const addFiles = (files) => {
    const incoming = Array.from(files || [])
    const invalid = incoming.find((f) => !accepted.has(f.type) || f.size <= 0 || f.size > STICKER_FILE_LIMIT)
    if (invalid) {
      lib.setError('Only JPEG, PNG, WebP, GIF or AVIF images up to 20 MB are allowed.')
      return
    }
    const allowed = Math.max(0, MAX_FILES - pending.length)
    if (incoming.length > allowed) lib.setError(`Up to ${MAX_FILES} images per upload. Extra images were skipped.`)
    setPending((prev) => [...prev, ...incoming.slice(0, allowed).map((file) => ({
      id: `${Date.now()}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, ''), folderId: lib.folderId, sortOrder: 0, ...blankAnimation,
    }))])
  }
  const clearPending = () => {
    lib.resetUploadCache()
    pending.forEach((x) => URL.revokeObjectURL(x.previewUrl))
    setPending([])
    setUploadsOpen(false)
  }
  const patchPending = (id, patch) => setPending((rows) => rows.map((x) => x.id === id ? { ...x, ...patch } : x))
  const removePending = (id) => setPending((rows) => {
    const row = rows.find((x) => x.id === id)
    if (row) URL.revokeObjectURL(row.previewUrl)
    return rows.filter((x) => x.id !== id)
  })
  const submitUploads = async () => {
    if (await doAction(() => lib.uploadImages(pending), 'Sticker images saved.')) clearPending()
  }
  const saveFolder = async () => {
    if (!folderDraft.name.trim()) { lib.setError('Folder name is required.'); return }
    if (await doAction(() => lib.saveFolder(folderDraft), 'Folder saved.')) setFolderDraft(null)
  }
  const reorder = async (toId) => {
    if (!dragging || dragging === toId || lib.busy) return
    const rows = [...ordered]
    const from = rows.findIndex((x) => x.id === dragging)
    const to = rows.findIndex((x) => x.id === toId)
    setDragging('')
    if (from < 0 || to < 0) return
    const [moved] = rows.splice(from, 1)
    rows.splice(to, 0, moved)
    await doAction(() => lib.reorderFolders(rows.map((x, i) => ({ ...x, sortOrder: i + 1 }))), 'Folder order saved.')
  }
  const stepFolder = async (id, offset) => {
    const rows = [...ordered]
    const pos = rows.findIndex((x) => x.id === id)
    const next = pos + offset
    if (pos < 0 || next < 0 || next >= rows.length) return
    ;[rows[pos], rows[next]] = [rows[next], rows[pos]]
    await doAction(() => lib.reorderFolders(rows.map((x, i) => ({ ...x, sortOrder: i + 1 }))), 'Folder order saved.')
  }

  return (
    <AdminLayout title="Shadow Media Library · Sticker" subtitle="Manage sticker images and editable visual animations.">
      <style>{STYLES}</style>
      <div className="sticker-page">
        <div className="sticker-bar">
          <div><h2>Sticker Library</h2><p>Original image compression + independent CSS animation settings</p></div>
          <button type="button" className="sticker-button" onClick={() => navigate('/media-library')}>← All Libraries</button>
        </div>
        {lib.error && <div className="sticker-error" role="alert">{lib.error}</div>}
        {notice && <div className="sticker-notice" role="status">{notice}</div>}
        <div className="sticker-shell">
          <aside className="sticker-panel">
            <div className="sticker-panel-title">
              <h3>Folders {lib.loadingFolders ? '…' : ''}</h3>
              <button type="button" className="sticker-button small primary" disabled={lib.busy} onClick={() => setFolderDraft({ ...newFolder(), sortOrder: ordered.length + 1 })}>+ Folder</button>
            </div>
            {ordered.length ? (
              <ul className="sticker-folders">
                {ordered.map((f) => <li
                  key={f.id}
                  draggable={!lib.busy}
                  onDragStart={() => setDragging(f.id)}
                  onDragEnd={() => setDragging('')}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); reorder(f.id) }}
                  className={`sticker-folder ${f.id === lib.folderId ? 'selected' : ''}`}
                >
                  <div className="sticker-folder-cover">{safeStickerSrc(f.coverUrl) ? <img src={safeStickerSrc(f.coverUrl)} alt="" /> : f.icon}</div>
                  <button type="button" className="sticker-folder-open" onClick={() => { lib.setFolderId(f.id); setSearch('') }}>
                    <strong>{f.name}</strong><small>{f.active ? `#${f.sortOrder} · Visible` : `#${f.sortOrder} · Hidden`}</small>
                  </button>
                  <div className="sticker-folder-actions">
                    <button type="button" disabled={lib.busy} aria-label={`Edit ${f.name}`} onClick={() => setFolderDraft({ ...f, coverFile: null, removeCover: false })}>Edit</button>
                    <button type="button" disabled={lib.busy} onClick={() => doAction(() => lib.toggleFolder(f))}>{f.active ? 'Hide' : 'Show'}</button>
                    <button type="button" disabled={lib.busy} aria-label={`Move ${f.name} up`} onClick={() => stepFolder(f.id, -1)}>↑</button>
                    <button type="button" disabled={lib.busy} aria-label={`Move ${f.name} down`} onClick={() => stepFolder(f.id, 1)}>↓</button>
                    <button type="button" disabled={lib.busy} onClick={() => { if (window.confirm(`Delete folder "${f.name}" and all its stickers?`)) doAction(() => lib.deleteFolder(f.id), 'Folder deleted.') }}>Delete</button>
                  </div>
                </li>)}
              </ul>
            ) : <div className="sticker-empty">Create your first sticker folder.</div>}
            <p className="sticker-tiny">Drag folders or use ↑ / ↓ to change their order.</p>
          </aside>
          <section className="sticker-panel">
            <div className="sticker-contents-head">
              <div><h3>{folder ? `${folder.icon} ${folder.name}` : 'Select a Folder'}</h3><p>{folder?.description || 'Organize your stickers by folder.'}</p></div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <button type="button" className="sticker-button small" disabled={lib.loadingImages} onClick={() => lib.refresh()}>Refresh</button>
                <button type="button" className="sticker-button primary" disabled={!folder || lib.busy} onClick={() => setUploadsOpen(true)}>+ Add Images</button>
              </div>
            </div>
            <input className="sticker-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search loaded images in this folder..." aria-label="Search stickers" />
            {lib.loadingImages && !lib.images.length ? <div className="sticker-empty">Loading sticker images...</div> : visible.length ? (
              <div className="sticker-grid">
                {visible.map((image) => <article className="sticker-card" key={image.id}>
                  <div className="sticker-picture"><AnimatedSticker item={image} /><span className="sticker-pill">{image.active ? 'Active' : 'Hidden'}</span></div>
                  <div className="sticker-card-body">
                    <strong title={image.title}>{image.title}</strong>
                    <small>Sort {image.sortOrder} · {titleCase(image.animationType)}</small>
                    <div className="sticker-card-tools">
                      <button type="button" className="sticker-button small" disabled={lib.busy} onClick={() => setImageDraft({ ...image })}>Edit</button>
                      <button type="button" className="sticker-button small" disabled={lib.busy} onClick={() => doAction(() => lib.saveImage({ ...image, active: !image.active }))}>{image.active ? 'Hide' : 'Show'}</button>
                      <button type="button" className="sticker-button small danger" disabled={lib.busy} onClick={() => { if (window.confirm(`Delete "${image.title}"?`)) doAction(() => lib.deleteImage(image), 'Sticker deleted.') }}>Delete</button>
                    </div>
                  </div>
                </article>)}
              </div>
            ) : <div className="sticker-empty">{search.trim() ? 'No matches in loaded images. Load more to search further.' : 'No stickers in this folder yet.'}</div>}
            {lib.hasMore && <div className="sticker-more"><button type="button" className="sticker-button" disabled={lib.loadingImages} onClick={() => lib.loadMore()}>{lib.loadingImages ? 'Loading…' : 'Load 30 More'}</button></div>}
          </section>
        </div>

        {folderDraft && <Dialog title={folderDraft.id ? 'Edit Folder' : 'Create Folder'} busy={lib.busy} onClose={() => setFolderDraft(null)}>
          <label className="sticker-field">Folder Name<input value={folderDraft.name} maxLength={120} onChange={(e) => setFolderDraft((d) => ({ ...d, name: e.target.value }))} /></label>
          <label className="sticker-field">Icon<input value={folderDraft.icon} onChange={(e) => setFolderDraft((d) => ({ ...d, icon: e.target.value }))} /></label>
          <label className="sticker-field">Description<textarea value={folderDraft.description} onChange={(e) => setFolderDraft((d) => ({ ...d, description: e.target.value }))} /></label>
          <label className="sticker-field">Sort Order<input type="number" min="0" value={folderDraft.sortOrder} onChange={(e) => setFolderDraft((d) => ({ ...d, sortOrder: Math.max(0, Number(e.target.value) || 0) }))} /></label>
          <label className="sticker-field">Folder Cover (optional, max 5 MB)
            <ImageDropZone onFiles={(files) => { const file = files[0]; if (file?.size > STICKER_COVER_LIMIT) { lib.setError('Folder cover must be 5 MB or smaller.'); return } setFolderDraft((d) => ({ ...d, coverFile: file, removeCover: false })) }}>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > STICKER_COVER_LIMIT) { lib.setError('Folder cover must be 5 MB or smaller.'); return } setFolderDraft((d) => ({ ...d, coverFile: file, removeCover: false })) }} />
            </ImageDropZone>
          </label>
          {(folderDraft.coverFile || folderDraft.coverUrl) && <label className="sticker-check"><input type="checkbox" checked={folderDraft.removeCover} onChange={(e) => setFolderDraft((d) => ({ ...d, removeCover: e.target.checked, coverFile: e.target.checked ? null : d.coverFile }))} />Remove existing cover</label>}
          <label className="sticker-check"><input type="checkbox" checked={folderDraft.active} onChange={(e) => setFolderDraft((d) => ({ ...d, active: e.target.checked }))} />Show this folder to users</label>
          <div className="sticker-dialog-actions"><button className="sticker-button" type="button" disabled={lib.busy} onClick={() => setFolderDraft(null)}>Cancel</button><button className="sticker-button primary" disabled={lib.busy} type="button" onClick={saveFolder}>{lib.busy ? 'Saving…' : 'Save Folder'}</button></div>
        </Dialog>}

        {imageDraft && <Dialog title="Edit Sticker" busy={lib.busy} onClose={() => setImageDraft(null)}>
          <div className="sticker-mini-preview"><AnimatedSticker item={imageDraft} /></div>
          <label className="sticker-field">Title<input maxLength={120} value={imageDraft.title} onChange={(e) => setImageDraft((d) => ({ ...d, title: e.target.value }))} /></label>
          <label className="sticker-field">Alt Text<input maxLength={180} value={imageDraft.altText} onChange={(e) => setImageDraft((d) => ({ ...d, altText: e.target.value }))} /></label>
          <label className="sticker-field">Move to Folder<select value={imageDraft.folderId} onChange={(e) => setImageDraft((d) => ({ ...d, folderId: e.target.value }))}>{ordered.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
          <label className="sticker-field">Sort Order<input type="number" min="0" value={imageDraft.sortOrder} onChange={(e) => setImageDraft((d) => ({ ...d, sortOrder: Math.max(0, Number(e.target.value) || 0) }))} /></label>
          <AnimationFields draft={imageDraft} onChange={(patch) => setImageDraft((d) => ({ ...d, ...patch }))} />
          <label className="sticker-check"><input type="checkbox" checked={imageDraft.active} onChange={(e) => setImageDraft((d) => ({ ...d, active: e.target.checked }))} />Show Sticker</label>
          <p className="sticker-tiny">Change animation whenever you like. The compressed image never needs re-uploading.</p>
          <div className="sticker-dialog-actions"><button className="sticker-button" disabled={lib.busy} type="button" onClick={() => setImageDraft(null)}>Cancel</button><button className="sticker-button primary" disabled={lib.busy || !imageDraft.title.trim()} type="button" onClick={async () => { if (await doAction(() => lib.saveImage(imageDraft), 'Sticker updated.')) setImageDraft(null) }}>{lib.busy ? 'Saving…' : 'Save Changes'}</button></div>
        </Dialog>}

        {uploadsOpen && <Dialog title="Add Sticker Images" busy={lib.busy} onClose={clearPending}>
          <ImageDropZone multiple disabled={lib.busy} label="Drop stickers here" onFiles={addFiles}>
            <div className="sticker-drop">
              <p><strong>Drop or choose up to 20 images</strong></p>
              <p className="sticker-tiny">JPEG, PNG, WebP, GIF, AVIF · 20 MB max each</p>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple disabled={lib.busy} onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
            </div>
          </ImageDropZone>
          <p className="sticker-tiny">{pending.length} / {MAX_FILES} images · Set animation individually, even after upload.</p>
          <div className="sticker-upload-items">
            {pending.map((item) => <div className="sticker-upload-item" key={item.id}>
              <div className="sticker-mini-preview"><AnimatedSticker item={item} /></div>
              <div>
                <label className="sticker-field">Title<input value={item.title} onChange={(e) => patchPending(item.id, { title: e.target.value })} /></label>
                <label className="sticker-field">Folder<select value={item.folderId} onChange={(e) => patchPending(item.id, { folderId: e.target.value })}>{ordered.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
                <label className="sticker-field">Sort Order<input type="number" min="0" value={item.sortOrder} onChange={(e) => patchPending(item.id, { sortOrder: Math.max(0, Number(e.target.value) || 0) })} /></label>
                <AnimationFields draft={item} onChange={(patch) => patchPending(item.id, patch)} />
                <button type="button" disabled={lib.busy} className="sticker-button small danger" onClick={() => removePending(item.id)}>Remove</button>
              </div>
            </div>)}
          </div>
          <div className="sticker-dialog-actions"><button className="sticker-button" type="button" disabled={lib.busy} onClick={clearPending}>Cancel</button><button className="sticker-button primary" type="button" disabled={lib.busy || !pending.length || pending.some((x) => !x.folderId)} onClick={submitUploads}>{lib.busy ? 'Uploading…' : `Upload ${pending.length} Images`}</button></div>
        </Dialog>}
      </div>
    </AdminLayout>
  )
}
