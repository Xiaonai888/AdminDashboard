import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const styles = `
  .episode-sales-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .episode-sales-wrap {
    display: grid;
    gap: 18px;
  }

  .episode-sales-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .episode-sales-title {
    margin: 0;
    color: #0F172A;
    font-size: 40px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .episode-sales-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 700;
  }

  .episode-sales-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .episode-sales-input {
    height: 44px;
    border: 1px solid #D8E0F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .episode-sales-button {
    height: 44px;
    border: 1px solid #C7D2FE;
    border-radius: 14px;
    background: #FFFFFF;
    color: #4F46E5;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .episode-sales-button.primary {
    background: linear-gradient(135deg, #4F46E5, #312E81);
    color: #FFFFFF;
    border: 0;
  }

  .episode-sales-summary {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
  }

  .episode-sales-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .episode-sales-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .episode-sales-card-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 30px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .episode-sales-card-sub {
    margin-top: 8px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .episode-sales-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .episode-sales-search {
    height: 46px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .episode-sales-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .episode-sales-chip {
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 13px;
    background: #FFFFFF;
    color: #475569;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .episode-sales-chip.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  .episode-sales-main {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) 360px;
    gap: 16px;
    align-items: start;
  }

  .episode-sales-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .episode-sales-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .episode-sales-panel-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .episode-sales-panel-sub {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .episode-sales-table-wrap {
    overflow-x: auto;
  }

  .episode-sales-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 920px;
  }

  .episode-sales-table th {
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
    padding: 14px 18px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
    white-space: nowrap;
  }

  .episode-sales-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
    vertical-align: top;
  }

  .episode-sales-table tr {
    cursor: pointer;
  }

  .episode-sales-table tr.active {
    background: #F5F3FF;
  }

  .episode-sales-name {
    font-size: 14px;
    font-weight: 950;
    color: #0F172A;
  }

  .episode-sales-small {
    margin-top: 3px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
  }

  .episode-sales-money {
    font-weight: 950;
    white-space: nowrap;
  }

  .episode-sales-money.good {
    color: #16A34A;
  }

  .episode-sales-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
  }

  .episode-sales-status.pending {
    background: #FEF3C7;
    color: #B45309;
  }

  .episode-sales-status.available {
    background: #DBEAFE;
    color: #2563EB;
  }

  .episode-sales-status.paid {
    background: #DCFCE7;
    color: #15803D;
  }

  .episode-sales-detail {
    padding: 20px;
    display: grid;
    gap: 18px;
  }

  .episode-sales-section {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
    background: #FFFFFF;
  }

  .episode-sales-section-title {
    color: #4F46E5;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 12px;
  }

  .episode-sales-kv {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .episode-sales-kv:last-child {
    margin-bottom: 0;
  }

  .episode-sales-k {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .episode-sales-v {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    text-align: right;
  }

  .episode-sales-detail-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .episode-sales-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .episode-sales-pages {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .episode-sales-page-btn {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    background: #FFFFFF;
    color: #475569;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .episode-sales-page-btn.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  @media (max-width: 1280px) {
    .episode-sales-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .episode-sales-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .episode-sales-header,
    .episode-sales-tools {
      grid-template-columns: 1fr;
      display: grid;
    }

    .episode-sales-summary {
      grid-template-columns: 1fr;
    }

    .episode-sales-actions,
    .episode-sales-filters {
      justify-content: stretch;
    }

    .episode-sales-button,
    .episode-sales-input,
    .episode-sales-chip {
      width: 100%;
      box-sizing: border-box;
    }

    .episode-sales-detail-actions {
      grid-template-columns: 1fr;
    }
  }
`

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

