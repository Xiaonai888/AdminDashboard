import React, { useMemo, useState } from 'react'

const fmt = (value) => Math.max(0, Number(value) || 0).toLocaleString()
const ms = (value) => value == null ? '—' : `${fmt(Math.round(Number(value) || 0))} ms`
const sourceLabels = {
  CLOUDFLARE_R2: 'Cloudflare R2 (classified)',
  OTHER_EXTERNAL_UNVERIFIED: 'Other external (unverified)',
  SAME_ORIGIN: 'Shadow website origin',
}
const pageLabels = {
  HOME: 'Home', MANGA: 'Manga', READ: 'Reading episode',
  STORY: 'Story detail', AUTHOR: 'Author', CHAT: 'Chat', MINE: 'Mine', OTHER: 'Other',
}

const border = '1px solid #E2E8F0'
const secondary = '#64748B'
const primary = '#0F172A'

function Metric({ title, value, note }) {
  return (
    <div style={{ border, borderRadius: 12, padding: 12, minWidth: 0, background: 'var(--shadow-bg-surface, #fff)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: secondary }}>{title}</div>
      <div style={{ marginTop: 5, fontSize: 21, fontWeight: 850, color: primary }}>{value}</div>
      <div style={{ marginTop: 4, fontSize: 10, color: secondary }}>{note}</div>
    </div>
  )
}

function MetricRow({ row, pageColumn = false }) {
  return (
    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
      {pageColumn ? (
        <td style={{ padding: 10, fontWeight: 700, color: primary }}>{pageLabels[row.page] || row.page || 'Unknown'}</td>
      ) : null}
      <td style={{ padding: 10, color: primary, fontWeight: 750, overflowWrap: 'anywhere' }}>
        {sourceLabels[row.source] || row.source || 'Unknown'}
      </td>
      <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.observed_image_resources)}</td>
      <td style={{ padding: 10, textAlign: 'right' }}>{ms(row.observed_average_ms)}</td>
      <td style={{ padding: 10, textAlign: 'right' }}>{ms(row.max_ms)}</td>
      <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.slow_1500)}</td>
      <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.slow_3000)}</td>
      <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.load_errors)}</td>
      <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.unavailable)}</td>
      {pageColumn ? (
        <>
          <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.worker_seen)}</td>
          <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.cache_hint)}</td>
          <td style={{ padding: 10, textAlign: 'right' }}>{ms(row.observed_average_ttfb_ms)}</td>
          <td style={{ padding: 10, textAlign: 'right' }}>{ms(row.observed_average_transfer_ms)}</td>
          <td style={{ padding: 10, textAlign: 'right' }}>{fmt(row.timing_phase_unavailable)}</td>
        </>
      ) : null}
    </tr>
  )
}

