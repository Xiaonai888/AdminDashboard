import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getInitial(name, username) {
  return String(name || username || 'U').trim().slice(0, 1).toUpperCase()
}

function normalizeStatus(status) {
  const value = String(status || 'active').toLowerCase()
  if (value === 'inactive') return 'Inactive'
  if (value === 'suspended') return 'Suspended'
  if (value === 'pending') return 'Pending'
  return 'Active'
}

function statusStyle(status) {
  const value = String(status || 'active').toLowerCase()

  if (value === 'suspended') {
    return { background: '#FEE2E2', color: '#DC2626' }
  }

  if (value === 'pending') {
    return { background: '#FEF3C7', color: '#B45309' }
  }

  if (value === 'inactive') {
    return { background: '#F1F5F9', color: '#64748B' }
  }

  return { background: '#DCFCE7', color: '#16A34A' }
}

const styles = `
.community-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.community-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.community-card {
  background: #FFFFFF;
  border: 1px solid #DDE7F3;
  border-radius: 16px;
  padding: 18px;
  min-height: 82px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  gap: 14px;
}

.community-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 950;
}

.community-card-label {
  font-size: 12px;
  font-weight: 950;
  color: #64748B;
}

.community-card-value {
  margin-top: 4px;
  font-size: 25px;
  line-height: 1;
  font-weight: 950;
  color: #0F172A;
}

.community-panel {
  background: #FFFFFF;
  border: 1px solid #DDE7F3;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.community-toolbar {
  padding: 16px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.community-tabs {
  height: 40px;
  padding: 4px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1px solid #D5E0EF;
  display: inline-flex;
  gap: 4px;
}

.community-tab {
  min-width: 84px;
  height: 30px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #475569;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
}

.community-tab.active {
  background: #4F46E5;
  color: #FFFFFF;
  box-shadow: 0 5px 12px rgba(79, 70, 229, 0.28);
}

.community-search {
  width: min(360px, 100%);
  height: 38px;
  border: 1px solid #D5E0EF;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  color: #94A3B8;
}

.community-search input {
  width: 100%;
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 12px;
  font-weight: 850;
  color: #0F172A;
  background: transparent;
}

.community-search input::placeholder {
  color: #94A3B8;
}

.community-table-wrap {
  overflow-x: auto;
}

.community-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}

.community-table th {
  height: 38px;
  padding: 0 16px;
  text-align: left;
  background: #F8FAFC;
  border-bottom: 1px solid #DDE7F3;
  color: #64748B;
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.community-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #E8EEF6;
  color: #0F172A;
  font-size: 13px;
  font-weight: 850;
}

.community-person {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 240px;
}

.community-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 950;
  flex-shrink: 0;
}

.community-name {
  font-size: 13px;
  font-weight: 950;
  color: #0F172A;
}

.community-username {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 800;
  color: #64748B;
}

.community-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 950;
}

.community-empty {
  padding: 46px 16px;
  text-align: center;
  color: #64748B;
  font-size: 13px;
  font-weight: 850;
}

.community-footer {
  min-height: 56px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.community-page-info {
  font-size: 12px;
  font-weight: 950;
  color: #64748B;
}

.community-page-btn {
  height: 34px;
  padding: 0 14px;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  background: #FFFFFF;
  color: #64748B;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
}

.community-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.community-error {
  padding: 14px 16px;
  border-radius: 14px;
  background: #FEF2F2;
  color: #B91C1C;
  font-size: 13px;
  font-weight: 850;
}

@media (max-width: 980px) {
  .community-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .community-cards {
    grid-template-columns: 1fr;
  }

  .community-toolbar {
    align-items: stretch;
  }

  .community-search {
    width: 100%;
  }
}
`

