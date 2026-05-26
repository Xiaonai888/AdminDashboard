import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function getInitial(name, username, email) {
  const source = name || username || email || 'R'
  return source.slice(0, 1).toUpperCase()
}

function StatusBadge({ status }) {
  const active = status === 'active'
  return (
    <span className={`community-status ${active ? 'active' : 'inactive'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function AuthorsCommunity() {
  const [activeTab, setActiveTab] = useState('readers')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState({
    total_readers: 0,
    total_authors: 0,
    total_community_members: 0,
    new_this_month: 0,
  })
  const [readers, setReaders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, has_next: false, has_prev: false })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true

    async function loadReaders() {
      try {
        setLoading(true)
        setError('')

        const token = getAdminToken()
        const params = new URLSearchParams({ page: String(page), limit: '20' })
        if (debouncedSearch) params.set('q', debouncedSearch)

        const response = await fetch(`${API_URL}/api/admin/community/readers?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load readers')
        if (!alive) return

        setSummary(data.summary || {})
        setReaders(Array.isArray(data.readers) ? data.readers : [])
        setPagination({
          page: data.page || 1,
          total_pages: data.total_pages || 1,
          has_next: Boolean(data.has_next),
          has_prev: Boolean(data.has_prev),
        })
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load readers')
        setReaders([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadReaders()

    return () => {
      alive = false
    }
  }, [page, debouncedSearch])

  const cards = useMemo(() => [
    { label: 'Total Readers', value: summary.total_readers, tone: 'blue' },
    { label: 'Total Authors', value: summary.total_authors, tone: 'purple' },
    { label: 'Community Members', value: summary.total_community_members, tone: 'dark' },
    { label: 'New This Month', value: summary.new_this_month, tone: 'green' },
  ], [summary])

  return (
    <AdminLayout title="Community" subtitle="View readers and authors in one place.">
      <style>{styles}</style>

      <div className="community-page">
        <section className="community-cards">
          {cards.map((card) => (
            <div className="community-card" key={card.label}>
              <div className={`community-card-icon ${card.tone}`}>{card.label.slice(0, 1)}</div>
              <div>
                <div className="community-card-label">{card.label}</div>
                <div className="community-card-value">{formatNumber(card.value)}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="community-panel">
          <div className="community-panel-top">
            <div className="community-tabs">
              <button type="button" className={activeTab === 'readers' ? 'active' : ''} onClick={() => setActiveTab('readers')}>Reader</button>
              <button type="button" className={activeTab === 'authors' ? 'active' : ''} onClick={() => setActiveTab('authors')}>Author</button>
            </div>

            <div className="community-search-wrap">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reader name, username, or email..." />
            </div>
          </div>

          {activeTab === 'readers' ? (
            <div>
              {error ? <div className="community-alert">{error}</div> : null}

              <div className="community-table-wrap">
                <table className="community-table">
                  <thead>
                    <tr>
                      <th>Reader</th>
                      <th>Email</th>
                      <th>Joined Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="community-empty">Loading readers...</td></tr>
                    ) : readers.length ? readers.map((reader) => (
                      <tr key={reader.id}>
                        <td>
                          <div className="community-user">
                            <div className="community-avatar">{getInitial(reader.name, reader.username, reader.email)}</div>
                            <div>
                              <div className="community-user-name">{reader.name || reader.username || 'Unnamed Reader'}</div>
                              <div className="community-user-sub">@{reader.username || 'no_username'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{reader.email || '-'}</td>
                        <td>{formatDate(reader.joined_at)}</td>
                        <td><StatusBadge status={reader.status} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="community-empty">No readers found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="community-pagination">
                <button type="button" disabled={!pagination.has_prev || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                <span>Page {pagination.page} of {pagination.total_pages}</span>
                <button type="button" disabled={!pagination.has_next || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </div>
          ) : (
            <div className="community-coming-soon">Author tab will be connected in the next stage.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

const styles = `
  .community-page { display: flex; flex-direction: column; gap: 18px; }
  .community-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .community-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; padding: 18px; display: flex; align-items: center; gap: 13px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); }
  .community-card-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 950; }
  .community-card-icon.blue { background: #EFF6FF; color: #2563EB; }
  .community-card-icon.purple { background: #EEF2FF; color: #4F46E5; }
  .community-card-icon.dark { background: #F1F5F9; color: #0F172A; }
  .community-card-icon.green { background: #ECFDF5; color: #059669; }
  .community-card-label { color: #64748B; font-size: 12px; font-weight: 800; margin-bottom: 4px; }
  .community-card-value { color: #0F172A; font-size: 24px; font-weight: 950; letter-spacing: -0.04em; }
  .community-panel { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); overflow: hidden; }
  .community-panel-top { padding: 16px; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .community-tabs { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 4px; display: flex; gap: 4px; }
  .community-tabs button { border: 0; background: transparent; height: 34px; border-radius: 11px; padding: 0 18px; color: #64748B; font-size: 13px; font-weight: 900; cursor: pointer; }
  .community-tabs button.active { background: #4F46E5; color: #FFFFFF; box-shadow: 0 8px 18px rgba(79, 70, 229, 0.18); }
  .community-search-wrap { width: min(380px, 100%); height: 40px; border: 1px solid #E2E8F0; border-radius: 14px; display: flex; align-items: center; gap: 9px; padding: 0 12px; color: #94A3B8; background: #FFFFFF; }
  .community-search-wrap input { width: 100%; border: 0; outline: 0; font: inherit; font-size: 13px; font-weight: 700; color: #0F172A; }
  .community-search-wrap input::placeholder { color: #94A3B8; }
  .community-table-wrap { width: 100%; overflow-x: auto; }
  .community-table { width: 100%; border-collapse: collapse; min-width: 760px; }
  .community-table th { text-align: left; padding: 13px 16px; background: #F8FAFC; color: #64748B; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #E2E8F0; }
  .community-table td { padding: 14px 16px; border-bottom: 1px solid #EEF2F7; color: #334155; font-size: 13px; font-weight: 750; }
  .community-user { display: flex; align-items: center; gap: 11px; }
  .community-avatar { width: 40px; height: 40px; border-radius: 999px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 950; flex-shrink: 0; }
  .community-user-name { color: #0F172A; font-size: 13px; font-weight: 950; }
  .community-user-sub { color: #64748B; font-size: 12px; font-weight: 700; margin-top: 2px; }
  .community-status { display: inline-flex; align-items: center; justify-content: center; height: 25px; padding: 0 10px; border-radius: 999px; font-size: 11px; font-weight: 950; }
  .community-status.active { background: #DCFCE7; color: #16A34A; }
  .community-status.inactive { background: #F1F5F9; color: #64748B; }
  .community-empty { text-align: center; color: #64748B; padding: 34px 16px !important; }
  .community-alert { margin: 16px; padding: 12px 14px; border-radius: 14px; background: #FEF2F2; color: #DC2626; font-size: 13px; font-weight: 800; }
  .community-pagination { padding: 14px 16px; display: flex; justify-content: flex-end; align-items: center; gap: 10px; color: #64748B; font-size: 12px; font-weight: 850; }
  .community-pagination button { height: 34px; border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 12px; padding: 0 13px; color: #0F172A; font-size: 12px; font-weight: 900; cursor: pointer; }
  .community-pagination button:disabled { opacity: 0.45; cursor: not-allowed; }
  .community-coming-soon { padding: 42px 16px; text-align: center; color: #64748B; font-size: 13px; font-weight: 850; }
  @media (max-width: 980px) { .community-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) { .community-cards { grid-template-columns: 1fr; } .community-panel-top { align-items: stretch; } .community-tabs, .community-search-wrap { width: 100%; } .community-tabs button { flex: 1; } }
`
