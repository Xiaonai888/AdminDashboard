import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function GenreManagementPage() {
  const [genres, setGenres] = useState([])
  const [featuredTabs, setFeaturedTabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sort_order: 0,
    is_active: true,
  })

  const selectedGenreIds = useMemo(() => {
    return featuredTabs
      .filter((tab) => !tab.is_locked && tab.genre_id)
      .map((tab) => tab.genre_id)
  }, [featuredTabs])

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
    'X-Admin-Name': 'Admin',
  }

  async function loadData() {
    try {
      setLoading(true)

      const [genresRes, tabsRes] = await Promise.all([
        fetch(`${API_URL}/api/genres/admin/records`, { headers: requestHeaders }),
        fetch(`${API_URL}/api/genres/featured-tabs?include_inactive=true`, { headers: requestHeaders }),
      ])

      const genresData = await genresRes.json().catch(() => ({}))
      const tabsData = await tabsRes.json().catch(() => ({}))

      if (!genresRes.ok || genresData.ok === false) {
        throw new Error(genresData.message || 'Failed to load genres')
      }

      if (!tabsRes.ok || tabsData.ok === false) {
        throw new Error(tabsData.message || 'Failed to load featured tabs')
      }

      setGenres(genresData.genres || [])
      setFeaturedTabs(tabsData.tabs || [])
    } catch (error) {
      setMessage(error.message || 'Failed to load genre data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function resetForm() {
    setEditingId(null)
    setForm({
      name: '',
      slug: '',
      sort_order: 0,
      is_active: true,
    })
  }

  function handleNameChange(value) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editingId ? current.slug : slugify(value),
    }))
  }

  function handleEdit(genre) {
    setEditingId(genre.id)
    setForm({
      name: genre.name || '',
      slug: genre.slug || '',
      sort_order: genre.sort_order || 0,
      is_active: Boolean(genre.is_active),
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage('')

      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active),
      }

      const url = editingId
        ? `${API_URL}/api/genres/admin/records/${editingId}`
        : `${API_URL}/api/genres/admin/records`

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save genre')
      }

      setMessage(editingId ? 'Genre updated' : 'Genre created')
      resetForm()
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Failed to save genre')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(genre) {
    if (genre.story_count > 0) {
      setMessage('This genre has stories. Disable it instead.')
      return
    }

    try {
      setSaving(true)
      setMessage('')

      const res = await fetch(`${API_URL}/api/genres/admin/records/${genre.id}`, {
        method: 'DELETE',
        headers: requestHeaders,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to delete genre')
      }

      setMessage('Genre deleted')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Failed to delete genre')
    } finally {
      setSaving(false)
    }
  }

  function toggleFeaturedGenre(genreId) {
    const exists = selectedGenreIds.includes(genreId)

    if (exists) {
      setFeaturedTabs((current) => current.filter((tab) => tab.genre_id !== genreId))
      return
    }

    if (selectedGenreIds.length >= 11) {
      setMessage('For You can show only 11 custom genres plus Today')
      return
    }

    const genre = genres.find((item) => item.id === genreId)
    if (!genre) return

    setFeaturedTabs((current) => [
      ...current,
      {
        genre_id: genre.id,
        label: genre.name,
        slug: genre.slug,
        is_locked: false,
        is_active: true,
        sort_order: (current.length + 1) * 10,
        genre,
      },
    ])
  }

  async function saveFeaturedTabs() {
    try {
      setSaving(true)
      setMessage('')

      const res = await fetch(`${API_URL}/api/genres/admin/featured-tabs`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify({ genre_ids: selectedGenreIds }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save featured tabs')
      }

      setMessage('For You genre tabs updated')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Failed to save featured tabs')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 28, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, color: '#0f172a' }}>Genre Management</h1>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
              Manage story genres and choose which genre tabs show on For You.
            </p>
          </div>
          <button
            type="button"
            onClick={saveFeaturedTabs}
            disabled={saving}
            style={{
              border: 0,
              borderRadius: 12,
              padding: '12px 18px',
              background: '#4f46e5',
              color: '#fff',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Save For You Tabs
          </button>
        </div>

        {message && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 18, color: '#334155', fontWeight: 700 }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 18 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, height: 'fit-content' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>{editingId ? 'Edit Genre' : 'Create Genre'}</h2>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 6 }}>Name</label>
            <input
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Romance"
              style={{ width: '100%', padding: 12, border: '1px solid #cbd5e1', borderRadius: 12, marginBottom: 14 }}
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 6 }}>Slug</label>
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
              placeholder="romance"
              style={{ width: '100%', padding: 12, border: '1px solid #cbd5e1', borderRadius: 12, marginBottom: 14 }}
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 6 }}>Sort Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
              style={{ width: '100%', padding: 12, border: '1px solid #cbd5e1', borderRadius: 12, marginBottom: 14 }}
            />

            <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, fontWeight: 800, color: '#475569' }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              />
              Active
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1, border: 0, borderRadius: 12, padding: 12, background: '#0f172a', color: '#fff', fontWeight: 800 }}
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 12, background: '#fff', color: '#475569', fontWeight: 800 }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>For You Genre Tabs</h2>
              <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 13, fontWeight: 700 }}>
                Today is locked. Choose up to 11 more genres.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ padding: '9px 14px', background: '#4f46e5', color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 800 }}>
                  Today locked
                </span>

                {genres.map((genre) => {
                  const active = selectedGenreIds.includes(genre.id)
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleFeaturedGenre(genre.id)}
                      disabled={!genre.is_active}
                      style={{
                        border: active ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                        background: active ? '#eef2ff' : '#fff',
                        color: genre.is_active ? '#0f172a' : '#94a3b8',
                        borderRadius: 999,
                        padding: '9px 14px',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: genre.is_active ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {active ? '✓ ' : ''}{genre.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>All Genres</h2>
              </div>

              {loading ? (
                <div style={{ padding: 22, color: '#64748b', fontWeight: 700 }}>Loading genres...</div>
              ) : genres.length === 0 ? (
                <div style={{ padding: 22, color: '#64748b', fontWeight: 700 }}>No genres yet</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                        <th style={{ textAlign: 'left', padding: 14 }}>Name</th>
                        <th style={{ textAlign: 'left', padding: 14 }}>Slug</th>
                        <th style={{ textAlign: 'left', padding: 14 }}>Stories</th>
                        <th style={{ textAlign: 'left', padding: 14 }}>Status</th>
                        <th style={{ textAlign: 'right', padding: 14 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {genres.map((genre) => (
                        <tr key={genre.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: 14, fontWeight: 800, color: '#0f172a' }}>{genre.name}</td>
                          <td style={{ padding: 14, color: '#64748b' }}>{genre.slug}</td>
                          <td style={{ padding: 14, color: '#64748b' }}>{genre.story_count || 0}</td>
                          <td style={{ padding: 14 }}>
                            <span style={{
                              padding: '5px 10px',
                              borderRadius: 999,
                              background: genre.is_active ? '#dcfce7' : '#f1f5f9',
                              color: genre.is_active ? '#16a34a' : '#64748b',
                              fontWeight: 800,
                              fontSize: 12,
                            }}>
                              {genre.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td style={{ padding: 14, textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleEdit(genre)}
                              style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 10, padding: '8px 10px', fontWeight: 800, marginRight: 8 }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(genre)}
                              disabled={saving || genre.story_count > 0}
                              style={{
                                border: '1px solid #fecaca',
                                background: '#fff',
                                color: genre.story_count > 0 ? '#94a3b8' : '#ef4444',
                                borderRadius: 10,
                                padding: '8px 10px',
                                fontWeight: 800,
                                cursor: genre.story_count > 0 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
