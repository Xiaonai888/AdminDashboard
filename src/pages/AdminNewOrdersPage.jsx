import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const styles = `
  .new-orders-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .new-orders-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
  }

  .new-orders-summary {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .new-orders-summary-card {
    min-width: 150px;
    padding: 14px 16px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
  }

  .new-orders-summary-label {
    color: #64748B;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .5px;
    text-transform: uppercase;
  }

  .new-orders-summary-value {
    margin-top: 5px;
    color: #0F172A;
    font-size: 24px;
    font-weight: 900;
  }

  .new-orders-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .new-orders-filter,
  .new-orders-button {
    min-height: 40px;
    padding: 0 14px;
    border: 1px solid #E2E8F0;
    border-radius: 11px;
    background: #FFFFFF;
    color: #475569;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .new-orders-filter.active {
    border-color: #4F46E5;
    background: #EEF2FF;
    color: #4F46E5;
  }

  .new-orders-button.primary {
    border-color: #4F46E5;
    background: #4F46E5;
    color: #FFFFFF;
  }

  .new-orders-panel {
    overflow: hidden;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    background: #FFFFFF;
  }

  .new-orders-table-wrap {
    overflow-x: auto;
  }

  .new-orders-table {
    width: 100%;
    min-width: 1050px;
    border-collapse: collapse;
  }

  .new-orders-table th {
    padding: 13px 16px;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
    color: #64748B;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .45px;
    text-align: left;
    text-transform: uppercase;
  }

  .new-orders-table td {
    padding: 15px 16px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    font-size: 13px;
    vertical-align: middle;
  }

  .new-orders-table tr:last-child td {
    border-bottom: 0;
  }

  .new-orders-source {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .new-orders-source-badge,
  .new-orders-status {
    width: fit-content;
    padding: 4px 9px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 900;
  }

  .new-orders-source-badge.mall {
    background: #EEF2FF;
    color: #4F46E5;
  }

  .new-orders-source-badge.author {
    background: #ECFDF5;
    color: #059669;
  }

  .new-orders-store-name {
    max-width: 190px;
    color: #64748B;
    font-size: 11px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .new-orders-order-id {
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
  }

  .new-orders-subtext {
    margin-top: 3px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 700;
  }

  .new-orders-total {
    color: #0F172A;
    font-size: 14px;
    font-weight: 900;
  }

  .new-orders-status {
    background: #FEF3C7;
    color: #B45309;
    text-transform: capitalize;
  }

  .new-orders-open {
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid #C7D2FE;
    border-radius: 9px;
    background: #EEF2FF;
    color: #4F46E5;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    cursor: pointer;
  }

  .new-orders-state {
    padding: 48px 20px;
    color: #64748B;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
  }

  .new-orders-error {
    padding: 14px 16px;
    border: 1px solid #FECACA;
    border-radius: 12px;
    background: #FEF2F2;
    color: #B91C1C;
    font-size: 12px;
    font-weight: 800;
  }

  .new-orders-footer {
    display: flex;
    justify-content: center;
    padding: 16px;
    border-top: 1px solid #F1F5F9;
  }

  @media (max-width: 700px) {
    .new-orders-summary {
      width: 100%;
    }

    .new-orders-summary-card {
      flex: 1;
      min-width: 130px;
    }

    .new-orders-actions {
      width: 100%;
    }

    .new-orders-filter,
    .new-orders-button {
      flex: 1;
    }
  }
`

