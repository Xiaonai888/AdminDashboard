import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  :root{--bg:#F8FAFC;--card:#fff;--primary:#4F46E5;--light:#EEF2FF;--text:#0F172A;--muted:#64748B;--soft:#94A3B8;--border:#E2E8F0;--success:#10B981;--danger:#EF4444;--side:80px;--sideOpen:260px}
  *{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;background:var(--bg);color:var(--text)}
  .dashboard-wrapper{height:100vh;display:flex;background:var(--bg);overflow:hidden}.sidebar{width:var(--side);background:#fff;border-right:1px solid var(--border);padding:20px 14px;overflow:auto;overflow-x:hidden;transition:.25s;flex-shrink:0}.sidebar:hover{width:var(--sideOpen);box-shadow:10px 0 30px rgba(15,23,42,.05)}
  .sidebar-logo{height:40px;display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-left:10px}.logo-mark{width:28px;height:28px;border-radius:10px;background:#111827;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900}.logo-text{opacity:0;white-space:nowrap;color:var(--primary);font-weight:900;font-size:18px}.sidebar:hover .logo-text,.sidebar:hover .nav-text,.sidebar:hover .nav-group-label{opacity:1}.nav-group-label{opacity:0;display:block;margin:18px 0 8px 12px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--soft);white-space:nowrap}.nav-item{height:44px;display:flex;align-items:center;border-radius:12px;padding:0 12px;color:var(--muted);cursor:pointer;margin-bottom:2px;font-weight:600;white-space:nowrap}.nav-item:hover,.nav-item.active{background:var(--light);color:var(--primary)}.nav-text{opacity:0;margin-left:14px;transition:.2s}
  .main-content{flex:1;overflow:auto}.header{height:70px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 36px;position:sticky;top:0;z-index:10}.header h2{font-size:17px;font-weight:900}.content-body{padding:28px 36px 48px;max-width:1500px;margin:0 auto}.page-title-row{margin-bottom:22px}.page-title-row h1{font-size:27px;font-weight:900;letter-spacing:-.04em}.page-title-row p{font-size:13.5px;color:var(--muted);margin-top:5px}
  .tabs{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}.tab{border:1px solid var(--border);background:#fff;color:var(--muted);height:40px;border-radius:999px;padding:0 15px;font-family:inherit;font-size:12.5px;font-weight:900;cursor:pointer}.tab.active{border-color:var(--primary);background:var(--primary);color:#fff;box-shadow:0 10px 22px rgba(79,70,229,.18)}
  .shell{display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:24px;align-items:start}.panel{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:0 8px 28px rgba(15,23,42,.06);overflow:hidden}.panel-header{padding:20px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:14px;align-items:center}.panel-header h3{font-size:16px;font-weight:900}.panel-header p{font-size:12.5px;color:var(--muted);margin-top:4px}.panel-body{padding:20px 22px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field-label{display:block;font-size:12px;font-weight:900;color:#334155;margin:12px 0 7px}.input{width:100%;padding:13px 14px;border-radius:13px;border:1px solid var(--border);outline:none;background:#F8FAFC;font-size:14px;font-family:inherit}.input:focus{background:#fff;border-color:var(--primary);box-shadow:0 0 0 3px rgba(79,70,229,.1)}
  .upload-box{border:1.5px dashed #CBD5E1;background:#F8FAFC;border-radius:15px;padding:16px;margin-top:10px;cursor:pointer;text-align:center}.upload-box:hover{border-color:var(--primary);background:var(--light)}.upload-title{font-size:13px;font-weight:900}.upload-help{margin-top:4px;font-size:11.5px;color:var(--muted)}
  .toggle-row{margin-top:14px;padding:13px 14px;border:1px solid var(--border);border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:space-between}.toggle-title{font-size:13px;font-weight:900}.toggle-help{margin-top:3px;font-size:11.5px;color:var(--muted)}.switch{width:48px;height:28px;border-radius:999px;background:#CBD5E1;padding:3px;border:none;cursor:pointer}.switch.on{background:var(--success)}.switch-thumb{width:22px;height:22px;border-radius:50%;background:#fff;display:block;transition:.2s;box-shadow:0 2px 6px rgba(15,23,42,.18)}.switch.on .switch-thumb{transform:translateX(20px)}
  .btn-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.btn-primary,.btn-secondary{border:none;border-radius:14px;padding:14px 16px;font-weight:900;cursor:pointer;font-family:inherit}.btn-primary{background:var(--primary);color:#fff;box-shadow:0 12px 24px rgba(79,70,229,.22)}.btn-secondary{background:#F1F5F9;color:#334155;border:1px solid var(--border)}
  .preview-panel{position:sticky;top:92px}.phone-preview{height:620px;border-radius:34px;background:#050505;padding:16px;border:8px solid #111827;box-shadow:0 24px 60px rgba(15,23,42,.22);overflow:hidden}.phone-screen{position:relative;width:100%;height:100%;border-radius:24px;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center}.phone-screen img{width:100%;height:100%;object-fit:cover}.phone-screen.splash img{width:78%;height:78%;object-fit:contain}.preview-empty{color:#94A3B8;text-align:center;font-size:13px;font-weight:800;padding:20px}.close-pill{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.92);color:#111827;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:900}.time-pill{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.78);color:#fff;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:900}.note-box{margin-top:14px;padding:12px 14px;border-radius:14px;background:#F8FAFC;border:1px solid var(--border);color:var(--muted);font-size:12px;line-height:1.55}.saved{margin-top:14px;padding:12px 14px;border-radius:14px;background:#D1FAE5;color:#047857;font-size:13px;font-weight:900}
  @media(max-width:1100px){.shell{grid-template-columns:1fr}.preview-panel{position:static}.phone-preview{height:520px}}@media(max-width:760px){.content-body{padding:22px 16px}.header{padding:0 18px}.grid{grid-template-columns:1fr}.btn-row{grid-template-columns:1fr}}
`

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/shadow-mall', label: 'Shadow Mall', icon: 'M3 3h18v18H3z M7 7h10M7 11h10M7 15h6' },
    { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
    { path: '/authors', label: 'Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/genres', label: 'Genre', icon: 'M4 6h16M4 12h16M4 18h16' },
    { path: '/comments', label: 'Comments', icon: 'M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z' },
    { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { path: '/payment', label: 'Payment', icon: 'M21 12V7H5v10h16v-5z M5 7l8 5 8-5 M7 17h10' },
    { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
}

const defaultSettings = {
  splash: {
    title: 'Splash Logo Ad',
    enabled: true,
    imageUrl: '',
    linkUrl: '',
    durationSeconds: 2,
    closeAfterSeconds: 0,
    frequency: 'once_per_session',
  },
  opening: {
    title: 'Opening Ad',
    enabled: true,
    imageUrl: '',
    linkUrl: '',
    durationSeconds: 5,
    closeAfterSeconds: 3,
    frequency: 'once_per_session',
  },
  freeUnlock: {
    title: 'Free Unlock Ad',
    enabled: true,
    imageUrl: '',
    linkUrl: '',
    durationSeconds: 5,
    closeAfterSeconds: 3,
    frequency: 'every_unlock',
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
    label: 'Free Unlock Ad',
    help: 'Shows before free episode unlock, excluding watch-video unlock.',
    previewClass: '',
  },
}

function Icon({ d, size = 20, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const renderGroup = (items) => items.map((item) => (
    <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
      <Icon d={item.icon} size={20} />
      <span className="nav-text">{item.label}</span>
    </div>
  ))

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">S</div>
        <span className="logo-text">SHADOW</span>
      </div>
      <span className="nav-group-label">Overview</span>
      {renderGroup(navItems.overview)}
      <span className="nav-group-label">Visual & Media</span>
      {renderGroup(navItems.visualMedia)}
      <span className="nav-group-label">System</span>
      {renderGroup(navItems.systemAdmin)}
      <span className="nav-group-label">Finance</span>
      {renderGroup(navItems.finance)}
    </aside>
  )
}

function Toggle({ enabled, onClick }) {
  return (
    <button type="button" className={`switch ${enabled ? 'on' : ''}`} onClick={onClick}>
      <span className="switch-thumb" />
    </button>
  )
}

export default function AdminAdvertisementPage() {
  const [activeTab, setActiveTab] = useState('splash')
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  const current = settings[activeTab]

  const previewImage = useMemo(() => current.imageUrl || '', [current.imageUrl])

  function updateCurrent(field, value) {
    setSaved(false)
    setSettings((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }))
  }

  function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    updateCurrent('imageUrl', localUrl)
  }

  function handleSave() {
    setSaved(true)
  }

  return (
    <div className="dashboard-wrapper">
      <style>{styles}</style>
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <h2>Advertisement</h2>
        </header>

        <section className="content-body">
          <div className="page-title-row">
            <h1>Advertisement Management</h1>
            <p>Control splash logo ad, opening ad, and free unlock ad from one place.</p>
          </div>

          <div className="tabs">
            {Object.entries(tabInfo).map(([key, item]) => (
              <button key={key} type="button" className={`tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
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
                  <Toggle enabled={current.enabled} onClick={() => updateCurrent('enabled', !current.enabled)} />
                </div>

                <label className="field-label">Image URL</label>
                <input className="input" value={current.imageUrl} onChange={(event) => updateCurrent('imageUrl', event.target.value)} placeholder="https://example.com/ad-image.jpg" />

                <label className="upload-box">
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                  <div className="upload-title">Upload Preview Image</div>
                  <div className="upload-help">Local preview only in this stage. Backend upload will be connected next.</div>
                </label>

                {activeTab !== 'splash' && (
                  <>
                    <label className="field-label">Click Link URL</label>
                    <input className="input" value={current.linkUrl} onChange={(event) => updateCurrent('linkUrl', event.target.value)} placeholder="https://example.com" />
                  </>
                )}

                <div className="grid">
                  <div>
                    <label className="field-label">Duration Seconds</label>
                    <input className="input" type="number" min="1" value={current.durationSeconds} onChange={(event) => updateCurrent('durationSeconds', Number(event.target.value))} />
                  </div>

                  <div>
                    <label className="field-label">Close After Seconds</label>
                    <input className="input" type="number" min="0" value={current.closeAfterSeconds} onChange={(event) => updateCurrent('closeAfterSeconds', Number(event.target.value))} />
                  </div>
                </div>

                <label className="field-label">Frequency</label>
                <select className="input" value={current.frequency} onChange={(event) => updateCurrent('frequency', event.target.value)}>
                  <option value="once_per_session">Once per session</option>
                  <option value="once_per_day">Once per day</option>
                  <option value="every_visit">Every visit</option>
                  <option value="every_unlock">Every unlock</option>
                </select>

                <div className="note-box">
                  Native app splash may still appear for a short moment. This page controls the in-app splash and ads after the website loads.
                </div>

                {saved && <div className="saved">Saved preview settings.</div>}

                <div className="btn-row">
                  <button type="button" className="btn-secondary" onClick={() => setSettings(defaultSettings)}>Reset</button>
                  <button type="button" className="btn-primary" onClick={handleSave}>Save</button>
                </div>
              </div>
            </section>

            <aside className="panel preview-panel">
              <div className="panel-header">
                <div>
                  <h3>Mobile Preview</h3>
                  <p>Preview how this ad feels on reader app.</p>
                </div>
              </div>
              <div className="panel-body">
                <div className="phone-preview">
                  <div className={`phone-screen ${tabInfo[activeTab].previewClass}`}>
                    {previewImage ? (
                      <img src={previewImage} alt={tabInfo[activeTab].label} />
                    ) : (
                      <div className="preview-empty">Upload or paste image URL to preview.</div>
                    )}
                    {current.closeAfterSeconds > 0 && <div className="close-pill">X after {current.closeAfterSeconds}s</div>}
                    <div className="time-pill">{current.durationSeconds}s</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}
