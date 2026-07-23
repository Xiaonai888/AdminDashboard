import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const categories = ['All', 'Female', 'Male', 'Couple', 'Fantasy', 'Other']

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function authHeaders(extra = {}) {
  const token = getAdminToken()
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

function makePreview(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
    file,
    name: file.name.replace(/\.[^.]+$/, ''),
    category: 'Other',
    active: true,
    previewUrl: URL.createObjectURL(file),
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: authHeaders(options.headers || {}),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

function AddImagesModal({
  open,
  items,
  loading,
  onAddFiles,
  onUpdate,
  onRemove,
  onClose,
  onSave,
}) {
  const inputRef = useRef(null)

  if (!open) return null

  return (
    <div className="gallery-modal-layer" onMouseDown={loading ? undefined : onClose}>
      <div className="gallery-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="gallery-modal-head">
          <div>
            <div className="gallery-kicker">Shadow Gallery</div>
            <h2>Add Images</h2>
            <p>Upload several character images and save them to Shadow Gallery.</p>
          </div>

          <button
            type="button"
            className="gallery-icon-button"
            disabled={loading}
            onClick={onClose}
          >
            ×
          </button>
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

        <button
          type="button"
          className="gallery-dropzone"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          <span className="gallery-dropzone-icon">＋</span>
          <strong>Choose images from device</strong>
          <small>JPG, PNG or WEBP · Up to 20 images · 5MB each</small>
        </button>

        {items.length ? (
          <div className="gallery-upload-list">
            {items.map((item) => (
              <div key={item.id} className="gallery-upload-row">
                <img src={item.previewUrl} alt="" />

                <div className="gallery-upload-fields">
                  <input
                    value={item.name}
                    disabled={loading}
                    onChange={(event) => onUpdate(item.id, { name: event.target.value })}
                    placeholder="Image title"
                  />

                  <select
                    value={item.category}
                    disabled={loading}
                    onChange={(event) => onUpdate(item.id, { category: event.target.value })}
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="gallery-remove-button"
                  disabled={loading}
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="gallery-modal-actions">
          <button
            type="button"
            className="gallery-button light"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="gallery-button primary"
            disabled={!items.length || loading}
            onClick={onSave}
          >
            {loading ? 'Uploading...' : `Save ${items.length || ''} Image${items.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function ImageCard({ image, busy, onToggle, onDelete }) {
  return (
    <article className="gallery-card">
      <div className="gallery-card-image">
        <img src={image.image_url} alt={image.alt_text || image.title} />

        <span className={`gallery-status ${image.is_active ? 'active' : 'hidden'}`}>
          {image.is_active ? 'Active' : 'Hidden'}
        </span>
      </div>

      <div className="gallery-card-body">
        <div className="gallery-card-title">{image.title}</div>
        <div className="gallery-card-category">{image.category}</div>

        <div className="gallery-card-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggle(image)}
          >
            {image.is_active ? 'Hide' : 'Show'}
          </button>

          <button
            type="button"
            className="danger"
            disabled={busy}
            onClick={() => onDelete(image)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default function ChatStoryGalleryPage() {
  const [images, setImages] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadImages = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest('/api/admin/chat-story-gallery')
      setImages(Array.isArray(data.images) ? data.images : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  const filteredImages = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    return images.filter((image) => {
      const categoryMatch =
        selectedCategory === 'All' || image.category === selectedCategory

      const searchMatch =
        !cleanSearch ||
        String(image.title || '').toLowerCase().includes(cleanSearch) ||
        String(image.category || '').toLowerCase().includes(cleanSearch)

      return categoryMatch && searchMatch
    })
  }, [images, search, selectedCategory])

  const addFiles = (files) => {
    const validFiles = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, Math.max(0, 20 - uploads.length))

    setUploads((current) => [...current, ...validFiles.map(makePreview)])
  }

  const updateUpload = (id, patch) => {
    setUploads((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  const removeUpload = (id) => {
    setUploads((current) => {
      const target = current.find((item) => item.id === id)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return current.filter((item) => item.id !== id)
    })
  }

  const clearUploads = () => {
    uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setUploads([])
  }

  const closeModal = () => {
    if (saving) return
    clearUploads()
    setModalOpen(false)
  }

  const saveUploads = async () => {
    if (!uploads.length || saving) return

    const invalidTitle = uploads.find((item) => !item.name.trim())

    if (invalidTitle) {
      setError('Every image needs a title.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      uploads.forEach((item) => formData.append('images', item.file))

      const uploadData = await apiRequest('/api/admin/chat-story-gallery/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadedImages = Array.isArray(uploadData.images) ? uploadData.images : []

      if (uploadedImages.length !== uploads.length) {
        throw new Error('Some images were not uploaded. Please try again.')
      }

      const created = []

      for (let index = 0; index < uploads.length; index += 1) {
        const item = uploads[index]
        const uploaded = uploadedImages[index]

        const data = await apiRequest('/api/admin/chat-story-gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: item.name.trim(),
            alt_text: item.name.trim(),
            image_url: uploaded.image_url,
            category: item.category,
            is_active: item.active,
            sort_order: images.length + index,
          }),
        })

        if (data.image) created.push(data.image)
      }

      setImages((current) => [...created, ...current])
      setMessage(`${created.length} image${created.length === 1 ? '' : 's'} added successfully.`)
      clearUploads()
      setModalOpen(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleImage = async (image) => {
    setBusyId(image.id)
    setError('')
    setMessage('')

    try {
      const data = await apiRequest(`/api/admin/chat-story-gallery/${image.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !image.is_active,
        }),
      })

      setImages((current) =>
        current.map((item) => (item.id === image.id ? data.image : item))
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId('')
    }
  }

  const deleteImage = async (image) => {
    const confirmed = window.confirm(`Delete "${image.title}" from Shadow Gallery?`)
    if (!confirmed) return

    setBusyId(image.id)
    setError('')
    setMessage('')

    try {
      await apiRequest(`/api/admin/chat-story-gallery/${image.id}`, {
        method: 'DELETE',
      })

      setImages((current) => current.filter((item) => item.id !== image.id))
      setMessage('Image deleted successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <AdminLayout
      title="Chat Story Gallery"
      subtitle="Manage reusable character images for Chat Story authors."
    >
      <style>{`
        .gallery-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .gallery-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          background: #FFFFFF;
        }

        .gallery-toolbar-copy h2 {
          margin: 0;
          color: #0F172A;
          font-size: 18px;
          font-weight: 950;
        }

        .gallery-toolbar-copy p {
          margin: 5px 0 0;
          color: #64748B;
          font-size: 12px;
          font-weight: 700;
        }

        .gallery-button {
          min-height: 42px;
          border: 0;
          border-radius: 13px;
          padding: 0 18px;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .gallery-button.primary {
          background: #4F46E5;
          color: #FFFFFF;
          box-shadow: 0 10px 22px rgba(79, 70, 229, 0.2);
        }

        .gallery-button.light {
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
        }

        .gallery-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .gallery-filters {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 18px;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          background: #FFFFFF;
        }

        .gallery-search {
          width: 100%;
          height: 46px;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          background: #F8FAFC;
          padding: 0 16px;
          color: #0F172A;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          outline: none;
        }

        .gallery-search:focus {
          border-color: #818CF8;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px #EEF2FF;
        }

        .gallery-category-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .gallery-category {
          min-height: 36px;
          border: 0;
          border-radius: 999px;
          background: #F1F5F9;
          padding: 0 14px;
          color: #64748B;
          font: inherit;
          font-size: 12px;
          font-weight: 850;
          white-space: nowrap;
          cursor: pointer;
        }

        .gallery-category.active {
          background: #4F46E5;
          color: #FFFFFF;
        }

        .gallery-alert {
          border: 0;
          border-radius: 14px;
          padding: 12px 14px;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          text-align: left;
        }

        .gallery-alert.success {
          background: #ECFDF5;
          color: #047857;
        }

        .gallery-alert.error {
          background: #FEF2F2;
          color: #B91C1C;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
        }

        .gallery-card {
          overflow: hidden;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          background: #FFFFFF;
          box-shadow: 0 5px 16px rgba(15, 23, 42, 0.04);
        }

        .gallery-card-image {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: #F1F5F9;
        }

        .gallery-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-status {
          position: absolute;
          top: 10px;
          left: 10px;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 9px;
          font-weight: 950;
        }

        .gallery-status.active {
          background: #DCFCE7;
          color: #15803D;
        }

        .gallery-status.hidden {
          background: #FEE2E2;
          color: #B91C1C;
        }

        .gallery-card-body {
          padding: 13px 14px 14px;
        }

        .gallery-card-title {
          overflow: hidden;
          color: #0F172A;
          font-size: 13px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gallery-card-category {
          margin-top: 4px;
          color: #64748B;
          font-size: 11px;
          font-weight: 750;
        }

        .gallery-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .gallery-card-actions button {
          min-height: 32px;
          flex: 1;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          background: #F8FAFC;
          color: #475569;
          font: inherit;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .gallery-card-actions button.danger {
          border-color: #FECACA;
          background: #FEF2F2;
          color: #DC2626;
        }

        .gallery-card-actions button:disabled {
          cursor: wait;
          opacity: 0.5;
        }

        .gallery-empty {
          display: flex;
          min-height: 360px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed #CBD5E1;
          border-radius: 24px;
          background: #FFFFFF;
          padding: 30px;
          text-align: center;
        }

        .gallery-empty-icon {
          display: flex;
          width: 72px;
          height: 72px;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          background: #EEF2FF;
          color: #4F46E5;
          font-size: 30px;
          font-weight: 950;
        }

        .gallery-empty h3 {
          margin: 18px 0 7px;
          color: #0F172A;
          font-size: 18px;
          font-weight: 950;
        }

        .gallery-empty p {
          max-width: 400px;
          margin: 0;
          color: #64748B;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.7;
        }

        .gallery-empty .gallery-button {
          margin-top: 18px;
        }

        .gallery-loading {
          display: flex;
          min-height: 320px;
          align-items: center;
          justify-content: center;
          color: #64748B;
          font-size: 13px;
          font-weight: 800;
        }

        .gallery-modal-layer {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.5);
          padding: 20px;
        }

        .gallery-modal {
          width: min(760px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 24px;
          background: #FFFFFF;
          padding: 24px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
        }

        .gallery-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .gallery-kicker {
          color: #4F46E5;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .gallery-modal-head h2 {
          margin: 5px 0 0;
          color: #0F172A;
          font-size: 22px;
          font-weight: 950;
        }

        .gallery-modal-head p {
          margin: 7px 0 0;
          color: #64748B;
          font-size: 12px;
          font-weight: 700;
        }

        .gallery-icon-button {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 999px;
          background: #F1F5F9;
          color: #475569;
          font-size: 22px;
          cursor: pointer;
        }

        .gallery-dropzone {
          display: flex;
          width: 100%;
          min-height: 150px;
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

        .gallery-dropzone-icon {
          display: flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #EEF2FF;
          color: #4F46E5;
          font-size: 25px;
          font-weight: 500;
        }

        .gallery-dropzone strong {
          color: #0F172A;
          font-size: 13px;
          font-weight: 900;
        }

        .gallery-dropzone small {
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
        }

        .gallery-upload-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 18px;
        }

        .gallery-upload-row {
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 10px;
        }

        .gallery-upload-row img {
          width: 64px;
          height: 64px;
          border-radius: 13px;
          object-fit: cover;
        }

        .gallery-upload-fields {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 150px;
          gap: 10px;
        }

        .gallery-upload-fields input,
        .gallery-upload-fields select {
          height: 42px;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          background: #F8FAFC;
          padding: 0 12px;
          color: #0F172A;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          outline: none;
        }

        .gallery-remove-button {
          border: 0;
          background: transparent;
          color: #DC2626;
          font: inherit;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .gallery-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        @media (max-width: 1200px) {
          .gallery-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .gallery-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .gallery-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .gallery-toolbar .gallery-button {
            width: 100%;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .gallery-upload-row {
            grid-template-columns: 54px minmax(0, 1fr);
          }

          .gallery-upload-row img {
            width: 54px;
            height: 54px;
          }

          .gallery-upload-fields {
            grid-template-columns: 1fr;
          }

          .gallery-remove-button {
            grid-column: 2;
            justify-self: start;
          }
        }
      `}</style>

      <div className="gallery-page">
        {message ? (
          <button
            type="button"
            className="gallery-alert success"
            onClick={() => setMessage('')}
          >
            {message}
          </button>
        ) : null}

        {error ? (
          <button
            type="button"
            className="gallery-alert error"
            onClick={() => setError('')}
          >
            {error}
          </button>
        ) : null}

        <section className="gallery-toolbar">
          <div className="gallery-toolbar-copy">
            <h2>Reusable Character Images</h2>
            <p>{images.length} images saved in Shadow Gallery.</p>
          </div>

          <button
            type="button"
            className="gallery-button primary"
            onClick={() => setModalOpen(true)}
          >
            ＋ Add Images
          </button>
        </section>

        <section className="gallery-filters">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="gallery-search"
            placeholder="Search images by title or category..."
          />

          <div className="gallery-category-row">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`gallery-category ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="gallery-loading">Loading gallery images...</section>
        ) : filteredImages.length ? (
          <section className="gallery-grid">
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                busy={busyId === image.id}
                onToggle={toggleImage}
                onDelete={deleteImage}
              />
            ))}
          </section>
        ) : (
          <section className="gallery-empty">
            <div className="gallery-empty-icon">▧</div>
            <h3>{images.length ? 'No matching images' : 'No gallery images yet'}</h3>
            <p>
              {images.length
                ? 'Try another search word or category.'
                : 'Add character images here so authors can select them from Shadow Gallery.'}
            </p>

            {!images.length ? (
              <button
                type="button"
                className="gallery-button primary"
                onClick={() => setModalOpen(true)}
              >
                Add First Images
              </button>
            ) : null}
          </section>
        )}
      </div>

      <AddImagesModal
        open={modalOpen}
        items={uploads}
        loading={saving}
        onAddFiles={addFiles}
        onUpdate={updateUpload}
        onRemove={removeUpload}
        onClose={closeModal}
        onSave={saveUploads}
      />
    </AdminLayout>
  )
}
