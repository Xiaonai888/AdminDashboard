import React, { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const API_PATH = '/api/admin/events/read-event/language-controls'
const LANGUAGE_NAMES = [
  { language: 'km', label: 'Khmer' },
  { language: 'en', label: 'English' },
  { language: 'zh', label: 'Chinese' },
  { language: 'ko', label: 'Korean' },
  { language: 'ja', label: 'Japanese' },
]

function adminToken() {
  return sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') || ''
}

async function languageRequest(options = {}) {
  const token = adminToken()
  if (!token) throw new Error('Admin login required')
  const response = await fetch(`${API_URL}${API_PATH}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok !== true) {
    throw new Error(data.message || data.code || `Request failed (${response.status})`)
  }
  return data
}

export default function AdminReadEventLanguageControl() {
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    languageRequest({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setLanguages(data.languages || [])
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  async function toggleLanguage(item) {
    if (loading || saving || !item?.supported) return
    const enabled = !item.enabled
    setError('')
    setNotice('')
    setSaving(item.language)
    try {
      const response = await languageRequest({
        method: 'PATCH',
        body: JSON.stringify({ language: item.language, enabled }),
      })
      const updated = response.language_control
      if (!updated || updated.language !== item.language || updated.enabled !== enabled) {
        throw new Error('Invalid language control response')
      }
      setLanguages((previous) => previous.map((value) =>
        value.language === item.language ? updated : value))
      setNotice(`${item.label} Event ${enabled ? 'enabled' : 'disabled'}.`)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setSaving('')
    }
  }

  return (
    <section className="rde-panel rde-stack" aria-label="Event Language Control">
      <div className="rde-row">
        <h3>Event Language Control</h3>
        <span className="rde-muted">Default: Khmer ON · International OFF</span>
      </div>
      <p className="rde-muted">This controls Story Language eligibility across event cycles. The current event Enable/Disable button remains independent.</p>
      {error && <div className="rde-alert error" role="alert">{error}</div>}
      {notice && <div className="rde-alert" role="status">{notice}</div>}
      {loading ? <p className="rde-muted">Loading language controls...</p> : null}
      {!loading && LANGUAGE_NAMES.map(({ language, label }) => {
        const item = languages.find((row) => row.language === language)
        const supported = item?.supported === true
        const enabled = item?.enabled === true
        return (
          <div className="rde-entry rde-row" key={language}>
            <div className="rde-stack">
              <strong className="rde-title">{label}</strong>
              {!supported && <span className="rde-muted">Coming soon · not available yet</span>}
            </div>
            <button
              type="button"
              role="switch"
              aria-label={`${label} Read Event`}
              aria-checked={enabled}
              className={`rde-btn ${enabled ? 'primary' : ''}`}
              disabled={!supported || Boolean(saving) || !item}
              onClick={() => toggleLanguage(item)}
            >
              {saving === language ? 'Saving...' : enabled ? 'ON' : 'OFF'}
            </button>
          </div>
        )
      })}
    </section>
  )
}
