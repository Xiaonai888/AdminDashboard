import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const APP_KEY = 'shadow-fx'
const ACCEPTED_IMAGES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])

async function request(path, options = {}) {
  const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
  if (!token) throw new Error('Admin login required.')
  const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.ok === false) throw new Error(body.message || 'Request failed.')
  return body
}

export default function AdminShadowFXProfile() {
  const [app, setApp] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const imageInput = useRef(null)

  useEffect(() => {
    let active = true
    request(`/api/admin/apps/${APP_KEY}`)
      .then((data) => {
        if (!active) return
        setApp(data.app || null)
        setName(data.app?.name || 'Shadow FX')
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  function stageImage(file) {
    if (!file) return
    if (!ACCEPTED_IMAGES.has(file.type) || file.size > 25 * 1024 * 1024) {
      setError('Choose a PNG, JPG, WEBP, GIF or AVIF image up to 25 MB.')
      return
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
    setNotice('')
  }

  async function run(action, successText) {
    if (busy || !app) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await action()
      if (!data.app) throw new Error('The server did not return updated app settings.')
      setApp(data.app)
      setName(data.app.name || 'Shadow FX')
      if (successText === 'Image uploaded.' || successText === 'Image removed.') {
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImageFile(null)
        setImagePreview('')
      }
      setNotice(successText)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function patch(fields, successText) {
    return run(
      () => request(`/api/admin/apps/${APP_KEY}`, {
        method: 'PATCH',
        body: JSON.stringify(fields),
      }),
      successText
    )
  }

  function uploadImage() {
    if (!imageFile) return
    const form = new FormData()
    form.append('profile', imageFile)
    return run(
      () => request(`/api/admin/apps/${APP_KEY}/profile`, {
        method: 'POST',
        body: form,
      }),
      'Image uploaded.'
    )
  }

  const preview = imagePreview || app?.profile || ''

  return (
    <section className="shadow-fx-admin-card">
      <style>{`
        .shadow-fx-admin-card{overflow:hidden;border:1px solid #ddd6fe;border-radius:22px;background:#fff;box-shadow:0 8px 28px rgba(76,29,149,.07)}
        .shadow-fx-admin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #ede9fe}
        .shadow-fx-admin-title{margin:0;color:#1e1538;font-size:18px;font-weight:900}
        .shadow-fx-admin-copy{margin-top:5px;color:#776c91;font-size:11px;font-weight:650;line-height:1.6}
        .shadow-fx-admin-tags{display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap}
        .shadow-fx-admin-tag{padding:6px 9px;border-radius:999px;background:#ecfdf5;color:#16794a;font-size:10px;font-weight:850}
        .shadow-fx-admin-tag.off{background:#fff7ed;color:#b45309}
        .shadow-fx-admin-tag.stop{background:#fff1f2;color:#be123c}
        .shadow-fx-admin-body{display:grid;grid-template-columns:142px minmax(0,1fr);gap:22px;padding:22px}
        .shadow-fx-admin-image{width:136px;height:136px;display:grid;place-items:center;overflow:hidden;border:1px solid #d8b4fe;border-radius:22px;background:linear-gradient(145deg,#f5f3ff,#ede9fe);color:#7c3aed;font-size:31px;font-weight:950}
        .shadow-fx-admin-image img{width:100%;height:100%;object-fit:cover}
        .shadow-fx-admin-label{display:block;margin-bottom:8px;color:#66567f;font-size:10px;font-weight:900;letter-spacing:.08em}
        .shadow-fx-admin-input{display:block;width:100%;height:44px;padding:0 13px;border:1px solid #ddd6fe;border-radius:11px;outline:0;background:#fff;color:#251a37;font-size:13px;font-weight:700}
        .shadow-fx-admin-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
        .shadow-fx-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
        .shadow-fx-admin-btn{height:40px;padding:0 13px;border:1px solid #ddd6fe;border-radius:10px;background:#fff;color:#5b4b73;font-size:11px;font-weight:850;cursor:pointer}
        .shadow-fx-admin-btn.primary{border-color:#7c3aed;background:#7c3aed;color:#fff}
        .shadow-fx-admin-btn.warning{border-color:#fed7aa;background:#fff7ed;color:#b45309}
        .shadow-fx-admin-btn.danger{border-color:#fecdd3;background:#fff1f2;color:#be123c}
        .shadow-fx-admin-btn:disabled{opacity:.5;cursor:not-allowed}
        .shadow-fx-admin-hint{margin:13px 0 0;color:#8a8099;font-size:11px;line-height:1.6}
        .shadow-fx-admin-message{margin:0 22px 18px;padding:11px 13px;border-radius:11px;background:#ecfdf5;color:#16794a;font-size:12px;font-weight:750}
        .shadow-fx-admin-message.error{background:#fff1f2;color:#be123c}
        .shadow-fx-admin-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        @media(max-width:630px){.shadow-fx-admin-head{flex-direction:column}.shadow-fx-admin-body{grid-template-columns:1fr;gap:14px}.shadow-fx-admin-image{width:116px;height:116px}}
      `}</style>

      <div className="shadow-fx-admin-head">
        <div>
          <h2 className="shadow-fx-admin-title">Shadow FX</h2>
          <p className="shadow-fx-admin-copy">Local photo effects editor · App key: shadow-fx</p>
        </div>

        {app ? (
          <div className="shadow-fx-admin-tags">
            <span className={`shadow-fx-admin-tag ${app.hidden ? 'off' : ''}`}>
              {app.hidden ? 'Hidden' : 'Visible'}
            </span>
            <span className={`shadow-fx-admin-tag ${app.disabled ? 'stop' : ''}`}>
              {app.disabled ? 'Disabled' : 'Enabled'}
            </span>
          </div>
        ) : null}
      </div>

      {loading ? <p className="shadow-fx-admin-message">Loading Shadow FX…</p> : null}
      {error ? <p className="shadow-fx-admin-message error" role="alert">{error}</p> : null}
      {notice ? <p className="shadow-fx-admin-message" role="status">{notice}</p> : null}

      {app ? (
        <div className="shadow-fx-admin-body">
          <button
            type="button"
            className="shadow-fx-admin-image"
            disabled={busy}
            onClick={() => imageInput.current?.click()}
          >
            {preview ? <img src={preview} alt={app.name || 'Shadow FX'} /> : <span>FX</span>}
          </button>

          <div>
            <label className="shadow-fx-admin-label" htmlFor="shadow-fx-admin-name">APP NAME</label>
            <input
              id="shadow-fx-admin-name"
              className="shadow-fx-admin-input"
              value={name}
              maxLength={100}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />

            <div className="shadow-fx-admin-actions">
              <button
                type="button"
                className="shadow-fx-admin-btn primary"
                disabled={busy || !name.trim() || name.trim() === app.name}
                onClick={() => patch({ name: name.trim() }, 'Name saved.')}
              >
                Save Name
              </button>

              <button
                type="button"
                className="shadow-fx-admin-btn"
                disabled={busy}
                onClick={() => imageInput.current?.click()}
              >
                Choose Image
              </button>

              {imageFile ? (
                <>
                  <button type="button" className="shadow-fx-admin-btn primary" disabled={busy} onClick={uploadImage}>
                    Upload Image
                  </button>
                  <button
                    type="button"
                    className="shadow-fx-admin-btn"
                    disabled={busy}
                    onClick={() => {
                      if (imagePreview) URL.revokeObjectURL(imagePreview)
                      setImageFile(null)
                      setImagePreview('')
                    }}
                  >
                    Cancel Image
                  </button>
                </>
              ) : null}

              {app.profile && !imageFile ? (
                <button
                  type="button"
                  className="shadow-fx-admin-btn danger"
                  disabled={busy}
                  onClick={() => run(
                    () => request(`/api/admin/apps/${APP_KEY}/profile`, { method: 'DELETE' }),
                    'Image removed.'
                  )}
                >
                  Remove Image
                </button>
              ) : null}

              <button
                type="button"
                className={`shadow-fx-admin-btn ${app.hidden ? 'primary' : 'warning'}`}
                disabled={busy}
                onClick={() => patch(
                  { hidden: !app.hidden },
                  app.hidden ? 'App shown.' : 'App hidden.'
                )}
              >
                {app.hidden ? 'Show App' : 'Hide App'}
              </button>

              <button
                type="button"
                className={`shadow-fx-admin-btn ${app.disabled ? 'primary' : 'danger'}`}
                disabled={busy}
                onClick={() => patch(
                  { disabled: !app.disabled },
                  app.disabled ? 'App enabled.' : 'App disabled.'
                )}
              >
                {app.disabled ? 'Enable App' : 'Disable App'}
              </button>
            </div>

            <p className="shadow-fx-admin-hint">
              Hide removes Shadow FX from Me &gt; App. Disable blocks access without deleting any locally edited photos on the reader device.
            </p>

            <input
              ref={imageInput}
              className="shadow-fx-admin-sr"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              onChange={(event) => {
                stageImage(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
