import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ImageDropZone from '../components/common/ImageDropZone'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

async function apiRequest(path, options = {}) {
  const token = getAdminToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

function folderFromApi(folder) {
  return {
    id: folder.id,
    name: folder.name,
    icon: folder.icon || '📁',
    description: folder.description || '',
    coverUrl: folder.cover_image_url || '',
    coverPreview: folder.cover_image_url || '',
    coverFile: null,
    sortOrder: folder.sort_order || 0,
    active: folder.is_active !== false,
  }
}

function imageFromApi(image) {
  return {
    id: image.id,
    title: image.title,
    folderId: image.folder_id,
    sortOrder: image.sort_order || 0,
    active: image.is_active !== false,
    imageUrl: image.image_url,
    storageKey: image.storage_key || '',
  }
}

const starterFolders = [
  { id: 'characters', name: 'Characters', icon: '👤', description: 'People, poses and expressions', sortOrder: 1, active: true },
  { id: 'locations', name: 'Locations', icon: '🏙️', description: 'Places, rooms and outdoor scenes', sortOrder: 2, active: true },
  { id: 'objects', name: 'Objects', icon: '👜', description: 'Props, items and useful objects', sortOrder: 3, active: true },
  { id: 'backgrounds', name: 'Backgrounds', icon: '🌄', description: 'Scene backgrounds and transitions', sortOrder: 4, active: true },
  { id: 'effects', name: 'Effects', icon: '✨', description: 'Weather, emotion and visual effects', sortOrder: 5, active: true },
]

function makePreview(file, folderId) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
    file,
    title: file.name.replace(/\.[^.]+$/, ''),
    folderId,
    sortOrder: 0,
    active: true,
    previewUrl: URL.createObjectURL(file),
  }
}

function FolderModal({ open, folder, onClose, onSave }) {
  const [name, setName] = useState(folder?.name || '')
  const [icon, setIcon] = useState(folder?.icon || '📁')
  const [description, setDescription] = useState(folder?.description || '')
  const [coverPreview, setCoverPreview] = useState(folder?.coverPreview || folder?.coverUrl || '')
  const [coverFile, setCoverFile] = useState(null)
  const [sortOrder, setSortOrder] = useState(folder?.sortOrder || 1)
  const [active, setActive] = useState(folder?.active ?? true)

  if (!open) return null

  return (
    <div className="media-modal-layer" onMouseDown={onClose}>
      <div className="media-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="media-modal-head">
          <div>
            <div className="media-kicker">Folder Settings</div>
            <h2>{folder ? 'Edit Folder' : 'Create Folder'}</h2>
          </div>
          <button type="button" className="media-icon-button" onClick={onClose}>×</button>
        </div>

        <label className="media-field wide">
  <span>Folder Cover / Profile</span>

  <div className="media-folder-cover-editor">
    <ImageDropZone
      label="Drop folder cover here"
      onFiles={(files) => {
        const file = files[0]
        if (!file) return

        if (coverPreview && coverPreview.startsWith('blob:')) {
          URL.revokeObjectURL(coverPreview)
        }

        setCoverFile(file)
        setCoverPreview(URL.createObjectURL(file))
      }}
    >
      <label className="media-folder-cover-picker">
        {coverPreview ? (
          <img src={coverPreview} alt="Folder cover preview" />
        ) : (
          <div className="media-folder-cover-empty">
            <i className="fa-regular fa-image" />
            <small>Add square cover</small>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''

            if (!file) return

            if (coverPreview && coverPreview.startsWith('blob:')) {
              URL.revokeObjectURL(coverPreview)
            }

            setCoverFile(file)
            setCoverPreview(URL.createObjectURL(file))
          }}
        />
      </label>
    </ImageDropZone>

    <div className="media-folder-cover-help">
      <strong>Square profile image</strong>
      <p>
        Upload one image containing your four combined previews. It will appear
        as the folder cover for authors.
      </p>

      {coverPreview ? (
        <button
          type="button"
          onClick={() => {
            if (coverPreview.startsWith('blob:')) {
              URL.revokeObjectURL(coverPreview)
            }

            setCoverPreview('')
            setCoverFile(null)
          }}
        >
          Remove Cover
        </button>
      ) : null}
    </div>
  </div>
</label>

        <div className="media-form-grid">
          <label className="media-field wide">
            <span>Folder Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: School Locations" />
          </label>

          <label className="media-field">
            <span>Icon or Emoji</span>
            <input value={icon} onChange={(event) => setIcon(event.target.value)} placeholder="📁" />
          </label>

          <label className="media-field">
            <span>Sort Order</span>
            <input type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value) || 0)} />
          </label>

          <label className="media-field wide">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Describe what belongs in this folder..." />
          </label>

          <label className="media-switch-row wide">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            <span>Show this folder in the library</span>
          </label>
        </div>

        <div className="media-modal-actions">
          <button type="button" className="media-button light" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="media-button primary"
            disabled={!name.trim()}
            onClick={() => onSave({
  id: folder?.id || `${Date.now()}`,
  name: name.trim(),
  icon: icon.trim() || '📁',
  description: description.trim(),
  coverUrl: folder?.coverUrl || '',
  coverPreview,
  coverFile,
  sortOrder,
  active,
})}
          >
            Save Folder
          </button>
        </div>
      </div>
    </div>
  )
}

