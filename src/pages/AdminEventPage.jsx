import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function readDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function toLocalInput(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (number) => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function createEmptyForm() {
  return {
    badge_text: '',
    title: '',
    description: '',
    image_url: '',
    image_storage_key: '',
    banner_url: '',
    banner_storage_key: '',
    button_text: '',
    button_url: '',
    publish_mode: 'draft',
    starts_at: '',
    ends_at: '',
    sort_order: 0,
  }
}

function formFromEvent(item) {
  const now = Date.now()
  const start = item?.starts_at
    ? new Date(item.starts_at).getTime()
    : null

  let publishMode = 'draft'

  if (item?.is_published) {
    publishMode =
      start && Number.isFinite(start) && start > now
        ? 'schedule'
        : 'now'
  }

  return {
    badge_text: item?.badge_text || '',
    title: item?.title || '',
    description: item?.description || '',
    image_url: item?.image_url || '',
    image_storage_key: item?.image_storage_key || '',
    banner_url: item?.banner_url || '',
    banner_storage_key: item?.banner_storage_key || '',
    button_text: item?.button_text || '',
    button_url: item?.button_url || '',
    publish_mode: publishMode,
    starts_at: toLocalInput(item?.starts_at),
    ends_at: toLocalInput(item?.ends_at),
    sort_order: Number(item?.sort_order || 0),
  }
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    )
  }

  return data
}

const styles = `
.event-page{display:flex;flex-direction:column;gap:18px}
.event-hero{background:linear-gradient(135deg,#111827,#312e81,#4f46e5);color:#fff;border-radius:24px;padding:24px}
.event-hero h2{margin:0;font-size:25px;font-weight:950}
.event-hero p{margin:8px 0 0;color:#e0e7ff;font-size:13px;font-weight:700;line-height:1.7}
.event-grid{display:grid;grid-template-columns:minmax(280px,.72fr) minmax(500px,1.5fr);gap:18px;align-items:start}
.event-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden}
.event-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:17px 18px;border-bottom:1px solid #e2e8f0}
.event-title{font-size:15px;font-weight:950;color:#0f172a}
.event-sub{margin-top:4px;font-size:11px;font-weight:750;color:#64748b}
.event-body{padding:18px}
.event-list{display:flex;flex-direction:column;gap:9px}
.event-list-item{width:100%;display:flex;gap:10px;align-items:center;border:1px solid #e2e8f0;border-radius:14px;background:#fff;padding:9px;text-align:left;cursor:pointer}
.event-list-item.active{border-color:#818cf8;background:#eef2ff}
.event-thumb{width:58px;height:58px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-weight:950}
.event-thumb img{width:100%;height:100%;object-fit:cover}
.event-list-copy{min-width:0;flex:1}
.event-list-copy strong{display:block;color:#0f172a;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.event-list-copy span{display:block;margin-top:5px;color:#64748b;font-size:10px;font-weight:800}
.event-status{display:inline-flex!important;width:max-content!important;padding:4px 7px;border-radius:999px;background:#f1f5f9;color:#475569!important;font-size:9px!important;font-weight:950!important;text-transform:capitalize}
.event-status.live{background:#dcfce7;color:#15803d!important}
.event-status.scheduled{background:#e0e7ff;color:#4338ca!important}
.event-status.ended{background:#fee2e2;color:#b91c1c!important}
.event-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.event-field.full{grid-column:1/-1}
.event-field label{display:block;margin-bottom:7px;color:#475569;font-size:11px;font-weight:950}
.event-field input,.event-field select,.event-field textarea{width:100%;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;outline:none;font:inherit;font-size:13px;font-weight:750}
.event-field input,.event-field select{height:42px;padding:0 12px}
.event-field textarea{min-height:105px;resize:vertical;padding:10px 12px;line-height:1.55}
.event-field input:focus,.event-field select:focus,.event-field textarea:focus{background:#fff;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
.event-section{margin:18px 0 9px;color:#0f172a;font-size:12px;font-weight:950}
.event-upload-zone{position:relative;display:flex;align-items:center;justify-content:center;width:100%;overflow:hidden;border:2px dashed #cbd5e1;border-radius:18px;background:#f8fafc;cursor:pointer;transition:border-color .18s ease,background .18s ease,box-shadow .18s ease}
.event-upload-zone:hover{border-color:#818cf8;background:#f5f3ff}
.event-upload-zone.dragging{border-color:#4f46e5;background:#eef2ff;box-shadow:0 0 0 4px rgba(79,70,229,.1)}
.event-upload-zone.has-image{border-style:solid;border-color:#e2e8f0;background:#0f172a}
.event-upload-zone.square{width:min(360px,100%);aspect-ratio:1/1;margin:0 auto}
.event-upload-zone.banner{aspect-ratio:16/9}
.event-upload-zone input[type=file]{display:none}
.event-upload-zone img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
.event-upload-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:22px;text-align:center;color:#64748b;pointer-events:none}
.event-upload-icon{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:14px;background:#eef2ff;color:#4f46e5;font-size:20px;font-weight:950}
.event-upload-empty strong{color:#0f172a;font-size:13px;font-weight:950}
.event-upload-empty span{max-width:360px;font-size:10px;font-weight:750;line-height:1.55}
.event-upload-overlay{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding:14px;background:linear-gradient(180deg,transparent 45%,rgba(15,23,42,.78) 100%);opacity:0;transition:opacity .18s ease}
.event-upload-zone:hover .event-upload-overlay,.event-upload-zone:focus-within .event-upload-overlay{opacity:1}
.event-upload-controls{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.event-upload-control{height:34px;border:0;border-radius:10px;padding:0 12px;cursor:pointer;font:inherit;font-size:10px;font-weight:950}
.event-upload-control.replace{background:#fff;color:#111827}
.event-upload-control.remove{background:#fee2e2;color:#b91c1c}
.event-upload-control:disabled{opacity:.55;cursor:not-allowed}
.event-upload-progress{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.62);color:#fff;font-size:12px;font-weight:950;letter-spacing:.02em}
.event-upload-helper{margin-top:8px;color:#64748b;font-size:10px;font-weight:750;line-height:1.5;text-align:center}
.event-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:18px}
.event-btn{height:40px;border:0;border-radius:12px;padding:0 14px;cursor:pointer;font:inherit;font-size:11px;font-weight:950}
.event-btn.primary{background:#4f46e5;color:#fff}
.event-btn.light{background:#f1f5f9;color:#475569}
.event-btn.danger{background:#fef2f2;color:#dc2626}
.event-btn:disabled{opacity:.5;cursor:not-allowed}
.event-alert{padding:12px 14px;border-radius:13px;font-size:12px;font-weight:850}
.event-alert.error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c}
.event-alert.success{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d}
.event-empty{padding:28px 12px;text-align:center;color:#64748b;font-size:12px;font-weight:800}
@media(max-width:1050px){.event-grid{grid-template-columns:1fr}}
@media(max-width:700px){.event-fields{grid-template-columns:1fr}.event-field.full{grid-column:auto}}
`

