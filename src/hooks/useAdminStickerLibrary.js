import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadMediaLibraryWithProgress } from '../utils/uploadMediaLibraryWithProgress'
import { prepareStickerBatch, prepareStickerImage } from '../utils/stickerImageOptimizer'

const API_URL = (import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/+$/, '')
// Separate REST namespace and DB records from the Character library.
const BASE = '/api/admin/sticker-library'
const MAX_AGE = 10 * 60 * 1000
let store = { account: '', folders: null, foldersAt: 0, pages: new Map() }

const token = () => sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
function cache() {
  const account = token()
  if (store.account !== account) store = { account, folders: null, foldersAt: 0, pages: new Map() }
  return store
}
function safeURL(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  // URL('', API_URL) resolves to the backend homepage. A missing folder
  // cover must instead remain blank, so the folder icon can be displayed.
  if (!raw) return ''
  try {
    const u = new URL(raw, API_URL)
    const allowed = u.protocol === 'https:' ||
      (u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname))
    return allowed && !u.username && !u.password ? u.href : ''
  } catch { return '' }
}
const folderModel = (x) => ({
  id: String(x.id), name: x.name || '', icon: x.icon || '📁',
  description: x.description || '', coverUrl: safeURL(x.cover_image_url),
  sortOrder: Number(x.sort_order || 0), active: x.is_active !== false,
})
const imageModel = (x) => ({
  id: String(x.id), folderId: String(x.folder_id), title: x.title || '',
  altText: x.alt_text || '', imageUrl: safeURL(x.image_url),
  sortOrder: Number(x.sort_order || 0), active: x.is_active !== false,
  animationType: x.animation_type || 'none',
  animationSpeed: x.animation_speed || 'normal',
  animationRepeat: x.animation_repeat || 'loop',
})

async function api(path, { method = 'GET', body } = {}) {
  const account = token()
  if (!account) throw new Error('Sign in to Admin again.')
  const isForm = body instanceof FormData
  const response = await fetch(`${API_URL}${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${account}`, ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: isForm ? body : JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.ok === false) throw new Error(result.message || `Sticker request failed (${response.status})`)
  if (account !== token()) throw new Error('Admin account changed. Reopen this page.')
  return result
}

