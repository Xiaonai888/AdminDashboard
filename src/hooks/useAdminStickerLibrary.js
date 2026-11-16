import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadMediaLibraryWithProgress } from '../utils/uploadMediaLibraryWithProgress'
import { prepareStickerBatch, prepareStickerImage } from '../utils/stickerImageOptimizer'

const API_URL = (import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com').replace(/\/+$/, '')
const BASE = '/api/admin/sticker-library'
const MAX_AGE = 10 * 60 * 1000
const DEFAULT_FOLDER_COLOR = '#6366F1'
const FOLDER_SAVE_TIMEOUT_MS = 30000
let store = { account: '', folders: null, foldersAt: 0, pages: new Map() }

const token = () => sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
function cache() {
  const account = token()
  if (store.account !== account) store = { account, folders: null, foldersAt: 0, pages: new Map() }
  return store
}
function safeURL(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
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
  description: x.description || '', color: /^#[0-9a-fA-F]{6}$/.test(x.color || '') ? x.color.toUpperCase() : DEFAULT_FOLDER_COLOR,
  coverUrl: safeURL(x.cover_image_url), coverStorageKey: x.cover_storage_key || '',
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

async function api(path, { method = 'GET', body, timeoutMs = 0 } = {}) {
  const account = token()
  if (!account) throw new Error('Sign in to Admin again.')
  const isForm = body instanceof FormData
  const controller = timeoutMs ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null
  try {
    const response = await fetch(`${API_URL}${BASE}${path}`, {
      method,
      headers: { Authorization: `Bearer ${account}`, ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: isForm ? body : JSON.stringify(body) } : {}),
      ...(controller ? { signal: controller.signal } : {}),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.ok === false) throw new Error(result.message || `Sticker request failed (${response.status})`)
    if (account !== token()) throw new Error('Admin account changed. Reopen this page.')
    return result
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Folder save took too long. Check the folder list before retrying.')
    throw error
  } finally {
    if (timer !== null) clearTimeout(timer)
  }
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
  const preparedCovers = useRef(new WeakMap())
  const coverReferences = useRef(new WeakMap())
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
    const existing = Boolean(draft.id)
    const path = existing ? `/folders/${encodeURIComponent(draft.id)}` : '/folders'
    const body = {
      name: draft.name.trim(), icon: draft.icon || '📁', description: (draft.description || '').trim(),
      color: draft.color || DEFAULT_FOLDER_COLOR,
      sort_order: Number(draft.sortOrder || 0), is_active: Boolean(draft.active),
    }
    if (draft.removeCover) {
      body.cover_image_url = null
      body.cover_storage_key = null
    }
    let updated
    const saveMetadata = async () => {
      const data = await api(path, {
        method: existing ? 'PATCH' : 'POST',
        body,
        timeoutMs: FOLDER_SAVE_TIMEOUT_MS,
      })
      updated = folderModel(data.folder)
      return updated
    }
    if (draft.coverFile && !draft.removeCover) {
      let prepared = preparedCovers.current.get(draft.coverFile)
      if (!prepared) {
        prepared = await prepareStickerImage(draft.coverFile, { cover: true })
        preparedCovers.current.set(draft.coverFile, prepared)
      }
      let reference = coverReferences.current.get(draft.coverFile)
      if (reference) {
        body.cover_image_url = reference.image_url
        body.cover_storage_key = reference.storage_key
        await saveMetadata()
      } else {
        await uploadMediaLibraryWithProgress({
          apiUrl: API_URL,
          token: token(),
          files: [prepared],
          onProcess: async (uploaded) => {
            const item = uploaded[0]
            if (!item?.image_url || !item?.storage_key) throw new Error('Cloudflare folder cover reference is missing.')
            reference = item
            coverReferences.current.set(draft.coverFile, item)
            body.cover_image_url = item.image_url
            body.cover_storage_key = item.storage_key
            await saveMetadata()
          },
        })
      }
    } else {
      await saveMetadata()
    }
    if (draft.coverFile && !draft.removeCover) {
      preparedCovers.current.delete(draft.coverFile)
      coverReferences.current.delete(draft.coverFile)
    }
    const entry = cache()
    const rows = existing ? folders.map((f) => f.id === updated.id ? updated : f) : [...folders, updated]
    setFolders(rows)
    entry.folders = rows
    entry.foldersAt = Date.now()
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
    const unsaved = drafts.filter((draft) => !savedUploads.current.has(draft.id))
    const unprepared = unsaved.filter((draft) => !preparedUploads.current.has(draft.id))
    if (unprepared.length) {
      const prepared = await prepareStickerBatch(unprepared.map((draft) => draft.file))
      unprepared.forEach((draft, index) => preparedUploads.current.set(draft.id, prepared[index]))
    }

    if (unsaved.length) {
      const files = unsaved.map((draft) => preparedUploads.current.get(draft.id))
      await uploadMediaLibraryWithProgress({
        apiUrl: API_URL,
        token: token(),
        files,
        onProcess: async (uploaded) => {
          if (uploaded.length !== unsaved.length) {
            throw new Error('Some uploaded images are missing. Retry to continue.')
          }
          unsaved.forEach((draft, index) => uploadedFiles.current.set(draft.id, uploaded[index]))
          for (const draft of unsaved) {
            if (savedUploads.current.has(draft.id)) continue
            const file = uploadedFiles.current.get(draft.id)
            if (!file?.image_url || !file?.storage_key) {
              throw new Error('Missing uploaded image. Retry to continue.')
            }
            const data = await api('/images', { method: 'POST', body: {
              folder_id: draft.folderId, title: draft.title.trim() || 'Untitled Sticker',
              alt_text: draft.title.trim() || 'Sticker', image_url: file.image_url,
              storage_key: file.storage_key, is_active: true, sort_order: Number(draft.sortOrder || 0),
              animation_type: draft.animationType, animation_speed: draft.animationSpeed,
              animation_repeat: draft.animationRepeat,
            } })
            savedUploads.current.set(draft.id, imageModel(data.image))
          }
        },
      })
    }

    const created = drafts.map((draft) => savedUploads.current.get(draft.id))
    if (created.some((image) => !image)) throw new Error('Some stickers were not saved. Retry to continue.')
    await invalidate(...new Set(created.map((image) => image.folderId)))
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