export default function AdminImageDiagnosticsPanel({ diagnostics }) {
  const [range, setRange] = useState(24)
  const [copied, setCopied] = useState(false)
  const report = diagnostics && typeof diagnostics === 'object' ? diagnostics : null
  const data = range === 96 ? report?.recent_96h : report?.recent_24h
  const totals = data?.totals || {}
  const sources = Array.isArray(data?.sources) ? data.sources.slice(0, 3) : []
  const sourcePages = Array.isArray(data?.source_pages) ? data.source_pages.slice(0, 24) : []
  const hourly = useMemo(() => Array.isArray(data?.hourly)
    ? [...data.hourly].reverse().slice(0, 24)
    : [], [data])
  const sampled = Math.max(0, Number(data?.reports) || 0)
  const externalUnknown = sources.find((row) => row.source === 'OTHER_EXTERNAL_UNVERIFIED')
  const r2 = sources.find((row) => row.source === 'CLOUDFLARE_R2')
  const observed = Math.max(0, Number(totals.observed_image_resources) || 0)
  const hasPhaseMetrics = Boolean(report?.schema_version >= 2)

  const handleCopy = async () => {
    if (!report || !navigator.clipboard?.writeText) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="sc-block" aria-label="Image Loading Diagnostics">
      <div className="sc-block-head" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="sc-block-title-wrap">
          <span className="sc-icon blue">IMG</span>
          <div>
            <div className="sc-block-title">Image Loading Diagnostics</div>
            <div className="sc-block-subtitle">Sampled browser loads · No image re-fetching · No personal URLs · Read-only</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
          {[24, 96].map((hours) => (
            <button key={hours} type="button" className="sc-detail-btn"
              aria-pressed={range === hours} onClick={() => setRange(hours)}
              style={{ borderColor: range === hours ? '#6366F1' : undefined, fontWeight: range === hours ? 850 : 600 }}>
              {hours}h
            </button>
          ))}
          <button type="button" className="sc-detail-btn" disabled={!report} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy Evidence'}
          </button>
        </div>
      </div>

      {!report ? (
        <div className="sc-empty">No image diagnostics returned. Verify the Backend diagnostics route is deployed.</div>
      ) : (
        <div style={{ display: 'grid', gap: 15, padding: 14 }}>
          <div style={{ color: secondary, fontSize: 11, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>Window: {range} hours</span>
            <span>Accepted reports: {fmt(sampled)}</span>
            <span>Sampled browsers: approximately {Math.round((Number(report.sample_rate) || 0) * 100)}%</span>
            <span>Monitor started: {report.started_at ? new Date(report.started_at).toLocaleString() : 'Unknown'}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            <Metric title="Observed images" value={fmt(observed)} note="Timed or timing unavailable" />
            <Metric title="Average load" value={ms(totals.observed_average_ms)} note="Browser-observed image duration" />
            <Metric title="Slow ≥ 1.5 seconds" value={fmt(totals.slow_1500)} note="Measured resources" />
            <Metric title="Slow ≥ 3 seconds" value={fmt(totals.slow_3000)} note="Measured resources" />
            <Metric title="Image load errors" value={fmt(totals.load_errors)} note="May overlap resource counts" />
            <Metric title="Timing unavailable" value={fmt(totals.unavailable)} note="Not necessarily an error" />
            {hasPhaseMetrics ? (
              <>
                <Metric title="Service Worker seen" value={fmt(totals.worker_seen)} note="Interception, NOT a cache hit" />
                <Metric title="Browser cache hints" value={fmt(totals.cache_hint)} note="deliveryType cache only" />
                <Metric title="Network transfer seen" value={fmt(totals.network_seen)} note="transferSize greater than zero" />
                <Metric title="Request → first byte" value={ms(totals.observed_average_ttfb_ms)} note={`${fmt(totals.ttfb_samples)} visible samples · browser phase`} />
                <Metric title="Response transfer" value={ms(totals.observed_average_transfer_ms)} note={`${fmt(totals.transfer_samples)} visible samples`} />
                <Metric title="Phase unavailable" value={fmt(totals.timing_phase_unavailable)} note="Often restricted across origins" />
              </>
            ) : null}
          </div>

          {sampled === 0 ? (
            <div style={{ padding: 12, border, borderRadius: 12, color: secondary, fontSize: 12 }}>
              No browser reports accepted in this window. This does not prove images are fast or error-free.
            </div>
          ) : null}

          {!r2 && externalUnknown && Number(externalUnknown.observed_image_resources || 0) > 0 ? (
            <div style={{ padding: 12, border, borderRadius: 12, color: '#92400E', background: '#FFFBEB', fontSize: 12 }}>
              External images were observed but none verified as R2. Check VITE_R2_PUBLIC_URL in Web before attributing delays to Cloudflare.
            </div>
          ) : null}

          {sourcePages.length ? (
            <div>
              <div style={{ color: primary, fontSize: 13, fontWeight: 850, marginBottom: 8 }}>Where images are slow · page × source</div>
              <div style={{ border, borderRadius: 12, overflowX: 'auto' }}>
                <table style={{ minWidth: 1370, width: '100%', borderCollapse: 'collapse', color: '#334155', fontSize: 11 }}>
                  <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                    <tr>{['Page', 'Source', 'Images', 'Avg', 'Max', '≥1.5s', '≥3s', 'Errors', 'Unavailable', 'SW seen', 'Cache hint', 'First byte', 'Transfer', 'Phase hidden'].map((title) =>
                      <th key={title} style={{ padding: 9, textAlign: ['Page', 'Source'].includes(title) ? 'left' : 'right', borderBottom: border }}>{title}</th>
                    )}</tr>
                  </thead>
                  <tbody>{sourcePages.map((row) => <MetricRow key={`${row.source}:${row.page}`} row={row} pageColumn />)}</tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div>
            <div style={{ color: primary, fontSize: 13, fontWeight: 850, marginBottom: 8 }}>Image source comparison</div>
            {sources.length ? (
              <div style={{ border, borderRadius: 12, overflowX: 'auto' }}>
                <table style={{ minWidth: 790, width: '100%', borderCollapse: 'collapse', color: '#334155', fontSize: 11 }}>
                  <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                    <tr>{['Source', 'Observed', 'Average', 'Max', '≥1.5s', '≥3s', 'Load errors', 'Unavailable'].map((title) =>
                      <th key={title} style={{ padding: 10, textAlign: title === 'Source' ? 'left' : 'right', borderBottom: border }}>{title}</th>
                    )}</tr>
                  </thead>
                  <tbody>{sources.map((row) => <MetricRow key={row.source} row={row} />)}</tbody>
                </table>
              </div>
            ) : <div style={{ color: secondary, fontSize: 12 }}>No classified image resources yet.</div>}
          </div>

          <div>
            <div style={{ color: primary, fontSize: 13, fontWeight: 850, marginBottom: 8 }}>Recent hourly observations (up to 24 hours shown)</div>
            {hourly.length ? (
              <div style={{ border, borderRadius: 12, maxHeight: 290, overflow: 'auto' }}>
                <table style={{ minWidth: 550, width: '100%', borderCollapse: 'collapse', color: '#334155', fontSize: 11 }}>
                  <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                    <tr>{['Hour', 'Reports', 'Average', 'Slow ≥3s', 'Errors', 'Unavailable'].map((title) =>
                      <th key={title} style={{ position: 'sticky', top: 0, background: '#F8FAFC', padding: 9, textAlign: title === 'Hour' ? 'left' : 'right', borderBottom: border }}>{title}</th>
                    )}</tr>
                  </thead>
                  <tbody>{hourly.map((row) => (
                    <tr key={row.hour} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 9 }}>{new Date(row.hour).toLocaleString()}</td>
                      <td style={{ padding: 9, textAlign: 'right' }}>{fmt(row.reports)}</td>
                      <td style={{ padding: 9, textAlign: 'right' }}>{ms(row.observed_average_ms)}</td>
                      <td style={{ padding: 9, textAlign: 'right' }}>{fmt(row.slow_3000)}</td>
                      <td style={{ padding: 9, textAlign: 'right' }}>{fmt(row.load_errors)}</td>
                      <td style={{ padding: 9, textAlign: 'right' }}>{fmt(row.unavailable)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <div style={{ color: secondary, fontSize: 12 }}>No hourly observations available.</div>}
          </div>

          <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 12, color: '#475569', fontSize: 11, lineHeight: 1.65 }}>
            <strong>Evidence limitations:</strong> Browser data is sampled, so averages are not p95/p99. Service Worker seen is not proof of a cache hit. Zero transfer does not prove cached delivery. Request-to-first-byte timing includes browser and network phases, not only Cloudflare time. Cross-origin data may hide phases. R2 classification depends on VITE_R2_PUBLIC_URL; Render restarts clear in-memory reports.
          </div>
        </div>
      )}
    </section>
  )
}
