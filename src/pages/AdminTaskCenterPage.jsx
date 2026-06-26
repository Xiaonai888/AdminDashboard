import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  :root{--bg:#F8FAFC;--card:#fff;--primary:#4F46E5;--light:#EEF2FF;--text:#0F172A;--muted:#64748B;--soft:#94A3B8;--border:#E2E8F0;--success:#10B981;--danger:#EF4444;--side:80px;--sideOpen:260px}
  *{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,sans-serif;background:var(--bg);color:var(--text)}
  .dashboard-wrapper{height:100vh;display:flex;background:var(--bg);overflow:hidden}.sidebar{width:var(--side);background:#fff;border-right:1px solid var(--border);padding:20px 14px;overflow:auto;overflow-x:hidden;transition:.25s;flex-shrink:0}.sidebar:hover{width:var(--sideOpen);box-shadow:10px 0 30px rgba(15,23,42,.05)}
  .sidebar-logo{height:40px;display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-left:10px}.logo-mark{width:28px;height:28px;border-radius:10px;background:#111827;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900}.logo-text{opacity:0;white-space:nowrap;color:var(--primary);font-weight:900;font-size:18px}.sidebar:hover .logo-text,.sidebar:hover .nav-text,.sidebar:hover .nav-group-label{opacity:1}.nav-group-label{opacity:0;display:block;margin:18px 0 8px 12px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--soft);white-space:nowrap}.nav-item{height:44px;display:flex;align-items:center;border-radius:12px;padding:0 12px;color:var(--muted);cursor:pointer;margin-bottom:2px;font-weight:600;white-space:nowrap}.nav-item:hover,.nav-item.active{background:var(--light);color:var(--primary)}.nav-text{opacity:0;margin-left:14px;transition:.2s}
  .main-content{flex:1;overflow:auto}.header{height:70px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 36px;position:sticky;top:0;z-index:10}.header h2{font-size:17px;font-weight:900}.content-body{padding:28px 36px 48px;max-width:1500px;margin:0 auto}.page-title-row{margin-bottom:22px}.page-title-row h1{font-size:27px;font-weight:900;letter-spacing:-.04em}.page-title-row p{font-size:13.5px;color:var(--muted);margin-top:5px}
  .shell{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:24px;align-items:start}.panel{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:0 8px 28px rgba(15,23,42,.06);overflow:hidden}.panel-header{padding:20px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:14px;align-items:center}.panel-header h3{font-size:16px;font-weight:900}.panel-header p{font-size:12.5px;color:var(--muted);margin-top:4px}.panel-body{padding:20px 22px}
  .cover-preview{aspect-ratio:16/9;border-radius:18px;border:1px solid var(--border);background:linear-gradient(135deg,#F8FAFC,#EEF2FF);overflow:hidden;display:flex;align-items:center;justify-content:center}.cover-preview img{width:100%;height:100%;object-fit:cover}.cover-empty{font-size:13px;font-weight:900;color:var(--soft);text-align:center}.upload-box{border:1.5px dashed #CBD5E1;background:#F8FAFC;border-radius:15px;padding:16px;margin-top:14px;cursor:pointer;text-align:center}.upload-box:hover{border-color:var(--primary);background:var(--light)}.upload-title{font-size:13px;font-weight:900}.upload-help{margin-top:4px;font-size:11.5px;color:var(--muted)}
  .btn-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.btn-primary,.btn-secondary{border:none;border-radius:14px;padding:14px 16px;font-weight:900;cursor:pointer;font-family:inherit}.btn-primary{background:var(--primary);color:#fff;box-shadow:0 12px 24px rgba(79,70,229,.22)}.btn-primary:disabled,.btn-secondary:disabled{opacity:.65;cursor:not-allowed}.btn-secondary{background:#F1F5F9;color:#334155;border:1px solid var(--border)}
  .message{margin-top:14px;padding:12px 14px;border-radius:14px;font-size:13px;font-weight:900;line-height:1.45}.message.success{background:#D1FAE5;color:#047857}.message.error{background:#FEE2E2;color:#B91C1C}.message.info{background:#EEF2FF;color:#4F46E5}.note-box{margin-top:14px;padding:12px 14px;border-radius:14px;background:#F8FAFC;border:1px solid var(--border);color:var(--muted);font-size:12px;line-height:1.55}
  .task-list{display:grid;gap:12px}.task-card{display:flex;align-items:center;justify-content:space-between;gap:16px;border:1px solid var(--border);background:#fff;border-radius:18px;padding:16px}.task-left{display:flex;align-items:center;gap:13px}.task-icon{width:42px;height:42px;border-radius:50%;background:#F8FAFC;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:#0F172A}.task-title{font-size:14px;font-weight:900}.task-sub{font-size:12px;color:var(--muted);margin-top:3px}.task-reward{margin-top:7px;font-size:12px;font-weight:900;color:#D97706}.status-pill{border-radius:999px;background:#F1F5F9;color:#64748B;font-size:11px;font-weight:900;padding:7px 10px}.preview-panel{position:sticky;top:92px}.mini-cover{aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#EEF2FF;border:1px solid var(--border)}.mini-cover img{width:100%;height:100%;object-fit:cover}.mini-empty{height:100%;display:flex;align-items:center;justify-content:center;color:#94A3B8;font-size:12px;font-weight:900;text-align:center;padding:18px}
  @media(max-width:1100px){.shell{grid-template-columns:1fr}.preview-panel{position:static}}@media(max-width:760px){.content-body{padding:22px 16px}.header{padding:0 18px}.btn-row{grid-template-columns:1fr}}
`

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}>
    <path d={d} />
  </svg>
)

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { path: '/task-center', label: 'Task Center', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { path: '/shadow-mall', label: 'Shadow Mall', icon: 'M3 3h18v18H3z M7 7h10M7 11h10M7 15h6' },
  { path: '/shadow-exclusive', label: 'Shadow Exclusive', icon: 'M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z M9 12l2 2 4-5' },
  { path: '/authors', label: 'Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { path: '/stories', label: 'Stories', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
]

const rewardTasks = [
  { title: 'Read 10 minutes', text: 'Read stories for 10 minutes today.', reward: '+20 Coins' },
  { title: 'Read 30 minutes', text: 'Keep reading longer to earn more coins.', reward: '+60 Coins' },
  { title: 'Add story to Library', text: 'Save one story you want to continue reading.', reward: '+30 Coins' },
  { title: 'Read selected story', text: 'Admin can choose a story target later.', reward: '+50 Coins' },
]

function getAdminToken() {
  const sessionToken = sessionStorage.getItem('shadow_admin_token') || ''
  const localToken = localStorage.getItem('shadow_admin_token') || ''
  const token = sessionToken || localToken

  if (token && !sessionToken) {
    sessionStorage.setItem('shadow_admin_token', token)
  }

  return token
}

export default function AdminTaskCenterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef(null)
  const [settings, setSettings] = useState({ cover_url: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: 'info', text: '' })

  const coverUrl = previewUrl || settings.cover_url || ''

  async function loadSettings() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/task-center/admin`, {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to load task center cover')
      }

      setSettings(data.settings || { cover_url: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load task center cover' })
    } finally {
      setLoading(false)
    }
  }

  function handleSelectFile(file) {
    if (!file) return

    if (!['image/webp', 'image/jpeg', 'image/png'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Only WebP, JPG, or PNG cover images are allowed.' })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setMessage({ type: 'info', text: 'Cover selected. Click Save Cover to upload it.' })
  }

  async function saveCover() {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please choose a cover image first.' })
      return
    }

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('cover', selectedFile)

      const response = await fetch(`${API_URL}/api/task-center/admin/cover`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to save cover')
      }

      setSettings(data.settings || { cover_url: '' })
      setSelectedFile(null)
      setPreviewUrl('')
      setMessage({ type: 'success', text: 'Task cover saved successfully.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save cover' })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">S</div>
            <span className="logo-text">Shadow Exclusive</span>
          </div>

          <span className="nav-group-label">Overview</span>
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <Icon d={item.icon} size={18} />
              <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </aside>

        <main className="main-content">
          <header className="header">
            <h2>Task Center</h2>
          </header>

          <section className="content-body">
            <div className="page-title-row">
              <h1>Task Center</h1>
              <p>Manage the Task Center cover and prepare reward task controls.</p>
            </div>

            <div className="shell">
              <div>
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Task Cover</h3>
                      <p>Upload one 16:9 cover image for the reader Task Center page.</p>
                    </div>
                  </div>

                  <div className="panel-body">
                    <div className="cover-preview">
                      {coverUrl ? <img src={coverUrl} alt="Task Center Cover" /> : <div className="cover-empty">{loading ? 'Loading cover...' : 'No cover uploaded yet'}</div>}
                    </div>

                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/webp,image/jpeg,image/png"
                      style={{ display: 'none' }}
                      onChange={(event) => handleSelectFile(event.target.files?.[0])}
                    />

                    <div className="upload-box" onClick={() => inputRef.current?.click()}>
                      <div className="upload-title">Choose Cover Image</div>
                      <div className="upload-help">Recommended 16:9 WebP, 1600x900, 150KB-400KB.</div>
                    </div>

                    <div className="btn-row">
                      <button type="button" className="btn-primary" onClick={saveCover} disabled={saving || !selectedFile}>
                        {saving ? 'Saving...' : 'Save Cover'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={!selectedFile}
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl('')
                          setMessage({ type: 'info', text: '' })
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    {message.text ? <div className={`message ${message.type}`}>{message.text}</div> : null}

                    <div className="note-box">
                      Cover files are uploaded to Cloudflare R2 through the backend. This page only controls the main Task Center cover for now.
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ marginTop: 24 }}>
                  <div className="panel-header">
                    <div>
                      <h3>Reward Tasks</h3>
                      <p>UI placeholder for future task active controls and story target rewards.</p>
                    </div>
                  </div>

                  <div className="panel-body">
                    <div className="task-list">
                      {rewardTasks.map((task) => (
                        <div className="task-card" key={task.title}>
                          <div className="task-left">
                            <div className="task-icon">
                              <Icon d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" size={18} />
                            </div>
                            <div>
                              <div className="task-title">{task.title}</div>
                              <div className="task-sub">{task.text}</div>
                              <div className="task-reward">{task.reward}</div>
                            </div>
                          </div>
                          <span className="status-pill">Later</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="preview-panel">
                <div className="panel">
                  <div className="panel-header">
                    <div>
                      <h3>Preview</h3>
                      <p>Cover preview only.</p>
                    </div>
                  </div>

                  <div className="panel-body">
                    <div className="mini-cover">
                      {coverUrl ? <img src={coverUrl} alt="Task Cover Preview" /> : <div className="mini-empty">No cover preview</div>}
                    </div>

                    <div className="note-box">
                      After this cover works, the Web-React Task page can load this URL from the public endpoint.
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
