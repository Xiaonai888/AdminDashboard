import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const styles = `
  .diamond-gifts-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .diamond-gifts-wrap {
    display: grid;
    gap: 18px;
  }

  .diamond-gifts-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .diamond-gifts-title {
    margin: 0;
    color: #0F172A;
    font-size: 40px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .diamond-gifts-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 700;
  }

  .diamond-gifts-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .diamond-gifts-input {
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

  .diamond-gifts-button {
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

  .diamond-gifts-button.primary {
    border: 0;
    background: linear-gradient(135deg, #4F46E5, #312E81);
    color: #FFFFFF;
  }

  .diamond-gifts-summary {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  .diamond-gifts-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .diamond-gifts-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .diamond-gifts-card-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .diamond-gifts-card-sub {
    margin-top: 8px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .diamond-gifts-card-sub.good {
    color: #16A34A;
  }

  .diamond-gifts-card-sub.warn {
    color: #D97706;
  }

  .diamond-gifts-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .diamond-gifts-search {
    width: 100%;
    height: 46px;
    box-sizing: border-box;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .diamond-gifts-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .diamond-gifts-chip {
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

  .diamond-gifts-chip.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  .diamond-gifts-main {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) 360px;
    gap: 16px;
    align-items: start;
  }

  .diamond-gifts-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .diamond-gifts-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .diamond-gifts-panel-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .diamond-gifts-panel-sub {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .diamond-gifts-table-wrap {
    overflow-x: auto;
  }

  .diamond-gifts-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1040px;
  }

  .diamond-gifts-table th {
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

  .diamond-gifts-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
    vertical-align: top;
  }

  .diamond-gifts-table tbody tr {
    cursor: pointer;
  }

  .diamond-gifts-table tbody tr.active {
    background: #F5F3FF;
  }

  .diamond-gifts-name {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .diamond-gifts-small {
    margin-top: 3px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
  }

  .diamond-gifts-money {
    font-weight: 950;
    white-space: nowrap;
  }

  .diamond-gifts-money.good {
    color: #16A34A;
  }

  .diamond-gifts-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
  }

  .diamond-gifts-status.pending {
    background: #FEF3C7;
    color: #B45309;
  }

  .diamond-gifts-status.available {
    background: #DBEAFE;
    color: #2563EB;
  }

  .diamond-gifts-status.paid {
    background: #DCFCE7;
    color: #15803D;
  }

  .diamond-gifts-detail {
    display: grid;
    gap: 18px;
    padding: 20px;
  }

  .diamond-gifts-section {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
    background: #FFFFFF;
  }

  .diamond-gifts-section-title {
    color: #4F46E5;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 12px;
  }

  .diamond-gifts-kv {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .diamond-gifts-kv:last-child {
    margin-bottom: 0;
  }

  .diamond-gifts-k {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .diamond-gifts-v {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    text-align: right;
  }

  .diamond-gifts-v.good {
    color: #16A34A;
  }

  .diamond-gifts-detail-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .diamond-gifts-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .diamond-gifts-pages {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .diamond-gifts-page-btn {
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

  .diamond-gifts-page-btn.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  @media (max-width: 1380px) {
    .diamond-gifts-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .diamond-gifts-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .diamond-gifts-header,
    .diamond-gifts-tools {
      display: grid;
      grid-template-columns: 1fr;
    }

    .diamond-gifts-summary {
      grid-template-columns: 1fr;
    }

    .diamond-gifts-actions,
    .diamond-gifts-filters {
      justify-content: stretch;
    }

    .diamond-gifts-input,
    .diamond-gifts-button,
    .diamond-gifts-chip {
      width: 100%;
      box-sizing: border-box;
    }

    .diamond-gifts-detail-actions {
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
    time: '22:14',
    sender: 'Luna Star',
    senderUsername: '@lunastar',
    senderId: 'USR-100552',
    receiver: 'Author A',
    receiverUsername: '@author.a',
    authorId: 'AUT-100012',
    sourceType: 'Author Page',
    source: 'The Heiress Returns',
    sourceSub: 'Author Page',
    diamonds: 300,
    valueUsd: 3,
    authorUsd: 3,
    platformUsd: 0,
    status: 'pending',
    txId: 'TXN-20260829-GFT-000874',
    rate: '$0.01',
    withholding: 0,
    netPayout: 3,
  },
  {
    id: 2,
    date: 'Aug 29, 2026',
    time: '21:36',
    sender: 'Night Owl',
    senderUsername: '@nightowl',
    senderId: 'USR-100551',
    receiver: 'Author B',
    receiverUsername: '@author.b',
    authorId: 'AUT-100014',
    sourceType: 'Story',
    source: 'Rebirth of the Phoenix',
    sourceSub: 'EP 48 - Chapter',
    diamonds: 100,
    valueUsd: 1,
    authorUsd: 1,
    platformUsd: 0,
    status: 'available',
    txId: 'TXN-20260829-GFT-000873',
    rate: '$0.01',
    withholding: 0,
    netPayout: 1,
  },
  {
    id: 3,
    date: 'Aug 29, 2026',
    time: '20:58',
    sender: 'Sweet Reader',
    senderUsername: '@sweetreader',
    senderId: 'USR-100550',
    receiver: 'Author A',
    receiverUsername: '@author.a',
    authorId: 'AUT-100012',
    sourceType: 'Author Page',
    source: 'The Heiress Returns',
    sourceSub: 'Author Page',
    diamonds: 50,
    valueUsd: 0.5,
    authorUsd: 0.5,
    platformUsd: 0,
    status: 'paid',
    txId: 'TXN-20260829-GFT-000872',
    rate: '$0.01',
    withholding: 0,
    netPayout: 0.5,
  },
  {
    id: 4,
    date: 'Aug 29, 2026',
    time: '20:11',
    sender: 'Book Lover',
    senderUsername: '@booklover',
    senderId: 'USR-100549',
    receiver: 'Author C',
    receiverUsername: '@author.c',
    authorId: 'AUT-100021',
    sourceType: 'Story',
    source: 'Love After the Storm',
    sourceSub: 'EP 25 - Chapter',
    diamonds: 200,
    valueUsd: 2,
    authorUsd: 2,
    platformUsd: 0,
    status: 'pending',
    txId: 'TXN-20260829-GFT-000871',
    rate: '$0.01',
    withholding: 0,
    netPayout: 2,
  },
  {
    id: 5,
    date: 'Aug 29, 2026',
    time: '19:42',
    sender: 'Starlight',
    senderUsername: '@starlight',
    senderId: 'USR-100548',
    receiver: 'Author D',
    receiverUsername: '@author.d',
    authorId: 'AUT-100028',
    sourceType: 'Author Page',
    source: 'Bound by Fate',
    sourceSub: 'Author Page',
    diamonds: 50,
    valueUsd: 0.5,
    authorUsd: 0.5,
    platformUsd: 0,
    status: 'available',
    txId: 'TXN-20260829-GFT-000870',
    rate: '$0.01',
    withholding: 0,
    netPayout: 0.5,
  },
]

export default function AdminDiamondGiftsPage() {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState('30d')
  const [selectedId, setSelectedId] = useState(rows[0].id)

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (!keyword) return true

      return [
        row.sender,
        row.senderUsername,
        row.receiver,
        row.receiverUsername,
        row.source,
        row.sourceSub,
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
    const diamonds = filteredRows.reduce((sum, row) => sum + row.diamonds, 0)
    const giftValue = filteredRows.reduce((sum, row) => sum + row.valueUsd, 0)
    const author = filteredRows.reduce((sum, row) => sum + row.authorUsd, 0)
    const platform = filteredRows.reduce((sum, row) => sum + row.platformUsd, 0)
    const pending = filteredRows
      .filter((row) => row.status !== 'paid')
      .reduce((sum, row) => sum + row.netPayout, 0)
    const paid = filteredRows
      .filter((row) => row.status === 'paid')
      .reduce((sum, row) => sum + row.netPayout, 0)

    return {
      count: filteredRows.length,
      diamonds,
      giftValue,
      author,
      platform,
      pending,
      paid,
    }
  }, [filteredRows])

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="diamond-gifts-page">
        <div className="diamond-gifts-wrap">
          <div className="diamond-gifts-header">
            <div>
              <h1 className="diamond-gifts-title">Diamond Gifts</h1>
              <div className="diamond-gifts-subtitle">
                Track all diamond gifts sent by readers to authors.
              </div>
            </div>

            <div className="diamond-gifts-actions">
              <input className="diamond-gifts-input" type="date" defaultValue="2026-08-01" />
              <input className="diamond-gifts-input" type="date" defaultValue="2026-08-29" />
              <button className="diamond-gifts-button">Export</button>
            </div>
          </div>

          <div className="diamond-gifts-summary">
            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">Total Gifts</div>
              <div className="diamond-gifts-card-value">{summary.count}</div>
              <div className="diamond-gifts-card-sub">Gift transactions</div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">Gift Value</div>
              <div className="diamond-gifts-card-value">{summary.diamonds} 💎</div>
              <div className="diamond-gifts-card-sub">{formatUsd(summary.giftValue)}</div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">Author Earnings</div>
              <div className="diamond-gifts-card-value">{formatUsd(summary.author)}</div>
              <div className="diamond-gifts-card-sub good">Author 100%</div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">Platform Income</div>
              <div className="diamond-gifts-card-value">{formatUsd(summary.platform)}</div>
              <div className="diamond-gifts-card-sub">Should stay $0</div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">Pending Payout</div>
              <div className="diamond-gifts-card-value">{formatUsd(summary.pending)}</div>
              <div className="diamond-gifts-card-sub warn">Not yet paid to authors</div>
            </div>

            <div className="diamond-gifts-card">
              <div className="diamond-gifts-card-label">Paid Payout</div>
              <div className="diamond-gifts-card-value">{formatUsd(summary.paid)}</div>
              <div className="diamond-gifts-card-sub good">Already paid to authors</div>
            </div>
          </div>

          <div className="diamond-gifts-tools">
            <input
              className="diamond-gifts-search"
              placeholder="Search by sender, receiver, story, or TX ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="diamond-gifts-filters">
              <button
                className={`diamond-gifts-chip ${range === 'today' ? 'active' : ''}`}
                onClick={() => setRange('today')}
              >
                Today
              </button>
              <button
                className={`diamond-gifts-chip ${range === '7d' ? 'active' : ''}`}
                onClick={() => setRange('7d')}
              >
                7D
              </button>
              <button
                className={`diamond-gifts-chip ${range === '30d' ? 'active' : ''}`}
                onClick={() => setRange('30d')}
              >
                30D
              </button>
              <button
                className={`diamond-gifts-chip ${range === 'month' ? 'active' : ''}`}
                onClick={() => setRange('month')}
              >
                This Month
              </button>
              <button className="diamond-gifts-chip">Filters</button>
            </div>
          </div>

          <div className="diamond-gifts-main">
            <section className="diamond-gifts-panel">
              <div className="diamond-gifts-panel-head">
                <div className="diamond-gifts-panel-title">Diamond Gift Transactions</div>
                <div className="diamond-gifts-panel-sub">
                  Showing {filteredRows.length} records
                </div>
              </div>

              <div className="diamond-gifts-table-wrap">
                <table className="diamond-gifts-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sender</th>
                      <th>Receiver</th>
                      <th>Story / Source</th>
                      <th>Gift</th>
                      <th>Value USD</th>
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
                          <div className="diamond-gifts-name">{row.date}</div>
                          <div className="diamond-gifts-small">{row.time}</div>
                        </td>
                        <td>
                          <div className="diamond-gifts-name">{row.sender}</div>
                          <div className="diamond-gifts-small">{row.senderUsername}</div>
                        </td>
                        <td>
                          <div className="diamond-gifts-name">{row.receiver}</div>
                          <div className="diamond-gifts-small">{row.receiverUsername}</div>
                        </td>
                        <td>
                          <div className="diamond-gifts-name">{row.source}</div>
                          <div className="diamond-gifts-small">{row.sourceSub}</div>
                        </td>
                        <td>
                          <div className="diamond-gifts-name">{row.diamonds} 💎</div>
                        </td>
                        <td className="diamond-gifts-money">{formatUsd(row.valueUsd)}</td>
                        <td className="diamond-gifts-money good">{formatUsd(row.authorUsd)}</td>
                        <td className="diamond-gifts-money">{formatUsd(row.platformUsd)}</td>
                        <td>
                          <span className={`diamond-gifts-status ${row.status}`}>
                            {row.status === 'pending'
                              ? 'Pending'
                              : row.status === 'available'
                                ? 'Available'
                                : 'Paid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="diamond-gifts-pagination">
                <div className="diamond-gifts-small">Rows per page: 20</div>

                <div className="diamond-gifts-pages">
                  <button className="diamond-gifts-page-btn active">1</button>
                  <button className="diamond-gifts-page-btn">2</button>
                  <button className="diamond-gifts-page-btn">3</button>
                </div>
              </div>
            </section>

            <aside className="diamond-gifts-panel">
              <div className="diamond-gifts-panel-head">
                <div className="diamond-gifts-panel-title">Gift Transaction Detail</div>
                <div className="diamond-gifts-panel-sub">TX ID: {selected.txId}</div>
              </div>

              <div className="diamond-gifts-detail">
                <div className="diamond-gifts-section">
                  <div className="diamond-gifts-section-title">Overview</div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Sent At</div>
                    <div className="diamond-gifts-v">{selected.date} {selected.time}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Gift Status</div>
                    <div className="diamond-gifts-v">
                      {selected.status === 'pending'
                        ? 'Pending'
                        : selected.status === 'available'
                          ? 'Available'
                          : 'Paid'}
                    </div>
                  </div>
                </div>

                <div className="diamond-gifts-section">
                  <div className="diamond-gifts-section-title">Sender</div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Name</div>
                    <div className="diamond-gifts-v">{selected.sender}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Username</div>
                    <div className="diamond-gifts-v">{selected.senderUsername}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">User ID</div>
                    <div className="diamond-gifts-v">{selected.senderId}</div>
                  </div>
                </div>

                <div className="diamond-gifts-section">
                  <div className="diamond-gifts-section-title">Receiver</div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Author</div>
                    <div className="diamond-gifts-v">{selected.receiver}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Username</div>
                    <div className="diamond-gifts-v">{selected.receiverUsername}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Author ID</div>
                    <div className="diamond-gifts-v">{selected.authorId}</div>
                  </div>
                </div>

                <div className="diamond-gifts-section">
                  <div className="diamond-gifts-section-title">Story / Source</div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Source Type</div>
                    <div className="diamond-gifts-v">{selected.sourceType}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Title</div>
                    <div className="diamond-gifts-v">{selected.source}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Source</div>
                    <div className="diamond-gifts-v">{selected.sourceSub}</div>
                  </div>
                </div>

                <div className="diamond-gifts-section">
                  <div className="diamond-gifts-section-title">Payment & Amount</div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Paid Diamonds</div>
                    <div className="diamond-gifts-v">{selected.diamonds} 💎</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Diamond → USD</div>
                    <div className="diamond-gifts-v">{selected.rate}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Gross Gift Value</div>
                    <div className="diamond-gifts-v">{formatUsd(selected.valueUsd)}</div>
                  </div>
                </div>

                <div className="diamond-gifts-section">
                  <div className="diamond-gifts-section-title">Revenue Breakdown</div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Author Earnings</div>
                    <div className="diamond-gifts-v good">{formatUsd(selected.authorUsd)}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Platform Income</div>
                    <div className="diamond-gifts-v">{formatUsd(selected.platformUsd)}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Withholding</div>
                    <div className="diamond-gifts-v">{formatUsd(selected.withholding)}</div>
                  </div>
                  <div className="diamond-gifts-kv">
                    <div className="diamond-gifts-k">Author Net Payout</div>
                    <div className="diamond-gifts-v good">{formatUsd(selected.netPayout)}</div>
                  </div>
                </div>

                <div className="diamond-gifts-detail-actions">
                  <button className="diamond-gifts-button">View User</button>
                  <button className="diamond-gifts-button primary">View Author</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
