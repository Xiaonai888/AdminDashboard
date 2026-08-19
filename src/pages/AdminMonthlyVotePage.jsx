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


function createDefaultDesign(campaign) {
  return {
    badge_text: 'MONTHLY VOTE',
    hero_title: campaign?.title || 'Monthly Vote',
    hero_description: 'Vote for your favorite story or author and help crown this month’s winner.',
    hero_image_url: '',
    hero_image_storage_key: '',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg,#fff8fb,#ffeef4)',
    text_color: '#111827',
    accent_color: '#ff3f70',
    cta_text: '',
    cta_url: '',
    show_hero_image: true,
    show_countdown: true,
    show_vote_balance: true,
    show_top_three: true,
    show_candidate_list: true,
    is_published: false,
  }
}



function createDefaultAnnouncement() {
  return {
    badge_text: '',
    title: '',
    description: '',
    image_url: '',
    image_storage_key: '',
    button_text: '',
    button_url: '',
    background_color: '#ffffff',
    text_color: '#111827',
    accent_color: '#ff3f70',
    starts_at: '',
    ends_at: '',
    sort_order: 0,
    is_visible: true,
  }
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
.mv-field textarea{width:100%;min-height:96px;resize:vertical;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:10px 12px;outline:none;font:inherit;font-size:13px;font-weight:750;line-height:1.55}
.mv-field textarea:focus{background:#fff;border-color:#db2777;box-shadow:0 0 0 3px rgba(219,39,119,.1)}
.mv-design-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.mv-toggle-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.mv-toggle{display:flex;align-items:center;gap:9px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:10px 11px;color:#475569;font-size:11px;font-weight:850}
.mv-toggle input{width:16px;height:16px;accent-color:#db2777}
.mv-upload{border:1px dashed #cbd5e1;border-radius:14px;background:#f8fafc;padding:12px}
.mv-upload-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.mv-upload input[type=file]{max-width:100%;font-size:11px;font-weight:750;color:#64748b}
.mv-upload-preview{margin-top:10px;width:100%;max-height:190px;object-fit:cover;border-radius:12px;border:1px solid #e2e8f0;background:#fff}
.mv-publish-badge{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;background:#f1f5f9;color:#64748b;font-size:10px;font-weight:950}
.mv-publish-badge.live{background:#dcfce7;color:#15803d}
.mv-preview-shell{margin-top:14px;border:1px solid #e2e8f0;border-radius:18px;background:#eef2f7;padding:14px}
.mv-preview-phone{width:min(330px,100%);margin:0 auto;border:7px solid #111827;border-radius:28px;background:#fff;overflow:hidden;box-shadow:0 14px 34px rgba(15,23,42,.16)}
.mv-preview-top{height:24px;background:#111827}
.mv-preview-hero{padding:16px;min-height:210px;background:#fff}
.mv-preview-image{width:100%;height:118px;object-fit:cover;border-radius:14px;margin-bottom:12px;background:#f1f5f9}
.mv-preview-badge{font-size:9px;font-weight:950;letter-spacing:.12em}
.mv-preview-title{margin-top:7px;font-size:22px;font-weight:950;line-height:1.1}
.mv-preview-desc{margin-top:8px;font-size:10px;font-weight:700;line-height:1.55;opacity:.72}
.mv-preview-cta{display:inline-flex;align-items:center;justify-content:center;margin-top:12px;min-height:34px;border-radius:999px;padding:0 14px;color:#fff;font-size:10px;font-weight:950}
.mv-preview-tools{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.mv-preview-chip{border-radius:999px;background:rgba(255,255,255,.82);padding:6px 9px;font-size:9px;font-weight:900;box-shadow:0 1px 5px rgba(15,23,42,.07)}
.mv-ann-form{display:flex;flex-direction:column;gap:14px}
.mv-ann-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.mv-ann-list{display:flex;flex-direction:column;gap:10px;margin-top:14px}
.mv-ann-item{display:flex;align-items:center;gap:10px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;padding:10px}
.mv-ann-thumb{width:62px;height:62px;flex-shrink:0;overflow:hidden;border-radius:12px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8}
.mv-ann-thumb img{width:100%;height:100%;object-fit:cover}
.mv-ann-status{display:inline-flex;align-items:center;width:max-content;margin-top:5px;border-radius:999px;padding:4px 7px;background:#f1f5f9;color:#64748b;font-size:9px;font-weight:950}
.mv-ann-status.live{background:#dcfce7;color:#15803d}
.mv-ann-preview{overflow:hidden;border:1px solid #e2e8f0;border-radius:16px;padding:14px;box-shadow:0 8px 20px rgba(15,23,42,.06)}
.mv-ann-preview img{width:100%;max-height:190px;object-fit:cover;border-radius:12px;margin-bottom:10px}
.mv-ann-preview-badge{font-size:9px;font-weight:950;letter-spacing:.12em;text-transform:uppercase}
.mv-ann-preview-title{margin-top:5px;font-size:17px;font-weight:950;line-height:1.25}
.mv-ann-preview-desc{margin-top:7px;font-size:11px;font-weight:700;line-height:1.55;opacity:.72}
.mv-ann-preview-btn{display:inline-flex;align-items:center;justify-content:center;min-height:34px;margin-top:10px;border-radius:999px;padding:0 14px;color:#fff;font-size:10px;font-weight:950}
@media(max-width:1050px){.mv-grid{grid-template-columns:1fr}}
@media(max-width:700px){.mv-fields{grid-template-columns:1fr}.mv-field.full{grid-column:auto}.mv-search{grid-template-columns:1fr}.mv-row{flex-wrap:wrap;align-items:flex-start}.mv-votes{text-align:left}.mv-summary{grid-template-columns:1fr}.mv-toggle-grid{grid-template-columns:1fr}}
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
  const [design, setDesign] = useState(createDefaultDesign(null))
  const [designLoading, setDesignLoading] = useState(false)
  const [designSaving, setDesignSaving] = useState(false)
  const [designPublishing, setDesignPublishing] = useState(false)
  const [heroUploading, setHeroUploading] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [announcementSaving, setAnnouncementSaving] = useState(false)
  const [announcementUploading, setAnnouncementUploading] = useState(false)
  const [announcementBusyId, setAnnouncementBusyId] = useState('')
  const [editingAnnouncementId, setEditingAnnouncementId] = useState('')
  const [announcementForm, setAnnouncementForm] = useState(createDefaultAnnouncement())
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

  async function loadDesign(campaignId) {
    if (!campaignId) {
      setDesign(createDefaultDesign(null))
      return
    }

    try {
      setDesignLoading(true)
      const response = await fetch(
        `${API_URL}/api/admin/monthly-vote/campaigns/${campaignId}/design`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await readResponse(response)
      const campaign = campaigns.find((item) => item.id === campaignId) || data.campaign || null
      setDesign({
        ...createDefaultDesign(campaign),
        ...(data.design || {}),
      })
    } catch (err) {
      setDesign(createDefaultDesign(selectedCampaign))
      setError(err.message || 'Failed to load Event Appearance')
    } finally {
      setDesignLoading(false)
    }
  }


  async function loadAnnouncements(campaignId) {
    if (!campaignId) {
      setAnnouncements([])
      setEditingAnnouncementId('')
      setAnnouncementForm(createDefaultAnnouncement())
      return
    }

    try {
      setAnnouncementsLoading(true)
      const response = await fetch(
        `${API_URL}/api/admin/monthly-vote/campaigns/${campaignId}/announcements`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await readResponse(response)
      setAnnouncements(Array.isArray(data.announcements) ? data.announcements : [])
    } catch (err) {
      setAnnouncements([])
      setError(err.message || 'Failed to load announcements')
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  useEffect(() => {
    loadCandidates(selectedCampaignId)
    loadDesign(selectedCampaignId)
    loadAnnouncements(selectedCampaignId)
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
    setDesign(createDefaultDesign(null))
    setAnnouncements([])
    setEditingAnnouncementId('')
    setAnnouncementForm(createDefaultAnnouncement())
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

  async function uploadHeroImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!selectedCampaignId) {
      setError('Create or select a campaign first.')
      return
    }

    try {
      setHeroUploading(true)
      setError('')
      setSuccess('')

      const formData = new FormData()
      formData.append('images', file)

      const response = await fetch(`${API_URL}/api/admin/media-library/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await readResponse(response)
      const uploaded = Array.isArray(data.images) ? data.images[0] : null

      if (!uploaded?.image_url) {
        throw new Error('Image upload did not return a URL')
      }

      setDesign((current) => ({
        ...current,
        hero_image_url: uploaded.image_url,
        hero_image_storage_key: uploaded.storage_key || '',
        show_hero_image: true,
      }))
      setSuccess('Hero image uploaded. Save or Publish to apply it.')
    } catch (err) {
      setError(err.message || 'Failed to upload hero image')
    } finally {
      setHeroUploading(false)
    }
  }

  async function saveEventAppearance({ publish = false } = {}) {
    if (!selectedCampaignId) {
      setError('Create or select a campaign first.')
      return
    }

    try {
      if (publish) setDesignPublishing(true)
      else setDesignSaving(true)

      setError('')
      setSuccess('')

      const payload = {
        badge_text: design.badge_text,
        hero_title: design.hero_title,
        hero_description: design.hero_description,
        hero_image_url: design.hero_image_url,
        hero_image_storage_key: design.hero_image_storage_key,
        background_type: design.background_type,
        background_value: design.background_value,
        text_color: design.text_color,
        accent_color: design.accent_color,
        cta_text: design.cta_text,
        cta_url: design.cta_url,
        show_hero_image: Boolean(design.show_hero_image),
        show_countdown: Boolean(design.show_countdown),
        show_vote_balance: Boolean(design.show_vote_balance),
        show_top_three: Boolean(design.show_top_three),
        show_candidate_list: Boolean(design.show_candidate_list),
      }

      const saveResponse = await fetch(
        `${API_URL}/api/admin/monthly-vote/campaigns/${selectedCampaignId}/design`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const saved = await readResponse(saveResponse)
      let nextDesign = saved.design || { ...design, is_published: false }

      if (publish) {
        const publishResponse = await fetch(
          `${API_URL}/api/admin/monthly-vote/campaigns/${selectedCampaignId}/design/publish`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        const published = await readResponse(publishResponse)
        nextDesign = published.design || { ...nextDesign, is_published: true }
      }

      setDesign((current) => ({ ...current, ...nextDesign }))
      setSuccess(publish ? 'Event Appearance published.' : 'Event Appearance saved.')
    } catch (err) {
      setError(err.message || 'Failed to save Event Appearance')
    } finally {
      setDesignSaving(false)
      setDesignPublishing(false)
    }
  }

  async function unpublishEventAppearance() {
    if (!selectedCampaignId) return

    try {
      setDesignPublishing(true)
      setError('')
      setSuccess('')

      const response = await fetch(
        `${API_URL}/api/admin/monthly-vote/campaigns/${selectedCampaignId}/design/unpublish`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await readResponse(response)
      setDesign((current) => ({
        ...current,
        ...(data.design || {}),
        is_published: false,
      }))
      setSuccess('Event Appearance unpublished.')
    } catch (err) {
      setError(err.message || 'Failed to unpublish Event Appearance')
    } finally {
      setDesignPublishing(false)
    }
  }

  function resetAnnouncementForm() {
    setEditingAnnouncementId('')
    setAnnouncementForm(createDefaultAnnouncement())
  }

  function editAnnouncement(item) {
    setEditingAnnouncementId(item.id)
    setAnnouncementForm({
      badge_text: item.badge_text || '',
      title: item.title || '',
      description: item.description || '',
      image_url: item.image_url || '',
      image_storage_key: item.image_storage_key || '',
      button_text: item.button_text || '',
      button_url: item.button_url || '',
      background_color: item.background_color || '#ffffff',
      text_color: item.text_color || '#111827',
      accent_color: item.accent_color || '#ff3f70',
      starts_at: toLocalInput(item.starts_at),
      ends_at: toLocalInput(item.ends_at),
      sort_order: Number(item.sort_order || 0),
      is_visible: Boolean(item.is_visible),
    })
  }

  async function uploadAnnouncementImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return
    if (!selectedCampaignId) {
      setError('Create or select a campaign first.')
      return
    }

    try {
      setAnnouncementUploading(true)
      setError('')
      setSuccess('')

      const formData = new FormData()
      formData.append('images', file)

      const response = await fetch(`${API_URL}/api/admin/media-library/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await readResponse(response)
      const uploaded = Array.isArray(data.images) ? data.images[0] : null

      if (!uploaded?.image_url) {
        throw new Error('Image upload did not return a URL')
      }

      setAnnouncementForm((current) => ({
        ...current,
        image_url: uploaded.image_url,
        image_storage_key: uploaded.storage_key || '',
      }))
      setSuccess('Announcement image uploaded. Save the announcement to apply it.')
    } catch (err) {
      setError(err.message || 'Failed to upload announcement image')
    } finally {
      setAnnouncementUploading(false)
    }
  }

  async function saveAnnouncement(event) {
    event.preventDefault()

    if (!selectedCampaignId) {
      setError('Create or select a campaign first.')
      return
    }

    const startsAt = announcementForm.starts_at ? toIso(announcementForm.starts_at) : null
    const endsAt = announcementForm.ends_at ? toIso(announcementForm.ends_at) : null

    if (announcementForm.starts_at && !startsAt) {
      setError('Announcement start time is not valid.')
      return
    }

    if (announcementForm.ends_at && !endsAt) {
      setError('Announcement end time is not valid.')
      return
    }

    if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setError('Announcement end time must be after start time.')
      return
    }

    const hasContent =
      announcementForm.badge_text.trim() ||
      announcementForm.title.trim() ||
      announcementForm.description.trim() ||
      announcementForm.image_url ||
      announcementForm.button_text.trim()

    if (!hasContent) {
      setError('Add a title, description, image, badge, or button first.')
      return
    }

    try {
      setAnnouncementSaving(true)
      setError('')
      setSuccess('')

      const editing = Boolean(editingAnnouncementId)
      const response = await fetch(
        editing
          ? `${API_URL}/api/admin/monthly-vote/announcements/${editingAnnouncementId}`
          : `${API_URL}/api/admin/monthly-vote/campaigns/${selectedCampaignId}/announcements`,
        {
          method: editing ? 'PATCH' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            badge_text: announcementForm.badge_text,
            title: announcementForm.title,
            description: announcementForm.description,
            image_url: announcementForm.image_url,
            image_storage_key: announcementForm.image_storage_key,
            button_text: announcementForm.button_text,
            button_url: announcementForm.button_url,
            background_color: announcementForm.background_color,
            text_color: announcementForm.text_color,
            accent_color: announcementForm.accent_color,
            starts_at: startsAt,
            ends_at: endsAt,
            sort_order: Number(announcementForm.sort_order || 0),
            is_visible: Boolean(announcementForm.is_visible),
          }),
        }
      )

      await readResponse(response)
      setSuccess(editing ? 'Announcement updated.' : 'Announcement created.')
      resetAnnouncementForm()
      await loadAnnouncements(selectedCampaignId)
    } catch (err) {
      setError(err.message || 'Failed to save announcement')
    } finally {
      setAnnouncementSaving(false)
    }
  }

  async function toggleAnnouncementVisibility(item) {
    try {
      setAnnouncementBusyId(item.id)
      setError('')
      setSuccess('')

      const response = await fetch(`${API_URL}/api/admin/monthly-vote/announcements/${item.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: !item.is_visible }),
      })

      await readResponse(response)
      setSuccess(item.is_visible ? 'Announcement hidden.' : 'Announcement shown.')
      await loadAnnouncements(selectedCampaignId)
    } catch (err) {
      setError(err.message || 'Failed to update announcement')
    } finally {
      setAnnouncementBusyId('')
    }
  }

  async function deleteAnnouncement(item) {
    if (!window.confirm(`Delete ${item.title || 'this announcement'}?`)) return

    try {
      setAnnouncementBusyId(item.id)
      setError('')
      setSuccess('')

      const response = await fetch(`${API_URL}/api/admin/monthly-vote/announcements/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      await readResponse(response)
      if (editingAnnouncementId === item.id) resetAnnouncementForm()
      setSuccess('Announcement deleted.')
      await loadAnnouncements(selectedCampaignId)
    } catch (err) {
      setError(err.message || 'Failed to delete announcement')
    } finally {
      setAnnouncementBusyId('')
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
                        disabled={selectedCampaign?.status === 'ended'}
                        onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        {form.status === 'ended' ? (
                          <option value="ended" disabled>Ended (Finalized)</option>
                        ) : null}
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
                          selectedCampaign?.status === 'cancelled' ||
                          selectedCampaign?.status === 'ended'
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
                  <div className="mv-title">Event Appearance</div>
                  <div className="mv-sub">Upload artwork, change text, colors, buttons, and preview the reader hero.</div>
                </div>
                <span className={`mv-publish-badge ${design.is_published ? 'live' : ''}`}>
                  {design.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="mv-body">
                {!selectedCampaignId ? (
                  <div className="mv-empty">Create or select a campaign first.</div>
                ) : designLoading ? (
                  <div className="mv-empty">Loading appearance...</div>
                ) : (
                  <>
                    <div className="mv-fields">
                      <div className="mv-field">
                        <label>Badge Text</label>
                        <input
                          value={design.badge_text}
                          onChange={(e) => setDesign((v) => ({ ...v, badge_text: e.target.value }))}
                          placeholder="MONTHLY VOTE"
                        />
                      </div>

                      <div className="mv-field">
                        <label>Background Type</label>
                        <select
                          value={design.background_type}
                          onChange={(e) => setDesign((v) => ({ ...v, background_type: e.target.value }))}
                        >
                          <option value="gradient">Gradient</option>
                          <option value="solid">Solid</option>
                          <option value="image">Image</option>
                        </select>
                      </div>

                      <div className="mv-field full">
                        <label>Hero Title</label>
                        <input
                          value={design.hero_title}
                          onChange={(e) => setDesign((v) => ({ ...v, hero_title: e.target.value }))}
                          placeholder="August Monthly Vote"
                        />
                      </div>

                      <div className="mv-field full">
                        <label>Description</label>
                        <textarea
                          value={design.hero_description}
                          onChange={(e) => setDesign((v) => ({ ...v, hero_description: e.target.value }))}
                          placeholder="Write the Event message shown to readers..."
                        />
                      </div>

                      <div className="mv-field full">
                        <label>Background Value</label>
                        <input
                          value={design.background_value}
                          onChange={(e) => setDesign((v) => ({ ...v, background_value: e.target.value }))}
                          placeholder={
                            design.background_type === 'solid'
                              ? '#fff4f8'
                              : design.background_type === 'image'
                                ? 'https://...'
                                : 'linear-gradient(135deg,#fff8fb,#ffeef4)'
                          }
                        />
                      </div>

                      <div className="mv-field">
                        <label>Text Color</label>
                        <input
                          type="color"
                          value={design.text_color}
                          onChange={(e) => setDesign((v) => ({ ...v, text_color: e.target.value }))}
                        />
                      </div>

                      <div className="mv-field">
                        <label>Accent Color</label>
                        <input
                          type="color"
                          value={design.accent_color}
                          onChange={(e) => setDesign((v) => ({ ...v, accent_color: e.target.value }))}
                        />
                      </div>

                      <div className="mv-field">
                        <label>Button Text</label>
                        <input
                          value={design.cta_text}
                          onChange={(e) => setDesign((v) => ({ ...v, cta_text: e.target.value }))}
                          placeholder="Read Now"
                        />
                      </div>

                      <div className="mv-field">
                        <label>Button Link</label>
                        <input
                          value={design.cta_url}
                          onChange={(e) => setDesign((v) => ({ ...v, cta_url: e.target.value }))}
                          placeholder="/story/... or https://..."
                        />
                      </div>
                    </div>

                    <div className="mv-section">Hero Image</div>
                    <div className="mv-upload">
                      <div className="mv-upload-row">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                          onChange={uploadHeroImage}
                          disabled={heroUploading}
                        />
                        <button
                          type="button"
                          className="mv-mini remove"
                          disabled={!design.hero_image_url || heroUploading}
                          onClick={() =>
                            setDesign((v) => ({
                              ...v,
                              hero_image_url: '',
                              hero_image_storage_key: '',
                            }))
                          }
                        >
                          Remove Image
                        </button>
                        <span className="mv-meta">{heroUploading ? 'Uploading...' : 'Uses Admin Media Library storage'}</span>
                      </div>

                      {design.hero_image_url ? (
                        <img className="mv-upload-preview" src={design.hero_image_url} alt="Event hero preview" />
                      ) : null}
                    </div>

                    <div className="mv-section">Show / Hide Reader Sections</div>
                    <div className="mv-toggle-grid">
                      {[
                        ['show_hero_image', 'Hero image'],
                        ['show_countdown', 'Countdown'],
                        ['show_vote_balance', 'Vote Balance'],
                        ['show_top_three', 'Top 3'],
                        ['show_candidate_list', 'Candidate List'],
                      ].map(([key, label]) => (
                        <label className="mv-toggle" key={key}>
                          <input
                            type="checkbox"
                            checked={Boolean(design[key])}
                            onChange={(e) => setDesign((v) => ({ ...v, [key]: e.target.checked }))}
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    <div className="mv-section">Mobile Preview</div>
                    <div className="mv-preview-shell">
                      <div className="mv-preview-phone">
                        <div className="mv-preview-top" />
                        <div
                          className="mv-preview-hero"
                          style={{
                            color: design.text_color,
                            background:
                              design.background_type === 'image' && design.background_value
                                ? `linear-gradient(rgba(255,255,255,.14),rgba(255,255,255,.14)), url("${design.background_value}") center/cover`
                                : design.background_value || '#fff8fb',
                          }}
                        >
                          {design.show_hero_image && design.hero_image_url ? (
                            <img className="mv-preview-image" src={design.hero_image_url} alt="" />
                          ) : null}

                          <div className="mv-preview-badge" style={{ color: design.accent_color }}>
                            {design.badge_text || 'MONTHLY VOTE'}
                          </div>
                          <div className="mv-preview-title">
                            {design.hero_title || selectedCampaign?.title || 'Monthly Vote'}
                          </div>
                          {design.hero_description ? (
                            <div className="mv-preview-desc">{design.hero_description}</div>
                          ) : null}

                          {design.cta_text ? (
                            <div className="mv-preview-cta" style={{ background: design.accent_color }}>
                              {design.cta_text}
                            </div>
                          ) : null}

                          <div className="mv-preview-tools">
                            {design.show_vote_balance ? <span className="mv-preview-chip">Vote Balance</span> : null}
                            {design.show_countdown ? <span className="mv-preview-chip">Countdown</span> : null}
                            {design.show_top_three ? <span className="mv-preview-chip">Top 3</span> : null}
                            {design.show_candidate_list ? <span className="mv-preview-chip">Candidates</span> : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mv-design-actions">
                      <button
                        type="button"
                        className="mv-btn light"
                        disabled={designSaving || designPublishing || heroUploading}
                        onClick={() => saveEventAppearance()}
                      >
                        {designSaving ? 'Saving...' : 'Save Draft'}
                      </button>

                      <button
                        type="button"
                        className="mv-btn primary"
                        disabled={designSaving || designPublishing || heroUploading}
                        onClick={() => saveEventAppearance({ publish: true })}
                      >
                        {designPublishing && !design.is_published ? 'Publishing...' : 'Publish'}
                      </button>

                      {design.is_published ? (
                        <button
                          type="button"
                          className="mv-btn dark"
                          disabled={designPublishing}
                          onClick={unpublishEventAppearance}
                        >
                          {designPublishing ? 'Working...' : 'Unpublish'}
                        </button>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="mv-card" style={{ marginTop: 18 }}>
              <div className="mv-head">
                <div>
                  <div className="mv-title">Announcements</div>
                  <div className="mv-sub">Add book releases, event notices, promotions, or other cards shown on the reader Event page.</div>
                </div>
                <button
                  type="button"
                  className="mv-btn light"
                  disabled={!selectedCampaignId || announcementSaving || announcementUploading}
                  onClick={resetAnnouncementForm}
                >
                  New
                </button>
              </div>

              <div className="mv-body">
                {!selectedCampaignId ? (
                  <div className="mv-empty">Create or select a campaign first.</div>
                ) : (
                  <>
                    <form className="mv-ann-form" onSubmit={saveAnnouncement}>
                      <div className="mv-ann-toolbar">
                        <div>
                          <div className="mv-title">{editingAnnouncementId ? 'Edit Announcement' : 'New Announcement'}</div>
                          <div className="mv-sub">Leave Start or End empty if the announcement should not use that limit.</div>
                        </div>
                        <label className="mv-toggle">
                          <input
                            type="checkbox"
                            checked={Boolean(announcementForm.is_visible)}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, is_visible: e.target.checked }))}
                          />
                          Visible
                        </label>
                      </div>

                      <div className="mv-fields">
                        <div className="mv-field">
                          <label>Badge</label>
                          <input
                            value={announcementForm.badge_text}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, badge_text: e.target.value }))}
                            placeholder="NEW BOOK"
                          />
                        </div>

                        <div className="mv-field">
                          <label>Sort Order</label>
                          <input
                            type="number"
                            min="-10000"
                            max="10000"
                            value={announcementForm.sort_order}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, sort_order: e.target.value }))}
                          />
                        </div>

                        <div className="mv-field full">
                          <label>Title</label>
                          <input
                            value={announcementForm.title}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, title: e.target.value }))}
                            placeholder="New book is available now"
                          />
                        </div>

                        <div className="mv-field full">
                          <label>Description</label>
                          <textarea
                            value={announcementForm.description}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, description: e.target.value }))}
                            placeholder="Write the announcement message..."
                          />
                        </div>

                        <div className="mv-field">
                          <label>Button Text</label>
                          <input
                            value={announcementForm.button_text}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, button_text: e.target.value }))}
                            placeholder="Read Now"
                          />
                        </div>

                        <div className="mv-field">
                          <label>Button Link</label>
                          <input
                            value={announcementForm.button_url}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, button_url: e.target.value }))}
                            placeholder="/story/... or https://..."
                          />
                        </div>

                        <div className="mv-field">
                          <label>Starts</label>
                          <input
                            type="datetime-local"
                            value={announcementForm.starts_at}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, starts_at: e.target.value }))}
                          />
                        </div>

                        <div className="mv-field">
                          <label>Ends</label>
                          <input
                            type="datetime-local"
                            value={announcementForm.ends_at}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, ends_at: e.target.value }))}
                          />
                        </div>

                        <div className="mv-field">
                          <label>Background</label>
                          <input
                            type="color"
                            value={announcementForm.background_color}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, background_color: e.target.value }))}
                          />
                        </div>

                        <div className="mv-field">
                          <label>Text Color</label>
                          <input
                            type="color"
                            value={announcementForm.text_color}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, text_color: e.target.value }))}
                          />
                        </div>

                        <div className="mv-field">
                          <label>Accent Color</label>
                          <input
                            type="color"
                            value={announcementForm.accent_color}
                            onChange={(e) => setAnnouncementForm((v) => ({ ...v, accent_color: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="mv-section">Announcement Image</div>
                      <div className="mv-upload">
                        <div className="mv-upload-row">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            onChange={uploadAnnouncementImage}
                            disabled={announcementUploading}
                          />
                          <button
                            type="button"
                            className="mv-mini remove"
                            disabled={!announcementForm.image_url || announcementUploading}
                            onClick={() =>
                              setAnnouncementForm((v) => ({
                                ...v,
                                image_url: '',
                                image_storage_key: '',
                              }))
                            }
                          >
                            Remove Image
                          </button>
                          <span className="mv-meta">{announcementUploading ? 'Uploading...' : 'Uses Admin Media Library storage'}</span>
                        </div>
                        {announcementForm.image_url ? (
                          <img className="mv-upload-preview" src={announcementForm.image_url} alt="Announcement upload preview" />
                        ) : null}
                      </div>

                      <div className="mv-section">Preview</div>
                      <div
                        className="mv-ann-preview"
                        style={{
                          background: announcementForm.background_color,
                          color: announcementForm.text_color,
                        }}
                      >
                        {announcementForm.image_url ? <img src={announcementForm.image_url} alt="" /> : null}
                        {announcementForm.badge_text ? (
                          <div className="mv-ann-preview-badge" style={{ color: announcementForm.accent_color }}>
                            {announcementForm.badge_text}
                          </div>
                        ) : null}
                        <div className="mv-ann-preview-title">{announcementForm.title || 'Announcement title'}</div>
                        {announcementForm.description ? (
                          <div className="mv-ann-preview-desc">{announcementForm.description}</div>
                        ) : null}
                        {announcementForm.button_text ? (
                          <div className="mv-ann-preview-btn" style={{ background: announcementForm.accent_color }}>
                            {announcementForm.button_text}
                          </div>
                        ) : null}
                      </div>

                      <div className="mv-design-actions">
                        <button
                          type="submit"
                          className="mv-btn primary"
                          disabled={announcementSaving || announcementUploading}
                        >
                          {announcementSaving
                            ? 'Saving...'
                            : editingAnnouncementId
                              ? 'Save Announcement'
                              : 'Add Announcement'}
                        </button>
                        {editingAnnouncementId ? (
                          <button
                            type="button"
                            className="mv-btn light"
                            disabled={announcementSaving || announcementUploading}
                            onClick={resetAnnouncementForm}
                          >
                            Cancel Edit
                          </button>
                        ) : null}
                      </div>
                    </form>

                    <div className="mv-section">Current Announcements</div>
                    {announcementsLoading ? (
                      <div className="mv-empty">Loading announcements...</div>
                    ) : announcements.length ? (
                      <div className="mv-ann-list">
                        {announcements.map((item) => (
                          <div className="mv-ann-item" key={item.id}>
                            <div className="mv-ann-thumb">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.title || 'Announcement'} />
                              ) : (
                                <span>IMG</span>
                              )}
                            </div>
                            <div className="mv-copy">
                              <div className="mv-name">{item.title || item.badge_text || 'Announcement'}</div>
                              <div className="mv-meta">
                                Order {Number(item.sort_order || 0)}
                                {item.starts_at ? ` · Starts ${new Date(item.starts_at).toLocaleString()}` : ''}
                                {item.ends_at ? ` · Ends ${new Date(item.ends_at).toLocaleString()}` : ''}
                              </div>
                              <span className={`mv-ann-status ${item.is_visible ? 'live' : ''}`}>
                                {item.is_visible ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                            <div className="mv-actions">
                              <button
                                type="button"
                                className="mv-mini add"
                                disabled={announcementBusyId === item.id}
                                onClick={() => editAnnouncement(item)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="mv-mini toggle"
                                disabled={announcementBusyId === item.id}
                                onClick={() => toggleAnnouncementVisibility(item)}
                              >
                                {item.is_visible ? 'Hide' : 'Show'}
                              </button>
                              <button
                                type="button"
                                className="mv-mini remove"
                                disabled={announcementBusyId === item.id}
                                onClick={() => deleteAnnouncement(item)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mv-empty">No announcements yet.</div>
                    )}
                  </>
                )}
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
