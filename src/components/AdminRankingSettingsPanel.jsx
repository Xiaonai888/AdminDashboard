import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const DEFAULT_SETTINGS = {
  story_view_weight: 1,
  story_like_weight: 5,
  story_comment_weight: 10,
  story_episode_weight: 3,
  author_view_weight: 1,
  author_like_weight: 5,
  author_comment_weight: 10,
  author_follower_weight: 20,
  author_story_weight: 3,
  episode_view_weight: 1,
  episode_like_weight: 5,
  episode_comment_weight: 10,
  min_story_views: 0,
  min_story_likes: 0,
  min_story_comments: 0,
  min_story_episodes: 0,
  min_author_stories: 1,
  min_author_followers: 0,
  min_episode_views: 0,
  min_episode_likes: 0,
  min_episode_comments: 0,
  story_rank_enabled: true,
  genre_rank_enabled: true,
  author_rank_enabled: true,
  episode_rank_enabled: true,
  updated_at: '',
  updated_by: '',
}

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

function NumberField({ label, value, onChange, step = 1 }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ color: '#475569', fontSize: 12, fontWeight: 900 }}>{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: '100%',
          height: 42,
          boxSizing: 'border-box',
          border: '1px solid #E2E8F0',
          background: '#F8FAFC',
          color: '#0F172A',
          borderRadius: 12,
          padding: '0 12px',
          outline: 'none',
          font: 'inherit',
          fontSize: 13,
          fontWeight: 800,
        }}
      />
    </label>
  )
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        border: '1px solid #E2E8F0',
        background: checked ? '#F0FDF4' : '#F8FAFC',
        borderRadius: 14,
        padding: 13,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ minWidth: 0 }}>
        <strong style={{ display: 'block', color: '#0F172A', fontSize: 13, fontWeight: 950 }}>{label}</strong>
        <span style={{ display: 'block', marginTop: 4, color: '#64748B', fontSize: 11, fontWeight: 750, lineHeight: 1.5 }}>
          {description}
        </span>
      </span>
      <span
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          padding: 3,
          boxSizing: 'border-box',
          background: checked ? '#16A34A' : '#CBD5E1',
          flexShrink: 0,
          display: 'flex',
          justifyContent: checked ? 'flex-end' : 'flex-start',
          alignItems: 'center',
        }}
      >
        <span style={{ width: 18, height: 18, borderRadius: 999, background: 'white' }} />
      </span>
    </button>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section
      style={{
        border: '1px solid #E2E8F0',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: '#0F172A', fontSize: 14, fontWeight: 950 }}>{title}</div>
        <div style={{ marginTop: 4, color: '#64748B', fontSize: 11, fontWeight: 750, lineHeight: 1.5 }}>{subtitle}</div>
      </div>
      {children}
    </section>
  )
}

