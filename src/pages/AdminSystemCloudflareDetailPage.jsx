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

const formatBytes = (bytes) => {
  const value = num(bytes)

  if (value >= 1024 ** 3) {
    return `${(value / 1024 ** 3).toFixed(2)} GB`
  }

  if (value >= 1024 ** 2) {
    return `${(value / 1024 ** 2).toFixed(2)} MB`
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(2)} KB`
  }

  return `${Math.round(value)} B`
}

const formatMoney = (value) =>
  `$${num(value).toFixed(num(value) >= 1 ? 2 : 4)}`

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
  .cfr-page {
    display: grid;
    gap: 18px;
  }

  .cfr-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .cfr-title {
    display: grid;
    gap: 4px;
  }

  .cfr-title strong {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .cfr-title span {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 800;
  }

  .cfr-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .cfr-btn {
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

  .cfr-btn.primary {
    border-color: #FED7AA;
    background: #FFF7ED;
    color: #C2410C;
  }

  .cfr-btn:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .cfr-status {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    font-size: 9px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .cfr-status.ok {
    background: #ECFDF5;
    color: #047857;
  }

  .cfr-status.partial {
    background: #FFFBEB;
    color: #B45309;
  }

  .cfr-status.error {
    background: #FEF2F2;
    color: #B91C1C;
  }

  .cfr-status.not_configured {
    background: #F8FAFC;
    color: #64748B;
  }

  .cfr-error,
  .cfr-warning {
    padding: 13px 14px;
    border-radius: 14px;
    font-size: 10px;
    font-weight: 800;
  }

  .cfr-error {
    border: 1px solid #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .cfr-warning {
    border: 1px solid #FED7AA;
    background: #FFF7ED;
    color: #9A3412;
  }

  .cfr-cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .cfr-card,
  .cfr-block {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    background: #FFFFFF;
  }

  .cfr-card {
    padding: 16px;
  }

  .cfr-label {
    color: #64748B;
    font-size: 9px;
    font-weight: 900;
  }

  .cfr-value {
    margin-top: 8px;
    color: #0F172A;
    font-size: 25px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .cfr-note {
    margin-top: 7px;
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
    line-height: 1.45;
  }

  .cfr-head {
    padding: 14px 16px;
    border-bottom: 1px solid #EEF2F7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .cfr-head strong {
    color: #0F172A;
    font-size: 11px;
    font-weight: 950;
  }

  .cfr-head span {
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .cfr-rows {
    padding: 12px;
    display: grid;
    gap: 8px;
  }

  .cfr-row {
    min-height: 42px;
    padding: 10px 12px;
    border: 1px solid #EEF2F7;
    border-radius: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
  }

  .cfr-row-main {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .cfr-row-main strong {
    color: #334155;
    font-size: 10px;
    font-weight: 900;
    word-break: break-word;
  }

  .cfr-row-main span {
    color: #94A3B8;
    font-size: 8px;
    font-weight: 800;
  }

  .cfr-row-value {
    color: #0F172A;
    font-size: 10px;
    font-weight: 950;
    text-align: right;
  }

  .cfr-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .cfr-empty {
    padding: 24px 14px;
    text-align: center;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 800;
  }

  @media (max-width: 980px) {
    .cfr-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .cfr-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .cfr-cards {
      grid-template-columns: 1fr;
    }

    .cfr-row {
      grid-template-columns: 1fr;
    }

    .cfr-row-value {
      text-align: left;
    }
  }
`

export default function AdminSystemCloudflareDetailPage() {
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
            'Failed to load Cloudflare R2 usage.'
        )
      }

      setProviders(payload.providers || null)
      setLastLoadedAt(Date.now())
      setError('')
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Failed to load Cloudflare R2 usage.'
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

  const r2 =
    providers?.cloudflare_r2 || null

  const reconciliation =
    providers?.reconciliation?.cloudflare_r2 ||
    null

  const storage =
    r2?.storage || null

  const operations =
    r2?.operations || null

  const pricing =
    r2?.pricing || null

  const actionRows = useMemo(
    () =>
      Array.isArray(operations?.by_action)
        ? operations.by_action
        : [],
    [operations]
  )

  const bucketRows = useMemo(
    () =>
      Array.isArray(operations?.by_bucket)
        ? operations.by_bucket
        : [],
    [operations]
  )

  const providerErrors =
    Array.isArray(r2?.errors)
      ? r2.errors
      : []

  const status =
    String(r2?.status || 'not_configured')
      .trim()
      .toLowerCase()

  const checkedAt =
    r2?.checked_at
      ? new Date(r2.checked_at).toLocaleString()
      : 'Not checked yet'

  const standardBytes =
    num(storage?.standard?.total_bytes)

  const infrequentBytes =
    num(storage?.infrequent_access?.total_bytes)

  const totalStorageBytes =
    num(storage?.total?.total_bytes)

  const totalObjects =
    num(storage?.total?.objects)

  return (
    <AdminLayout
      title="Cloudflare R2"
      subtitle="Provider usage, Shadow-to-R2 traffic, storage, operations, and billing drivers."
    >
      <style>{css}</style>

      <div className="cfr-page">
        <div className="cfr-top">
          <div className="cfr-title">
            <strong>Cloudflare R2 Provider Activity</strong>
            <span>
              Provider sync is separate from Render billing attribution.
            </span>
          </div>

          <div className="cfr-actions">
            <span className={`cfr-status ${status}`}>
              {status.replaceAll('_', ' ')}
            </span>

            <button
              type="button"
              className="cfr-btn"
              disabled={loading || forcing}
              onClick={load}
            >
              {loading ? 'Loading…' : 'Reload'}
            </button>

            <button
              type="button"
              className="cfr-btn primary"
              disabled={loading || forcing}
              onClick={forceRefresh}
            >
              {forcing
                ? 'Refreshing provider…'
                : 'Refresh Provider Data'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="cfr-error">{error}</div>
        ) : null}

        {status === 'not_configured' ? (
          <div className="cfr-warning">
            Cloudflare provider metrics are not configured. Add CLOUDFLARE_API_TOKEN and R2_ACCOUNT_ID or CLOUDFLARE_ACCOUNT_ID on the backend. Existing R2 upload/download features are not affected.
          </div>
        ) : null}

        {providerErrors.length > 0 ? (
          <div className="cfr-warning">
            {providerErrors
              .map(
                (item) =>
                  `${item.source || 'provider'}: ${item.message || 'Unavailable'}`
              )
              .join(' · ')}
          </div>
        ) : null}

        <div className="cfr-cards">
          <div className="cfr-card">
            <div className="cfr-label">
              Provider Storage
            </div>
            <div className="cfr-value">
              {storage
                ? formatBytes(totalStorageBytes)
                : '—'}
            </div>
            <div className="cfr-note">
              Account-level R2 storage measured by Cloudflare.
            </div>
          </div>

          <div className="cfr-card">
            <div className="cfr-label">
              Objects
            </div>
            <div className="cfr-value">
              {storage
                ? fmt(totalObjects)
                : '—'}
            </div>
            <div className="cfr-note">
              Published + uploaded objects across storage classes.
            </div>
          </div>

          <div className="cfr-card">
            <div className="cfr-label">
              Provider Operations
            </div>
            <div className="cfr-value">
              {operations
                ? fmt(operations.requests)
                : '—'}
            </div>
            <div className="cfr-note">
              Current provider measurement window.
            </div>
          </div>

          <div className="cfr-card">
            <div className="cfr-label">
              Shadow → R2
            </div>
            <div className="cfr-value">
              {reconciliation
                ? formatBytes(
                    reconciliation.app_attributed_bytes
                  )
                : '—'}
            </div>
            <div className="cfr-note">
              Measured Render service-initiated traffic attributed to R2.
            </div>
          </div>
        </div>

        <div className="cfr-grid">
          <section className="cfr-block">
            <div className="cfr-head">
              <strong>Storage</strong>
              <span>{checkedAt}</span>
            </div>

            <div className="cfr-rows">
              <div className="cfr-row">
                <div className="cfr-row-main">
                  <strong>Standard Storage</strong>
                  <span>
                    Storage is billable by GB-month.
                  </span>
                </div>
                <div className="cfr-row-value">
                  {storage
                    ? formatBytes(standardBytes)
                    : '—'}
                </div>
              </div>

              <div className="cfr-row">
                <div className="cfr-row-main">
                  <strong>
                    Infrequent Access Storage
                  </strong>
                  <span>
                    Storage and retrieval can be billable.
                  </span>
                </div>
                <div className="cfr-row-value">
                  {storage
                    ? formatBytes(infrequentBytes)
                    : '—'}
                </div>
              </div>

              <div className="cfr-row">
                <div className="cfr-row-main">
                  <strong>R2 Internet Egress</strong>
                  <span>
                    Cloudflare R2 egress pricing reference.
                  </span>
                </div>
                <div className="cfr-row-value">
                  {pricing?.egress_to_internet
                    ?.billable === false
                    ? 'Free'
                    : '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="cfr-block">
            <div className="cfr-head">
              <strong>Operation Classes</strong>
              <span>
                Provider usage, not invoice total
              </span>
            </div>

            <div className="cfr-rows">
              <div className="cfr-row">
                <div className="cfr-row-main">
                  <strong>Class A</strong>
                  <span>
                    Writes, lists, multipart and similar operations.
                  </span>
                </div>
                <div className="cfr-row-value">
                  {operations
                    ? fmt(
                        operations.class_a_requests
                      )
                    : '—'}
                </div>
              </div>

              <div className="cfr-row">
                <div className="cfr-row-main">
                  <strong>Class B</strong>
                  <span>
                    Reads, HEAD and similar operations.
                  </span>
                </div>
                <div className="cfr-row-value">
                  {operations
                    ? fmt(
                        operations.class_b_requests
                      )
                    : '—'}
                </div>
              </div>

              <div className="cfr-row">
                <div className="cfr-row-main">
                  <strong>Free Operations</strong>
                  <span>
                    Operations classified as free by the backend reference.
                  </span>
                </div>
                <div className="cfr-row-value">
                  {operations
                    ? fmt(
                        operations.free_requests
                      )
                    : '—'}
                </div>
              </div>

              <div className="cfr-row">
                <div className="cfr-row-main">
                  <strong>Unclassified</strong>
                  <span>
                    Kept separate instead of guessing a billing class.
                  </span>
                </div>
                <div className="cfr-row-value">
                  {operations
                    ? fmt(
                        operations.unclassified_requests
                      )
                    : '—'}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="cfr-block">
          <div className="cfr-head">
            <strong>Operations by Action</strong>
            <span>
              {operations?.window_start
                ? `${new Date(
                    operations.window_start
                  ).toLocaleDateString()} → ${new Date(
                    operations.window_end
                  ).toLocaleDateString()}`
                : 'Waiting for provider data'}
            </span>
          </div>

          <div className="cfr-rows">
            {actionRows.length > 0 ? (
              actionRows.map((item) => (
                <div
                  className="cfr-row"
                  key={`${item.action}-${item.operation_class}`}
                >
                  <div className="cfr-row-main">
                    <strong>{item.action}</strong>
                    <span>
                      {String(
                        item.operation_class ||
                          'unclassified'
                      ).replaceAll('_', ' ')}
                      {' · '}
                      {fmt(item.success_requests)} success
                      {' · '}
                      {fmt(item.user_error_requests)} user errors
                      {' · '}
                      {fmt(
                        item.internal_error_requests
                      )} internal errors
                    </span>
                  </div>

                  <div className="cfr-row-value">
                    {fmt(item.requests)} requests
                  </div>
                </div>
              ))
            ) : (
              <div className="cfr-empty">
                No Cloudflare R2 operation data yet.
              </div>
            )}
          </div>
        </section>

        <section className="cfr-block">
          <div className="cfr-head">
            <strong>Operations by Bucket</strong>
            <span>
              {r2?.bucket_name
                ? `Configured bucket: ${r2.bucket_name}`
                : 'Account scope'}
            </span>
          </div>

          <div className="cfr-rows">
            {bucketRows.length > 0 ? (
              bucketRows.map((item) => (
                <div
                  className="cfr-row"
                  key={item.bucket}
                >
                  <div className="cfr-row-main">
                    <strong>{item.bucket}</strong>
                    <span>
                      Cloudflare provider operations
                    </span>
                  </div>

                  <div className="cfr-row-value">
                    {fmt(item.requests)} requests
                  </div>
                </div>
              ))
            ) : (
              <div className="cfr-empty">
                No bucket operation data yet.
              </div>
            )}
          </div>
        </section>

        <section className="cfr-block">
          <div className="cfr-head">
            <strong>Billing Reference</strong>
            <span>
              Reference rates only · not invoice
            </span>
          </div>

          <div className="cfr-rows">
            <div className="cfr-row">
              <div className="cfr-row-main">
                <strong>Standard Storage</strong>
                <span>
                  Per GB-month reference rate
                </span>
              </div>
              <div className="cfr-row-value">
                {pricing?.standard
                  ? formatMoney(
                      pricing.standard
                        .storage_usd_per_gb_month
                    )
                  : '—'}
              </div>
            </div>

            <div className="cfr-row">
              <div className="cfr-row-main">
                <strong>Standard Class A</strong>
                <span>
                  Per million operations
                </span>
              </div>
              <div className="cfr-row-value">
                {pricing?.standard
                  ? formatMoney(
                      pricing.standard
                        .class_a_usd_per_million
                    )
                  : '—'}
              </div>
            </div>

            <div className="cfr-row">
              <div className="cfr-row-main">
                <strong>Standard Class B</strong>
                <span>
                  Per million operations
                </span>
              </div>
              <div className="cfr-row-value">
                {pricing?.standard
                  ? formatMoney(
                      pricing.standard
                        .class_b_usd_per_million
                    )
                  : '—'}
              </div>
            </div>

            <div className="cfr-row">
              <div className="cfr-row-main">
                <strong>
                  Exact Cloudflare Invoice Cost
                </strong>
                <span>
                  This page does not fabricate provider billing totals.
                </span>
              </div>
              <div className="cfr-row-value">
                Not available
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
