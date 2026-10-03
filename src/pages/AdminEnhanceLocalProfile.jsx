import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const APP_KEY = 'enhance-local'
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

export default function AdminEnhanceLocalProfile() {
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
        setName(data.app?.name || 'Enhance Local')
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
      setName(data.app.name || 'Enhance Local')
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
    <section className="enhance-admin-card">
      <style>{`
        .enhance-admin-card{overflow:hidden;border:1px solid #f0d8df;border-radius:22px;background:#fff;box-shadow:0 8px 28px #3f0b180a}
        .enhance-admin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #f8e9ed}
        .enhance-admin-title{margin:0;color:#26161b;font-size:18px;font-weight:900}
        .enhance-admin-copy{margin-top:5px;color:#8a6a73;font-size:11px;font-weight:650;line-height:1.6}
        .enhance-admin-tags{display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap}
        .enhance-admin-tag{padding:6px 9px;border-radius:999px;background:#edf8f1;color:#287149;font-size:10px;font-weight:850}
        .enhance-admin-tag.off{background:#fff4e8;color:#a85a1d}
        .enhance-admin-tag.stop{background:#ffedf1;color:#b42345}
        .enhance-admin-body{display:grid;grid-template-columns:142px minmax(0,1fr);gap:22px;padding:22px}
        .enhance-admin-image{width:136px;height:136px;display:grid;place-items:center;overflow:hidden;border:1px solid #f1c8d2;border-radius:22px;background:linear-gradient(145deg,#fff0f3,#f8c4d0);color:#e11d48;font-size:31px;font-weight:950}
        .enhance-admin-image img{width:100%;height:100%;object-fit:cover}
        .enhance-admin-label{display:block;margin-bottom:8px;color:#76545d;font-size:10px;font-weight:900;letter-spacing:.08em}
        .enhance-admin-input{display:block;width:100%;height:44px;padding:0 13px;border:1px solid #e7cdd4;border-radius:11px;outline:0;background:#fff;color:#2d1d22;font-size:13px;font-weight:700}
        .enhance-admin-input:focus{border-color:#e11d48;box-shadow:0 0 0 3px #e11d4818}
        .enhance-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
        .enhance-admin-btn{height:40px;padding:0 13px;border:1px solid #ead4da;border-radius:10px;background:#fff;color:#65434c;font-size:11px;font-weight:850;cursor:pointer}
        .enhance-admin-btn.primary{border-color:#e11d48;background:#e11d48;color:#fff}
        .enhance-admin-btn.warning{border-color:#ffd4aa;background:#fff5e9;color:#a4521b}
        .enhance-admin-btn.danger{border-color:#ffc3cf;background:#fff0f3;color:#b42345}
        .enhance-admin-btn:disabled{opacity:.5;cursor:not-allowed}
        .enhance-admin-hint{margin:13px 0 0;color:#918087;font-size:11px;line-height:1.6}
        .enhance-admin-message{margin:0 22px 18px;padding:11px 13px;border-radius:11px;background:#eef8f2;color:#256447;font-size:12px;font-weight:750}
        .enhance-admin-message.error{background:#fff0f3;color:#b42345}
        .enhance-admin-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        @media(max-width:630px){.enhance-admin-head{flex-direction:column}.enhance-admin-body{grid-template-columns:1fr;gap:14px}.enhance-admin-image{width:116px;height:116px}}
      `}</style>

      <div className="enhance-admin-head">
        <div>
          <h2 className="enhance-admin-title">Enhance Local</h2>
          <p className="enhance-admin-copy">Local image enhancement app · App key: enhance-local</p>
        </div>

        {app ? (
          <div className="enhance-admin-tags">
            <span className={`enhance-admin-tag ${app.hidden ? 'off' : ''}`}>
              {app.hidden ? 'Hidden' : 'Visible'}
            </span>
            <span className={`enhance-admin-tag ${app.disabled ? 'stop' : ''}`}>
              {app.disabled ? 'Disabled' : 'Enabled'}
            </span>
          </div>
        ) : null}
      </div>

      {loading ? <p className="enhance-admin-message">Loading Enhance Local…</p> : null}
      {error ? <p className="enhance-admin-message error" role="alert">{error}</p> : null}
      {notice ? <p className="enhance-admin-message" role="status">{notice}</p> : null}

      {app ? (
        <div className="enhance-admin-body">
          <button
            type="button"
            className="enhance-admin-image"
            disabled={busy}
            onClick={() => imageInput.current?.click()}
          >
            {preview ? <img src={preview} alt={app.name || 'Enhance Local'} /> : <span>EL</span>}
          </button>

          <div>
            <label className="enhance-admin-label" htmlFor="enhance-admin-name">APP NAME</label>
            <input
              id="enhance-admin-name"
              className="enhance-admin-input"
              value={name}
              maxLength={100}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />

            <div className="enhance-admin-actions">
              <button
                type="button"
                className="enhance-admin-btn primary"
                disabled={busy || !name.trim() || name.trim() === app.name}
                onClick={() => patch({ name: name.trim() }, 'Name saved.')}
              >
                Save Name
              </button>

              <button
                type="button"
                className="enhance-admin-btn"
                disabled={busy}
                onClick={() => imageInput.current?.click()}
              >
                Choose Image
              </button>

              {imageFile ? (
                <>
                  <button type="button" className="enhance-admin-btn primary" disabled={busy} onClick={uploadImage}>
                    Upload Image
                  </button>
                  <button
                    type="button"
                    className="enhance-admin-btn"
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
                  className="enhance-admin-btn danger"
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
                className={`enhance-admin-btn ${app.hidden ? 'primary' : 'warning'}`}
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
                className={`enhance-admin-btn ${app.disabled ? 'primary' : 'danger'}`}
                disabled={busy}
                onClick={() => patch(
                  { disabled: !app.disabled },
                  app.disabled ? 'App enabled.' : 'App disabled.'
                )}
              >
                {app.disabled ? 'Enable App' : 'Disable App'}
              </button>
            </div>

            <p className="enhance-admin-hint">
              Hide removes Enhance Local from Me &gt; App. Disable blocks access without deleting anything saved locally on the reader device.
            </p>

            <input
              ref={imageInput}
              className="enhance-admin-sr"
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
