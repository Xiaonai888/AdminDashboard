import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const CACHE_KEY = 'shadow_admin_visitor_growth_daily_v1'
const DAY_MS = 86400000
let memoryCache = null
let pending = null

function cambodiaDay() {
  return new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)
}

function shiftDay(day, amount) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + amount * DAY_MS).toISOString().slice(0, 10)
}

function displayNumber(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function readCache() {
  const key = cambodiaDay()
  if (memoryCache?.key === key) return memoryCache.data
  try {
    const value = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (value?.key === key && Array.isArray(value.data?.days) && value.data?.as_of) {
      memoryCache = value
      return value.data
    }
  } catch {
    return null
  }
  return null
}

async function loadSnapshot() {
  const cached = readCache()
  if (cached) return cached
  const key = cambodiaDay()
  if (pending?.key === key) return pending.promise
  const promise = (async () => {
    const token = sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
    if (!token) throw new Error('Admin session required')
    const response = await fetch(`${API_URL}/api/admin/community/visitor-growth/daily`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok || result.ok === false) throw new Error(result.message || `Request failed (${response.status})`)
    if (!Array.isArray(result.days) || !result.as_of) throw new Error('Invalid visitor growth snapshot')
    const data = { as_of: result.as_of, days: result.days }
    const entry = { key, data }
    memoryCache = entry
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry)) } catch {}
    return data
  })().finally(() => { pending = null })
  pending = { key, promise }
  return promise
}

function summarize(rows) {
  return rows.reduce((acc, row) => {
    acc.visitors += Number(row.visitors || 0)
    acc.humans += Number(row.humans || 0)
    acc.suspected_bots += Number(row.suspected_bots || 0)
    acc.likely_bots += Number(row.likely_bots || 0)
    acc.normal_risk += Number(row.normal_risk || 0)
    acc.low_risk += Number(row.low_risk || 0)
    acc.suspicious_risk += Number(row.suspicious_risk || 0)
    acc.high_risk += Number(row.high_risk || 0)
    return acc
  }, { visitors: 0, humans: 0, suspected_bots: 0, likely_bots: 0, normal_risk: 0, low_risk: 0, suspicious_risk: 0, high_risk: 0 })
}

export default function VisitorGrowthSection() {
  const [snapshot, setSnapshot] = useState(null)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('yesterday')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  useEffect(() => {
    let alive = true
    loadSnapshot().then(data => { if (alive) setSnapshot(data) }).catch(err => { if (alive) setError(err.message || 'Failed to load visitor growth') })
    return () => { alive = false }
  }, [])

  const range = useMemo(() => {
    const end = snapshot?.as_of || shiftDay(cambodiaDay(), -1)
    const today = shiftDay(end, 1)
    const monthStart = `${today.slice(0, 7)}-01`
    const weekDay = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7
    if (period === 'yesterday') return [end, end]
    if (period === 'last7') return [shiftDay(end, -6), end]
    if (period === 'week') return [shiftDay(today, -weekDay), end]
    if (period === 'month') return [monthStart, end]
    if (period === 'last30') return [shiftDay(end, -29), end]
    if (period === 'last12') return [shiftDay(today, -365), end]
    return [customStart || end, customEnd || end]
  }, [snapshot, period, customStart, customEnd])

  const rows = useMemo(() => (snapshot?.days || []).filter(row => row.date >= range[0] && row.date <= range[1]).sort((a, b) => a.date.localeCompare(b.date)), [snapshot, range])
  const totals = useMemo(() => summarize(rows), [rows])
  const hourly = period === 'yesterday' && rows[0]?.hours?.length === 24
  const bars = hourly ? rows[0].hours.map((value, index) => ({ label: String(index).padStart(2, '0'), value: Number(value || 0) })) : rows.map(row => ({ label: row.date.slice(5), value: Number(row.visitors || 0) }))
  const maxValue = Math.max(1, ...bars.map(item => item.value))
  const risk = [
    ['Humans', totals.humans, '#10b981'],
    ['Normal Risk', totals.normal_risk, '#2563eb'],
    ['Low Risk', totals.low_risk, '#60a5fa'],
    ['Suspicious or Higher', totals.suspicious_risk + totals.likely_bots + totals.high_risk, '#f59e0b'],
    ['Suspected Bots', totals.suspected_bots, '#ef4444'],
    ['Likely Bots', totals.likely_bots, '#7c3aed'],
    ['High Risk', totals.high_risk, '#dc2626'],
  ]
  const periods = [['yesterday', 'Yesterday'], ['last7', 'Last 7 days'], ['week', 'This week'], ['month', 'This month'], ['last30', 'Last 30 days'], ['last12', 'Last 12 months'], ['custom', 'Custom']]

  return (
    <section className="vg-root">
      <style>{styles}</style>
      <div className="vg-head">
        <div><h2>Visitor Growth</h2><p>Daily visitor snapshots · counts only · Cambodia time</p></div>
        <div className="vg-badges"><span>Cached snapshot · no live visitor query</span><span>Daily snapshot · not real time</span></div>
      </div>
      <div className="vg-filters">{periods.map(([key, title]) => <button key={key} type="button" className={period === key ? 'selected' : ''} onClick={() => setPeriod(key)}>{title}</button>)}</div>
      {period === 'custom' && <div className="vg-custom"><label>From <input type="date" value={customStart} max={snapshot?.as_of} onChange={e => setCustomStart(e.target.value)} /></label><label>To <input type="date" value={customEnd} max={snapshot?.as_of} onChange={e => setCustomEnd(e.target.value)} /></label></div>}
      {error ? <div className="vg-error">{error}</div> : !snapshot ? <div className="vg-loading">Loading visitor growth...</div> : <>
        <div className="vg-cards">
          {[
            ['Visitors', totals.visitors, '◎', '#4f46e5'],
            ['Humans', totals.humans, '●', '#059669'],
            ['Suspected Bots', totals.suspected_bots, '⚠', '#dc2626'],
            ['Likely Bots', totals.likely_bots, '◇', '#7c3aed'],
          ].map(([label, value, icon, color]) => <div className="vg-card" key={label}><span className="vg-icon" style={{ color }}>{icon}</span><div><small>{period === 'yesterday' && label === 'Visitors' ? 'Yesterday Visitors' : label}</small><strong>{displayNumber(value)}</strong></div></div>)}
        </div>
        <div className="vg-content">
          <div className="vg-chart-card"><h3>{period === 'yesterday' ? 'Yesterday · hourly visitors' : 'Visitors by day'}</h3><p>{range[0]}{range[0] !== range[1] ? ` — ${range[1]}` : ''}</p><div className="vg-chart-scroll"><div className="vg-chart" style={{ minWidth: `${Math.max(480, bars.length * 35)}px` }}>{bars.length ? bars.map((bar, index) => <div className="vg-bar-slot" key={`${bar.label}-${index}`}><span>{displayNumber(bar.value)}</span><div className="vg-track"><div className="vg-bar" style={{ height: `${bar.value ? Math.max(3, bar.value / maxValue * 100) : 0}%` }} /></div><small>{bar.label}</small></div>) : <div className="vg-no-data">No visitor data for this period</div>}</div></div></div>
          <div className="vg-risk-card"><h3>Risk breakdown</h3>{risk.map(([label, value, color]) => <div className="vg-risk-row" key={label}><span><i style={{ background: color }} />{label}</span><strong>{displayNumber(value)}</strong></div>)}</div>
        </div>
        <p className="vg-note">Available through {snapshot.as_of} · Daily snapshot · Changing filters does not query live sessions.</p>
      </>}
    </section>
  )
}

