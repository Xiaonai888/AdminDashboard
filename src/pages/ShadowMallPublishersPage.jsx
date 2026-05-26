import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token')
}

const emptyForm = {
  name: '',
  description: '',
  sort_order: '',
  is_active: true,
}

function formatPrice(value) {
  const number = Number(value || 0)
  return `$${number.toFixed(2)}`
}

function getBookCountText(value) {
  const count = Number(value || 0)
  return `${count} ${count === 1 ? 'book' : 'books'}`
}

function PublisherImage({ publisher, size = 56 }) {
  const letter = publisher?.name ? publisher.name.slice(0, 1).toUpperCase() : 'P'

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#EEF2FF',
        color: '#4F46E5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(13, Math.round(size * 0.32)),
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {publisher?.logo_url ? (
        <img
          src={publisher.logo_url}
          alt={publisher.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        letter
      )}
    </div>
  )
}

function ProductMiniRow({ product, actionLabel, onAction, danger = false }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '54px minmax(0, 1fr) auto',
        gap: 12,
        alignItems: 'center',
        padding: 12,
        border: '1px solid #EEF2F7',
        borderRadius: 16,
        background: '#FFFFFF',
      }}
    >
      <div
        style={{
          width: 54,
          height: 74,
          borderRadius: 12,
          overflow: 'hidden',
          background: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94A3B8',
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          'Book'
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.title || 'Untitled book'}
        </div>
        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.author_name || 'Unknown author'}
        </div>
        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#EF4444' }}>{formatPrice(product.price_usd)}</span>
          {product.publisher ? (
            <span style={{ borderRadius: 999, padding: '3px 8px', background: '#FEF3C7', color: '#92400E', fontSize: 10, fontWeight: 900 }}>
              {product.publisher}
            </span>
          ) : (
            <span style={{ borderRadius: 999, padding: '3px 8px', background: '#F1F5F9', color: '#64748B', fontSize: 10, fontWeight: 900 }}>
              No publisher
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        style={{
          border: 0,
          borderRadius: 12,
          padding: '10px 12px',
          background: danger ? '#FEE2E2' : '#EEF2FF',
          color: danger ? '#B91C1C' : '#4F46E5',
          fontSize: 11,
          fontWeight: 900,
          cursor: 'pointer',
        }}
      >
        {actionLabel}
      </button>
    </div>
  )
}

