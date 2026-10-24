import React, { useEffect, useState } from 'react'
import { formatMoney, formatNumber, formatPercent, useAdminBoostInsights } from '../../services/adminBoostInsights'
import { BoostAlert, BoostFunnel, BoostPanel, BoostStat, BoostTrend } from './BoostReportWidgets'
import BoostCampaignTable from './BoostCampaignTable'

function BoostRevenue({ data, kind }) {
  const revenue = data?.revenue || {}
  return <BoostPanel title="Revenue Sources" subtitle="Verified fees and attributable sales">
    <div className="bad-revenue-line"><span>Boost Fees Paid</span><strong>{formatMoney(revenue.boost_fees)}</strong></div>
    <div className="bad-revenue-line"><span>{kind === 'book' ? 'Attributed Book / Episode Sales' : 'Attributed Post Sales'}</span><strong>{formatMoney(revenue.attributed_sales)}</strong></div>
    <div className="bad-revenue-line"><span>Shadow Share from Sales</span><strong>{formatMoney(revenue.shadow_share)}</strong></div>
    <div className="bad-revenue-total"><small>Platform Revenue</small><strong>{formatMoney(revenue.platform_revenue)}</strong><span>Boost fees + Shadow share; sales are not counted twice.</span></div>
  </BoostPanel>
}

export default function BoostAuthorInsights({ kind, start, end, refreshSignal }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [querySearch, setQuerySearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setQuerySearch(search.trim()), 350)
    return () => clearTimeout(timeout)
  }, [search])

  const { data, loading, error, refresh } = useAdminBoostInsights({ audience: 'author', kind, start, end, page, search: querySearch })
  const seenRefresh = React.useRef(refreshSignal)
  useEffect(() => {
    if (refreshSignal !== seenRefresh.current) {
      seenRefresh.current = refreshSignal
      refresh()
    }
  }, [refreshSignal])
  const metrics = data?.metrics || {}

  const updateSearch = (value) => { setSearch(value); setPage(1) }

  return <div role="tabpanel" aria-label={kind === 'book' ? 'Boost Book insights' : 'Boost Post insights'}>
    <BoostAlert error={error} loading={loading} onRetry={refresh} />
    <div className="bad-stats">
      <BoostStat label="Boost Revenue" value={formatMoney(metrics.boost_revenue)} note="Verified fees paid during period" icon="$" />
      <BoostStat label="Active Campaigns" value={formatNumber(metrics.active_campaigns)} note="Running during this report" icon="↗" />
      <BoostStat label="Campaign Reach" value={formatNumber(metrics.reach)} note="Unique readers reached" icon="◎" />
      <BoostStat label="Goals Achieved" value={formatPercent(metrics.goals_achieved_percent)} note="Weighted progress toward targets" icon="✓" />
    </div>
    <div className="bad-two">
      <BoostPanel title={kind === 'book' ? 'Boost Book Performance' : 'Boost Post Performance'} subtitle="Impressions by day"><BoostTrend rows={data?.trend} /></BoostPanel>
      <BoostRevenue data={data} kind={kind} />
    </div>
    <div className="bad-panel-space"><BoostPanel title={kind === 'book' ? 'Book Conversion Funnel' : 'Post Engagement Funnel'} subtitle="Actions from Boost campaigns only"><BoostFunnel kind={kind} funnel={data?.funnel} /></BoostPanel></div>
    <BoostCampaignTable kind={kind} rows={data?.campaigns} total={data?.total} page={page} onPageChange={setPage} search={search} onSearchChange={updateSearch} loading={loading} />
  </div>
}