const styles = `
.vg-root{padding:22px;color:#0f172a;background:#fff}
.vg-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
.vg-head h2{font-size:24px;font-weight:900;margin:0 0 6px}.vg-head p,.vg-chart-card p{margin:0;color:#64748b;font-size:12px}
.vg-badges{display:flex;flex-direction:column;gap:7px;align-items:flex-end}.vg-badges span{font-size:11px;font-weight:800;background:#eef2ff;color:#4f46e5;padding:9px 12px;border-radius:24px}.vg-badges span+span{background:#ecfdf5;color:#059669}
.vg-filters{display:flex;gap:8px;flex-wrap:wrap;margin:22px 0 18px}.vg-filters button{border:1px solid #dbe3f1;background:white;border-radius:11px;padding:10px 14px;color:#475569;font-weight:800;font-size:12px;cursor:pointer}.vg-filters button.selected{border-color:#4f46e5;background:#eef2ff;color:#4f46e5}
.vg-custom{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}.vg-custom label{font-size:12px;color:#64748b}.vg-custom input{padding:8px;border-radius:8px;border:1px solid #dbe3f1;margin-left:8px}
.vg-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.vg-card{border:1px solid #dbe3f1;border-radius:14px;padding:18px;display:flex;gap:14px;align-items:center;min-width:0}.vg-icon{background:#f5f6ff;padding:13px;border-radius:14px;font-size:20px}.vg-card small{font-size:12px;color:#64748b;font-weight:800;display:block;margin-bottom:6px}.vg-card strong{display:block;font-size:28px;font-weight:900}
.vg-content{display:grid;grid-template-columns:minmax(0,3fr) minmax(250px,1fr);gap:16px}.vg-chart-card,.vg-risk-card{border:1px solid #dbe3f1;border-radius:16px;padding:18px;min-width:0}.vg-chart-card h3,.vg-risk-card h3{margin:0 0 7px;font-size:17px}.vg-chart-scroll{overflow-x:auto}.vg-chart{display:flex;height:270px;gap:7px;align-items:stretch;padding-top:26px}.vg-bar-slot{flex:1;min-width:25px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;font-size:10px;font-weight:800;color:#64748b}.vg-bar-slot>span{margin-bottom:6px}.vg-track{height:200px;width:100%;display:flex;align-items:flex-end;border-bottom:1px solid #dbe3f1;background:repeating-linear-gradient(to top,transparent 0px,transparent 49px,#f1f5f9 50px)}.vg-bar{width:100%;background:linear-gradient(180deg,#818cf8,#4f46e5);border-radius:5px 5px 0 0}.vg-bar-slot small{font-size:10px;font-weight:700;margin-top:9px;white-space:nowrap}.vg-risk-row{display:flex;justify-content:space-between;gap:9px;align-items:center;border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-top:7px;font-size:12px;font-weight:800}.vg-risk-row span{display:flex;align-items:center;gap:8px;color:#64748b}.vg-risk-row i{width:9px;height:9px;border-radius:50%;flex-shrink:0}.vg-risk-row strong{font-size:15px}.vg-note{font-size:11px;color:#64748b;margin:14px 0 0}.vg-error{padding:16px;border-radius:12px;background:#fef2f2;color:#b91c1c}.vg-loading,.vg-no-data{padding:30px;color:#64748b;text-align:center;width:100%}
@media(max-width:1000px){.vg-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.vg-content{grid-template-columns:1fr}.vg-risk-card{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.vg-risk-card h3{grid-column:1/-1}.vg-risk-row{margin:0}}
@media(max-width:580px){.vg-root{padding:14px}.vg-cards{gap:9px}.vg-card{padding:12px;gap:8px}.vg-card strong{font-size:21px}.vg-icon{padding:9px}.vg-risk-card{grid-template-columns:1fr}.vg-head h2{font-size:20px}.vg-badges{align-items:flex-start}}
`
