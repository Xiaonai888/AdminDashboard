import React, { useEffect, useMemo, useState } from 'react'
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
.event-upload{border:1px dashed #cbd5e1;border-radius:14px;background:#f8fafc;padding:12px}
.event-upload-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.event-upload input[type=file]{max-width:100%;font-size:11px;font-weight:750;color:#64748b}
.event-note{color:#64748b;font-size:10px;font-weight:750;line-height:1.5}
.event-preview-shell{margin-top:12px;border:1px solid #e2e8f0;border-radius:18px;background:#f8fafc;padding:14px}
.event-preview{position:relative;width:min(380px,100%);aspect-ratio:1/1;margin:0 auto;overflow:hidden;border-radius:20px;background:linear-gradient(135deg,#e2e8f0,#cbd5e1);box-shadow:0 12px 28px rgba(15,23,42,.12)}
.event-preview.banner{width:min(620px,100%);aspect-ratio:16/9;border-radius:16px}
.event-preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.event-preview-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.05) 30%,rgba(15,23,42,.82) 100%)}
.event-preview-copy{position:absolute;left:0;right:0;bottom:0;padding:22px;color:#fff}
.event-preview-badge{display:inline-flex;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);font-size:9px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}
.event-preview-title{margin-top:8px;font-size:23px;font-weight:950;line-height:1.12}
.event-preview-desc{margin-top:7px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;font-weight:700;line-height:1.55;color:#e2e8f0}
.event-preview-btn{display:inline-flex;align-items:center;justify-content:center;min-height:34px;margin-top:11px;padding:0 14px;border-radius:999px;background:#fff;color:#111827;font-size:10px;font-weight:950}
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

  async function uploadImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setUploading(true)
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
        throw new Error('Image upload did not return a URL')
      }

      setForm((current) => ({
        ...current,
        image_url: uploaded.image_url,
        image_storage_key: uploaded.storage_key || '',
      }))

      setSuccess('Image uploaded')
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  async function uploadBannerImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setUploadingBanner(true)
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
        throw new Error('Banner upload did not return a URL')
      }

      setForm((current) => ({
        ...current,
        banner_url: uploaded.image_url,
        banner_storage_key: uploaded.storage_key || '',
      }))

      setSuccess('Banner uploaded')
    } catch (err) {
      setError(err.message || 'Failed to upload banner')
    } finally {
      setUploadingBanner(false)
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

              <div className="event-section">Square Image</div>

              <div className="event-upload">
                <div className="event-upload-row">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={uploadImage}
                    disabled={uploading}
                  />

                  {form.image_url ? (
                    <button
                      type="button"
                      className="event-btn danger"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          image_url: '',
                          image_storage_key: '',
                        }))
                      }
                    >
                      Remove Image
                    </button>
                  ) : null}

                  <span className="event-note">
                    {uploading
                      ? 'Uploading...'
                      : 'Uses Admin Media Library. Display is cropped to 1:1.'}
                  </span>
                </div>
              </div>

              <div className="event-section">
                Author Dashboard Banner 16:9
              </div>

              <div className="event-upload">
                <div className="event-upload-row">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={uploadBannerImage}
                    disabled={uploadingBanner}
                  />

                  {form.banner_url ? (
                    <button
                      type="button"
                      className="event-btn danger"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          banner_url: '',
                          banner_storage_key: '',
                        }))
                      }
                    >
                      Remove Banner
                    </button>
                  ) : null}

                  <span className="event-note">
                    {uploadingBanner
                      ? 'Uploading...'
                      : 'Uses Admin Media Library. Recommended 16:9 for Author Dashboard.'}
                  </span>
                </div>
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

              <div className="event-section">Preview</div>

              <div className="event-preview-shell">
                <div className="event-preview">
                  {form.image_url ? (
                    <img
                      src={form.image_url}
                      alt="Event preview"
                    />
                  ) : null}

                  <div className="event-preview-shade" />

                  <div className="event-preview-copy">
                    {form.badge_text ? (
                      <div className="event-preview-badge">
                        {form.badge_text}
                      </div>
                    ) : null}

                    <div className="event-preview-title">
                      {form.title || 'Event Title'}
                    </div>

                    {form.description ? (
                      <div className="event-preview-desc">
                        {form.description}
                      </div>
                    ) : null}

                    {form.button_text ? (
                      <div className="event-preview-btn">
                        {form.button_text}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="event-section">
                Author Dashboard Banner Preview
              </div>

              <div className="event-preview-shell">
                <div className="event-preview banner">
                  {form.banner_url || form.image_url ? (
                    <img
                      src={form.banner_url || form.image_url}
                      alt="Author Dashboard banner preview"
                    />
                  ) : null}
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
