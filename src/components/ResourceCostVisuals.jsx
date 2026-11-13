import React, { useMemo } from 'react'
import { formatResourceBytes, formatResourceCount } from '../services/resourceCostApi'

const TRAFFIC_SEGMENTS = [
  { key: 'http_response_bytes', label: 'HTTP responses', color: '#6366f1' },
  { key: 'service_initiated_bytes', label: 'Service-initiated', color: '#a855f7' },
  { key: 'websocket_response_bytes', label: 'WebSocket', color: '#14b8a6' },
  { key: 'private_link_bytes', label: 'Private Link', color: '#f59e0b' },
]

function hasMeasuredRender(day) {
  return Number(day?.render?.observed_service_hours) > 0
}

export function ResourceCostTrend({ days = [] }) {
  const points = useMemo(() => {
    const sources = days.map((day) => ({
      date: day.date,
      bytes: hasMeasuredRender(day) ? Number(day.render.total_bytes) : null,
    }))
    const max = Math.max(1, ...sources.map((day) => day.bytes ?? 0))
    const left = 54
    const right = 700
    const top = 16
    const bottom = 182
    const width = right - left
    return {
      max,
      items: sources.map((day, index) => ({
        ...day,
        x: left + (sources.length <= 1 ? 0.5 : index / (sources.length - 1)) * width,
        y: day.bytes === null ? null : bottom - (day.bytes / max) * (bottom - top),
      })),
    }
  }, [days])
  const segments = useMemo(() => {
    const result = []
    let sequence = []
    for (const point of points.items) {
      if (point.y === null) {
        if (sequence.length) result.push(sequence)
        sequence = []
      } else sequence.push(point)
    }
    if (sequence.length) result.push(sequence)
    return result
  }, [points])
  const hasData = points.items.some((day) => day.bytes !== null)
  return (
    <div className="rc-graph" aria-label="Render outbound bandwidth by Cambodia calendar day">
      {hasData ? (
        <svg role="img" viewBox="0 0 720 220" preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = 182 - fraction * 166
            return <g key={fraction}>
              <line x1="54" x2="700" y1={y} y2={y} stroke="#e8eaf0" strokeDasharray={fraction ? '4 5' : ''} />
              <text x="44" y={y + 4} textAnchor="end" fontSize="10" fill="#8a93a5">{formatResourceBytes(points.max * fraction)}</text>
            </g>
          })}
          {segments.map((sequence, index) => (
            <polyline key={index} points={sequence.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#7957dd" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {points.items.filter((day) => day.y !== null).map((day) => (
            <circle key={day.date} cx={day.x} cy={day.y} r="3.5" fill="#7957dd" stroke="white" strokeWidth="1.5">
              <title>{day.date}: {formatResourceBytes(day.bytes)}</title>
            </circle>
          ))}
          {points.items.filter((day, index) => index === 0 || index === points.items.length - 1 || (points.items.length <= 9 && index % 2 === 0) || (points.items.length > 9 && index % Math.ceil(points.items.length / 6) === 0)).map((day) => (
            <text key={day.date} x={day.x} y="209" textAnchor="middle" fontSize="10" fill="#8a93a5">{day.date.slice(5)}</text>
          ))}
        </svg>
      ) : <div className="rc-empty-chart">No provider bandwidth recorded for this period.</div>}
      <div className="rc-chart-footnote">Render provider records only · Missing days are not plotted as zero</div>
    </div>
  )
}

export function ResourceCostTrafficSplit({ render, hasSource }) {
  const total = hasSource ? Number(render?.total_bytes) : 0
  const known = TRAFFIC_SEGMENTS.map((item) => ({
    ...item,
    bytes: Number.isFinite(Number(render?.[item.key])) ? Number(render[item.key]) : 0,
    available: render?.[item.key] !== null && render?.[item.key] !== undefined,
  }))
  const recognized = known.reduce((sum, item) => sum + item.bytes, 0)
  const unknown = Math.max(0, total - recognized)
  let offset = 0
  const gradient = known.map((item) => {
    const start = offset
    offset += total > 0 ? item.bytes / total * 100 : 0
    return `${item.color} ${start}% ${offset}%`
  })
  gradient.push(`#e5e7eb ${offset}% 100%`)
  const background = total > 0 ? `conic-gradient(${gradient.join(', ')})` : '#e5e7eb'
  return (
    <div className="rc-split">
      <div className="rc-donut" style={{ background }} aria-label="Render outbound categories">
        <div className="rc-donut-hole"><strong>{hasSource ? formatResourceBytes(total) : '—'}</strong><span>Render total</span></div>
      </div>
      <div className="rc-split-legend">
        {known.map((item) => <div className="rc-legend-row" key={item.key}>
          <span className="rc-color-dot" style={{ background: item.color }} />
          <span>{item.label}</span>
          <strong>{hasSource && item.available ? formatResourceBytes(item.bytes) : '—'}</strong>
        </div>)}
        <div className="rc-legend-row"><span className="rc-color-dot" style={{ background: '#e5e7eb' }}/><span>Unclassified / gap</span><strong>{hasSource ? formatResourceBytes(unknown) : '—'}</strong></div>
      </div>
    </div>
  )
}

export function ResourceCostTopDrivers({ days = [], attributionStatus = 'missing' }) {
  const rows = useMemo(() => {
    const map = new Map()
    for (const day of days) {
      for (const row of day.application_attribution || []) {
        const key = `${row.feature || 'unknown'}|${row.dependency || 'UNKNOWN'}|${row.kind || 'unknown'}`
        const current = map.get(key) || { feature: row.feature || 'Unknown', dependency: row.dependency || 'UNKNOWN', bytes: 0, count: 0 }
        current.bytes += Number(row.observed_bytes) || 0
        current.count += Number(row.observed_events) || 0
        map.set(key, current)
      }
    }
    return [...map.values()].sort((a, b) => b.bytes - a.bytes || b.count - a.count).slice(0, 6)
  }, [days])
  const max = Math.max(1, ...rows.map((row) => row.bytes))
  return <div className="rc-drivers">
    {rows.length ? rows.map((row, index) => <div className="rc-driver" key={`${index}-${row.feature}-${row.dependency}`}>
      <div className="rc-driver-head"><span title={`${row.feature} · ${row.dependency}`}>{row.feature} · {row.dependency}</span><strong>{formatResourceBytes(row.bytes)}</strong></div>
      <div className="rc-driver-bar"><div style={{ width: `${Math.max(1, row.bytes / max * 100)}%` }} /></div>
      <div className="rc-driver-caption">{formatResourceCount(row.count)} observed events</div>
    </div>) : <div className="rc-empty-chart">No application attribution stored for this range.</div>}
    <div className="rc-chart-footnote">Observed API payloads, not actual invoice cost · {attributionStatus.replaceAll('_', ' ')}</div>
  </div>
}
