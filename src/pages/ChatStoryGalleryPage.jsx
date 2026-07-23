import React, { useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const categories = ['All', 'Female', 'Male', 'Couple', 'Fantasy', 'Other']

function makePreview(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    name: file.name.replace(/\.[^.]+$/, ''),
    category: 'Other',
    active: true,
    previewUrl: URL.createObjectURL(file),
  }
}

function AddImagesModal({ open, items, onAddFiles, onUpdate, onRemove, onClose, onContinue }) {
  const inputRef = useRef(null)

  if (!open) return null

  return (
    <div className="gallery-modal-layer" onMouseDown={onClose}>
      <div className="gallery-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="gallery-modal-head">
          <div>
            <div className="gallery-kicker">Shadow Gallery</div>
            <h2>Add Images</h2>
            <p>Upload several character images and prepare their details before saving.</p>
          </div>

          <button type="button" className="gallery-icon-button" onClick={onClose}>×</button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            onAddFiles(Array.from(event.target.files || []))
            event.target.value = ''
          }}
        />

        <button type="button" className="gallery-dropzone" onClick={() => inputRef.current?.click()}>
          <span className="gallery-dropzone-icon">＋</span>
          <strong>Choose images from device</strong>
          <small>JPG, PNG or WEBP · Multiple files supported</small>
        </button>

        {items.length ? (
          <div className="gallery-upload-list">
            {items.map((item) => (
              <div key={item.id} className="gallery-upload-row">
                <img src={item.previewUrl} alt="" />

                <div className="gallery-upload-fields">
                  <input
                    value={item.name}
                    onChange={(event) => onUpdate(item.id, { name: event.target.value })}
                    placeholder="Image title"
                  />

                  <select
                    value={item.category}
                    onChange={(event) => onUpdate(item.id, { category: event.target.value })}
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <button type="button" className="gallery-remove-button" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="gallery-modal-actions">
          <button type="button" className="gallery-button light" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="gallery-button primary"
            disabled={!items.length}
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function ImageCard({ image }) {
  return (
    <article className="gallery-card">
      <div className="gallery-card-image">
        <img src={image.imageUrl} alt={image.altText || image.title} />
        <span className={`gallery-status ${image.active ? 'active' : 'hidden'}`}>
          {image.active ? 'Active' : 'Hidden'}
        </span>
      </div>

      <div className="gallery-card-body">
        <div className="gallery-card-title">{image.title}</div>
        <div className="gallery-card-category">{image.category}</div>

        <button type="button" className="gallery-card-menu">•••</button>
      </div>
    </article>
  )
}

export default function ChatStoryGalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [uploads, setUploads] = useState([])
  const [message, setMessage] = useState('')

  const images = []

  const filteredImages = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    return images.filter((image) => {
      const categoryMatch =
        selectedCategory === 'All' || image.category === selectedCategory
      const searchMatch =
        !cleanSearch ||
        image.title.toLowerCase().includes(cleanSearch) ||
        image.category.toLowerCase().includes(cleanSearch)

      return categoryMatch && searchMatch
    })
  }, [images, search, selectedCategory])

  const addFiles = (files) => {
    const validFiles = files.filter((file) => file.type.startsWith('image/'))
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

  const closeModal = () => {
    uploads.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setUploads([])
    setModalOpen(false)
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

        .gallery-message {
          border-radius: 14px;
          background: #ECFDF5;
          padding: 12px 14px;
          color: #047857;
          font-size: 12px;
          font-weight: 800;
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
          position: relative;
          padding: 13px 42px 14px 14px;
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

        .gallery-card-menu {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 9px;
          background: #F8FAFC;
          color: #64748B;
          cursor: pointer;
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
        {message ? <button type="button" className="gallery-message" onClick={() => setMessage('')}>{message}</button> : null}

        <section className="gallery-toolbar">
          <div className="gallery-toolbar-copy">
            <h2>Reusable Character Images</h2>
            <p>Upload and organize images that authors can select from Shadow Gallery.</p>
          </div>

          <button type="button" className="gallery-button primary" onClick={() => setModalOpen(true)}>
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

        {filteredImages.length ? (
          <section className="gallery-grid">
            {filteredImages.map((image) => <ImageCard key={image.id} image={image} />)}
          </section>
        ) : (
          <section className="gallery-empty">
            <div className="gallery-empty-icon">▧</div>
            <h3>No gallery images yet</h3>
            <p>
              Add character images here. After the backend connection is completed,
              these images will appear inside the author’s Shadow Gallery.
            </p>
            <button type="button" className="gallery-button primary" onClick={() => setModalOpen(true)}>
              Add First Images
            </button>
          </section>
        )}
      </div>

      <AddImagesModal
        open={modalOpen}
        items={uploads}
        onAddFiles={addFiles}
        onUpdate={updateUpload}
        onRemove={removeUpload}
        onClose={closeModal}
        onContinue={() => {
          setMessage('UI is ready. Backend upload and database save are the next stage.')
          closeModal()
        }}
      />
    </AdminLayout>
  )
}
