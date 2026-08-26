import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const PAGE_LIMIT = 50

const styles = `
  .reader-activity{display:grid;gap:18px}
  .reader-activity-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap}
  .reader-activity-controls{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap}
  .reader-activity-field{display:flex;flex-direction:column;gap:6px}
  .reader-activity-field label{font-size:10.5px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#64748B}
  .reader-activity-field input,.reader-activity-field select{height:42px;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;color:#0F172A;padding:0 12px;font:inherit;font-size:13px;font-weight:800;outline:none}
  .reader-activity-field input:focus,.reader-activity-field select:focus{border-color:#4F46E5;background:#fff;box-shadow:0 0 0 4px rgba(79,70,229,.08)}
  .reader-activity-reload{height:42px;border:1px solid #E2E8F0;border-radius:12px;background:#fff;color:#334155;padding:0 14px;font:inherit;font-size:12px;font-weight:900;cursor:pointer}
  .reader-activity-reload:disabled{opacity:.55;cursor:not-allowed}
  .reader-activity-mode{font-size:11px;font-weight:900;padding:8px 11px;border-radius:999px;background:#EEF2FF;color:#4F46E5;white-space:nowrap}
  .reader-activity-summary{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
  .reader-activity-stat{border:1px solid #E2E8F0;border-radius:16px;background:#fff;padding:15px}
  .reader-activity-stat-label{font-size:10.5px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#94A3B8}
  .reader-activity-stat-value{margin-top:7px;font-size:24px;font-weight:950;letter-spacing:-.04em;color:#0F172A}
  .reader-activity-stat-sub{margin-top:4px;font-size:11px;color:#64748B;font-weight:700}
  .reader-activity-note{border:1px solid #E2E8F0;border-radius:14px;background:#F8FAFC;padding:12px 14px;color:#64748B;font-size:12px;line-height:1.55}
  .reader-activity-error{border:1px solid #FECACA;border-radius:14px;background:#FEF2F2;padding:12px 14px;color:#B91C1C;font-size:12px;font-weight:900}
  .reader-activity-table-wrap{overflow:auto;border:1px solid #E2E8F0;border-radius:16px;background:#fff}
  .reader-activity-table{width:100%;min-width:980px;border-collapse:collapse}
  .reader-activity-table th{position:sticky;top:0;z-index:1;background:#F8FAFC;border-bottom:1px solid #E2E8F0;padding:12px 14px;text-align:left;font-size:10.5px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#64748B}
  .reader-activity-table td{border-bottom:1px solid #F1F5F9;padding:13px 14px;vertical-align:top;font-size:12px;color:#334155}
  .reader-activity-table tbody tr:last-child td{border-bottom:0}
  .reader-activity-user{font-weight:900;color:#0F172A}
  .reader-activity-email{margin-top:3px;font-size:10.5px;color:#94A3B8}
  .reader-activity-pill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 9px;font-size:10.5px;font-weight:900;background:#F1F5F9;color:#475569;white-space:nowrap}
  .reader-activity-pill.manual{background:#EFF6FF;color:#1D4ED8}
  .reader-activity-pill.premium{background:#F5F3FF;color:#6D28D9}
  .reader-activity-pill.done{background:#D1FAE5;color:#047857}
  .reader-activity-pill.progress{background:#FFF7ED;color:#C2410C}
  .reader-activity-progress-list{display:grid;gap:5px;min-width:160px}
  .reader-activity-progress-item{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .reader-activity-progress-title{max-width:125px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#475569;font-size:10.5px;font-weight:800}
  .reader-activity-progress-percent{font-size:10.5px;font-weight:900;color:#0F172A}
  .reader-activity-empty{padding:34px 18px;text-align:center;color:#94A3B8;font-size:12px;font-weight:800}
  .reader-activity-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .reader-activity-pagination-info{font-size:11.5px;color:#64748B;font-weight:800}
  .reader-activity-page-actions{display:flex;gap:8px}
  .reader-activity-page-button{border:1px solid #E2E8F0;border-radius:11px;background:#fff;color:#334155;padding:9px 13px;font:inherit;font-size:11.5px;font-weight:900;cursor:pointer}
  .reader-activity-page-button:disabled{opacity:.45;cursor:not-allowed}
  @media(max-width:1180px){
    .reader-activity-summary{grid-template-columns:repeat(3,minmax(0,1fr))}
  }
  @media(max-width:700px){
    .reader-activity-summary{grid-template-columns:repeat(2,minmax(0,1fr))}
    .reader-activity-toolbar{align-items:stretch}
    .reader-activity-controls{display:grid;grid-template-columns:1fr 1fr;width:100%}
    .reader-activity-field{min-width:0}
    .reader-activity-field input,.reader-activity-field select{width:100%}
    .reader-activity-reload{width:100%}
  }
  @media(max-width:460px){
    .reader-activity-summary{grid-template-columns:1fr}
    .reader-activity-controls{grid-template-columns:1fr}
  }
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

function getPhnomPenhDateKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return `${year}-${month}-${day}`
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

function formatPercent(value) {
  const number = Number(value || 0)
  return `${Number.isInteger(number) ? number : number.toFixed(2)}%`
}

function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function getAgeDays(dateKey, todayKey) {
  const selected = new Date(`${dateKey}T00:00:00.000Z`)
  const today = new Date(`${todayKey}T00:00:00.000Z`)

  return Math.max(0, Math.floor((today.getTime() - selected.getTime()) / 86400000))
}

function getModeLabel(ageDays) {
  if (ageDays <= 14) return 'Full detail'
  if (ageDays <= 365) return 'Daily user summary'
  return 'Platform summary only'
}

function getClaimLabel(reader) {
  if (reader?.claim_type === 'premium_auto_claim') return 'Premium Auto'
  if (reader?.claim_type === 'daily_bonus') return 'Manual Claim'
  return 'No Claim'
}

function getClaimClass(reader) {
  if (reader?.claim_type === 'premium_auto_claim') return 'premium'
  if (reader?.claim_type === 'daily_bonus') return 'manual'
  return ''
}

export default function TaskCenterReaderActivityPanel() {
  const todayKey = useMemo(() => getPhnomPenhDateKey(), [])
  const [activityDate, setActivityDate] = useState(todayKey)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const ageDays = getAgeDays(activityDate, todayKey)
  const summary = data?.summary || {}
  const readers = Array.isArray(data?.readers) ? data.readers : []
  const pagination = data?.pagination || {}
  const detailAvailable = data?.retention?.detail_available !== false

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivity() {
      try {
        setLoading(true)
        setError('')

        const params = new URLSearchParams({
          date: activityDate,
          filter,
          page: String(page),
          limit: String(PAGE_LIMIT),
          refresh: reloadKey > 0 ? '1' : '0',
        })

        const response = await fetch(
          `${API_URL}/api/task-center/admin/reader-activity?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${getAdminToken()}`,
            },
            signal: controller.signal,
          }
        )

        const result = await response.json()

        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'Failed to load reader activity')
        }

        setData(result)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Failed to load reader activity')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadActivity()

    return () => controller.abort()
  }, [activityDate, filter, page, reloadKey])

  function changeDate(value) {
    setActivityDate(value || todayKey)
    setPage(1)
  }

  function changeFilter(value) {
    setFilter(value)
    setPage(1)
  }

  return (
    <>
      <style>{styles}</style>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Reader Activity</h3>
            <p>Daily Task Center claims, reading progress, mission completion, and active readers.</p>
          </div>

          <span className="reader-activity-mode">{getModeLabel(ageDays)}</span>
        </div>

        <div className="panel-body">
          <div className="reader-activity">
            <div className="reader-activity-toolbar">
              <div className="reader-activity-controls">
                <div className="reader-activity-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={activityDate}
                    max={todayKey}
                    onChange={(event) => changeDate(event.target.value)}
                  />
                </div>

                <div className="reader-activity-field">
                  <label>Filter</label>
                  <select value={filter} onChange={(event) => changeFilter(event.target.value)}>
                    <option value="all">All Active</option>
                    <option value="manual">Manual Claim</option>
                    <option value="premium">Premium Auto</option>
                    <option value="completed">All Completed</option>
                    <option value="incomplete">In Progress</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="reader-activity-reload"
                  onClick={() => setReloadKey((value) => value + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Reload'}
                </button>
              </div>
            </div>

            {error ? <div className="reader-activity-error">{error}</div> : null}

            <div className="reader-activity-summary">
              <div className="reader-activity-stat">
                <div className="reader-activity-stat-label">Active Readers</div>
                <div className="reader-activity-stat-value">{formatNumber(summary.active_readers)}</div>
                <div className="reader-activity-stat-sub">Task Center activity</div>
              </div>

              <div className="reader-activity-stat">
                <div className="reader-activity-stat-label">Manual Claims</div>
                <div className="reader-activity-stat-value">{formatNumber(summary.manual_claims)}</div>
                <div className="reader-activity-stat-sub">Reader tapped Claim</div>
              </div>

              <div className="reader-activity-stat">
                <div className="reader-activity-stat-label">Premium Auto</div>
                <div className="reader-activity-stat-value">{formatNumber(summary.premium_auto_claims)}</div>
                <div className="reader-activity-stat-sub">Premium auto claims</div>
              </div>

              <div className="reader-activity-stat">
                <div className="reader-activity-stat-label">Mission Starters</div>
                <div className="reader-activity-stat-value">{formatNumber(summary.mission_starters)}</div>
                <div className="reader-activity-stat-sub">Started reading mission</div>
              </div>

              <div className="reader-activity-stat">
                <div className="reader-activity-stat-label">All Completed</div>
                <div className="reader-activity-stat-value">{formatNumber(summary.all_completed_users)}</div>
                <div className="reader-activity-stat-sub">Finished all tasks</div>
              </div>

              <div className="reader-activity-stat">
                <div className="reader-activity-stat-label">Completion Rate</div>
                <div className="reader-activity-stat-value">{formatPercent(summary.completion_rate)}</div>
                <div className="reader-activity-stat-sub">Completed ÷ active</div>
              </div>
            </div>

            <div className="reader-activity-note">
              No real-time polling. Data loads only when this tab opens, the date/filter/page changes, or Reload is pressed.
              {summary.updated_at ? ` Summary updated ${formatDateTime(summary.updated_at)}.` : ''}
            </div>

            {detailAvailable ? (
              <div className="reader-activity-table-wrap">
                <table className="reader-activity-table">
                  <thead>
                    <tr>
                      <th>Reader</th>
                      <th>Login Claim</th>
                      <th>Streak</th>
                      <th>Reading</th>
                      <th>Missions</th>
                      <th>Status</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading && readers.length === 0 ? (
                      <tr>
                        <td colSpan="7">
                          <div className="reader-activity-empty">No Task Center activity for this date.</div>
                        </td>
                      </tr>
                    ) : null}

                    {readers.map((reader) => {
                      const missionProgress = Array.isArray(reader.mission_progress)
                        ? reader.mission_progress
                        : []

                      return (
                        <tr key={`${reader.activity_date}-${reader.user_id}`}>
                          <td>
                            <div className="reader-activity-user">
                              {reader.user?.name || reader.user?.username || 'Unknown Reader'}
                            </div>
                            <div className="reader-activity-email">
                              {reader.user?.email || reader.user_id}
                            </div>
                          </td>

                          <td>
                            <span className={`reader-activity-pill ${getClaimClass(reader)}`}>
                              {getClaimLabel(reader)}
                            </span>
                          </td>

                          <td>
                            <strong>Day {Number(reader.streak_day || 0)}</strong>
                          </td>

                          <td>
                            <strong>{Number(reader.reading_minutes || 0)} min</strong>
                            <div className="reader-activity-email">
                              {formatPercent(reader.reading_percent)}
                            </div>
                          </td>

                          <td>
                            {missionProgress.length > 0 ? (
                              <div className="reader-activity-progress-list">
                                {missionProgress.map((mission) => (
                                  <div
                                    className="reader-activity-progress-item"
                                    key={mission.mission_id}
                                  >
                                    <span
                                      className="reader-activity-progress-title"
                                      title={mission.title || 'Reading Mission'}
                                    >
                                      {mission.title || 'Reading Mission'}
                                    </span>
                                    <span className="reader-activity-progress-percent">
                                      {formatPercent(mission.progress_percent)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <strong>
                                {Number(reader.missions_completed || 0)}/
                                {Number(reader.missions_total || 0)}
                              </strong>
                            )}
                          </td>

                          <td>
                            <span
                              className={`reader-activity-pill ${
                                reader.all_completed ? 'done' : 'progress'
                              }`}
                            >
                              {reader.all_completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>

                          <td>{formatDateTime(reader.last_activity_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="reader-activity-note">
                Individual reader detail is no longer retained for this date. The platform daily summary above is still available.
              </div>
            )}

            {detailAvailable ? (
              <div className="reader-activity-pagination">
                <div className="reader-activity-pagination-info">
                  {formatNumber(pagination.total)} readers · Page {Number(pagination.page || page)} of{' '}
                  {Math.max(1, Number(pagination.total_pages || 0))}
                </div>

                <div className="reader-activity-page-actions">
                  <button
                    type="button"
                    className="reader-activity-page-button"
                    disabled={loading || page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    className="reader-activity-page-button"
                    disabled={
                      loading ||
                      Number(pagination.total_pages || 0) <= page
                    }
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
