import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const styles = `
  .ranking-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ranking-hero {
    background: linear-gradient(135deg, #111827, #312E81);
    color: white;
    border-radius: 22px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    gap: 18px;
    overflow: hidden;
    position: relative;
  }

  .ranking-hero::after {
    content: '';
    width: 180px;
    height: 180px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    position: absolute;
    right: -48px;
    top: -72px;
  }

  .ranking-kicker {
    font-size: 11px;
    font-weight: 950;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #C7D2FE;
    margin-bottom: 8px;
  }

  .ranking-hero h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .ranking-hero p {
    margin: 8px 0 0;
    max-width: 680px;
    color: #E0E7FF;
    font-size: 13px;
    line-height: 1.7;
    font-weight: 650;
  }

  .ranking-hero-badge {
    height: fit-content;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 999px;
    padding: 9px 13px;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
    z-index: 1;
  }

  .ranking-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 10px;
  }

  .ranking-tab {
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: #64748B;
    padding: 10px 13px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    font-weight: 950;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ranking-tab.active {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .ranking-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #CBD5E1;
  }

  .ranking-tab.active .ranking-dot {
    background: #4F46E5;
  }

  .ranking-toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) repeat(3, minmax(150px, 190px));
    gap: 10px;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 14px;
  }

  .ranking-toolbar input,
  .ranking-toolbar select {
    width: 100%;
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #0F172A;
    border-radius: 13px;
    height: 42px;
    padding: 0 13px;
    outline: none;
    font: inherit;
    font-size: 13px;
    font-weight: 750;
  }

  .ranking-toolbar input:focus,
  .ranking-toolbar select:focus {
    border-color: #4F46E5;
    background: white;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .ranking-panel {
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    overflow: hidden;
  }

  .ranking-panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .ranking-panel-title {
    font-size: 16px;
    font-weight: 950;
    color: #0F172A;
  }

  .ranking-panel-subtitle {
    margin-top: 3px;
    font-size: 12px;
    font-weight: 750;
    color: #64748B;
  }

  .ranking-pill {
    border-radius: 999px;
    background: #F1F5F9;
    color: #475569;
    font-size: 11px;
    font-weight: 950;
    padding: 8px 12px;
    white-space: nowrap;
  }

  .ranking-table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  .ranking-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 980px;
  }

  .ranking-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 13px 14px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }

  .ranking-table td {
    padding: 15px 14px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 750;
  }

  .ranking-table tr:last-child td {
    border-bottom: 0;
  }

  .ranking-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    text-align: center;
    padding: 28px;
    color: #64748B;
  }

  .ranking-empty-icon {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    background: #EEF2FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    margin-bottom: 14px;
  }

  .ranking-empty-title {
    color: #0F172A;
    font-size: 16px;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ranking-empty-text {
    max-width: 520px;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.7;
  }

  .ranking-settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
    padding: 18px;
  }

  .ranking-setting-card {
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    border-radius: 16px;
    padding: 16px;
  }

  .ranking-setting-card strong {
    display: block;
    color: #0F172A;
    font-size: 13px;
    font-weight: 950;
    margin-bottom: 6px;
  }

  .ranking-setting-card span {
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
    line-height: 1.6;
  }

  @media (max-width: 980px) {
    .ranking-toolbar {
      grid-template-columns: 1fr;
    }

    .ranking-hero {
      flex-direction: column;
    }
  }
`