export default function AdminRankingSettingsPanel() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [original, setOriginal] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(original),
    [settings, original]
  )

  useEffect(() => {
    let alive = true

    async function loadSettings() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/api/admin/ranking/settings`, {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok || data.ok === false) {
          throw new Error(data.message || 'Failed to load ranking settings')
        }

        if (!alive) return

        const next = { ...DEFAULT_SETTINGS, ...(data.settings || {}) }
        setSettings(next)
        setOriginal(next)
      } catch (err) {
        if (!alive) return
        setError(err.message || 'Failed to load ranking settings')
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadSettings()

    return () => {
      alive = false
    }
  }, [])

  function setNumber(field, value) {
    const parsed = Number(value)
    setSettings((current) => ({
      ...current,
      [field]: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
    }))
    setSuccess('')
  }

  function setBoolean(field, value) {
    setSettings((current) => ({
      ...current,
      [field]: Boolean(value),
    }))
    setSuccess('')
  }

  async function saveSettings() {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = { ...settings }
      delete payload.id
      delete payload.updated_at
      delete payload.updated_by

      const response = await fetch(`${API_URL}/api/admin/ranking/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save ranking settings')
      }

      const next = { ...DEFAULT_SETTINGS, ...(data.settings || settings) }
      setSettings(next)
      setOriginal(next)
      setSuccess('Ranking settings saved')
    } catch (err) {
      setError(err.message || 'Failed to save ranking settings')
    } finally {
      setSaving(false)
    }
  }

  function resetChanges() {
    setSettings(original)
    setSuccess('')
    setError('')
  }

  if (loading) {
    return (
      <div className="ranking-loading">
        <span className="ranking-spinner" />
        <div className="ranking-empty-title">Loading Ranking Settings...</div>
        <div className="ranking-empty-text">Loading saved ranking rules.</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 18 }}>
      {error ? <div className="ranking-alert" style={{ marginBottom: 14 }}>{error}</div> : null}

      {success ? (
        <div
          style={{
            border: '1px solid #BBF7D0',
            background: '#F0FDF4',
            color: '#15803D',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 14,
            fontSize: 13,
            fontWeight: 850,
          }}
        >
          {success}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        <SectionCard title="Rank Availability" subtitle="Enable or disable each public ranking category.">
          <div style={{ display: 'grid', gap: 10 }}>
            <ToggleField
              label="Story Rank"
              description="Allow Story Rank to appear and calculate."
              checked={settings.story_rank_enabled}
              onChange={(value) => setBoolean('story_rank_enabled', value)}
            />
            <ToggleField
              label="Genre Rank"
              description="Allow Genre Rank to appear and calculate."
              checked={settings.genre_rank_enabled}
              onChange={(value) => setBoolean('genre_rank_enabled', value)}
            />
            <ToggleField
              label="Author Rank"
              description="Allow Author Rank to appear and calculate."
              checked={settings.author_rank_enabled}
              onChange={(value) => setBoolean('author_rank_enabled', value)}
            />
            <ToggleField
              label="Episode Rank"
              description="Allow Episode Rank to appear and calculate."
              checked={settings.episode_rank_enabled}
              onChange={(value) => setBoolean('episode_rank_enabled', value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Story Score Formula" subtitle="Configure the weight of each Story Rank metric.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <NumberField label="Views Weight" step="0.1" value={settings.story_view_weight} onChange={(value) => setNumber('story_view_weight', value)} />
            <NumberField label="Likes Weight" step="0.1" value={settings.story_like_weight} onChange={(value) => setNumber('story_like_weight', value)} />
            <NumberField label="Comments Weight" step="0.1" value={settings.story_comment_weight} onChange={(value) => setNumber('story_comment_weight', value)} />
            <NumberField label="Episodes Weight" step="0.1" value={settings.story_episode_weight} onChange={(value) => setNumber('story_episode_weight', value)} />
          </div>
        </SectionCard>

        <SectionCard title="Author Score Formula" subtitle="Configure the weight of each Author Rank metric.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <NumberField label="Views Weight" step="0.1" value={settings.author_view_weight} onChange={(value) => setNumber('author_view_weight', value)} />
            <NumberField label="Likes Weight" step="0.1" value={settings.author_like_weight} onChange={(value) => setNumber('author_like_weight', value)} />
            <NumberField label="Comments Weight" step="0.1" value={settings.author_comment_weight} onChange={(value) => setNumber('author_comment_weight', value)} />
            <NumberField label="Followers Weight" step="0.1" value={settings.author_follower_weight} onChange={(value) => setNumber('author_follower_weight', value)} />
            <NumberField label="Stories Weight" step="0.1" value={settings.author_story_weight} onChange={(value) => setNumber('author_story_weight', value)} />
          </div>
        </SectionCard>

        <SectionCard title="Episode Score Formula" subtitle="Configure the weight of each Episode Rank metric.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <NumberField label="Views Weight" step="0.1" value={settings.episode_view_weight} onChange={(value) => setNumber('episode_view_weight', value)} />
            <NumberField label="Likes Weight" step="0.1" value={settings.episode_like_weight} onChange={(value) => setNumber('episode_like_weight', value)} />
            <NumberField label="Comments Weight" step="0.1" value={settings.episode_comment_weight} onChange={(value) => setNumber('episode_comment_weight', value)} />
          </div>
        </SectionCard>

        <SectionCard title="Story Minimum Activity" subtitle="Minimum activity required before a story can qualify for ranking.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <NumberField label="Minimum Views" value={settings.min_story_views} onChange={(value) => setNumber('min_story_views', value)} />
            <NumberField label="Minimum Likes" value={settings.min_story_likes} onChange={(value) => setNumber('min_story_likes', value)} />
            <NumberField label="Minimum Comments" value={settings.min_story_comments} onChange={(value) => setNumber('min_story_comments', value)} />
            <NumberField label="Minimum Episodes" value={settings.min_story_episodes} onChange={(value) => setNumber('min_story_episodes', value)} />
          </div>
        </SectionCard>

        <SectionCard title="Author Minimum Activity" subtitle="Minimum activity required before an author can qualify for ranking.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <NumberField label="Minimum Stories" value={settings.min_author_stories} onChange={(value) => setNumber('min_author_stories', value)} />
            <NumberField label="Minimum Followers" value={settings.min_author_followers} onChange={(value) => setNumber('min_author_followers', value)} />
          </div>
        </SectionCard>

        <SectionCard title="Episode Minimum Activity" subtitle="Minimum activity required before an episode can qualify for ranking.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            <NumberField label="Minimum Views" value={settings.min_episode_views} onChange={(value) => setNumber('min_episode_views', value)} />
            <NumberField label="Minimum Likes" value={settings.min_episode_likes} onChange={(value) => setNumber('min_episode_likes', value)} />
            <NumberField label="Minimum Comments" value={settings.min_episode_comments} onChange={(value) => setNumber('min_episode_comments', value)} />
          </div>
        </SectionCard>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 16,
          padding: 14,
          border: '1px solid #E2E8F0',
          borderRadius: 15,
          background: '#F8FAFC',
        }}
      >
        <div>
          <div style={{ color: '#475569', fontSize: 11, fontWeight: 850 }}>
            Last updated: {formatDateTime(settings.updated_at)}
          </div>
          <div style={{ marginTop: 3, color: '#94A3B8', fontSize: 11, fontWeight: 750 }}>
            By: {settings.updated_by || '-'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ranking-btn light"
            disabled={!dirty || saving}
            onClick={resetChanges}
            style={{ padding: '0 16px' }}
          >
            Reset
          </button>
          <button
            type="button"
            className="ranking-btn"
            disabled={!dirty || saving}
            onClick={saveSettings}
            style={{ padding: '0 18px' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, color: '#64748B', fontSize: 11, fontWeight: 750, lineHeight: 1.6 }}>
        These values are stored in the Ranking Settings table. The ranking engine must read these saved values before score and minimum-activity changes affect live rank calculations.
      </div>
    </div>
  )
}
