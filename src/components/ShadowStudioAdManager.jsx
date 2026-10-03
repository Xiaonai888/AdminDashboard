import React, { useEffect, useMemo, useRef, useState } from 'react'
import ImageDropZone from './common/ImageDropZone'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const SECTION_KEY = 'studio_header_ad'
const SLOTS = [1, 2, 3, 4, 5, 6, 7]
const RECORDS_PER_PAGE = 20
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const styles = `
  .ssam-root{
    width:100%;
    color:#0f172a;
  }

  .ssam-shell{
    display:grid;
    grid-template-columns:minmax(0,1.35fr) minmax(340px,.75fr);
    gap:24px;
    align-items:start;
  }

  .ssam-panel{
    overflow:hidden;
    border:1px solid #e2e8f0;
    border-radius:22px;
    background:#fff;
    box-shadow:0 8px 28px rgba(15,23,42,.06);
  }

  .ssam-panel-head{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
    padding:20px 22px;
    border-bottom:1px solid #e2e8f0;
  }

  .ssam-panel-head h3{
    margin:0;
    font-size:16px;
    font-weight:900;
  }

  .ssam-panel-head p{
    margin:4px 0 0;
    color:#64748b;
    font-size:12.5px;
    line-height:1.5;
  }

  .ssam-count{
    flex:0 0 auto;
    padding:7px 11px;
    border:1px solid #e0e7ff;
    border-radius:999px;
    background:#eef2ff;
    color:#4f46e5;
    font-size:12px;
    font-weight:900;
  }

  .ssam-slots{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:16px;
    padding:18px;
  }

  .ssam-slot{
    overflow:hidden;
    border:1px solid #e2e8f0;
    border-radius:16px;
    background:#fff;
    padding:0;
    text-align:left;
    font:inherit;
    cursor:pointer;
    transition:.18s ease;
  }

  .ssam-slot:hover{
    transform:translateY(-2px);
    border-color:#c7d2fe;
    box-shadow:0 14px 30px rgba(79,70,229,.11);
  }

  .ssam-slot.active{
    border-color:#4f46e5;
    box-shadow:0 0 0 3px rgba(79,70,229,.13);
  }

  .ssam-slot-preview{
    position:relative;
    width:100%;
    aspect-ratio:5/1;
    overflow:hidden;
    background:linear-gradient(135deg,#f8fafc,#eef2ff);
  }

  .ssam-slot-preview img{
    width:100%;
    height:100%;
    display:block;
    object-fit:cover;
  }

  .ssam-empty{
    width:100%;
    height:100%;
    display:grid;
    place-items:center;
    color:#94a3b8;
    font-size:11px;
    font-weight:850;
  }

  .ssam-slot-number,
  .ssam-slot-status{
    position:absolute;
    top:8px;
    z-index:2;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    min-height:22px;
    padding:0 8px;
    border-radius:999px;
    font-size:9.5px;
    font-weight:900;
    backdrop-filter:blur(8px);
  }

  .ssam-slot-number{
    left:8px;
    background:rgba(15,23,42,.8);
    color:#fff;
  }

  .ssam-slot-status{
    right:8px;
  }

  .ssam-slot-status.live{
    background:rgba(209,250,229,.94);
    color:#047857;
  }

  .ssam-slot-status.off{
    background:rgba(254,226,226,.94);
    color:#b91c1c;
  }

  .ssam-slot-status.empty{
    background:rgba(241,245,249,.94);
    color:#475569;
  }

  .ssam-slot-meta{
    padding:12px 13px 14px;
  }

  .ssam-slot-title{
    overflow:hidden;
    color:#0f172a;
    font-size:13px;
    font-weight:900;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .ssam-slot-link{
    overflow:hidden;
    margin-top:4px;
    color:#64748b;
    font-size:11px;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  .ssam-editor{
    position:sticky;
    top:92px;
  }

  .ssam-editor-body{
    padding:20px;
  }

  .ssam-preview{
    position:relative;
    width:100%;
    aspect-ratio:5/1;
    overflow:hidden;
    margin-bottom:15px;
    border:1px solid #e2e8f0;
    border-radius:15px;
    background:#10151b;
  }

  .ssam-preview img{
    width:100%;
    height:100%;
    display:block;
    object-fit:cover;
  }

  .ssam-preview-empty{
    width:100%;
    height:100%;
    display:grid;
    place-items:center;
    color:#94a3b8;
    font-size:12px;
    font-weight:850;
  }

  .ssam-phone{
    margin-top:14px;
    padding:12px;
    border:1px solid #e2e8f0;
    border-radius:16px;
    background:#f8fafc;
  }

  .ssam-phone-label{
    margin-bottom:8px;
    color:#64748b;
    font-size:10px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:.06em;
  }

  .ssam-phone-screen{
    overflow:hidden;
    border:6px solid #111827;
    border-radius:18px;
    background:#11161c;
  }

  .ssam-phone-ad{
    width:100%;
    aspect-ratio:5/1;
    overflow:hidden;
    background:#11161c;
  }

  .ssam-phone-ad img{
    width:100%;
    height:100%;
    display:block;
    object-fit:cover;
  }

  .ssam-phone-tools{
    height:52px;
    display:flex;
    align-items:center;
    gap:8px;
    padding:0 10px;
    background:#171d24;
  }

  .ssam-phone-dot{
    width:30px;
    height:30px;
    border-radius:10px;
    background:#2a323b;
  }

  .ssam-phone-line{
    flex:1;
    height:30px;
    border-radius:10px;
    background:#222a33;
  }

  .ssam-upload{
    margin-top:12px;
    padding:16px;
    border:1.5px dashed #cbd5e1;
    border-radius:15px;
    background:#f8fafc;
    text-align:center;
    cursor:pointer;
  }

  .ssam-upload:hover{
    border-color:#4f46e5;
    background:#eef2ff;
  }

  .ssam-upload-title{
    font-size:13px;
    font-weight:900;
  }

  .ssam-upload-help{
    margin-top:4px;
    color:#64748b;
    font-size:11px;
    line-height:1.45;
  }

  .ssam-label{
    display:block;
    margin:12px 0 7px;
    color:#334155;
    font-size:12px;
    font-weight:900;
  }

  .ssam-input{
    width:100%;
    min-height:44px;
    border:1px solid #e2e8f0;
    border-radius:13px;
    outline:none;
    background:#f8fafc;
    padding:0 13px;
    color:#0f172a;
    font:inherit;
    font-size:13px;
  }

  .ssam-input:focus{
    border-color:#4f46e5;
    background:#fff;
    box-shadow:0 0 0 3px rgba(79,70,229,.1);
  }

  .ssam-toggle{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
    margin-top:14px;
    padding:13px 14px;
    border:1px solid #e2e8f0;
    border-radius:14px;
    background:#fff;
  }

  .ssam-toggle-title{
    font-size:13px;
    font-weight:900;
  }

  .ssam-toggle-help{
    margin-top:3px;
    color:#64748b;
    font-size:11px;
  }

  .ssam-switch{
    width:48px;
    height:28px;
    flex:0 0 auto;
    border:0;
    border-radius:999px;
    background:#cbd5e1;
    padding:3px;
    cursor:pointer;
  }

  .ssam-switch.on{
    background:#10b981;
  }

  .ssam-switch span{
    width:22px;
    height:22px;
    display:block;
    border-radius:50%;
    background:#fff;
    transition:.18s ease;
  }

  .ssam-switch.on span{
    transform:translateX(20px);
  }

  .ssam-actions{
    display:grid;
    gap:9px;
    margin-top:16px;
  }

  .ssam-btn{
    min-height:44px;
    border:0;
    border-radius:13px;
    padding:0 14px;
    font:inherit;
    font-size:12px;
    font-weight:900;
    cursor:pointer;
  }

  .ssam-btn:disabled{
    opacity:.5;
    cursor:not-allowed;
  }

  .ssam-btn.primary{
    background:#4f46e5;
    color:#fff;
  }

  .ssam-btn.soft{
    border:1px solid #e2e8f0;
    background:#f1f5f9;
    color:#334155;
  }

  .ssam-btn.danger{
    border:1px solid #fca5a5;
    background:#fff;
    color:#b91c1c;
  }

  .ssam-message{
    margin-bottom:12px;
    padding:11px 12px;
    border-radius:12px;
    font-size:12px;
    font-weight:800;
    line-height:1.45;
  }

  .ssam-message.success{
    background:#d1fae5;
    color:#047857;
  }

  .ssam-message.error{
    background:#fee2e2;
    color:#b91c1c;
  }

  .ssam-message.info{
    background:#eef2ff;
    color:#4f46e5;
  }

  .ssam-note{
    margin-top:14px;
    padding:11px 12px;
    border:1px solid #e2e8f0;
    border-radius:12px;
    background:#f8fafc;
    color:#64748b;
    font-size:11px;
    line-height:1.55;
  }

  .ssam-records{
    margin-top:24px;
  }

  .ssam-record-list{
    padding:18px;
  }

  .ssam-record-empty{
    padding:16px;
    border:1px solid #e2e8f0;
    border-radius:13px;
    background:#f8fafc;
    color:#64748b;
    font-size:12px;
  }

  .ssam-record{
    display:grid;
    grid-template-columns:100px minmax(0,1fr) 150px;
    gap:14px;
    align-items:center;
    padding:13px 0;
    border-bottom:1px solid #f1f5f9;
  }

  .ssam-record-action{
    width:max-content;
    min-width:80px;
    padding:6px 8px;
    border-radius:999px;
    background:#eef2ff;
    color:#4f46e5;
    font-size:10px;
    font-weight:900;
    text-align:center;
  }

  .ssam-record-detail{
    min-width:0;
    color:#334155;
    font-size:12px;
    line-height:1.45;
  }

  .ssam-record-time{
    color:#64748b;
    font-size:11px;
    text-align:right;
  }

  .ssam-record-footer{
    display:flex;
    justify-content:flex-end;
    align-items:center;
    gap:8px;
    padding:0 18px 18px;
  }

  .ssam-page{
    min-height:36px;
    border:1px solid #e2e8f0;
    border-radius:10px;
    background:#fff;
    padding:0 12px;
    font:inherit;
    font-size:11px;
    font-weight:900;
    cursor:pointer;
  }

  .ssam-page:disabled{
    opacity:.45;
    cursor:not-allowed;
  }

  .ssam-page-info{
    color:#475569;
    font-size:11px;
    font-weight:900;
  }

  @media(max-width:1120px){
    .ssam-shell{
      grid-template-columns:1fr;
    }

    .ssam-editor{
      position:static;
    }
  }

  @media(max-width:700px){
    .ssam-slots{
      grid-template-columns:1fr;
      gap:12px;
      padding:14px;
    }

    .ssam-panel-head,
    .ssam-editor-body{
      padding:16px;
    }

    .ssam-record{
      grid-template-columns:1fr;
      gap:6px;
    }

    .ssam-record-time{
      text-align:left;
    }

    .ssam-record-footer{
      justify-content:center;
      flex-wrap:wrap;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function getLatestSlotItem(items, slot) {
  return items
    .filter((item) => Number(item.order_index) === slot)
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at || 0) -
        new Date(a.updated_at || a.created_at || 0),
    )[0] || null
}

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function cleanTitle(value) {
  return String(value || '').replace(/^\[STUDIO-AD\]\s*/i, '').trim()
}

function buildTitle(value, slot) {
  const title = String(value || '').trim() || `Shadow Studio Ad ${slot}`
  return `[STUDIO-AD] ${title}`
}

export default function ShadowStudioAdManager() {
  const fileRef = useRef(null)
  const [slides, setSlides] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(1)
  const [name, setName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordPage, setRecordPage] = useState(1)
  const [recordTotalPages, setRecordTotalPages] = useState(1)

  const slotMap = useMemo(
    () =>
      SLOTS.reduce(
        (result, slot) => ({
          ...result,
          [slot]: getLatestSlotItem(slides, slot),
        }),
        {},
      ),
    [slides],
  )

  const selectedAd = slotMap[selectedSlot]
  const currentPreview = previewUrl || selectedAd?.image_url || ''

  async function apiFetch(url, options = {}) {
    const token = getAdminToken()
    const headers = {
      ...(options.headers || {}),
      'X-Admin-Name': 'Admin',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  async function fetchAds() {
    try {
      const data = await apiFetch(
        `${API_URL}/api/slides?section_key=${SECTION_KEY}&include_inactive=true`,
      )
      setSlides(Array.isArray(data.slides) ? data.slides : [])
    } catch (error) {
      setSlides([])
      setMessage({
        type: 'error',
        text: `Cannot load Shadow Studio Ads: ${error.message}`,
      })
    }
  }

  async function fetchRecords(page = 1) {
    try {
      setRecordsLoading(true)

      const data = await apiFetch(
        `${API_URL}/api/slides/records?page=${page}&limit=${RECORDS_PER_PAGE}&section_key=${SECTION_KEY}`,
      )

      setRecords(Array.isArray(data.records) ? data.records : [])
      setRecordPage(Number(data.page || page))
      setRecordTotalPages(Number(data.total_pages || 1))
    } catch {
      setRecords([])
      setRecordTotalPages(1)
    } finally {
      setRecordsLoading(false)
    }
  }

  async function refreshAll() {
    await Promise.all([
      fetchAds(),
      fetchRecords(recordPage),
    ])
  }

  useEffect(() => {
    fetchAds()
    fetchRecords(1)
  }, [])

  useEffect(() => {
    const item = slotMap[selectedSlot]

    setName(cleanTitle(item?.title || ''))
    setLinkUrl(item?.link_url || '')
    setIsActive(item?.is_active ?? true)
    setSelectedFile(null)

    setPreviewUrl((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }
      return ''
    })

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }, [selectedSlot, slotMap])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function chooseImage(file) {
    if (!file) return

    if (!file.type?.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'Please choose an image file.',
      })
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setMessage({
        type: 'error',
        text: 'Image must be 5 MB or smaller.',
      })
      return
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setMessage(null)
  }

  async function saveSlot() {
    if (!selectedAd && !selectedFile) {
      setMessage({
        type: 'error',
        text: 'Choose an image first for this empty Ad slot.',
      })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      const formData = new FormData()

      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      formData.append('section_key', SECTION_KEY)
      formData.append('title', buildTitle(name, selectedSlot))
      formData.append('subtitle', '')
      formData.append('genre_label', 'Shadow Studio')
      formData.append('link_url', linkUrl.trim())
      formData.append('order_index', String(selectedSlot))
      formData.append('is_active', String(isActive))

      const url = selectedAd
        ? `${API_URL}/api/slides/${selectedAd.id}`
        : `${API_URL}/api/slides`

      await apiFetch(url, {
        method: selectedAd ? 'PUT' : 'POST',
        body: formData,
      })

      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }

      setSelectedFile(null)
      setPreviewUrl('')

      if (fileRef.current) {
        fileRef.current.value = ''
      }

      setMessage({
        type: 'success',
        text: `Shadow Studio Ad ${selectedSlot} saved successfully.`,
      })

      await refreshAll()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to save Shadow Studio Ad.',
      })
    } finally {
      setLoading(false)
    }
  }

  async function deleteSlot() {
    if (!selectedAd) {
      setMessage({
        type: 'info',
        text: `Shadow Studio Ad ${selectedSlot} is already empty.`,
      })
      return
    }

    const confirmed = window.confirm(
      `Delete Shadow Studio Ad ${selectedSlot}?`,
    )

    if (!confirmed) return

    try {
      setLoading(true)
      setMessage(null)

      await apiFetch(`${API_URL}/api/slides/${selectedAd.id}`, {
        method: 'DELETE',
      })

      setName('')
      setLinkUrl('')
      setIsActive(true)
      setSelectedFile(null)

      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }

      setPreviewUrl('')

      setMessage({
        type: 'success',
        text: `Shadow Studio Ad ${selectedSlot} deleted.`,
      })

      await refreshAll()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to delete Shadow Studio Ad.',
      })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    const item = slotMap[selectedSlot]

    setName(cleanTitle(item?.title || ''))
    setLinkUrl(item?.link_url || '')
    setIsActive(item?.is_active ?? true)
    setSelectedFile(null)

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl('')
    setMessage(null)

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  return (
    <div className="ssam-root">
      <style>{styles}</style>

      <div className="ssam-shell">
        <section className="ssam-panel">
          <div className="ssam-panel-head">
            <div>
              <h3>Shadow Studio Header Ads</h3>
              <p>
                Seven fixed Ad slots for the long banner above Shadow Studio tools.
              </p>
            </div>

            <span className="ssam-count">
              {slides.length} / 7
            </span>
          </div>

          <div className="ssam-slots">
            {SLOTS.map((slot) => {
              const item = slotMap[slot]
              const status = !item
                ? 'empty'
                : item.is_active === false
                  ? 'off'
                  : 'live'

              return (
                <button
                  type="button"
                  key={slot}
                  className={`ssam-slot ${selectedSlot === slot ? 'active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div className="ssam-slot-preview">
                    <span className="ssam-slot-number">
                      Ad {slot}
                    </span>

                    <span className={`ssam-slot-status ${status}`}>
                      {!item
                        ? 'EMPTY'
                        : item.is_active === false
                          ? 'INACTIVE'
                          : 'ACTIVE'}
                    </span>

                    {item?.image_url ? (
                      <img
                        src={item.image_url}
                        alt={cleanTitle(item.title) || `Studio Ad ${slot}`}
                      />
                    ) : (
                      <div className="ssam-empty">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="ssam-slot-meta">
                    <div className="ssam-slot-title">
                      {cleanTitle(item?.title) || `Shadow Studio Ad ${slot}`}
                    </div>

                    <div className="ssam-slot-link">
                      {item?.link_url || 'No click link'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="ssam-panel ssam-editor">
          <div className="ssam-panel-head">
            <div>
              <h3>Edit Ad {selectedSlot}</h3>
              <p>
                Header format is wide. Preview uses a 5:1 ratio.
              </p>
            </div>
          </div>

          <div className="ssam-editor-body">
            {message ? (
              <div className={`ssam-message ${message.type}`}>
                {message.text}
              </div>
            ) : null}

            <div className="ssam-preview">
              {currentPreview ? (
                <img
                  src={currentPreview}
                  alt={`Shadow Studio Ad ${selectedSlot}`}
                />
              ) : (
                <div className="ssam-preview-empty">
                  No image selected
                </div>
              )}
            </div>

            <ImageDropZone
              label="Drop Shadow Studio Ad image here"
              onFiles={(files) => chooseImage(files?.[0])}
            >
              <div
                className="ssam-upload"
                onClick={() => fileRef.current?.click()}
              >
                <div className="ssam-upload-title">
                  Drop image here or click to choose
                </div>

                <div className="ssam-upload-help">
                  Recommended 1500×300 · 5:1 wide image · Max 5 MB
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    chooseImage(event.target.files?.[0])
                  }}
                />
              </div>
            </ImageDropZone>

            <label className="ssam-label">
              Ad Name
            </label>

            <input
              className="ssam-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`Shadow Studio Ad ${selectedSlot}`}
            />

            <label className="ssam-label">
              Click Link URL
            </label>

            <input
              className="ssam-input"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://shadowerabook.site/..."
            />

            <div className="ssam-toggle">
              <div>
                <div className="ssam-toggle-title">
                  Ad visibility
                </div>

                <div className="ssam-toggle-help">
                  {isActive
                    ? 'This slot can show in Shadow Studio.'
                    : 'Kept in Admin but hidden from Shadow Studio.'}
                </div>
              </div>

              <button
                type="button"
                className={`ssam-switch ${isActive ? 'on' : ''}`}
                onClick={() => setIsActive((value) => !value)}
                aria-label="Toggle Shadow Studio Ad visibility"
                aria-pressed={isActive}
              >
                <span />
              </button>
            </div>

            <div className="ssam-phone">
              <div className="ssam-phone-label">
                Shadow Studio Mobile Preview
              </div>

              <div className="ssam-phone-screen">
                <div className="ssam-phone-ad">
                  {currentPreview ? (
                    <img
                      src={currentPreview}
                      alt=""
                    />
                  ) : null}
                </div>

                <div className="ssam-phone-tools">
                  <div className="ssam-phone-dot" />
                  <div className="ssam-phone-dot" />
                  <div className="ssam-phone-line" />
                  <div className="ssam-phone-dot" />
                </div>
              </div>
            </div>

            <div className="ssam-actions">
              <button
                type="button"
                className="ssam-btn primary"
                disabled={loading}
                onClick={saveSlot}
              >
                {loading
                  ? 'Saving...'
                  : `Save Ad ${selectedSlot}`}
              </button>

              <button
                type="button"
                className="ssam-btn soft"
                disabled={loading}
                onClick={resetForm}
              >
                Reset
              </button>

              <button
                type="button"
                className="ssam-btn danger"
                disabled={loading || !selectedAd}
                onClick={deleteSlot}
              >
                Delete Ad
              </button>
            </div>

            <div className="ssam-note">
              The frontend will use only active slots. The actual Shadow Studio header connection comes in the next step.
            </div>
          </div>
        </aside>
      </div>

      <section className="ssam-panel ssam-records">
        <div className="ssam-panel-head">
          <div>
            <h3>Shadow Studio Ad Records</h3>
            <p>
              Uses the existing Slide activity log system.
            </p>
          </div>

          <button
            type="button"
            className="ssam-page"
            disabled={recordsLoading}
            onClick={() => fetchRecords(recordPage)}
          >
            {recordsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="ssam-record-list">
          {records.length ? (
            records.map((record) => (
              <div
                className="ssam-record"
                key={record.id}
              >
                <div className="ssam-record-action">
                  {record.action || 'UPDATE'}
                </div>

                <div className="ssam-record-detail">
                  <strong>
                    {cleanTitle(record.slide_title) ||
                      `Ad ${record.order_index || ''}`}
                  </strong>

                  <div>
                    {record.details || 'No detail'}
                  </div>

                  <div style={{ color: '#64748b', marginTop: 3 }}>
                    By: {record.actor || 'Admin'}
                  </div>
                </div>

                <div className="ssam-record-time">
                  {formatTime(record.created_at)}
                </div>
              </div>
            ))
          ) : (
            <div className="ssam-record-empty">
              No Shadow Studio Ad records yet.
            </div>
          )}
        </div>

        <div className="ssam-record-footer">
          <button
            type="button"
            className="ssam-page"
            disabled={recordsLoading || recordPage <= 1}
            onClick={() => fetchRecords(recordPage - 1)}
          >
            Previous
          </button>

          <span className="ssam-page-info">
            Page {recordPage} / {recordTotalPages}
          </span>

          <button
            type="button"
            className="ssam-page"
            disabled={
              recordsLoading ||
              recordPage >= recordTotalPages
            }
            onClick={() => fetchRecords(recordPage + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}
