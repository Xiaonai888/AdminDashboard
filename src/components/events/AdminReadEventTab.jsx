import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const API_PATH = '/api/admin/events/read-event'
const FIRST_CYCLE = Date.UTC(2026, 10, 2)
const DAY_MS = 86400000
const CYCLE_DAYS = 28

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') || ''
}

function cambodiaToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const get = (name) => parts.find((part) => part.type === name)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

function dateAt(ms) {
  return new Date(ms).toISOString().slice(0, 10)
}

function currentCycle() {
  const today = Date.parse(`${cambodiaToday()}T00:00:00Z`)
  const elapsedDays = Math.floor((today - FIRST_CYCLE) / DAY_MS)
  return dateAt(FIRST_CYCLE + Math.max(0, Math.floor(elapsedDays / CYCLE_DAYS)) * CYCLE_DAYS * DAY_MS)
}

function shiftCycle(date, cycles) {
  const ms = Date.parse(`${date}T00:00:00Z`) + cycles * CYCLE_DAYS * DAY_MS
  return dateAt(Math.max(FIRST_CYCLE, ms))
}

function dayDate(startsOn, day) {
  return dateAt(Date.parse(`${startsOn}T00:00:00Z`) + (day - 1) * DAY_MS)
}

async function request(path, options = {}) {
  const token = getToken()
  if (!token) throw new Error('Admin login required')
  const response = await fetch(`${API_URL}${API_PATH}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.ok === false) {
    throw new Error(result.message || result.code || `Request failed (${response.status})`)
  }
  return result
}

const styles = `
  .rde{display:grid;gap:16px;color:var(--shadow-admin-text,#0f172a)}
  .rde *{box-sizing:border-box}
  .rde-panel{border:1px solid var(--shadow-admin-border,#e2e8f0);background:var(--shadow-admin-card,#fff);border-radius:16px;padding:18px}
  .rde-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .rde h2,.rde h3,.rde p{margin:0}
  .rde h2{font-size:18px;font-weight:850}.rde h3{font-size:14px;font-weight:800}
  .rde-muted{color:var(--shadow-admin-muted,#64748b);font-size:12px;line-height:1.6}
  .rde-btn{font:inherit;font-size:12px;font-weight:800;min-height:36px;padding:8px 14px;border:1px solid var(--shadow-admin-border,#cbd5e1);border-radius:10px;background:var(--shadow-admin-card,#fff);color:var(--shadow-admin-text,#0f172a);cursor:pointer}
  .rde-btn.primary{border-color:transparent;background:var(--shadow-admin-primary,#4f46e5);color:#fff}
  .rde-btn:disabled{opacity:.5;cursor:not-allowed}
  .rde-badge{display:inline-block;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:850;background:var(--shadow-admin-primary-light,#eef2ff);color:var(--shadow-admin-primary,#4f46e5)}
  .rde-badge.off{background:#fef3c7;color:#92400e}.rde-badge.on{background:#dcfce7;color:#166534}
  .rde-alert{padding:12px;border-radius:10px;font-size:12px;background:#eff6ff;color:#1e40af}
  .rde-alert.error{background:#fef2f2;color:#991b1b}
  .rde-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .rde-label{font-size:11px;color:var(--shadow-admin-muted,#64748b);margin-bottom:7px}
  .rde-value{font-size:22px;font-weight:900}
  .rde-days{display:flex;gap:6px;flex-wrap:wrap}
  .rde-days .rde-btn.selected{background:var(--shadow-admin-primary,#4f46e5);color:#fff;border-color:transparent}
  .rde-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:14px;align-items:start}
  .rde-stack{display:grid;gap:9px}.rde-entry{border:1px solid var(--shadow-admin-border,#e2e8f0);border-radius:10px;padding:12px}
  .rde-title{font-size:13px;font-weight:750;margin-bottom:5px;overflow-wrap:anywhere}
  .rde-mono{font-family:monospace;font-size:11px;overflow-wrap:anywhere}
  @media(max-width:900px){.rde-grid{grid-template-columns:1fr}.rde-cards{grid-template-columns:1fr}}
`

export default function AdminReadEventTab() {
  const [startsOn, setStartsOn] = useState(currentCycle)
  const [dayNumber, setDayNumber] = useState(1)
  const [refreshNumber, setRefreshNumber] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preparing, setPreparing] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setData(null)
    request(`/?starts_on=${encodeURIComponent(startsOn)}`, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setData(result) })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [startsOn, refreshNumber])

  const missions = useMemo(() =>
    (Array.isArray(data?.missions) ? data.missions : []).filter((m) => m.day_number === dayNumber),
  [data, dayNumber])
  const milestones = useMemo(() =>
    (Array.isArray(data?.milestones) ? data.milestones : []).filter((m) => m.day_number === dayNumber),
  [data, dayNumber])

  function navigate(direction) {
    if (preparing) return
    setStartsOn((date) => shiftCycle(date, direction))
    setDayNumber(1)
    setNotice('')
  }

  async function prepare() {
    if (preparing || loading || data?.exists) return
    if (!window.confirm(`Prepare Shadow Read Event for ${startsOn}? This will not enable the event.`)) return
    setPreparing(true)
    setError('')
    setNotice('')
    try {
      const result = await request('/prepare', {
        method: 'POST',
        body: JSON.stringify({ starts_on: startsOn }),
      })
      setNotice(result.created ? 'Event plan prepared. Event remains disabled.' : 'Event plan already exists.')
      setRefreshNumber((current) => current + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setPreparing(false)
    }
  }

  async function changeEventStatus() {
    if (!data?.exists || !data?.event?.id || loading || preparing || changingStatus) return
    const enabled = data.event.is_enabled !== true
    if (enabled && data.plan_complete !== true) return
    if (cambodiaToday() >= dayDate(startsOn, 8)) return
    const question = enabled
      ? `Enable the Shadow Read Event starting ${startsOn}? This activates missions and rewards.`
      : `Disable the Shadow Read Event starting ${startsOn}? Readers will lose event access and reward settlement will be paused while disabled.`
    if (!window.confirm(question)) return

    setChangingStatus(true)
    setError('')
    setNotice('')
    try {
      const result = await request('/status', {
        method: 'PATCH',
        body: JSON.stringify({ event_id: data.event.id, enabled }),
      })
      setNotice(result.changed
        ? enabled ? 'Read Event enabled.' : 'Read Event disabled.'
        : 'Event is already in this state.')
      setRefreshNumber((value) => value + 1)
    } catch (err) {
      setError(err.message || 'Unable to change event status')
    } finally {
      setChangingStatus(false)
    }
  }

  const prize = data?.prize_rules || {}
  const complete = data?.plan_complete === true
  const eventEnabled = data?.event?.is_enabled === true
  const eventClosed = cambodiaToday() >= dayDate(startsOn, 8)

  return (
    <div className="rde">
      <style>{styles}</style>
      <section className="rde-panel rde-row">
        <div className="rde-stack">
          <h2>Shadow Read Event</h2>
          <p className="rde-muted">7 days every 4 weeks · Cambodia Reader group · Asia/Phnom_Penh</p>
        </div>
        <div className="rde-row">
          <button type="button" className="rde-btn" onClick={() => navigate(-1)} disabled={startsOn === dateAt(FIRST_CYCLE) || loading || preparing}>Previous</button>
          <strong>{startsOn}</strong>
          <button type="button" className="rde-btn" onClick={() => navigate(1)} disabled={loading || preparing}>Next</button>
          <button type="button" className="rde-btn" onClick={() => setRefreshNumber((n) => n + 1)} disabled={loading || preparing}>Refresh</button>
        </div>
      </section>

      {error && <div className="rde-alert error" role="alert">{error}</div>}
      {notice && <div className="rde-alert" role="status">{notice}</div>}
      {loading ? <div className="rde-panel rde-muted">Loading event plan...</div> : null}

      {!loading && data && (
        <>
          <section className="rde-panel rde-stack">
            <div className="rde-row">
              <h3>Event plan</h3>
              <span className={`rde-badge ${eventEnabled ? 'on' : 'off'}`}>
                {!data.exists ? 'Not prepared' : eventEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {!data.exists ? (
              <>
                <p className="rde-muted">No plan for this cycle. Prepare creates 35 missions and 35 milestones without enabling the event.</p>
                <div><button type="button" className="rde-btn primary" disabled={preparing} onClick={prepare}>{preparing ? 'Preparing...' : 'Prepare Event'}</button></div>
              </>
            ) : (
              <>
                {!complete && <div className="rde-alert error" role="alert">Incomplete plan. Review before enabling.</div>}
                <div className="rde-cards">
                  <div className="rde-entry"><div className="rde-label">Missions</div><div className="rde-value">{data.missions?.length || 0}/35</div></div>
                  <div className="rde-entry"><div className="rde-label">Milestones</div><div className="rde-value">{data.milestones?.length || 0}/35</div></div>
                  <div className="rde-entry"><div className="rde-label">Participants</div><div className="rde-value">{Number(data.participant_count || 0).toLocaleString()}</div></div>
                </div>
                <div className="rde-entry">
                  <div className="rde-label">Featured prize story</div>
                  <div className="rde-mono">{data.event?.featured_story_id || '—'}</div>
                </div>
                <div className="rde-row">
                  <button
                    type="button"
                    className={`rde-btn ${eventEnabled ? '' : 'primary'}`}
                    disabled={changingStatus || preparing || loading || eventClosed || (!eventEnabled && !complete)}
                    onClick={changeEventStatus}
                  >
                    {changingStatus ? 'Saving...' : eventEnabled ? 'Disable Event' : 'Enable Event'}
                  </button>
                  <span className="rde-muted">
                    {eventClosed ? 'The event week has finished. Status changes are locked.'
                      : eventEnabled ? 'Event is enabled for eligible Khmer Readers.'
                        : 'Event is disabled until an Admin enables it.'}
                  </span>
                </div>
              </>
            )}
          </section>

          {data.exists && (
            <>
              <section className="rde-panel rde-stack">
                <h3>Daily missions · Select day</h3>
                <div className="rde-days">
                  {Array.from({ length: 7 }, (_, index) => (
                    <button key={index} type="button" className={`rde-btn ${dayNumber === index + 1 ? 'selected' : ''}`}
                      aria-pressed={dayNumber === index + 1} onClick={() => setDayNumber(index + 1)}>
                      Day {index + 1}
                    </button>
                  ))}
                </div>
                <p className="rde-muted">{dayDate(startsOn, dayNumber)} · 5 missions · 1,000 total points</p>
                <div className="rde-grid">
                  <div className="rde-stack">
                    <h3>Missions</h3>
                    {missions.map((m) => (
                      <div className="rde-entry" key={m.id || m.slot}>
                        <div className="rde-row"><span className="rde-title">{m.slot}. {String(m.mission_type || '').replace(/_/g, ' ')}</span><strong>{m.max_points} points</strong></div>
                        <p className="rde-muted">Target: {m.target_amount}</p>
                        {m.story_id ? <div className="rde-mono">Story: {m.story_id}</div> : null}
                      </div>
                    ))}
                    {missions.length !== 5 && <div className="rde-alert error">Mission data incomplete.</div>}
                  </div>
                  <div className="rde-stack">
                    <h3>Daily milestones</h3>
                    {milestones.map((m) => (
                      <div className="rde-entry rde-row" key={m.tier}>
                        <span className="rde-title">Tier {m.tier} · {m.required_points} points</span>
                        <strong>+{m.coin_reward} coins</strong>
                      </div>
                    ))}
                    {milestones.length !== 5 && <div className="rde-alert error">Milestone data incomplete.</div>}
                  </div>
                </div>
              </section>
            </>
          )}

          <section className="rde-panel rde-stack">
            <h3>Prize rules</h3>
            <div className="rde-grid">
              <div className="rde-stack">
                <p className="rde-muted">Daily ranking</p>
                {(prize.daily_top || []).map((row) => <div className="rde-entry rde-row" key={row.rank}>Top {row.rank}<strong>{row.coins} coins + {row.vouchers} vouchers</strong></div>)}
              </div>
              <div className="rde-stack">
                <p className="rde-muted">Overall ranking</p>
                {(prize.overall_top || []).map((row) => <div className="rde-entry rde-row" key={row.rank}>Top {row.rank}<strong>{row.story_cards} story cards + gift box</strong></div>)}
                <p className="rde-muted">Other participants: {prize.participation?.story_cards || 10} cards + {prize.participation?.vouchers || 10} vouchers + random coins.</p>
              </div>
            </div>
            <p className="rde-muted">Enable and Disable affect this event only. Prize amounts cannot be changed here; payouts remain server-controlled.</p>
          </section>
        </>
      )}
    </div>
  )
}
