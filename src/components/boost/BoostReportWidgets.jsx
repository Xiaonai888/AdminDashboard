import React from 'react'
import { formatNumber, toNumber } from '../../services/adminBoostInsights'

export function BoostStat({ label, value, note, icon }) {
  return (
    <article className="bad-stat">
      <div className="bad-stat-top"><span>{label}</span><span className="bad-stat-icon" aria-hidden="true">{icon}</span></div>
      <strong className="bad-stat-value">{value}</strong>
      <small>{note}</small>
    </article>
  )
}

export function BoostPanel({ title, subtitle, children }) {
  return <section className="bad-panel">
    <header className="bad-panel-header"><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</header>
    {children}
  </section>
}

export function BoostEmpty({ text = 'No recorded data for this period.' }) {
  return <div className="bad-empty">{text}</div>
}

export function BoostAlert({ error, loading, onRetry }) {
  return <>
    {error && <div className="bad-alert" role="alert"><span>{error}</span>{onRetry && <button type="button" onClick={onRetry}>Retry</button>}</div>}
    {loading && <div className="bad-loading" role="status">Loading cached Boost insights...</div>}
  </>
}

export function BoostTrend({ rows }) {
  if (!Array.isArray(rows) || rows.length === 0) return <BoostEmpty />
  const values = rows.slice(-31)
  const max = Math.max(1, ...values.map((item) => Math.max(0, toNumber(item.value) || 0)))
  return <div className="bad-chart-outer">
    <div className="bad-chart" role="img" aria-label="Recorded daily Boost activity">
      {values.map((item, index) => <div className="bad-chart-cell" key={`${item.day}-${index}`} title={`${item.day}: ${formatNumber(item.value)}`}>
        <div className="bad-chart-bar" style={{ height: `${Math.max(1, Math.min(100, ((toNumber(item.value) || 0) / max) * 100))}%` }} />
        {(values.length <= 10 || index % Math.ceil(values.length / 6) === 0) && <span>{String(item.day || '').slice(5)}</span>}
      </div>)}
    </div>
  </div>
}

export function BoostRanking({ rows }) {
  if (!Array.isArray(rows) || rows.length === 0) return <BoostEmpty />
  const items = rows.slice(0, 6)
  const max = Math.max(1, ...items.map((item) => Math.max(0, toNumber(item.count) || 0)))
  return <div className="bad-ranking">
    {items.map((item, index) => <div className="bad-ranking-row" key={`${item.name}-${index}`}>
      <span title={String(item.name || '')}>{item.name || 'Unknown'}</span>
      <div className="bad-ranking-track"><div style={{ width: `${Math.min(100, Math.max(0, (toNumber(item.count) || 0) / max * 100))}%` }} /></div>
      <strong>{formatNumber(item.count)}</strong>
    </div>)}
  </div>
}

export function BoostFunnel({ funnel, kind }) {
  const steps = kind === 'book'
    ? [['impressions', 'Impressions'], ['opens', 'Book Opens'], ['reads', 'Reads Started'], ['unlocks', 'Unlocks']]
    : kind === 'reader'
      ? [['impressions', 'Impressions'], ['opens', 'Opens'], ['reads', 'Reads'], ['unlocks', 'Unlocks']]
      : [['impressions', 'Impressions'], ['clicks', 'Clicks'], ['engagements', 'Engagement'], ['followers', 'Follows']]
  return <div className="bad-funnel">
    {steps.map(([key, label]) => <div className="bad-funnel-step" key={key}>
      <strong>{formatNumber(funnel?.[key])}</strong><span>{label}</span>
    </div>)}
  </div>
}
