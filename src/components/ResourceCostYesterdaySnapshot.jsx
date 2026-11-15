import React from 'react'
import { formatResourceBytes } from '../services/resourceCostApi'
import '../styles/adminResourceCostSnapshot.css'

const cards = [
  { key: 'render_total_bytes', label: 'Render outbound', note: 'Provider-measured bandwidth', tone: 'purple' },
  { key: 'service_initiated_bytes', label: 'Service-initiated', note: 'Render outbound category', tone: 'violet' },
  { key: 'supabase_egress_bytes', label: 'Supabase egress', note: 'Stored provider metric', tone: 'green' },
  { key: 'cloudflare_r2_storage_bytes', label: 'Cloudflare R2 storage', note: 'Latest stored measurement', tone: 'orange' },
  { key: 'invoiced_cost_usd', label: 'Verified invoice cost', note: 'Unknown when no invoice', tone: 'rose' },
]

function formatValue(key, value) {
  if (value === null || value === undefined) return '—'
  if (key === 'invoiced_cost_usd') {
    const number = Number(value)
    return Number.isFinite(number) && number >= 0 ? `$${number.toFixed(2)}` : '—'
  }
  return formatResourceBytes(value)
}

export default function ResourceCostYesterdaySnapshot({ snapshot, loading = false, error = '' }) {
  const date = snapshot?.snapshot_date || ''
  const payload = snapshot?.payload || {}
  const capturedAt = snapshot?.captured_at
  const statusText = loading ? 'Loading' : error ? 'Unavailable' : !snapshot ? 'Pending snapshot'
    : snapshot.status === 'complete' ? 'Saved snapshot' : 'Partial snapshot'
  return <section className="rc-yesterday" aria-label="Yesterday resource and cost snapshot">
    <div className="rc-yesterday-heading">
      <div>
        <h2>Yesterday Snapshot</h2>
        <p>{date ? `${date} · Cambodia time` : 'Previous Cambodia calendar day · Saved data only'}</p>
      </div>
      <span className={`rc-yesterday-status${snapshot?.status === 'complete' ? ' rc-yesterday-status-good' : ''}`}>{statusText}</span>
    </div>
    <div className="rc-yesterday-grid">
      {cards.map((card) => <div className={`rc-yesterday-card rc-yesterday-${card.tone}`} key={card.key}>
        <span className="rc-yesterday-label">{card.label}</span>
        <strong>{formatValue(card.key, payload[card.key])}</strong>
        <small>{card.note}</small>
      </div>)}
    </div>
    <p className="rc-yesterday-footnote">
      {error ? 'Snapshot could not be loaded. Existing Resource & Cost reports remain available.'
        : !snapshot ? 'Daily snapshot has not been saved yet. Missing values are not treated as zero.'
          : `Saved ${new Date(capturedAt).toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })} ICT · ${snapshot.status === 'complete' ? 'Sources recorded' : 'Some measurements are incomplete or missing'} · No live provider request`}
    </p>
  </section>
}
