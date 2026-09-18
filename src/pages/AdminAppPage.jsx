import React, { useCallback, useEffect, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import ImageDropZone from '../components/common/ImageDropZone'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const APP_KEY = 'shadow-studio'
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

const styles = `
  .app-admin-page{display:grid;gap:18px}
  .app-admin-card{overflow:hidden;border:1px solid #E2E8F0;border-radius:22px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.05)}
  .app-admin-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px;border-bottom:1px solid #F1F5F9}
  .app-admin-title{margin:0;color:#0F172A;font-size:17px;font-weight:900}
  .app-admin-copy{margin-top:4px;color:#64748B;font-size:11px;font-weight:700;line-height:1.55}
  .app-admin-body{padding:18px}
  .app-admin-profile{display:grid;grid-template-columns:132px 1fr;gap:16px;align-items:start}
  .app-admin-drop{min-height:132px;border:1px dashed #CBD5E1;border-radius:18px;background:#F8FAFC}
  .image-drop-zone{position:relative;border-radius:inherit}
  .image-drop-zone.dragging{outline:2px solid #4F46E5;outline-offset:3px}
  .image-drop-zone-overlay{position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;border-radius:inherit;background:rgba(79,70,229,.92);color:#fff;padding:16px;text-align:center;font-size:12px;font-weight:900;pointer-events:none}
  .app-admin-profile-btn{width:100%;min-height:132px;display:grid;place-items:center;border:0;border-radius:inherit;background:transparent;padding:10px;cursor:pointer}
  .app-admin-preview{width:106px;height:106px;overflow:hidden;display:grid;place-items:center;border:1px solid #E2E8F0;border-radius:20px;background:#fff;color:#4F46E5;font-size:30px;font-weight:950}
  .app-admin-preview img{width:100%;height:100%;object-fit:cover}
  .app-admin-field{display:grid;gap:7px;margin-top:14px}
  .app-admin-label{color:#334155;font-size:10px;font-weight:900;letter-spacing:.02em}
  .app-admin-input,.app-admin-select{width:100%;min-height:42px;border:1px solid #CBD5E1;border-radius:11px;background:#fff;color:#0F172A;padding:0 11px;outline:none;font:inherit;font-size:12px;font-weight:750}
  .app-admin-input:focus,.app-admin-select:focus{border-color:#6366F1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
  .app-admin-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
  .app-admin-btn{min-height:38px;border:1px solid #CBD5E1;border-radius:11px;background:#fff;color:#334155;padding:0 12px;font:inherit;font-size:10px;font-weight:900;cursor:pointer}
  .app-admin-btn.primary{border-color:#4F46E5;background:#4F46E5;color:#fff}
  .app-admin-btn.warning{border-color:#FDBA74;background:#FFF7ED;color:#C2410C}
  .app-admin-btn.danger{border-color:#FCA5A5;background:#FEF2F2;color:#B91C1C}
  .app-admin-btn:disabled{opacity:.5;cursor:not-allowed}
  .app-admin-file{display:none}
  .app-admin-status{border-radius:13px;background:#EEF2FF;color:#4338CA;padding:12px 14px;font-size:11px;font-weight:800}
  .app-admin-status.error{background:#FEF2F2;color:#B91C1C}
  .app-admin-badges{display:flex;flex-wrap:wrap;gap:6px}
  .app-admin-badge{border-radius:999px;background:#F1F5F9;color:#475569;padding:5px 8px;font-size:9px;font-weight:900}
  .app-admin-badge.warning{background:#FFF7ED;color:#C2410C}
  .app-admin-badge.danger{background:#FEF2F2;color:#B91C1C}
  .app-admin-add{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:12px;padding:18px;border-bottom:1px solid #F1F5F9;background:#F8FAFC}
  .app-admin-add.full{grid-template-columns:repeat(4,minmax(0,1fr))}
  .app-admin-add-wide{grid-column:1/-1}
  .app-admin-switch{display:flex;align-items:center;gap:8px;min-height:42px;color:#334155;font-size:11px;font-weight:800}
  .app-admin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
  .brush-card{border:1px solid #E2E8F0;border-radius:18px;background:#fff;padding:14px}
  .brush-head{display:flex;gap:12px;align-items:center}
  .brush-thumb{width:70px;height:70px;flex:0 0 70px;overflow:hidden;display:grid;place-items:center;border:1px solid #E2E8F0;border-radius:16px;background:#F8FAFC;color:#64748B;font-size:24px;font-weight:900}
  .brush-thumb img{width:100%;height:100%;object-fit:cover}
  .brush-meta{min-width:0;flex:1}
  .brush-name{overflow:hidden;color:#0F172A;font-size:14px;font-weight:900;text-overflow:ellipsis;white-space:nowrap}
  .brush-file{margin-top:4px;overflow:hidden;color:#94A3B8;font-size:9px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}
  .brush-settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}
  .brush-toolbar{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
  .app-admin-empty{padding:28px;text-align:center;color:#64748B;font-size:12px;font-weight:800}
  @media(max-width:760px){.app-admin-profile{grid-template-columns:110px 1fr}.app-admin-add,.app-admin-add.full{grid-template-columns:1fr 1fr}.app-admin-profile-btn,.app-admin-drop{min-height:110px}.app-admin-preview{width:88px;height:88px}.app-admin-grid{grid-template-columns:1fr}}
  @media(max-width:520px){.app-admin-profile,.app-admin-add,.app-admin-add.full{grid-template-columns:1fr}.app-admin-preview{width:100px;height:100px}}
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

async function request(path, options = {}) {
  const token = getAdminToken()

  if (!token) {
    throw new Error('Admin login required')
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

function validImage(file) {
  return (
    file &&
    IMAGE_TYPES.has(String(file.type || '')) &&
    file.size <= MAX_UPLOAD_BYTES
  )
}

function fileExtension(file) {
  return String(file?.name || '')
    .split('.')
    .pop()
    ?.toLowerCase()
}

function BrushCard({
  brush,
  busyKey,
  onSave,
  onDelete,
  onReplaceFile,
  onReplaceThumbnail,
  onRemoveThumbnail,
}) {
  const [name, setName] = useState(brush.name || '')
  const [active, setActive] = useState(Boolean(brush.active))
  const [sortOrder, setSortOrder] = useState(Number(brush.sortOrder || 0))
  const [size, setSize] = useState(Number(brush.settings?.size || 40))
  const [opacity, setOpacity] = useState(Number(brush.settings?.opacity || 100))
  const [spacing, setSpacing] = useState(Number(brush.settings?.spacing || 10))
  const [hardness, setHardness] = useState(Number(brush.settings?.hardness ?? 100))
  const fileRef = useRef(null)
  const thumbnailRef = useRef(null)
  const busy = busyKey === brush.id
  const preview =
    brush.thumbnailUrl ||
    (brush.sourceType === 'image' ? brush.fileUrl : '')

  useEffect(() => {
    setName(brush.name || '')
    setActive(Boolean(brush.active))
    setSortOrder(Number(brush.sortOrder || 0))
    setSize(Number(brush.settings?.size || 40))
    setOpacity(Number(brush.settings?.opacity || 100))
    setSpacing(Number(brush.settings?.spacing || 10))
    setHardness(Number(brush.settings?.hardness ?? 100))
  }, [brush])

  return (
    <article className="brush-card">
      <div className="brush-head">
        <div className="brush-thumb">
          {preview ? (
            <img src={preview} alt={brush.name} />
          ) : brush.sourceType === 'abr' ? (
            'ABR'
          ) : (
            brush.name?.charAt(0)?.toUpperCase() || 'B'
          )}
        </div>

        <div className="brush-meta">
          <div className="brush-name">{brush.name}</div>
          <div className="app-admin-badges" style={{ marginTop: 6 }}>
            <span className="app-admin-badge">
              {String(brush.sourceType || '').toUpperCase()}
            </span>
            <span className="app-admin-badge">
              v{brush.version}
            </span>
            {!brush.active ? (
              <span className="app-admin-badge warning">
                Disabled
              </span>
            ) : null}
          </div>
          <div className="brush-file">
            {brush.originalFileName}
          </div>
        </div>
      </div>

      <div className="app-admin-field">
        <span className="app-admin-label">BRUSH NAME</span>
        <input
          className="app-admin-input"
          value={name}
          maxLength={100}
          disabled={busy}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="brush-settings">
        <label className="app-admin-field">
          <span className="app-admin-label">SIZE</span>
          <input
            className="app-admin-input"
            type="number"
            min="1"
            max="500"
            value={size}
            disabled={busy}
            onChange={(event) => setSize(event.target.value)}
          />
        </label>

        <label className="app-admin-field">
          <span className="app-admin-label">OPACITY</span>
          <input
            className="app-admin-input"
            type="number"
            min="1"
            max="100"
            value={opacity}
            disabled={busy}
            onChange={(event) => setOpacity(event.target.value)}
          />
        </label>

        <label className="app-admin-field">
          <span className="app-admin-label">SPACING</span>
          <input
            className="app-admin-input"
            type="number"
            min="1"
            max="500"
            value={spacing}
            disabled={busy}
            onChange={(event) => setSpacing(event.target.value)}
          />
        </label>

        <label className="app-admin-field">
          <span className="app-admin-label">HARDNESS</span>
          <input
            className="app-admin-input"
            type="number"
            min="0"
            max="100"
            value={hardness}
            disabled={busy}
            onChange={(event) => setHardness(event.target.value)}
          />
        </label>
      </div>

      <div className="brush-settings">
        <label className="app-admin-field">
          <span className="app-admin-label">SORT ORDER</span>
          <input
            className="app-admin-input"
            type="number"
            value={sortOrder}
            disabled={busy}
            onChange={(event) => setSortOrder(event.target.value)}
          />
        </label>

        <label className="app-admin-switch">
          <input
            type="checkbox"
            checked={active}
            disabled={busy}
            onChange={(event) => setActive(event.target.checked)}
          />
          Enabled
        </label>
      </div>

      <input
        ref={fileRef}
        className="app-admin-file"
        type="file"
        accept={brush.sourceType === 'abr' ? '.abr' : 'image/*'}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) {
            onReplaceFile(
              brush,
              file,
              brush.sourceType
            )
          }
        }}
      />

      <input
        ref={thumbnailRef}
        className="app-admin-file"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onReplaceThumbnail(brush, file)
        }}
      />

      <div className="brush-toolbar">
        <button
          type="button"
          className="app-admin-btn primary"
          disabled={busy || !String(name).trim()}
          onClick={() =>
            onSave(brush, {
              name: String(name).trim(),
              active,
              sortOrder: Number(sortOrder || 0),
              settings: {
                size: Number(size || 40),
                opacity: Number(opacity || 100),
                spacing: Number(spacing || 10),
                hardness: Number(hardness || 0),
              },
            })
          }
        >
          Save
        </button>

        <button
          type="button"
          className="app-admin-btn"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          Replace File
        </button>

        <button
          type="button"
          className="app-admin-btn"
          disabled={busy}
          onClick={() => thumbnailRef.current?.click()}
        >
          {brush.thumbnailUrl
            ? 'Replace Thumbnail'
            : 'Add Thumbnail'}
        </button>

        {brush.thumbnailUrl ? (
          <button
            type="button"
            className="app-admin-btn warning"
            disabled={busy}
            onClick={() => onRemoveThumbnail(brush)}
          >
            Remove Thumbnail
          </button>
        ) : null}

        <button
          type="button"
          className="app-admin-btn danger"
          disabled={busy}
          onClick={() => onDelete(brush)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}

export default function AdminAppPage() {
  const [app, setApp] = useState(null)
  const [brushes, setBrushes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [profileFile, setProfileFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState('')
  const [showAddBrush, setShowAddBrush] = useState(false)
  const [brushName, setBrushName] = useState('')
  const [sourceType, setSourceType] = useState('image')
  const [brushFile, setBrushFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [sortOrder, setSortOrder] = useState(0)
  const [size, setSize] = useState(40)
  const [opacity, setOpacity] = useState(100)
  const [spacing, setSpacing] = useState(10)
  const [hardness, setHardness] = useState(100)
  const [active, setActive] = useState(true)
  const profileInputRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await request(
        `/api/admin/apps/${APP_KEY}`
      )
      setApp(data.app || null)
      setBrushes(
        Array.isArray(data.brushes) ? data.brushes : []
      )
      setName(data.app?.name || '')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    return () => {
      if (profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview)
      }
    }
  }, [profilePreview])

  function replaceBrush(updated) {
    setBrushes((current) =>
      current
        .map((item) =>
          item.id === updated.id ? updated : item
        )
        .sort(
          (a, b) =>
            Number(a.sortOrder || 0) -
            Number(b.sortOrder || 0)
        )
    )
  }

  function stageProfile(file) {
    if (!validImage(file)) {
      setError('Use a supported image up to 25 MB.')
      return
    }

    if (profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview)
    }

    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
    setError('')
  }

  async function saveApp(patch, message) {
    setBusyKey('app')
    setNotice('')
    setError('')

    try {
      const data = await request(
        `/api/admin/apps/${APP_KEY}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        }
      )
      setApp(data.app)
      setName(data.app.name)
      setNotice(message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function uploadProfile() {
    if (!profileFile) return

    setBusyKey('app')
    setNotice('')
    setError('')

    try {
      const form = new FormData()
      form.append('profile', profileFile)

      const data = await request(
        `/api/admin/apps/${APP_KEY}/profile`,
        {
          method: 'POST',
          body: form,
        }
      )

      setApp(data.app)
      setProfileFile(null)
      if (profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview)
      }
      setProfilePreview('')
      setNotice('App profile updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function removeProfile() {
    setBusyKey('app')
    setNotice('')
    setError('')

    try {
      const data = await request(
        `/api/admin/apps/${APP_KEY}/profile`,
        { method: 'DELETE' }
      )
      setApp(data.app)
      setNotice('App profile removed.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  function resetBrushForm() {
    setBrushName('')
    setSourceType('image')
    setBrushFile(null)
    setThumbnailFile(null)
    setSortOrder(0)
    setSize(40)
    setOpacity(100)
    setSpacing(10)
    setHardness(100)
    setActive(true)
  }

  async function createBrush() {
    const cleanName = brushName.trim()

    if (!cleanName || !brushFile) {
      setError('Brush name and brush file are required.')
      return
    }

    if (brushFile.size > MAX_UPLOAD_BYTES) {
      setError('Brush file must be 25 MB or smaller.')
      return
    }

    if (
      sourceType === 'abr' &&
      fileExtension(brushFile) !== 'abr'
    ) {
      setError('Photoshop brush must use .abr.')
      return
    }

    if (
      sourceType === 'image' &&
      !IMAGE_TYPES.has(String(brushFile.type || ''))
    ) {
      setError('Image brush must be an image file.')
      return
    }

    if (thumbnailFile && !validImage(thumbnailFile)) {
      setError('Thumbnail must be a supported image up to 25 MB.')
      return
    }

    setBusyKey('new-brush')
    setNotice('')
    setError('')

    try {
      const form = new FormData()
      form.append('name', cleanName)
      form.append('sourceType', sourceType)
      form.append('brushFile', brushFile)
      form.append('active', String(active))
      form.append('sortOrder', String(sortOrder))
      form.append('size', String(size))
      form.append('opacity', String(opacity))
      form.append('spacing', String(spacing))
      form.append('hardness', String(hardness))

      if (thumbnailFile) {
        form.append('thumbnail', thumbnailFile)
      }

      const data = await request(
        `/api/admin/apps/${APP_KEY}/brushes`,
        {
          method: 'POST',
          body: form,
        }
      )

      setBrushes((current) =>
        [...current, data.brush].sort(
          (a, b) =>
            Number(a.sortOrder || 0) -
            Number(b.sortOrder || 0)
        )
      )
      resetBrushForm()
      setShowAddBrush(false)
      setNotice('Brush added.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function saveBrush(brush, patch) {
    setBusyKey(brush.id)
    setNotice('')
    setError('')

    try {
      const data = await request(
        `/api/admin/apps/${APP_KEY}/brushes/${brush.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        }
      )
      replaceBrush(data.brush)
      setNotice('Brush updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function replaceBrushFile(brush, file, type) {
    if (!file || file.size > MAX_UPLOAD_BYTES) {
      setError('Brush file must be 25 MB or smaller.')
      return
    }

    setBusyKey(brush.id)
    setNotice('')
    setError('')

    try {
      const form = new FormData()
      form.append('sourceType', type)
      form.append('brushFile', file)

      const data = await request(
        `/api/admin/apps/${APP_KEY}/brushes/${brush.id}/file`,
        {
          method: 'POST',
          body: form,
        }
      )
      replaceBrush(data.brush)
      setNotice('Brush file replaced.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function replaceThumbnail(brush, file) {
    if (!validImage(file)) {
      setError('Use a supported image up to 25 MB.')
      return
    }

    setBusyKey(brush.id)
    setNotice('')
    setError('')

    try {
      const form = new FormData()
      form.append('thumbnail', file)

      const data = await request(
        `/api/admin/apps/${APP_KEY}/brushes/${brush.id}/thumbnail`,
        {
          method: 'POST',
          body: form,
        }
      )
      replaceBrush(data.brush)
      setNotice('Brush thumbnail updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function removeThumbnail(brush) {
    setBusyKey(brush.id)
    setNotice('')
    setError('')

    try {
      const data = await request(
        `/api/admin/apps/${APP_KEY}/brushes/${brush.id}/thumbnail`,
        { method: 'DELETE' }
      )
      replaceBrush(data.brush)
      setNotice('Brush thumbnail removed.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  async function deleteBrush(brush) {
    if (!window.confirm(`Delete "${brush.name}"?`)) return

    setBusyKey(brush.id)
    setNotice('')
    setError('')

    try {
      await request(
        `/api/admin/apps/${APP_KEY}/brushes/${brush.id}`,
        { method: 'DELETE' }
      )
      setBrushes((current) =>
        current.filter((item) => item.id !== brush.id)
      )
      setNotice('Brush deleted.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyKey('')
    }
  }

  if (loading) {
    return (
      <AdminLayout
        title="App"
        subtitle="Manage Shadow applications and Studio assets."
      >
        <style>{styles}</style>
        <div className="app-admin-status">
          Loading Shadow Studio...
        </div>
      </AdminLayout>
    )
  }

  const visibleProfile = profilePreview || app?.profile || ''
  const appBusy = busyKey === 'app'

  return (
    <AdminLayout
      title="App"
      subtitle="Manage Shadow Studio profile and brush library."
    >
      <style>{styles}</style>

      <div className="app-admin-page">
        {notice ? (
          <div className="app-admin-status">{notice}</div>
        ) : null}

        {error ? (
          <div className="app-admin-status error">{error}</div>
        ) : null}

        <section className="app-admin-card">
          <div className="app-admin-head">
            <div>
              <h2 className="app-admin-title">
                Shadow Studio
              </h2>
              <div className="app-admin-copy">
                App profile shown to readers when the App page is connected.
              </div>
            </div>

            <div className="app-admin-badges">
              <span className="app-admin-badge">
                App key: {APP_KEY}
              </span>
              {app?.hidden ? (
                <span className="app-admin-badge warning">
                  Hidden
                </span>
              ) : null}
              {app?.disabled ? (
                <span className="app-admin-badge danger">
                  Disabled
                </span>
              ) : null}
            </div>
          </div>

          <div className="app-admin-body">
            <div className="app-admin-profile">
              <ImageDropZone
                className="app-admin-drop"
                label="Drop app image here"
                disabled={appBusy}
                onFiles={(list) => stageProfile(list[0])}
              >
                <button
                  type="button"
                  className="app-admin-profile-btn"
                  disabled={appBusy}
                  onClick={() =>
                    profileInputRef.current?.click()
                  }
                >
                  <div className="app-admin-preview">
                    {visibleProfile ? (
                      <img
                        src={visibleProfile}
                        alt={app?.name || 'Shadow Studio'}
                      />
                    ) : (
                      'SS'
                    )}
                  </div>
                </button>
              </ImageDropZone>

              <div>
                <div className="app-admin-field">
                  <span className="app-admin-label">
                    APP NAME
                  </span>
                  <input
                    className="app-admin-input"
                    value={name}
                    maxLength={100}
                    disabled={appBusy}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                  />
                </div>

                <div className="app-admin-actions">
                  <button
                    type="button"
                    className="app-admin-btn primary"
                    disabled={
                      appBusy ||
                      !name.trim() ||
                      name.trim() === app?.name
                    }
                    onClick={() =>
                      saveApp(
                        { name: name.trim() },
                        'App name updated.'
                      )
                    }
                  >
                    Save Name
                  </button>

                  <button
                    type="button"
                    className="app-admin-btn"
                    disabled={appBusy}
                    onClick={() =>
                      profileInputRef.current?.click()
                    }
                  >
                    Choose Image
                  </button>

                  {profileFile ? (
                    <button
                      type="button"
                      className="app-admin-btn primary"
                      disabled={appBusy}
                      onClick={uploadProfile}
                    >
                      Upload Image
                    </button>
                  ) : null}

                  {app?.profile && !profileFile ? (
                    <button
                      type="button"
                      className="app-admin-btn danger"
                      disabled={appBusy}
                      onClick={removeProfile}
                    >
                      Remove Image
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className={`app-admin-btn ${
                      app?.hidden ? 'primary' : 'warning'
                    }`}
                    disabled={appBusy}
                    onClick={() =>
                      saveApp(
                        { hidden: !app?.hidden },
                        app?.hidden
                          ? 'App is visible.'
                          : 'App is hidden.'
                      )
                    }
                  >
                    {app?.hidden ? 'Show App' : 'Hide App'}
                  </button>

                  <button
                    type="button"
                    className={`app-admin-btn ${
                      app?.disabled ? 'primary' : 'danger'
                    }`}
                    disabled={appBusy}
                    onClick={() =>
                      saveApp(
                        { disabled: !app?.disabled },
                        app?.disabled
                          ? 'App enabled.'
                          : 'App disabled.'
                      )
                    }
                  >
                    {app?.disabled
                      ? 'Enable App'
                      : 'Disable App'}
                  </button>
                </div>

                <input
                  ref={profileInputRef}
                  className="app-admin-file"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (file) stageProfile(file)
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="app-admin-card">
          <div className="app-admin-head">
            <div>
              <h2 className="app-admin-title">
                Brush Library
              </h2>
              <div className="app-admin-copy">
                Add image brushes now and store Photoshop .ABR files for the Studio brush importer.
              </div>
            </div>

            <button
              type="button"
              className="app-admin-btn primary"
              onClick={() =>
                setShowAddBrush((current) => !current)
              }
            >
              {showAddBrush ? 'Close' : '+ Add Brush'}
            </button>
          </div>

          {showAddBrush ? (
            <>
              <div className="app-admin-add">
                <label className="app-admin-field">
                  <span className="app-admin-label">
                    BRUSH NAME
                  </span>
                  <input
                    className="app-admin-input"
                    value={brushName}
                    maxLength={100}
                    onChange={(event) =>
                      setBrushName(event.target.value)
                    }
                  />
                </label>

                <label className="app-admin-field">
                  <span className="app-admin-label">
                    SOURCE TYPE
                  </span>
                  <select
                    className="app-admin-select"
                    value={sourceType}
                    onChange={(event) => {
                      setSourceType(event.target.value)
                      setBrushFile(null)
                    }}
                  >
                    <option value="image">
                      Image Brush
                    </option>
                    <option value="abr">
                      Photoshop ABR
                    </option>
                  </select>
                </label>

                <label className="app-admin-field">
                  <span className="app-admin-label">
                    SORT ORDER
                  </span>
                  <input
                    className="app-admin-input"
                    type="number"
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value)
                    }
                  />
                </label>

                <label className="app-admin-field app-admin-add-wide">
                  <span className="app-admin-label">
                    BRUSH FILE
                  </span>
                  <input
                    className="app-admin-input"
                    type="file"
                    accept={
                      sourceType === 'abr'
                        ? '.abr'
                        : 'image/*'
                    }
                    onChange={(event) =>
                      setBrushFile(
                        event.target.files?.[0] || null
                      )
                    }
                  />
                </label>

                <label className="app-admin-field app-admin-add-wide">
                  <span className="app-admin-label">
                    THUMBNAIL OPTIONAL
                  </span>
                  <input
                    className="app-admin-input"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setThumbnailFile(
                        event.target.files?.[0] || null
                      )
                    }
                  />
                </label>
              </div>

              <div className="app-admin-add full">
                <label className="app-admin-field">
                  <span className="app-admin-label">SIZE</span>
                  <input
                    className="app-admin-input"
                    type="number"
                    min="1"
                    max="500"
                    value={size}
                    onChange={(event) =>
                      setSize(event.target.value)
                    }
                  />
                </label>

                <label className="app-admin-field">
                  <span className="app-admin-label">
                    OPACITY
                  </span>
                  <input
                    className="app-admin-input"
                    type="number"
                    min="1"
                    max="100"
                    value={opacity}
                    onChange={(event) =>
                      setOpacity(event.target.value)
                    }
                  />
                </label>

                <label className="app-admin-field">
                  <span className="app-admin-label">
                    SPACING
                  </span>
                  <input
                    className="app-admin-input"
                    type="number"
                    min="1"
                    max="500"
                    value={spacing}
                    onChange={(event) =>
                      setSpacing(event.target.value)
                    }
                  />
                </label>

                <label className="app-admin-field">
                  <span className="app-admin-label">
                    HARDNESS
                  </span>
                  <input
                    className="app-admin-input"
                    type="number"
                    min="0"
                    max="100"
                    value={hardness}
                    onChange={(event) =>
                      setHardness(event.target.value)
                    }
                  />
                </label>

                <label className="app-admin-switch app-admin-add-wide">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(event) =>
                      setActive(event.target.checked)
                    }
                  />
                  Enabled after upload
                </label>

                <div className="app-admin-actions app-admin-add-wide">
                  <button
                    type="button"
                    className="app-admin-btn primary"
                    disabled={busyKey === 'new-brush'}
                    onClick={createBrush}
                  >
                    {busyKey === 'new-brush'
                      ? 'Uploading...'
                      : 'Add Brush'}
                  </button>

                  <button
                    type="button"
                    className="app-admin-btn"
                    disabled={busyKey === 'new-brush'}
                    onClick={resetBrushForm}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          ) : null}

          <div className="app-admin-body">
            {brushes.length ? (
              <div className="app-admin-grid">
                {brushes.map((brush) => (
                  <BrushCard
                    key={brush.id}
                    brush={brush}
                    busyKey={busyKey}
                    onSave={saveBrush}
                    onDelete={deleteBrush}
                    onReplaceFile={replaceBrushFile}
                    onReplaceThumbnail={replaceThumbnail}
                    onRemoveThumbnail={removeThumbnail}
                  />
                ))}
              </div>
            ) : (
              <div className="app-admin-empty">
                No brushes yet. Add your first brush.
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