const tabs = [
  {
    key: 'stories',
    label: 'Story Rank',
    subtitle: 'Public story ranking control and monitoring.',
    empty: 'Story ranking data will connect in the next stage.',
    columns: ['Rank', 'Cover', 'Story', 'Story ID', 'Author', 'Genre', 'Views', 'Likes', 'Comments', 'Score', 'Action'],
  },
  {
    key: 'authors',
    label: 'Author Rank',
    subtitle: 'Track top authors by engagement and growth.',
    empty: 'Author ranking data will connect after Story Rank.',
    columns: ['Rank', 'Author', 'Author ID', 'Username', 'Stories', 'Followers', 'Views', 'Likes', 'Score', 'Action'],
  },
  {
    key: 'episodes',
    label: 'Episode Rank',
    subtitle: 'Monitor top performing episodes.',
    empty: 'Episode ranking data will connect after Author Rank.',
    columns: ['Rank', 'Episode', 'Episode ID', 'Story', 'Author', 'Views', 'Likes', 'Comments', 'Score', 'Action'],
  },
  {
    key: 'income',
    label: 'Income Rank',
    subtitle: 'Private admin-only author income ranking.',
    empty: 'Income Rank will connect to your existing Income system later.',
    columns: ['Rank', 'Author', 'Author ID', 'Username', 'Total Income', 'This Month', 'Pending', 'Paid', 'Status', 'Action'],
  },
  {
    key: 'hidden',
    label: 'Hidden Rank',
    subtitle: 'Stories, authors, or episodes hidden from public ranking.',
    empty: 'Hidden ranking records will appear after Hide from Ranking is added.',
    columns: ['Type', 'Name', 'ID', 'Hidden Reason', 'Hidden By', 'Hidden Date', 'Status', 'Action'],
  },
  {
    key: 'settings',
    label: 'Settings',
    subtitle: 'Ranking rules, score formula, and safety settings.',
    empty: '',
    columns: [],
  },
]

const settingItems = [
  ['Score Formula', 'Views + weighted likes + weighted comments + bookmarks.'],
  ['Minimum Activity', 'Control minimum views, likes, or episodes before an item can rank.'],
  ['Public Safety', 'Exclude deleted, restricted, disabled, or suspicious items from public ranking.'],
  ['Income Privacy', 'Income Rank stays admin-only and never appears on the reader website.'],
  ['Suspicious Activity', 'Later stage can detect abnormal views, likes, comments, or spam growth.'],
  ['Manual Control', 'Later stage can hide, unhide, pin, feature, or clear ranking flags.'],
]

export default function AdminRankingPage() {
  const [activeTab, setActiveTab] = useState('stories')
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('weekly')
  const [metric, setMetric] = useState('score')
  const [status, setStatus] = useState('all')

  const activeConfig = useMemo(() => tabs.find((tab) => tab.key === activeTab) || tabs[0], [activeTab])

  return (
    <AdminLayout title="Ranking" subtitle="Ranking Control Center for public ranking, private income ranking, and ranking safety.">
      <style>{styles}</style>
      <div className="ranking-page">
        <section className="ranking-hero">
          <div>
            <div className="ranking-kicker">Admin Control Center</div>
            <h2>Ranking Management</h2>
            <p>Control story, author, episode, income, hidden, and settings sections from one professional admin page. Public ranking does not show author income.</p>
          </div>
          <div className="ranking-hero-badge">Stage 1 · Base UI</div>
        </section>

        <div className="ranking-tabs">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" className={`ranking-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <span className="ranking-dot" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'settings' ? (
          <div className="ranking-toolbar">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author, username, story ID, author ID..." />
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="all_time">All Time</option>
            </select>
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>
              <option value="score">Score</option>
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
              <option value="income">Income</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="restricted">Restricted</option>
              <option value="suspicious">Suspicious</option>
            </select>
          </div>
        ) : null}

        <section className="ranking-panel">
          <div className="ranking-panel-top">
            <div>
              <div className="ranking-panel-title">{activeConfig.label}</div>
              <div className="ranking-panel-subtitle">{activeConfig.subtitle}</div>
            </div>
            <div className="ranking-pill">No live data connected yet</div>
          </div>

          {activeTab === 'settings' ? (
            <div className="ranking-settings-grid">
              {settingItems.map(([title, text]) => (
                <div key={title} className="ranking-setting-card">
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ranking-table-wrap">
              <table className="ranking-table">
                <thead>
                  <tr>
                    {activeConfig.columns.map((column) => <th key={column}>{column}</th>)}
                  </tr>
                </thead>
              </table>
              <div className="ranking-empty">
                <div className="ranking-empty-icon">🏆</div>
                <div className="ranking-empty-title">{activeConfig.label} is ready</div>
                <div className="ranking-empty-text">{activeConfig.empty}</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
