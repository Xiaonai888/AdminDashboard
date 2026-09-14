import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const DEFAULT_SETTINGS = {
  masterEnabled: false,
  homeEnabled: false,
  storyDetailEnabled: false,
  readerEndEnabled: false,
  episodeUnlockEnabled: false,
  homeEffective: false,
  storyDetailEffective: false,
  readerEndEffective: false,
  episodeUnlockEffective: false,
  episodeUnlockSuppressed: false,
  episodeUnlockSuppressionReason: '',
  shadowFreeUnlockAd: {
    enabled: false,
    frequency: 'once_per_session',
  },
  updatedAt: null,
}

const PLACEMENTS = [
  {
    key: 'homeEnabled',
    effectiveKey: 'homeEffective',
    title: 'Home',
    description: 'Google display ad on the Home page.',
  },
  {
    key: 'storyDetailEnabled',
    effectiveKey: 'storyDetailEffective',
    title: 'Story Detail',
    description: 'Google display ad on the Story Detail page.',
  },
  {
    key: 'readerEndEnabled',
    effectiveKey: 'readerEndEffective',
    title: 'Reader End',
    description: 'Google display ad after the end of an episode.',
  },
  {
    key: 'episodeUnlockEnabled',
    effectiveKey: 'episodeUnlockEffective',
    title: 'Episode Unlock Video',
    description: 'Rewarded Google ad used to temporarily unlock an episode.',
  },
]

const FREQUENCY_LABELS = {
  once_per_session: 'Once per session',
  once_per_day: 'Once per day',
  every_visit: 'Every visit',
  every_unlock: 'Every Unlock & Read',
}

