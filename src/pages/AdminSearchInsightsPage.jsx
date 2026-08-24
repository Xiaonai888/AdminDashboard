import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

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

const stats = [
  {
    label: 'Searches',
    value: '12,456',
    change: '+16.6%',
    direction: 'up',
    tone: 'purple',
    icon: 'M11 3a8 8 0 1 0 4.9 14.3L21 22l1-1-4.7-5.1A8 8 0 0 0 11 3z',
  },
  {
    label: 'Unique Terms',
    value: '1,248',
    change: '+12.1%',
    direction: 'up',
    tone: 'blue',
    icon: 'M4 4h16v16H4z M8 8h8 M8 12h5 M8 16h7',
  },
  {
    label: 'No Result Searches',
    value: '342',
    change: '+21.7%',
    direction: 'down',
    tone: 'orange',
    icon: 'M12 9v4 M12 17h.01 M10.3 3.7L2.4 17.4A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.6L13.7 3.7a2 2 0 0 0-3.4 0z',
  },
  {
    label: 'Click-Through Rate',
    value: '24.8%',
    change: '+5.4%',
    direction: 'up',
    tone: 'green',
    icon: 'M6 3l12 8-5 2 3 6-2 1-3-6-5 4z',
  },
]

const searchRows = [
  { term: 'romance, love, ស្នេហា', searches: 1245, users: 892, noResults: 23, ctr: 28.4, trend: 18.2 },
  { term: 'zombie, zombies, ខ្មោចឆៅ', searches: 982, users: 721, noResults: 412, ctr: 6.3, trend: -8.4 },
  { term: 'isekai, អ៊ីសេកៃ', searches: 768, users: 612, noResults: 301, ctr: 9.1, trend: 32.1 },
  { term: 'time travel, ឆ្លងពេលវេលា', searches: 645, users: 498, noResults: 144, ctr: 21.7, trend: 14.6 },
  { term: 'bl, boys love, ប្រុសស្រឡាញ់ប្រុស', searches: 522, users: 410, noResults: 67, ctr: 30.1, trend: 11.5 },
  { term: 'fantasy, ហ្វេនតាស៊ី', searches: 498, users: 389, noResults: 58, ctr: 32.9, trend: 16.7 },
  { term: 'revenge, សងសឹក', searches: 421, users: 320, noResults: 96, ctr: 18.5, trend: -4.1 },
  { term: 'historical, ប្រវត្តិសាស្ត្រ', searches: 387, users: 298, noResults: 72, ctr: 19.1, trend: 8.3 },
]

const chartValues = [180, 410, 630, 390, 440, 410, 590, 510, 690, 760, 490, 620, 480, 710, 560, 650]
const chartLabels = ['Jul 26', '', 'Jul 31', '', 'Aug 5', '', 'Aug 10', '', 'Aug 15', '', 'Aug 19', '', 'Aug 22', '', 'Aug 24', '']

const searchTypes = [
  { label: 'Stories', value: '65.2%', color: '#4F46E5' },
  { label: 'PDF Books', value: '15.3%', color: '#3B82F6' },
  { label: 'Readers', value: '10.1%', color: '#F59E0B' },
  { label: 'Pages', value: '6.4%', color: '#10B981' },
  { label: 'Posts', value: '3.0%', color: '#CBD5E1' },
]

const cloudWords = [
  ['romance', 31],
  ['zombie', 26],
  ['isekai', 17],
  ['fantasy', 14],
  ['bl', 13],
  ['historical', 12],
  ['revenge', 11],
  ['time travel', 13],
  ['school', 10],
  ['system', 11],
  ['magic', 12],
  ['gl', 10],
  ['khmer', 12],
  ['ghost', 11],
]

function getChartGeometry() {
  const width = 720
  const height = 220
  const padX = 36
  const padTop = 16
  const padBottom = 34
  const max = 900
  const innerWidth = width - padX * 2
  const innerHeight = height - padTop - padBottom

  const points = chartValues.map((value, index) => {
    const x = padX + (innerWidth * index) / (chartValues.length - 1)
    const y = padTop + innerHeight - (value / max) * innerHeight
    return { x, y }
  })

  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = [
    `M ${points[0].x} ${padTop + innerHeight}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${padTop + innerHeight}`,
    'Z',
  ].join(' ')

  return { width, height, padX, padTop, padBottom, innerHeight, points, line, area }
}

