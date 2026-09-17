import React from 'react'
import AdminLayout from '../components/AdminLayout'

const cards = [
  { title: 'Render', note: 'Usage, bandwidth, requests and service health' },
  { title: 'Supabase', note: 'Database, API, storage and egress usage' },
  { title: 'Storage / R2', note: 'Uploads, downloads, worker traffic and waste' },
  { title: 'Shadow Features', note: 'Feature-level usage, cost and anomalies' },
]

export default function AdminSystemControlPage() {
  return (
    <AdminLayout
      title="System Control"
      subtitle="Central usage, cost, anomaly and protection control for Shadow services."
    >
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {cards.map((card) => (
            <div key={card.title} style={{ minHeight: 128, padding: 18, border: '1px solid #E2E8F0', borderRadius: 18, background: '#FFFFFF', boxShadow: '0 6px 20px rgba(15, 23, 42, 0.035)' }}>
              <div style={{ color: '#0F172A', fontSize: 15, fontWeight: 950 }}>{card.title}</div>
              <div style={{ marginTop: 8, color: '#64748B', fontSize: 11, fontWeight: 700, lineHeight: 1.55 }}>{card.note}</div>
              <div style={{ display: 'inline-flex', marginTop: 16, padding: '6px 9px', borderRadius: 999, background: '#F1F5F9', color: '#64748B', fontSize: 9, fontWeight: 900 }}>
                Waiting for telemetry
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 18, border: '1px solid #E2E8F0', borderRadius: 18, background: '#FFFFFF' }}>
          <div style={{ color: '#0F172A', fontSize: 14, fontWeight: 950 }}>System Control Foundation</div>
          <div style={{ marginTop: 7, color: '#64748B', fontSize: 11, fontWeight: 700, lineHeight: 1.6 }}>
            Telemetry, summaries, incidents, provider reconciliation and protection controls will be connected in the next stages.
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
