import React from 'react'
import { formatMoney, formatNumber, formatPercent, toNumber, PAGE_SIZE } from '../../services/adminBoostInsights'
import { BoostEmpty, BoostPanel } from './BoostReportWidgets'

export default function BoostCampaignTable({ kind, rows, total, page, onPageChange, search, onSearchChange, loading }) {
  const items = Array.isArray(rows) ? rows : []
  const pages = Math.max(1, Math.ceil(Math.max(0, toNumber(total) || 0) / PAGE_SIZE))
  return <BoostPanel title={kind === 'book' ? 'Boosted Books' : 'Boosted Posts'} subtitle="Campaign owners, placements, goals and revenue">
    <div className="bad-table-tools">
      <input type="search" aria-label="Search Boost campaigns" placeholder={`Search ${kind === 'book' ? 'books' : 'posts'} or authors...`} value={search} onChange={(event) => onSearchChange(event.target.value)} />
      <small>20 campaigns per page</small>
    </div>
    <div className="bad-table-scroll"><table className="bad-table">
      <thead><tr><th>{kind === 'book' ? 'Book / Author' : 'Post / Author'}</th><th>Placement</th><th>Goal</th><th>Achieved</th><th>Boost Fee</th><th>Attributed Sales</th><th>Status</th></tr></thead>
      <tbody>
        {items.length > 0 ? items.map((item, index) => {
          const ratio = toNumber(item.goal_achieved_percent)
          const status = String(item.status || 'unknown').toLowerCase()
          const cover = typeof item.cover_url === 'string' && /^https:\/\//i.test(item.cover_url) ? item.cover_url : ''
          return <tr key={item.id || index}>
            <td><div className="bad-work">
              {kind === 'book' && (cover ? <img src={cover} alt="" loading="lazy" /> : <div className="bad-book-placeholder" aria-hidden="true">▤</div>)}
              <div><strong title={item.title || ''}>{item.title || 'Untitled'}</strong><small>{item.author_name || 'Unknown author'}</small></div>
            </div></td>
            <td>{item.placement || '—'}</td>
            <td>{item.goal || '—'}</td>
            <td><strong>{formatPercent(ratio)}</strong><div className="bad-progress"><div style={{ width: `${Math.min(100, Math.max(0, ratio || 0))}%` }} /></div></td>
            <td>{formatMoney(item.boost_fee)}</td>
            <td>{formatMoney(item.attributed_revenue)}</td>
            <td><span className="bad-status" data-status={status}>{item.status || 'Unknown'}</span></td>
          </tr>
        }) : <tr><td colSpan={7}><BoostEmpty text={loading ? 'Loading campaigns...' : 'No campaigns found for this period.'} /></td></tr>}
      </tbody>
    </table></div>
    <div className="bad-table-footer">
      <small>{formatNumber(total)} campaigns</small>
      <div><button type="button" disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button><span>{page} / {pages}</span><button type="button" disabled={loading || page >= pages} onClick={() => onPageChange(page + 1)}>Next</button></div>
    </div>
  </BoostPanel>
}
