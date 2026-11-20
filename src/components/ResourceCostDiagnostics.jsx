import React, { useMemo, useState } from 'react'

const PROVIDERS = [
  { key: 'supabase', label: 'Supabase Usage', keys: ['SUPABASE_MANAGEMENT_TOKEN', 'SUPABASE_PROJECT_REF or SUPABASE_URL'] },
  { key: 'cloudflare_r2', label: 'Cloudflare R2', keys: ['CLOUDFLARE_R2_METRICS_TOKEN', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'] },
  { key: 'render', label: 'Render Bandwidth', keys: ['RENDER_API_KEY', 'RENDER_SERVICE_ID'] },
]

const ERROR_GUIDES = {
  http_401_invalid_credentials: ['401 · Authentication failed', 'Check that the token is valid, belongs to the correct provider/account and was saved in the running Render Backend service. Redeploy after changes.'],
  http_403_insufficient_permissions: ['403 · Permission denied', 'Check token permissions and account/project scope. Supabase Usage needs analytics_usage_read; Cloudflare R2 metrics needs the appropriate account-level read access.'],
  http_429_rate_limited: ['429 · Rate limited', 'Avoid repeated manual syncs. Check the provider rate limit and allow the normal hourly collector to retry.'],
  provider_timeout: ['Provider timeout', 'Check provider availability and Backend logs. Do not treat this interval as zero usage.'],
  provider_permission_denied: ['Access denied', 'Verify the token permissions and the target project/account.'],
  provider_response_unavailable: ['Invalid or incomplete API response', 'Check API endpoint compatibility, provider permissions and sanitized Backend logs. Some requested fields may be unavailable.'],
  provider_request_failed: ['Provider API request failed', 'Check the latest Backend provider sync logs and the token/account configuration.'],
}

const DISPLAY_NAMES = {
  'api.requests.provider_window': 'Total API requests',
  'api.auth.provider_window': 'Auth requests',
  'api.realtime.provider_window': 'Realtime requests',
  'api.rest.provider_window': 'REST requests',
  'api.storage.provider_window': 'Storage requests',
  'storage.total.bytes': 'Total R2 storage',
  'storage.standard.bytes': 'R2 standard storage',
  'storage.infrequent.bytes': 'R2 infrequent storage',
  'storage.objects': 'R2 objects',
  'operations.requests': 'R2 operations',
}

function localTime(value) {
  const date = Date.parse(value || '')
  return Number.isFinite(date)
    ? `${new Date(date).toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'medium', timeStyle: 'short' })} ICT`
    : 'Not recorded'
}

function safeKeys(values) {
  return Array.isArray(values)
    ? values.filter((value) => typeof value === 'string' && /^[A-Z][A-Z0-9_]{2,80}$/.test(value)).slice(0, 12)
    : []
}

function safeCode(value) {
  const code = String(value || '')
  return /^[a-z0-9_]{3,80}$/.test(code) ? code : 'unknown_error'
}

function diagnosticsFor(spec, health) {
  const source = health?.sources?.[spec.key] || {}
  const provider = health?.providers?.[spec.key] || {}
  const issues = []
  const add = (severity, title, fix, detail = '') => issues.push({ severity, title, fix, detail })
  const missingKeys = safeKeys(provider.missing_environment)
  const environment = health?.environment_checks?.[spec.key]

  if (environment && spec.key === 'supabase') {
    if (environment.management_token_present === false) {
      add('error', 'Management token is missing in running Backend', 'Add SUPABASE_MANAGEMENT_TOKEN (or SYSTEM_SUPABASE_MANAGEMENT_TOKEN) to Render → Backend → Environment and redeploy.', 'Missing: SUPABASE_MANAGEMENT_TOKEN')
    }
    if (environment.project_ref_available === false) {
      add('error', 'Supabase project reference is missing', 'Set SUPABASE_PROJECT_REF or a valid SUPABASE_URL on the running Backend, then redeploy.', 'Missing: SUPABASE_PROJECT_REF or valid SUPABASE_URL')
    }
  }
  if (environment && spec.key === 'cloudflare_r2') {
    if (environment.metrics_token_present === false) {
      add('warning', 'Dedicated R2 Storage metrics token is missing', 'Add CLOUDFLARE_R2_METRICS_TOKEN to the correct Render Backend environment. Without it, the collector falls back to the Operations token.', 'Missing: CLOUDFLARE_R2_METRICS_TOKEN')
    }
    if (environment.operations_token_present === false) {
      add('error', 'R2 Operations API token is missing', 'Set CLOUDFLARE_API_TOKEN (or SYSTEM_CLOUDFLARE_API_TOKEN) in the running Backend.', 'Missing: CLOUDFLARE_API_TOKEN')
    }
    if (environment.account_id_present === false) {
      add('error', 'Cloudflare account ID is missing', 'Set CLOUDFLARE_ACCOUNT_ID, SYSTEM_CLOUDFLARE_ACCOUNT_ID or R2_ACCOUNT_ID in Render Backend.', 'Missing: CLOUDFLARE_ACCOUNT_ID or R2_ACCOUNT_ID')
    }
  }

  if (source.status === 'table_missing') {
    add('error', 'Required database table is missing', 'Run the corresponding database migration; verify the table exists and the Backend can access it.', source.table || '')
  } else if (source.status === 'query_failed') {
    add('error', 'Cannot read saved metrics from database', 'Check Supabase connection, table permissions, service-role access and Backend logs.', source.table || '')
  }

  if (provider.sync_status === 'not_configured') {
    const runtimeReady = spec.key === 'supabase'
      ? environment?.management_token_present === true && environment?.project_ref_available === true
      : spec.key === 'cloudflare_r2'
        ? environment?.operations_token_present === true && environment?.account_id_present === true
        : false
    if (runtimeReady) {
      add('warning', 'Runtime keys exist but latest sync says not configured', 'The sync state may be from before the environment change. Confirm the deployed Backend instance and check the next provider sync.', missingKeys.length ? `Last sync reported: ${missingKeys.join(', ')}` : '')
    } else {
      add('error', 'Provider not configured in running Backend', missingKeys.length
        ? 'Add the missing environment variable names shown below in Render → Backend → Environment. Save and redeploy.'
        : 'Verify the environment names in Render → Backend → Environment. Check the correct service and redeploy.',
      missingKeys.length ? `Reported missing: ${missingKeys.join(', ')}` : `Check: ${spec.keys.join(' · ')}`)
    }
  }

  const primaryCode = safeCode(provider.error_code)
  if (provider.error_code) {
    const [title, fix] = ERROR_GUIDES[primaryCode] || ['Provider sync failed', 'Check the provider sync status and sanitized Backend logs.']
    add('error', title, fix, `Code: ${primaryCode}`)
  }

  for (const entry of (Array.isArray(provider.source_issues) ? provider.source_issues.slice(0, 6) : [])) {
    const code = safeCode(entry?.code)
    const [title, fix] = ERROR_GUIDES[code] || ['Provider API returned an error', 'Check the configured token, account and Backend logs.']
    const subsystem = entry?.source === 'storage_metrics' ? 'R2 Storage API'
      : entry?.source === 'operations_analytics' ? 'R2 Operations API' : 'Provider API'
    add('error', `${subsystem}: ${title}`, fix, `Code: ${code}`)
  }

  if (source.status === 'delayed') {
    add('warning', 'Recorded measurements are delayed', 'Check the normal provider sync job, Render service uptime and the last successful database write.', `Last observed: ${localTime(source.latest_at)}`)
  } else if (source.status === 'no_measurements' && provider.sync_status !== 'not_configured') {
    add('warning', 'No provider measurements stored', 'Check credentials, permissions, provider API response and whether the hourly collector has run.')
  }

  const metricReport = source.metrics
  const missingMetrics = Array.isArray(metricReport?.missing)
    ? metricReport.missing.filter((key) => typeof key === 'string').slice(0, 20)
    : []
  if (metricReport && ['missing', 'partial'].includes(metricReport.status)) {
    add('warning', `${metricReport.measured_metrics ?? 0}/${metricReport.expected_metrics ?? '?'} metrics recorded`,
      'Check the API response and provider permissions for the missing metrics below. Missing values are not zero.',
      missingMetrics.length ? missingMetrics.map((key) => DISPLAY_NAMES[key] || key).join(' · ') : 'Missing metric names unavailable')
  } else if (metricReport?.status === 'unknown' && provider.sync_status === 'ok') {
    add('warning', 'Metric completeness cannot be verified', 'The provider sync returned, but no known metric names were found in recent stored observations.')
  }

  if (provider.sync_status === 'error' && !provider.error_code && !(Array.isArray(provider.source_issues) && provider.source_issues.length)) {
    add('error', 'Provider sync failed without a detailed code', 'Check Backend logs for the most recent provider synchronization.')
  } else if (provider.sync_status === 'partial' || provider.sync_status === 'empty') {
    if (!issues.length) add('warning', 'Partial or empty provider sync', 'Check the last provider response and stored metric coverage.')
  }

  return {
    source, provider, issues, missingKeys, missingMetrics,
    readiness: issues.some((item) => item.severity === 'error') ? 'Action needed'
      : issues.length ? 'Incomplete' : provider.sync_status === 'ok' && source.status === 'recent'
        ? 'No reported issue' : 'Not verified',
  }
}

function systemIssues(health) {
  const items = []
  for (const key of ['upload_audit', 'application']) {
    const source = health?.sources?.[key] || {}
    if (source.status === 'table_missing') items.push(`${source.table || key}: SQL table is missing`)
    if (source.status === 'query_failed') items.push(`${source.table || key}: database read failed`)
  }
  const queue = health?.upload_queue || {}
  if (Number(queue.failed_flushes) > 0) items.push(`Upload audit: ${queue.failed_flushes} failed saves`)
  if (Number(queue.pending_attempts) > 0) items.push(`Upload audit: ${queue.pending_attempts} pending attempts`)
  if (Number(queue.overflow_events) > 0) items.push(`Upload audit: ${queue.overflow_events} overflow events`)
  return items
}

const style = {
  card: { minWidth: 0, padding: 14, border: '1px solid #e0e5f0', borderRadius: 11, background: '#fcfdff' },
  text: { fontSize: 12, lineHeight: 1.55, color: '#52617b' },
  detail: { fontSize: 11, lineHeight: 1.6, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', color: '#536178' },
}

export default function ResourceCostDiagnostics({ health, loading = false, error = '' }) {
  const [copyMessage, setCopyMessage] = useState('')
  const reports = useMemo(() => PROVIDERS.map((spec) => ({ ...spec, ...diagnosticsFor(spec, health) })), [health])
  const otherIssues = useMemo(() => systemIssues(health), [health])
  const count = reports.reduce((sum, report) => sum + report.issues.length, otherIssues.length)

  async function copyDiagnostic() {
    if (!health) return
    const lines = [`Resource & Cost Diagnostics · ${localTime(health.generated_at)}`]
    for (const report of reports) {
      lines.push(`${report.label}: sync=${report.provider.sync_status || 'unknown'}, database=${report.source.status || 'unknown'}`)
      for (const issue of report.issues) lines.push(`- ${issue.title}${issue.detail ? ` · ${issue.detail}` : ''}\n  Fix: ${issue.fix}`)
    }
    for (const issue of otherIssues) lines.push(`System: ${issue}`)
    lines.push('No secrets or token values are included.')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopyMessage('Safe diagnostics copied')
    } catch {
      setCopyMessage('Copy unavailable in this browser')
    }
  }

  return <section className="rc-panel" aria-label="Provider setup and error details">
    <div className="rc-panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <h2>Provider Setup & Error Details</h2>
        <p>What is missing, why the sync failed, and what to fix. No secrets are displayed.</p>
      </div>
      {health && <button type="button" className="rc-btn" onClick={copyDiagnostic}>Copy safe diagnostics</button>}
    </div>
    {copyMessage && <p role="status" style={style.text}>{copyMessage}</p>}
    {!health && <p style={style.text}>{loading ? 'Checking provider configuration…' : error ? `Health check failed: ${error}` : 'Health data is unavailable. Use Refresh view to retry.'}</p>}
    {health && <>
      <p style={style.text}>
        <strong>{count} reported issue{count === 1 ? '' : 's'}</strong>
        {' · '}Last health check: {localTime(health.generated_at)}
        {' · '}Backend results may be cached for up to 5 minutes.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 275px), 1fr))', gap: 12, marginTop: 12 }}>
        {reports.map((report) => <article key={report.key} style={style.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 13, color: '#26354f' }}>{report.label}</strong>
            <span style={{ fontSize: 11, fontWeight: 700, color: report.readiness === 'Action needed' ? '#b42336' : report.readiness === 'No reported issue' ? '#137454' : '#9c6818' }}>{report.readiness}</span>
          </div>
          <p style={{ ...style.text, marginTop: 8, marginBottom: 10 }}>
            Sync: <strong>{report.provider.sync_status || 'unknown'}</strong>
            {' · '}Stored: <strong>{report.source.status || 'unknown'}</strong>
            {' · '}Checked: {localTime(report.provider.last_checked_at)}
          </p>
          {report.issues.length === 0 && <p style={style.text}>No specific error reported. This does not verify complete usage or billing.</p>}
          {report.issues.map((issue, index) => <div key={`${issue.title}-${index}`} style={{ borderTop: '1px solid #e7eaf2', paddingTop: 10, paddingBottom: 10 }}>
            <strong style={{ fontSize: 12, color: issue.severity === 'error' ? '#a22638' : '#936014' }}>{issue.severity === 'error' ? 'Error: ' : 'Warning: '}{issue.title}</strong>
            {issue.detail && <p style={{ ...style.detail, marginTop: 5, marginBottom: 5 }}>{issue.detail}</p>}
            <p style={{ ...style.text, marginTop: 5, marginBottom: 0 }}><strong>Fix:</strong> {issue.fix}</p>
          </div>)}
          {report.key === 'cloudflare_r2' && <p style={{ ...style.text, marginTop: 8 }}>
            Storage uses <code>CLOUDFLARE_R2_METRICS_TOKEN</code> when present; Operations use <code>CLOUDFLARE_API_TOKEN</code>. Runtime checks report presence only, not validity or permissions.
          </p>}
          {(report.key === 'supabase' || report.key === 'cloudflare_r2') && <p style={{ ...style.text, marginTop: 8 }}>
            Runtime environment: {health.environment_checks?.[report.key]
              ? Object.entries(health.environment_checks[report.key]).map(([key, present]) => `${key}: ${present ? 'PRESENT' : 'MISSING'}`).join(' · ')
              : 'Not reported by this Backend version. Deploy the updated health service.'}
          </p>}
        </article>)}
      </div>
      {otherIssues.length > 0 && <div style={{ ...style.card, marginTop: 12 }}>
        <strong>Other collection problems</strong>
        {otherIssues.map((item) => <p key={item} style={style.text}>{item}</p>)}
        <p style={style.text}>Check Supabase migrations, Backend logs and saved upload audit records.</p>
      </div>}
      <p style={{ ...style.text, marginTop: 12 }}>A recent sync can still have missing measurements. No measurements and unverified invoices must not be shown as 0 or $0.</p>
    </>}
  </section>
}
