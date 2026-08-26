import React, { useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  .reading-mode-panel{margin-bottom:18px;border:1px solid #E2E8F0;border-radius:18px;background:linear-gradient(180deg,#fff,#F8FAFC);padding:16px}
  .reading-mode-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
  .reading-mode-title{font-size:14px;font-weight:900;color:#0F172A}
  .reading-mode-sub{margin-top:4px;font-size:12px;line-height:1.5;color:#64748B}
  .reading-mode-toggle{display:flex;gap:6px;padding:4px;border:1px solid #E2E8F0;border-radius:999px;background:#F1F5F9;flex-shrink:0}
  .reading-mode-option{border:0;border-radius:999px;background:transparent;color:#64748B;padding:9px 14px;font:inherit;font-size:12px;font-weight:900;cursor:pointer;transition:.18s}
  .reading-mode-option.active{background:#fff;color:#4F46E5;box-shadow:0 4px 14px rgba(15,23,42,.10)}
  .reading-mode-option:disabled{opacity:.55;cursor:not-allowed}
  .reading-mode-info{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}
  .reading-mode-pill{border-radius:999px;background:#EEF2FF;color:#4F46E5;padding:7px 10px;font-size:11px;font-weight:900}
  .reading-mode-pill.green{background:#D1FAE5;color:#047857}
  .reading-mode-pill.gray{background:#F1F5F9;color:#64748B}
  .reading-mode-message{margin-top:12px;border-radius:12px;padding:10px 12px;font-size:12px;font-weight:800;line-height:1.5}
  .reading-mode-message.error{background:#FEE2E2;color:#B91C1C}
  .reading-mode-message.success{background:#D1FAE5;color:#047857}
  .auto-story-section{margin-top:16px;padding-top:15px;border-top:1px solid #E2E8F0}
  .auto-story-heading{font-size:10.5px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#94A3B8;margin-bottom:10px}
  .auto-story-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .auto-story-card{min-width:0;border:1px solid #E2E8F0;border-radius:15px;background:#fff;padding:13px}
  .auto-story-slot{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#94A3B8}
  .auto-story-title{margin-top:5px;font-size:13px;font-weight:900;color:#0F172A;overflow-wrap:anywhere}
  .auto-story-link{margin-top:5px;font-size:11px;color:#64748B;overflow-wrap:anywhere}
  .auto-story-meta{margin-top:9px;display:flex;gap:7px;flex-wrap:wrap}
  .auto-story-meta span{border-radius:999px;background:#F1F5F9;color:#334155;padding:6px 8px;font-size:10.5px;font-weight:900}
  @media(max-width:760px){.reading-mode-top{flex-direction:column}.reading-mode-toggle{width:100%}.reading-mode-option{flex:1}.auto-story-grid{grid-template-columns:1fr}}
`

function getAdminToken() {
  const sessionToken = sessionStorage.getItem('shadow_admin_token') || ''
  const localToken = localStorage.getItem('shadow_admin_token') || ''
  const token = sessionToken || localToken

  if (token && !sessionToken) {
    sessionStorage.setItem('shadow_admin_token', token)
  }

  return token
}

function formatRotationDate(value) {
  const text = String(value || '').trim()
  return text || 'Not rotated yet'
}

export default function TaskCenterReadingModePanel({ settings = {}, readingMissions = [], onChanged }) {
  const [savingMode, setSavingMode] = useState('')
  const [localMessage, setLocalMessage] = useState({ type: '', text: '' })

  const mode = settings?.reading_mission_mode === 'auto' ? 'auto' : 'manual'
  const canEnableAuto = readingMissions.length === 2

  const autoStories = useMemo(
    () =>
      readingMissions.slice(0, 2).map((mission, index) => ({
        id: mission.id || `slot-${index + 1}`,
        slot: index + 1,
        title: String(mission.subtitle || '').trim() || 'Waiting for automatic selection',
        link: String(mission.story_link || '').trim(),
        reward: Number(mission.reward_coins || 0),
        minutes: Number(mission.target_minutes || 0),
      })),
    [readingMissions]
  )

  async function changeMode(nextMode) {
    if (nextMode === mode || savingMode) return

    if (nextMode === 'auto' && !canEnableAuto) {
      setLocalMessage({ type: 'error', text: 'Auto mode requires exactly 2 reading missions.' })
      return
    }

    try {
      setSavingMode(nextMode)
      setLocalMessage({ type: '', text: '' })

      const response = await fetch(`${API_URL}/api/task-center/admin/reading-mode`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ mode: nextMode }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Failed to change reading mission mode')
      }

      if (typeof onChanged === 'function') {
        await onChanged()
      }

      setLocalMessage({
        type: 'success',
        text: nextMode === 'auto' ? 'Auto mode enabled and today’s stories are ready.' : 'Manual mode enabled.',
      })
    } catch (error) {
      setLocalMessage({ type: 'error', text: error.message || 'Failed to change reading mission mode' })
    } finally {
      setSavingMode('')
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="reading-mode-panel">
        <div className="reading-mode-top">
          <div>
            <div className="reading-mode-title">Reading Mission Mode</div>
            <div className="reading-mode-sub">
              Manual uses the story links you choose. Auto keeps 2 missions and selects stories automatically every day.
            </div>
          </div>

          <div className="reading-mode-toggle">
            <button
              type="button"
              className={`reading-mode-option ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => changeMode('manual')}
              disabled={Boolean(savingMode)}
            >
              {savingMode === 'manual' ? 'Saving...' : 'Manual'}
            </button>

            <button
              type="button"
              className={`reading-mode-option ${mode === 'auto' ? 'active' : ''}`}
              onClick={() => changeMode('auto')}
              disabled={Boolean(savingMode) || !canEnableAuto}
            >
              {savingMode === 'auto' ? 'Saving...' : 'Auto'}
            </button>
          </div>
        </div>

        <div className="reading-mode-info">
          <span className={`reading-mode-pill ${mode === 'auto' ? 'green' : 'gray'}`}>
            {mode === 'auto' ? 'Auto Active' : 'Manual Active'}
          </span>
          <span className="reading-mode-pill">2 stories / day</span>
          <span className="reading-mode-pill">00:00 Cambodia</span>
          {mode === 'auto' ? (
            <span className="reading-mode-pill gray">
              Last rotation: {formatRotationDate(settings?.auto_last_rotation_date)}
            </span>
          ) : null}
        </div>

        {!canEnableAuto && mode !== 'auto' ? (
          <div className="reading-mode-message error">
            Create exactly 2 reading missions before enabling Auto mode.
          </div>
        ) : null}

        {localMessage.text ? (
          <div className={`reading-mode-message ${localMessage.type}`}>{localMessage.text}</div>
        ) : null}

        {mode === 'auto' ? (
          <div className="auto-story-section">
            <div className="auto-story-heading">Today’s selected stories</div>

            <div className="auto-story-grid">
              {autoStories.map((story) => (
                <div className="auto-story-card" key={story.id}>
                  <div className="auto-story-slot">Mission {story.slot}</div>
                  <div className="auto-story-title">{story.title}</div>
                  <div className="auto-story-link">{story.link || 'Waiting for story link'}</div>
                  <div className="auto-story-meta">
                    <span>{story.minutes} min</span>
                    <span>+{story.reward} Coins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
