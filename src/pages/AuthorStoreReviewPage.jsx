import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  body {
    margin: 0;
    background: #F8FAFC;
    color: #0F172A;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .orders-page {
    min-height: 100vh;
    background: #F8FAFC;
  }

  .orders-body {
    padding: 26px;
    max-width: 1380px;
    margin: 0 auto;
  }

  .orders-top {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    margin-bottom: 16px;
  }

  .orders-kicker {
    color: #4F46E5;
    background: #EEF2FF;
    border-radius: 999px;
    padding: 7px 11px;
    display: inline-flex;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .orders-heading {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin: 0;
  }

  .orders-note {
    color: #64748B;
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
    line-height: 1.6;
  }

  .tab-row {
    display: flex;
    gap: 10px;
    margin-top: 18px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .tab-button {
    height: 40px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 0 16px;
    background: #FFFFFF;
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .tab-button.active {
    border: 0;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .orders-toolbar {
    margin-top: 18px;
    display: grid;
    grid-template-columns: minmax(220px, 1fr) 190px 120px;
    gap: 10px;
  }

  .input,
  .select {
    height: 42px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 800;
    outline: none;
  }

  .refresh-button {
    border: 0;
    border-radius: 14px;
    background: #4F46E5;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .orders-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
    overflow: hidden;
  }

  .orders-card-head {
    padding: 18px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .orders-card-title {
    font-size: 16px;
    font-weight: 900;
  }

  .count-pill {
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 7px 11px;
    font-size: 11px;
    font-weight: 900;
  }

  .message {
    margin: 14px 20px 0;
    border-radius: 14px;
    padding: 12px 14px;
    background: #FEF3C7;
    color: #92400E;
    font-size: 12px;
    font-weight: 800;
  }

  .empty {
    padding: 54px 20px;
    text-align: center;
    color: #94A3B8;
    font-size: 13px;
    font-weight: 900;
  }

  .order-row {
    padding: 18px 20px;
    border-bottom: 1px solid #F1F5F9;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(260px, 1fr) minmax(260px, 1fr) 180px;
    gap: 16px;
    align-items: start;
  }

  .order-row:last-child {
    border-bottom: 0;
  }

  .order-id {
    font-size: 13px;
    font-weight: 900;
    color: #0F172A;
  }

  .small {
    color: #64748B;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.6;
    margin-top: 4px;
  }

  .strong {
    color: #0F172A;
    font-weight: 900;
  }

  .status-pill {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    margin-top: 8px;
  }

  .status-under_review { background: #FEF3C7; color: #92400E; }
  .status-confirmed { background: #DBEAFE; color: #1D4ED8; }
  .status-preparing { background: #F3E8FF; color: #7E22CE; }
  .status-shipped { background: #DCFCE7; color: #15803D; }
  .status-completed { background: #D1FAE5; color: #047857; }
  .status-cancelled, .status-rejected { background: #FEE2E2; color: #B91C1C; }

  .book-list {
    display: grid;
    gap: 8px;
  }

  .book-item {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .book-cover {
    width: 42px;
    height: 58px;
    border-radius: 9px;
    background: #F1F5F9;
    overflow: hidden;
    flex-shrink: 0;
  }

  .book-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .actions {
    display: grid;
    gap: 8px;
  }

  .action-button {
    height: 36px;
    border: 0;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .confirm { background: #DBEAFE; color: #1D4ED8; }
  .prepare { background: #F3E8FF; color: #7E22CE; }
  .ship { background: #DCFCE7; color: #15803D; }
  .complete { background: #D1FAE5; color: #047857; }
  .cancel { background: #FEE2E2; color: #B91C1C; }

  .pager {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid #F1F5F9;
  }

  .page-button {
    height: 36px;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #0F172A;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .page-button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  @media (max-width: 1100px) {
    .order-row {
      grid-template-columns: 1fr;
    }

    .orders-toolbar {
      grid-template-columns: 1fr;
    }
  }
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function formatUsd(value) {
  const number = Number(value || 0)
  return `$${number.toFixed(2)}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function statusLabel(status) {
  return String(status || '').replace(/_/g, ' ')
}

function BuyerInfo({ buyer }) {
  return (
    <div>
      <div className="strong">Buyer</div>
      <div className="small">Name: <span className="strong">{buyer?.name || buyer?.buyer_name || '-'}</span></div>
      <div className="small">Phone: <span className="strong">{buyer?.phone_number || buyer?.buyer_phone || '-'}</span></div>
      {buyer?.telegram_username ? <div className="small">Telegram: <span className="strong">{buyer.telegram_username}</span></div> : null}
      {buyer?.facebook_link ? <div className="small">Facebook: <span className="strong">{buyer.facebook_link}</span></div> : null}
      <div className="small">Province: <span className="strong">{buyer?.province_city || '-'}</span></div>
      <div className="small">Address: <span className="strong">{buyer?.delivery_address || '-'}</span></div>
      {buyer?.delivery_note ? <div className="small">Note: <span className="strong">{buyer.delivery_note}</span></div> : null}
    </div>
  )
}

function BooksInfo({ items }) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <div>
      <div className="strong">Products</div>
      <div className="book-list" style={{ marginTop: 8 }}>
        {safeItems.map((item, index) => (
          <div className="book-item" key={`${item.product_id || index}`}>
            <div className="book-cover">
              {item.cover_url ? <img src={item.cover_url} alt={item.title || item.product_title || 'Product'} /> : null}
            </div>
            <div>
              <div className="small"><span className="strong">{item.title || item.product_title || 'Product'}</span></div>
              <div className="small">Qty: {item.quantity || 1} · {formatUsd(item.unit_price_usd || item.unit_price)} each</div>
              <div className="small">{item.product_type === 'pdf' ? 'PDF' : 'Book'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AuthorStoreReviewPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('under_review')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const totalText = useMemo(() => `${meta.total || 0} orders`, [meta.total])

  async function fetchOrders(nextPage = page) {
    try {
      setLoading(true)
      setMessage('')

      const token = getAdminToken()
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: '20',
        status,
        q: query.trim(),
      })

      const response = await fetch(`${API_URL}/api/author-store/admin/orders?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load Author Store orders')
      }

      setOrders(data.orders || [])
      setMeta({
        total: data.total || 0,
        total_pages: data.total_pages || 1,
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
      setPage(nextPage)
    } catch (error) {
      setMessage(error.message || 'Failed to load Author Store orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId, nextStatus) {
    try {
      setMessage('')

      const token = getAdminToken()
      const response = await fetch(`${API_URL}/api/author-store/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to update order')
      }

      setMessage(`Order ${orderId} updated to ${statusLabel(nextStatus)}.`)
      fetchOrders(page)
    } catch (error) {
      setMessage(error.message || 'Failed to update order')
    }
  }

  useEffect(() => {
    fetchOrders(1)
  }, [status])

  return (
    <AdminLayout
      title="Author Store Review"
      subtitle="Review paid or reviewed author store orders."
    >
      <style>{styles}</style>

      <div className="orders-page">
        <main className="orders-body">
          <section className="orders-top">
            <div className="orders-kicker">✍️ Author Store</div>
            <h1 className="orders-heading">Review Author</h1>
            <p className="orders-note">
              Shows only paid or reviewed author store orders. Waiting payment and expired orders are hidden from this report.
            </p>

            <div className="tab-row">
              <button type="button" className="tab-button" onClick={() => navigate('/shadow-mall')}>
                Shadow Mall Products
              </button>
              <button type="button" className="tab-button" onClick={() => navigate('/shadow-mall/orders')}>
                Shadow Mall Review
              </button>
              <button type="button" className="tab-button active">
                Review Author
              </button>
              <button type="button" className="tab-button" onClick={() => navigate('/shadow-mall/publishers')}>
                Publishers
              </button>
            </div>

            <div className="orders-toolbar">
              <input
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Order ID or ABA Trx ID..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') fetchOrders(1)
                }}
              />

              <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="under_review">Under Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Reports</option>
              </select>

              <button type="button" className="refresh-button" onClick={() => fetchOrders(1)}>
                Search
              </button>
            </div>
          </section>

          <section className="orders-card">
            <div className="orders-card-head">
              <div>
                <div className="orders-card-title">Author Order Report</div>
                <div className="small">Admin review, delivery preparation, PDF/product checks, and status tracking.</div>
              </div>

              <div className="count-pill">{totalText}</div>
            </div>

            {message ? <div className="message">{message}</div> : null}

            {loading ? (
              <div className="empty">Loading orders...</div>
            ) : orders.length ? (
              orders.map((order) => {
                const orderId = order.order_id || order.order_number || order.id
                const buyer = order.buyer_profile || {
                  name: order.buyer_name,
                  phone_number: order.buyer_phone,
                  delivery_address: order.delivery_address,
                }

                return (
                  <div className="order-row" key={orderId}>
                    <div>
                      <div className="order-id">{orderId}</div>
                      <div className={`status-pill status-${order.status || order.order_status}`}>{statusLabel(order.status || order.order_status)}</div>
                      <div className="small">Amount: <span className="strong">{formatUsd(order.total_usd || order.total_amount)}</span></div>
                      <div className="small">ABA Trx: <span className="strong">{order.aba_transaction_id || '-'}</span></div>
                      <div className="small">Paid: <span className="strong">{formatDate(order.paid_at)}</span></div>
                      <div className="small">Updated: <span className="strong">{formatDate(order.updated_at)}</span></div>
                    </div>

                    <BuyerInfo buyer={buyer} />

                    <BooksInfo items={order.items || []} />

                    <div className="actions">
                      {(order.status || order.order_status) === 'under_review' ? (
                        <button type="button" className="action-button confirm" onClick={() => updateOrderStatus(orderId, 'confirmed')}>
  Approve Order
</button>
                      ) : null}

                      {['under_review', 'confirmed'].includes(order.status || order.order_status) ? (
                        <button type="button" className="action-button prepare" onClick={() => updateOrderStatus(orderId, 'preparing')}>
                          Mark Preparing
                        </button>
                      ) : null}

                      {['confirmed', 'preparing'].includes(order.status || order.order_status) ? (
                        <button type="button" className="action-button ship" onClick={() => updateOrderStatus(orderId, 'shipped')}>
                          Mark Shipped
                        </button>
                      ) : null}

                      {(order.status || order.order_status) === 'shipped' ? (
                        <button type="button" className="action-button complete" onClick={() => updateOrderStatus(orderId, 'completed')}>
                          Complete
                        </button>
                      ) : null}

                      {!['completed', 'cancelled', 'rejected'].includes(order.status || order.order_status) ? (
                        <button type="button" className="action-button cancel" onClick={() => updateOrderStatus(orderId, 'cancelled')}>
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="empty">No orders found.</div>
            )}

            <div className="pager">
              <button className="page-button" disabled={!meta.has_prev} onClick={() => fetchOrders(page - 1)}>
                Previous
              </button>
              <button className="page-button" disabled>
                Page {page} / {meta.total_pages || 1}
              </button>
              <button className="page-button" disabled={!meta.has_next} onClick={() => fetchOrders(page + 1)}>
                Next
              </button>
            </div>
          </section>
        </main>
      </div>
    </AdminLayout>
  )
}