export default function AdminEventPage() {
  const token = getAdminToken()

  const [events, setEvents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState(createEmptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [draggingSquare, setDraggingSquare] = useState(false)
  const [draggingBanner, setDraggingBanner] = useState(false)
  const squareInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const selectedEvent = useMemo(
    () => events.find((item) => item.id === selectedId) || null,
    [events, selectedId]
  )

  async function loadEvents(preferredId = '') {
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await readResponse(response)
      const list = Array.isArray(data.events) ? data.events : []

      setEvents(list)

      const nextId =
        preferredId ||
        (selectedId && list.some((item) => item.id === selectedId)
          ? selectedId
          : '')

      if (nextId) {
        const found = list.find((item) => item.id === nextId)

        if (found) {
          setSelectedId(found.id)
          setForm(formFromEvent(found))
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function startNewEvent() {
    setSelectedId('')
    setForm(createEmptyForm())
    setError('')
    setSuccess('')
  }

  function selectEvent(item) {
    setSelectedId(item.id)
    setForm(formFromEvent(item))
    setError('')
    setSuccess('')
  }

  async function uploadEventMedia(file, target) {
    if (!file) return

    const isBanner = target === 'banner'
    const setBusy = isBanner ? setUploadingBanner : setUploading

    setBusy(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('images', file)

      const response = await fetch(
        `${API_URL}/api/admin/media-library/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await readResponse(response)
      const uploaded = Array.isArray(data.images)
        ? data.images[0]
        : null

      if (!uploaded?.image_url) {
        throw new Error(
          isBanner
            ? 'Banner upload did not return a URL'
            : 'Image upload did not return a URL'
        )
      }

      setForm((current) => ({
        ...current,
        ...(isBanner
          ? {
              banner_url: uploaded.image_url,
              banner_storage_key: uploaded.storage_key || '',
            }
          : {
              image_url: uploaded.image_url,
              image_storage_key: uploaded.storage_key || '',
            }),
      }))

      setSuccess(isBanner ? 'Banner uploaded' : 'Image uploaded')
    } catch (err) {
      setError(
        err.message ||
          (isBanner
            ? 'Failed to upload banner'
            : 'Failed to upload image')
      )
    } finally {
      setBusy(false)
    }
  }

  function handleFileInput(event, target) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      uploadEventMedia(file, target)
    }
  }

  function handleDrop(event, target) {
    event.preventDefault()
    event.stopPropagation()

    if (target === 'banner') {
      setDraggingBanner(false)
      if (uploadingBanner) return
    } else {
      setDraggingSquare(false)
      if (uploading) return
    }

    const file = event.dataTransfer.files?.[0]

    if (file) {
      uploadEventMedia(file, target)
    }
  }

  function openFilePicker(inputRef, disabled) {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  function handleUploadKeyDown(event, inputRef, disabled) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFilePicker(inputRef, disabled)
    }
  }

  function buildPayload() {
    const title = String(form.title || '').trim()
    const endsAt = readDate(form.ends_at)

   if (!title) {
  throw new Error('Event title is required')
}

if (!form.image_url) {
  throw new Error('Event image is required')
}

    if (!endsAt) {
      throw new Error('End date and time are required')
    }

    let startsAt = null
    let isPublished = false

    if (form.publish_mode === 'now') {
      isPublished = true

      const existingStart =
        selectedEvent?.is_published &&
        selectedEvent?.starts_at &&
        new Date(selectedEvent.starts_at).getTime() <= Date.now()
          ? selectedEvent.starts_at
          : new Date().toISOString()

      startsAt = existingStart
    }

    if (form.publish_mode === 'schedule') {
      startsAt = readDate(form.starts_at)
      isPublished = true

      if (!startsAt) {
        throw new Error('Schedule start date and time are required')
      }
    }

    if (
      startsAt &&
      new Date(endsAt).getTime() <= new Date(startsAt).getTime()
    ) {
      throw new Error('End time must be after start time')
    }

    return {
      badge_text: String(form.badge_text || '').trim(),
      title,
      description: String(form.description || '').trim(),
      image_url: form.image_url || '',
      image_storage_key: form.image_storage_key || '',
      banner_url: form.banner_url || '',
      banner_storage_key: form.banner_storage_key || '',
      button_text: String(form.button_text || '').trim(),
      button_url: String(form.button_url || '').trim(),
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: Number(form.sort_order || 0),
      is_published: isPublished,
    }
  }

  async function saveEvent() {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = buildPayload()
      const editing = Boolean(selectedId)

      const response = await fetch(
        editing
          ? `${API_URL}/api/admin/events/${selectedId}`
          : `${API_URL}/api/admin/events`,
        {
          method: editing ? 'PATCH' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await readResponse(response)
      const savedId = data.event?.id || selectedId

      setSuccess(editing ? 'Event updated' : 'Event created')
      await loadEvents(savedId)
    } catch (err) {
      setError(err.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  async function deleteSelectedEvent() {
    if (!selectedId) return

    const confirmed = window.confirm(
      'Delete this event permanently?'
    )

    if (!confirmed) return

    setDeleting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `${API_URL}/api/admin/events/${selectedId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      await readResponse(response)

      setSelectedId('')
      setForm(createEmptyForm())
      setSuccess('Event deleted')
      await loadEvents()
    } catch (err) {
      setError(err.message || 'Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminLayout
      title="Event"
      subtitle="Create, schedule and manage reader events."
    >
      <style>{styles}</style>

      <div className="event-page">
        <div className="event-hero">
          <h2>Event Center</h2>
          <p>
            Create square reader cards and 16:9 Author Dashboard banners,
            publish now or schedule them, and automatically hide them after the end time.
          </p>
        </div>

        {error ? (
          <div className="event-alert error">{error}</div>
        ) : null}

        {success ? (
          <div className="event-alert success">{success}</div>
        ) : null}

        <div className="event-grid">
          <div className="event-card">
            <div className="event-head">
              <div>
                <div className="event-title">Events</div>
                <div className="event-sub">
                  {events.length} total
                </div>
              </div>

              <button
                type="button"
                className="event-btn primary"
                onClick={startNewEvent}
              >
                + New Event
              </button>
            </div>

            <div className="event-body">
              {loading ? (
                <div className="event-empty">Loading...</div>
              ) : events.length ? (
                <div className="event-list">
                  {events.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`event-list-item ${
                        selectedId === item.id ? 'active' : ''
                      }`}
                      onClick={() => selectEvent(item)}
                    >
                      <div className="event-thumb">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                          />
                        ) : (
                          <span>E</span>
                        )}
                      </div>

                      <div className="event-list-copy">
                        <strong>{item.title}</strong>
                        <span
                          className={`event-status ${
                            item.status || ''
                          }`}
                        >
                          {item.status || 'draft'}
                        </span>
                        <span>
                          Ends:{' '}
                          {item.ends_at
                            ? new Date(
                                item.ends_at
                              ).toLocaleString()
                            : '-'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="event-empty">
                  No events yet
                </div>
              )}
            </div>
          </div>

          <div className="event-card">
            <div className="event-head">
              <div>
                <div className="event-title">
                  {selectedId ? 'Edit Event' : 'Create Event'}
                </div>
                <div className="event-sub">
                  Square 1:1 reader card + 16:9 dashboard banner
                </div>
              </div>

              {selectedEvent ? (
                <span
                  className={`event-status ${
                    selectedEvent.status || ''
                  }`}
                >
                  {selectedEvent.status || 'draft'}
                </span>
              ) : null}
            </div>

            <div className="event-body">
              <div className="event-fields">
                <div className="event-field">
                  <label>Badge Text</label>
                  <input
                    value={form.badge_text}
                    onChange={(event) =>
                      updateField(
                        'badge_text',
                        event.target.value
                      )
                    }
                    placeholder="SPECIAL EVENT"
                  />
                </div>

                <div className="event-field">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) =>
                      updateField(
                        'sort_order',
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="event-field full">
                  <label>Event Title</label>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateField('title', event.target.value)
                    }
                    placeholder="Event title"
                  />
                </div>

                <div className="event-field full">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        'description',
                        event.target.value
                      )
                    }
                    placeholder="Write event details..."
                  />
                </div>
              </div>

              <div className="event-section">Event Page Cover 1:1</div>

              <div
                className={`event-upload-zone square ${
                  form.image_url ? 'has-image' : ''
                } ${draggingSquare ? 'dragging' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() =>
                  openFilePicker(squareInputRef, uploading)
                }
                onKeyDown={(event) =>
                  handleUploadKeyDown(
                    event,
                    squareInputRef,
                    uploading
                  )
                }
                onDragOver={(event) => {
                  event.preventDefault()
                  if (!uploading) {
                    setDraggingSquare(true)
                  }
                }}
                onDragLeave={() => setDraggingSquare(false)}
                onDrop={(event) => handleDrop(event, 'square')}
              >
                <input
                  ref={squareInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={(event) =>
                    handleFileInput(event, 'square')
                  }
                  disabled={uploading}
                />

                {form.image_url ? (
                  <>
                    <img
                      src={form.image_url}
                      alt="Event Page cover"
                    />
                    <div className="event-upload-overlay">
                      <div className="event-upload-controls">
                        <button
                          type="button"
                          className="event-upload-control replace"
                          onClick={(event) => {
                            event.stopPropagation()
                            openFilePicker(
                              squareInputRef,
                              uploading
                            )
                          }}
                          disabled={uploading}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className="event-upload-control remove"
                          onClick={(event) => {
                            event.stopPropagation()
                            setForm((current) => ({
                              ...current,
                              image_url: '',
                              image_storage_key: '',
                            }))
                          }}
                          disabled={uploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="event-upload-empty">
                    <div className="event-upload-icon">+</div>
                    <strong>Drop image here or click to upload</strong>
                    <span>
                      Auto-fits to a square 1:1 preview for Event Page.
                    </span>
                  </div>
                )}

                {uploading ? (
                  <div className="event-upload-progress">
                    Uploading...
                  </div>
                ) : null}
              </div>

              <div className="event-upload-helper">
                Event Page uses the square 1:1 cover.
              </div>

              <div className="event-section">
                Author Dashboard Banner 16:9
              </div>

              <div
                className={`event-upload-zone banner ${
                  form.banner_url ? 'has-image' : ''
                } ${draggingBanner ? 'dragging' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() =>
                  openFilePicker(
                    bannerInputRef,
                    uploadingBanner
                  )
                }
                onKeyDown={(event) =>
                  handleUploadKeyDown(
                    event,
                    bannerInputRef,
                    uploadingBanner
                  )
                }
                onDragOver={(event) => {
                  event.preventDefault()
                  if (!uploadingBanner) {
                    setDraggingBanner(true)
                  }
                }}
                onDragLeave={() => setDraggingBanner(false)}
                onDrop={(event) => handleDrop(event, 'banner')}
              >
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={(event) =>
                    handleFileInput(event, 'banner')
                  }
                  disabled={uploadingBanner}
                />

                {form.banner_url ? (
                  <>
                    <img
                      src={form.banner_url}
                      alt="Author Dashboard banner"
                    />
                    <div className="event-upload-overlay">
                      <div className="event-upload-controls">
                        <button
                          type="button"
                          className="event-upload-control replace"
                          onClick={(event) => {
                            event.stopPropagation()
                            openFilePicker(
                              bannerInputRef,
                              uploadingBanner
                            )
                          }}
                          disabled={uploadingBanner}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          className="event-upload-control remove"
                          onClick={(event) => {
                            event.stopPropagation()
                            setForm((current) => ({
                              ...current,
                              banner_url: '',
                              banner_storage_key: '',
                            }))
                          }}
                          disabled={uploadingBanner}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="event-upload-empty">
                    <div className="event-upload-icon">+</div>
                    <strong>Drop banner here or click to upload</strong>
                    <span>
                      Auto-fits to the same 16:9 ratio used by the 80% for 49 Days dashboard card.
                    </span>
                  </div>
                )}

                {uploadingBanner ? (
                  <div className="event-upload-progress">
                    Uploading...
                  </div>
                ) : null}
              </div>

              <div className="event-upload-helper">
                Author Dashboard uses this separate 16:9 banner.
              </div>

              <div className="event-section">
                Button / Link
              </div>

              <div className="event-fields">
                <div className="event-field">
                  <label>Button Text</label>
                  <input
                    value={form.button_text}
                    onChange={(event) =>
                      updateField(
                        'button_text',
                        event.target.value
                      )
                    }
                    placeholder="View Event"
                  />
                </div>

                <div className="event-field">
                  <label>Button URL</label>
                  <input
                    value={form.button_url}
                    onChange={(event) =>
                      updateField(
                        'button_url',
                        event.target.value
                      )
                    }
                    placeholder="/event-page or https://..."
                  />
                </div>
              </div>

              <div className="event-section">
                Publish & Schedule
              </div>

              <div className="event-fields">
                <div className="event-field">
                  <label>Publish Mode</label>
                  <select
                    value={form.publish_mode}
                    onChange={(event) =>
                      updateField(
                        'publish_mode',
                        event.target.value
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="now">Publish Now</option>
                    <option value="schedule">
                      Schedule
                    </option>
                  </select>
                </div>

                {form.publish_mode === 'schedule' ? (
                  <div className="event-field">
                    <label>Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(event) =>
                        updateField(
                          'starts_at',
                          event.target.value
                        )
                      }
                    />
                  </div>
                ) : (
                  <div className="event-field">
                    <label>Start</label>
                    <input
                      value={
                        form.publish_mode === 'now'
                          ? 'Immediately'
                          : 'Not published'
                      }
                      disabled
                    />
                  </div>
                )}

                <div className="event-field">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={(event) =>
                      updateField(
                        'ends_at',
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="event-actions">
                <button
                  type="button"
                  className="event-btn primary"
                  onClick={saveEvent}
                  disabled={saving || uploading || uploadingBanner}
                >
                  {saving
                    ? 'Saving...'
                    : selectedId
                      ? 'Update Event'
                      : 'Create Event'}
                </button>

                <button
                  type="button"
                  className="event-btn light"
                  onClick={startNewEvent}
                  disabled={saving}
                >
                  Clear
                </button>

                {selectedId ? (
                  <button
                    type="button"
                    className="event-btn danger"
                    onClick={deleteSelectedEvent}
                    disabled={deleting || saving}
                  >
                    {deleting
                      ? 'Deleting...'
                      : 'Delete Event'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