const styles = `
  .google-ads-admin {
    display: grid;
    gap: 18px;
  }

  .google-ads-card {
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    background: #FFFFFF;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  }

  .google-ads-master {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 22px;
  }

  .google-ads-copy {
    min-width: 0;
  }

  .google-ads-kicker {
    color: #6366F1;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .google-ads-title {
    margin: 5px 0 0;
    color: #0F172A;
    font-size: 20px;
    font-weight: 900;
  }

  .google-ads-description {
    margin: 6px 0 0;
    color: #64748B;
    font-size: 12px;
    font-weight: 650;
    line-height: 1.6;
  }

  .google-ads-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-top: 10px;
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    padding: 6px 10px;
    font-size: 10px;
    font-weight: 900;
  }

  .google-ads-status.on {
    background: #ECFDF5;
    color: #047857;
  }

  .google-ads-status.warning {
    background: #FFF7ED;
    color: #C2410C;
  }

  .google-ads-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: currentColor;
  }

  .google-ads-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .google-ads-placement {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 118px;
    padding: 18px;
  }

  .google-ads-placement h3 {
    margin: 0;
    color: #0F172A;
    font-size: 15px;
    font-weight: 900;
  }

  .google-ads-placement p {
    margin: 6px 0 0;
    color: #64748B;
    font-size: 11px;
    font-weight: 650;
    line-height: 1.55;
  }

  .google-ads-switch {
    width: 52px;
    height: 30px;
    position: relative;
    flex: 0 0 auto;
    border: 0;
    border-radius: 999px;
    background: #CBD5E1;
    cursor: pointer;
    transition: background 0.2s ease, opacity 0.2s ease;
  }

  .google-ads-switch.on {
    background: #4F46E5;
  }

  .google-ads-switch:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .google-ads-switch span {
    width: 24px;
    height: 24px;
    position: absolute;
    top: 3px;
    left: 3px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.22);
    transition: transform 0.2s ease;
  }

  .google-ads-switch.on span {
    transform: translateX(22px);
  }

  .google-ads-message {
    border-radius: 14px;
    padding: 12px 14px;
    font-size: 11px;
    font-weight: 800;
  }

  .google-ads-message.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .google-ads-message.success {
    background: #ECFDF5;
    color: #047857;
  }

  .google-ads-loading {
    padding: 36px;
    color: #64748B;
    text-align: center;
    font-size: 12px;
    font-weight: 800;
  }

  .google-ads-note {
    padding: 16px 18px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.65;
  }

  .google-ads-conflict {
    display: grid;
    gap: 8px;
    padding: 16px 18px;
  }

  .google-ads-conflict-title {
    margin: 0;
    color: #0F172A;
    font-size: 13px;
    font-weight: 900;
  }

  .google-ads-conflict-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    color: #64748B;
    font-size: 11px;
    font-weight: 750;
  }

  .google-ads-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    padding: 6px 9px;
    font-size: 10px;
    font-weight: 900;
  }

  .google-ads-chip.warning {
    background: #FFF7ED;
    color: #C2410C;
  }

  .google-ads-chip.on {
    background: #ECFDF5;
    color: #047857;
  }

  @media (max-width: 760px) {
    .google-ads-grid {
      grid-template-columns: 1fr;
    }

    .google-ads-master,
    .google-ads-placement {
      align-items: flex-start;
    }

    .google-ads-master {
      padding: 18px;
    }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

async function apiRequest(path, options = {}) {
  const token = getAdminToken()

  if (!token) {
    throw new Error('Admin login required')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(
      data.message ||
        `Request failed (${response.status})`
    )
  }

  return data
}

function Toggle({ value, disabled, onClick, label }) {
  return (
    <button
      type="button"
      className={`google-ads-switch ${value ? 'on' : ''}`}
      aria-label={label}
      aria-pressed={value}
      disabled={disabled}
      onClick={onClick}
    >
      <span />
    </button>
  )
}

function normalizeSettings(value) {
  return {
    ...DEFAULT_SETTINGS,
    ...(value || {}),
    shadowFreeUnlockAd: {
      ...DEFAULT_SETTINGS.shadowFreeUnlockAd,
      ...(value?.shadowFreeUnlockAd || {}),
    },
  }
}

export default function AdminGoogleAdsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadSettings() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest('/api/google-ads/admin')
      setSettings(normalizeSettings(data.settings))
    } catch (err) {
      setError(
        err.message || 'Failed to load Google Ads settings'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  async function updateSetting(key) {
    const nextValue = !Boolean(settings[key])

    try {
      setBusyKey(key)
      setError('')
      setSuccess('')

      const data = await apiRequest(
        '/api/google-ads/admin',
        {
          method: 'PATCH',
          body: JSON.stringify({
            [key]: nextValue,
          }),
        }
      )

      setSettings(normalizeSettings(data.settings))
      setSuccess('Google Ads settings updated.')
    } catch (err) {
      setError(
        err.message || 'Failed to update Google Ads settings'
      )
    } finally {
      setBusyKey('')
    }
  }

  const masterOn = Boolean(settings.masterEnabled)
  const shadowAd = settings.shadowFreeUnlockAd || {}
  const shadowFrequency =
    FREQUENCY_LABELS[shadowAd.frequency] ||
    shadowAd.frequency ||
    'Once per session'
  const episodeSuppressed = Boolean(
    settings.episodeUnlockSuppressed
  )

  return (
    <AdminLayout
      title="Google Ads"
      subtitle="Control Google Ads placements across Shadow."
    >
      <style>{styles}</style>

      <div className="google-ads-admin">
        {error ? (
          <div className="google-ads-message error">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="google-ads-message success">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="google-ads-card google-ads-loading">
            Loading Google Ads settings...
          </div>
        ) : (
          <>
            <section className="google-ads-card google-ads-master">
              <div className="google-ads-copy">
                <div className="google-ads-kicker">
                  Master Control
                </div>
                <h2 className="google-ads-title">
                  All Google Ads
                </h2>
                <p className="google-ads-description">
                  Turn every Google Ads placement on or off from one switch.
                </p>
                <div
                  className={`google-ads-status ${
                    masterOn ? 'on' : ''
                  }`}
                >
                  <span className="google-ads-dot" />
                  {masterOn ? 'Google Ads ON' : 'Google Ads OFF'}
                </div>
              </div>

              <Toggle
                value={masterOn}
                disabled={Boolean(busyKey)}
                label="Toggle all Google Ads"
                onClick={() =>
                  updateSetting('masterEnabled')
                }
              />
            </section>

            <div className="google-ads-grid">
              {PLACEMENTS.map((placement) => {
                const enabled = Boolean(
                  settings[placement.key]
                )
                const effectiveOn = Boolean(
                  settings[placement.effectiveKey]
                )
                const isEpisodeUnlock =
                  placement.key === 'episodeUnlockEnabled'
                const suppressed =
                  isEpisodeUnlock && episodeSuppressed

                let statusText = 'Off'
                let statusClass = ''

                if (suppressed && enabled && masterOn) {
                  statusText = 'Automatically Suppressed'
                  statusClass = 'warning'
                } else if (effectiveOn) {
                  statusText = 'Active'
                  statusClass = 'on'
                } else if (enabled && !masterOn) {
                  statusText = 'Ready — Master OFF'
                }

                return (
                  <section
                    key={placement.key}
                    className="google-ads-card google-ads-placement"
                  >
                    <div className="google-ads-copy">
                      <h3>{placement.title}</h3>
                      <p>{placement.description}</p>
                      <div
                        className={`google-ads-status ${statusClass}`}
                      >
                        <span className="google-ads-dot" />
                        {statusText}
                      </div>
                    </div>

                    <Toggle
                      value={enabled}
                      disabled={Boolean(busyKey)}
                      label={`Toggle ${placement.title}`}
                      onClick={() =>
                        updateSetting(placement.key)
                      }
                    />
                  </section>
                )
              })}
            </div>

            <section className="google-ads-card google-ads-conflict">
              <h3 className="google-ads-conflict-title">
                Episode Unlock Conflict Protection
              </h3>

              <div className="google-ads-conflict-row">
                <span
                  className={`google-ads-chip ${
                    shadowAd.enabled ? 'on' : ''
                  }`}
                >
                  Shadow Image Ad: {shadowAd.enabled ? 'ON' : 'OFF'}
                </span>

                <span className="google-ads-chip">
                  {shadowFrequency}
                </span>

                {episodeSuppressed ? (
                  <span className="google-ads-chip warning">
                    Episode Unlock Automatically Suppressed
                  </span>
                ) : (
                  <span className="google-ads-chip on">
                    No Conflict
                  </span>
                )}
              </div>

              <div className="google-ads-description">
                Shadow Image Ad with Every visit or Every Unlock & Read automatically blocks Google Episode Unlock. Once per session and Once per day do not block it.
              </div>
            </section>

            <div className="google-ads-card google-ads-note">
              Master OFF pauses all four placements without changing their individual choices. Turning Master ON again restores only the placements that are individually enabled.
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
