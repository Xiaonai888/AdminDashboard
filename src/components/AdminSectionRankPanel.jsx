import React, { useCallback, useEffect, useMemo, useState } from 'react'

const formatNumber = (value) => Number(value || 0).toLocaleString()

const formatRate = (reads, views) => {
  const totalViews = Number(views || 0)
  if (!totalViews) return '0%'
  return `${Math.round((Number(reads || 0) / totalViews) * 100)}%`
}

const formatTrafficShare = (value) => `${Number(value || 0).toFixed(1)}%`

export default function AdminSectionRankPanel({ apiUrl, token }) {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({
    totalUniqueUsers: 0,
    totalTrafficViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${apiUrl}/api/admin/ranking/sections?range=today`, {
        method: 'GET',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to load section ranking.')
      }

      setRows(Array.isArray(payload?.data) ? payload.data : [])
      setSummary({
        totalUniqueUsers: Number(payload?.meta?.totalUniqueUsers || 0),
        totalTrafficViews: Number(payload?.meta?.totalTrafficViews || 0),
      })
      setUpdatedAt(payload?.meta?.updatedAt || new Date().toISOString())
    } catch (err) {
      setRows([])
      setSummary({
        totalUniqueUsers: 0,
        totalTrafficViews: 0,
      })
      setError(err?.message || 'Failed to load section ranking.')
    } finally {
      setLoading(false)
    }
  }, [apiUrl, token])

  useEffect(() => {
    load()
  }, [load])

  const rankedRows = useMemo(() => {
    return [...rows]
      .sort((a, b) => {
        const userDiff = Number(b?.uniqueUsers || 0) - Number(a?.uniqueUsers || 0)
        if (userDiff !== 0) return userDiff

        const viewDiff = Number(b?.qualifiedViews || 0) - Number(a?.qualifiedViews || 0)
        if (viewDiff !== 0) return viewDiff

        return Number(b?.qualifiedReads || 0) - Number(a?.qualifiedReads || 0)
      })
      .map((row, index) => ({ ...row, rank: index + 1 }))
  }, [rows])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '12px 16px',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              padding: '9px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              background: '#F8FAFC',
            }}
          >
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>
              Section Visitors Today
            </div>
            <div style={{ marginTop: 2, fontSize: 18, fontWeight: 950 }}>
              {formatNumber(summary.totalUniqueUsers)}
            </div>
          </div>

          <div
            style={{
              padding: '9px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              background: '#F8FAFC',
            }}
          >
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800 }}>
              Section Views Today
            </div>
            <div style={{ marginTop: 2, fontSize: 18, fontWeight: 950 }}>
              {formatNumber(summary.totalTrafficViews)}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="ranking-btn light"
          onClick={load}
          disabled={loading}
          style={{ padding: '0 14px' }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div style={{ padding: 16 }}>
          <div className="ranking-alert">{error}</div>
        </div>
      ) : null}

      <div className="ranking-table-wrap">
        <table className="ranking-table" style={{ minWidth: 980 }}>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Rank</th>
              <th>Section</th>
              <th>Unique Users</th>
              <th>Traffic Share</th>
              <th>Qualified View</th>
              <th>Qualified Read</th>
              <th>Read Rate</th>
            </tr>
          </thead>

          <tbody>
            {loading && rankedRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 28 }}>
                  Loading section ranking...
                </td>
              </tr>
            ) : null}

            {!loading && rankedRows.length === 0 && !error ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 28 }}>
                  No section ranking data for today.
                </td>
              </tr>
            ) : null}

            {rankedRows.map((row) => (
              <tr key={row.sectionKey || row.sectionName}>
                <td>
                  <strong>#{row.rank}</strong>
                </td>
                <td>
                  <div style={{ fontWeight: 950 }}>
                    {row.sectionName || row.sectionKey || 'Unknown'}
                  </div>
                </td>
                <td>
                  <strong>{formatNumber(row.uniqueUsers)}</strong>
                </td>
                <td>
                  <strong>{formatTrafficShare(row.trafficSharePercent)}</strong>
                </td>
                <td>{formatNumber(row.qualifiedViews)}</td>
                <td>{formatNumber(row.qualifiedReads)}</td>
                <td>{formatRate(row.qualifiedReads, row.qualifiedViews)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {updatedAt ? (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #F1F5F9',
            color: '#64748B',
            fontSize: 11,
            fontWeight: 750,
          }}
        >
          Updated {new Date(updatedAt).toLocaleString()}
        </div>
      ) : null}
    </div>
  )
}
