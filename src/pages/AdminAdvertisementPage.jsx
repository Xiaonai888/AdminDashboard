import React, { useEffect, useMemo, useRef, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `

  :root {
    --bg:#F8FAFC;
    --card:#FFFFFF;
    --primary:#4F46E5;
    --light:#EEF2FF;
    --text:#0F172A;
    --muted:#64748B;
    --soft:#94A3B8;
    --border:#E2E8F0;
    --success:#10B981;
    --danger:#EF4444;
  }

  * {
    box-sizing:border-box;
    margin:0;
    padding:0;
  }

  body {
    background:var(--bg);
    color:var(--text);
  }

  .dashboard-wrapper {
    height:100vh;
    display:flex;
    background:var(--bg);
    overflow:hidden;
  }

  .main-content {
    flex:1;
    min-width:0;
    overflow:auto;
  }

  .header {
    height:70px;
    background:#FFFFFF;
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    padding:0 36px;
    position:sticky;
    top:0;
    z-index:10;
  }

  .header h2 {
    font-size:17px;
    font-weight:900;
  }

  .content-body {
    padding:28px 36px 48px;
    max-width:1500px;
    margin:0 auto;
  }

  .page-title-row {
    margin-bottom:22px;
  }

  .page-title-row h1 {
    font-size:27px;
    font-weight:900;
    letter-spacing:-.04em;
  }

  .page-title-row p {
    font-size:13.5px;
    color:var(--muted);
    margin-top:5px;
    line-height:1.5;
  }

  .tabs {
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:20px;
  }

  .tab {
    border:1px solid var(--border);
    background:#FFFFFF;
    color:var(--muted);
    height:40px;
    border-radius:999px;
    padding:0 15px;
    font-family:inherit;
    font-size:12.5px;
    font-weight:900;
    cursor:pointer;
    white-space:nowrap;
  }

  .tab.active {
    border-color:var(--primary);
    background:var(--primary);
    color:#FFFFFF;
    box-shadow:0 10px 22px rgba(79,70,229,.18);
  }

  .shell {
    display:grid;
    grid-template-columns:minmax(0,1fr) 390px;
    gap:24px;
    align-items:start;
  }

  .panel {
    background:#FFFFFF;
    border:1px solid var(--border);
    border-radius:22px;
    box-shadow:0 8px 28px rgba(15,23,42,.06);
    overflow:hidden;
  }

  .panel-header {
    padding:20px 22px;
    border-bottom:1px solid var(--border);
    display:flex;
    justify-content:space-between;
    gap:14px;
    align-items:center;
  }

  .panel-header h3 {
    font-size:16px;
    font-weight:900;
  }

  .panel-header p {
    font-size:12.5px;
    color:var(--muted);
    margin-top:4px;
    line-height:1.5;
  }

  .panel-body {
    padding:20px 22px;
  }

  .grid {
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:14px;
  }

  .field-label {
    display:block;
    font-size:12px;
    font-weight:900;
    color:#334155;
    margin:12px 0 7px;
  }

  .input {
    width:100%;
    padding:13px 14px;
    border-radius:13px;
    border:1px solid var(--border);
    outline:none;
    background:#F8FAFC;
    font-size:14px;
    font-family:inherit;
  }

  .input:focus {
    background:#FFFFFF;
    border-color:var(--primary);
    box-shadow:0 0 0 3px rgba(79,70,229,.1);
  }

  .upload-box {
    display:block;
    border:1.5px dashed #CBD5E1;
    background:#F8FAFC;
    border-radius:15px;
    padding:16px;
    margin-top:10px;
    cursor:pointer;
    text-align:center;
  }

  .upload-box:hover {
    border-color:var(--primary);
    background:var(--light);
  }

  .upload-title {
    font-size:13px;
    font-weight:900;
  }

  .upload-help {
    margin-top:4px;
    font-size:11.5px;
    color:var(--muted);
    line-height:1.5;
  }

  .toggle-row {
    margin-top:14px;
    padding:13px 14px;
    border:1px solid var(--border);
    border-radius:14px;
    background:#FFFFFF;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
  }

  .toggle-title {
    font-size:13px;
    font-weight:900;
  }

  .toggle-help {
    margin-top:3px;
    font-size:11.5px;
    color:var(--muted);
  }

  .switch {
    width:48px;
    height:28px;
    flex-shrink:0;
    border-radius:999px;
    background:#CBD5E1;
    padding:3px;
    border:none;
    cursor:pointer;
  }

  .switch.on {
    background:var(--success);
  }

  .switch-thumb {
    width:22px;
    height:22px;
    border-radius:50%;
    background:#FFFFFF;
    display:block;
    transition:.2s;
    box-shadow:0 2px 6px rgba(15,23,42,.18);
  }

  .switch.on .switch-thumb {
    transform:translateX(20px);
  }

  .btn-row {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
    margin-top:18px;
  }

  .btn-primary,
  .btn-secondary {
    border:none;
    border-radius:14px;
    padding:14px 16px;
    font-weight:900;
    cursor:pointer;
    font-family:inherit;
  }

  .btn-primary {
    background:var(--primary);
    color:#FFFFFF;
    box-shadow:0 12px 24px rgba(79,70,229,.22);
  }

  .btn-primary:disabled,
  .btn-secondary:disabled {
    opacity:.65;
    cursor:not-allowed;
  }

  .btn-secondary {
    background:#F1F5F9;
    color:#334155;
    border:1px solid var(--border);
  }

  .preview-panel {
    position:sticky;
    top:92px;
  }

  .phone-preview {
    height:620px;
    max-width:360px;
    margin:0 auto;
    border-radius:34px;
    background:#050505;
    padding:16px;
    border:8px solid #111827;
    box-shadow:0 24px 60px rgba(15,23,42,.22);
    overflow:hidden;
  }

  .phone-screen {
    position:relative;
    width:100%;
    height:100%;
    border-radius:24px;
    background:#000000;
    overflow:hidden;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .phone-screen img {
    width:100%;
    height:100%;
    object-fit:cover;
  }

  .phone-screen.splash img {
    width:78%;
    height:78%;
    object-fit:contain;
  }

  .phone-screen.me-ad {
    padding:48px 28px;
    background:#111827;
  }

  .phone-screen.me-ad img {
    width:100%;
    height:auto;
    max-height:82%;
    aspect-ratio:3/4;
    object-fit:cover;
    border-radius:20px;
    box-shadow:0 18px 45px rgba(0,0,0,.45);
  }

  .preview-empty {
    color:#94A3B8;
    text-align:center;
    font-size:13px;
    font-weight:800;
    padding:20px;
  }

  .close-pill {
    position:absolute;
    top:14px;
    right:14px;
    background:rgba(255,255,255,.92);
    color:#111827;
    border-radius:999px;
    padding:8px 11px;
    font-size:12px;
    font-weight:900;
  }

  .time-pill {
    position:absolute;
    bottom:14px;
    left:50%;
    transform:translateX(-50%);
    background:rgba(15,23,42,.78);
    color:#FFFFFF;
    border-radius:999px;
    padding:8px 12px;
    font-size:12px;
    font-weight:900;
    white-space:nowrap;
  }

  .note-box {
    margin-top:14px;
    padding:12px 14px;
    border-radius:14px;
    background:#F8FAFC;
    border:1px solid var(--border);
    color:var(--muted);
    font-size:12px;
    line-height:1.55;
  }

  .saved {
    margin-top:14px;
    padding:12px 14px;
    border-radius:14px;
    background:#D1FAE5;
    color:#047857;
    font-size:13px;
    font-weight:900;
  }

  .error-box {
    margin-top:14px;
    padding:12px 14px;
    border-radius:14px;
    background:#FEE2E2;
    color:#B91C1C;
    font-size:13px;
    font-weight:900;
    line-height:1.45;
    overflow-wrap:anywhere;
  }

  .records-panel {
    margin-top:24px;
  }

  .records-list {
    padding:18px;
  }

  .record-empty {
    padding:18px;
    border-radius:14px;
    background:#F8FAFC;
    border:1px solid var(--border);
    color:var(--muted);
    font-size:13px;
  }

  .record-item {
    display:grid;
    grid-template-columns:120px minmax(0,1fr) 150px;
    gap:14px;
    align-items:center;
    padding:14px 0;
    border-bottom:1px solid #F1F5F9;
  }

  .record-action {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:max-content;
    min-width:86px;
    padding:6px 10px;
    border-radius:999px;
    font-weight:900;
    font-size:11px;
    letter-spacing:.35px;
    text-transform:uppercase;
  }

  .record-action.update {
    background:#EEF2FF;
    color:#4F46E5;
  }

  .record-action.disable {
    background:#FEE2E2;
    color:#DC2626;
  }

  .record-detail {
    min-width:0;
    font-size:13px;
    color:#334155;
    line-height:1.45;
    overflow-wrap:anywhere;
  }

  .record-time {
    text-align:right;
    font-size:12px;
    color:var(--muted);
  }

  .records-footer {
    padding:0 18px 18px;
    display:flex;
    justify-content:flex-end;
    align-items:center;
    gap:10px;
  }

  .page-btn {
    border:1px solid var(--border);
    background:#FFFFFF;
    border-radius:12px;
    padding:10px 14px;
    font-weight:900;
    cursor:pointer;
  }

  .page-btn:disabled {
    opacity:.45;
    cursor:not-allowed;
  }

  .page-info {
    font-size:12px;
    font-weight:900;
    color:#475569;
    white-space:nowrap;
  }

  @media(max-width:1100px) {
    .shell {
      grid-template-columns:1fr;
    }

    .preview-panel {
      position:static;
    }

    .phone-preview {
      height:min(620px, 78vh);
    }
  }

  @media(max-width:760px) {
    .content-body {
      padding:22px 16px 40px;
    }

    .header {
      padding-right:16px;
    }

    .page-title-row h1 {
      font-size:24px;
    }

    .tabs {
      flex-wrap:nowrap;
      overflow-x:auto;
      padding-bottom:6px;
      scrollbar-width:none;
    }

    .tabs::-webkit-scrollbar {
      display:none;
    }

    .tab {
      flex:0 0 auto;
    }

    .shell {
      gap:18px;
    }

    .panel-header,
    .panel-body {
      padding:18px;
    }

    .grid,
    .btn-row {
      grid-template-columns:1fr;
    }

    .phone-preview {
      width:min(100%, 340px);
      height:min(590px, 72vh);
      padding:12px;
      border-width:6px;
      border-radius:30px;
    }

    .phone-screen {
      border-radius:21px;
    }

    .phone-screen.me-ad {
      padding:34px 20px;
    }

    .record-item {
      grid-template-columns:1fr;
      gap:8px;
    }

    .record-time {
      text-align:left;
    }

    .records-list {
      padding:14px 18px;
    }

    .records-footer {
      justify-content:center;
      flex-wrap:wrap;
    }
  }

  @media(max-width:520px) {
    .page-title-row {
      margin-bottom:18px;
    }

    .page-title-row h1 {
      font-size:22px;
    }

    .tab {
      height:40px;
      padding:0 14px;
      font-size:12px;
    }

    .toggle-row {
      align-items:flex-start;
    }

    .phone-preview {
      width:100%;
      height:auto;
      aspect-ratio:9/16;
      max-height:none;
    }

    .panel-header {
      align-items:flex-start;
    }

    .records-footer {
      display:grid;
      grid-template-columns:1fr auto 1fr;
      width:100%;
    }

    .records-footer .page-btn {
      width:100%;
      padding:10px 8px;
    }

    .page-info {
      text-align:center;
    }
  }
`

const defaultSettings = {
  splash: {
    title: 'Splash Logo Ad',
    enabled: false,
    imageUrl: '',
    linkUrl: '',
    durationSeconds: 2,
    closeAfterSeconds: 0,
    frequency: 'once_per_session',
  },
  opening: {
    title: 'Opening Ad',
    enabled: false,
    imageUrl: '',
    linkUrl: '',
    durationSeconds: 5,
    closeAfterSeconds: 3,
    frequency: 'once_per_session',
  },
  freeUnlock: {
    title: 'Free Unlock & Read Ad',
    enabled: false,
    imageUrl: '',
    linkUrl: '',
    durationSeconds: 5,
    closeAfterSeconds: 3,
    frequency: 'every_unlock',
  },
  me: {
    title: 'Me Ads',
    enabled: false,
    imageUrl: '',
    linkUrl: '',
    durationSeconds: 8,
    closeAfterSeconds: 3,
    frequency: 'once_per_session',
  },
}

const tabInfo = {
  splash: {
    label: 'Splash Logo Ad',
    help: 'Shows after the native app splash. Use a clear brand image on black background.',
    previewClass: 'splash',
  },
  opening: {
    label: 'Opening Ad',
    help: 'Shows after the splash logo ad when users open the website or app.',
    previewClass: '',
  },
  freeUnlock: {
    label: 'Free Unlock & Read Ad',
    help: 'Shows for free or coin-supported reading, excluding Diamond unlock and Premium readers.',
    previewClass: '',
  },
  me: {
    label: 'Me Ads',
    help: 'Shows only when users open the Me page. Use a vertical advertisement image.',
    previewClass: 'me-ad',
  },
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function toSetting(item) {
  return {
    title: defaultSettings[item.placement]?.title || item.placement,
    enabled: Boolean(item.enabled),
    imageUrl: item.image_url || '',
    linkUrl: item.link_url || '',
    durationSeconds: Number(item.duration_seconds || 0),
    closeAfterSeconds: Number(item.close_after_seconds || 0),
    frequency: item.frequency || 'once_per_session',
  }
}

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

function getRecordActionClass(action) {
  const key = String(action || '').toLowerCase()
  if (key === 'disable') return 'disable'
  return 'update'
}

function Toggle({ enabled, onClick }) {
  return (
    <button
      type="button"
      className={`switch ${enabled ? 'on' : ''}`}
      onClick={onClick}
      aria-label={enabled ? 'Disable advertisement' : 'Enable advertisement'}
      aria-pressed={enabled}
    >
      <span className="switch-thumb" />
    </button>
  )
}

export default function AdminAdvertisementPage() {
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('splash')
  const [settings, setSettings] = useState(defaultSettings)
  const [selectedFiles, setSelectedFiles] = useState({})
  const [previewUrls, setPreviewUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')
  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordPage, setRecordPage] = useState(1)
  const [recordTotalPages, setRecordTotalPages] = useState(1)

  const current = settings[activeTab]
  const previewImage = useMemo(
    () => previewUrls[activeTab] || current.imageUrl || '',
    [previewUrls, activeTab, current.imageUrl],
  )

  function updateCurrent(field, value) {
    setSaved('')
    setError('')
    setSettings((previous) => ({
      ...previous,
      [activeTab]: {
        ...previous[activeTab],
        [field]: value,
      },
    }))
  }

  async function loadAdvertisements() {
    try {
      setLoading(true)
      setSaved('')
      setError('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/advertisements/admin`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load advertisements')
      }

      const nextSettings = {
        splash: { ...defaultSettings.splash },
        opening: { ...defaultSettings.opening },
        freeUnlock: { ...defaultSettings.freeUnlock },
        me: { ...defaultSettings.me },
      }

      ;(data.advertisements || []).forEach((item) => {
        if (item.placement && nextSettings[item.placement]) {
          nextSettings[item.placement] = toSetting(item)
        }
      })

      setSettings(nextSettings)
      setSelectedFiles({})
      setPreviewUrls({})
    } catch (requestError) {
      setError(requestError.message || 'Failed to load advertisements')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecords(page = 1, placement = activeTab) {
    try {
      setRecordsLoading(true)

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}/api/advertisements/admin/logs?page=${page}&limit=20&placement=${placement}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load advertisement records')
      }

      setRecords(Array.isArray(data.logs) ? data.logs : [])
      setRecordPage(Number(data.page || page))
      setRecordTotalPages(Number(data.total_pages || 1))
    } catch {
      setRecords([])
      setRecordTotalPages(1)
    } finally {
      setRecordsLoading(false)
    }
  }

  function handleUpload(event) {
    const file = event.target.files?.[0]

    if (!file) return

    const previousPreview = previewUrls[activeTab]

    if (previousPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(previousPreview)
    }

    setSelectedFiles((previous) => ({
      ...previous,
      [activeTab]: file,
    }))
    setPreviewUrls((previous) => ({
      ...previous,
      [activeTab]: URL.createObjectURL(file),
    }))
    setSaved('')
    setError('')
  }

  async function handleSave() {
    try {
      setSaving(true)
      setSaved('')
      setError('')

      const token = getAdminToken()
      const formData = new FormData()
      const file = selectedFiles[activeTab]

      if (file) formData.append('image', file)

      formData.append('enabled', String(current.enabled))
      formData.append('image_url', current.imageUrl || '')
      formData.append('link_url', current.linkUrl || '')
      formData.append('duration_seconds', String(current.durationSeconds))
      formData.append('close_after_seconds', String(current.closeAfterSeconds))
      formData.append('frequency', current.frequency)

      const response = await fetch(`${API_URL}/api/advertisements/admin/${activeTab}`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save advertisement')
      }

      if (data.advertisement?.placement) {
        setSettings((previous) => ({
          ...previous,
          [data.advertisement.placement]: toSetting(data.advertisement),
        }))
      }

      const previewUrl = previewUrls[activeTab]

      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }

      setSelectedFiles((previous) => ({
        ...previous,
        [activeTab]: null,
      }))
      setPreviewUrls((previous) => ({
        ...previous,
        [activeTab]: '',
      }))

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setSaved('Saved real advertisement data.')
      fetchRecords(1, activeTab)
    } catch (requestError) {
      setError(requestError.message || 'Failed to save advertisement')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadAdvertisements()
  }, [])

  useEffect(() => {
    setRecordPage(1)
    fetchRecords(1, activeTab)
  }, [activeTab])

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [previewUrls])

  return (
    <div className="dashboard-wrapper">
      <style>{styles}</style>
      <AdminSidebar />

      <main className="main-content">
        <header className="header">
          <h2>Advertisement</h2>
        </header>

        <section className="content-body">
          <div className="page-title-row">
            <h1>Advertisement Management</h1>
            <p>Control splash logo ad, opening ad, free unlock ad, and Me page ad from one place.</p>
          </div>

          <div className="tabs">
            {Object.entries(tabInfo).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="shell">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>{tabInfo[activeTab].label}</h3>
                  <p>{tabInfo[activeTab].help}</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="toggle-row">
                  <div>
                    <div className="toggle-title">Enable</div>
                    <div className="toggle-help">Turn this ad placement on or off.</div>
                  </div>

                  <Toggle
                    enabled={current.enabled}
                    onClick={() => updateCurrent('enabled', !current.enabled)}
                  />
                </div>

                <label className="field-label">Image URL</label>
                <input
                  className="input"
                  value={current.imageUrl}
                  onChange={(event) => updateCurrent('imageUrl', event.target.value)}
                  placeholder="Auto-filled after upload"
                />

                <label className="upload-box">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-title">Upload Image</div>
                  <div className="upload-help">
                    This uploads to Supabase Storage when you click Save.
                  </div>
                </label>

                {activeTab !== 'splash' && (
                  <>
                    <label className="field-label">Click Link URL</label>
                    <input
                      className="input"
                      value={current.linkUrl}
                      onChange={(event) => updateCurrent('linkUrl', event.target.value)}
                      placeholder="https://example.com"
                    />
                  </>
                )}

                <div className="grid">
                  <div>
                    <label className="field-label">Duration Seconds</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={current.durationSeconds}
                      onChange={(event) =>
                        updateCurrent('durationSeconds', Number(event.target.value))
                      }
                    />
                  </div>

                  <div>
                    <label className="field-label">Close After Seconds</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={current.closeAfterSeconds}
                      onChange={(event) =>
                        updateCurrent('closeAfterSeconds', Number(event.target.value))
                      }
                    />
                  </div>
                </div>

                <label className="field-label">Frequency</label>
                <select
                  className="input"
                  value={current.frequency}
                  onChange={(event) => updateCurrent('frequency', event.target.value)}
                >
                  <option value="once_per_session">Once per session</option>
                  <option value="once_per_day">Once per day</option>
                  <option value="every_visit">Every visit</option>
                  <option value="every_unlock">Every Unlock & Read</option>
                </select>

                <div className="note-box">
                  Upload works like Slide/Banner images. Image URL is filled after Save.
                </div>

                {saved ? <div className="saved">{saved}</div> : null}
                {error ? <div className="error-box">{error}</div> : null}

                <div className="btn-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={loadAdvertisements}
                    disabled={loading || saving}
                  >
                    {loading ? 'Loading...' : 'Reload'}
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </section>

            <aside className="panel preview-panel">
              <div className="panel-header">
                <div>
                  <h3>Mobile Preview</h3>
                  <p>Preview how this placement will look on phone.</p>
                </div>
              </div>

              <div className="panel-body">
                <div className="phone-preview">
                  <div className={`phone-screen ${tabInfo[activeTab].previewClass}`}>
                    {previewImage ? (
                      <>
                        <img src={previewImage} alt="Advertisement preview" />
                        {current.closeAfterSeconds > 0 && (
                          <span className="close-pill">
                            Close in {current.closeAfterSeconds}s
                          </span>
                        )}
                        <span className="time-pill">{current.durationSeconds}s</span>
                      </>
                    ) : (
                      <div className="preview-empty">
                        Upload an image to preview this advertisement.
                      </div>
                    )}
                  </div>
                </div>

                <div className="note-box">
                  Active placement: {tabInfo[activeTab].label}. Current status:{' '}
                  {current.enabled ? 'Enabled' : 'Disabled'}.
                </div>
              </div>
            </aside>
          </div>

          <section className="panel records-panel">
            <div className="panel-header">
              <div>
                <h3>Advertisement Records</h3>
                <p>
                  Recent advertisement actions for {tabInfo[activeTab].label}. Records are
                  shown 20 per page.
                </p>
              </div>

              <button
                className="page-btn"
                type="button"
                onClick={() => fetchRecords(recordPage, activeTab)}
                disabled={recordsLoading}
              >
                {recordsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="records-list">
              {records.length === 0 ? (
                <div className="record-empty">
                  No records yet. Save this advertisement once to create the first record.
                </div>
              ) : (
                records.map((record) => (
                  <div className="record-item" key={record.id}>
                    <div className={`record-action ${getRecordActionClass(record.action)}`}>
                      {record.action || 'UPDATE'}
                    </div>

                    <div className="record-detail">
                      <strong>
                        {tabInfo[record.placement]?.label ||
                          record.placement ||
                          'Advertisement'}
                      </strong>
                      <div>{record.details || 'No detail'}</div>
                      <div style={{ color: 'var(--muted)', marginTop: 4 }}>
                        By: {record.actor || 'Admin'}
                      </div>
                    </div>

                    <div className="record-time">{formatTime(record.created_at)}</div>
                  </div>
                ))
              )}
            </div>

            <div className="records-footer">
              <button
                className="page-btn"
                type="button"
                disabled={recordPage <= 1 || recordsLoading}
                onClick={() => fetchRecords(recordPage - 1, activeTab)}
              >
                Previous
              </button>

              <span className="page-info">
                Page {recordPage} / {recordTotalPages}
              </span>

              <button
                className="page-btn"
                type="button"
                disabled={recordPage >= recordTotalPages || recordsLoading}
                onClick={() => fetchRecords(recordPage + 1, activeTab)}
              >
                Next
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}
