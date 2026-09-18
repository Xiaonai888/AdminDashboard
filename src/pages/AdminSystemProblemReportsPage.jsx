import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const RANGE_MS = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}

const RANGE_LABELS = {
  '1h': 'Last 1 Hour',
  '6h': 'Last 6 Hours',
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  custom: 'Custom Range',
}

const STATUS_OPTIONS = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'INVESTIGATING', label: 'Investigating' },
  { key: 'FIX_APPLIED', label: 'Fix Applied' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'ARCHIVED', label: 'Archived' },
]

function getToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function auth() {
  return {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }
}

function toLocalInputValue(value) {
  const date = new Date(value)
  const local = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60000
  )

  return local.toISOString().slice(0, 16)
}

function getRange(
  key,
  customFrom,
  customTo
) {
  if (key === 'custom') {
    return {
      from: new Date(customFrom).getTime(),
      to: new Date(customTo).getTime(),
    }
  }

  const to = Date.now()

  return {
    from:
      to -
      (RANGE_MS[key] || RANGE_MS['24h']),
    to,
  }
}

function labelize(value) {
  return String(value || '—')
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    )
}

function severityTone(value) {
  const severity = String(
    value || ''
  ).toLowerCase()

  if (
    ['critical', 'high'].includes(
      severity
    )
  ) {
    return 'high'
  }

  if (severity === 'medium') {
    return 'medium'
  }

  return 'low'
}

function statusTone(value) {
  const status = String(
    value || ''
  ).toUpperCase()

  if (status === 'OPEN') return 'open'
  if (status === 'INVESTIGATING') {
    return 'investigating'
  }
  if (status === 'FIX_APPLIED') {
    return 'fix-applied'
  }
  if (status === 'VERIFIED') {
    return 'verified'
  }
  if (status === 'RESOLVED') {
    return 'resolved'
  }
  if (status === 'ARCHIVED') {
    return 'archived'
  }

  return 'neutral'
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isFinite(
    date.getTime()
  )
    ? date.toLocaleString()
    : '—'
}

function csvCell(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll(
    '"',
    '""'
  )}"`
}

