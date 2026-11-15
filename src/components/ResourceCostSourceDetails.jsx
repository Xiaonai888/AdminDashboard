import React, { useMemo, useState } from 'react'
import { formatResourceBytes, formatResourceCount } from '../services/resourceCostApi'

const SOURCES = [
  { value: 'all', label: 'All sources' },
  { value: 'public_api', label: 'Public API' },
  { value: 'admin_api', label: 'Admin API' },
  { value: 'background', label: 'Background' },
  { value: 'unknown_entry', label: 'Unattributed' },
  { value: 'monitor_overflow', label: 'Monitor overflow' },
]

function sourceOf(row) {
  if (row.entry_point) return row.entry_point
  if (row.feature === 'background') return 'background'
  if (String(row.route || '').match(/\b\/api\/admin(?:\/|$)/i) || String(row.feature || '').startsWith('admin')) return 'admin_api'
  if (row.classification === 'not_recorded' || row.kind === 'unclassified') return 'unknown_entry'
  return 'public_api'
}

function breakdown(days) {
  const groups = new Map()
  for (const day of days || []) {
    for (const row of day?.route_attribution || []) {
      const source = sourceOf(row)
      const identity = [source, row.feature, row.kind, row.dependency, row.route, row.target, row.classification].join('\u001f')
      const current = groups.get(identity) || {
        source, feature: row.feature || 'unknown', kind: row.kind || 'unknown',
        dependency: row.dependency || 'UNKNOWN', route: row.route || 'UNKNOWN',
        target: row.target || 'MULTIPLE', classification: row.classification || 'unknown',
        count: 0, bytes: 0,
      }
      current.count += Number(row.observed_events ?? row.count) || 0
      current.bytes += Number(row.observed_bytes ?? row.bytes) || 0
      groups.set(identity, current)
    }
  }
  return [...groups.values()].sort((a, b) => b.bytes - a.bytes || b.count - a.count)
}

export default function ResourceCostSourceDetails({ days = [] }) {
  const [source, setSource] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)
  const rows = useMemo(() => breakdown(days), [days])
  const filtered = useMemo(() => rows.filter((row) => {
    if (source !== 'all' && row.source !== source) return false
    const text = `${row.feature} ${row.route} ${row.target} ${row.dependency} ${row.classification}`.toLowerCase()
    return text.includes(search.trim().toLowerCase())
  }), [rows, source, search])
  const visible = expanded ? filtered : filtered.slice(0, 30)
  const notRecorded = rows.filter((row) => row.classification === 'not_recorded').reduce((sum, row) => sum + row.bytes, 0)

  return <section className="rc-panel">
    <div className="rc-panel-head">
      <div><h2>API Source Details</h2><p>Observed route, operation and dependency · Not invoice cost</p></div>
      <span className="rc-subtle">{formatResourceCount(rows.length)} groups</span>
    </div>
    <div className="rc-range-controls" style={{ marginBottom: 14 }}>
      <label className="rc-field-label" htmlFor="rc-route-source">Source</label>
      <select id="rc-route-source" value={source} onChange={(event) => { setSource(event.target.value); setExpanded(false) }}>
        {SOURCES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <label className="rc-field-label" htmlFor="rc-route-query">Find API</label>
      <input id="rc-route-query" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setExpanded(false) }} placeholder="Route, feature or provider" style={{ height: 38, padding: '0 12px', border: '1px solid #dce0eb', borderRadius: 9, minWidth: 190 }} />
    </div>
    <div className="rc-table-scroll"><table className="rc-table">
      <thead><tr><th>Feature / API Route</th><th>Source</th><th>Dependency / Target</th><th>Detail quality</th><th>Events</th><th>Data</th></tr></thead>
      <tbody>
        {visible.map((row) => <tr key={[row.source, row.feature, row.kind, row.dependency, row.route, row.target, row.classification].join(':')}>
          <td><strong>{row.feature}</strong><small title={row.route}>{row.route}</small></td>
          <td>{row.source.replaceAll('_', ' ')}</td>
          <td><strong>{row.dependency}</strong><small title={row.target}>{row.target}</small></td>
          <td>{row.classification.replaceAll('_', ' ')}</td>
          <td>{formatResourceCount(row.count)}</td>
          <td><strong>{formatResourceBytes(row.bytes)}</strong></td>
        </tr>)}
        {!visible.length && <tr><td colSpan="6" className="rc-no-rows">No route-level attribution is available for this period. Old snapshots may contain feature-level data only.</td></tr>}
      </tbody>
    </table></div>
    {filtered.length > 30 && <button className="rc-more" type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show fewer routes' : `Show all ${formatResourceCount(filtered.length)} routes`}</button>}
    <div className="rc-chart-footnote">Unattributed evidence: {formatResourceBytes(notRecorded)}. OTHER ROUTES retains known feature/dependency totals; OVERFLOW and NOT RECORDED do not identify an exact API.</div>
  </section>
}