function getAdminToken() {
  return (
    sessionStorage.getItem('shadow_admin_token') ||
    localStorage.getItem('shadow_admin_token') ||
    ''
  )
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatProduct(order) {
  const items = Array.isArray(order?.items) ? order.items : []
  if (!items.length) return { title: 'Order products', extra: '' }

  const first = items[0] || {}
  const title =
    first.product_title ||
    first.title ||
    first.product_name ||
    'Product'
  const extra = items.length > 1 ? `+${items.length - 1} more` : ''

  return { title, extra }
}

export default function AdminNewOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [source, setSource] = useState('all')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const loadOrders = async (
    targetPage = 1,
    replace = false,
    targetSource = source
  ) => {
    try {
      replace ? setLoading(true) : setLoadingMore(true)
      setError('')

      const token = getAdminToken()
      const response = await fetch(
        `${API_URL}/api/admin/community/dashboard/orders?page=${targetPage}&limit=20&source=${targetSource}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load paid orders')
      }

      const nextOrders = Array.isArray(data.orders) ? data.orders : []

      setOrders((current) =>
        replace ? nextOrders : [...current, ...nextOrders]
      )
      setPage(Number(data.page || targetPage))
      setTotal(Number(data.total || 0))
      setHasNext(Boolean(data.has_next))
    } catch (loadError) {
      setError(loadError.message || 'Failed to load paid orders')
      if (replace) setOrders([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadOrders(1, true)
  }, [])

  const changeSource = (nextSource) => {
    setSource(nextSource)
    setPage(1)
    loadOrders(1, true, nextSource)
  }

  const openOrderManager = (order) => {
    navigate(
      order.source === 'author_store'
        ? '/author-store/review'
        : '/shadow-mall/orders'
    )
  }

  return (
    <AdminLayout
      title="New Orders"
      subtitle="Successful paid orders from Shadow Mall and all Author Stores."
    >
      <style>{styles}</style>

      <div className="new-orders-page">
        <div className="new-orders-toolbar">
          <div className="new-orders-summary">
            <div className="new-orders-summary-card">
              <div className="new-orders-summary-label">Total Paid Orders</div>
              <div className="new-orders-summary-value">
                {total.toLocaleString()}
              </div>
            </div>

            <div className="new-orders-summary-card">
              <div className="new-orders-summary-label">Loaded</div>
              <div className="new-orders-summary-value">
                {orders.length.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="new-orders-actions">
            <button
              type="button"
              className={`new-orders-filter ${source === 'all' ? 'active' : ''}`}
              onClick={() => changeSource('all')}
            >
              All
            </button>

            <button
              type="button"
              className={`new-orders-filter ${source === 'shadow_mall' ? 'active' : ''}`}
              onClick={() => changeSource('shadow_mall')}
            >
              Shadow Mall
            </button>

            <button
              type="button"
              className={`new-orders-filter ${source === 'author_store' ? 'active' : ''}`}
              onClick={() => changeSource('author_store')}
            >
              Author Store
            </button>

            <button
              type="button"
              className="new-orders-button primary"
              onClick={() => loadOrders(1, true, source)}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? <div className="new-orders-error">{error}</div> : null}

        <div className="new-orders-panel">
          {loading ? (
            <div className="new-orders-state">Loading newest paid orders...</div>
          ) : orders.length === 0 ? (
            <div className="new-orders-state">No paid orders found.</div>
          ) : (
            <div className="new-orders-table-wrap">
              <table className="new-orders-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const product = formatProduct(order)
                    const isAuthorStore = order.source === 'author_store'

                    return (
                      <tr key={`${order.source}-${order.id}`}>
                        <td>
                          <div className="new-orders-source">
                            <span
                              className={`new-orders-source-badge ${
                                isAuthorStore ? 'author' : 'mall'
                              }`}
                            >
                              {order.source_label ||
                                (isAuthorStore
                                  ? 'All Author Store'
                                  : 'Shadow Mall')}
                            </span>
                            <span className="new-orders-store-name">
                              {order.store_name || '-'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="new-orders-order-id">
                            {order.order_id || order.id}
                          </div>
                        </td>

                        <td>
                          <div>{order.buyer_name || 'Reader'}</div>
                        </td>

                        <td>
                          <div>{product.title}</div>
                          {product.extra ? (
                            <div className="new-orders-subtext">
                              {product.extra}
                            </div>
                          ) : null}
                        </td>

                        <td>
                          <div className="new-orders-total">
                            ${Number(order.total_usd || 0).toFixed(2)}
                          </div>
                        </td>

                        <td>
                          <span className="new-orders-status">
                            {String(
                              order.payment_status ||
                                order.status ||
                                'paid'
                            ).replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            order.paid_at ||
                              order.updated_at ||
                              order.created_at
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="new-orders-open"
                            onClick={() => openOrderManager(order)}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && hasNext ? (
            <div className="new-orders-footer">
              <button
                type="button"
                className="new-orders-button primary"
                onClick={() => loadOrders(page + 1, false, source)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load 20 More'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  )
}