const css = `
  .pr-page {
    display: grid;
    gap: 18px;
  }

  .pr-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pr-tools {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pr-search,
  .pr-select,
  .pr-input,
  .pr-btn,
  .pr-download-trigger {
    min-height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #334155;
    font: inherit;
    font-size: 10px;
    font-weight: 800;
  }

  .pr-search {
    width: min(360px, 78vw);
    padding: 0 11px;
    outline: none;
  }

  .pr-select,
  .pr-input {
    padding: 0 10px;
    outline: none;
  }

  .pr-search:focus,
  .pr-select:focus,
  .pr-input:focus {
    border-color: #A78BFA;
    box-shadow: 0 0 0 3px #F3E8FF;
  }

  .pr-input {
    min-width: 180px;
  }

  .pr-btn {
    padding: 0 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .pr-btn:hover {
    background: #F8FAFC;
  }

  .pr-btn.primary {
    border-color: #DDD6FE;
    background: #F5F3FF;
    color: #6D28D9;
  }

  .pr-btn:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .pr-meta {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 850;
  }

  .pr-range-arrow {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 900;
  }

  .pr-download {
    position: relative;
  }

  .pr-download-trigger {
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    list-style: none;
    color: #6D28D9;
    border-color: #DDD6FE;
    font-weight: 900;
    user-select: none;
  }

  .pr-download-trigger::-webkit-details-marker {
    display: none;
  }

  .pr-download[open] .pr-download-trigger {
    background: #F5F3FF;
    border-color: #C4B5FD;
  }

  .pr-download-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 7px);
    z-index: 90;
    width: 245px;
    padding: 7px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #FFFFFF;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  }

  .pr-download-option {
    width: 100%;
    min-height: 42px;
    padding: 8px 10px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #334155;
    font: inherit;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pr-download-option:hover {
    background: #F8FAFC;
  }

  .pr-download-option:disabled {
    cursor: wait;
    opacity: 0.55;
  }

  .pr-download-option strong {
    font-size: 9px;
    font-weight: 950;
  }

  .pr-download-option span {
    color: #94A3B8;
    font-size: 8px;
    font-weight: 850;
  }

  .pr-error {
    padding: 12px 14px;
    border: 1px solid #FECACA;
    border-radius: 12px;
    background: #FEF2F2;
    color: #B91C1C;
    font-size: 10px;
    font-weight: 850;
  }

  .pr-cards {
    display: grid;
    grid-template-columns:
      repeat(7, minmax(0, 1fr));
    gap: 10px;
  }

  .pr-card {
    min-width: 0;
    border: 1px solid #E2E8F0;
    border-radius: 15px;
    background: #FFFFFF;
    padding: 13px;
    cursor: pointer;
    text-align: left;
  }

  .pr-card:hover {
    border-color: #C4B5FD;
    background: #FCFAFF;
  }

  .pr-card.active {
    border-color: #A78BFA;
    background: #F5F3FF;
    box-shadow: 0 0 0 2px #F3E8FF;
  }

  .pr-card-label {
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pr-card-value {
    margin-top: 7px;
    color: #0F172A;
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
  }

  .pr-block {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
  }

  .pr-head {
    padding: 15px 16px;
    border-bottom: 1px solid #EEF2F7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pr-head-title {
    color: #0F172A;
    font-size: 12px;
    font-weight: 950;
  }

  .pr-head-sub {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .pr-list {
    padding: 12px;
    display: grid;
    gap: 8px;
  }

  .pr-header,
  .pr-item {
    display: grid;
    grid-template-columns:
      92px
      minmax(130px, 0.8fr)
      minmax(220px, 1.5fr)
      minmax(110px, 0.7fr)
      116px
      150px;
    gap: 10px;
    align-items: center;
  }

  .pr-header {
    padding: 9px 11px;
    border-radius: 9px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .pr-item {
    min-height: 54px;
    padding: 10px 11px;
    border: 1px solid #EEF2F7;
    border-radius: 11px;
    color: #334155;
    font-size: 9px;
    font-weight: 800;
    cursor: pointer;
  }

  .pr-item:hover {
    border-color: #DDD6FE;
    background: #FCFAFF;
  }

  .pr-feature {
    font-weight: 950;
    color: #1E293B;
  }

  .pr-route {
    word-break: break-word;
  }

  .pr-pill {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 950;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .pr-pill.high {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .pr-pill.medium {
    background: #FFF7ED;
    color: #C2410C;
  }

  .pr-pill.low {
    background: #EFF6FF;
    color: #2563EB;
  }

  .pr-pill.open {
    background: #FFF7ED;
    color: #C2410C;
  }

  .pr-pill.investigating {
    background: #FFF7ED;
    color: #9A3412;
  }

  .pr-pill.fix-applied {
    background: #F5F3FF;
    color: #6D28D9;
  }

  .pr-pill.verified {
    background: #EFF6FF;
    color: #1D4ED8;
  }

  .pr-pill.resolved {
    background: #ECFDF5;
    color: #047857;
  }

  .pr-pill.archived {
    background: #F1F5F9;
    color: #475569;
  }

  .pr-empty {
    padding: 32px 16px;
    text-align: center;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 850;
  }

  @media (max-width: 1250px) {
    .pr-cards {
      grid-template-columns:
        repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 1000px) {
    .pr-top {
      align-items: flex-start;
    }

    .pr-tools {
      width: 100%;
    }
  }

  @media (max-width: 900px) {
    .pr-cards {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .pr-list {
      overflow-x: auto;
    }

    .pr-header,
    .pr-item {
      min-width: 860px;
    }
  }

  @media (max-width: 620px) {
    .pr-search {
      width: 100%;
    }

    .pr-tools {
      width: 100%;
    }

    .pr-select,
    .pr-input {
      flex: 1 1 170px;
      min-width: 0;
    }

    .pr-download {
      width: 100%;
    }

    .pr-download-trigger {
      width: 100%;
      justify-content: center;
    }

    .pr-download-menu {
      left: 0;
      right: auto;
      width: min(245px, 90vw);
    }
  }
`

