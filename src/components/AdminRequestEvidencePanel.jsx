import React from 'react'

export default function AdminRequestEvidencePanel({ evidence = [] }) {
  const entries = Array.isArray(evidence)
    ? [...evidence].reverse().slice(0, 12)
    : []

  return (
    <section className="sc-block">
      <div className="sc-block-head">
        <div className="sc-block-title-wrap">
          <span className="sc-icon blue">i</span>
          <div>
            <div className="sc-block-title">Request Evidence</div>
            <div className="sc-block-subtitle">
              Sampled slow, high-external-call, or failed requests · up to 12 · last 10 minutes · memory only
            </div>
          </div>
        </div>
        <span className="sc-pill low">{entries.length} samples</span>
      </div>

      {entries.length === 0 ? (
        <div className="sc-empty">
          No recent request evidence collected. This does not mean there were no requests or problems.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, padding: 12 }}>
          {entries.map((item, index) => {
            const account = item?.account
            const actor = account?.type === 'authenticated' && account.id
              ? `Authenticated account: ${account.id}`
              : item?.visitor_claim
                ? `Anonymous · reported visitor ID: ${item.visitor_claim} (unverified)`
                : 'Anonymous · identity unavailable'
            const targets = Array.isArray(item?.targets) ? item.targets : []

            return (
              <div
                key={`${item?.request_id || 'request'}-${index}`}
                style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, minWidth: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <strong style={{ color: '#0F172A', overflowWrap: 'anywhere' }}>
                    {item?.route || 'Unknown route'}
                  </strong>
                  <span className={`sc-pill ${Number(item?.http_status) >= 500 ? 'high' : 'low'}`}>
                    HTTP {item?.http_status ?? '—'} · {item?.duration_ms ?? '—'} ms
                  </span>
                </div>

                <div style={{ marginTop: 7, color: '#475569', fontSize: 12, overflowWrap: 'anywhere' }}>
                  {item?.time ? new Date(item.time).toLocaleString() : 'Unknown time'}
                  {' · '}Request ID: {item?.request_id || '—'}
                </div>
                <div style={{ marginTop: 5, color: '#475569', fontSize: 12, overflowWrap: 'anywhere' }}>
                  {actor}
                </div>
                <div style={{ marginTop: 5, color: '#475569', fontSize: 12 }}>
                  Cache: {item?.cache || 'NONE'}
                  {' · '}Observed external calls: {item?.observed_external_calls ?? '—'}
                  {' · '}External errors: {item?.observed_external_errors ?? '—'}
                </div>

                {targets.length > 0 ? (
                  <div style={{ display: 'grid', gap: 4, marginTop: 9, paddingTop: 9, borderTop: '1px solid #EEF2F7' }}>
                    {targets.map((target, targetIndex) => (
                      <div
                        key={`${target?.target || 'target'}-${targetIndex}`}
                        style={{ color: '#475569', fontSize: 12, overflowWrap: 'anywhere' }}
                      >
                        {target?.target || 'Unknown destination'} · {target?.count ?? 0} observed calls
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