export default function AuthorsCommunity() {
  const [activeTab, setActiveTab] = useState('readers')
  const [overview, setOverview] = useState({
    total_readers: 0,
    total_authors: 0,
    total_members: 0,
    new_this_month: 0,
  })
  const [readers, setReaders] = useState([])
  const [authors, setAuthors] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = useMemo(() => getAdminToken(), [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await fetch(`${API_URL}/api/admin/community/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'Failed to load community overview')
        }

        setOverview(result.overview || {})
      } catch (err) {
        setError(err.message || 'Failed to load community overview')
      }
    }

    loadOverview()
  }, [token])

  useEffect(() => {
    async function loadList() {
      try {
        setLoading(true)
        setError('')

        const endpoint = activeTab === 'authors' ? 'authors' : 'readers'
        const params = new URLSearchParams({
          page: String(page),
          limit: '20',
          q: debouncedSearch,
        })

        const response = await fetch(`${API_URL}/api/admin/community/${endpoint}?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (!response.ok || !result.ok) {
          throw new Error(result.message || `Failed to load ${endpoint}`)
        }

        if (activeTab === 'authors') {
          setAuthors(result.authors || [])
        } else {
          setReaders(result.readers || [])
        }

        setPagination({
          page: result.page || 1,
          total_pages: result.total_pages || 1,
          has_next: Boolean(result.has_next),
          has_prev: Boolean(result.has_prev),
        })
      } catch (err) {
        setError(err.message || 'Failed to load community data')
      } finally {
        setLoading(false)
      }
    }

    loadList()
  }, [activeTab, debouncedSearch, page, token])

  function changeTab(tab) {
    setActiveTab(tab)
    setSearch('')
    setDebouncedSearch('')
    setPage(1)
  }

  const list = activeTab === 'authors' ? authors : readers

  return (
    <AdminLayout title="Community" subtitle="View readers and authors in one place.">
      <style>{styles}</style>

      <div className="community-page">
        <div className="community-cards">
          <div className="community-card">
            <div className="community-card-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>T</div>
            <div>
              <div className="community-card-label">Total Readers</div>
              <div className="community-card-value">{overview.total_readers || 0}</div>
            </div>
          </div>

          <div className="community-card">
            <div className="community-card-icon" style={{ background: '#F1F0FF', color: '#4F46E5' }}>T</div>
            <div>
              <div className="community-card-label">Total Authors</div>
              <div className="community-card-value">{overview.total_authors || 0}</div>
            </div>
          </div>

          <div className="community-card">
            <div className="community-card-icon" style={{ background: '#F8FAFC', color: '#0F172A' }}>C</div>
            <div>
              <div className="community-card-label">Community Members</div>
              <div className="community-card-value">{overview.total_members || 0}</div>
            </div>
          </div>

          <div className="community-card">
            <div className="community-card-icon" style={{ background: '#ECFDF5', color: '#059669' }}>N</div>
            <div>
              <div className="community-card-label">New This Month</div>
              <div className="community-card-value">{overview.new_this_month || 0}</div>
            </div>
          </div>
        </div>

        {error ? <div className="community-error">{error}</div> : null}

        <div className="community-panel">
          <div className="community-toolbar">
            <div className="community-tabs">
              <button type="button" className={`community-tab ${activeTab === 'readers' ? 'active' : ''}`} onClick={() => changeTab('readers')}>
                Reader
              </button>
              <button type="button" className={`community-tab ${activeTab === 'authors' ? 'active' : ''}`} onClick={() => changeTab('authors')}>
                Author
              </button>
            </div>

            <div className="community-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={activeTab === 'authors' ? 'Search author name or username...' : 'Search reader name, username, or email...'}
              />
            </div>
          </div>

          <div className="community-table-wrap">
            <table className="community-table">
              <thead>
                {activeTab === 'authors' ? (
                  <tr>
                    <th>Author</th>
                    <th>Email</th>
                    <th>Books</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Reader</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {!loading && list.length ? (
                  activeTab === 'authors' ? (
                    authors.map((author) => (
                      <tr key={author.id}>
                        <td>
                          <div className="community-person">
                            <div className="community-avatar">{getInitial(author.author_name, author.username)}</div>
                            <div>
                              <div className="community-name">{author.author_name || 'Author'}</div>
                              <div className="community-username">@{author.username || 'author'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{author.email || '-'}</td>
                        <td>{Number(author.books_count || 0)}</td>
                        <td>{formatDate(author.joined_at)}</td>
                        <td>
                          <span className="community-status" style={statusStyle(author.status)}>
                            {normalizeStatus(author.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    readers.map((reader) => (
                      <tr key={reader.id}>
                        <td>
                          <div className="community-person">
                            <div className="community-avatar">{getInitial(reader.name, reader.username)}</div>
                            <div>
                              <div className="community-name">{reader.name || 'Reader'}</div>
                              <div className="community-username">@{reader.username || 'reader'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{reader.email || '-'}</td>
                        <td>{formatDate(reader.joined_at)}</td>
                        <td>
                          <span className="community-status" style={statusStyle(reader.status)}>
                            {normalizeStatus(reader.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )
                ) : null}
              </tbody>
            </table>

            {loading ? <div className="community-empty">Loading community data...</div> : null}
            {!loading && !list.length ? <div className="community-empty">No {activeTab === 'authors' ? 'authors' : 'readers'} found.</div> : null}
          </div>

          <div className="community-footer">
            <button type="button" className="community-page-btn" disabled={!pagination.has_prev || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </button>
            <div className="community-page-info">Page {pagination.page} of {pagination.total_pages}</div>
            <button type="button" className="community-page-btn" disabled={!pagination.has_next || loading} onClick={() => setPage((value) => value + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
