import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const token = () =>
  sessionStorage.getItem('shadow_admin_token') ||
  localStorage.getItem('shadow_admin_token') ||
  ''

const num = (value) => {
  const result = Number(value)
  return Number.isFinite(result) ? Math.max(0, result) : 0
}

const fmt = (value) => num(value).toLocaleString()

const data = (mb) => {
  const value = num(mb)

  return value >= 1024
    ? `${(value / 1024).toFixed(2)} GB`
    : `${value.toFixed(2)} MB`
}

const auth = (method = 'GET') => ({
  method,
  credentials: 'include',
  headers: {
    Authorization: `Bearer ${token()}`,
    ...(method === 'POST'
      ? { 'Content-Type': 'application/json' }
      : {}),
  },
})

const css = `
  .scx {
    display: grid;
    gap: 18px;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .top-left {
    display: grid;
    gap: 5px;
  }

  .top-left strong {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .top-left span {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 800;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .btn {
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
    color: #334155;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .btn.primary {
    border-color: #BFDBFE;
    background: #EFF6FF;
    color: #1D4ED8;
  }

  .btn:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .status {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: #F8FAFC;
    color: #64748B;
    font-size: 9px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .status.ok {
    background: #ECFDF5;
    color: #047857;
  }

  .status.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .status.not_configured,
  .status.unsupported_unit {
    background: #FFF7ED;
    color: #C2410C;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }

  .card,
  .block {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
  }

  .card {
    padding: 16px;
  }

  .label {
    color: #64748B;
    font-size: 9px;
    font-weight: 900;
  }

  .value {
    margin-top: 8px;
    color: #0F172A;
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .note {
    margin-top: 7px;
    color: #94A3B8;
    font-size: 8px;
    line-height: 1.45;
    font-weight: 800;
  }

  .head {
    padding: 14px 16px;
    border-bottom: 1px solid #EEF2F7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .head strong {
    color: #0F172A;
    font-size: 11px;
    font-weight: 950;
  }

  .head span {
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .rows {
    padding: 12px;
    display: grid;
    gap: 9px;
  }

  .row {
    min-height: 42px;
    padding: 10px 12px;
    border: 1px solid #EEF2F7;
    border-radius: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }

  .row-main {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .row-main strong {
    color: #334155;
    font-size: 10px;
    font-weight: 900;
    word-break: break-word;
  }

  .row-main span {
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .row-value {
    color: #0F172A;
    font-size: 10px;
    font-weight: 950;
    text-align: right;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .err,
  .warning {
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 800;
  }

  .err {
    border: 1px solid #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .warning {
    border: 1px solid #FED7AA;
    background: #FFF7ED;
    color: #9A3412;
  }

  .empty {
    padding: 22px 14px;
    color: #94A3B8;
    text-align: center;
    font-size: 9px;
    font-weight: 800;
  }

  @media (max-width: 1180px) {
    .cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .cards {
      grid-template-columns: 1fr;
    }

    .row {
      grid-template-columns: 1fr;
    }

    .row-value {
      text-align: left;
    }
  }
`