const rows = [
  {
    id: 1,
    date: 'Aug 29, 2026',
    time: '22:10',
    buyer: 'Sokha Ly',
    username: '@sokha.ly',
    story: 'Bloodline',
    episode: 'EP 12 - The Truth',
    author: 'Author A',
    authorUsername: '@author.a',
    paidDiamonds: 10,
    grossUsd: 1,
    authorUsd: 0.75,
    platformUsd: 0.25,
    status: 'pending',
    txId: 'TXN-20260829-000245',
    purchaseKey: 'PK-20260829-9F3A1B',
    userId: 'USR-100245',
    storyId: 'ST-10012',
    rate: '$0.10',
    withholding: 0,
    netPayout: 0.75,
  },
  {
    id: 2,
    date: 'Aug 29, 2026',
    time: '21:45',
    buyer: 'Dara Kim',
    username: '@darakim',
    story: 'Fallen Angel',
    episode: 'EP 25 - Goodbye',
    author: 'Author B',
    authorUsername: '@author.b',
    paidDiamonds: 20,
    grossUsd: 2,
    authorUsd: 1.5,
    platformUsd: 0.5,
    status: 'pending',
    txId: 'TXN-20260829-000244',
    purchaseKey: 'PK-20260829-2C8D1A',
    userId: 'USR-100244',
    storyId: 'ST-10044',
    rate: '$0.10',
    withholding: 0,
    netPayout: 1.5,
  },
  {
    id: 3,
    date: 'Aug 29, 2026',
    time: '20:30',
    buyer: 'Vuthy P.',
    username: '@vuthy.p',
    story: 'Rebirth',
    episode: 'EP 8 - Decision',
    author: 'Author C',
    authorUsername: '@author.c',
    paidDiamonds: 15,
    grossUsd: 1.5,
    authorUsd: 1.13,
    platformUsd: 0.37,
    status: 'available',
    txId: 'TXN-20260829-000243',
    purchaseKey: 'PK-20260829-8A72FF',
    userId: 'USR-100243',
    storyId: 'ST-10051',
    rate: '$0.10',
    withholding: 0,
    netPayout: 1.13,
  },
  {
    id: 4,
    date: 'Aug 29, 2026',
    time: '19:12',
    buyer: 'Chenda',
    username: '@chenda',
    story: 'Dark Heart',
    episode: 'EP 3 - Secret',
    author: 'Author A',
    authorUsername: '@author.a',
    paidDiamonds: 10,
    grossUsd: 1,
    authorUsd: 0.75,
    platformUsd: 0.25,
    status: 'paid',
    txId: 'TXN-20260829-000242',
    purchaseKey: 'PK-20260829-1B3DE4',
    userId: 'USR-100242',
    storyId: 'ST-10103',
    rate: '$0.10',
    withholding: 0,
    netPayout: 0.75,
  },
  {
    id: 5,
    date: 'Aug 29, 2026',
    time: '18:05',
    buyer: 'Ravy N.',
    username: '@ravy.n',
    story: 'Bloodline',
    episode: 'EP 11 - Choice',
    author: 'Author A',
    authorUsername: '@author.a',
    paidDiamonds: 10,
    grossUsd: 1,
    authorUsd: 0.75,
    platformUsd: 0.25,
    status: 'paid',
    txId: 'TXN-20260829-000241',
    purchaseKey: 'PK-20260829-4D77AC',
    userId: 'USR-100241',
    storyId: 'ST-10012',
    rate: '$0.10',
    withholding: 0,
    netPayout: 0.75,
  },
]

