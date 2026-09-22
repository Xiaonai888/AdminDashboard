import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const APP_KEY = 'shadow-docs'
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

export default function AdminDocsProfile({ studioApp }) {
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
      .then(data => { if (active) { setApp(data.app); setName(data.app?.name || 'Shadow Docs') } })
      .catch(err => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  function stageImage(file) {
    if (!file) return
    if (!ACCEPTED_IMAGES.has(file.type) || file.size > 25 * 1024 * 1024) {
      setError('Choose a PNG, JPG, WEBP, GIF or AVIF image up to 25 MB.')
      return
    }
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
      if (successText === 'Name saved.') setName(data.app.name)
      if (successText === 'Image uploaded.' || successText === 'Image removed.') {
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
    return run(() => request(`/api/admin/apps/${APP_KEY}`, { method: 'PATCH', body: JSON.stringify(fields) }), successText)
  }

  function uploadImage() {
    if (!imageFile) return
    const form = new FormData()
    form.append('profile', imageFile)
    return run(() => request(`/api/admin/apps/${APP_KEY}/profile`, { method: 'POST', body: form }), 'Image uploaded.')
  }

  const preview = imagePreview || app?.profile || ''
  const count = Number(Boolean(studioApp)) + Number(Boolean(app))
  const visible = Number(Boolean(studioApp && !studioApp.hidden)) + Number(Boolean(app && !app.hidden))
  const disabled = Number(Boolean(studioApp?.disabled)) + Number(Boolean(app?.disabled))

  return (
    <>
      <style>{`
        .docs-admin-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
        .docs-admin-stat{padding:15px 18px;background:#fff;border:1px solid #e9e6f1;border-radius:17px;box-shadow:0 7px 23px #211b3f07}
        .docs-admin-stat span{display:block;font-size:11px;font-weight:750;color:#777086}
        .docs-admin-stat strong{display:block;margin-top:8px;font-size:25px;font-weight:900;color:#473478}
        .docs-admin-card{overflow:hidden;border:1px solid #e7e3f0;border-radius:22px;background:#fff;box-shadow:0 8px 28px #211b3f0a}
        .docs-admin-heading{display:flex;justify-content:space-between;align-items:start;gap:12px;padding:20px 22px;border-bottom:1px solid #f0edf6}
        .docs-admin-heading h2{margin:0;font-size:18px;font-weight:900;color:#221d37}
        .docs-admin-heading p{margin:5px 0 0;color:#807a8c;font-size:11px;font-weight:650;line-height:1.6}
        .docs-admin-tags{display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap}
        .docs-admin-tag{display:inline-flex;align-items:center;padding:6px 9px;border-radius:100px;background:#e8f8ef;color:#25734e;font-size:10px;font-weight:850}
        .docs-admin-tag.off{background:#fff0e2;color:#a95316}
        .docs-admin-tag.stop{background:#ffedf0;color:#b1354b}
        .docs-admin-body{display:grid;grid-template-columns:142px minmax(0,1fr);gap:22px;padding:22px}
        .docs-admin-image{width:136px;height:136px;display:grid;place-items:center;overflow:hidden;border:1px solid #ded7ed;border-radius:22px;background:linear-gradient(145deg,#eee7ff,#aaa2e9);color:#6346b2;font-size:32px;font-weight:900}
        .docs-admin-image img{width:100%;height:100%;object-fit:cover}
        .docs-admin-label{display:block;margin-bottom:8px;color:#6f687d;font-size:10px;font-weight:900;letter-spacing:.08em}
        .docs-admin-input{display:block;width:100%;height:44px;padding:0 13px;border:1px solid #d9d3e4;border-radius:11px;outline:0;color:#29213d;background:#fff;font-size:13px;font-weight:700}
        .docs-admin-input:focus{border-color:#7958c2;box-shadow:0 0 0 3px #7958c21e}
        .docs-admin-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
        .docs-admin-btn{height:40px;padding:0 13px;border:1px solid #dfd8ec;border-radius:10px;background:#fff;color:#4f4664;font-size:11px;font-weight:850;cursor:pointer}
        .docs-admin-btn.primary{border-color:#7150bc;background:#7150bc;color:#fff}
        .docs-admin-btn.warning{border-color:#ffd6b0;background:#fff4e9;color:#a4521b}
        .docs-admin-btn.danger{border-color:#ffc4ce;background:#ffeff2;color:#b12c47}
        .docs-admin-btn:disabled{opacity:.5;cursor:not-allowed}
        .docs-admin-hint{margin:13px 0 0;color:#888294;font-size:11px;line-height:1.6}
        .docs-admin-message{margin:0 22px 18px;padding:11px 13px;border-radius:11px;background:#eef8f2;color:#256447;font-size:12px;font-weight:750}
        .docs-admin-message.error{background:#fff0f2;color:#ab2846}
        .docs-admin-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        @media(max-width:630px){.docs-admin-overview{gap:8px}.docs-admin-stat{padding:12px}.docs-admin-stat strong{font-size:21px}.docs-admin-heading{flex-direction:column}.docs-admin-body{grid-template-columns:1fr;gap:14px}.docs-admin-image{width:116px;height:116px}}
      `}</style>
      <section className="docs-admin-overview" aria-label="App summary">
        <div className="docs-admin-stat"><span>Total Apps</span><strong>{loading ? '…' : count}</strong></div>
        <div className="docs-admin-stat"><span>Visible Apps</span><strong>{loading ? '…' : visible}</strong></div>
        <div className="docs-admin-stat"><span>Disabled Apps</span><strong>{loading ? '…' : disabled}</strong></div>
      </section>
      <section className="docs-admin-card" aria-label="Shadow Docs settings">
        <div className="docs-admin-heading">
          <div><h2>Shadow Docs</h2><p>Write, design and publish books · App key: shadow-docs</p></div>
          {app && <div className="docs-admin-tags"><span className={`docs-admin-tag ${app.hidden ? 'off' : ''}`}>{app.hidden ? 'Hidden' : 'Visible'}</span><span className={`docs-admin-tag ${app.disabled ? 'stop' : ''}`}>{app.disabled ? 'Disabled' : 'Enabled'}</span></div>}
        </div>
        {loading ? <p className="docs-admin-message">Loading Shadow Docs…</p> : null}
        {error ? <p className="docs-admin-message error" role="alert">{error}</p> : null}
        {notice ? <p className="docs-admin-message" role="status">{notice}</p> : null}
        {app && <div className="docs-admin-body">
          <div className="docs-admin-image">{preview ? <img src={preview} alt={app.name || 'Shadow Docs'} /> : <span>SD</span>}</div>
          <div>
            <label className="docs-admin-label" htmlFor="docs-admin-name">APP NAME</label>
            <input id="docs-admin-name" className="docs-admin-input" value={name} maxLength={100} disabled={busy} onChange={event => setName(event.target.value)} />
            <div className="docs-admin-actions">
              <button type="button" className="docs-admin-btn primary" disabled={busy || !name.trim() || name.trim() === app.name} onClick={() => patch({ name: name.trim() }, 'Name saved.')}>Save Name</button>
              <button type="button" className="docs-admin-btn" disabled={busy} onClick={() => imageInput.current?.click()}>Choose Image</button>
              {imageFile && <button type="button" className="docs-admin-btn primary" disabled={busy} onClick={uploadImage}>Upload Image</button>}
              {imageFile && <button type="button" className="docs-admin-btn" disabled={busy} onClick={() => { setImageFile(null); setImagePreview('') }}>Cancel Image</button>}
              {app.profile && !imageFile && <button type="button" className="docs-admin-btn danger" disabled={busy} onClick={() => run(() => request(`/api/admin/apps/${APP_KEY}/profile`, { method: 'DELETE' }), 'Image removed.')}>Remove Image</button>}
              <button type="button" className={`docs-admin-btn ${app.hidden ? 'primary' : 'warning'}`} disabled={busy} onClick={() => patch({ hidden: !app.hidden }, app.hidden ? 'App shown.' : 'App hidden.')}>{app.hidden ? 'Show App' : 'Hide App'}</button>
              <button type="button" className={`docs-admin-btn ${app.disabled ? 'primary' : 'danger'}`} disabled={busy} onClick={() => patch({ disabled: !app.disabled }, app.disabled ? 'App enabled.' : 'App disabled.')}>{app.disabled ? 'Enable App' : 'Disable App'}</button>
            </div>
            <p className="docs-admin-hint">Hide controls whether the app appears in the App list. Disable will block access when website app settings are connected. Neither action deletes local books.</p>
            <input ref={imageInput} className="docs-admin-sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={event => { stageImage(event.target.files?.[0]); event.target.value = '' }} />
          </div>
        </div>}
      </section>
    </>
  )
}
