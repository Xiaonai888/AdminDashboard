import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import TaskCenterReadingModePanel from '../components/TaskCenterReadingModePanel'
import TaskCenterReaderActivityPanel from '../components/TaskCenterReaderActivityPanel'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const USE_LEGACY_SIDEBAR = false

const styles = `
  :root{--bg:#F8FAFC;--card:#fff;--primary:#4F46E5;--light:#EEF2FF;--text:#0F172A;--muted:#64748B;--soft:#94A3B8;--border:#E2E8F0;--success:#10B981;--danger:#EF4444;--side:80px;--sideOpen:260px}
  *{box-sizing:border-box;margin:0;padding:0}body{background:var(--bg);color:var(--text)}
  .dashboard-wrapper{height:100vh;display:flex;background:var(--bg);overflow:hidden}.sidebar{width:var(--side);background:#fff;border-right:1px solid var(--border);padding:20px 14px;overflow:auto;overflow-x:hidden;transition:.25s;flex-shrink:0}.sidebar:hover{width:var(--sideOpen);box-shadow:10px 0 30px rgba(15,23,42,.05)}
  .sidebar-logo{height:40px;display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-left:10px}.logo-mark{width:28px;height:28px;border-radius:10px;background:#111827;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:900}.logo-text{opacity:0;white-space:nowrap;color:var(--primary);font-weight:900;font-size:18px}.sidebar:hover .logo-text,.sidebar:hover .nav-text,.sidebar:hover .nav-group-label{opacity:1}.nav-group-label{opacity:0;display:block;margin:18px 0 8px 12px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--soft);white-space:nowrap}.nav-item{height:44px;display:flex;align-items:center;border-radius:12px;padding:0 12px;color:var(--muted);cursor:pointer;margin-bottom:2px;font-weight:600;white-space:nowrap}.nav-item:hover,.nav-item.active{background:var(--light);color:var(--primary)}.nav-text{opacity:0;margin-left:14px;transition:.2s}
  .main-content{flex:1;overflow:auto}.header{height:70px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 36px;position:sticky;top:0;z-index:10}.header h2{font-size:17px;font-weight:900}.content-body{padding:28px 36px 48px;max-width:1500px;margin:0 auto}.page-title-row{margin-bottom:22px}.page-title-row h1{font-size:27px;font-weight:900;letter-spacing:-.04em}.page-title-row p{font-size:13.5px;color:var(--muted);margin-top:5px}
  .shell{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:24px;align-items:start}.panel{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:0 8px 28px rgba(15,23,42,.06);overflow:hidden}.panel-header{padding:20px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:14px;align-items:center}.panel-header h3{font-size:16px;font-weight:900}.panel-header p{font-size:12.5px;color:var(--muted);margin-top:4px}.panel-body{padding:20px 22px}
  .cover-preview{aspect-ratio:16/9;border-radius:18px;border:1px solid var(--border);background:linear-gradient(135deg,#F8FAFC,#EEF2FF);overflow:hidden;display:flex;align-items:center;justify-content:center}.cover-preview img{width:100%;height:100%;object-fit:cover}.cover-empty{font-size:13px;font-weight:900;color:var(--soft);text-align:center}.upload-box{border:1.5px dashed #CBD5E1;background:#F8FAFC;border-radius:15px;padding:16px;margin-top:14px;cursor:pointer;text-align:center}.upload-box:hover{border-color:var(--primary);background:var(--light)}.upload-title{font-size:13px;font-weight:900}.upload-help{margin-top:4px;font-size:11.5px;color:var(--muted)}
  .btn-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.btn-primary,.btn-secondary,.btn-danger{border:none;border-radius:14px;padding:14px 16px;font-weight:900;cursor:pointer;font-family:inherit}.btn-primary{background:var(--primary);color:#fff;box-shadow:0 12px 24px rgba(79,70,229,.22)}.btn-primary:disabled,.btn-secondary:disabled,.btn-danger:disabled{opacity:.65;cursor:not-allowed}.btn-secondary{background:#F1F5F9;color:#334155;border:1px solid var(--border)}.btn-danger{background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA}
  .message{margin-bottom:14px;padding:12px 14px;border-radius:14px;font-size:13px;font-weight:900;line-height:1.45}.message.success{background:#D1FAE5;color:#047857}.message.error{background:#FEE2E2;color:#B91C1C}.message.info{background:#EEF2FF;color:#4F46E5}.note-box{margin-top:14px;padding:12px 14px;border-radius:14px;background:#F8FAFC;border:1px solid var(--border);color:var(--muted);font-size:12px;line-height:1.55}
  .task-list{display:grid;gap:14px}.task-card{display:block;border:1px solid var(--border);background:#fff;border-radius:18px;padding:16px}.task-top{display:flex;align-items:center;justify-content:space-between;gap:16px}.task-left{display:flex;align-items:center;gap:13px;min-width:0}.task-icon{width:42px;height:42px;border-radius:50%;background:#F8FAFC;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:#0F172A;flex-shrink:0}.task-title{font-size:14px;font-weight:900}.task-sub{font-size:12px;color:var(--muted);margin-top:3px}.task-reward{margin-top:7px;font-size:12px;font-weight:900;color:#D97706}.status-pill{border-radius:999px;background:#F1F5F9;color:#64748B;font-size:11px;font-weight:900;padding:7px 10px;white-space:nowrap}.status-pill.active{background:#D1FAE5;color:#047857}.status-pill.inactive{background:#F1F5F9;color:#64748B}.preview-panel{position:sticky;top:92px}.mini-cover{aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#EEF2FF;border:1px solid var(--border)}.mini-cover img{width:100%;height:100%;object-fit:cover}.mini-empty{height:100%;display:flex;align-items:center;justify-content:center;color:#94A3B8;font-size:12px;font-weight:900;text-align:center;padding:18px}
  .task-card.featured{border-color:#C7D2FE;background:linear-gradient(180deg,#FFFFFF,#F8FAFF);box-shadow:0 12px 30px rgba(79,70,229,.08)}.task-icon.featured{background:#EEF2FF;color:#4F46E5;border-color:#C7D2FE}.task-feature-body{margin-top:16px;border-top:1px solid #EEF2F7;padding-top:16px}.task-section-label{font-size:10.5px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#94A3B8;margin-bottom:10px}.task-control-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.task-field{display:flex;flex-direction:column;gap:6px}.task-field.full{grid-column:1/-1}.task-field label{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#64748B}.task-field input,.task-field textarea{width:100%;border:1px solid var(--border);background:#F8FAFC;border-radius:13px;padding:12px 13px;font:inherit;font-size:13px;font-weight:800;color:#0F172A;outline:none}.task-field textarea{min-height:76px;resize:vertical}.task-field input:focus,.task-field textarea:focus{border-color:#4F46E5;background:#fff;box-shadow:0 0 0 4px rgba(79,70,229,.08)}.task-field input:disabled,.task-field textarea:disabled{opacity:.65;cursor:not-allowed;background:#F1F5F9;color:#94A3B8}.switch-btn:disabled{opacity:.55;cursor:not-allowed}.switch-btn{width:62px;height:34px;border:0;border-radius:999px;background:#CBD5E1;padding:4px;cursor:pointer;transition:.2s}.switch-btn.on{background:#10B981}.switch-knob{display:block;width:26px;height:26px;border-radius:999px;background:#fff;box-shadow:0 3px 8px rgba(15,23,42,.22);transition:.2s}.switch-btn.on .switch-knob{transform:translateX(28px)}.task-preview-box{margin-top:14px;border:1px solid #E2E8F0;background:#fff;border-radius:16px;padding:14px}.task-preview-title{font-size:13px;font-weight:900}.task-preview-sub{margin-top:4px;font-size:12px;color:#64748B;font-weight:700}.task-preview-meta{margin-top:10px;display:flex;gap:10px;flex-wrap:wrap}.task-preview-pill{border-radius:999px;background:#F1F5F9;color:#334155;font-size:11px;font-weight:900;padding:7px 10px}.task-note{margin-top:12px}
  .task-tabs{display:flex;gap:10px;margin-bottom:18px}.task-tab{border:1px solid var(--border);background:#fff;color:#64748B;border-radius:999px;padding:11px 18px;font-family:inherit;font-size:13px;font-weight:900;cursor:pointer}.task-tab.active{border-color:#4F46E5;background:#EEF2FF;color:#4F46E5;box-shadow:0 10px 22px rgba(79,70,229,.10)}.task-shell-full{grid-template-columns:minmax(0,1fr)}.mission-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
  @media(max-width:1100px){
    .shell{grid-template-columns:1fr}
    .preview-panel{position:static}
  }

  @media(max-width:760px){
    .main-content{min-width:0}
    .content-body{padding:22px 16px 40px}
    .header{padding-right:16px}
    .page-title-row{margin-bottom:18px}
    .page-title-row h1{font-size:24px}
    .page-title-row p{line-height:1.5}
    .task-tabs{
      display:flex;
      flex-wrap:nowrap;
      gap:8px;
      overflow-x:auto;
      padding-bottom:6px;
      scrollbar-width:none;
    }
    .task-tabs::-webkit-scrollbar{display:none}
    .task-tab{
      flex:0 0 auto;
      min-width:145px;
      padding:11px 14px;
      white-space:nowrap;
    }
    .shell{gap:18px}
    .panel{border-radius:20px}
    .panel-header{
      align-items:flex-start;
      flex-direction:column;
      padding:17px 16px;
    }
    .panel-header .mission-actions{
      width:100%;
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
    }
    .panel-header .mission-actions .btn-secondary{
      width:100% !important;
    }
    .panel-body{padding:17px 16px 20px}
    .btn-row{grid-template-columns:1fr}
    .task-card{padding:14px}
    .task-top{
      align-items:flex-start;
      flex-direction:column;
      gap:14px;
    }
    .task-left{width:100%;align-items:flex-start}
    .task-left > div:last-child{
      min-width:0;
      overflow-wrap:anywhere;
    }
    .mission-actions{
      width:100%;
      justify-content:flex-start;
    }
    .task-top > .mission-actions{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
    }
    .task-top > .mission-actions .btn-secondary,
    .task-top > .mission-actions .btn-danger{
      width:100%;
    }
    .task-top > .mission-actions .status-pill{
      align-self:center;
      width:max-content;
    }
    .task-control-grid{grid-template-columns:1fr}
    .task-field.full{grid-column:auto}
    .task-preview-meta{gap:8px}
    .message,.note-box{overflow-wrap:anywhere}
    .cover-preview,.mini-cover{border-radius:15px}
    .upload-box{padding:15px 12px}
  }

  @media(max-width:520px){
    .page-title-row h1{font-size:22px}
    .task-tab{min-width:132px;font-size:12px}
    .panel-header .mission-actions,
    .task-top > .mission-actions{
      grid-template-columns:1fr;
    }
    .task-left{flex-direction:column}
    .task-icon{width:40px;height:40px}
    .task-preview-pill,.status-pill{
      white-space:normal;
      text-align:center;
    }
    .switch-btn{flex-shrink:0}
  }
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

const READING_MISSION_ICON = 'M12 6v6l4 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
const MAX_READING_MISSIONS = 2

function normalizeReadingMission(mission = {}, index = 0) {
  return {
    id: mission.id || `draft-${index}-${Date.now()}`,
    is_active: Boolean(mission.is_active),
    title: mission.title || `Read ${mission.target_minutes || 30} minutes`,
    subtitle: mission.subtitle || 'Keep reading longer to earn more coins.',
    reward_coins: String(mission.reward_coins ?? 60),
    target_minutes: String(mission.target_minutes ?? 30),
    story_link: mission.story_link || '',
    button_text: mission.button_text || 'Go',
    sort_order: Number(mission.sort_order ?? index),
    created_at: mission.created_at || null,
    updated_at: mission.updated_at || null,
  }
}

function digitsOnly(value) {
  return String(value ?? '').replace(/[^\d]/g, '')
}

function isRealMissionId(value) {
  const text = String(value || '').trim()

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)
}

function hasLegacyReadingTask(task) {
  if (!task) return false

  return Boolean(
    task.is_active ||
      task.title ||
      task.subtitle ||
      task.story_link ||
      Number(task.reward_coins || 0) > 0 ||
      Number(task.target_minutes || 0) > 0
  )
}

function mergeMissionIntoList(mission, fallbackList = []) {
  if (!mission) return fallbackList

  const missionId = mission.id
  const withoutSame = fallbackList.filter((item) => item.id !== missionId)

  return [mission, ...withoutSame].slice(0, MAX_READING_MISSIONS)
}

function extractReadingMissionsFromResponse(data, fallbackList = []) {
  if (Array.isArray(data?.reading_missions)) return data.reading_missions
  if (Array.isArray(data?.missions)) return data.missions
  if (Array.isArray(data?.settings?.reading_missions)) return data.settings.reading_missions

  if (data?.mission) {
    return mergeMissionIntoList(data.mission, fallbackList)
  }

  const legacyTask = data?.settings?.reading_task

  if (hasLegacyReadingTask(legacyTask)) {
    return [
      {
        ...legacyTask,
        id: legacyTask.id || 'legacy-reading-task',
      },
    ]
  }

  return fallbackList
}

function buildReadingMissionPayload(mission, index = 0) {
  const rewardCoins = Number(mission.reward_coins)
  const targetMinutes = Number(mission.target_minutes)

  if (!Number.isFinite(rewardCoins) || rewardCoins < 0) {
    throw new Error('Reward coins must be 0 or higher')
  }

  if (!Number.isFinite(targetMinutes) || targetMinutes < 1 || targetMinutes > 300) {
    throw new Error('Target minutes must be between 1 and 300')
  }

  return {
    is_active: Boolean(mission.is_active),
    title: String(mission.title || '').trim() || `Read ${targetMinutes} minutes`,
    subtitle: String(mission.subtitle || '').trim() || 'Keep reading longer to earn more coins.',
    reward_coins: rewardCoins,
    target_minutes: targetMinutes,
    story_link: String(mission.story_link || '').trim(),
    button_text: String(mission.button_text || '').trim() || 'Go',
    sort_order: Number(mission.sort_order ?? index),
  }
}

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
  const [missionSavingId, setMissionSavingId] = useState('')
  const [creatingMission, setCreatingMission] = useState(false)
  const [message, setMessage] = useState({ type: 'info', text: '' })
  const [readingMissions, setReadingMissions] = useState([])
  const [activeTab, setActiveTab] = useState('reading')
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [readingMissionView, setReadingMissionView] = useState('home')

  const coverUrl = previewUrl || settings.cover_url || ''
  const isAutoMode = settings?.reading_mission_mode === 'auto'

  function syncReadingMissions(list = []) {
    const safeList = Array.isArray(list) ? list : []

    setReadingMissions(
      safeList
        .slice(0, MAX_READING_MISSIONS)
        .map((mission, index) => normalizeReadingMission(mission, index))
    )
  }

  function syncReadingMissionsFromResponse(data, fallbackList = []) {
    syncReadingMissions(extractReadingMissionsFromResponse(data, fallbackList))
  }

  function updateReadingMission(missionId, field, value) {
    if (isAutoMode && !['reward_coins', 'target_minutes'].includes(field)) return
    setReadingMissions((current) =>
      current.map((mission) =>
        mission.id === missionId
          ? {
              ...mission,
              [field]: value,
            }
          : mission
      )
    )
  }

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
        throw new Error(data.message || 'Failed to load task center settings')
      }

      setSettings(data.settings || { cover_url: '' })
      syncReadingMissionsFromResponse(data, [])
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load task center settings' })
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

  async function addReadingMission() {
    if (readingMissions.length >= MAX_READING_MISSIONS) {
      setMessage({ type: 'info', text: 'Only 2 reading missions are allowed.' })
      return
    }

    try {
      setCreatingMission(true)

      const draft = normalizeReadingMission(
        {
          is_active: false,
          title: 'Read 2 minutes',
          subtitle: 'Keep reading longer to earn more coins.',
          reward_coins: 5,
          target_minutes: 2,
          story_link: '',
          button_text: 'Go',
          sort_order: 0,
        },
        0
      )

      const response = await fetch(`${API_URL}/api/task-center/admin/reading-missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(buildReadingMissionPayload(draft, 0)),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to add reading mission')
      }

      const nextMissions = extractReadingMissionsFromResponse(data, readingMissions)
      syncReadingMissions(nextMissions)
      setSelectedMissionId(nextMissions[0]?.id || '')
      setReadingMissionView('editor')
      setMessage({ type: 'success', text: 'Reading mission added.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to add reading mission' })
    } finally {
      setCreatingMission(false)
    }
  }

  async function saveReadingMission(mission, index) {
    try {
      setMissionSavingId(mission.id)

      const payload = buildReadingMissionPayload(mission, index)
      const isUpdate = isRealMissionId(mission.id)
      const url = isUpdate
        ? `${API_URL}/api/task-center/admin/reading-missions/${mission.id}`
        : `${API_URL}/api/task-center/admin/reading-missions`

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to save reading mission')
      }

      const nextMissions = extractReadingMissionsFromResponse(data, readingMissions)
      syncReadingMissions(nextMissions)

      const savedMission = data?.mission || nextMissions.find((item) => item.id === mission.id) || nextMissions[index]
      if (savedMission?.id) setSelectedMissionId(savedMission.id)

      setReadingMissionView('editor')
      setMessage({ type: 'success', text: 'Reading mission saved successfully.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save reading mission' })
    } finally {
      setMissionSavingId('')
    }
  }

  async function deleteReadingMission(mission) {
    if (!window.confirm('Delete this reading mission?')) return

    if (!isRealMissionId(mission.id)) {
      setReadingMissions((current) => current.filter((item) => item.id !== mission.id))
      setSelectedMissionId('')
      setReadingMissionView('overview')
      setMessage({ type: 'success', text: 'Draft mission removed.' })
      return
    }

    try {
      setMissionSavingId(mission.id)

      const response = await fetch(`${API_URL}/api/task-center/admin/reading-missions/${mission.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to delete reading mission')
      }

      syncReadingMissionsFromResponse(data, [])
      setSelectedMissionId('')
      setReadingMissionView('overview')
      setMessage({ type: 'success', text: 'Reading mission deleted.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete reading mission' })
    } finally {
      setMissionSavingId('')
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const selectedMissionIndex = readingMissions.findIndex((mission) => mission.id === selectedMissionId)
  const selectedMission = selectedMissionIndex >= 0 ? readingMissions[selectedMissionIndex] : null

  return (
    <>
      <style>{styles}</style>

      <div className="dashboard-wrapper">
        {USE_LEGACY_SIDEBAR ? (
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
        ) : (
          <AdminSidebar />
        )}

        <main className="main-content">
          <header className="header">
            <h2>Task Center</h2>
          </header>

          <section className="content-body">
            <div className="page-title-row">
              <h1>Task Center</h1>
              <p>Manage the Task Center cover and reading mission controls.</p>
            </div>

            <div className="task-tabs">
              <button
                type="button"
                className={`task-tab ${activeTab === 'reading' ? 'active' : ''}`}
                onClick={() => setActiveTab('reading')}
              >
                Reading Mission
              </button>

              <button
                type="button"
                className={`task-tab ${activeTab === 'cover' ? 'active' : ''}`}
                onClick={() => setActiveTab('cover')}
              >
                Cover Image
              </button>

              <button
                type="button"
                className={`task-tab ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Reader Activity
              </button>
            </div>

            <div className={activeTab === 'cover' ? 'shell' : 'shell task-shell-full'}>
              <div>
                <div className="panel" style={{ display: activeTab === 'cover' ? 'block' : 'none' }}>
                  <div className="panel-header">
                    <div>
                      <h3>Task Cover</h3>
                      <p>Upload one 16:9 cover image for the reader Task Center page.</p>
                    </div>
                  </div>

                  <div className="panel-body">
                    <div className="cover-preview">
                      {coverUrl ? (
                        <img src={coverUrl} alt="Task Center Cover" />
                      ) : (
                        <div className="cover-empty">{loading ? 'Loading cover...' : 'No cover uploaded yet'}</div>
                      )}
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

                    <div className="note-box">
                      Cover files are uploaded to Cloudflare R2 through the backend. This page only controls the main Task Center cover for now.
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ display: activeTab === 'reading' ? 'block' : 'none', marginTop: 0 }}>
  {readingMissionView === 'home' ? (
    <>
      <div className="panel-header">
        <div>
          <h3>Task Center Overview</h3>
          <p>Open each task section to manage its missions inside.</p>
        </div>
      </div>

      <div className="panel-body">
        {message.text ? <div className={`message ${message.type}`}>{message.text}</div> : null}

        <div className="task-list">
          <div
            className="task-card featured"
            onClick={() => {
              setReadingMissionView('overview')
              setSelectedMissionId('')
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="task-top">
              <div className="task-left">
                <div className="task-icon featured">
                  <Icon d={READING_MISSION_ICON} size={18} />
                </div>

                <div>
                  <div className="task-title">Reading Mission</div>
                  <div className="task-sub">Add up to 2 story reading missions for the reader Task Page.</div>
                  <div className="task-preview-meta">
                    <span className="task-preview-pill">{readingMissions.length}/{MAX_READING_MISSIONS} Missions</span>
                    <span className="task-preview-pill">{readingMissions.filter((mission) => mission.is_active).length} Active</span>
                  </div>
                </div>
              </div>

              <div className="mission-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={(event) => {
                    event.stopPropagation()
                    setReadingMissionView('overview')
                    setSelectedMissionId('')
                  }}
                  style={{ padding: '8px 12px', borderRadius: 999 }}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : selectedMission ? (
    <>
      <div className="panel-header">
        <div>
          <h3>Edit Reading Mission</h3>
          <p>Update the full mission fields and preview before saving.</p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setSelectedMissionId('')
            setReadingMissionView('overview')
          }}
          style={{ width: 'auto', padding: '10px 14px' }}
        >
          ← Back
        </button>
      </div>

      <div className="panel-body">
        {message.text ? <div className={`message ${message.type}`}>{message.text}</div> : null}

        <div className="task-card featured">
          <div className="task-top">
            <div className="task-left">
              <div className="task-icon featured">
                <Icon d={READING_MISSION_ICON} size={18} />
              </div>

              <div>
                <div className="task-title">{selectedMission.title || `Reading Mission ${selectedMissionIndex + 1}`}</div>
                <div className="task-sub">{selectedMission.subtitle || 'Keep reading longer to earn more coins.'}</div>
                <div className="task-reward">+{selectedMission.reward_coins || 0} Coins · {selectedMission.target_minutes || 0} min</div>
              </div>
            </div>

            <div className="mission-actions">
              <span className={`status-pill ${selectedMission.is_active ? 'active' : 'inactive'}`}>
                {selectedMission.is_active ? 'Active' : 'Inactive'}
              </span>

              <button
                type="button"
                className={`switch-btn ${selectedMission.is_active ? 'on' : ''}`}
                onClick={() => updateReadingMission(selectedMission.id, 'is_active', !selectedMission.is_active)}
                disabled={isAutoMode}
                aria-label="Toggle reading mission"
              >
                <span className="switch-knob" />
              </button>
            </div>
          </div>

          <div className="task-feature-body">
            <div className="task-section-label">Mission {selectedMissionIndex + 1}</div>

            <div className="task-field full" style={{ marginBottom: 12 }}>
              <label>Task title</label>
              <input
                value={selectedMission.title}
                onChange={(event) => updateReadingMission(selectedMission.id, 'title', event.target.value)}
                disabled={isAutoMode}
                placeholder="Read 2 minutes"
              />
            </div>

            <div className="task-control-grid">
              <div className="task-field">
                <label>Reward coins</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={selectedMission.reward_coins}
                  onChange={(event) => updateReadingMission(selectedMission.id, 'reward_coins', digitsOnly(event.target.value))}
                  placeholder="5"
                />
              </div>

              <div className="task-field">
                <label>Target minutes</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={selectedMission.target_minutes}
                  onChange={(event) => updateReadingMission(selectedMission.id, 'target_minutes', digitsOnly(event.target.value))}
                  placeholder="2"
                />
              </div>

              <div className="task-field">
                <label>Reader button</label>
                <input
                  value={selectedMission.button_text}
                  onChange={(event) => updateReadingMission(selectedMission.id, 'button_text', event.target.value)}
                  disabled={isAutoMode}
                  placeholder="Go"
                />
              </div>

              <div className="task-field full">
                <label>Story link</label>
                <input
                  value={selectedMission.story_link}
                  onChange={(event) => updateReadingMission(selectedMission.id, 'story_link', event.target.value)}
                  disabled={isAutoMode}
                  placeholder="/story/story-id"
                />
              </div>

              <div className="task-field full">
                <label>Subtitle</label>
                <textarea
                  value={selectedMission.subtitle}
                  onChange={(event) => updateReadingMission(selectedMission.id, 'subtitle', event.target.value)}
                  disabled={isAutoMode}
                  placeholder="Keep reading longer to earn more coins."
                />
              </div>
            </div>

            <div className="task-preview-box">
              <div className="task-section-label">Reader Preview</div>
              <div className="task-preview-title">{selectedMission.title || `Read ${selectedMission.target_minutes || 0} minutes`}</div>
              <div className="task-preview-sub">{selectedMission.subtitle || 'Keep reading longer to earn more coins.'}</div>
              <div className="task-preview-meta">
                <span className="task-preview-pill">+{selectedMission.reward_coins || 0} Coins</span>
                <span className="task-preview-pill">{selectedMission.target_minutes || 0} min</span>
                <span className="task-preview-pill">{selectedMission.button_text || 'Go'}</span>
                <span className="task-preview-pill">{selectedMission.is_active ? 'Shown on Task Page' : 'Hidden from readers'}</span>
              </div>
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => saveReadingMission(selectedMission, selectedMissionIndex)}
                disabled={missionSavingId === selectedMission.id}
              >
                {missionSavingId === selectedMission.id ? 'Saving...' : 'Save Mission'}
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={() => deleteReadingMission(selectedMission)}
                disabled={isAutoMode || missionSavingId === selectedMission.id}
              >
                Delete Mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="panel-header">
        <div>
          <h3>Reading Mission Overview</h3>
          <p>Manage reading missions as short cards. Open a mission to edit full details.</p>
        </div>

        <div className="mission-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setReadingMissionView('home')
              setSelectedMissionId('')
            }}
            style={{ width: 'auto', padding: '10px 14px' }}
          >
            ← Back
          </button>

          {readingMissions.length < MAX_READING_MISSIONS ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={addReadingMission}
              disabled={creatingMission}
              style={{ width: 'auto', padding: '10px 16px' }}
            >
              {creatingMission ? 'Adding...' : '+ Add Mission'}
            </button>
          ) : (
            <span className="status-pill active">Max 2</span>
          )}
        </div>
      </div>

      <div className="panel-body">
        {message.text ? <div className={`message ${message.type}`}>{message.text}</div> : null}

        <TaskCenterReadingModePanel
  settings={settings}
  readingMissions={readingMissions}
  onChanged={loadSettings}