export function useAdminStickerLibrary() {
  const [folders, setFolders] = useState(() => cache().folders || [])
  const [folderId, setFolderId] = useState('')
  const [images, setImages] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const folderIdRef = useRef('')
  const preparedUploads = useRef(new Map())
  const uploadedFiles = useRef(new Map())
  const savedUploads = useRef(new Map())
  folderIdRef.current = folderId

  const loadFolders = useCallback(async (force = false) => {
    const entry = cache()
    if (!force && entry.folders && Date.now() - entry.foldersAt < MAX_AGE) {
      setFolders(entry.folders)
      setFolderId((current) => entry.folders.some((f) => f.id === current) ? current : (entry.folders[0]?.id || ''))
      return
    }
    setLoadingFolders(true)
    setError('')
    try {
      const data = await api('?folders_only=1')
      const rows = (data.folders || []).map(folderModel)
      entry.folders = rows
      entry.foldersAt = Date.now()
      setFolders(rows)
      setFolderId((current) => rows.some((f) => f.id === current) ? current : (rows[0]?.id || ''))
    } catch (e) { setError(e.message || 'Could not load sticker folders.') }
    finally { setLoadingFolders(false) }
  }, [])

  useEffect(() => { loadFolders() }, [loadFolders])

  const loadImages = useCallback(async (id, nextPage = 1, force = false) => {
    if (!id) return
    const entry = cache()
    const current = entry.pages.get(id)
    const valid = current && Date.now() - current.at < MAX_AGE
    if (!force && valid && current.page >= nextPage) {
      if (folderIdRef.current === id) {
        setImages(current.images)
        setPage(current.page)
        setHasMore(current.hasMore)
      }
      return
    }
    const version = generation.current
    setLoadingImages(true)
    setError('')
    try {
      const data = await api(`?images_only=1&folder_id=${encodeURIComponent(id)}&page=${nextPage}`)
      const incoming = (data.images || []).map(imageModel)
      const previous = nextPage > 1 && valid ? current.images : []
      const seen = new Set(previous.map((image) => image.id))
      const rows = [...previous, ...incoming.filter((image) => !seen.has(image.id))]
      const result = { images: rows, page: nextPage, hasMore: Boolean(data.has_more), at: Date.now() }
      if (version !== generation.current) return
      entry.pages.set(id, result)
      if (folderIdRef.current === id) {
        setImages(rows)
        setPage(nextPage)
        setHasMore(result.hasMore)
      }
    } catch (e) { if (version === generation.current) setError(e.message || 'Could not load stickers.') }
    finally { if (version === generation.current) setLoadingImages(false) }
  }, [])

  useEffect(() => {
    generation.current += 1
    setImages([])
    setPage(0)
    setHasMore(false)
    if (folderId) loadImages(folderId)
  }, [folderId, loadImages])

  const invalidate = (...ids) => {
    generation.current += 1
    ids.filter(Boolean).forEach((id) => cache().pages.delete(id))
    if (ids.includes(folderIdRef.current)) {
      setPage(0)
      setImages([])
      setHasMore(false)
      return loadImages(folderIdRef.current, 1, true)
    }
    return Promise.resolve()
  }
  const run = async (operation) => {
    if (busy) return
    setBusy(true)
    setError('')
    try { return await operation() }
    catch (e) { setError(e.message || 'Sticker operation failed.'); throw e }
    finally { setBusy(false) }
  }

  const saveFolder = (draft) => run(async () => {
    // Validate/compress a selected cover before creating the DB record.
    // Animation remains independent of image compression.
    const preparedCover = draft.coverFile
      ? await prepareStickerImage(draft.coverFile, { cover: true })
      : null
    const existing = Boolean(draft.id)
    const path = existing ? `/folders/${encodeURIComponent(draft.id)}` : '/folders'
    const data = await api(path, { method: existing ? 'PATCH' : 'POST', body: {
      name: draft.name.trim(), icon: draft.icon || '📁', description: draft.description.trim(),
      sort_order: Number(draft.sortOrder || 0), is_active: Boolean(draft.active),
    } })
    let updated = folderModel(data.folder)
    try {
      if (preparedCover) {
        const form = new FormData()
        form.append('cover', preparedCover)
        updated = folderModel((await api(`/folders/${updated.id}/cover`, { method: 'POST', body: form })).folder)
      } else if (draft.removeCover) {
        updated = folderModel((await api(`/folders/${updated.id}/cover`, { method: 'DELETE' })).folder)
      }
    } catch (error) {
      // A failed cover upload must not leave an invisible newly-created
      // folder that gets duplicated when the admin retries Save.
      if (!existing) {
        try {
          await api(`/folders/${encodeURIComponent(updated.id)}`, { method: 'DELETE' })
        } catch (cleanupError) {
          cache().folders = null
          await loadFolders(true)
          throw new Error(`Folder was created but its cover failed. It could not be rolled back: ${cleanupError.message}. Please edit or delete the folder before retrying.`)
        }
      } else {
        cache().folders = null
        await loadFolders(true)
      }
      throw error
    }
    const rows = existing ? folders.map((f) => f.id === updated.id ? updated : f) : [...folders, updated]
    setFolders(rows)
    cache().folders = rows
    cache().foldersAt = Date.now()
    setFolderId(updated.id)
    return updated
  })

  const deleteFolder = (id) => run(async () => {
    await api(`/folders/${encodeURIComponent(id)}`, { method: 'DELETE' })
    const rows = folders.filter((f) => f.id !== id)
    setFolders(rows)
    cache().folders = rows
    cache().foldersAt = Date.now()
    cache().pages.delete(id)
    setFolderId(rows[0]?.id || '')
  })

  const toggleFolder = (f) => run(async () => {
    const data = await api(`/folders/${encodeURIComponent(f.id)}`, { method: 'PATCH', body: { is_active: !f.active } })
    const updated = folderModel(data.folder)
    const rows = folders.map((item) => item.id === updated.id ? updated : item)
    setFolders(rows)
    cache().folders = rows
    cache().foldersAt = Date.now()
  })

  const reorderFolders = (next) => run(async () => {
    const previous = folders
    setFolders(next)
    try {
      const changed = next.filter((f) => previous.find((p) => p.id === f.id)?.sortOrder !== f.sortOrder)
      for (const f of changed) await api(`/folders/${encodeURIComponent(f.id)}`, { method: 'PATCH', body: { sort_order: f.sortOrder } })
      cache().folders = next
      cache().foldersAt = Date.now()
    } catch (e) {
      // Some reorder PATCH requests may have already succeeded. Refetch
      // server order instead of displaying a stale optimistic rollback.
      cache().folders = null
      try { await loadFolders(true) } catch { setFolders(previous) }
      throw e
    }
  })

  const resetUploadCache = () => {
    preparedUploads.current.clear()
    uploadedFiles.current.clear()
    savedUploads.current.clear()
  }

  const uploadImages = (drafts) => run(async () => {
    if (!drafts.length || drafts.length > 20) throw new Error('Choose between 1 and 20 images.')
    const unprepared = drafts.filter((draft) => !preparedUploads.current.has(draft.id))
    if (unprepared.length) {
      const files = await prepareStickerBatch(unprepared.map((item) => item.file))
      unprepared.forEach((item, index) => preparedUploads.current.set(item.id, files[index]))
    }
    const missing = drafts.filter((draft) => !uploadedFiles.current.has(draft.id) && !savedUploads.current.has(draft.id))
    if (missing.length) {
      // Uses existing Cloudflare direct upload and Render fallback. Prepared files
      // retain identity so the shared uploader can resume successful files on retry.
      const files = missing.map((draft) => preparedUploads.current.get(draft.id))
      const result = await uploadMediaLibraryWithProgress({ apiUrl: API_URL, token: token(), files })
      if (result.images?.length !== missing.length) throw new Error('Some uploaded images are missing.')
      missing.forEach((draft, index) => uploadedFiles.current.set(draft.id, result.images[index]))
    }
    const created = []
    for (const draft of drafts) {
      const saved = savedUploads.current.get(draft.id)
      if (saved) { created.push(saved); continue }
      const file = uploadedFiles.current.get(draft.id)
      if (!file?.image_url || !file?.storage_key) throw new Error('Missing uploaded image. Retry to continue.')
      const data = await api('/images', { method: 'POST', body: {
        folder_id: draft.folderId, title: draft.title.trim() || 'Untitled Sticker',
        alt_text: draft.title.trim() || 'Sticker', image_url: file.image_url,
        storage_key: file.storage_key, is_active: true, sort_order: Number(draft.sortOrder || 0),
        animation_type: draft.animationType, animation_speed: draft.animationSpeed,
        animation_repeat: draft.animationRepeat,
      } })
      const normalized = imageModel(data.image)
      savedUploads.current.set(draft.id, normalized)
      created.push(normalized)
    }
    await invalidate(...new Set(created.map((item) => item.folderId)))
    resetUploadCache()
    return created
  })

  const saveImage = (draft) => run(async () => {
    const before = images.find((x) => x.id === draft.id)
    const data = await api(`/images/${encodeURIComponent(draft.id)}`, { method: 'PATCH', body: {
      folder_id: draft.folderId, title: draft.title.trim(), alt_text: draft.altText.trim(),
      sort_order: Number(draft.sortOrder || 0), is_active: Boolean(draft.active),
      animation_type: draft.animationType, animation_speed: draft.animationSpeed,
      animation_repeat: draft.animationRepeat,
    } })
    const updated = imageModel(data.image)
    await invalidate(before?.folderId, updated.folderId)
    return updated
  })

  const deleteImage = (item) => run(async () => {
    await api(`/images/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
    await invalidate(item.folderId)
  })

  return {
    folders, folderId, setFolderId, images, page, hasMore, loadingFolders, loadingImages,
    busy, error, setError, loadFolders,
    loadMore: () => folderId && hasMore ? loadImages(folderId, page + 1) : Promise.resolve(),
    refresh: () => folderId ? invalidate(folderId) : loadFolders(true),
    saveFolder, deleteFolder, toggleFolder, reorderFolders,
    uploadImages, resetUploadCache, saveImage, deleteImage,
  }
}
