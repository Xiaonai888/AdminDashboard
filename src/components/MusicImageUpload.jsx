import React, { useRef, useState } from 'react'
import ImageDropZone from './common/ImageDropZone'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const MAX_FILE_SIZE = 20 * 1024 * 1024
const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

export default function MusicImageUpload({
  value = '',
  onChange,
  shape = 'square',
  label = 'Image',
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function uploadFile(file) {
    if (!file || disabled || uploading) return

    if (!ACCEPTED_TYPES.has(String(file.type || '').toLowerCase())) {
      setError('Please choose JPEG, PNG, WEBP, GIF or AVIF.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be 20 MB or smaller.')
      return
    }

    const token = getAdminToken()
    if (!token) {
      setError('Admin login required')
      return
    }

    setUploading(true)
    setError('')

    try {
      const form = new FormData()
      form.append('images', file)

      const response = await fetch(`${API_URL}/api/admin/media-library/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Image upload failed')
      }

      const imageUrl = data.images?.[0]?.image_url || ''
      if (!imageUrl) throw new Error('Image URL was not returned')

      onChange?.(imageUrl)
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const isCircle = shape === 'circle'
  const isBanner = shape === 'banner'
  const previewWidth = isBanner ? 240 : 92
  const previewHeight = isBanner ? 96 : 92

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ marginBottom: 7, color: '#334155', fontSize: 10, fontWeight: 850 }}>
        {label}
      </div>

      <ImageDropZone
        disabled={disabled || uploading}
        label={`Drop ${label.toLowerCase()} here`}
        onFiles={(files) => {
          const file = files?.[0]
          if (file) void uploadFile(file)
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            border: '1px dashed #CBD5E1',
            borderRadius: 14,
            padding: 10,
            background: '#F8FAFC',
          }}
        >
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            style={{
              width: previewWidth,
              height: previewHeight,
              maxWidth: '100%',
              flex: `0 1 ${previewWidth}px`,
              border: '1px solid #E2E8F0',
              borderRadius: isCircle ? 999 : 12,
              overflow: 'hidden',
              background: '#FFFFFF',
              padding: 0,
              cursor: disabled || uploading ? 'not-allowed' : 'pointer',
              position: 'relative',
            }}
          >
            {value ? (
              <img
                src={value}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '100%',
                  height: '100%',
                  color: '#64748B',
                  fontSize: 26,
                  fontWeight: 500,
                }}
              >
                +
              </span>
            )}

            {uploading ? (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,.86)',
                  color: '#334155',
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                Uploading...
              </span>
            ) : null}
          </button>

          <div style={{ minWidth: 0, flex: '1 1 180px' }}>
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              style={{
                minHeight: 38,
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                background: '#FFFFFF',
                color: '#0F172A',
                padding: '0 13px',
                fontSize: 11,
                fontWeight: 850,
                cursor: disabled || uploading ? 'not-allowed' : 'pointer',
              }}
            >
              {value ? 'Change image' : 'Upload image'}
            </button>

            {value ? (
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => onChange?.('')}
                style={{
                  minHeight: 38,
                  marginLeft: 8,
                  border: 0,
                  background: 'transparent',
                  color: '#DC2626',
                  padding: '0 8px',
                  fontSize: 11,
                  fontWeight: 850,
                  cursor: disabled || uploading ? 'not-allowed' : 'pointer',
                }}
              >
                Remove
              </button>
            ) : null}

            <div style={{ marginTop: 7, color: '#64748B', fontSize: 9, fontWeight: 650 }}>
              Drop image here or click Upload image
            </div>

            <div style={{ marginTop: 3, color: '#94A3B8', fontSize: 9, fontWeight: 650 }}>
              JPEG, PNG, WEBP, GIF or AVIF • Max 20 MB
            </div>

            {error ? (
              <div style={{ marginTop: 6, color: '#B91C1C', fontSize: 9, fontWeight: 750 }}>
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </ImageDropZone>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void uploadFile(file)
        }}
      />
    </div>
  )
}
