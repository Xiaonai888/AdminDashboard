import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const styles = `
  .security-center {
    display: grid;
    gap: 18px;
    color: #0F172A;
  }

  .security-center-topline {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-height: 32px;
  }

  .security-system-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid #D1FAE5;
    border-radius: 999px;
    background: #ECFDF5;
    color: #047857;
    font-size: 12px;
    font-weight: 850;
  }

  .security-system-pill.safe {
    border-color: #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .security-system-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }

  .security-generated {
    color: #94A3B8;
    font-size: 11px;
    font-weight: 700;
  }

  .security-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .security-summary-card,
  .security-panel,
  .security-guard-card {
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.035);
  }

  .security-summary-card {
    min-height: 116px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    border-radius: 18px;
  }

  .security-summary-icon,
  .security-guard-icon,
  .security-panel-icon,
  .security-quick-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .security-summary-icon {
    width: 48px;
    height: 48px;
    border-radius: 15px;
  }

  .security-summary-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .security-summary-value {
    margin-top: 4px;
    color: #0F172A;
    font-size: 27px;
    line-height: 1;
    font-weight: 950;
  }

  .security-summary-note {
    margin-top: 7px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 700;
  }

  .security-panel {
    padding: 14px;
    border-radius: 19px;
  }

  .security-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .security-panel-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .security-panel-icon {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }

  .security-panel-title {
    margin: 0;
    font-size: 16px;
    font-weight: 950;
  }

  .security-panel-subtitle {
    margin-top: 2px;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
  }

  .security-refresh {
    min-height: 36px;
    padding: 0 13px;
    border: 1px solid #C7D2FE;
    border-radius: 11px;
    background: #EEF2FF;
    color: #4F46E5;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .security-refresh:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .security-guard-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .security-guard-card {
    min-height: 126px;
    padding: 14px;
    border-radius: 15px;
  }

  .security-guard-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .security-guard-name-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .security-guard-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }

  .security-guard-name {
    color: #0F172A;
    font-size: 12px;
    font-weight: 950;
  }

  .security-badge {
    flex: 0 0 auto;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 950;
    white-space: nowrap;
  }

  .security-badge.success {
    background: #ECFDF5;
    color: #047857;
  }

  .security-badge.info {
    background: #EFF6FF;
    color: #1D4ED8;
  }

  .security-badge.warning {
    background: #FFF7ED;
    color: #C2410C;
  }

  .security-badge.danger {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .security-badge.neutral {
    background: #F1F5F9;
    color: #64748B;
  }

  .security-guard-description {
    margin: 10px 0 0 48px;
    color: #64748B;
    font-size: 10px;
    line-height: 1.5;
    font-weight: 700;
  }

  .security-guard-detail {
    margin: 7px 0 0 48px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 700;
  }

  .security-lower-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(300px, .85fr);
    gap: 14px;
  }

  .security-signal-list,
  .security-quick-list {
    display: grid;
  }

  .security-signal-row,
  .security-quick-row {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 55px;
    border-top: 1px solid #F1F5F9;
  }

  .security-signal-row:first-child,
  .security-quick-row:first-child {
    border-top: 0;
  }

  .security-signal-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #64748B;
    box-shadow: 0 0 0 4px #F8FAFC;
  }

  .security-signal-dot.info,
  .security-signal-dot.low {
    background: #3B82F6;
  }

  .security-signal-dot.medium {
    background: #F59E0B;
  }

  .security-signal-dot.high,
  .security-signal-dot.critical {
    background: #EF4444;
  }

  .security-signal-copy {
    min-width: 0;
    flex: 1;
  }

  .security-signal-title {
    color: #1E293B;
    font-size: 11px;
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  .security-signal-meta {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .security-signal-time {
    flex: 0 0 auto;
    color: #64748B;
    font-size: 9px;
    font-weight: 800;
  }

  .security-quick-row {
    padding: 0 4px;
    cursor: pointer;
  }

  .security-quick-row:hover {
    background: #F8FAFC;
  }

  .security-quick-icon {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }

  .security-quick-copy {
    min-width: 0;
    flex: 1;
  }

  .security-quick-name {
    color: #1E293B;
    font-size: 11px;
    font-weight: 900;
  }

  .security-quick-note {
    margin-top: 2px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 700;
  }

  .security-quick-value {
    color: #0F172A;
    font-size: 18px;
    font-weight: 950;
  }

  .security-empty,
  .security-error {
    padding: 32px 18px;
    border: 1px dashed #CBD5E1;
    border-radius: 14px;
    text-align: center;
    color: #64748B;
    font-size: 11px;
    font-weight: 800;
  }

  .security-error {
    border-color: #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  @media (max-width: 1180px) {
    .security-summary-grid,
    .security-guard-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .security-center-topline {
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .security-summary-grid,
    .security-guard-grid,
    .security-lower-grid {
      grid-template-columns: 1fr;
    }

    .security-summary-card {
      min-height: 100px;
    }

    .security-guard-card {
      min-height: auto;
    }
  }
`

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function SvgIcon({ path, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  guards: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5',
  clock: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z M12 6v6l4 2',
  safe: 'M12 2v20 M5 5l14 14 M19 5L5 19',
  ips: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-5',
  spam_guard: 'M3 5h18v14H3z M3 7l9 7 9-7',
  security_gate: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  tamper_guard: 'M5 5c0-2 14-2 14 0s-14 2-14 0z M5 5v14c0 2 14 2 14 0V5 M5 12c0 2 14 2 14 0',
  control_plane: 'M12 3v5 M5 21v-5h14v5 M5 16v-4h14v4 M12 8H6v4 M12 8h6v4',
  response_assistant: 'M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4',
  sensitive_path_guard: 'M3 6h7l2 2h9v11H3z',
  login_guard: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  work: 'M3 12h4l2-7 4 14 2-7h6',
  kill: 'M12 2v6 M12 16v6 M4.93 4.93l4.24 4.24 M14.83 14.83l4.24 4.24 M2 12h6 M16 12h6',
  response: 'M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4',
}

function formatTime(value) {
  const date = new Date(Number(value) || value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatGenerated(value) {
  const date = new Date(Number(value) || value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString()
}

function displayNumber(value) {
  return value === null || value === undefined ? '—' : Number(value).toLocaleString()
}

export default function AdminSecurityCenterPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadSecurityCenter = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/api/admin/work/security-center`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const payload = await response.json().catch(() => ({}))

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.message || 'Failed to load Security Center')
      }

      setData(payload)
    } catch (loadError) {
      setError(loadError?.message || 'Failed to load Security Center')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSecurityCenter()
  }, [loadSecurityCenter])

  const summaryCards = useMemo(() => {
    const summary = data?.summary || {}

    return [
      {
        label: 'Total Guards',
        value: summary.total_guards ?? 8,
        note: 'All security guards',
        icon: ICONS.guards,
      },
      {
        label: 'Active Defenses',
        value: summary.active_defenses ?? 0,
        note: 'Currently responding to threats',
        icon: ICONS.shield,
      },
      {
        label: 'Pending Approvals',
        value: summary.pending_approvals ?? 0,
        note: 'Requires your review',
        icon: ICONS.clock,
      },
      {
        label: 'Safe Mode',
        value: summary.safe_mode ? 'On' : 'Off',
        note: summary.safe_mode ? 'Protected state active' : 'Normal operation',
        icon: ICONS.safe,
      },
    ]
  }, [data])

  const quickRows = [
    {
      name: 'Work Incidents',
      note: 'Open incidents from Work',
      value: data?.quick_view?.work_incidents,
      icon: ICONS.work,
      action: () => navigate('/alerts/work'),
    },
    {
      name: 'Kill Switches',
      note: 'Active kill switches',
      value: data?.quick_view?.kill_switches,
      icon: ICONS.kill,
      action: () => navigate('/alerts/kill-switch'),
    },
    {
      name: 'Response Queue',
      note: 'Security responses waiting for review',
      value: data?.quick_view?.response_queue,
      icon: ICONS.response,
      action: null,
    },
  ]

  return (
    <AdminLayout
      title="Security Center"
      subtitle="Command room for defense systems."
    >
      <style>{styles}</style>

      <div className="security-center">
        <div className="security-center-topline">
          <div
            className={`security-system-pill ${data?.summary?.safe_mode ? 'safe' : ''}`}
          >
            <span className="security-system-dot" />
            {data?.summary?.safe_mode ? 'Safe Mode Active' : 'Systems Operational'}
          </div>

          <span className="security-generated">
            {data?.generated_at
              ? `Updated ${formatGenerated(data.generated_at)}`
              : ''}
          </span>
        </div>

        {error ? <div className="security-error">{error}</div> : null}

        <div className="security-summary-grid">
          {summaryCards.map((card) => (
            <div className="security-summary-card" key={card.label}>
              <div className="security-summary-icon">
                <SvgIcon path={card.icon} size={22} />
              </div>

              <div>
                <div className="security-summary-label">{card.label}</div>
                <div className="security-summary-value">{card.value}</div>
                <div className="security-summary-note">{card.note}</div>
              </div>
            </div>
          ))}
        </div>

        <section className="security-panel">
          <div className="security-panel-head">
            <div className="security-panel-title-wrap">
              <div className="security-panel-icon">
                <SvgIcon path={ICONS.shield} size={19} />
              </div>
              <div>
                <h2 className="security-panel-title">Security Guards</h2>
                <div className="security-panel-subtitle">
                  Live status and health of all defense systems
                </div>
              </div>
            </div>

            <button
              type="button"
              className="security-refresh"
              disabled={loading}
              onClick={loadSecurityCenter}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {!loading && !error && !data ? (
            <div className="security-empty">No Security Center data.</div>
          ) : null}

          <div className="security-guard-grid">
            {(data?.guards || []).map((guard) => (
              <article className="security-guard-card" key={guard.key}>
                <div className="security-guard-head">
                  <div className="security-guard-name-wrap">
                    <div className="security-guard-icon">
                      <SvgIcon
                        path={ICONS[guard.key] || ICONS.shield}
                        size={19}
                      />
                    </div>
                    <div className="security-guard-name">{guard.name}</div>
                  </div>

                  <span className={`security-badge ${guard.tone || 'neutral'}`}>
                    {guard.status}
                  </span>
                </div>

                <p className="security-guard-description">
                  {guard.description}
                </p>

                <div className="security-guard-detail">
                  {guard.detail}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="security-lower-grid">
          <section className="security-panel">
            <div className="security-panel-head">
              <div className="security-panel-title-wrap">
                <div className="security-panel-icon">
                  <SvgIcon path={ICONS.work} size={19} />
                </div>
                <div>
                  <h2 className="security-panel-title">
                    Recent Security Signals
                  </h2>
                  <div className="security-panel-subtitle">
                    Latest bounded events from your defense systems
                  </div>
                </div>
              </div>
            </div>

            {(data?.recent_signals || []).length === 0 ? (
              <div className="security-empty">
                No recent security signal.
              </div>
            ) : (
              <div className="security-signal-list">
                {(data?.recent_signals || []).map((signal) => (
                  <div className="security-signal-row" key={signal.id}>
                    <span
                      className={`security-signal-dot ${signal.severity || 'info'}`}
                    />

                    <div className="security-signal-copy">
                      <div className="security-signal-title">
                        {signal.title}
                      </div>
                      <div className="security-signal-meta">
                        {signal.source} · {signal.detail}
                      </div>
                    </div>

                    <div className="security-signal-time">
                      {formatTime(signal.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="security-panel">
            <div className="security-panel-head">
              <div className="security-panel-title-wrap">
                <div className="security-panel-icon">
                  <SvgIcon path={ICONS.guards} size={19} />
                </div>
                <div>
                  <h2 className="security-panel-title">Quick View</h2>
                  <div className="security-panel-subtitle">
                    Key security metrics at a glance
                  </div>
                </div>
              </div>
            </div>

            <div className="security-quick-list">
              {quickRows.map((row) => (
                <div
                  className="security-quick-row"
                  key={row.name}
                  role={row.action ? 'button' : undefined}
                  tabIndex={row.action ? 0 : undefined}
                  onClick={row.action || undefined}
                  onKeyDown={
                    row.action
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            row.action()
                          }
                        }
                      : undefined
                  }
                >
                  <div className="security-quick-icon">
                    <SvgIcon path={row.icon} size={18} />
                  </div>

                  <div className="security-quick-copy">
                    <div className="security-quick-name">{row.name}</div>
                    <div className="security-quick-note">{row.note}</div>
                  </div>

                  <div className="security-quick-value">
                    {displayNumber(row.value)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
