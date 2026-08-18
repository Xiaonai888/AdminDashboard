import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function toIso(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function toLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function currentMonth() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }
  return data
}

function CandidateImage({ src, name, round }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`mv-image ${round ? 'round' : ''}`}>
      {src && !failed ? (
        <img src={src} alt={name} onError={() => setFailed(true)} />
      ) : (
        <span>{String(name || 'A').slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  )
}

const styles = `
.mv-page{display:flex;flex-direction:column;gap:18px}
.mv-hero{background:linear-gradient(135deg,#111827,#7c3aed,#db2777);color:#fff;border-radius:24px;padding:24px}
.mv-hero h2{margin:0;font-size:25px;font-weight:950}
.mv-hero p{margin:8px 0 0;color:#fce7f3;font-size:13px;font-weight:700;line-height:1.7}
.mv-grid{display:grid;grid-template-columns:minmax(320px,.9fr) minmax(440px,1.4fr);gap:18px;align-items:start}
.mv-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden}
.mv-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid #e2e8f0}
.mv-title{font-size:16px;font-weight:950;color:#0f172a}
.mv-sub{margin-top:4px;font-size:12px;font-weight:750;color:#64748b}
.mv-body{padding:18px}
.mv-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mv-field.full{grid-column:1/-1}
.mv-field label{display:block;margin-bottom:7px;font-size:11px;font-weight:950;color:#475569}
.mv-field input,.mv-field select,.mv-search input{width:100%;height:42px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:0 12px;outline:none;font:inherit;font-size:13px;font-weight:750}
.mv-field input:focus,.mv-field select:focus,.mv-search input:focus{background:#fff;border-color:#db2777;box-shadow:0 0 0 3px rgba(219,39,119,.1)}
.mv-btn{height:40px;border:0;border-radius:12px;padding:0 14px;cursor:pointer;font:inherit;font-size:12px;font-weight:950}
.mv-btn.primary{background:#db2777;color:#fff}
.mv-btn.dark{background:#111827;color:#fff}
.mv-btn.light{background:#f1f5f9;color:#475569}
.mv-btn:disabled,.mv-mini:disabled{opacity:.5;cursor:not-allowed}
.mv-alert{padding:13px 15px;border-radius:14px;font-size:13px;font-weight:850}
.mv-alert.error{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c}
.mv-alert.success{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d}
.mv-list{display:flex;flex-direction:column;gap:8px}
.mv-campaign{width:100%;border:1px solid #e2e8f0;background:#fff;border-radius:14px;padding:12px;text-align:left;cursor:pointer}
.mv-campaign.active{border-color:#f9a8d4;background:#fff1f7}
.mv-campaign strong{display:block;color:#0f172a;font-size:13px}
.mv-campaign span{display:block;margin-top:5px;color:#64748b;font-size:11px;font-weight:750}
.mv-status{display:inline-flex!important;width:max-content;padding:5px 8px;border-radius:999px;background:#f1f5f9;color:#475569;font-size:10px!important;font-weight:950!important;text-transform:capitalize}
.mv-status.active{background:#dcfce7;color:#15803d}
.mv-tabs{display:flex;background:#f1f5f9;padding:4px;border-radius:999px}
.mv-tab{border:0;background:transparent;border-radius:999px;padding:8px 15px;cursor:pointer;font:inherit;font-size:11px;font-weight:950;color:#64748b}
.mv-tab.active{background:#fff;color:#db2777;box-shadow:0 1px 4px rgba(15,23,42,.08)}
.mv-search{display:grid;grid-template-columns:1fr 105px;gap:9px}
.mv-section{margin:18px 0 8px;color:#0f172a;font-size:12px;font-weight:950}
.mv-row{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid #f1f5f9}
.mv-row:last-child{border-bottom:0}
.mv-image{width:44px;height:58px;border-radius:10px;overflow:hidden;flex-shrink:0;background:#fce7f3;color:#db2777;display:flex;align-items:center;justify-content:center;font-weight:950}
.mv-image.round{width:46px;height:46px;border-radius:999px}
.mv-image img{width:100%;height:100%;object-fit:cover}
.mv-copy{min-width:0;flex:1}
.mv-name{font-size:13px;font-weight:950;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mv-meta{margin-top:4px;font-size:11px;font-weight:750;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mv-id{margin-top:3px;font-size:9px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mv-rank{width:34px;text-align:center;color:#db2777;font-size:15px;font-weight:950}
.mv-votes{min-width:90px;text-align:right;color:#0f172a;font-size:12px;font-weight:950}
.mv-mini{height:32px;border:0;border-radius:10px;padding:0 10px;cursor:pointer;font:inherit;font-size:10px;font-weight:950}
.mv-mini.add{background:#fce7f3;color:#be185d}
.mv-mini.toggle{background:#f1f5f9;color:#475569}
.mv-mini.remove{background:#fef2f2;color:#dc2626}
.mv-actions{display:flex;gap:7px}
.mv-empty{padding:30px 12px;text-align:center;color:#64748b;font-size:12px;font-weight:800}
.mv-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.mv-summary div{border:1px solid #e2e8f0;border-radius:13px;background:#f8fafc;padding:11px}
.mv-summary span{display:block;color:#64748b;font-size:10px;font-weight:850}
.mv-summary strong{display:block;margin-top:4px;color:#0f172a;font-size:14px}
@media(max-width:1050px){.mv-grid{grid-template-columns:1fr}}
@media(max-width:700px){.mv-fields{grid-template-columns:1fr}.mv-field.full{grid-column:auto}.mv-search{grid-template-columns:1fr}.mv-row{flex-wrap:wrap;align-items:flex-start}.mv-votes{text-align:left}.mv-summary{grid-template-columns:1fr}}
`

export default function AdminMonthlyVotePage() {
  const token = getAdminToken()
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [candidates, setCandidates] = useState([])
  const [candidateType, setCandidateType] = useState('story')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    month: currentMonth(),
    title: `${new Date().toLocaleString('en-US', { month: 'long' })} Monthly Vote`,
    starts_at: '',
    ends_at: '',
    status: 'draft',
  })

  const selectedCampaign = useMemo(
    () => campaigns.find((item) => item.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId]
  )

  const visibleCandidates = useMemo(
    () =>
      candidates
        .filter((item) => item.candidate_type === candidateType)
        .sort((a, b) => Number(b.vote_count || 0) - Number(a.vote_count || 0)),
    [candidates, candidateType]
  )

  async function loadCampaigns(preferredId = '') {
    try {
      setLoadingCampaigns(true)
      setError('')
      const response = await fetch(`${API_URL}/api/admin/monthly-vote/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await readResponse(response)
      const rows = Array.isArray(data.campaigns) ? data.campaigns : []
      setCampaigns(rows)
      setSelectedCampaignId(
        preferredId ||
          selectedCampaignId ||
          rows.find((item) => item.status === 'active')?.id ||
          rows[0]?.id ||
          ''
      )
    } catch (err) {
      setCampaigns([])
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setLoadingCampaigns(false)
    }
  }

  async function loadCandidates(campaignId) {
    if (!campaignId) {
      setCandidates([])
      return
    }

    try {
      setLoadingCandidates(true)
      const response = await fetch(
        `${API_URL}/api/admin/monthly-vote/campaigns/${campaignId}/candidates`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await readResponse(response)
      setCandidates(Array.isArray(data.candidates) ? data.candidates : [])
    } catch (err) {
      setCandidates([])
      setError(err.message || 'Failed to load candidates')
    } finally {
      setLoadingCandidates(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  useEffect(() => {
    loadCandidates(selectedCampaignId)
  }, [selectedCampaignId])

  useEffect(() => {
    if (!selectedCampaign) return
    setForm({
      month: String(selectedCampaign.month_key || '').slice(0, 7),
      title: selectedCampaign.title || '',
      starts_at: toLocalInput(selectedCampaign.starts_at),
      ends_at: toLocalInput(selectedCampaign.ends_at),
      status: selectedCampaign.status || 'draft',
    })
  }, [selectedCampaignId])

  async function saveCampaign(event) {
    event.preventDefault()

    const startsAt = toIso(form.starts_at)
    const endsAt = toIso(form.ends_at)

    if (!form.month || !form.title.trim() || !startsAt || !endsAt) {
      setError('Please fill month, title, start time, and end time.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const editing = Boolean(selectedCampaignId)
      const response = await fetch(
        editing
          ? `${API_URL}/api/admin/monthly-vote/campaigns/${selectedCampaignId}`
          : `${API_URL}/api/admin/monthly-vote/campaigns`,
        {
          method: editing ? 'PATCH' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            month_key: form.month,
            title: form.title.trim(),
            starts_at: startsAt,
            ends_at: endsAt,
            status: form.status,
          }),
        }
      )

      const data = await readResponse(response)
      const campaignId = data.campaign?.id || selectedCampaignId

      setSuccess(editing ? 'Campaign updated.' : 'Campaign created.')
      await loadCampaigns(campaignId)
    } catch (err) {
      setError(err.message || 'Failed to save campaign')
    } finally {
      setSaving(false)
    }
  }

  function newCampaign() {
    setSelectedCampaignId('')
    setCandidates([])
    setSearchResults([])
    setError('')
    setSuccess('')
    setForm({
      month: currentMonth(),
      title: `${new Date().toLocaleString('en-US', { month: 'long' })} Monthly Vote`,
      starts_at: '',
      ends_at: '',
      status: 'draft',
    })
  }

  async function searchCandidates(event) {
    event.preventDefault()

    if (!search.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      setError('')

      if (candidateType === 'story') {
        const params = new URLSearchParams({
          page: '1',
          limit: '10',
          search: search.trim(),
          status: 'published',
          visibility: 'active',
          ranking_visibility: 'visible',
        })

        const response = await fetch(`${API_URL}/api/admin/ranking/stories?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await readResponse(response)

        setSearchResults(
          (Array.isArray(data.stories) ? data.stories : []).map((item) => ({
            id: item.id,
            name: item.title || 'Untitled Story',
            subtitle: item.author_page?.page_name || item.main_genre || 'Story',
            image_url: item.cover_url || '',
          }))
        )
      } else {
        const params = new URLSearchParams({
          page: '1',
          limit: '10',
          q: search.trim(),
          filter: 'all',
        })

        const response = await fetch(`${API_URL}/api/admin/community/authors?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await readResponse(response)

        setSearchResults(
          (Array.isArray(data.authors) ? data.authors : []).map((item) => ({
            id: item.id,
            name: item.author_name || item.username || 'Author',
            subtitle: item.username ? `@${item.username}` : 'Author',
            image_url: item.avatar_url || '',
          }))
        )
      }
    } catch (err) {
      setSearchResults([])
      setError(err.message || 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  async function addCandidate(item) {
    if (!selectedCampaignId) {
      setError('Create or select a campaign first.')
      return
    }

    try {
      setBusyId(item.id)
      setError('')
      setSuccess('')

      const response = await fetch(
        `${API_URL}/api/admin/monthly-vote/campaigns/${selectedCampaignId}/candidates`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate_type: candidateType,
            entity_id: item.id,
          }),
        }
      )

      await readResponse(response)
      setSuccess(`${item.name} added.`)
      await loadCandidates(selectedCampaignId)
    } catch (err) {
      setError(err.message || 'Failed to add candidate')
    } finally {
      setBusyId('')
    }
  }

  async function toggleCandidate(item) {
    try {
      setBusyId(item.id)
      const response = await fetch(`${API_URL}/api/admin/monthly-vote/candidates/${item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !item.is_active }),
      })

      await readResponse(response)
      await loadCandidates(selectedCampaignId)
    } catch (err) {
      setError(err.message || 'Failed to update candidate')
    } finally {
      setBusyId('')
    }
  }

  async function removeCandidate(item) {
    if (!window.confirm(`Remove ${item.display_name || 'this candidate'}?`)) return

    try {
      setBusyId(item.id)
      const response = await fetch(`${API_URL}/api/admin/monthly-vote/candidates/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      await readResponse(response)
      setSuccess('Candidate removed.')
      await loadCandidates(selectedCampaignId)
    } catch (err) {
      setError(err.message || 'Failed to remove candidate')
    } finally {
      setBusyId('')
    }
  }

  async function finalizeCampaign() {
    if (!selectedCampaignId || !selectedCampaign) return

    const endsAt = new Date(selectedCampaign.ends_at).getTime()

    if (Number.isFinite(endsAt) && Date.now() < endsAt) {
      setError('Monthly Vote has not reached its end time yet.')
      return
    }

    if (!window.confirm('Finalize this Monthly Vote and lock Top 1–3 winners?')) return

    try {
      setFinalizing(true)
      setError('')
      setSuccess('')

      const response = await fetch(
        `${API_URL}/api/admin/monthly-vote/campaigns/${selectedCampaignId}/finalize`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await readResponse(response)

      setSuccess(
        `Finalized. Story winners: ${Number(data.result?.story_winners || 0)}, Author winners: ${Number(data.result?.author_winners || 0)}.`
      )

      await loadCampaigns(selectedCampaignId)
      await loadCandidates(selectedCampaignId)
    } catch (err) {
      setError(err.message || 'Failed to finalize Monthly Vote')
    } finally {
      setFinalizing(false)
    }
  }

  const storyCount = candidates.filter((item) => item.candidate_type === 'story').length
  const authorCount = candidates.filter((item) => item.candidate_type === 'author').length
  const totalVotes = candidates.reduce((sum, item) => sum + Number(item.vote_count || 0), 0)

  return (
    <AdminLayout
      title="Monthly Vote"
      subtitle="Create campaigns and manage Story or Author candidates."
    >
      <style>{styles}</style>

      <div className="mv-page">
        <section className="mv-hero">
          <h2>Monthly Vote Control</h2>
          <p>
            This controls the Monthly Vote shown on the reader Event page. Reader Vote Balance stays in the existing wallet system.
          </p>
        </section>

        {error ? <div className="mv-alert error">{error}</div> : null}
        {success ? <div className="mv-alert success">{success}</div> : null}

        <div className="mv-grid">
          <div>
            <section className="mv-card">
              <div className="mv-head">
                <div>
                  <div className="mv-title">Campaign</div>
                  <div className="mv-sub">Create a month or edit the selected campaign.</div>
                </div>
                <button type="button" className="mv-btn light" onClick={newCampaign}>
                  New
                </button>
              </div>

              <div className="mv-body">
                <form onSubmit={saveCampaign}>
                  <div className="mv-fields">
                    <div className="mv-field">
                      <label>Month</label>
                      <input
                        type="month"
                        value={form.month}
                        onChange={(e) => setForm((v) => ({ ...v, month: e.target.value }))}
                      />
                    </div>

                    <div className="mv-field">
                      <label>Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="mv-field full">
                      <label>Title</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                      />
                    </div>

                    <div className="mv-field">
                      <label>Starts</label>
                      <input
                        type="datetime-local"
                        value={form.starts_at}
                        onChange={(e) => setForm((v) => ({ ...v, starts_at: e.target.value }))}
                      />
                    </div>

                    <div className="mv-field">
                      <label>Ends</label>
                      <input
                        type="datetime-local"
                        value={form.ends_at}
                        onChange={(e) => setForm((v) => ({ ...v, ends_at: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="submit" className="mv-btn primary" disabled={saving || finalizing}>
                      {saving ? 'Saving...' : selectedCampaignId ? 'Save Changes' : 'Create Campaign'}
                    </button>

                    {selectedCampaignId ? (
                      <button
                        type="button"
                        className="mv-btn dark"
                        disabled={
                          finalizing ||
                          selectedCampaign?.status === 'draft' ||
                          selectedCampaign?.status === 'cancelled'
                        }
                        onClick={finalizeCampaign}
                      >
                        {finalizing ? 'Finalizing...' : 'Finalize Winners'}
                      </button>
                    ) : null}
                  </div>
                </form>

                {selectedCampaign ? (
                  <div className="mv-summary">
                    <div><span>Stories</span><strong>{storyCount}</strong></div>
                    <div><span>Authors</span><strong>{authorCount}</strong></div>
                    <div><span>Total Votes</span><strong>{Number(totalVotes).toLocaleString()}</strong></div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="mv-card" style={{ marginTop: 18 }}>
              <div className="mv-head">
                <div>
                  <div className="mv-title">Campaign History</div>
                  <div className="mv-sub">Select a campaign to manage.</div>
                </div>
              </div>

              <div className="mv-body">
                {loadingCampaigns ? (
                  <div className="mv-empty">Loading...</div>
                ) : campaigns.length ? (
                  <div className="mv-list">
                    {campaigns.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`mv-campaign ${item.id === selectedCampaignId ? 'active' : ''}`}
                        onClick={() => setSelectedCampaignId(item.id)}
                      >
                        <strong>{item.title}</strong>
                        <span className={`mv-status ${item.status}`}>{item.status}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mv-empty">No campaign yet.</div>
                )}
              </div>
            </section>
          </div>

          <section className="mv-card">
            <div className="mv-head">
              <div>
                <div className="mv-title">Candidates</div>
                <div className="mv-sub">Search existing stories or authors and add them.</div>
              </div>

              <div className="mv-tabs">
                <button
                  type="button"
                  className={`mv-tab ${candidateType === 'story' ? 'active' : ''}`}
                  onClick={() => {
                    setCandidateType('story')
                    setSearchResults([])
                  }}
                >
                  Story
                </button>
                <button
                  type="button"
                  className={`mv-tab ${candidateType === 'author' ? 'active' : ''}`}
                  onClick={() => {
                    setCandidateType('author')
                    setSearchResults([])
                  }}
                >
                  Author
                </button>
              </div>
            </div>

            <div className="mv-body">
              <form className="mv-search" onSubmit={searchCandidates}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={candidateType === 'story' ? 'Search story...' : 'Search author...'}
                />
                <button type="submit" className="mv-btn dark" disabled={searching}>
                  {searching ? '...' : 'Search'}
                </button>
              </form>

              {searchResults.length ? (
                <>
                  <div className="mv-section">Search Results</div>
                  {searchResults.map((item) => {
                    const added = candidates.some(
                      (candidate) =>
                        candidate.candidate_type === candidateType &&
                        candidate.entity_id === item.id
                    )

                    return (
                      <div className="mv-row" key={item.id}>
                        <CandidateImage src={item.image_url} name={item.name} round={candidateType === 'author'} />
                        <div className="mv-copy">
                          <div className="mv-name">{item.name}</div>
                          <div className="mv-meta">{item.subtitle}</div>
                          <div className="mv-id">{item.id}</div>
                        </div>
                        <button
                          type="button"
                          className="mv-mini add"
                          disabled={added || busyId === item.id || !selectedCampaignId}
                          onClick={() => addCandidate(item)}
                        >
                          {added ? 'Added' : busyId === item.id ? '...' : 'Add'}
                        </button>
                      </div>
                    )
                  })}
                </>
              ) : null}

              <div className="mv-section">
                Current {candidateType === 'story' ? 'Story' : 'Author'} Candidates
              </div>

              {loadingCandidates ? (
                <div className="mv-empty">Loading...</div>
              ) : visibleCandidates.length ? (
                visibleCandidates.map((item, index) => (
                  <div className="mv-row" key={item.id}>
                    <div className="mv-rank">#{index + 1}</div>
                    <CandidateImage
                      src={item.image_url}
                      name={item.display_name}
                      round={candidateType === 'author'}
                    />
                    <div className="mv-copy">
                      <div className="mv-name">{item.display_name}</div>
                      <div className="mv-meta">
                        {item.display_subtitle || candidateType}
                        {!item.is_active ? ' · Hidden' : ''}
                      </div>
                    </div>
                    <div className="mv-votes">{Number(item.vote_count || 0).toLocaleString()} Votes</div>
                    <div className="mv-actions">
                      <button
                        type="button"
                        className="mv-mini toggle"
                        disabled={busyId === item.id}
                        onClick={() => toggleCandidate(item)}
                      >
                        {item.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        className="mv-mini remove"
                        disabled={busyId === item.id || Number(item.vote_count || 0) > 0}
                        onClick={() => removeCandidate(item)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mv-empty">
                  {selectedCampaignId ? 'No candidates yet.' : 'Create or select a campaign first.'}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
