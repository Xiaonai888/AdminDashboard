import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://shadow-backend-kucw.onrender.com')

const styles = `
  .arv-page{max-width:1380px;margin:0 auto}.arv-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.arv-title{margin:0;color:#0f172a;font-size:28px;font-weight:950;letter-spacing:-.04em}.arv-desc{margin:7px 0 0;color:#64748b;font-size:13px;font-weight:650;line-height:1.6}.arv-refresh{min-height:42px;border:1px solid #dbe3ef;border-radius:13px;background:#fff;padding:0 15px;color:#334155;font:inherit;font-size:12px;font-weight:900;cursor:pointer}.arv-refresh:disabled{opacity:.5;cursor:not-allowed}.arv-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:16px}.arv-stat{border:1px solid #e2e8f0;border-radius:18px;background:#fff;padding:16px;box-shadow:0 8px 26px rgba(15,23,42,.04)}.arv-stat-label{color:#64748b;font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.08em}.arv-stat-value{margin-top:6px;color:#0f172a;font-size:25px;font-weight:950}.arv-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 190px 210px;gap:10px;margin-bottom:16px}.arv-input,.arv-select{width:100%;min-height:44px;border:1px solid #dbe3ef;border-radius:13px;background:#fff;padding:0 13px;color:#0f172a;font:inherit;font-size:13px;font-weight:700;outline:none}.arv-input:focus,.arv-select:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}.arv-msg{margin-bottom:14px;border-radius:13px;padding:11px 13px;background:#eef2ff;color:#4338ca;font-size:12px;font-weight:800}.arv-panel{overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 10px 32px rgba(15,23,42,.05)}.arv-table-wrap{overflow-x:auto}.arv-table{width:100%;border-collapse:collapse;min-width:1020px}.arv-table th{padding:12px 14px;border-bottom:1px solid #e2e8f0;background:#f8fafc;color:#64748b;text-align:left;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.arv-table td{padding:14px;border-bottom:1px solid #eef2f7;vertical-align:top;color:#334155;font-size:12px}.arv-table tr:last-child td{border-bottom:0}.arv-person{display:flex;align-items:center;gap:10px;min-width:190px}.arv-avatar{display:flex;height:38px;width:38px;flex:0 0 38px;align-items:center;justify-content:center;overflow:hidden;border-radius:999px;background:#eef2ff;color:#4338ca;font-size:13px;font-weight:950}.arv-avatar img{height:100%;width:100%;object-fit:cover}.arv-name{color:#0f172a;font-size:13px;font-weight:900}.arv-sub{margin-top:2px;color:#94a3b8;font-size:11px;font-weight:700}.arv-review{max-width:420px;white-space:pre-wrap;overflow-wrap:anywhere;color:#334155;line-height:1.6}.arv-badge{display:inline-flex;align-items:center;min-height:27px;border-radius:999px;padding:0 9px;font-size:11px;font-weight:900}.arv-badge.yes{background:#ecfdf5;color:#047857}.arv-badge.no{background:#fff1f2;color:#be123c}.arv-badge.active{background:#eff6ff;color:#1d4ed8}.arv-badge.deleted{background:#f1f5f9;color:#64748b}.arv-report{margin-top:6px;color:#dc2626;font-size:11px;font-weight:900}.arv-actions{display:flex;flex-wrap:wrap;gap:7px}.arv-btn{min-height:34px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;padding:0 11px;color:#334155;font:inherit;font-size:11px;font-weight:900;cursor:pointer}.arv-btn.danger{border-color:#fecaca;background:#fff1f2;color:#b91c1c}.arv-btn.restore{border-color:#bbf7d0;background:#ecfdf5;color:#047857}.arv-btn:disabled{opacity:.5;cursor:not-allowed}.arv-empty{padding:48px 20px;text-align:center;color:#94a3b8;font-size:13px;font-weight:800}.arv-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border-top:1px solid #e2e8f0}.arv-page-info{color:#64748b;font-size:12px;font-weight:800}.arv-pager{display:flex;gap:8px}.arv-pager button{min-height:36px;border:1px solid #dbe3ef;border-radius:10px;background:#fff;padding:0 12px;color:#334155;font:inherit;font-size:11px;font-weight:900;cursor:pointer}.arv-pager button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:900px){.arv-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.arv-toolbar{grid-template-columns:1fr}.arv-head{flex-direction:column}.arv-refresh{width:100%}}@media(max-width:520px){.arv-stats{grid-template-columns:1fr}.arv-title{font-size:24px}}
`

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function initial(value) {
  return String(value || 'R').charAt(0).toUpperCase()
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, deleted: 0, recommended: 0, not_recommended: 0 })
  const [status, setStatus] = useState('active')
  const [recommendation, setRecommendation] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1, has_next: false, has_prev: false })
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [message, setMessage] = useState('')

  const headers = useMemo(() => {
    const token = getAdminToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Admin-Name': 'Admin',
    }
  }, [])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setMessage('')

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        status,
        recommendation,
      })

      if (search) params.set('search', search)

      const response = await fetch(`${API_URL}/api/admin/author-reviews?${params.toString()}`, {
        headers,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load reviews')
      }

      setReviews(Array.isArray(data.reviews) ? data.reviews : [])
      setStats(data.stats || {})
      setPagination({
        total: Number(data.total || 0),
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
      })
    } catch (error) {
      setReviews([])
      setMessage(error.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [headers, page, recommendation, search, status])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const moderateReview = async (review, action) => {
    if (!review?.id || updatingId) return

    const isDelete = action === 'delete'
    const confirmed = window.confirm(
      isDelete
        ? 'Remove this review from the public Author Page? The review can be restored later.'
        : 'Restore this review to the public Author Page?'
    )

    if (!confirmed) return

    setUpdatingId(review.id)
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/admin/author-reviews/${encodeURIComponent(review.id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          action,
          reason: isDelete ? 'Removed by website admin moderation' : 'Restored by website admin',
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to update review')
      }

      setMessage(data.message || 'Review updated')
      await loadReviews()
    } catch (error) {
      setMessage(error.message || 'Failed to update review')
    } finally {
      setUpdatingId('')
    }
  }

  const cards = [
    ['Total', stats.total || 0],
    ['Active', stats.active || 0],
    ['Deleted', stats.deleted || 0],
    ['Recommended', stats.recommended || 0],
    ['Not recommended', stats.not_recommended || 0],
  ]

  return (
    <AdminLayout
      title="Reviews"
      subtitle="Manage Author Page reviews. Authors cannot delete reader reviews; only the reviewer or website admin can remove them."
    >
      <style>{styles}</style>

      <div className="arv-page">
        <div className="arv-head">
          <div>
            <h1 className="arv-title">Author Reviews</h1>
            <p className="arv-desc">
              Review moderation for Author Pages. Reader ownership stays protected while website admin keeps final moderation control.
            </p>
          </div>

          <button type="button" className="arv-refresh" disabled={loading} onClick={loadReviews}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="arv-stats">
          {cards.map(([label, value]) => (
            <div className="arv-stat" key={label}>
              <div className="arv-stat-label">{label}</div>
              <div className="arv-stat-value">{Number(value || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="arv-toolbar">
          <input
            className="arv-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search review, reader, or Author Page..."
          />

          <select
            className="arv-select"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="active">Active reviews</option>
            <option value="deleted">Deleted reviews</option>
            <option value="all">All status</option>
          </select>

          <select
            className="arv-select"
            value={recommendation}
            onChange={(event) => {
              setRecommendation(event.target.value)
              setPage(1)
            }}
          >
            <option value="all">All recommendations</option>
            <option value="recommended">Recommended</option>
            <option value="not_recommended">Not recommended</option>
          </select>
        </div>

        {message ? <div className="arv-msg">{message}</div> : null}

        <div className="arv-panel">
          <div className="arv-table-wrap">
            <table className="arv-table">
              <thead>
                <tr>
                  <th>Reader</th>
                  <th>Author Page</th>
                  <th>Review</th>
                  <th>Recommendation</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Admin action</th>
                </tr>
              </thead>

              <tbody>
                {!loading && reviews.length ? reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div className="arv-person">
                        <div className="arv-avatar">
                          {review.reviewer?.avatar_url ? (
                            <img src={review.reviewer.avatar_url} alt="" />
                          ) : initial(review.reviewer?.name || review.reviewer?.username)}
                        </div>
                        <div>
                          <div className="arv-name">{review.reviewer?.name || review.reviewer?.username || 'Reader'}</div>
                          <div className="arv-sub">@{review.reviewer?.username || 'reader'}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="arv-name">{review.author_page?.page_name || 'Author Page'}</div>
                      <div className="arv-sub">@{review.author_page?.page_username || '-'}</div>
                    </td>

                    <td>
                      <div className="arv-review">{review.review_text || '-'}</div>
                      {Number(review.open_report_count || 0) > 0 ? (
                        <div className="arv-report">
                          {Number(review.open_report_count).toLocaleString()} open report{Number(review.open_report_count) === 1 ? '' : 's'}
                        </div>
                      ) : null}
                    </td>

                    <td>
                      <span className={`arv-badge ${review.is_recommended ? 'yes' : 'no'}`}>
                        {review.is_recommended ? 'Recommended' : 'Not recommended'}
                      </span>
                    </td>

                    <td>
                      <span className={`arv-badge ${review.status === 'deleted' ? 'deleted' : 'active'}`}>
                        {review.status === 'deleted' ? 'Deleted' : 'Active'}
                      </span>
                    </td>

                    <td>{formatDate(review.created_at)}</td>

                    <td>
                      <div className="arv-actions">
                        {review.status === 'deleted' ? (
                          <button
                            type="button"
                            className="arv-btn restore"
                            disabled={updatingId === review.id}
                            onClick={() => moderateReview(review, 'restore')}
                          >
                            {updatingId === review.id ? 'Saving...' : 'Restore'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="arv-btn danger"
                            disabled={updatingId === review.id}
                            onClick={() => moderateReview(review, 'delete')}
                          >
                            {updatingId === review.id ? 'Removing...' : 'Remove'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : null}
              </tbody>
            </table>

            {loading ? <div className="arv-empty">Loading reviews...</div> : null}
            {!loading && !reviews.length ? <div className="arv-empty">No reviews found.</div> : null}
          </div>

          <div className="arv-footer">
            <div className="arv-page-info">
              {pagination.total.toLocaleString()} reviews · Page {page} of {pagination.total_pages}
            </div>

            <div className="arv-pager">
              <button
                type="button"
                disabled={!pagination.has_prev || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!pagination.has_next || loading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
