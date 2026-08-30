import React, { useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const styles = `
  .mall-income-page { min-height: 100vh; background: #F8FAFC; }
  .mall-income-wrap { display: grid; gap: 18px; }
  .mall-income-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  .mall-income-title { margin: 0; color: #0F172A; font-size: 40px; font-weight: 950; letter-spacing: -0.04em; }
  .mall-income-subtitle { margin-top: 8px; color: #64748B; font-size: 14px; font-weight: 700; }
  .mall-income-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
  .mall-income-input, .mall-income-select { height: 44px; border: 1px solid #D8E0F0; border-radius: 14px; background: #FFFFFF; color: #0F172A; padding: 0 12px; font-size: 13px; font-weight: 800; outline: none; }
  .mall-income-button { height: 44px; border: 1px solid #C7D2FE; border-radius: 14px; background: #FFFFFF; color: #4F46E5; padding: 0 16px; font-size: 13px; font-weight: 900; cursor: pointer; }
  .mall-income-button.primary { border: 0; background: linear-gradient(135deg, #4F46E5, #312E81); color: #FFFFFF; }
  .mall-income-summary { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px; }
  .mall-income-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 22px; padding: 18px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04); }
  .mall-income-card-label { color: #64748B; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: .05em; }
  .mall-income-card-value { margin-top: 10px; color: #0F172A; font-size: 28px; font-weight: 950; letter-spacing: -0.04em; }
  .mall-income-card-sub { margin-top: 8px; color: #64748B; font-size: 12px; font-weight: 800; line-height: 1.55; }
  .mall-income-card-sub.good { color: #16A34A; }
  .mall-income-card-sub.warn { color: #D97706; }
  .mall-income-tools { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; align-items: center; }
  .mall-income-search { width: 100%; height: 46px; box-sizing: border-box; border: 1px solid #E2E8F0; border-radius: 14px; background: #FFFFFF; color: #0F172A; padding: 0 14px; font-size: 13px; font-weight: 800; outline: none; }
  .mall-income-filters { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
  .mall-income-chip { height: 42px; border: 1px solid #E2E8F0; border-radius: 13px; background: #FFFFFF; color: #475569; padding: 0 14px; font-size: 12px; font-weight: 900; cursor: pointer; }
  .mall-income-chip.active { background: #EEF2FF; border-color: #C7D2FE; color: #4338CA; }
  .mall-income-main { display: grid; grid-template-columns: minmax(0, 1.7fr) 370px; gap: 16px; align-items: start; }
  .mall-income-panel { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 24px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04); overflow: hidden; }
  .mall-income-panel-head { padding: 18px 20px; border-bottom: 1px solid #E2E8F0; }
  .mall-income-panel-title { color: #0F172A; font-size: 20px; font-weight: 950; }
  .mall-income-panel-sub { margin-top: 4px; color: #64748B; font-size: 12px; font-weight: 800; }
  .mall-income-table-wrap { overflow-x: auto; }
  .mall-income-table { width: 100%; border-collapse: collapse; min-width: 1160px; }
  .mall-income-table th { background: #F8FAFC; color: #64748B; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: .05em; padding: 14px 18px; text-align: left; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
  .mall-income-table td { padding: 16px 18px; border-bottom: 1px solid #F1F5F9; color: #0F172A; font-size: 13px; font-weight: 800; vertical-align: top; }
  .mall-income-table tbody tr { cursor: pointer; }
  .mall-income-table tbody tr.active { background: #F5F3FF; }
  .mall-income-name { color: #0F172A; font-size: 14px; font-weight: 950; }
  .mall-income-small { margin-top: 3px; color: #64748B; font-size: 12px; font-weight: 750; }
  .mall-income-money { font-weight: 950; white-space: nowrap; }
  .mall-income-money.good { color: #16A34A; }
  .mall-income-status { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 950; white-space: nowrap; }
  .mall-income-status.under_review { background: #FEF3C7; color: #92400E; }
  .mall-income-status.confirmed { background: #DBEAFE; color: #1D4ED8; }
  .mall-income-status.preparing { background: #F3E8FF; color: #7E22CE; }
  .mall-income-status.shipped { background: #DCFCE7; color: #15803D; }
  .mall-income-status.completed { background: #D1FAE5; color: #047857; }
  .mall-income-detail { display: grid; gap: 18px; padding: 20px; }
  .mall-income-section { border: 1px solid #E2E8F0; border-radius: 18px; padding: 16px; background: #FFFFFF; }
  .mall-income-section-title { color: #4F46E5; font-size: 14px; font-weight: 950; margin-bottom: 12px; }
  .mall-income-kv { display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 10px; }
  .mall-income-kv:last-child { margin-bottom: 0; }
  .mall-income-k { color: #64748B; font-size: 12px; font-weight: 850; }
  .mall-income-v { color: #0F172A; font-size: 12px; font-weight: 900; text-align: right; overflow-wrap: anywhere; }
  .mall-income-v.good { color: #16A34A; }
  .mall-income-detail-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .mall-income-pagination { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; }
  .mall-income-pages { display: flex; gap: 8px; align-items: center; }
  .mall-income-page-btn { width: 36px; height: 36px; border-radius: 12px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #475569; font-size: 12px; font-weight: 900; cursor: pointer; }
  .mall-income-page-btn.active { background: #EEF2FF; border-color: #C7D2FE; color: #4338CA; }
  @media (max-width: 1380px) {
    .mall-income-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .mall-income-main { grid-template-columns: 1fr; }
  }
  @media (max-width: 760px) {
    .mall-income-header, .mall-income-tools { display: grid; grid-template-columns: 1fr; }
    .mall-income-summary { grid-template-columns: 1fr; }
    .mall-income-actions, .mall-income-filters { justify-content: stretch; }
    .mall-income-input, .mall-income-select, .mall-income-button, .mall-income-chip { width: 100%; box-sizing: border-box; }
    .mall-income-detail-actions { grid-template-columns: 1fr; }
  }
`

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function statusText(status) {
  return String(status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const rows = [
  { id: 1, date: 'Aug 29, 2026', time: '22:14', buyer: 'Luna Star', username: '@lunastar', userId: 'USR-100552', phone: '012 345 678', product: 'The Heiress Returns', publisher: 'Shadow Press', seller: '@shadowpress', quantity: 1, unitPrice: 12, subtotal: 12, discount: 0, shipping: 1.5, totalPaid: 13.5, platformIncome: 12, status: 'under_review', payment: 'Paid', orderId: 'SM-20260829-000842', province: 'Phnom Penh', address: 'Sen Sok, Phnom Penh', tracking: '-' },
  { id: 2, date: 'Aug 29, 2026', time: '21:52', buyer: 'Night Owl', username: '@nightowl', userId: 'USR-100551', phone: '010 452 889', product: 'Rebirth of the Phoenix', publisher: 'Moon House', seller: '@moonhouse', quantity: 2, unitPrice: 7.5, subtotal: 15, discount: 0, shipping: 2, totalPaid: 17, platformIncome: 15, status: 'confirmed', payment: 'Paid', orderId: 'SM-20260829-000841', province: 'Kandal', address: 'Ta Khmau, Kandal', tracking: '-' },
  { id: 3, date: 'Aug 29, 2026', time: '21:36', buyer: 'Sweet Reader', username: '@sweetreader', userId: 'USR-100550', phone: '096 124 551', product: 'Silent Vows', publisher: 'Blue Ink', seller: '@blueink', quantity: 1, unitPrice: 9.5, subtotal: 9.5, discount: 0, shipping: 1.5, totalPaid: 11, platformIncome: 9.5, status: 'preparing', payment: 'Paid', orderId: 'SM-20260829-000840', province: 'Phnom Penh', address: 'Toul Kork, Phnom Penh', tracking: '-' },
  { id: 4, date: 'Aug 29, 2026', time: '20:58', buyer: 'Book Lover', username: '@booklover', userId: 'USR-100549', phone: '088 332 774', product: 'Love After the Storm', publisher: 'Story House', seller: '@storyhouse', quantity: 1, unitPrice: 11, subtotal: 11, discount: 1, shipping: 2, totalPaid: 12, platformIncome: 10, status: 'shipped', payment: 'Paid', orderId: 'SM-20260829-000839', province: 'Siem Reap', address: 'Svay Dangkum, Siem Reap', tracking: 'J&T-984214' },
  { id: 5, date: 'Aug 29, 2026', time: '20:41', buyer: 'Starlight', username: '@starlight', userId: 'USR-100548', phone: '097 552 161', product: 'Bound by Fate', publisher: 'Nova Books', seller: '@novabooks', quantity: 1, unitPrice: 8, subtotal: 8, discount: 0, shipping: 1.5, totalPaid: 9.5, platformIncome: 8, status: 'completed', payment: 'Paid', orderId: 'SM-20260829-000838', province: 'Battambang', address: 'Battambang City', tracking: 'VET-220481' },
]

export default function AdminShadowMallIncomePage() {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState('30d')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(rows[0].id)

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (status !== 'all' && row.status !== status) return false
      if (!keyword) return true

      return [
        row.buyer,
        row.username,
        row.product,
        row.publisher,
        row.seller,
        row.orderId,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  }, [search, status])

  const selected =
    filteredRows.find((row) => row.id === selectedId) ||
    filteredRows[0] ||
    rows[0]

  const summary = useMemo(() => {
    const gross = filteredRows.reduce((sum, row) => sum + row.subtotal - row.discount, 0)
    const shipping = filteredRows.reduce((sum, row) => sum + row.shipping, 0)
    const platform = filteredRows.reduce((sum, row) => sum + row.platformIncome, 0)
    const completed = filteredRows.filter((row) => row.status === 'completed').length
    const active = filteredRows.filter((row) => row.status !== 'completed').length

    return {
      gross,
      shipping,
      platform,
      total: filteredRows.length,
      completed,
      active,
    }
  }, [filteredRows])

  return (
    <AdminLayout>
      <style>{styles}</style>

      <div className="mall-income-page">
        <div className="mall-income-wrap">
          <div className="mall-income-header">
            <div>
              <h1 className="mall-income-title">Shadow Mall</h1>
              <div className="mall-income-subtitle">
                Track paid product orders, shipping, platform income, and order status.
              </div>
            </div>

            <div className="mall-income-actions">
              <input className="mall-income-input" type="date" defaultValue="2026-08-01" />
              <input className="mall-income-input" type="date" defaultValue="2026-08-29" />
              <button className="mall-income-button">Export</button>
            </div>
          </div>

          <div className="mall-income-summary">
            <div className="mall-income-card">
              <div className="mall-income-card-label">Gross Product Sales</div>
              <div className="mall-income-card-value">{formatUsd(summary.gross)}</div>
              <div className="mall-income-card-sub">Shipping excluded</div>
            </div>
            <div className="mall-income-card">
              <div className="mall-income-card-label">Platform Income</div>
              <div className="mall-income-card-value">{formatUsd(summary.platform)}</div>
              <div className="mall-income-card-sub good">Product income</div>
            </div>
            <div className="mall-income-card">
              <div className="mall-income-card-label">Shipping Collected</div>
              <div className="mall-income-card-value">{formatUsd(summary.shipping)}</div>
              <div className="mall-income-card-sub warn">Excluded from platform income</div>
            </div>
            <div className="mall-income-card">
              <div className="mall-income-card-label">Total Orders</div>
              <div className="mall-income-card-value">{summary.total}</div>
              <div className="mall-income-card-sub">Paid order records</div>
            </div>
            <div className="mall-income-card">
              <div className="mall-income-card-label">Completed Orders</div>
              <div className="mall-income-card-value">{summary.completed}</div>
              <div className="mall-income-card-sub good">Delivered and completed</div>
            </div>
            <div className="mall-income-card">
              <div className="mall-income-card-label">Active Orders</div>
              <div className="mall-income-card-value">{summary.active}</div>
              <div className="mall-income-card-sub">Still in progress</div>
            </div>
          </div>

          <div className="mall-income-tools">
            <input
              className="mall-income-search"
              placeholder="Search by buyer, product, publisher, or order ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="mall-income-filters">
              <button
                className={`mall-income-chip ${range === 'today' ? 'active' : ''}`}
                onClick={() => setRange('today')}
              >
                Today
              </button>
              <button
                className={`mall-income-chip ${range === '7d' ? 'active' : ''}`}
                onClick={() => setRange('7d')}
              >
                7D
              </button>
              <button
                className={`mall-income-chip ${range === '30d' ? 'active' : ''}`}
                onClick={() => setRange('30d')}
              >
                30D
              </button>
              <select
                className="mall-income-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All Status</option>
                <option value="under_review">Under Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mall-income-main">
            <section className="mall-income-panel">
              <div className="mall-income-panel-head">
                <div className="mall-income-panel-title">Shadow Mall Orders</div>
                <div className="mall-income-panel-sub">Showing {filteredRows.length} records</div>
              </div>

              <div className="mall-income-table-wrap">
                <table className="mall-income-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Buyer</th>
                      <th>Product</th>
                      <th>Publisher / Seller</th>
                      <th>Qty</th>
                      <th>Product Total</th>
                      <th>Shipping</th>
                      <th>Order Status</th>
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
                          <div className="mall-income-name">{row.date}</div>
                          <div className="mall-income-small">{row.time}</div>
                        </td>
                        <td>
                          <div className="mall-income-name">{row.buyer}</div>
                          <div className="mall-income-small">{row.username}</div>
                        </td>
                        <td>
                          <div className="mall-income-name">{row.product}</div>
                          <div className="mall-income-small">{formatUsd(row.unitPrice)} each</div>
                        </td>
                        <td>
                          <div className="mall-income-name">{row.publisher}</div>
                          <div className="mall-income-small">{row.seller}</div>
                        </td>
                        <td className="mall-income-money">{row.quantity}</td>
                        <td className="mall-income-money">{formatUsd(row.subtotal - row.discount)}</td>
                        <td className="mall-income-money">{formatUsd(row.shipping)}</td>
                        <td>
                          <span className={`mall-income-status ${row.status}`}>
                            {statusText(row.status)}
                          </span>
                        </td>
                        <td className="mall-income-money good">{row.payment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mall-income-pagination">
                <div className="mall-income-small">Rows per page: 20</div>
                <div className="mall-income-pages">
                  <button className="mall-income-page-btn active">1</button>
                  <button className="mall-income-page-btn">2</button>
                  <button className="mall-income-page-btn">3</button>
                </div>
              </div>
            </section>

            <aside className="mall-income-panel">
              <div className="mall-income-panel-head">
                <div className="mall-income-panel-title">Order Detail</div>
                <div className="mall-income-panel-sub">Order ID: {selected.orderId}</div>
              </div>

              <div className="mall-income-detail">
                <div className="mall-income-section">
                  <div className="mall-income-section-title">Overview</div>
                  <div className="mall-income-kv"><div className="mall-income-k">Purchased At</div><div className="mall-income-v">{selected.date} {selected.time}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Order Status</div><div className="mall-income-v">{statusText(selected.status)}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Payment</div><div className="mall-income-v good">{selected.payment}</div></div>
                </div>

                <div className="mall-income-section">
                  <div className="mall-income-section-title">Buyer</div>
                  <div className="mall-income-kv"><div className="mall-income-k">Name</div><div className="mall-income-v">{selected.buyer}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Username</div><div className="mall-income-v">{selected.username}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">User ID</div><div className="mall-income-v">{selected.userId}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Phone</div><div className="mall-income-v">{selected.phone}</div></div>
                </div>

                <div className="mall-income-section">
                  <div className="mall-income-section-title">Product & Seller</div>
                  <div className="mall-income-kv"><div className="mall-income-k">Product</div><div className="mall-income-v">{selected.product}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Publisher</div><div className="mall-income-v">{selected.publisher}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Seller</div><div className="mall-income-v">{selected.seller}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Quantity</div><div className="mall-income-v">{selected.quantity}</div></div>
                </div>

                <div className="mall-income-section">
                  <div className="mall-income-section-title">Payment & Amount</div>
                  <div className="mall-income-kv"><div className="mall-income-k">Unit Price</div><div className="mall-income-v">{formatUsd(selected.unitPrice)}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Subtotal</div><div className="mall-income-v">{formatUsd(selected.subtotal)}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Discount</div><div className="mall-income-v">{formatUsd(selected.discount)}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Shipping</div><div className="mall-income-v">{formatUsd(selected.shipping)}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Total Paid</div><div className="mall-income-v">{formatUsd(selected.totalPaid)}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Platform Income</div><div className="mall-income-v good">{formatUsd(selected.platformIncome)}</div></div>
                </div>

                <div className="mall-income-section">
                  <div className="mall-income-section-title">Shipping</div>
                  <div className="mall-income-kv"><div className="mall-income-k">Province</div><div className="mall-income-v">{selected.province}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Address</div><div className="mall-income-v">{selected.address}</div></div>
                  <div className="mall-income-kv"><div className="mall-income-k">Tracking</div><div className="mall-income-v">{selected.tracking}</div></div>
                </div>

                <div className="mall-income-detail-actions">
                  <button className="mall-income-button">View User</button>
                  <button className="mall-income-button primary">Open Order</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
