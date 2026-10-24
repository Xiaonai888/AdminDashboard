import React from 'react'
import { formatNumber, useAdminBoostInsights } from '../../services/adminBoostInsights'
import { BoostAlert, BoostFunnel, BoostPanel, BoostRanking, BoostStat, BoostTrend } from './BoostReportWidgets'

export default function BoostReaderInsights({ start, end, refreshSignal }) {
  const { data, loading, error, refresh } = useAdminBoostInsights({ audience: 'reader', start, end, page: 1 })
  const seenRefresh = React.useRef(refreshSignal)
  React.useEffect(() => {
    if (refreshSignal !== seenRefresh.current) {
      seenRefresh.current = refreshSignal
      refresh()
    }
  }, [refreshSignal])
  const metrics = data?.metrics || {}

  return <div role="tabpanel" aria-label="Reader Boost Analytics">
    <BoostAlert error={error} loading={loading} onRetry={refresh} />
    <div className="bad-stats">
      <BoostStat label="Interested Readers" value={formatNumber(metrics.interested_readers)} note="Readers with recorded interest" icon="♙" />
      <BoostStat label="Reading Actions" value={formatNumber(metrics.reading_actions)} note="Book opens and reading" icon="▤" />
      <BoostStat label="Saves & Follows" value={formatNumber(metrics.saves_follows)} note="Library saves and follows" icon="♡" />
      <BoostStat label="Unlocks" value={formatNumber(metrics.unlocks)} note="Episode unlock actions" icon="◇" />
    </div>
    <div className="bad-two">
      <BoostPanel title="Reader Activity" subtitle="Recorded activity by day"><BoostTrend rows={data?.trend} /></BoostPanel>
      <BoostPanel title="Reading Journey" subtitle="How readers progress through books"><BoostFunnel funnel={data?.funnel} kind="reader" /></BoostPanel>
    </div>
    <div className="bad-two bad-two-equal">
      <BoostPanel title="Top Genres" subtitle="Most engaged genres"><BoostRanking rows={data?.genres} /></BoostPanel>
      <BoostPanel title="Top Tags" subtitle="Readers' popular interests"><BoostRanking rows={data?.tags} /></BoostPanel>
    </div>
  </div>
}