export default function AdminSystemProblemReportsPage() {
  const navigate = useNavigate()

  const initialFrom =
    toLocalInputValue(
      Date.now() - RANGE_MS['24h']
    )

  const initialTo =
    toLocalInputValue(Date.now())

  const [items, setItems] =
    useState([])

  const [query, setQuery] =
    useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('ALL')

  const [rangeKey, setRangeKey] =
    useState('24h')

  const [
    customFrom,
    setCustomFrom,
  ] = useState(initialFrom)

  const [
    customTo,
    setCustomTo,
  ] = useState(initialTo)

  const [
    appliedCustom,
    setAppliedCustom,
  ] = useState({
    from: initialFrom,
    to: initialTo,
  })

  const [loading, setLoading] =
    useState(false)

  const [
    downloading,
    setDownloading,
  ] = useState('')

  const [error, setError] =
    useState('')

  const [
    updatedAt,
    setUpdatedAt,
  ] = useState(null)

  const lastLoadedAtRef =
    useRef(0)

  const currentRange = useCallback(() => {
    return getRange(
      rangeKey,
      appliedCustom.from,
      appliedCustom.to
    )
  }, [
    rangeKey,
    appliedCustom,
  ])

  const validateRange = useCallback(
    (range) => {
      if (
        !Number.isFinite(range.from) ||
        !Number.isFinite(range.to)
      ) {
        return 'Please select a valid date and time range.'
      }

      if (range.to <= range.from) {
        return 'End time must be after start time.'
      }

      if (
        range.to - range.from >
        31 * 24 * 60 * 60 * 1000
      ) {
        return 'Custom range cannot exceed 31 days.'
      }

      if (range.to > Date.now()) {
        return 'End time cannot be in the future.'
      }

      return ''
    },
    []
  )

  const load = useCallback(
    async () => {
      const token = getToken()

      if (!token) {
        setError(
          'Admin token is missing.'
        )
        return
      }

      const range = currentRange()
      const rangeError =
        validateRange(range)

      if (rangeError) {
        setError(rangeError)
        return
      }

      try {
        setLoading(true)

        const params =
          new URLSearchParams({
            limit: '200',
            from: new Date(
              range.from
            ).toISOString(),
            to: new Date(
              range.to
            ).toISOString(),
          })

        const response = await fetch(
          `${API_URL}/api/admin/system-control/incidents?${params}`,
          auth()
        )

        const payload =
          await response
            .json()
            .catch(() => ({}))

        if (
          !response.ok ||
          payload?.ok !== true
        ) {
          throw new Error(
            payload?.message ||
              'Failed to load incident reports.'
          )
        }

        setItems(
          Array.isArray(
            payload.incidents
          )
            ? payload.incidents
            : []
        )

        const now = Date.now()

        setUpdatedAt(
          new Date(now)
        )

        lastLoadedAtRef.current =
          now

        setError('')
      } catch (loadError) {
        setError(
          loadError?.message ||
            'Failed to load incident reports.'
        )
      } finally {
        setLoading(false)
      }
    },
    [
      currentRange,
      validateRange,
    ]
  )

  useEffect(() => {
    load()

    const onVisibility = () => {
      if (
        document.visibilityState ===
          'visible' &&
        Date.now() -
          lastLoadedAtRef.current >=
          60 * 1000
      ) {
        load()
      }
    }

    document.addEventListener(
      'visibilitychange',
      onVisibility
    )

    return () => {
      document.removeEventListener(
        'visibilitychange',
        onVisibility
      )
    }
  }, [load])

  const countByStatus =
    useCallback(
      (status) => {
        if (status === 'ALL') {
          return items.length
        }

        return items.filter(
          (item) =>
            String(
              item.status || ''
            ).toUpperCase() ===
            status
        ).length
      },
      [items]
    )

  const visible = useMemo(() => {
    const search =
      query.trim().toLowerCase()

    return items.filter((item) => {
      const status = String(
        item.status || 'OPEN'
      ).toUpperCase()

      if (
        statusFilter !== 'ALL' &&
        status !== statusFilter
      ) {
        return false
      }

      if (!search) return true

      return [
        item.id,
        item.feature,
        item.source_route,
        item.dependency,
        item.status,
        item.severity,
        item.fix_summary,
        item.fix_commit,
        item.fix_version,
        item?.evidence
          ?.classification,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(search)
      )
    })
  }, [
    items,
    query,
    statusFilter,
  ])

  const selectedLabel =
    STATUS_OPTIONS.find(
      (option) =>
        option.key ===
        statusFilter
    )?.label || 'All'

  const rangeLabel =
    RANGE_LABELS[rangeKey] ||
    RANGE_LABELS['24h']

  const handleRangeChange =
    useCallback((event) => {
      const next =
        event.target.value

      if (next === 'custom') {
        const now = Date.now()

        const nextFrom =
          toLocalInputValue(
            now -
              RANGE_MS['24h']
          )

        const nextTo =
          toLocalInputValue(now)

        setCustomFrom(nextFrom)
        setCustomTo(nextTo)

        setAppliedCustom({
          from: nextFrom,
          to: nextTo,
        })
      }

      setRangeKey(next)
    }, [])

  const applyCustomRange =
    useCallback(() => {
      const range = getRange(
        'custom',
        customFrom,
        customTo
      )

      const rangeError =
        validateRange(range)

      if (rangeError) {
        setError(rangeError)
        return
      }

      setError('')

      setAppliedCustom({
        from: customFrom,
        to: customTo,
      })
    }, [
      customFrom,
      customTo,
      validateRange,
    ])

  const downloadServerReport =
    useCallback(
      async (type) => {
        const token = getToken()

        if (!token) {
          setError(
            'Admin token is missing.'
          )
          return
        }

        const range =
          currentRange()

        const rangeError =
          validateRange(range)

        if (rangeError) {
          setError(rangeError)
          return
        }

        try {
          setDownloading(type)
          setError('')

          const params =
            new URLSearchParams({
              type,
              from: new Date(
                range.from
              ).toISOString(),
              to: new Date(
                range.to
              ).toISOString(),
            })

          const response =
            await fetch(
              `${API_URL}/api/admin/system-control/reports/download?${params}`,
              auth()
            )

          if (!response.ok) {
            const payload =
              await response
                .json()
                .catch(() => ({}))

            throw new Error(
              payload?.message ||
                'Problem report download failed.'
            )
          }

          const blob =
            await response.blob()

          const disposition =
            response.headers.get(
              'Content-Disposition'
            ) || ''

          const match =
            disposition.match(
              /filename="([^"]+)"/i
            )

          const filename =
            match?.[1] ||
            `problem-report-${type}`

          const url =
            URL.createObjectURL(blob)

          const link =
            document.createElement('a')

          link.href = url
          link.download = filename

          document.body.appendChild(
            link
          )

          link.click()
          link.remove()

          window.setTimeout(
            () =>
              URL.revokeObjectURL(
                url
              ),
            1000
          )
        } catch (downloadError) {
          setError(
            downloadError?.message ||
              'Problem report download failed.'
          )
        } finally {
          setDownloading('')
        }
      },
      [
        currentRange,
        validateRange,
      ]
    )

  const downloadFilteredCsv =
    useCallback(() => {
      const header = [
        'id',
        'severity',
        'status',
        'feature',
        'route',
        'provider',
        'first_seen',
        'last_seen',
        'fix_summary',
        'fix_commit',
        'fix_version',
      ]

      const rows = visible.map(
        (item) => [
          item.id,
          item.severity,
          item.status,
          item.feature,
          item.source_route,
          item.dependency,
          item.first_seen_at,
          item.last_seen_at,
          item.fix_summary,
          item.fix_commit,
          item.fix_version,
        ]
      )

      const csv = [
        header
          .map(csvCell)
          .join(','),
        ...rows.map((row) =>
          row
            .map(csvCell)
            .join(',')
        ),
      ].join('\n')

      const blob =
        new Blob(
          [csv],
          {
            type: 'text/csv;charset=utf-8',
          }
        )

      const url =
        URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      const stamp =
        new Date()
          .toISOString()
          .replaceAll(':', '-')

      link.href = url
      link.download =
        `shadow-problem-filtered-${stamp}.csv`

      document.body.appendChild(
        link
      )

      link.click()
      link.remove()

      window.setTimeout(
        () =>
          URL.revokeObjectURL(url),
        1000
      )
    }, [visible])

  return (
    <AdminLayout
      title="Problem Reports"
      subtitle="System Control incidents, investigation workflow, and retained archive."
    >
      <style>{css}</style>

      <div className="pr-page">
        <div className="pr-top">
          <div className="pr-tools">
            <input
              className="pr-search"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search ID, feature, route, provider, fix…"
              aria-label="Search problem reports"
            />

            <select
              className="pr-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              aria-label="Problem report status"
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.key}
                    value={option.key}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="pr-tools">
            <select
              className="pr-select"
              value={rangeKey}
              onChange={
                handleRangeChange
              }
              aria-label="Problem report time range"
            >
              <option value="1h">
                Last 1 Hour
              </option>
              <option value="6h">
                Last 6 Hours
              </option>
              <option value="24h">
                Last 24 Hours
              </option>
              <option value="7d">
                Last 7 Days
              </option>
              <option value="30d">
                Last 30 Days
              </option>
              <option value="custom">
                Custom Date & Time
              </option>
            </select>

            {rangeKey === 'custom' ? (
              <>
                <input
                  type="datetime-local"
                  className="pr-input"
                  value={customFrom}
                  max={customTo}
                  onChange={(event) =>
                    setCustomFrom(
                      event.target.value
                    )
                  }
                  aria-label="Problem report start time"
                />

                <span className="pr-range-arrow">
                  →
                </span>

                <input
                  type="datetime-local"
                  className="pr-input"
                  value={customTo}
                  min={customFrom}
                  max={toLocalInputValue(
                    Date.now()
                  )}
                  onChange={(event) =>
                    setCustomTo(
                      event.target.value
                    )
                  }
                  aria-label="Problem report end time"
                />

                <button
                  type="button"
                  className="pr-btn primary"
                  onClick={
                    applyCustomRange
                  }
                  disabled={loading}
                >
                  Apply
                </button>
              </>
            ) : null}

            <span className="pr-meta">
              {rangeLabel} ·{' '}
              {items.length} reports ·
              Updated{' '}
              {updatedAt
                ? updatedAt.toLocaleTimeString(
                    [],
                    {
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )
                : '—'}
            </span>

            <details className="pr-download">
              <summary className="pr-download-trigger">
                {downloading
                  ? 'Preparing…'
                  : 'Download Problem Report ▾'}
              </summary>

              <div className="pr-download-menu">
                <button
                  type="button"
                  className="pr-download-option"
                  disabled={Boolean(
                    downloading
                  )}
                  onClick={(event) => {
                    event.currentTarget
                      .closest('details')
                      ?.removeAttribute(
                        'open'
                      )

                    downloadServerReport(
                      'problems-pdf'
                    )
                  }}
                >
                  <strong>
                    Problem Report
                  </strong>
                  <span>
                    PDF · selected range
                  </span>
                </button>

                <button
                  type="button"
                  className="pr-download-option"
                  disabled={Boolean(
                    downloading
                  )}
                  onClick={(event) => {
                    event.currentTarget
                      .closest('details')
                      ?.removeAttribute(
                        'open'
                      )

                    downloadServerReport(
                      'problems-md'
                    )
                  }}
                >
                  <strong>
                    Problem Report
                  </strong>
                  <span>
                    MD · selected range
                  </span>
                </button>

                <button
                  type="button"
                  className="pr-download-option"
                  disabled={Boolean(
                    downloading
                  )}
                  onClick={(event) => {
                    event.currentTarget
                      .closest('details')
                      ?.removeAttribute(
                        'open'
                      )

                    downloadFilteredCsv()
                  }}
                >
                  <strong>
                    Current Filter
                  </strong>
                  <span>
                    CSV · visible results
                  </span>
                </button>
              </div>
            </details>

            <button
              type="button"
              className="pr-btn"
              onClick={load}
              disabled={loading}
            >
              {loading
                ? 'Refreshing…'
                : 'Refresh'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="pr-error">
            {error}
          </div>
        ) : null}

        <div className="pr-cards">
          {STATUS_OPTIONS.map(
            (option) => (
              <button
                type="button"
                className={`pr-card ${
                  statusFilter ===
                  option.key
                    ? 'active'
                    : ''
                }`}
                key={option.key}
                onClick={() =>
                  setStatusFilter(
                    option.key
                  )
                }
              >
                <div className="pr-card-label">
                  {option.label}
                </div>

                <div className="pr-card-value">
                  {countByStatus(
                    option.key
                  )}
                </div>
              </button>
            )
          )}
        </div>

        <section className="pr-block">
          <div className="pr-head">
            <div>
              <div className="pr-head-title">
                Incident Archive
              </div>

              <div className="pr-head-sub">
                {selectedLabel} ·{' '}
                {rangeLabel} ·{' '}
                {visible.length}{' '}
                matching report
                {visible.length === 1
                  ? ''
                  : 's'}
              </div>
            </div>

            <span className="pr-meta">
              Click a report to open full evidence and workflow.
            </span>
          </div>

          <div className="pr-list">
            <div className="pr-header">
              <span>Severity</span>
              <span>Feature</span>
              <span>Route</span>
              <span>Provider</span>
              <span>Status</span>
              <span>Last Seen</span>
            </div>

            {visible.map((item) => (
              <div
                className="pr-item"
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  navigate(
                    `/alerts/system-control/problems/${item.id}`
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      'Enter' ||
                    event.key === ' '
                  ) {
                    navigate(
                      `/alerts/system-control/problems/${item.id}`
                    )
                  }
                }}
              >
                <span
                  className={`pr-pill ${severityTone(
                    item.severity
                  )}`}
                >
                  {item.severity ||
                    'info'}
                </span>

                <span className="pr-feature">
                  {item.feature ||
                    'unknown'}
                </span>

                <span className="pr-route">
                  {item.source_route ||
                    'UNKNOWN'}
                </span>

                <span>
                  {item.dependency ||
                    'UNKNOWN'}
                </span>

                <span
                  className={`pr-pill ${statusTone(
                    item.status
                  )}`}
                >
                  {labelize(
                    item.status ||
                      'OPEN'
                  )}
                </span>

                <span>
                  {formatDate(
                    item.last_seen_at
                  )}
                </span>
              </div>
            ))}

            {!visible.length ? (
              <div className="pr-empty">
                No matching incident reports in this time range.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
