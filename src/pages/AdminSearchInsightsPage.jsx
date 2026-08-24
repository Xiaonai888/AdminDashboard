import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  :root {
    --si-bg: #F8FAFC;
    --si-card: #FFFFFF;
    --si-primary: #4F46E5;
    --si-primary-light: #EEF2FF;
    --si-text: #0F172A;
    --si-muted: #64748B;
    --si-soft: #94A3B8;
    --si-border: #E2E8F0;
    --si-success: #10B981;
    --si-success-light: #D1FAE5;
    --si-warning: #F59E0B;
    --si-warning-light: #FEF3C7;
    --si-danger: #EF4444;
    --si-danger-light: #FEE2E2;
    --si-info: #3B82F6;
    --si-info-light: #DBEAFE;
  }

  .search-insights-page {
    color: var(--si-text);
  }

  .si-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 18px;
  }

  .si-range {
    min-height: 40px;
    border: 1px solid var(--si-border);
    border-radius: 12px;
    background: var(--si-card);
    color: #334155;
    padding: 0 36px 0 13px;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    outline: none;
    cursor: pointer;
  }

  .si-range:focus {
    border-color: var(--si-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
  }

  .si-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }

  .si-card {
    background: var(--si-card);
    border: 1px solid var(--si-border);
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  }

  .si-stat {
    padding: 18px;
    min-width: 0;
  }

  .si-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .si-stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .si-stat-icon.purple {
    color: var(--si-primary);
    background: var(--si-primary-light);
  }

  .si-stat-icon.blue {
    color: var(--si-info);
    background: var(--si-info-light);
  }

  .si-stat-icon.orange {
    color: #D97706;
    background: var(--si-warning-light);
  }

  .si-stat-icon.green {
    color: #059669;
    background: var(--si-success-light);
  }

  .si-stat-label {
    color: var(--si-muted);
    font-size: 11px;
    font-weight: 800;
  }

  .si-stat-value {
    margin-top: 10px;
    font-size: 25px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .si-stat-change {
    margin-top: 9px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 850;
  }

  .si-stat-change.up {
    color: #059669;
  }

  .si-stat-change.down {
    color: var(--si-danger);
  }

  .si-chart-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(260px, 0.9fr);
    gap: 18px;
    margin-bottom: 18px;
  }

  .si-panel {
    padding: 18px;
  }

  .si-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .si-panel-title {
    margin: 0;
    font-size: 14px;
    font-weight: 950;
  }

  .si-panel-subtitle {
    margin-top: 3px;
    color: var(--si-muted);
    font-size: 11px;
    font-weight: 700;
  }

  .si-mini-select {
    min-height: 34px;
    border: 1px solid var(--si-border);
    border-radius: 10px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 30px 0 10px;
    font: inherit;
    font-size: 11px;
    font-weight: 800;
    outline: none;
  }

  .si-trend-chart {
    width: 100%;
    min-height: 220px;
    display: block;
  }

  .si-chart-label {
    fill: #94A3B8;
    font-size: 10px;
    font-weight: 700;
  }

  .si-donut-wrap {
    min-height: 220px;
    display: grid;
    grid-template-columns: 142px minmax(0, 1fr);
    align-items: center;
    gap: 18px;
  }

  .si-donut {
    width: 136px;
    height: 136px;
    margin: 0 auto;
    border-radius: 50%;
    background:
      conic-gradient(
        #4F46E5 0 65.2%,
        #3B82F6 65.2% 80.5%,
        #F59E0B 80.5% 90.6%,
        #10B981 90.6% 97%,
        #CBD5E1 97% 100%
      );
    position: relative;
  }

  .si-donut::after {
    content: '';
    position: absolute;
    inset: 26px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: inset 0 0 0 1px #F1F5F9;
  }

  .si-legend {
    display: grid;
    gap: 11px;
  }

  .si-legend-row {
    display: grid;
    grid-template-columns: 10px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    color: #475569;
    font-size: 11px;
    font-weight: 750;
  }

  .si-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
  }

  .si-table-card {
    overflow: hidden;
    margin-bottom: 18px;
  }

  .si-tabs {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 18px;
    border-bottom: 1px solid var(--si-border);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .si-tabs::-webkit-scrollbar {
    display: none;
  }

  .si-tab {
    min-height: 50px;
    flex: 0 0 auto;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--si-muted);
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
    padding: 0 2px;
  }

  .si-tab.active {
    color: var(--si-primary);
    border-bottom-color: var(--si-primary);
  }

  .si-table-wrap {
    overflow-x: auto;
  }

  .si-table {
    width: 100%;
    min-width: 860px;
    border-collapse: collapse;
  }

  .si-table th {
    padding: 11px 12px;
    border-bottom: 1px solid var(--si-border);
    color: var(--si-muted);
    background: #FAFBFC;
    text-align: left;
    font-size: 10px;
    font-weight: 900;
    white-space: nowrap;
  }

  .si-table td {
    padding: 12px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    font-size: 11px;
    font-weight: 750;
    vertical-align: middle;
  }

  .si-table tr:last-child td {
    border-bottom: 0;
  }

  .si-table tbody tr:hover td {
    background: #FAFBFF;
  }

  .si-rank {
    width: 26px;
    color: var(--si-soft);
    font-weight: 900;
  }

  .si-term {
    min-width: 230px;
    color: var(--si-text);
    font-weight: 900;
  }

  .si-term-sub {
    margin-top: 3px;
    color: var(--si-soft);
    font-size: 10px;
    font-weight: 700;
  }

  .si-trend-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 52px;
    font-size: 10px;
    font-weight: 900;
  }

  .si-trend-pill.up {
    color: #059669;
  }

  .si-trend-pill.down {
    color: var(--si-danger);
  }

  .si-view-btn {
    min-height: 32px;
    border: 1px solid #C7D2FE;
    border-radius: 9px;
    background: var(--si-primary-light);
    color: var(--si-primary);
    padding: 0 11px;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .si-view-btn:hover {
    background: #E0E7FF;
  }

  .si-table-footer {
    min-height: 44px;
    border-top: 1px solid #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .si-view-all {
    border: 0;
    background: transparent;
    color: var(--si-primary);
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .si-bottom-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
    gap: 18px;
  }

  .si-cloud {
    min-height: 180px;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    align-items: center;
    justify-content: center;
    gap: 10px 14px;
    padding: 16px;
    background:
      radial-gradient(circle at 30% 30%, rgba(79, 70, 229, 0.06), transparent 45%),
      #FFFFFF;
    border-radius: 13px;
    border: 1px solid #F1F5F9;
  }

  .si-word {
    color: var(--si-primary);
    font-weight: 900;
    line-height: 1;
  }

  .si-insight-list {
    display: grid;
    gap: 12px;
  }

  .si-insight {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 11px;
    align-items: start;
  }

  .si-insight-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: var(--si-primary-light);
    color: var(--si-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .si-insight-text {
    color: #475569;
    font-size: 11px;
    font-weight: 750;
    line-height: 1.55;
  }

  .si-selected {
    margin-top: 14px;
    border: 1px solid #C7D2FE;
    border-radius: 12px;
    background: #F8FAFF;
    padding: 11px 12px;
    color: #4338CA;
    font-size: 11px;
    font-weight: 850;
  }

  .si-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22px;
    background: rgba(15, 23, 42, 0.46);
    backdrop-filter: blur(4px);
  }

  .si-modal {
    width: min(660px, 100%);
    max-height: min(86vh, 780px);
    overflow-y: auto;
    background: #FFFFFF;
    border: 1px solid var(--si-border);
    border-radius: 20px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
  }

  .si-modal-head {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    background: rgba(255, 255, 255, 0.97);
    border-bottom: 1px solid var(--si-border);
    backdrop-filter: blur(12px);
  }

  .si-modal-title {
    margin: 0;
    color: var(--si-text);
    font-size: 17px;
    font-weight: 950;
  }

  .si-modal-subtitle {
    margin-top: 4px;
    color: var(--si-muted);
    font-size: 11px;
    font-weight: 750;
  }

  .si-modal-close {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border: 1px solid var(--si-border);
    border-radius: 10px;
    background: #FFFFFF;
    color: #64748B;
    font: inherit;
    font-size: 18px;
    font-weight: 800;
    cursor: pointer;
  }

  .si-modal-body {
    display: grid;
    gap: 16px;
    padding: 20px;
  }

  .si-detail-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .si-detail-card {
    min-width: 0;
    border: 1px solid var(--si-border);
    border-radius: 13px;
    background: #F8FAFC;
    padding: 12px;
  }

  .si-detail-label {
    color: var(--si-muted);
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .si-detail-value {
    margin-top: 5px;
    color: var(--si-text);
    font-size: 16px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .si-manage-section {
    border: 1px solid var(--si-border);
    border-radius: 15px;
    padding: 14px;
  }

  .si-manage-title {
    color: var(--si-text);
    font-size: 12px;
    font-weight: 950;
    margin-bottom: 10px;
  }

  .si-alias-list {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .si-alias-pill {
    border: 1px solid #E0E7FF;
    border-radius: 999px;
    background: #F8FAFF;
    color: #4338CA;
    padding: 6px 9px;
    font-size: 10px;
    font-weight: 850;
  }

  .si-manage-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
  }

  .si-manage-input,
  .si-manage-select {
    width: 100%;
    min-width: 0;
    height: 39px;
    border: 1px solid var(--si-border);
    border-radius: 11px;
    background: #FFFFFF;
    color: var(--si-text);
    padding: 0 11px;
    font: inherit;
    font-size: 11px;
    font-weight: 800;
    outline: none;
  }

  .si-manage-input:focus,
  .si-manage-select:focus {
    border-color: var(--si-primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
  }

  .si-action-btn {
    min-height: 39px;
    border: 0;
    border-radius: 11px;
    padding: 0 13px;
    font: inherit;
    font-size: 10px;
    font-weight: 950;
    cursor: pointer;
    white-space: nowrap;
  }

  .si-action-btn.primary {
    background: var(--si-primary);
    color: #FFFFFF;
  }

  .si-action-btn.secondary {
    border: 1px solid #C7D2FE;
    background: var(--si-primary-light);
    color: var(--si-primary);
  }

  .si-action-btn.danger {
    border: 1px solid #FECACA;
    background: #FEF2F2;
    color: #B91C1C;
  }

  .si-action-btn:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .si-action-message {
    border: 1px solid #FDE68A;
    border-radius: 11px;
    background: #FFFBEB;
    color: #92400E;
    padding: 9px 10px;
    font-size: 10px;
    font-weight: 850;
    line-height: 1.5;
  }

  @media (max-width: 1100px) {
    .si-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .si-chart-grid,
    .si-bottom-grid {
      grid-template-columns: 1fr;
    }

    .si-donut-wrap {
      grid-template-columns: 180px minmax(0, 1fr);
    }
  }

  @media (max-width: 680px) {
    .si-toolbar {
      justify-content: stretch;
    }

    .si-range {
      width: 100%;
    }

    .si-stats {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .si-chart-grid,
    .si-bottom-grid {
      gap: 12px;
    }

    .si-panel {
      padding: 15px;
    }

    .si-panel-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .si-trend-chart {
      min-height: 190px;
    }

    .si-donut-wrap {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .si-legend {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .si-tabs {
      gap: 18px;
      padding: 0 14px;
    }

    .si-tab {
      min-height: 46px;
    }

    .si-modal-backdrop {
      align-items: flex-end;
      padding: 0;
    }

    .si-modal {
      width: 100%;
      max-height: 92vh;
      border-radius: 20px 20px 0 0;
    }

    .si-detail-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .si-manage-row {
      grid-template-columns: 1fr;
    }

    .si-action-btn {
      width: 100%;
    }
  }
`

const Icon = ({ d, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
)

const STAT_DEFINITIONS = [
  {
    key: 'searches',
    label: 'Searches',
    tone: 'purple',
    positiveIsGood: true,
    changeKey: 'searches_change',
    icon: 'M11 3a8 8 0 1 0 4.9 14.3L21 22l1-1-4.7-5.1A8 8 0 0 0 11 3z',
  },
  {
    key: 'unique_terms',
    label: 'Unique Terms',
    tone: 'blue',
    positiveIsGood: true,
    changeKey: 'unique_terms_change',
    icon: 'M4 4h16v16H4z M8 8h8 M8 12h5 M8 16h7',
  },
  {
    key: 'no_result_searches',
    label: 'No Result Searches',
    tone: 'orange',
    positiveIsGood: false,
    changeKey: 'no_result_change',
    icon: 'M12 9v4 M12 17h.01 M10.3 3.7L2.4 17.4A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.6L13.7 3.7a2 2 0 0 0-3.4 0z',
  },
  {
    key: 'ctr',
    label: 'Click-Through Rate',
    tone: 'green',
    positiveIsGood: true,
    changeKey: '',
    icon: 'M6 3l12 8-5 2 3 6-2 1-3-6-5 4z',
  },
]

const TYPE_META = {
  all: { label: 'All', color: '#4F46E5' },
  stories: { label: 'Stories', color: '#6366F1' },
  pdfs: { label: 'PDF Books', color: '#3B82F6' },
  readers: { label: 'Readers', color: '#F59E0B' },
  pages: { label: 'Pages', color: '#10B981' },
  posts: { label: 'Posts', color: '#94A3B8' },
}

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token')
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function formatPercent(value) {
  const number = Number(value || 0)
  return `${number.toFixed(number % 1 === 0 ? 0 : 1)}%`
}

function getChangeMeta(value, positiveIsGood) {
  const number = Number(value || 0)
  const good = positiveIsGood ? number >= 0 : number <= 0

  return {
    arrow: number >= 0 ? '↗' : '↘',
    value: `${number >= 0 ? '+' : ''}${number.toFixed(1)}%`,
    direction: good ? 'up' : 'down',
  }
}

function formatChartDate(value) {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) return String(value || '')

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getNiceMax(values) {
  const maxValue = Math.max(...values, 0)

  if (maxValue <= 1) return 1

  const magnitude = 10 ** Math.floor(Math.log10(maxValue))
  const normalized = maxValue / magnitude

  if (normalized <= 1) return 1 * magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 5) return 5 * magnitude

  return 10 * magnitude
}

function getChartGeometry(values) {
  const width = 720
  const height = 220
  const padX = 42
  const padTop = 16
  const padBottom = 34
  const max = getNiceMax(values)
  const innerWidth = width - padX * 2
  const innerHeight = height - padTop - padBottom
  const count = Math.max(values.length, 1)

  const points = values.map((value, index) => {
    const x =
      count === 1
        ? padX + innerWidth / 2
        : padX + (innerWidth * index) / (count - 1)
    const y =
      padTop +
      innerHeight -
      (Number(value || 0) / max) * innerHeight

    return { x, y }
  })

  const line = points
    .map((point) => `${point.x},${point.y}`)
    .join(' ')

  const area =
    points.length > 0
      ? [
          `M ${points[0].x} ${padTop + innerHeight}`,
          ...points.map(
            (point) => `L ${point.x} ${point.y}`
          ),
          `L ${points[points.length - 1].x} ${
            padTop + innerHeight
          }`,
          'Z',
        ].join(' ')
      : ''

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => Math.round(max * ratio)
  )

  return {
    width,
    height,
    padX,
    padTop,
    padBottom,
    innerHeight,
    points,
    line,
    area,
    max,
    ticks,
  }
}

function getDonutBackground(types) {
  if (!types.length) return '#E2E8F0'

  let cursor = 0
  const parts = []

  for (const item of types) {
    const percentage = Math.max(
      0,
      Number(item.percentage || 0)
    )
    const start = cursor
    const end = Math.min(100, cursor + percentage)

    parts.push(
      `${item.color} ${start}% ${end}%`
    )

    cursor = end
  }

  if (cursor < 100) {
    parts.push(`#E2E8F0 ${cursor}% 100%`)
  }

  return `conic-gradient(${parts.join(', ')})`
}

function getGroupLabel(group) {
  const seen = new Set()
  const terms = []

  const add = (value) => {
    const term = String(value || '').trim()
    const key = term.toLocaleLowerCase()

    if (!term || seen.has(key)) return

    seen.add(key)
    terms.push(term)
  }

  add(group?.term)

  for (const alias of group?.aliases || []) {
    add(alias?.term)
  }

  return terms.slice(0, 4).join(', ')
}

function buildInsights(groups) {
  if (!groups.length) {
    return [
      'Search data will appear here after readers start using Discover Search.',
    ]
  }

  const noResult = [...groups]
    .filter((item) => Number(item.no_result_searches || 0) > 0)
    .sort(
      (a, b) =>
        Number(b.no_result_searches || 0) -
        Number(a.no_result_searches || 0)
    )[0]

  const trending = [...groups]
    .filter((item) => Number(item.trend_percent || 0) > 0)
    .sort(
      (a, b) =>
        Number(b.trend_percent || 0) -
        Number(a.trend_percent || 0)
    )[0]

  const clicked = [...groups]
    .filter((item) => Number(item.clicks || 0) > 0)
    .sort(
      (a, b) =>
        Number(b.ctr || 0) -
        Number(a.ctr || 0)
    )[0]

  const items = []

  if (noResult) {
    items.push(
      `${getGroupLabel(noResult)} has ${formatNumber(
        noResult.no_result_searches
      )} searches with no result in this period.`
    )
  }

  if (trending) {
    items.push(
      `${getGroupLabel(trending)} increased ${formatPercent(
        Math.abs(Number(trending.trend_percent || 0))
      )} compared with the previous period.`
    )
  }

  if (clicked) {
    items.push(
      `${getGroupLabel(clicked)} currently has the strongest click-through rate at ${formatPercent(
        clicked.ctr
      )}.`
    )
  } else {
    items.push(
      'Click-through data will appear after search result click tracking is connected.'
    )
  }

  return items.slice(0, 3)
}

export default function AdminSearchInsightsPage() {
  const [range, setRange] = useState('30')
  const [tab, setTab] = useState('top')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadInsights() {
      try {
        setLoading(true)
        setMessage('')

        const token = getAdminToken()
        const response = await fetch(
          `${API_URL}/api/admin/search-insights?days=${range}`,
          {
            headers: {
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            signal: controller.signal,
          }
        )

        const result = await response
          .json()
          .catch(() => ({}))

        if (!response.ok || result.ok === false) {
          throw new Error(
            result.message ||
              'Failed to load search insights'
          )
        }

        setData(result)
      } catch (error) {
        if (error?.name === 'AbortError') return

        setData(null)
        setMessage(
          error?.message ||
            'Failed to load search insights'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadInsights()

    return () => controller.abort()
  }, [range, refreshKey])

  function openGroupManager(row) {
    setSelectedGroup(row)
    setRenameValue(row.canonicalTerm || row.term || '')
    setMergeTargetId('')
    setActionMessage('')
  }

  function closeGroupManager() {
    if (actionLoading) return

    setSelectedGroup(null)
    setRenameValue('')
    setMergeTargetId('')
    setActionMessage('')
  }

  async function runGroupAction(path, options = {}) {
    try {
      setActionLoading(true)
      setActionMessage('')

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}${path}`,
        {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
            ...(options.headers || {}),
          },
        }
      )

      const result = await response
        .json()
        .catch(() => ({}))

      if (!response.ok || result.ok === false) {
        throw new Error(
          result.message || 'Search group action failed'
        )
      }

      setSelectedGroup(null)
      setRenameValue('')
      setMergeTargetId('')
      setRefreshKey((value) => value + 1)
    } catch (error) {
      setActionMessage(
        error?.message || 'Search group action failed'
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function renameSelectedGroup() {
    const groupId = Number(selectedGroup?.id)
    const canonicalTerm = renameValue.trim()

    if (!groupId || !canonicalTerm) {
      setActionMessage('Enter a valid group name.')
      return
    }

    await runGroupAction(
      `/api/admin/search-insights/groups/${groupId}/rename`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          canonical_term: canonicalTerm,
        }),
      }
    )
  }

  async function mergeSelectedGroup() {
    const sourceGroupId = Number(selectedGroup?.id)
    const targetGroupId = Number(mergeTargetId)

    if (!sourceGroupId || !targetGroupId) {
      setActionMessage('Choose a target group first.')
      return
    }

    if (sourceGroupId === targetGroupId) {
      setActionMessage('Source and target cannot be the same group.')
      return
    }

    if (!window.confirm('Merge this group into the selected target?')) {
      return
    }

    await runGroupAction(
      `/api/admin/search-insights/groups/${sourceGroupId}/merge`,
      {
        method: 'POST',
        body: JSON.stringify({
          target_group_id: targetGroupId,
        }),
      }
    )
  }

  async function ignoreSelectedGroup() {
    const groupId = Number(selectedGroup?.id)

    if (!groupId) return

    if (!window.confirm('Ignore this search group and hide it from analytics?')) {
      return
    }

    await runGroupAction(
      `/api/admin/search-insights/groups/${groupId}/ignore`,
      {
        method: 'PATCH',
        body: JSON.stringify({ ignored: true }),
      }
    )
  }

  const summary = data?.summary || {}
  const trend = Array.isArray(data?.trend)
    ? data.trend
    : []
  const groups = Array.isArray(data?.groups)
    ? data.groups
    : []
  const rawTypes = Array.isArray(data?.types)
    ? data.types
    : []

  const stats = useMemo(
    () =>
      STAT_DEFINITIONS.map((definition) => {
        const isCtr = definition.key === 'ctr'
        const change = definition.changeKey
          ? getChangeMeta(
              summary[definition.changeKey],
              definition.positiveIsGood
            )
          : null

        return {
          ...definition,
          value: isCtr
            ? formatPercent(summary[definition.key])
            : formatNumber(summary[definition.key]),
          change,
        }
      }),
    [summary]
  )

  const searchRows = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        canonicalTerm: String(group.term || ''),
        term: getGroupLabel(group),
        aliases: Array.isArray(group.aliases)
          ? group.aliases
          : [],
        searches: Number(group.searches || 0),
        users: Number(group.unique_searchers || 0),
        noResults: Number(
          group.no_result_searches || 0
        ),
        clicks: Number(group.clicks || 0),
        ctr: Number(group.ctr || 0),
        trend: Number(group.trend_percent || 0),
      })),
    [groups]
  )

  const rows = useMemo(() => {
    const list = [...searchRows]

    if (tab === 'no-result') {
      return list.sort(
        (a, b) => b.noResults - a.noResults
      )
    }

    if (tab === 'trending') {
      return list.sort(
        (a, b) => b.trend - a.trend
      )
    }

    if (tab === 'clicked') {
      return list.sort(
        (a, b) =>
          b.clicks - a.clicks || b.ctr - a.ctr
      )
    }

    return list.sort(
      (a, b) => b.searches - a.searches
    )
  }, [searchRows, tab])

  const chartValues = useMemo(
    () =>
      trend.map((item) =>
        Number(item.searches || 0)
      ),
    [trend]
  )

  const geometry = useMemo(
    () => getChartGeometry(chartValues),
    [chartValues]
  )

  const chartLabelInterval = Math.max(
    1,
    Math.ceil(trend.length / 6)
  )

  const searchTypes = useMemo(
    () =>
      rawTypes.map((item) => {
        const meta =
          TYPE_META[item.type] || {
            label: String(item.type || 'Other'),
            color: '#CBD5E1',
          }

        return {
          ...item,
          label: meta.label,
          color: meta.color,
          value: formatPercent(item.percentage),
        }
      }),
    [rawTypes]
  )

  const donutBackground = useMemo(
    () => getDonutBackground(searchTypes),
    [searchTypes]
  )

  const cloudWords = useMemo(() => {
    const top = [...groups]
      .sort(
        (a, b) =>
          Number(b.searches || 0) -
          Number(a.searches || 0)
      )
      .slice(0, 14)

    const maxSearches = Math.max(
      ...top.map((item) =>
        Number(item.searches || 0)
      ),
      1
    )

    return top.map((item) => {
      const ratio =
        Number(item.searches || 0) / maxSearches

      return [
        String(item.term || ''),
        Math.round(12 + ratio * 18),
      ]
    })
  }, [groups])

  const insights = useMemo(
    () => buildInsights(groups),
    [groups]
  )

  return (
    <AdminLayout
      title="Search Insights"
      subtitle="Understand what readers are searching for across Shadow."
    >
      <style>{styles}</style>

      <div className="search-insights-page">
        <div className="si-toolbar">
          <select
            className="si-range"
            value={range}
            onChange={(event) =>
              setRange(event.target.value)
            }
            aria-label="Search insight period"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {message ? (
          <section
            className="si-card si-panel"
            style={{
              marginBottom: 18,
              color: '#B91C1C',
              background: '#FEF2F2',
              borderColor: '#FECACA',
            }}
          >
            {message}
          </section>
        ) : null}

        {loading ? (
          <section
            className="si-card si-panel"
            style={{
              minHeight: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              fontWeight: 850,
            }}
          >
            Loading search insights...
          </section>
        ) : (
          <>
            <div className="si-stats">
              {stats.map((item) => (
                <section
                  className="si-card si-stat"
                  key={item.label}
                >
                  <div className="si-stat-top">
                    <div>
                      <div className="si-stat-label">
                        {item.label}
                      </div>
                      <div className="si-stat-value">
                        {item.value}
                      </div>
                    </div>

                    <div
                      className={`si-stat-icon ${item.tone}`}
                    >
                      <Icon
                        d={item.icon}
                        size={17}
                      />
                    </div>
                  </div>

                  {item.change ? (
                    <div
                      className={`si-stat-change ${item.change.direction}`}
                    >
                      <span>{item.change.arrow}</span>
                      <span>{item.change.value}</span>
                      <span
                        style={{
                          color: '#94A3B8',
                          fontWeight: 750,
                        }}
                      >
                        vs previous period
                      </span>
                    </div>
                  ) : (
                    <div
                      className="si-stat-change"
                      style={{ color: '#94A3B8' }}
                    >
                      Current period
                    </div>
                  )}
                </section>
              ))}
            </div>

            <div className="si-chart-grid">
              <section className="si-card si-panel">
                <div className="si-panel-header">
                  <div>
                    <h3 className="si-panel-title">
                      Search Trend
                    </h3>
                    <div className="si-panel-subtitle">
                      Reader search activity over time
                    </div>
                  </div>
                </div>

                {trend.length === 0 ? (
                  <div
                    style={{
                      minHeight: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    No search activity yet.
                  </div>
                ) : (
                  <svg
                    className="si-trend-chart"
                    viewBox={`0 0 ${geometry.width} ${geometry.height}`}
                    role="img"
                    aria-label="Search trend line chart"
                  >
                    <defs>
                      <linearGradient
                        id="siAreaFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4F46E5"
                          stopOpacity="0.18"
                        />
                        <stop
                          offset="100%"
                          stopColor="#4F46E5"
                          stopOpacity="0.02"
                        />
                      </linearGradient>
                    </defs>

                    {geometry.ticks.map((value) => {
                      const y =
                        geometry.padTop +
                        geometry.innerHeight -
                        (value / geometry.max) *
                          geometry.innerHeight

                      return (
                        <g key={value}>
                          <line
                            x1={geometry.padX}
                            y1={y}
                            x2={
                              geometry.width -
                              geometry.padX
                            }
                            y2={y}
                            stroke="#EEF2F7"
                            strokeWidth="1"
                          />
                          <text
                            x="2"
                            y={y + 3}
                            className="si-chart-label"
                          >
                            {value}
                          </text>
                        </g>
                      )
                    })}

                    <path
                      d={geometry.area}
                      fill="url(#siAreaFill)"
                    />

                    <polyline
                      points={geometry.line}
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {geometry.points.map(
                      (point, index) => {
                        const showLabel =
                          index %
                            chartLabelInterval ===
                            0 ||
                          index ===
                            geometry.points.length -
                              1

                        return (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="3.2"
                              fill="#FFFFFF"
                              stroke="#4F46E5"
                              strokeWidth="2"
                            />

                            {showLabel ? (
                              <text
                                x={point.x}
                                y={
                                  geometry.height - 8
                                }
                                textAnchor="middle"
                                className="si-chart-label"
                              >
                                {formatChartDate(
                                  trend[index]?.date
                                )}
                              </text>
                            ) : null}
                          </g>
                        )
                      }
                    )}
                  </svg>
                )}
              </section>

              <section className="si-card si-panel">
                <div className="si-panel-header">
                  <div>
                    <h3 className="si-panel-title">
                      Search by Type
                    </h3>
                    <div className="si-panel-subtitle">
                      Which Discover filters readers use
                    </div>
                  </div>
                </div>

                <div className="si-donut-wrap">
                  <div
                    className="si-donut"
                    aria-label="Search type donut chart"
                    style={{
                      background:
                        donutBackground,
                    }}
                  />

                  <div className="si-legend">
                    {searchTypes.length === 0 ? (
                      <div
                        style={{
                          color: '#94A3B8',
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        No type data yet.
                      </div>
                    ) : (
                      searchTypes.map((item) => (
                        <div
                          className="si-legend-row"
                          key={item.type}
                        >
                          <span
                            className="si-dot"
                            style={{
                              background:
                                item.color,
                            }}
                          />
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section className="si-card si-table-card">
              <div className="si-tabs">
                {[
                  ['top', 'Top Search Terms'],
                  [
                    'no-result',
                    'No Result Searches',
                  ],
                  ['trending', 'Trending Up'],
                  ['clicked', 'Most Clicked'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`si-tab ${
                      tab === key ? 'active' : ''
                    }`}
                    onClick={() => setTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="si-table-wrap">
                <table className="si-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Search Term Group</th>
                      <th>Searches</th>
                      <th>Unique Users</th>
                      <th>No Results</th>
                      <th>CTR</th>
                      <th>Trend</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{
                            textAlign: 'center',
                            color: '#94A3B8',
                            padding: 28,
                          }}
                        >
                          No search data yet.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, index) => (
                        <tr key={row.id || row.term}>
                          <td className="si-rank">
                            {index + 1}
                          </td>
                          <td className="si-term">
                            {row.term}
                            <div className="si-term-sub">
                              Grouped similar search
                              terms
                            </div>
                          </td>
                          <td>
                            {formatNumber(
                              row.searches
                            )}
                          </td>
                          <td>
                            {formatNumber(row.users)}
                          </td>
                          <td>
                            {formatNumber(
                              row.noResults
                            )}
                          </td>
                          <td>
                            {formatPercent(row.ctr)}
                          </td>
                          <td>
                            <span
                              className={`si-trend-pill ${
                                row.trend >= 0
                                  ? 'up'
                                  : 'down'
                              }`}
                            >
                              <span>
                                {row.trend >= 0
                                  ? '↗'
                                  : '↘'}
                              </span>
                              <span>
                                {formatPercent(
                                  Math.abs(
                                    row.trend
                                  )
                                )}
                              </span>
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="si-view-btn"
                              onClick={() =>
                                openGroupManager(row)
                              }
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="si-table-footer">
                <div
                  style={{
                    color: '#94A3B8',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  Showing {rows.length} search groups
                </div>
              </div>
            </section>

            <div className="si-bottom-grid">
              <section className="si-card si-panel">
                <div className="si-panel-header">
                  <div>
                    <h3 className="si-panel-title">
                      Popular Searches
                    </h3>
                    <div className="si-panel-subtitle">
                      Grouped demand from the
                      selected period
                    </div>
                  </div>
                </div>

                <div className="si-cloud">
                  {cloudWords.length === 0 ? (
                    <span
                      style={{
                        color: '#94A3B8',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      No popular searches yet.
                    </span>
                  ) : (
                    cloudWords.map(
                      ([word, size], index) => (
                        <span
                          className="si-word"
                          key={`${word}-${index}`}
                          style={{
                            fontSize: `${size}px`,
                            opacity:
                              0.58 +
                              (index % 5) * 0.09,
                          }}
                        >
                          {word}
                        </span>
                      )
                    )
                  )}
                </div>
              </section>

              <section className="si-card si-panel">
                <div className="si-panel-header">
                  <div>
                    <h3 className="si-panel-title">
                      Insights
                    </h3>
                    <div className="si-panel-subtitle">
                      Quick signals from reader
                      demand
                    </div>
                  </div>
                </div>

                <div className="si-insight-list">
                  {insights.map(
                    (insight, index) => (
                      <div
                        className="si-insight"
                        key={`${index}-${insight}`}
                      >
                        <div className="si-insight-icon">
                          <Icon
                            d={
                              index === 0
                                ? 'M12 2v20 M5 9l7-7 7 7'
                                : index === 1
                                  ? 'M3 17l6-6 4 4 8-9'
                                  : 'M6 3l12 8-5 2 3 6-2 1-3-6-5 4z'
                            }
                            size={15}
                          />
                        </div>
                        <div className="si-insight-text">
                          {insight}
                        </div>
                      </div>
                    )
                  )}
                </div>

              </section>
            </div>
          </>
        )}
        {selectedGroup ? (
          <div
            className="si-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeGroupManager()
              }
            }}
          >
            <section className="si-modal">
              <div className="si-modal-head">
                <div>
                  <h2 className="si-modal-title">
                    Manage Search Group
                  </h2>
                  <div className="si-modal-subtitle">
                    {selectedGroup.term}
                  </div>
                </div>

                <button
                  type="button"
                  className="si-modal-close"
                  onClick={closeGroupManager}
                  disabled={actionLoading}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="si-modal-body">
                <div className="si-detail-grid">
                  <div className="si-detail-card">
                    <div className="si-detail-label">Searches</div>
                    <div className="si-detail-value">
                      {formatNumber(selectedGroup.searches)}
                    </div>
                  </div>
                  <div className="si-detail-card">
                    <div className="si-detail-label">Unique Users</div>
                    <div className="si-detail-value">
                      {formatNumber(selectedGroup.users)}
                    </div>
                  </div>
                  <div className="si-detail-card">
                    <div className="si-detail-label">No Results</div>
                    <div className="si-detail-value">
                      {formatNumber(selectedGroup.noResults)}
                    </div>
                  </div>
                  <div className="si-detail-card">
                    <div className="si-detail-label">CTR</div>
                    <div className="si-detail-value">
                      {formatPercent(selectedGroup.ctr)}
                    </div>
                  </div>
                </div>

                <div className="si-manage-section">
                  <div className="si-manage-title">Aliases in this group</div>
                  <div className="si-alias-list">
                    {selectedGroup.aliases.length > 0 ? (
                      selectedGroup.aliases.map((alias) => (
                        <span
                          className="si-alias-pill"
                          key={alias.normalized_term || alias.term}
                        >
                          {alias.term}
                        </span>
                      ))
                    ) : (
                      <span className="si-alias-pill">
                        {selectedGroup.canonicalTerm}
                      </span>
                    )}
                  </div>
                </div>

                <div className="si-manage-section">
                  <div className="si-manage-title">Rename group</div>
                  <div className="si-manage-row">
                    <input
                      className="si-manage-input"
                      value={renameValue}
                      onChange={(event) =>
                        setRenameValue(event.target.value)
                      }
                      maxLength={120}
                      placeholder="Canonical group name"
                    />
                    <button
                      type="button"
                      className="si-action-btn primary"
                      onClick={renameSelectedGroup}
                      disabled={actionLoading}
                    >
                      Save Name
                    </button>
                  </div>
                </div>

                <div className="si-manage-section">
                  <div className="si-manage-title">Merge duplicate group</div>
                  <div className="si-manage-row">
                    <select
                      className="si-manage-select"
                      value={mergeTargetId}
                      onChange={(event) =>
                        setMergeTargetId(event.target.value)
                      }
                    >
                      <option value="">Choose target group</option>
                      {searchRows
                        .filter(
                          (item) =>
                            Number(item.id) !==
                            Number(selectedGroup.id)
                        )
                        .map((item) => (
                          <option
                            value={item.id}
                            key={item.id}
                          >
                            {item.term}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="si-action-btn secondary"
                      onClick={mergeSelectedGroup}
                      disabled={actionLoading || !mergeTargetId}
                    >
                      Merge
                    </button>
                  </div>
                </div>

                <div className="si-manage-section">
                  <div className="si-manage-title">Spam / unwanted search</div>
                  <button
                    type="button"
                    className="si-action-btn danger"
                    onClick={ignoreSelectedGroup}
                    disabled={actionLoading}
                  >
                    Ignore This Group
                  </button>
                </div>

                {actionMessage ? (
                  <div className="si-action-message">
                    {actionMessage}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  )
}