export default function AdminEpisodeSalesPage() {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState('30d')
  const [selectedId, setSelectedId] = useState(rows[0].id)

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (!keyword) return true

      return [
        row.buyer,
        row.username,
        row.story,
        row.episode,
        row.author,
        row.txId,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [search])

  const selected =
    filteredRows.find((row) => row.id === selectedId) ||
    filteredRows[0] ||
    rows[0]

  const summary = useMemo(() => {
    const gross = filteredRows.reduce((sum, row) => sum + row.grossUsd, 0)
    const platform = filteredRows.reduce((sum, row) => sum + row.platformUsd, 0)
    const author = filteredRows.reduce((sum, row) => sum + row.authorUsd, 0)
    const pending = filteredRows
      .filter((row) => row.status !== 'paid')
      .reduce((sum, row) => sum + row.authorUsd, 0)
    const paid = filteredRows
      .filter((row) => row.status === 'paid')
      .reduce((sum, row) => sum + row.authorUsd, 0)

    return {
      gross,
      platform,
      author,
      pending,
      paid,
      count: filteredRows.length,
    }
  }, [filteredRows])

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="episode-sales-page">
        <div className="episode-sales-wrap">
          <div className="episode-sales-header">
            <div>
              <h1 className="episode-sales-title">Episode Sales</h1>
              <div className="episode-sales-subtitle">
                Track all income from episode unlocks by readers.
              </div>
            </div>

            <div className="episode-sales-actions">
              <input className="episode-sales-input" type="date" defaultValue="2026-08-01" />
              <input className="episode-sales-input" type="date" defaultValue="2026-08-29" />
              <button className="episode-sales-button">Export</button>
            </div>
          </div>

          <div className="episode-sales-summary">
            <div className="episode-sales-card">
              <div className="episode-sales-card-label">Gross Sales</div>
              <div className="episode-sales-card-value">{formatUsd(summary.gross)}</div>
              <div className="episode-sales-card-sub">Total from readers</div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">Platform Income</div>
              <div className="episode-sales-card-value">{formatUsd(summary.platform)}</div>
              <div className="episode-sales-card-sub">Platform share</div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">Author Earnings</div>
              <div className="episode-sales-card-value">{formatUsd(summary.author)}</div>
              <div className="episode-sales-card-sub">Paid to authors</div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">Pending Payout</div>
              <div className="episode-sales-card-value">{formatUsd(summary.pending)}</div>
              <div className="episode-sales-card-sub">Not yet paid to authors</div>
            </div>

            <div className="episode-sales-card">
              <div className="episode-sales-card-label">Sales / Records</div>
              <div className="episode-sales-card-value">{summary.count}</div>
              <div className="episode-sales-card-sub">Unique purchases</div>
            </div>
          </div>

          <div className="episode-sales-tools">
            <input
              className="episode-sales-search"
              placeholder="Search by buyer, story, author, episode, or TX ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="episode-sales-filters">
              <button
                className={`episode-sales-chip ${range === 'today' ? 'active' : ''}`}
                onClick={() => setRange('today')}
              >
                Today
              </button>
              <button
                className={`episode-sales-chip ${range === '7d' ? 'active' : ''}`}
                onClick={() => setRange('7d')}
              >
                7D
              </button>
              <button
                className={`episode-sales-chip ${range === '30d' ? 'active' : ''}`}
                onClick={() => setRange('30d')}
              >
                30D
              </button>
              <button
                className={`episode-sales-chip ${range === 'month' ? 'active' : ''}`}
                onClick={() => setRange('month')}
              >
                This Month
              </button>
              <button className="episode-sales-chip">Filters</button>
            </div>
          </div>

          <div className="episode-sales-main">
            <section className="episode-sales-panel">
              <div className="episode-sales-panel-head">
                <div className="episode-sales-panel-title">Episode Sales Transactions</div>
                <div className="episode-sales-panel-sub">
                  Showing {filteredRows.length} records
                </div>
              </div>

              <div className="episode-sales-table-wrap">
                <table className="episode-sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Buyer</th>
                      <th>Story / Episode</th>
                      <th>Author</th>
                      <th>Paid</th>
                      <th>Author Earnings</th>
                      <th>Platform Income</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map((row) => (
                      <tr
                        key={row.id}
                        className={selected?.id === row.id ? 'active' : ''}
                        onClick={() => setSelectedId(row.id)}
                      >
                        <td>
                          <div className="episode-sales-name">{row.date}</div>
                          <div className="episode-sales-small">{row.time}</div>
                        </td>
                        <td>
                          <div className="episode-sales-name">{row.buyer}</div>
                          <div className="episode-sales-small">{row.username}</div>
                        </td>
                        <td>
                          <div className="episode-sales-name">{row.story}</div>
                          <div className="episode-sales-small">{row.episode}</div>
                        </td>
                        <td>
                          <div className="episode-sales-name">{row.author}</div>
                          <div className="episode-sales-small">{row.authorUsername}</div>
                        </td>
                        <td>
                          <div className="episode-sales-name">{row.paidDiamonds} 💎</div>
                          <div className="episode-sales-small">{formatUsd(row.grossUsd)}</div>
                        </td>
                        <td className="episode-sales-money good">{formatUsd(row.authorUsd)}</td>
                        <td className="episode-sales-money">{formatUsd(row.platformUsd)}</td>
                        <td>
                          <span className={`episode-sales-status ${row.status}`}>
                            {row.status === 'pending' ? 'Pending' : row.status === 'available' ? 'Available' : 'Paid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="episode-sales-pagination">
                <div className="episode-sales-small">Rows per page: 20</div>

                <div className="episode-sales-pages">
                  <button className="episode-sales-page-btn active">1</button>
                  <button className="episode-sales-page-btn">2</button>
                  <button className="episode-sales-page-btn">3</button>
                </div>
              </div>
            </section>

            <aside className="episode-sales-panel">
              <div className="episode-sales-panel-head">
                <div className="episode-sales-panel-title">Transaction Detail</div>
                <div className="episode-sales-panel-sub">TX ID: {selected.txId}</div>
              </div>

              <div className="episode-sales-detail">
                <div className="episode-sales-section">
                  <div className="episode-sales-section-title">Overview</div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Purchased At</div>
                    <div className="episode-sales-v">{selected.date} {selected.time}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Purchase Key</div>
                    <div className="episode-sales-v">{selected.purchaseKey}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Status</div>
                    <div className="episode-sales-v">
                      {selected.status === 'pending' ? 'Pending' : selected.status === 'available' ? 'Available' : 'Paid'}
                    </div>
                  </div>
                </div>

                <div className="episode-sales-section">
                  <div className="episode-sales-section-title">Buyer</div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Name</div>
                    <div className="episode-sales-v">{selected.buyer}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Username</div>
                    <div className="episode-sales-v">{selected.username}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">User ID</div>
                    <div className="episode-sales-v">{selected.userId}</div>
                  </div>
                </div>

                <div className="episode-sales-section">
                  <div className="episode-sales-section-title">Story & Episode</div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Story</div>
                    <div className="episode-sales-v">{selected.story}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Episode</div>
                    <div className="episode-sales-v">{selected.episode}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Story ID</div>
                    <div className="episode-sales-v">{selected.storyId}</div>
                  </div>
                </div>

                <div className="episode-sales-section">
                  <div className="episode-sales-section-title">Author</div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Name</div>
                    <div className="episode-sales-v">{selected.author}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Username</div>
                    <div className="episode-sales-v">{selected.authorUsername}</div>
                  </div>
                </div>

                <div className="episode-sales-section">
                  <div className="episode-sales-section-title">Payment & Amount</div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Paid Diamonds</div>
                    <div className="episode-sales-v">{selected.paidDiamonds} 💎</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Diamond → USD</div>
                    <div className="episode-sales-v">{selected.rate}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Gross</div>
                    <div className="episode-sales-v">{formatUsd(selected.grossUsd)}</div>
                  </div>
                </div>

                <div className="episode-sales-section">
                  <div className="episode-sales-section-title">Revenue Breakdown</div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Author Earnings</div>
                    <div className="episode-sales-v">{formatUsd(selected.authorUsd)}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Platform Income</div>
                    <div className="episode-sales-v">{formatUsd(selected.platformUsd)}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Withholding</div>
                    <div className="episode-sales-v">{formatUsd(selected.withholding)}</div>
                  </div>
                  <div className="episode-sales-kv">
                    <div className="episode-sales-k">Author Net Payout</div>
                    <div className="episode-sales-v">{formatUsd(selected.netPayout)}</div>
                  </div>
                </div>

                <div className="episode-sales-detail-actions">
                  <button className="episode-sales-button">View User</button>
                  <button className="episode-sales-button primary">View Author</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
