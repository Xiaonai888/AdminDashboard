import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const SNAPSHOT_REFRESH_MS = 30 * 1000
const INCIDENT_REFRESH_MS = 60 * 1000

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function formatMb(value) {
  const number = Number(value || 0)
  return number >= 1 ? number.toFixed(2) : number.toFixed(4)
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString()
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function anomalyStyle(status) {
  const value = String(status || 'learning').toLowerCase()

  if (value === 'active') {
    return { background: '#FEF2F2', color: '#B91C1C' }
  }

  if (value === 'suspect' || value === 'recovery') {
    return { background: '#FFF7ED', color: '#C2410C' }
  }

  if (value === 'normal') {
    return { background: '#ECFDF5', color: '#047857' }
  }

  return { background: '#F1F5F9', color: '#64748B' }
}

function incidentStyle(status) {
  const value = String(status || '').toUpperCase()

  if (value === 'OPEN') {
    return { background: '#FEF2F2', color: '#B91C1C' }
  }

  if (value === 'INVESTIGATING') {
    return { background: '#FFF7ED', color: '#C2410C' }
  }

  return { background: '#ECFDF5', color: '#047857' }
}

export default function AdminSystemControlPage() {
  const [usage, setUsage] = useState(null)
  const [anomaly, setAnomaly] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const loadSnapshot = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setError('Admin token is missing.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/admin/system-control/snapshot`,
        {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.message || 'System Control snapshot failed.')
      }

      setUsage(data.usage || null)
      setAnomaly(data.anomaly || null)
      setUpdatedAt(Date.now())
      setError('')
    } catch (loadError) {
      setError(loadError?.message || 'System Control snapshot failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadIncidents = useCallback(async () => {
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch(
        `${API_URL}/api/admin/system-control/incidents?limit=20`,
        {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.message || 'System Control incidents failed.')
      }

      setIncidents(Array.isArray(data.incidents) ? data.incidents : [])
    } catch (loadError) {
      setError(loadError?.message || 'System Control incidents failed.')
    }
  }, [])

  useEffect(() => {
    loadSnapshot()
    loadIncidents()

    const snapshotTimer = setInterval(() => {
      if (document.visibilityState === 'visible') loadSnapshot()
    }, SNAPSHOT_REFRESH_MS)

    const incidentTimer = setInterval(() => {
      if (document.visibilityState === 'visible') loadIncidents()
    }, INCIDENT_REFRESH_MS)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadSnapshot()
        loadIncidents()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(snapshotTimer)
      clearInterval(incidentTimer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [loadIncidents, loadSnapshot])

  const rows = useMemo(
    () => (Array.isArray(usage?.minute?.rows) ? usage.minute.rows : []),
    [usage]
  )

  const live = usage?.live || {}
  const minute = usage?.minute || {}
  const monitor = usage?.monitor || {}
  const anomalyStatus = anomaly?.status || 'learning'
  const anomalyBadge = anomalyStyle(anomalyStatus)

  return (
    <AdminLayout
      title="System Control"
      subtitle="Central usage, cost, anomaly and protection control for Shadow services."
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ padding: '8px 11px', borderRadius: 999, background: '#ECFDF5', color: '#047857', fontSize: 10, fontWeight: 900 }}>
            RAM Live
          </span>
          <span style={{ padding: '8px 11px', borderRadius: 999, fontSize: 10, fontWeight: 900, ...anomalyBadge }}>
            Anomaly: {String(anomalyStatus).toUpperCase()}
          </span>
          <span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 800 }}>
            Updated {formatTime(updatedAt)}
          </span>
          <button
            type="button"
            onClick={() => {
              loadSnapshot()
              loadIncidents()
            }}
            disabled={loading}
            style={{ minHeight: 34, padding: '0 12px', border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff', fontWeight: 900, cursor: 'pointer' }}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error ? (
          <div style={{ padding: 14, borderRadius: 12, background: '#FEF2F2', color: '#B91C1C', fontSize: 11, fontWeight: 800 }}>
            {error}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
          {[
            ['Live Requests', formatNumber(live.count), 'Current 15-second RAM window'],
            ['Live Traffic', `${formatMb(live.mb)} MB`, 'HTTP response + measured outbound'],
            ['Minute Errors', formatNumber(minute.errors), 'Current 60-second RAM window'],
            ['Monitor CPU Time', `${formatNumber(monitor.processing_ms)} ms`, 'Accumulated telemetry processing time'],
          ].map(([label, value, note]) => (
            <div key={label} style={{ minHeight: 118, padding: 17, border: '1px solid #E2E8F0', borderRadius: 18, background: '#fff' }}>
              <div style={{ color: '#64748B', fontSize: 10, fontWeight: 900 }}>{label}</div>
              <div style={{ marginTop: 8, color: '#0F172A', fontSize: 26, fontWeight: 950 }}>{value}</div>
              <div style={{ marginTop: 8, color: '#94A3B8', fontSize: 9, fontWeight: 750 }}>{note}</div>
            </div>
          ))}
        </div>

        <div style={{ overflow: 'hidden', border: '1px solid #E2E8F0', borderRadius: 18, background: '#fff' }}>
          <div style={{ padding: 15, borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 14, fontWeight: 950, color: '#0F172A' }}>Usage Incidents</div>
            <div style={{ marginTop: 4, color: '#94A3B8', fontSize: 9, fontWeight: 750 }}>
              Persistent anomaly incidents · refreshed every 60 seconds while visible
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 850, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Status', 'Feature', 'Route', 'Dependency', 'Recurrence', 'Last Seen'].map((head) => (
                    <th key={head} style={{ padding: '10px 12px', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: 9, fontWeight: 950, textAlign: 'left' }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>
                      <span style={{ display: 'inline-flex', padding: '5px 8px', borderRadius: 999, fontSize: 9, fontWeight: 950, ...incidentStyle(incident.status) }}>
                        {incident.status}
                      </span>
                    </td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{incident.feature || 'unknown'}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10, fontWeight: 900 }}>{incident.source_route || 'UNKNOWN'}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{incident.dependency || 'UNKNOWN'}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{formatNumber(incident.recurrence_count)}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{formatDateTime(incident.last_seen_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {incidents.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748B', fontSize: 11, fontWeight: 800 }}>
              No persistent usage incidents.
            </div>
          ) : null}
        </div>

        <div style={{ overflow: 'hidden', border: '1px solid #E2E8F0', borderRadius: 18, background: '#fff' }}>
          <div style={{ padding: 15, borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 14, fontWeight: 950, color: '#0F172A' }}>Current Minute Cost Drivers</div>
            <div style={{ marginTop: 4, color: '#94A3B8', fontSize: 9, fontWeight: 750 }}>
              Feature → route → dependency ranked by measured bytes
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Feature', 'Route', 'Dependency', 'Requests', 'MB', 'Errors', 'Avg ms'].map((head) => (
                    <th key={head} style={{ padding: '10px 12px', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: 9, fontWeight: 950, textAlign: 'left' }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 25).map((row, index) => (
                  <tr key={`${row.kind}-${row.source_route}-${row.dependency}-${index}`}>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{row.feature || 'unknown'}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10, fontWeight: 900 }}>{row.source_route || '—'}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{row.dependency || 'UNKNOWN'}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{formatNumber(row.count)}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{formatMb(row.mb)}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{formatNumber(row.errors)}</td>
                    <td style={{ padding: 11, borderBottom: '1px solid #F1F5F9', fontSize: 10 }}>{formatNumber(row.avg_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748B', fontSize: 11, fontWeight: 800 }}>
              Waiting for live traffic.
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  )
}