export default function ShadowMallPublishersPage() {
  const navigate = useNavigate()
  const logoInputRef = useRef(null)
  const [publishers, setPublishers] = useState([])
  const [selectedPublisher, setSelectedPublisher] = useState(null)
  const [assignedProducts, setAssignedProducts] = useState([])
  const [matches, setMatches] = useState([])
  const [manualSearch, setManualSearch] = useState('')
  const [manualProducts, setManualProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [removeLogo, setRemoveLogo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const activePublishers = useMemo(
    () => publishers.filter((publisher) => publisher.is_active),
    [publishers]
  )

  function authHeaders() {
    const token = getAdminToken()

    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    }
  }

  function authUploadHeaders() {
    const token = getAdminToken()

    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  async function loadPublishers() {
    try {
      setLoading(true)
      setMessage('')

      const response = await fetch(`${API_URL}/api/shadow-mall/publishers?include_inactive=true`, {
        headers: authHeaders(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load publishers')
      }

      setPublishers(data.publishers || [])
    } catch (error) {
      setPublishers([])
      setMessage(error.message || 'Failed to load publishers')
    } finally {
      setLoading(false)
    }
  }

  async function loadPublisherProducts(publisher = selectedPublisher) {
    if (!publisher?.id) return

    try {
      setMessage('')

      const response = await fetch(`${API_URL}/api/shadow-mall/admin/publishers/${publisher.id}/products`, {
        headers: authHeaders(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load publisher products')
      }

      setAssignedProducts(data.products || [])
    } catch (error) {
      setAssignedProducts([])
      setMessage(error.message || 'Failed to load publisher products')
    }
  }

  async function loadAutoMatches(publisher = selectedPublisher) {
    if (!publisher?.id) return

    try {
      setMessage('')

      const response = await fetch(`${API_URL}/api/shadow-mall/admin/publishers/${publisher.id}/auto-match`, {
        headers: authHeaders(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to auto match products')
      }

      setMatches(data.matches || [])
      setMessage(`${data.matches?.length || 0} auto matches found.`)
    } catch (error) {
      setMatches([])
      setMessage(error.message || 'Failed to auto match products')
    }
  }

  async function searchManualProducts() {
    const keyword = manualSearch.trim()

    if (!keyword) {
      setManualProducts([])
      return
    }

    try {
      setMessage('')

      const params = new URLSearchParams({
        include_inactive: 'true',
        limit: '50',
        search: keyword,
      })

      const response = await fetch(`${API_URL}/api/shadow-mall/products?${params.toString()}`, {
        headers: authHeaders(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to search products')
      }

      setManualProducts(data.products || [])
    } catch (error) {
      setManualProducts([])
      setMessage(error.message || 'Failed to search products')
    }
  }

  async function assignProducts(productIds) {
    if (!selectedPublisher?.id || !productIds.length) return

    try {
      setSaving(true)
      setMessage('')

      const response = await fetch(`${API_URL}/api/shadow-mall/admin/publishers/${selectedPublisher.id}/assign-products`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ product_ids: productIds }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to assign products')
      }

      setMatches((current) => current.filter((product) => !productIds.includes(product.id)))
      setManualProducts((current) => current.filter((product) => !productIds.includes(product.id)))
      await loadPublisherProducts(selectedPublisher)
      await loadPublishers()
      setMessage(`${productIds.length} product${productIds.length > 1 ? 's' : ''} assigned.`)
    } catch (error) {
      setMessage(error.message || 'Failed to assign products')
    } finally {
      setSaving(false)
    }
  }

  async function removeProducts(productIds) {
    if (!selectedPublisher?.id || !productIds.length) return

    try {
      setSaving(true)
      setMessage('')

      const response = await fetch(`${API_URL}/api/shadow-mall/admin/publishers/${selectedPublisher.id}/remove-products`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ product_ids: productIds }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to remove products')
      }

      await loadPublisherProducts(selectedPublisher)
      await loadPublishers()
      setMessage(`${productIds.length} product${productIds.length > 1 ? 's' : ''} removed from publisher.`)
    } catch (error) {
      setMessage(error.message || 'Failed to remove products')
    } finally {
      setSaving(false)
    }
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0]

    if (!file) return

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setRemoveLogo(false)
  }

  function clearLogo() {
    setLogoFile(null)
    setLogoPreview('')
    setRemoveLogo(true)

    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  function resetLogo() {
    setLogoFile(null)
    setLogoPreview('')
    setRemoveLogo(false)

    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    resetLogo()
  }

  async function savePublisher(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setMessage('Publisher name is required.')
      return
    }

    try {
      setSaving(true)
      setMessage('')

      const formData = new FormData()
      formData.append('name', form.name.trim())
      formData.append('description', form.description.trim())
      formData.append('sort_order', form.sort_order === '' ? '0' : String(Number(form.sort_order)))
      formData.append('is_active', String(Boolean(form.is_active)))

      if (logoFile) {
        formData.append('publisher_logo', logoFile)
      }

      if (removeLogo && !logoFile) {
        formData.append('logo_url', '')
      }

      const url = editingId
        ? `${API_URL}/api/shadow-mall/admin/publishers/${editingId}`
        : `${API_URL}/api/shadow-mall/admin/publishers`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: authUploadHeaders(),
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to save publisher')
      }

      resetForm()
      setMessage(editingId ? 'Publisher updated.' : 'Publisher created.')
      await loadPublishers()
    } catch (error) {
      setMessage(error.message || 'Failed to save publisher')
    } finally {
      setSaving(false)
    }
  }

  function startEditPublisher(publisher) {
    setEditingId(publisher.id)
    setForm({
      name: publisher.name || '',
      description: publisher.description || '',
      sort_order: publisher.sort_order ?? '',
      is_active: Boolean(publisher.is_active),
    })
    setLogoFile(null)
    setLogoPreview(publisher.logo_url || '')
    setRemoveLogo(false)

    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function disablePublisher(publisher) {
    const confirmed = window.confirm(`Hide ${publisher.name}?`)
    if (!confirmed) return

    try {
      setSaving(true)
      setMessage('')

      const response = await fetch(`${API_URL}/api/shadow-mall/admin/publishers/${publisher.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to hide publisher')
      }

      if (selectedPublisher?.id === publisher.id) {
        setSelectedPublisher(null)
        setAssignedProducts([])
        setMatches([])
      }

      setMessage('Publisher hidden.')
      await loadPublishers()
    } catch (error) {
      setMessage(error.message || 'Failed to hide publisher')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadPublishers()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(searchManualProducts, 350)
    return () => window.clearTimeout(timer)
  }, [manualSearch])

  function selectPublisher(publisher) {
    setSelectedPublisher(publisher)
    setAssignedProducts([])
    setMatches([])
    setManualProducts([])
    setManualSearch('')
    loadPublisherProducts(publisher)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: 28,
    }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #F8FAFC; }
        .publisher-input {
          width: 100%;
          height: 44px;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 0 12px;
          outline: none;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          background: #FFFFFF;
        }
        .publisher-textarea {
          width: 100%;
          min-height: 94px;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 12px;
          outline: none;
          resize: vertical;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          background: #FFFFFF;
        }
        .publisher-label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 12px;
          font-weight: 900;
        }
        .publisher-button {
          border: 0;
          border-radius: 14px;
          height: 42px;
          padding: 0 14px;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }
      `}</style>

      <header style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 18,
        marginBottom: 20,
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 11px',
            borderRadius: 999,
            background: '#EEF2FF',
            color: '#4F46E5',
            fontSize: 11,
            fontWeight: 900,
            marginBottom: 10,
          }}>
            🏢 Shadow Mall Publishers
          </div>
          <h1 style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 900, letterSpacing: '-0.04em', margin: 0 }}>
            Publishers
          </h1>
          <p style={{ marginTop: 8, color: '#64748B', fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
            Create publishers, upload logos, match books automatically, and manually assign books when names do not match.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/shadow-mall')}
            style={{
              height: 42,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              borderRadius: 14,
              padding: '0 16px',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            Back to Products
          </button>
          <button
            type="button"
            onClick={loadPublishers}
            style={{
              height: 42,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              borderRadius: 14,
              padding: '0 16px',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </header>

      {message ? (
        <div style={{
          marginBottom: 16,
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          background: '#FFFFFF',
          padding: '12px 14px',
          color: '#334155',
          fontSize: 12,
          fontWeight: 900,
          lineHeight: 1.5,
        }}>
          {message}
        </div>
      ) : null}

      <section style={{
        display: 'grid',
        gridTemplateColumns: '420px minmax(0, 1fr)',
        gap: 20,
        alignItems: 'start',
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
        }}>
          <div style={{ padding: '20px 22px', borderBottom: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
              {editingId ? 'Edit Publisher' : 'Create Publisher'}
            </h2>
            <p style={{ marginTop: 4, color: '#64748B', fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>
              Recommended logo: square 800×800px, PNG, JPG, or WEBP.
            </p>
          </div>

          <form onSubmit={savePublisher} style={{ padding: 22 }}>
            <label style={{ display: 'block', marginBottom: 13 }}>
              <span className="publisher-label">Publisher Name</span>
              <input
                className="publisher-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Publisher A"
              />
            </label>

            <div style={{ marginBottom: 13 }}>
              <span className="publisher-label">Publisher Logo</span>
              <div style={{
                border: '1px dashed #CBD5E1',
                borderRadius: 22,
                background: '#F8FAFC',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <PublisherImage publisher={{ name: form.name || 'Publisher', logo_url: logoPreview }} size={76} />

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ color: '#0F172A', fontSize: 13, fontWeight: 900 }}>
                    Upload logo image
                  </div>
                  <div style={{ marginTop: 4, color: '#64748B', fontSize: 11, fontWeight: 700, lineHeight: 1.5 }}>
                    Square logo looks best in Reader search.
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="publisher-button"
                      style={{ background: '#EEF2FF', color: '#4F46E5' }}
                    >
                      Upload / Replace
                    </button>
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="publisher-button"
                      style={{ background: '#FEE2E2', color: '#B91C1C' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: 13 }}>
              <span className="publisher-label">Description</span>
              <textarea
                className="publisher-textarea"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Optional short note"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'block', marginBottom: 13 }}>
                <span className="publisher-label">Sort Order</span>
                <input
                  className="publisher-input"
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                  placeholder="1"
                />
              </label>

              <label style={{
                marginBottom: 13,
                borderRadius: 14,
                padding: '12px 13px',
                background: '#F8FAFC',
                fontSize: 12,
                fontWeight: 900,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                />
                Active
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                height: 48,
                border: 0,
                borderRadius: 16,
                background: '#4F46E5',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 900,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                boxShadow: '0 10px 24px rgba(79, 70, 229, .18)',
              }}
            >
              {saving ? 'Saving...' : editingId ? 'Update Publisher' : 'Create Publisher'}
            </button>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  width: '100%',
                  height: 44,
                  border: 0,
                  borderRadius: 14,
                  background: '#F8FAFC',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: 'pointer',
                  marginTop: 10,
                }}
              >
                Cancel Edit
              </button>
            ) : null}
          </form>
        </div>

        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 16 }}>
              <div style={{ color: '#64748B', fontSize: 11, fontWeight: 900 }}>TOTAL</div>
              <div style={{ marginTop: 6, fontSize: 24, fontWeight: 900 }}>{publishers.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 16 }}>
              <div style={{ color: '#64748B', fontSize: 11, fontWeight: 900 }}>ACTIVE</div>
              <div style={{ marginTop: 6, fontSize: 24, fontWeight: 900 }}>{activePublishers.length}</div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 16 }}>
              <div style={{ color: '#64748B', fontSize: 11, fontWeight: 900 }}>SELECTED</div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedPublisher?.name || '-'}
              </div>
            </div>
          </div>

          <section style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)',
          }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Publisher List</h2>
              <p style={{ marginTop: 4, color: '#64748B', fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>
                Select one publisher to auto match or manually assign products.
              </p>
            </div>

            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', padding: 30, textAlign: 'center', color: '#94A3B8', fontWeight: 900 }}>
                  Loading publishers...
                </div>
              ) : publishers.length ? (
                publishers.map((publisher) => (
                  <div
                    key={publisher.id}
                    style={{
                      border: selectedPublisher?.id === publisher.id ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      borderRadius: 20,
                      padding: 14,
                      background: publisher.is_active ? '#FFFFFF' : '#F8FAFC',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => selectPublisher(publisher)}
                      style={{
                        width: '100%',
                        border: 0,
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <PublisherImage publisher={publisher} size={56} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {publisher.name}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: '#64748B' }}>
                          {getBookCountText(publisher.book_count)}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, color: publisher.is_active ? '#10B981' : '#94A3B8' }}>
                          {publisher.is_active ? 'Active' : 'Hidden'} · Sort {publisher.sort_order}
                        </div>
                      </div>
                    </button>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => startEditPublisher(publisher)}
                        style={{ flex: 1, border: 0, borderRadius: 12, background: '#EEF2FF', color: '#4F46E5', height: 34, fontSize: 11, fontWeight: 900, cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => disablePublisher(publisher)}
                        style={{ flex: 1, border: 0, borderRadius: 12, background: '#FEE2E2', color: '#B91C1C', height: 34, fontSize: 11, fontWeight: 900, cursor: 'pointer' }}
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', padding: 30, textAlign: 'center', color: '#94A3B8', fontWeight: 900 }}>
                  No publishers yet.
                </div>
              )}
            </div>
          </section>

          {selectedPublisher ? (
            <section style={{
              marginTop: 20,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 20,
            }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Assigned Products</h3>
                    <p style={{ marginTop: 4, color: '#64748B', fontSize: 12, fontWeight: 600 }}>
                      {assignedProducts.length} books linked to {selectedPublisher.name}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadPublisherProducts(selectedPublisher)}
                    style={{ border: 0, borderRadius: 12, background: '#F8FAFC', color: '#475569', height: 36, padding: '0 12px', fontSize: 11, fontWeight: 900, cursor: 'pointer' }}
                  >
                    Refresh
                  </button>
                </div>

                <div style={{ padding: 14, display: 'grid', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
                  {assignedProducts.length ? (
                    assignedProducts.map((product) => (
                      <ProductMiniRow
                        key={product.id}
                        product={product}
                        actionLabel="Remove"
                        danger
                        onAction={() => removeProducts([product.id])}
                      />
                    ))
                  ) : (
                    <div style={{ padding: 34, textAlign: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 900 }}>
                      No products assigned yet.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Auto Match</h3>
                      <p style={{ marginTop: 4, color: '#64748B', fontSize: 12, fontWeight: 600 }}>
                        Finds books with similar publisher text.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadAutoMatches(selectedPublisher)}
                      style={{ border: 0, borderRadius: 12, background: '#EEF2FF', color: '#4F46E5', height: 36, padding: '0 12px', fontSize: 11, fontWeight: 900, cursor: 'pointer' }}
                    >
                      Auto Match
                    </button>
                  </div>

                  <div style={{ padding: 14, display: 'grid', gap: 10 }}>
                    {matches.length ? (
                      <>
                        <button
                          type="button"
                          onClick={() => assignProducts(matches.map((product) => product.id))}
                          disabled={saving}
                          style={{
                            width: '100%',
                            height: 42,
                            border: 0,
                            borderRadius: 14,
                            background: '#10B981',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: saving ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Assign All Matches
                        </button>
                        {matches.map((product) => (
                          <ProductMiniRow
                            key={product.id}
                            product={product}
                            actionLabel="Assign"
                            onAction={() => assignProducts([product.id])}
                          />
                        ))}
                      </>
                    ) : (
                      <div style={{ padding: 28, textAlign: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 900 }}>
                        No auto matches loaded.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Manual Assign</h3>
                    <p style={{ marginTop: 4, color: '#64748B', fontSize: 12, fontWeight: 600 }}>
                      Search title or author, then assign by hand.
                    </p>
                  </div>

                  <div style={{ padding: 14 }}>
                    <input
                      value={manualSearch}
                      onChange={(event) => setManualSearch(event.target.value)}
                      placeholder="Search product title or author"
                      className="publisher-input"
                    />

                    <div style={{ marginTop: 12, display: 'grid', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                      {manualProducts.length ? (
                        manualProducts.map((product) => (
                          <ProductMiniRow
                            key={product.id}
                            product={product}
                            actionLabel="Assign"
                            onAction={() => assignProducts([product.id])}
                          />
                        ))
                      ) : (
                        <div style={{ padding: 28, textAlign: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 900 }}>
                          Search product to assign manually.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}
