import React, { useMemo, useState } from 'react'

const PAGE_SIZE = 20

function amount(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function numberText(value) {
  return amount(value).toLocaleString()
}

function bytesText(value) {
  const bytes = amount(value)
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${Math.round(bytes)} B`
}

function reviewReasons(row) {
  const requests = amount(row.requests)
  const ranges = amount(row.supabase_range_responses)
  const rows = amount(row.observed_supabase_rows)
  const bytes = amount(row.response_bytes)
  const reasons = []
  if (ranges > 0 && rows / ranges >= 1000) reasons.push('Large DB result')
  if (requests >= 120) reasons.push('Frequent requests')
  if (requests > 0 && bytes / requests >= 1024 * 1024) reasons.push('Large response')
  if (amount(row.errors_5xx) > 0) reasons.push('Server errors')
  return reasons
}

export default function AdminPageRequestWatch({ snapshot }) {
  const [search, setSearch] = useState('')
  const [selectedPage, setSelectedPage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pages = useMemo(() => Array.isArray(snapshot?.pages) ? snapshot.pages : [], [snapshot])
  const routes = useMemo(() => Array.isArray(snapshot?.routes) ? snapshot.routes : [], [snapshot])
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return pages.filter((row) => String(row.page || '').toLowerCase().includes(query))
  }, [pages, search])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, pageCount)
  const shownPages = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const selectedRoutes = useMemo(() => routes.filter((row) => row.page === selectedPage), [routes, selectedPage])
  const totals = snapshot?.totals || {}
  const warnings = pages.filter((row) => reviewReasons(row).length > 0).length

  return (
    <section className="sua-block">
      <div className="sua-head">
        <div>
          <div className="sua-title">Page Request Watch</div>
          <div className="sua-sub">
            Admin and Web pages · Last {numberText(snapshot?.window_minutes || 60)} minutes · Monitoring only
          </div>
        </div>
        <span className="sua-pill">{numberText(warnings)} pages to review</span>
      </div>

      <div style={{ padding: 12, display: 'grid', gap: 12 }}>
        <div className="sua-summary">
          {[
            ['API Requests', totals.requests],
            ['Supabase Calls', totals.supabase_calls],
            ['Observed DB Rows', totals.observed_supabase_rows],
            ['Response Data', bytesText(totals.response_bytes)],
          ].map(([label, value]) => (
            <div key={label} className="sua-card">
              <div className="sua-card-label">{label}</div>
              <div className="sua-card-value" style={{ fontSize: 20 }}>
                {typeof value === 'string' ? value : numberText(value)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            aria-label="Find monitored page"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }}
            placeholder="Search ADMIN:/income or WEB:/story..."
            style={{ flex: '1 1 260px', minHeight: 38, maxWidth: 440, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 12, background: 'var(--shadow-bg-primary, #fff)', color: 'inherit' }}
          />
          <span className="sua-muted">{numberText(filtered.length)} recorded pages</span>
        </div>

        <div className="sua-table-wrap">
          <table className="sua-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Requests</th>
                <th>Supabase</th>
                <th>Observed Rows</th>
                <th>Response</th>
                <th>Errors</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shownPages.map((row) => {
                const reasons = reviewReasons(row)
                return (
                  <tr key={row.page}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedPage((value) => value === row.page ? '' : row.page)}
                        aria-expanded={selectedPage === row.page}
                        style={{ textAlign: 'left', border: 0, background: 'transparent', color: '#6D28D9', cursor: 'pointer', fontSize: 10, fontWeight: 900, overflowWrap: 'anywhere' }}
                      >
                        {row.page || 'UNATTRIBUTED'} {selectedPage === row.page ? '▲' : '▼'}
                      </button>
                    </td>
                    <td>{numberText(row.requests)}</td>
                    <td>{numberText(row.supabase_calls)}</td>
                    <td>{numberText(row.observed_supabase_rows)}</td>
                    <td>{bytesText(row.response_bytes)}</td>
                    <td>{numberText(amount(row.errors_4xx) + amount(row.errors_5xx))}</td>
                    <td>
                      <span className="sua-pill" title={reasons.join(' · ')}>
                        {reasons.length ? 'Review' : 'Observed'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!snapshot ? (
            <div className="sua-empty">Page statistics are not available in the current System Control snapshot.</div>
          ) : filtered.length === 0 ? (
            <div className="sua-empty">No page requests matched this search in the available window.</div>
          ) : null}
        </div>

        {pageCount > 1 ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
            <button type="button" className="sua-btn" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)}>Previous</button>
            <span className="sua-muted">Page {safePage} / {pageCount}</span>
            <button type="button" className="sua-btn" disabled={safePage >= pageCount} onClick={() => setCurrentPage(safePage + 1)}>Next</button>
          </div>
        ) : null}

        {selectedPage ? (
          <div>
            <div className="sua-title" style={{ marginBottom: 8 }}>Routes for {selectedPage}</div>
            <div className="sua-table-wrap">
              <table className="sua-table">
                <thead>
                  <tr><th>API Route</th><th>Requests</th><th>Supabase</th><th>Observed Rows</th><th>Range Responses</th><th>Avg ms</th><th>Review</th></tr>
                </thead>
                <tbody>
                  {selectedRoutes.map((row) => {
                    const reasons = reviewReasons(row)
                    return (
                      <tr key={`${row.page}:${row.route}`}>
                        <td style={{ overflowWrap: 'anywhere' }}>{row.route}</td>
                        <td>{numberText(row.requests)}</td>
                        <td>{numberText(row.supabase_calls)}</td>
                        <td>{numberText(row.observed_supabase_rows)}</td>
                        <td>{numberText(row.supabase_range_responses)}</td>
                        <td>{numberText(row.average_duration_ms)}</td>
                        <td>{reasons.length ? reasons.join(' · ') : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {selectedRoutes.length === 0 ? <div className="sua-empty">No detailed routes in the current ranked snapshot.</div> : null}
            </div>
          </div>
        ) : null}

        <div className="sua-sub">
          Review flags are indicators, not limits. DB rows are counted only when Supabase provides a measurable Content-Range; zero does not prove that no records were read. Data is kept in backend memory and resets on restart. No requests are blocked by this panel.
        </div>
      </div>
    </section>
  )
}