function UploadModal({ open, folders, selectedFolderId, items, onAddFiles, onUpdate, onRemove, onClose, onSave }) {
  const inputRef = useRef(null)

  if (!open) return null

  return (
    <div className="media-modal-layer" onMouseDown={onClose}>
      <div className="media-modal large" onMouseDown={(event) => event.stopPropagation()}>
        <div className="media-modal-head">
          <div>
            <div className="media-kicker">Upload Media</div>
            <h2>Add Images</h2>
            <p>Choose any image type and place it in any folder.</p>
          </div>
          <button type="button" className="media-icon-button" onClick={onClose}>×</button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(event) => {
            onAddFiles(Array.from(event.target.files || []))
            event.target.value = ''
          }}
        />

        <ImageDropZone multiple label="Drop images here" onFiles={onAddFiles}>
          <button type="button" className="media-dropzone" onClick={() => inputRef.current?.click()}>
            <span className="media-dropzone-icon">＋</span>
            <strong>Choose or drop images</strong>
            <small>People, places, objects, backgrounds, effects or anything else</small>
          </button>
        </ImageDropZone>

        {items.length ? (
          <div className="media-upload-list">
            {items.map((item) => (
              <div key={item.id} className="media-upload-row">
                <img src={item.previewUrl} alt="" />

                <div className="media-upload-fields">
                  <input
                    value={item.title}
                    onChange={(event) => onUpdate(item.id, { title: event.target.value })}
                    placeholder="Image name"
                  />

                  <select
                    value={item.folderId || selectedFolderId}
                    onChange={(event) => onUpdate(item.id, { folderId: event.target.value })}
                  >
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    value={item.sortOrder}
                    onChange={(event) => onUpdate(item.id, { sortOrder: Number(event.target.value) || 0 })}
                    placeholder="Sort"
                  />
                </div>

                <button type="button" className="media-remove-button" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="media-modal-actions">
          <button type="button" className="media-button light" onClick={onClose}>Cancel</button>
          <button type="button" className="media-button primary" disabled={!items.length} onClick={onSave}>
            Add to Library
          </button>
        </div>
      </div>
    </div>
  )
}

function MediaCard({ image, folders, onMove, onToggle, onDelete }) {
  return (
    <article className="media-card">
      <div className="media-card-image">
        <img src={image.imageUrl} alt={image.title} />
        <span className={`media-status ${image.active ? 'active' : 'hidden'}`}>
          {image.active ? 'Active' : 'Hidden'}
        </span>
      </div>

      <div className="media-card-body">
        <div className="media-card-title">{image.title}</div>
        <div className="media-card-meta">Sort {image.sortOrder}</div>

        <select value={image.folderId} onChange={(event) => onMove(image.id, event.target.value)}>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>

        <div className="media-card-actions">
          <button type="button" onClick={() => onToggle(image.id)}>{image.active ? 'Hide' : 'Show'}</button>
          <button type="button" className="danger" onClick={() => onDelete(image.id)}>Delete</button>
        </div>
      </div>
    </article>
  )
}

export default function ShadowMediaLibraryPage() {
  const [folders, setFolders] = useState([])
  const [images, setImages] = useState([])
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [search, setSearch] = useState('')
  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploads, setUploads] = useState([])

  const loadLibrary = async () => {
    try {
      const data = await apiRequest('/api/admin/media-library')
      const nextFolders = (data.folders || []).map(folderFromApi)
      const nextImages = (data.images || []).map(imageFromApi)
      setFolders(nextFolders)
      setImages(nextImages)
      setSelectedFolderId((current) =>
        nextFolders.some((folder) => folder.id === current) ? current : nextFolders[0]?.id || ''
      )
    } catch (error) {
      window.alert(error.message)
    }
  }

  useEffect(() => {
    loadLibrary()
  }, [])

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.sortOrder - b.sortOrder),
    [folders]
  )

  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId)

  const filteredImages = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    return images
      .filter((image) => image.folderId === selectedFolderId)
      .filter((image) => !cleanSearch || image.title.toLowerCase().includes(cleanSearch))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [images, search, selectedFolderId])

  const saveFolder = async (folder) => {
    try {
      const existing = folders.some((item) => item.id === folder.id)
      const path = existing
        ? `/api/admin/media-library/folders/${folder.id}`
        : '/api/admin/media-library/folders'

      const data = await apiRequest(path, {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folder.name,
          icon: folder.icon,
          description: folder.description,
          sort_order: folder.sortOrder,
          is_active: folder.active,
        }),
      })

      const saved = folderFromApi(data.folder)
      setFolders((current) =>
        existing
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved]
      )
      if (!selectedFolderId) setSelectedFolderId(saved.id)
      setFolderModalOpen(false)
      setEditingFolder(null)
    } catch (error) {
      window.alert(error.message)
    }
  }

  const deleteFolder = async (folderId) => {
    const folder = folders.find((item) => item.id === folderId)
    const confirmed = window.confirm(`Delete folder "${folder?.name || ''}"? Images inside it will also be removed.`)
    if (!confirmed) return

    try {
      await apiRequest(`/api/admin/media-library/folders/${folderId}`, { method: 'DELETE' })
      const remaining = folders.filter((item) => item.id !== folderId)
      setFolders(remaining)
      setImages((current) => current.filter((image) => image.folderId !== folderId))
      setSelectedFolderId(remaining[0]?.id || '')
    } catch (error) {
      window.alert(error.message)
    }
  }

  const toggleFolder = async (folder) => {
    try {
      const data = await apiRequest(`/api/admin/media-library/folders/${folder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !folder.active }),
      })
      const saved = folderFromApi(data.folder)
      setFolders((current) => current.map((item) => (item.id === saved.id ? saved : item)))
    } catch (error) {
      window.alert(error.message)
    }
  }

  const addFiles = (files) => {
    const validFiles = files.filter((file) => file.type.startsWith('image/')).slice(0, 20)
    setUploads((current) => [
      ...current,
      ...validFiles.map((file) => makePreview(file, selectedFolderId)),
    ])
  }

  const updateUpload = (id, patch) => {
    setUploads((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeUpload = (id) => {
    setUploads((current) => {
      const target = current.find((item) => item.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return current.filter((item) => item.id !== id)
    })
  }

  const closeUpload = () => {
    uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setUploads([])
    setUploadOpen(false)
  }

  const saveUploads = async () => {
    try {
      const formData = new FormData()
      uploads.forEach((item) => formData.append('images', item.file))

      const uploaded = await apiRequest('/api/admin/media-library/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadedImages = uploaded.images || []
      if (uploadedImages.length !== uploads.length) {
        throw new Error('Some images were not uploaded.')
      }

      const created = []

      for (let index = 0; index < uploads.length; index += 1) {
        const item = uploads[index]
        const file = uploadedImages[index]

        const data = await apiRequest('/api/admin/media-library/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folder_id: item.folderId || selectedFolderId,
            title: item.title.trim() || 'Untitled Image',
            alt_text: item.title.trim() || 'Untitled Image',
            image_url: file.image_url,
            storage_key: file.storage_key,
            sort_order: item.sortOrder,
            is_active: true,
          }),
        })

        created.push(imageFromApi(data.image))
      }

      uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      setImages((current) => [...current, ...created])
      setUploads([])
      setUploadOpen(false)
    } catch (error) {
      window.alert(error.message)
    }
  }

  const moveImage = async (imageId, folderId) => {
    try {
      const data = await apiRequest(`/api/admin/media-library/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId }),
      })
      const saved = imageFromApi(data.image)
      setImages((current) => current.map((item) => (item.id === saved.id ? saved : item)))
    } catch (error) {
      window.alert(error.message)
    }
  }

  const toggleImage = async (imageId) => {
    const image = images.find((item) => item.id === imageId)
    if (!image) return

    try {
      const data = await apiRequest(`/api/admin/media-library/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !image.active }),
      })
      const saved = imageFromApi(data.image)
      setImages((current) => current.map((item) => (item.id === saved.id ? saved : item)))
    } catch (error) {
      window.alert(error.message)
    }
  }

  const deleteImage = async (imageId) => {
    const image = images.find((item) => item.id === imageId)
    if (!window.confirm(`Delete "${image?.title || 'this image'}"?`)) return

    try {
      await apiRequest(`/api/admin/media-library/images/${imageId}`, { method: 'DELETE' })
      setImages((current) => current.filter((item) => item.id !== imageId))
    } catch (error) {
      window.alert(error.message)
    }
  }

  return (
    <AdminLayout
      title="Shadow Media Library"
      subtitle="Organize people, locations, objects, backgrounds and any reusable images."
    >
      <style>{`
        .image-drop-zone {
          position: relative;
          border-radius: inherit;
        }

        .image-drop-zone.dragging {
          outline: 2px solid #4F46E5;
          outline-offset: 3px;
        }

        .image-drop-zone-overlay {
          position: absolute;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: inherit;
          background: rgba(15, 23, 42, 0.82);
          padding: 16px;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 900;
          text-align: center;
          backdrop-filter: blur(4px);
          pointer-events: none;
        }

        .media-library {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 20px;
          min-height: calc(100vh - 140px);
        }

        .media-sidebar,
        .media-content-panel {
          border: 1px solid #E2E8F0;
          border-radius: 22px;
          background: #FFFFFF;
        }

        .media-sidebar {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .media-sidebar-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid #E2E8F0;
        }

        .media-sidebar-head h2 {
          margin: 0;
          color: #0F172A;
          font-size: 16px;
          font-weight: 950;
        }

        .media-add-folder {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 11px;
          background: #EEF2FF;
          color: #4F46E5;
          font-size: 20px;
          cursor: pointer;
        }

        .media-folder-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 12px;
        }

        .media-folder {
          width: 100%;
          border: 0;
          border-radius: 15px;
          background: transparent;
          padding: 12px;
          text-align: left;
          cursor: pointer;
        }

        .media-folder.active {
          background: #EEF2FF;
        }

        .media-folder-card-layout {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.media-folder-cover {
  width: 82px;
  height: 82px;
  overflow: hidden;
  border-radius: 18px;
  background: #F1F5F9;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}

.media-folder-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-folder-cover span {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.media-folder-card-copy {
  min-width: 0;
}

.media-folder-description {
  margin: 6px 0 0;
  display: -webkit-box;
  overflow: hidden;
  color: #64748B;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.media-folder-count {
  margin-top: 7px;
  color: #4F46E5;
  font-size: 10px;
  font-weight: 850;
}

.media-folder-actions {
  margin: 9px 0 0 94px;
}

.media-folder-cover-editor {
  display: flex;
  gap: 16px;
  align-items: center;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  background: #F8FAFC;
  padding: 14px;
}

.media-folder-cover-picker {
  width: 126px;
  height: 126px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1.5px dashed #A5B4FC;
  border-radius: 22px;
  background: #FFFFFF;
  cursor: pointer;
}

.media-folder-cover-picker img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-folder-cover-empty {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4F46E5;
}

.media-folder-cover-empty i {
  font-size: 25px;
}

.media-folder-cover-empty small {
  color: #64748B;
  font-size: 10px;
  font-weight: 800;
}

.media-folder-cover-help strong {
  color: #0F172A;
  font-size: 13px;
  font-weight: 900;
}

.media-folder-cover-help p {
  max-width: 270px;
  margin: 6px 0 0;
  color: #64748B;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.55;
}

.media-folder-cover-help button {
  margin-top: 12px;
  border: 0;
  border-radius: 999px;
  background: #FEF2F2;
  padding: 8px 12px;
  color: #DC2626;
  font: inherit;
  font-size: 10px;
  font-weight: 850;
  cursor: pointer;
}

        .media-folder-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .media-folder-icon {
          display: flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #F8FAFC;
          font-size: 19px;
        }

        .media-folder-name {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          color: #0F172A;
          font-size: 13px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .media-folder-order {
          color: #94A3B8;
          font-size: 10px;
          font-weight: 850;
        }

        .media-folder-description {
          margin: 7px 0 0 48px;
          color: #64748B;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.5;
        }

        .media-folder-actions {
          display: flex;
          gap: 6px;
          margin: 9px 0 0 48px;
        }

        .media-folder-actions button {
          border: 0;
          border-radius: 8px;
          background: #F8FAFC;
          padding: 5px 8px;
          color: #64748B;
          font: inherit;
          font-size: 9px;
          font-weight: 850;
          cursor: pointer;
        }

        .media-folder-actions button.danger {
          color: #DC2626;
        }

        .media-content-panel {
          overflow: hidden;
        }

        .media-content-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px;
          border-bottom: 1px solid #E2E8F0;
        }

        .media-content-copy h2 {
          margin: 0;
          color: #0F172A;
          font-size: 18px;
          font-weight: 950;
        }

        .media-content-copy p {
          margin: 5px 0 0;
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
        }

        .media-button {
          min-height: 40px;
          border: 0;
          border-radius: 12px;
          padding: 0 16px;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .media-button.primary {
          background: #4F46E5;
          color: #FFFFFF;
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
        }

        .media-button.light {
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
        }

        .media-toolbar {
          display: flex;
          gap: 10px;
          padding: 16px 18px;
          border-bottom: 1px solid #E2E8F0;
        }

        .media-search {
          width: 100%;
          height: 42px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          background: #F8FAFC;
          padding: 0 14px;
          color: #0F172A;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          outline: none;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          padding: 18px;
        }

        .media-card {
          overflow: hidden;
          border: 1px solid #E2E8F0;
          border-radius: 17px;
          background: #FFFFFF;
        }

        .media-card-image {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: #F1F5F9;
        }

        .media-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-status {
          position: absolute;
          top: 9px;
          left: 9px;
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 8px;
          font-weight: 950;
        }

        .media-status.active {
          background: #DCFCE7;
          color: #15803D;
        }

        .media-status.hidden {
          background: #FEE2E2;
          color: #B91C1C;
        }

        .media-card-body {
          padding: 12px;
        }

        .media-card-title {
          overflow: hidden;
          color: #0F172A;
          font-size: 12px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .media-card-meta {
          margin-top: 4px;
          color: #94A3B8;
          font-size: 9px;
          font-weight: 800;
        }

        .media-card-body select {
          width: 100%;
          height: 34px;
          margin-top: 10px;
          border: 1px solid #E2E8F0;
          border-radius: 9px;
          background: #F8FAFC;
          padding: 0 9px;
          color: #475569;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
        }

        .media-card-actions {
          display: flex;
          gap: 7px;
          margin-top: 9px;
        }

        .media-card-actions button {
          min-height: 30px;
          flex: 1;
          border: 1px solid #E2E8F0;
          border-radius: 9px;
          background: #F8FAFC;
          color: #475569;
          font: inherit;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .media-card-actions button.danger {
          border-color: #FECACA;
          background: #FEF2F2;
          color: #DC2626;
        }

        .media-empty {
          display: flex;
          min-height: 420px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          text-align: center;
        }

        .media-empty-icon {
          display: flex;
          width: 72px;
          height: 72px;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          background: #EEF2FF;
          color: #4F46E5;
          font-size: 30px;
        }

        .media-empty h3 {
          margin: 16px 0 6px;
          color: #0F172A;
          font-size: 17px;
          font-weight: 950;
        }

        .media-empty p {
          max-width: 390px;
          margin: 0;
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.6;
        }

        .media-empty .media-button {
          margin-top: 17px;
        }

        .media-modal-layer {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.5);
          padding: 20px;
        }

        .media-modal {
          width: min(620px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 24px;
          background: #FFFFFF;
          padding: 24px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
        }

        .media-modal.large {
          width: min(820px, 100%);
        }

        .media-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .media-kicker {
          color: #4F46E5;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .media-modal-head h2 {
          margin: 5px 0 0;
          color: #0F172A;
          font-size: 22px;
          font-weight: 950;
        }

        .media-modal-head p {
          margin: 7px 0 0;
          color: #64748B;
          font-size: 12px;
          font-weight: 700;
        }

        .media-icon-button {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 999px;
          background: #F1F5F9;
          color: #475569;
          font-size: 22px;
          cursor: pointer;
        }

        .media-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 22px;
        }

        .media-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .media-field.wide,
        .media-switch-row.wide {
          grid-column: 1 / -1;
        }

        .media-field span {
          color: #475569;
          font-size: 11px;
          font-weight: 900;
        }

        .media-field input,
        .media-field textarea {
          width: 100%;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          background: #F8FAFC;
          padding: 11px 12px;
          color: #0F172A;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          outline: none;
        }

        .media-switch-row {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #475569;
          font-size: 11px;
          font-weight: 850;
        }

        .media-dropzone {
          display: flex;
          width: 100%;
          min-height: 145px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 22px;
          border: 1.5px dashed #A5B4FC;
          border-radius: 20px;
          background: #F8FAFF;
          color: #475569;
          font: inherit;
          cursor: pointer;
        }

        .media-dropzone-icon {
          display: flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #EEF2FF;
          color: #4F46E5;
          font-size: 25px;
        }

        .media-dropzone strong {
          color: #0F172A;
          font-size: 13px;
          font-weight: 900;
        }

        .media-dropzone small {
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
        }

        .media-upload-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 18px;
        }

        .media-upload-row {
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 10px;
        }

        .media-upload-row img {
          width: 64px;
          height: 64px;
          border-radius: 13px;
          object-fit: cover;
        }

        .media-upload-fields {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 160px 80px;
          gap: 10px;
        }

        .media-upload-fields input,
        .media-upload-fields select {
          height: 42px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          background: #F8FAFC;
          padding: 0 12px;
          color: #0F172A;
          font: inherit;
          font-size: 11px;
          font-weight: 750;
        }

        .media-remove-button {
          border: 0;
          background: transparent;
          color: #DC2626;
          font: inherit;
          font-size: 10px;
          font-weight: 850;
          cursor: pointer;
        }

        .media-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        @media (max-width: 1100px) {
          .media-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 850px) {
          .media-library {
            grid-template-columns: 1fr;
          }

          .media-folder-list {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .media-content-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .media-folder-cover-editor {
  align-items: flex-start;
  flex-direction: column;
}

.media-folder-cover-picker {
  width: 112px;
  height: 112px;
}

          .media-content-head .media-button {
            width: 100%;
          }

          .media-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .media-form-grid {
            grid-template-columns: 1fr;
          }

          .media-field.wide,
          .media-switch-row.wide {
            grid-column: auto;
          }

          .media-upload-row {
            grid-template-columns: 54px minmax(0, 1fr);
          }

          .media-upload-row img {
            width: 54px;
            height: 54px;
          }

          .media-upload-fields {
            grid-template-columns: 1fr;
          }

          .media-remove-button {
            grid-column: 2;
            justify-self: start;
          }
        }
      `}</style>

      <div className="media-library">
        <aside className="media-sidebar">
          <div className="media-sidebar-head">
            <h2>Folders</h2>
            <button
              type="button"
              className="media-add-folder"
              onClick={() => {
                setEditingFolder(null)
                setFolderModalOpen(true)
              }}
            >
              ＋
            </button>
          </div>

          <div className="media-folder-list">
            {sortedFolders.map((folder) => (
              <div key={folder.id}>
                <button
                  type="button"
                  className={`media-folder ${selectedFolderId === folder.id ? 'active' : ''}`}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <div className="media-folder-card-layout">
  <div className="media-folder-cover">
    {folder.coverPreview || folder.coverUrl ? (
      <img
        src={folder.coverPreview || folder.coverUrl}
        alt={folder.name}
      />
    ) : (
      <span>{folder.icon}</span>
    )}
  </div>

  <div className="media-folder-card-copy">
    <div className="media-folder-top">
      <span className="media-folder-name">{folder.name}</span>
      <span className="media-folder-order">#{folder.sortOrder}</span>
    </div>

    <div className="media-folder-description">
      {folder.description || 'No description'}
    </div>

    <div className="media-folder-count">
      {images.filter((image) => image.folderId === folder.id).length} images
    </div>
  </div>
</div>
                </button>

                <div className="media-folder-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFolder(folder)
                      setFolderModalOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder)}
                  >
                    {folder.active ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" className="danger" onClick={() => deleteFolder(folder.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="media-content-panel">
          <div className="media-content-head">
            <div className="media-content-copy">
              <h2>{selectedFolder ? `${selectedFolder.icon} ${selectedFolder.name}` : 'Select a Folder'}</h2>
              <p>{selectedFolder?.description || 'Create a folder to start organizing images.'}</p>
            </div>

            <button
              type="button"
              className="media-button primary"
              disabled={!selectedFolderId}
              onClick={() => setUploadOpen(true)}
            >
              ＋ Add Images
            </button>
          </div>

          <div className="media-toolbar">
            <input
              className="media-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search images in this folder..."
            />
          </div>

          {filteredImages.length ? (
            <div className="media-grid">
              {filteredImages.map((image) => (
                <MediaCard
                  key={image.id}
                  image={image}
                  folders={sortedFolders}
                  onMove={moveImage}
                  onToggle={toggleImage}
                  onDelete={deleteImage}
                />
              ))}
            </div>
          ) : (
            <div className="media-empty">
              <div className="media-empty-icon">▧</div>
              <h3>No images in this folder</h3>
              <p>
                Add people, locations, objects, backgrounds, effects or any reusable image.
              </p>
              <button
                type="button"
                className="media-button primary"
                disabled={!selectedFolderId}
                onClick={() => setUploadOpen(true)}
              >
                Add First Images
              </button>
            </div>
          )}
        </section>
      </div>

      <FolderModal
        key={editingFolder?.id || 'new-folder'}
        open={folderModalOpen}
        folder={editingFolder}
        onClose={() => {
          setFolderModalOpen(false)
          setEditingFolder(null)
        }}
        onSave={saveFolder}
      />

      <UploadModal
        open={uploadOpen}
        folders={sortedFolders}
        selectedFolderId={selectedFolderId}
        items={uploads}
        onAddFiles={addFiles}
        onUpdate={updateUpload}
        onRemove={removeUpload}
        onClose={closeUpload}
        onSave={saveUploads}
      />
    </AdminLayout>
  )
}