/>

        <div className="task-list">
          {readingMissions.length === 0 ? (
            <div className="note-box">
              No reading mission yet. Click Add Mission to create one. You can create up to 2 missions.
            </div>
          ) : null}

          {readingMissions.map((mission, index) => {
            const savingThis = missionSavingId === mission.id

            return (
              <div
                className="task-card featured"
                key={mission.id}
                onClick={() => {
                  setSelectedMissionId(mission.id)
                  setReadingMissionView('editor')
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="task-top">
                  <div className="task-left">
                    <div className="task-icon featured">
                      <Icon d={READING_MISSION_ICON} size={18} />
                    </div>

                    <div>
                      <div className="task-title">{mission.title || `Reading Mission ${index + 1}`}</div>
                      <div className="task-sub">{mission.subtitle || 'Keep reading longer to earn more coins.'}</div>
                      <div className="task-preview-meta">
                        <span className="task-preview-pill">+{mission.reward_coins || 0} Coins</span>
                        <span className="task-preview-pill">{mission.target_minutes || 0} min</span>
                        <span className={`status-pill ${mission.is_active ? 'active' : 'inactive'}`}>
                          {mission.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mission-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedMissionId(mission.id)
                        setReadingMissionView('editor')
                      }}
                      style={{ padding: '8px 12px', borderRadius: 999 }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn-danger"
                      onClick={(event) => {
                        event.stopPropagation()
                        deleteReadingMission(mission)
                      }}
                      disabled={isAutoMode || savingThis}
                      style={{ padding: '8px 12px', borderRadius: 999 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )}
</div>

                {activeTab === 'activity' ? <TaskCenterReaderActivityPanel /> : null}
              </div>

              <aside className="preview-panel" style={{ display: activeTab === 'cover' ? 'block' : 'none' }}>
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
