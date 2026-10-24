import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import BoostReaderInsights from '../components/boost/BoostReaderInsights'
import BoostAuthorInsights from '../components/boost/BoostAuthorInsights'
import BoostCampaignReview from '../components/boost/BoostCampaignReview'
import { cambodiaToday, reportRange, shiftDay, validRange } from '../services/adminBoostInsights'
import '../styles/adminBoostAnalytics.css'

const PERIODS = [
  ['yesterday', 'Yesterday'],
  ['last7', 'Last 7 days'],
  ['last30', 'Last 30 days'],
  ['custom', 'Custom'],
]

export default function AdminBoostDashboardPage() {
  const [audience, setAudience] = useState('reader')
  const [kind, setKind] = useState('post')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [period, setPeriod] = useState('last7')
  const [customStart, setCustomStart] = useState(() => shiftDay(cambodiaToday(), -7))
  const [customEnd, setCustomEnd] = useState(() => shiftDay(cambodiaToday(), -1))
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [start, end] = useMemo(() => reportRange(period, customStart, customEnd), [period, customStart, customEnd])
  const valid = validRange(start, end)
  const reviewing = audience === 'author' && reviewOpen

  return <AdminLayout title="Boost" subtitle="Reader insights and author promotion performance">
    <div className="bad-page">
      <header className="bad-heading-row">
        <div>
          <span className="bad-eyebrow">SHADOW · AD ANALYTICS</span>
          <h1>Boost Analytics</h1>
          <p>Understand reading interests, campaigns and platform revenue.</p>
        </div>
        <div className="bad-primary-tabs" role="tablist" aria-label="Boost audience">
          <button type="button" role="tab" aria-selected={audience === 'reader'} onClick={() => { setAudience('reader'); setReviewOpen(false) }}>Reader</button>
          <button type="button" role="tab" aria-selected={audience === 'author'} onClick={() => setAudience('author')}>Author</button>
        </div>
      </header>

      {audience === 'author' && <>
        {!reviewOpen && <nav className="bad-secondary-tabs" role="tablist" aria-label="Boost type">
          <button type="button" role="tab" aria-selected={kind === 'post'} onClick={() => setKind('post')}>Boost Post</button>
          <button type="button" role="tab" aria-selected={kind === 'book'} onClick={() => setKind('book')}>Boost Book</button>
        </nav>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button
            type="button"
            className="bad-refresh"
            aria-expanded={reviewOpen}
            onClick={() => setReviewOpen(value => !value)}
          >
            {reviewOpen ? 'Back to Analytics' : 'Campaign Review'}
          </button>
        </div>
      </>}

      {!reviewing && <div className="bad-toolbar">
        <div className="bad-periods" aria-label="Report period">
          {PERIODS.map(([value, label]) => <button type="button" key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{label}</button>)}
        </div>
        <div className="bad-dates">
          {period === 'custom' && <>
            <input type="date" aria-label="Start date" max={shiftDay(cambodiaToday(), -1)} value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
            <span>to</span>
            <input type="date" aria-label="End date" max={shiftDay(cambodiaToday(), -1)} value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
          </>}
          <small>{valid ? `${start} – ${end} · Cambodia time` : 'Choose completed dates within one year'}</small>
          <button type="button" className="bad-refresh" disabled={!valid} onClick={() => setRefreshSignal((value) => value + 1)}>Refresh</button>
        </div>
      </div>}

      {audience === 'reader'
        ? <BoostReaderInsights key={`reader:${start}:${end}`} start={start} end={end} refreshSignal={refreshSignal} />
        : reviewing
          ? <BoostCampaignReview />
          : <BoostAuthorInsights key={`author:${kind}:${start}:${end}`} kind={kind} start={start} end={end} refreshSignal={refreshSignal} />}

      {!reviewing && <p className="bad-footnote">Daily snapshots. Boost fees, attributed sales and platform share are reported separately.</p>}
    </div>
  </AdminLayout>
}