export default function AdminSearchInsightsPage() {
  const [range, setRange] = useState('30')
  const [tab, setTab] = useState('top')
  const [selectedTerm, setSelectedTerm] = useState('')
  const geometry = useMemo(() => getChartGeometry(), [])

  const rows = useMemo(() => {
    const list = [...searchRows]

    if (tab === 'no-result') {
      return list.sort((a, b) => b.noResults - a.noResults)
    }

    if (tab === 'trending') {
      return list.sort((a, b) => b.trend - a.trend)
    }

    if (tab === 'clicked') {
      return list.sort((a, b) => b.ctr - a.ctr)
    }

    return list.sort((a, b) => b.searches - a.searches)
  }, [tab])

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
            onChange={(event) => setRange(event.target.value)}
            aria-label="Search insight period"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="si-stats">
          {stats.map((item) => (
            <section className="si-card si-stat" key={item.label}>
              <div className="si-stat-top">
                <div>
                  <div className="si-stat-label">{item.label}</div>
                  <div className="si-stat-value">{item.value}</div>
                </div>

                <div className={`si-stat-icon ${item.tone}`}>
                  <Icon d={item.icon} size={17} />
                </div>
              </div>

              <div className={`si-stat-change ${item.direction}`}>
                <span>{item.direction === 'up' ? '↗' : '↘'}</span>
                <span>{item.change}</span>
                <span style={{ color: '#94A3B8', fontWeight: 750 }}>
                  vs previous period
                </span>
              </div>
            </section>
          ))}
        </div>

        <div className="si-chart-grid">
          <section className="si-card si-panel">
            <div className="si-panel-header">
              <div>
                <h3 className="si-panel-title">Search Trend</h3>
                <div className="si-panel-subtitle">Reader search activity over time</div>
              </div>

              <select className="si-mini-select" defaultValue="daily" aria-label="Chart interval">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <svg
              className="si-trend-chart"
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
              role="img"
              aria-label="Search trend line chart"
            >
              <defs>
                <linearGradient id="siAreaFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {[0, 200, 400, 600, 800].map((value) => {
                const y = geometry.padTop + geometry.innerHeight - (value / 900) * geometry.innerHeight

                return (
                  <g key={value}>
                    <line
                      x1={geometry.padX}
                      y1={y}
                      x2={geometry.width - geometry.padX}
                      y2={y}
                      stroke="#EEF2F7"
                      strokeWidth="1"
                    />
                    <text x="2" y={y + 3} className="si-chart-label">
                      {value}
                    </text>
                  </g>
                )
              })}

              <path d={geometry.area} fill="url(#siAreaFill)" />
              <polyline
                points={geometry.line}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {geometry.points.map((point, index) => (
                <g key={index}>
                  <circle cx={point.x} cy={point.y} r="3.2" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="2" />
                  {chartLabels[index] ? (
                    <text
                      x={point.x}
                      y={geometry.height - 8}
                      textAnchor="middle"
                      className="si-chart-label"
                    >
                      {chartLabels[index]}
                    </text>
                  ) : null}
                </g>
              ))}
            </svg>
          </section>

          <section className="si-card si-panel">
            <div className="si-panel-header">
              <div>
                <h3 className="si-panel-title">Search by Type</h3>
                <div className="si-panel-subtitle">Where search demand is concentrated</div>
              </div>
            </div>

            <div className="si-donut-wrap">
              <div className="si-donut" aria-label="Search type donut chart" />

              <div className="si-legend">
                {searchTypes.map((item) => (
                  <div className="si-legend-row" key={item.label}>
                    <span className="si-dot" style={{ background: item.color }} />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="si-card si-table-card">
          <div className="si-tabs">
            {[
              ['top', 'Top Search Terms'],
              ['no-result', 'No Result Searches'],
              ['trending', 'Trending Up'],
              ['clicked', 'Most Clicked'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`si-tab ${tab === key ? 'active' : ''}`}
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
                {rows.map((row, index) => (
                  <tr key={row.term}>
                    <td className="si-rank">{index + 1}</td>
                    <td className="si-term">
                      {row.term}
                      <div className="si-term-sub">Grouped similar search terms</div>
                    </td>
                    <td>{row.searches.toLocaleString()}</td>
                    <td>{row.users.toLocaleString()}</td>
                    <td>{row.noResults.toLocaleString()}</td>
                    <td>{row.ctr.toFixed(1)}%</td>
                    <td>
                      <span className={`si-trend-pill ${row.trend >= 0 ? 'up' : 'down'}`}>
                        <span>{row.trend >= 0 ? '↗' : '↘'}</span>
                        <span>{Math.abs(row.trend).toFixed(1)}%</span>
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="si-view-btn"
                        onClick={() => setSelectedTerm(row.term)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="si-table-footer">
            <button type="button" className="si-view-all">
              View All
            </button>
          </div>
        </section>

        <div className="si-bottom-grid">
          <section className="si-card si-panel">
            <div className="si-panel-header">
              <div>
                <h3 className="si-panel-title">Popular Searches</h3>
                <div className="si-panel-subtitle">Grouped demand from the selected period</div>
              </div>
            </div>

            <div className="si-cloud">
              {cloudWords.map(([word, size], index) => (
                <span
                  className="si-word"
                  key={word}
                  style={{
                    fontSize: `${size}px`,
                    opacity: 0.58 + (index % 5) * 0.09,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </section>

          <section className="si-card si-panel">
            <div className="si-panel-header">
              <div>
                <h3 className="si-panel-title">Insights</h3>
                <div className="si-panel-subtitle">Quick signals from reader demand</div>
              </div>
            </div>

            <div className="si-insight-list">
              <div className="si-insight">
                <div className="si-insight-icon">
                  <Icon d="M12 2v20 M5 9l7-7 7 7" size={15} />
                </div>
                <div className="si-insight-text">
                  Zombie has the highest number of searches that return no useful result.
                </div>
              </div>

              <div className="si-insight">
                <div className="si-insight-icon">
                  <Icon d="M3 17l6-6 4 4 8-9" size={15} />
                </div>
                <div className="si-insight-text">
                  Isekai search demand increased by 32.1% compared with the previous period.
                </div>
              </div>

              <div className="si-insight">
                <div className="si-insight-icon">
                  <Icon d="M6 3l12 8-5 2 3 6-2 1-3-6-5 4z" size={15} />
                </div>
                <div className="si-insight-text">
                  Fantasy and BL searches currently have the strongest click-through rates.
                </div>
              </div>
            </div>

            {selectedTerm ? (
              <div className="si-selected">
                Selected group: {selectedTerm}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