export default function AdminSystemRenderDetailPage() {
  const [usage, setUsage] = useState(null)
  const [providers, setProviders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [forcing, setForcing] = useState(false)
  const [error, setError] = useState('')
  const [lastLoadedAt, setLastLoadedAt] = useState(0)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${API_URL}/api/admin/system-control/snapshot`,
        auth()
      )

      const payload =
        await response.json().catch(() => ({}))

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ||
            'Failed to load Render usage.'
        )
      }

      setUsage(payload.usage || null)
      setProviders(payload.providers || null)
      setLastLoadedAt(Date.now())
      setError('')
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Failed to load Render usage.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const forceRefresh = useCallback(async () => {
    try {
      setForcing(true)

      const response = await fetch(
        `${API_URL}/api/admin/system-control/providers/refresh`,
        auth('POST')
      )

      const payload =
        await response.json().catch(() => ({}))

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.message ||
            'Failed to refresh provider usage.'
        )
      }

      setProviders(payload.providers || null)
      setLastLoadedAt(Date.now())
      setError('')
    } catch (refreshError) {
      setError(
        refreshError?.message ||
          'Failed to refresh provider usage.'
      )
    } finally {
      setForcing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onVisible = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastLoadedAt >= 60 * 1000
      ) {
        load()
      }
    }

    document.addEventListener(
      'visibilitychange',
      onVisible
    )

    return () => {
      document.removeEventListener(
        'visibilitychange',
        onVisible
      )
    }
  }, [lastLoadedAt, load])

  const rows = useMemo(
    () =>
      Array.isArray(usage?.minute?.rows)
        ? usage.minute.rows
        : [],
    [usage]
  )

  const httpRows = useMemo(
    () =>
      rows.filter(
        (row) => row.kind === 'http_response'
      ),
    [rows]
  )

  const externalRows = useMemo(
    () =>
      rows.filter(
        (row) => row.kind === 'external_request'
      ),
    [rows]
  )

  const routes = useMemo(() => {
    const map = new Map()

    for (const row of rows) {
      const key = row.source_route || 'UNKNOWN'
      const current = map.get(key) || {
        key,
        count: 0,
        mb: 0,
        errors: 0,
      }

      current.count += num(row.count)
      current.mb += num(row.mb)
      current.errors += num(row.errors)

      map.set(key, current)
    }

    return [...map.values()]
      .sort(
        (a, b) =>
          b.mb - a.mb ||
          b.count - a.count
      )
      .slice(0, 12)
  }, [rows])

  const destinations = useMemo(() => {
    const map = new Map()

    for (const row of externalRows) {
      const key = String(
        row.dependency || 'UNKNOWN'
      ).toUpperCase()

      const current = map.get(key) || {
        key,
        count: 0,
        mb: 0,
        errors: 0,
      }

      current.count += num(row.count)
      current.mb += num(row.mb)
      current.errors += num(row.errors)

      map.set(key, current)
    }

    return [...map.values()]
      .sort(
        (a, b) =>
          b.mb - a.mb ||
          b.count - a.count
      )
      .slice(0, 12)
  }, [externalRows])

  const render =
    providers?.render || null

  const billing =
    render?.billing_breakdown || null

  const reconciliation =
    providers?.reconciliation?.render || null

  const localHttpMb =
    httpRows.reduce(
      (sum, row) => sum + num(row.mb),
      0
    )

  const localServiceMb =
    externalRows.reduce(
      (sum, row) => sum + num(row.mb),
      0
    )

  const status = String(
    render?.status || 'not_configured'
  )
    .trim()
    .toLowerCase()

  const checkedAt =
    render?.checked_at
      ? new Date(
          render.checked_at
        ).toLocaleString()
      : 'Not checked yet'

  const providerWindow =
    render?.window_start &&
    render?.window_end
      ? `${new Date(
          render.window_start
        ).toLocaleString()} → ${new Date(
          render.window_end
        ).toLocaleString()}`
      : 'Provider window unavailable'

  return (
    <AdminLayout
      title="Render Detail"
      subtitle="Official Render outbound bandwidth plus Shadow-measured traffic attribution."
    >
      <style>{css}</style>

      <div className="scx">
        <div className="top">
          <div className="top-left">
            <strong>Render Bandwidth Attribution</strong>
            <span>
              Official provider totals and local measurements are shown separately.
            </span>
          </div>

          <div className="actions">
            <span className={`status ${status}`}>
              {status.replaceAll('_', ' ')}
            </span>

            <button
              type="button"
              className="btn"
              onClick={load}
              disabled={loading || forcing}
            >
              {loading ? 'Loading…' : 'Reload'}
            </button>

            <button
              type="button"
              className="btn primary"
              onClick={forceRefresh}
              disabled={loading || forcing}
            >
              {forcing
                ? 'Refreshing provider…'
                : 'Refresh Provider Data'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="err">{error}</div>
        ) : null}

        {status === 'not_configured' ? (
          <div className="warning">
            Render provider metrics are not configured. Add RENDER_API_KEY and RENDER_SERVICE_ID on the backend. Local Shadow traffic measurement continues to work.
          </div>
        ) : null}

        {status === 'unsupported_unit' ? (
          <div className="warning">
            Render returned bandwidth data with an unsupported unit. Local Shadow measurements remain available.
          </div>
        ) : null}

        <div className="cards">
          <div className="card">
            <div className="label">
              Official Render Outbound
            </div>
            <div className="value">
              {billing
                ? data(billing.total_mb)
                : render?.provider_bytes != null
                  ? data(
                      num(render.provider_bytes) /
                        1024 /
                        1024
                    )
                  : '—'}
            </div>
            <div className="note">
              Render provider measurement · {providerWindow}
            </div>
          </div>

          <div className="card">
            <div className="label">
              HTTP Responses
            </div>
            <div className="value">
              {billing
                ? data(
                    billing.http_response_mb
                  )
                : data(localHttpMb)}
            </div>
            <div className="note">
              {billing
                ? 'Official Render traffic-source breakdown'
                : 'Local measured current minute'}
            </div>
          </div>

          <div className="card">
            <div className="label">
              Service-Initiated
            </div>
            <div className="value">
              {billing
                ? data(
                    billing.service_initiated_mb
                  )
                : data(localServiceMb)}
            </div>
            <div className="note">
              {billing
                ? 'Render NAT / service-initiated outbound'
                : 'Local measured current minute'}
            </div>
          </div>

          <div className="card">
            <div className="label">
              WebSocket Responses
            </div>
            <div className="value">
              {billing
                ? data(
                    billing.websocket_response_mb
                  )
                : '—'}
            </div>
            <div className="note">
              Provider breakdown only
            </div>
          </div>

          <div className="card">
            <div className="label">
              Private Link
            </div>
            <div className="value">
              {billing
                ? data(
                    billing.private_link_mb
                  )
                : '—'}
            </div>
            <div className="note">
              Provider breakdown only
            </div>
          </div>
        </div>

        <div className="grid">
          <section className="block">
            <div className="head">
              <strong>
                Service-Initiated Destinations
              </strong>
              <span>
                Local measured · current minute
              </span>
            </div>

            <div className="rows">
              {destinations.length > 0 ? (
                destinations.map((item) => (
                  <div
                    className="row"
                    key={item.key}
                  >
                    <div className="row-main">
                      <strong>{item.key}</strong>
                      <span>
                        {fmt(item.count)} requests · {fmt(item.errors)} errors
                      </span>
                    </div>

                    <div className="row-value">
                      {data(item.mb)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">
                  No measured service-initiated traffic in the current minute.
                </div>
              )}
            </div>
          </section>

          <section className="block">
            <div className="head">
              <strong>
                Provider Reconciliation
              </strong>
              <span>{checkedAt}</span>
            </div>

            <div className="rows">
              <div className="row">
                <div className="row-main">
                  <strong>
                    Official Render Provider
                  </strong>
                  <span>
                    Provider-reported outbound bandwidth
                  </span>
                </div>

                <div className="row-value">
                  {reconciliation?.provider_mb != null
                    ? data(
                        reconciliation.provider_mb
                      )
                    : '—'}
                </div>
              </div>

              <div className="row">
                <div className="row-main">
                  <strong>
                    Local App Attribution
                  </strong>
                  <span>
                    Shadow-measured app traffic in the reconciliation window
                  </span>
                </div>

                <div className="row-value">
                  {providers?.reconciliation
                    ?.app_attributed?.mb != null
                    ? data(
                        providers.reconciliation
                          .app_attributed.mb
                      )
                    : '—'}
                </div>
              </div>

              <div className="row">
                <div className="row-main">
                  <strong>
                    Unattributed Estimate
                  </strong>
                  <span>
                    Provider total minus locally attributed bytes
                  </span>
                </div>

                <div className="row-value">
                  {reconciliation
                    ?.unattributed_mb_estimate != null
                    ? data(
                        reconciliation
                          .unattributed_mb_estimate
                      )
                    : '—'}
                </div>
              </div>

              <div className="row">
                <div className="row-main">
                  <strong>
                    Breakdown Unattributed
                  </strong>
                  <span>
                    Official provider total not mapped to an HTTP / WebSocket / service / private-link source
                  </span>
                </div>

                <div className="row-value">
                  {billing?.unattributed_mb != null
                    ? data(
                        billing.unattributed_mb
                      )
                    : '—'}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="block">
          <div className="head">
            <strong>Top Routes</strong>
            <span>
              Local measured · current minute
            </span>
          </div>

          <div className="rows">
            {routes.length > 0 ? (
              routes.map((item) => (
                <div
                  className="row"
                  key={item.key}
                >
                  <div className="row-main">
                    <strong>{item.key}</strong>
                    <span>
                      {fmt(item.count)} requests · {fmt(item.errors)} errors
                    </span>
                  </div>

                  <div className="row-value">
                    {data(item.mb)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">
                Waiting for measured Render traffic.
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
