import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const APP_KEY = 'pic-to-art'
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

export default function AdminPicToArtProfile() {
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
        setName(data.app?.name || 'Pic to Art')
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
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

      if (!data.app) {
        throw new Error('The server did not return updated app settings.')
      }

      setApp(data.app)
      setName(data.app.name || 'Pic to Art')

      if (successText === 'Image uploaded.' || successText === 'Image removed.') {
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImageFile(null)
        setImagePreview('')
      }

      setNotice(successText)
    } catch (requestError) {
      setError(requestError.message)
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
    <section className="pta-admin-card">
      <style>{`
        .pta-admin-card{overflow:hidden;border:1px solid #e6dcf8;border-radius:22px;background:#fff;box-shadow:0 8px 28px #2f15590a}
        .pta-admin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #f0eaf9}
        .pta-admin-title{margin:0;color:#241537;font-size:18px;font-weight:900}
        .pta-admin-copy{margin-top:5px;color:#7d6d8d;font-size:11px;font-weight:650;line-height:1.6}
        .pta-admin-tags{display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap}
        .pta-admin-tag{padding:6px 9px;border-radius:999px;background:#edf8f1;color:#287149;font-size:10px;font-weight:850}
        .pta-admin-tag.off{background:#fff4e8;color:#a85a1d}
        .pta-admin-tag.stop{background:#ffedf1;color:#b42345}
        .pta-admin-body{display:grid;grid-template-columns:142px minmax(0,1fr);gap:22px;padding:22px}
        .pta-admin-image{width:136px;height:136px;display:grid;place-items:center;overflow:hidden;border:1px solid #dbcaf6;border-radius:22px;background:linear-gradient(145deg,#f7f1ff,#d9c5ff);color:#6f3dc4;font-size:31px;font-weight:950}
        .pta-admin-image img{width:100%;height:100%;object-fit:cover}
        .pta-admin-label{display:block;margin-bottom:8px;color:#6f607c;font-size:10px;font-weight:900;letter-spacing:.08em}
        .pta-admin-input{display:block;width:100%;height:44px;padding:0 13px;border:1px solid #ddd2eb;border-radius:11px;outline:0;background:#fff;color:#2c2038;font-size:13px;font-weight:700}
        .pta-admin-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px #7c3aed18}
        .pta-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
        .pta-admin-btn{height:40px;padding:0 13px;border:1px solid #e2d8ef;border-radius:10px;background:#fff;color:#5f4f6d;font-size:11px;font-weight:850;cursor:pointer}
        .pta-admin-btn.primary{border-color:#7c3aed;background:#7c3aed;color:#fff}
        .pta-admin-btn.warning{border-color:#ffd4aa;background:#fff5e9;color:#a4521b}
        .pta-admin-btn.danger{border-color:#ffc3cf;background:#fff0f3;color:#b42345}
        .pta-admin-btn:disabled{opacity:.5;cursor:not-allowed}
        .pta-admin-hint{margin:13px 0 0;color:#8b7f95;font-size:11px;line-height:1.6}
        .pta-admin-message{margin:0 22px 18px;padding:11px 13px;border-radius:11px;background:#eef8f2;color:#256447;font-size:12px;font-weight:750}
        .pta-admin-message.error{background:#fff0f3;color:#b42345}
        .pta-admin-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        @media(max-width:630px){.pta-admin-head{flex-direction:column}.pta-admin-body{grid-template-columns:1fr;gap:14px}.pta-admin-image{width:116px;height:116px}}
      `}</style>

      <div className="pta-admin-head">
        <div>
          <h2 className="pta-admin-title">Pic to Art</h2>
          <p className="pta-admin-copy">Local photo to Manga & Art converter · App key: pic-to-art</p>
        </div>

        {app ? (
          <div className="pta-admin-tags">
            <span className={`pta-admin-tag ${app.hidden ? 'off' : ''}`}>
              {app.hidden ? 'Hidden' : 'Visible'}
            </span>
            <span className={`pta-admin-tag ${app.disabled ? 'stop' : ''}`}>
              {app.disabled ? 'Disabled' : 'Enabled'}
            </span>
          </div>
        ) : null}
      </div>

      {loading ? <p className="pta-admin-message">Loading Pic to Art…</p> : null}
      {error ? <p className="pta-admin-message error" role="alert">{error}</p> : null}
      {notice ? <p className="pta-admin-message" role="status">{notice}</p> : null}

      {app ? (
        <div className="pta-admin-body">
          <button
            type="button"
            className="pta-admin-image"
            disabled={busy}
            onClick={() => imageInput.current?.click()}
          >
            {preview ? <img src={preview} alt={app.name || 'Pic to Art'} /> : <span>PA</span>}
          </button>

          <div>
            <label className="pta-admin-label" htmlFor="pta-admin-name">APP NAME</label>
            <input
              id="pta-admin-name"
              className="pta-admin-input"
              value={name}
              maxLength={100}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />

            <div className="pta-admin-actions">
              <button
                type="button"
                className="pta-admin-btn primary"
                disabled={busy || !name.trim() || name.trim() === app.name}
                onClick={() => patch({ name: name.trim() }, 'Name saved.')}
              >
                Save Name
              </button>

              <button
                type="button"
                className="pta-admin-btn"
                disabled={busy}
                onClick={() => imageInput.current?.click()}
              >
                Choose Image
              </button>

              {imageFile ? (
                <>
                  <button
                    type="button"
                    className="pta-admin-btn primary"
                    disabled={busy}
                    onClick={uploadImage}
                  >
                    Upload Image
                  </button>

                  <button
                    type="button"
                    className="pta-admin-btn"
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
                  className="pta-admin-btn danger"
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
                className={`pta-admin-btn ${app.hidden ? 'primary' : 'warning'}`}
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
                className={`pta-admin-btn ${app.disabled ? 'primary' : 'danger'}`}
                disabled={busy}
                onClick={() => patch(
                  { disabled: !app.disabled },
                  app.disabled ? 'App enabled.' : 'App disabled.'
                )}
              >
                {app.disabled ? 'Enable App' : 'Disable App'}
              </button>
            </div>

            <p className="pta-admin-hint">
              Hide removes Pic to Art from Me &gt; App. Disable blocks Pic to Art routes through App Access Guard. Reader artwork and settings remain local on the reader device.
            </p>

            <input
              ref={imageInput}
              className="pta-admin-sr"
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
