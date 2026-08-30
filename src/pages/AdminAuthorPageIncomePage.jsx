import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const styles = `
  .author-income-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .author-income-wrap {
    display: grid;
    gap: 18px;
  }

  .author-income-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .author-income-title {
    margin: 0;
    color: #0F172A;
    font-size: 40px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .author-income-subtitle {
    margin-top: 8px;
    color: #64748B;
    font-size: 14px;
    font-weight: 700;
  }

  .author-income-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .author-income-input {
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

  .author-income-button {
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

  .author-income-button.primary {
    border: 0;
    background: linear-gradient(135deg, #4F46E5, #312E81);
    color: #FFFFFF;
  }

  .author-income-summary {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
  }

  .author-income-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .author-income-card-label {
    color: #64748B;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: .05em;
  }

  .author-income-card-value {
    margin-top: 10px;
    color: #0F172A;
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .author-income-card-sub {
    margin-top: 8px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .author-income-card-sub.good {
    color: #16A34A;
  }

  .author-income-card-sub.warn {
    color: #D97706;
  }

  .author-income-tools {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .author-income-search {
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

  .author-income-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .author-income-chip {
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

  .author-income-chip.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  .author-income-tabs {
    display: flex;
    gap: 6px;
    border-bottom: 1px solid #E2E8F0;
  }

  .author-income-tab {
    border: 0;
    background: transparent;
    color: #64748B;
    padding: 13px 18px;
    font-size: 13px;
    font-weight: 950;
    cursor: pointer;
    border-bottom: 3px solid transparent;
  }

  .author-income-tab.active {
    color: #4F46E5;
    border-bottom-color: #4F46E5;
  }

  .author-income-main {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) 360px;
    gap: 16px;
    align-items: start;
  }

  .author-income-panel {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .author-income-panel-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
  }

  .author-income-panel-title {
    color: #0F172A;
    font-size: 20px;
    font-weight: 950;
  }

  .author-income-panel-sub {
    margin-top: 4px;
    color: #64748B;
    font-size: 12px;
    font-weight: 800;
  }

  .author-income-table-wrap {
    overflow-x: auto;
  }

  .author-income-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1050px;
  }

  .author-income-table th {
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

  .author-income-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #F1F5F9;
    color: #0F172A;
    font-size: 13px;
    font-weight: 800;
    vertical-align: top;
  }

  .author-income-table tbody tr {
    cursor: pointer;
  }

  .author-income-table tbody tr.active {
    background: #F5F3FF;
  }

  .author-income-name {
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .author-income-small {
    margin-top: 3px;
    color: #64748B;
    font-size: 12px;
    font-weight: 750;
  }

  .author-income-money {
    font-weight: 950;
    white-space: nowrap;
  }

  .author-income-money.good {
    color: #16A34A;
  }

  .author-income-type {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .author-income-type.pdf {
    background: #DBEAFE;
    color: #2563EB;
  }

  .author-income-status {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 950;
    white-space: nowrap;
    background: #DCFCE7;
    color: #15803D;
  }

  .author-income-detail {
    display: grid;
    gap: 18px;
    padding: 20px;
  }

  .author-income-section {
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 16px;
    background: #FFFFFF;
  }

  .author-income-section-title {
    color: #4F46E5;
    font-size: 14px;
    font-weight: 950;
    margin-bottom: 12px;
  }

  .author-income-kv {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .author-income-kv:last-child {
    margin-bottom: 0;
  }

  .author-income-k {
    color: #64748B;
    font-size: 12px;
    font-weight: 850;
  }

  .author-income-v {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    text-align: right;
  }

  .author-income-v.good {
    color: #16A34A;
  }

  .author-income-detail-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .author-income-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .author-income-pages {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .author-income-page-btn {
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

  .author-income-page-btn.active {
    background: #EEF2FF;
    border-color: #C7D2FE;
    color: #4338CA;
  }

  @media (max-width: 1380px) {
    .author-income-summary {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .author-income-main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .author-income-header,
    .author-income-tools {
      display: grid;
      grid-template-columns: 1fr;
    }

    .author-income-summary {
      grid-template-columns: 1fr;
    }

    .author-income-actions,
    .author-income-filters {
      justify-content: stretch;
    }

    .author-income-input,
    .author-income-button,
    .author-income-chip {
      width: 100%;
      box-sizing: border-box;
    }

    .author-income-tabs {
      overflow-x: auto;
    }

    .author-income-tab {
      min-width: 92px;
    }

    .author-income-detail-actions {
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
    buyer: 'Luna Star',
    username: '@lunastar',
    userId: 'USR-100552',
    product: 'The Heiress Returns',
    type: 'book',
    author: 'Author A',
    authorUsername: '@author.a',
    authorId: 'AUT-100012',
    originalPrice: 3,
    discount: 0,
    finalPrice: 3,
    platformFee: 0.3,
    authorIncome: 2.7,
    paymentStatus: 'Paid',
    orderId: 'APB-20260829-842',
    accessType: 'Full Access',
    refund: 0,
  },
  {
    id: 2,
    date: 'Aug 29, 2026',
    time: '21:52',
    buyer: 'Night Owl',
    username: '@nightowl',
    userId: 'USR-100551',
    product: 'Rebirth of the Phoenix',
    type: 'pdf',
    author: 'Author B',
    authorUsername: '@author.b',
    authorId: 'AUT-100014',
    originalPrice: 1,
    discount: 0,
    finalPrice: 1,
    platformFee: 0.1,
    authorIncome: 0.9,
    paymentStatus: 'Paid',
    orderId: 'APP-20260829-841',
    accessType: 'PDF Download',
    refund: 0,
  },
  {
    id: 3,
    date: 'Aug 29, 2026',
    time: '21:36',
    buyer: 'Sweet Reader',
    username: '@sweetreader',
    userId: 'USR-100550',
    product: 'Silent Vows',
    type: 'book',
    author: 'Author C',
    authorUsername: '@author.c',
    authorId: 'AUT-100021',
    originalPrice: 2.5,
    discount: 0,
    finalPrice: 2.5,
    platformFee: 0.25,
    authorIncome: 2.25,
    paymentStatus: 'Paid',
    orderId: 'APB-20260829-840',
    accessType: 'Full Access',
    refund: 0,
  },
  {
    id: 4,
    date: 'Aug 29, 2026',
    time: '20:58',
    buyer: 'Book Lover',
    username: '@booklover',
    userId: 'USR-100549',
    product: 'Love After the Storm',
    type: 'book',
    author: 'Author C',
    authorUsername: '@author.c',
    authorId: 'AUT-100021',
    originalPrice: 2,
    discount: 0,
    finalPrice: 2,
    platformFee: 0.2,
    authorIncome: 1.8,
    paymentStatus: 'Paid',
    orderId: 'APB-20260829-839',
    accessType: 'Full Access',
    refund: 0,
  },
  {
    id: 5,
    date: 'Aug 29, 2026',
    time: '20:41',
    buyer: 'Starlight',
    username: '@starlight',
    userId: 'USR-100548',
    product: 'Bound by Fate',
    type: 'pdf',
    author: 'Author D',
    authorUsername: '@author.d',
    authorId: 'AUT-100028',
    originalPrice: 0.5,
    discount: 0,
    finalPrice: 0.5,
    platformFee: 0.05,
    authorIncome: 0.45,
    paymentStatus: 'Paid',
    orderId: 'APP-20260829-838',
    accessType: 'PDF Download',
    refund: 0,
  },
]

export default function AdminAuthorPageIncomePage() {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState('30d')
  const [tab, setTab] = useState('all')
  const [selectedId, setSelectedId] = useState(rows[0].id)

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (tab !== 'all' && row.type !== tab) return false
      if (!keyword) return true

      return [
        row.buyer,
        row.username,
        row.product,
        row.author,
        row.authorUsername,
        row.orderId,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [search, tab])

  const selected =
    filteredRows.find((row) => row.id === selectedId) ||
    filteredRows[0] ||
    rows[0]

  const summary = useMemo(() => {
    const gross = filteredRows.reduce((sum, row) => sum + row.finalPrice, 0)
    const platform = filteredRows.reduce((sum, row) => sum + row.platformFee, 0)
    const author = filteredRows.reduce((sum, row) => sum + row.authorIncome, 0)

    return {
      gross,
      platform,
      author,
      paidOrders: filteredRows.length,
      pendingPayout: author,
      paidOut: 0,
    }
  }, [filteredRows])

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="author-income-page">
        <div className="author-income-wrap">
          <div className="author-income-header">
            <div>
              <h1 className="author-income-title">Author Page Book/PDF</h1>
              <div className="author-income-subtitle">
                Track all paid Book and PDF orders from Author Pages.
              </div>
            </div>

            <div className="author-income-actions">
              <input className="author-income-input" type="date" defaultValue="2026-08-01" />
              <input className="author-income-input" type="date" defaultValue="2026-08-29" />
              <button className="author-income-button">Export</button>
            </div>
          </div>

          <div className="author-income-summary">
            <div className="author-income-card">
              <div className="author-income-card-label">Gross Sales</div>
              <div className="author-income-card-value">{formatUsd(summary.gross)}</div>
              <div className="author-income-card-sub">Total paid by readers</div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">Platform Income 10%</div>
              <div className="author-income-card-value">{formatUsd(summary.platform)}</div>
              <div className="author-income-card-sub">Shadow platform fee</div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">Author Earnings 90%</div>
              <div className="author-income-card-value">{formatUsd(summary.author)}</div>
              <div className="author-income-card-sub good">Income to authors</div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">Paid Orders</div>
              <div className="author-income-card-value">{summary.paidOrders}</div>
              <div className="author-income-card-sub">Completed payments</div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">Pending Author Payout</div>
              <div className="author-income-card-value">{formatUsd(summary.pendingPayout)}</div>
              <div className="author-income-card-sub warn">Awaiting payout</div>
            </div>

            <div className="author-income-card">
              <div className="author-income-card-label">Paid Out</div>
              <div className="author-income-card-value">{formatUsd(summary.paidOut)}</div>
              <div className="author-income-card-sub good">Already paid to authors</div>
            </div>
          </div>

          <div className="author-income-tools">
            <input
              className="author-income-search"
              placeholder="Search by buyer, product, author, or order ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="author-income-filters">
              <button
                className={`author-income-chip ${range === 'today' ? 'active' : ''}`}
                onClick={() => setRange('today')}
              >
                Today
              </button>
              <button
                className={`author-income-chip ${range === '7d' ? 'active' : ''}`}
                onClick={() => setRange('7d')}
              >
                7D
              </button>
              <button
                className={`author-income-chip ${range === '30d' ? 'active' : ''}`}
                onClick={() => setRange('30d')}
              >
                30D
              </button>
              <button
                className={`author-income-chip ${range === 'month' ? 'active' : ''}`}
                onClick={() => setRange('month')}
              >
                This Month
              </button>
              <button className="author-income-chip">Filters</button>
            </div>
          </div>

          <div className="author-income-tabs">
            <button
              className={`author-income-tab ${tab === 'all' ? 'active' : ''}`}
              onClick={() => setTab('all')}
            >
              All
            </button>
            <button
              className={`author-income-tab ${tab === 'book' ? 'active' : ''}`}
              onClick={() => setTab('book')}
            >
              Book
            </button>
            <button
              className={`author-income-tab ${tab === 'pdf' ? 'active' : ''}`}
              onClick={() => setTab('pdf')}
            >
              PDF
            </button>
          </div>

          <div className="author-income-main">
            <section className="author-income-panel">
              <div className="author-income-panel-head">
                <div className="author-income-panel-title">Author Page Orders</div>
                <div className="author-income-panel-sub">
                  Showing {filteredRows.length} records
                </div>
              </div>

              <div className="author-income-table-wrap">
                <table className="author-income-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Buyer</th>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Author</th>
                      <th>Price</th>
                      <th>Platform 10%</th>
                      <th>Author 90%</th>
                      <th>Payment</th>
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
                          <div className="author-income-name">{row.date}</div>
                          <div className="author-income-small">{row.time}</div>
                        </td>
                        <td>
                          <div className="author-income-name">{row.buyer}</div>
                          <div className="author-income-small">{row.username}</div>
                        </td>
                        <td>
                          <div className="author-income-name">{row.product}</div>
                          <div className="author-income-small">
                            {row.type === 'book' ? 'Book' : 'PDF'}
                          </div>
                        </td>
                        <td>
                          <span className={`author-income-type ${row.type === 'pdf' ? 'pdf' : ''}`}>
                            {row.type === 'book' ? 'Book' : 'PDF'}
                          </span>
                        </td>
                        <td>
                          <div className="author-income-name">{row.author}</div>
                          <div className="author-income-small">{row.authorUsername}</div>
                        </td>
                        <td className="author-income-money">{formatUsd(row.finalPrice)}</td>
                        <td className="author-income-money">{formatUsd(row.platformFee)}</td>
                        <td className="author-income-money good">{formatUsd(row.authorIncome)}</td>
                        <td>
                          <span className="author-income-status">{row.paymentStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="author-income-pagination">
                <div className="author-income-small">Rows per page: 20</div>

                <div className="author-income-pages">
                  <button className="author-income-page-btn active">1</button>
                  <button className="author-income-page-btn">2</button>
                  <button className="author-income-page-btn">3</button>
                </div>
              </div>
            </section>

            <aside className="author-income-panel">
              <div className="author-income-panel-head">
                <div className="author-income-panel-title">Order Detail</div>
                <div className="author-income-panel-sub">Order ID: {selected.orderId}</div>
              </div>

              <div className="author-income-detail">
                <div className="author-income-section">
                  <div className="author-income-section-title">Overview</div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Purchased At</div>
                    <div className="author-income-v">{selected.date} {selected.time}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Payment</div>
                    <div className="author-income-v good">{selected.paymentStatus}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Order ID</div>
                    <div className="author-income-v">{selected.orderId}</div>
                  </div>
                </div>

                <div className="author-income-section">
                  <div className="author-income-section-title">Buyer</div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Name</div>
                    <div className="author-income-v">{selected.buyer}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Username</div>
                    <div className="author-income-v">{selected.username}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">User ID</div>
                    <div className="author-income-v">{selected.userId}</div>
                  </div>
                </div>

                <div className="author-income-section">
                  <div className="author-income-section-title">Product</div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Title</div>
                    <div className="author-income-v">{selected.product}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Type</div>
                    <div className="author-income-v">
                      {selected.type === 'book' ? 'Book' : 'PDF'}
                    </div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Access</div>
                    <div className="author-income-v">{selected.accessType}</div>
                  </div>
                </div>

                <div className="author-income-section">
                  <div className="author-income-section-title">Author</div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Name</div>
                    <div className="author-income-v">{selected.author}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Username</div>
                    <div className="author-income-v">{selected.authorUsername}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Author ID</div>
                    <div className="author-income-v">{selected.authorId}</div>
                  </div>
                </div>

                <div className="author-income-section">
                  <div className="author-income-section-title">Payment & Amount</div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Original Price</div>
                    <div className="author-income-v">{formatUsd(selected.originalPrice)}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Discount</div>
                    <div className="author-income-v">{formatUsd(selected.discount)}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Final Price</div>
                    <div className="author-income-v">{formatUsd(selected.finalPrice)}</div>
                  </div>
                </div>

                <div className="author-income-section">
                  <div className="author-income-section-title">Revenue Breakdown</div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Platform Fee 10%</div>
                    <div className="author-income-v">{formatUsd(selected.platformFee)}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Author Income 90%</div>
                    <div className="author-income-v good">{formatUsd(selected.authorIncome)}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Refund</div>
                    <div className="author-income-v">{formatUsd(selected.refund)}</div>
                  </div>
                  <div className="author-income-kv">
                    <div className="author-income-k">Net Author Payout</div>
                    <div className="author-income-v good">{formatUsd(selected.authorIncome - selected.refund)}</div>
                  </div>
                </div>

                <div className="author-income-detail-actions">
                  <button className="author-income-button">View User</button>
                  <button className="author-income-button primary">View Author</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
