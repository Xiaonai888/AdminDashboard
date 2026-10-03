import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../components/AdminLayout'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const MAX_SELECTED = 10
const SEARCH_LIMIT = 20

const styles = `
  .dc-page{max-width:1180px;margin:0 auto;color:#0f172a}
  .dc-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}
  .dc-card{border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.035);overflow:hidden}
  .dc-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 18px;border-bottom:1px solid #eef2f7}
  .dc-card-head h2{margin:0;font-size:15px;font-weight:950}
  .dc-card-head span{color:#64748b;font-size:11px;font-weight:800}
  .dc-search-wrap{padding:14px 18px 10px}
  .dc-search{width:100%;height:44px;border:1px solid #d8e2ef;border-radius:13px;background:#fff;padding:0 14px;outline:none;color:#0f172a;font:inherit;font-size:13px;font-weight:750}
  .dc-search:focus{border-color:#4f46e5;box-shadow:0 0 0 4px rgba(79,70,229,.09)}
  .dc-results{padding:0 18px 16px}
  .dc-row{min-height:62px;display:grid;grid-template-columns:minmax(0,1.6fr) .7fr .7fr auto;align-items:center;gap:12px;border-top:1px solid #eef2f7}
  .dc-person{display:flex;align-items:center;gap:11px;min-width:0}
  .dc-avatar{width:40px;height:40px;border-radius:999px;background:#eef2ff;color:#4f46e5;display:grid;place-items:center;overflow:hidden;flex-shrink:0;font-size:13px;font-weight:950}
  .dc-avatar img{width:100%;height:100%;object-fit:cover}
  .dc-name{font-size:13px;font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dc-user{margin-top:2px;color:#64748b;font-size:11px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dc-meta{font-size:12px;font-weight:850;color:#334155}
  .dc-meta small{display:block;margin-top:2px;color:#94a3b8;font-size:10px;font-weight:750}
  .dc-btn{min-height:36px;border:0;border-radius:11px;padding:0 14px;background:#4f46e5;color:#fff;font:inherit;font-size:12px;font-weight:950;cursor:pointer}
  .dc-btn:disabled{opacity:.48;cursor:not-allowed}
  .dc-btn.secondary{background:#f1f5f9;color:#475569}
  .dc-btn.danger{background:#fff1f2;color:#e11d48;border:1px solid #ffe4e6}
  .dc-empty{padding:22px 18px;text-align:center;color:#64748b;font-size:12px;font-weight:800}
  .dc-error{margin:0 18px 14px;border:1px solid #fecaca;border-radius:12px;background:#fef2f2;padding:10px 12px;color:#b91c1c;font-size:12px;font-weight:800}
  .dc-table-wrap{overflow-x:auto}
  .dc-table{width:100%;border-collapse:collapse;min-width:760px}
  .dc-table th{text-align:left;background:#f8fafc;padding:11px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.05em}
  .dc-table td{padding:12px 14px;border-bottom:1px solid #eef2f7;vertical-align:middle}
  .dc-rank{width:30px;height:30px;border-radius:9px;background:#f8fafc;border:1px solid #e2e8f0;display:grid;place-items:center;font-size:11px;font-weight:950;color:#475569}
  .dc-status{display:inline-flex;align-items:center;gap:6px;min-height:26px;padding:0 10px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:10px;font-weight:950}
  .dc-status:before{content:'';width:6px;height:6px;border-radius:999px;background:#10b981}
  .dc-overlay{position:fixed;inset:0;z-index:9500;background:rgba(15,23,42,.42);display:grid;place-items:center;padding:16px}
  .dc-modal{width:min(390px,100%);border-radius:19px;background:#fff;padding:20px;box-shadow:0 24px 70px rgba(15,23,42,.28)}
  .dc-modal-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .dc-modal h3{margin:0;font-size:17px;font-weight:950}
  .dc-modal p{margin:6px 0 0;color:#64748b;font-size:12px;font-weight:750}
  .dc-close{width:34px;height:34px;border:0;border-radius:10px;background:#f8fafc;color:#64748b;font-size:20px;cursor:pointer}
  .dc-pin{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin:18px 0}
  .dc-pin input{width:100%;height:48px;border:1px solid #d8e2ef;border-radius:11px;text-align:center;outline:none;font:inherit;font-size:20px;font-weight:950;color:#0f172a}
  .dc-pin input:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
  .dc-modal-actions{display:flex;justify-content:flex-end;gap:9px}
  .dc-modal-error{margin:0 0 12px;border-radius:11px;background:#fef2f2;color:#b91c1c;padding:9px 11px;font-size:11px;font-weight:800}
  @media(max-width:820px){.dc-row{grid-template-columns:minmax(0,1fr) auto}.dc-row>.dc-meta{display:none}}
  @media(max-width:540px){.dc-card-head{align-items:flex-start;flex-direction:column}.dc-search-wrap,.dc-results{padding-left:14px;padding-right:14px}.dc-row{gap:8px}.dc-pin{gap:5px}.dc-pin input{height:44px}}
`

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function authHeaders(json = false) {
  const token = getToken()
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

function normalizeAuthor(item = {}) {
  return {
    id: item.author_page_id || item.id || '',
    page_name: item.page_name || item.author_page_name || 'Unnamed Author Page',
    page_username: item.page_username || item.author_page_username || '',
    avatar_url: item.avatar_url || item.author_page_avatar_url || '',
    total_followers: Number(item.total_followers || item.followers || 0),
    newest_post_at: item.newest_post_at || item.latest_post_at || null,
  }
}

function formatCount(value) {
  return Number(value || 0).toLocaleString()
}

function formatDateTime(value) {
  if (!value) return 'No post'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No post'
  return date.toLocaleString()
}

function relativeTime(value) {
  if (!value) return 'No post'
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return 'No post'
  const diff = Math.max(0, Date.now() - time)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'Just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  return `${Math.floor(diff / day)}d ago`
}

function Avatar({ author }) {
  const [failed, setFailed] = useState(false)
  const initial = String(author.page_name || author.page_username || 'A').trim().slice(0, 1).toUpperCase()

  return (
    <div className="dc-avatar">
      {author.avatar_url && !failed
        ? <img src={author.avatar_url} alt="" onError={() => setFailed(true)} />
        : initial}
    </div>
  )
}

export default function AdminDiscoverControlPage() {
  const [selected, setSelected] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loadingSelected, setLoadingSelected] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [modal, setModal] = useState(null)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [modalError, setModalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRefs = useRef([])

  const selectedIds = useMemo(() => new Set(selected.map(item => String(item.id))), [selected])
  const visibleResults = useMemo(() => results.filter(item => !selectedIds.has(String(item.id))), [results, selectedIds])

  const loadSelected = useCallback(async () => {
    setLoadingSelected(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/admin/discover-control/authors`, {
        headers: authHeaders(),
        cache: 'no-store',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Failed to load selected authors')
      const authors = Array.isArray(data.authors) ? data.authors.map(normalizeAuthor) : []
      authors.sort((a, b) => new Date(b.newest_post_at || 0).getTime() - new Date(a.newest_post_at || 0).getTime())
      setSelected(authors.slice(0, MAX_SELECTED))
    } catch (reason) {
      setError(reason.message || 'Failed to load selected authors')
      setSelected([])
    } finally {
      setLoadingSelected(false)
    }
  }, [])

  useEffect(() => {
    void loadSelected()
  }, [loadSelected])

  useEffect(() => {
    const clean = query.trim()

    if (clean.length < 2) {
      setResults([])
      setSearchError('')
      setSearching(false)
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true)
      setSearchError('')

      try {
        const params = new URLSearchParams({
          q: clean,
          limit: String(SEARCH_LIMIT),
        })
        const response = await fetch(`${API_URL}/api/admin/discover-control/search?${params}`, {
          headers: authHeaders(),
          cache: 'no-store',
          signal: controller.signal,
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || data.ok === false) throw new Error(data.message || 'Search failed')
        setResults((Array.isArray(data.authors) ? data.authors : []).map(normalizeAuthor).slice(0, SEARCH_LIMIT))
      } catch (reason) {
        if (reason.name !== 'AbortError') {
          setResults([])
          setSearchError(reason.message || 'Search failed')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 320)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    if (!modal) return
    setDigits(['', '', '', '', '', ''])
    setModalError('')
    requestAnimationFrame(() => inputRefs.current[0]?.focus())
  }, [modal])

  function openAdd(author) {
    if (selected.length >= MAX_SELECTED) return
    setModal({ action: 'add', author })
  }

  function openRemove(author) {
    setModal({ action: 'remove', author })
  }

  function closeModal() {
    if (submitting) return
    setModal(null)
    setModalError('')
    setDigits(['', '', '', '', '', ''])
  }

  function updateDigit(index, value) {
    const digit = String(value || '').replace(/\D/g, '').slice(-1)
    setDigits(current => current.map((item, itemIndex) => itemIndex === index ? digit : item))
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  function handlePaste(event) {
    const value = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!value) return
    event.preventDefault()
    const next = Array.from({ length: 6 }, (_, index) => value[index] || '')
    setDigits(next)
    inputRefs.current[Math.min(value.length, 6) - 1]?.focus()
  }

  async function submitPasskey(event) {
    event.preventDefault()
    if (!modal || submitting) return

    const pin = digits.join('')
    if (!/^\d{6}$/.test(pin)) {
      setModalError('Enter your 6-digit Passkey')
      return
    }

    setSubmitting(true)
    setModalError('')

    try {
      const authorId = encodeURIComponent(modal.author.id)
      const isAdd = modal.action === 'add'
      const response = await fetch(
        isAdd
          ? `${API_URL}/api/admin/discover-control/authors`
          : `${API_URL}/api/admin/discover-control/authors/${authorId}`,
        {
          method: isAdd ? 'POST' : 'DELETE',
          headers: authHeaders(true),
          cache: 'no-store',
          body: JSON.stringify({
            ...(isAdd ? { author_page_id: modal.author.id } : {}),
            passkey_pin: pin,
          }),
        }
      )

      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.message || 'Action failed')

      setModal(null)
      setDigits(['', '', '', '', '', ''])
      await loadSelected()

      if (isAdd) {
        setResults(current => current.filter(item => String(item.id) !== String(modal.author.id)))
      }
    } catch (reason) {
      setModalError(reason.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const passkeyReady = digits.every(Boolean)

  return (
    <AdminLayout title="Discover Control" subtitle="Manage selected Author Pages">
      <style>{styles}</style>

      <div className="dc-page">
        <div className="dc-grid">
          <section className="dc-card">
            <div className="dc-card-head">
              <h2>Add Author Page</h2>
              <span>{MAX_SELECTED - selected.length} slots remaining</span>
            </div>

            <div className="dc-search-wrap">
              <input
                className="dc-search"
                type="search"
                placeholder="Search Author Page"
                value={query}
                maxLength={64}
                onChange={event => setQuery(event.target.value)}
                aria-label="Search Author Page"
              />
            </div>

            {searchError ? <div className="dc-error">{searchError}</div> : null}

            <div className="dc-results">
              {searching ? <div className="dc-empty">Searching...</div> : null}
              {!searching && query.trim().length >= 2 && !visibleResults.length && !searchError
                ? <div className="dc-empty">No Author Page found.</div>
                : null}

              {visibleResults.map(author => (
                <div className="dc-row" key={author.id}>
                  <div className="dc-person">
                    <Avatar author={author} />
                    <div style={{ minWidth: 0 }}>
                      <div className="dc-name">{author.page_name}</div>
                      <div className="dc-user">{author.page_username ? `@${author.page_username}` : author.id}</div>
                    </div>
                  </div>
                  <div className="dc-meta">{formatCount(author.total_followers)}<small>Followers</small></div>
                  <div className="dc-meta">{relativeTime(author.newest_post_at)}<small>Latest post</small></div>
                  <button className="dc-btn" type="button" disabled={selected.length >= MAX_SELECTED} onClick={() => openAdd(author)}>Add</button>
                </div>
              ))}
            </div>
          </section>

          <section className="dc-card">
            <div className="dc-card-head">
              <h2>Selected Authors ({selected.length} / {MAX_SELECTED})</h2>
              <span>{loadingSelected ? 'Loading...' : 'Newest first'}</span>
            </div>

            {error ? <div className="dc-error" style={{ marginTop: 14 }}>{error}</div> : null}

            <div className="dc-table-wrap">
              <table className="dc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Author Page</th>
                    <th>Latest Post</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!loadingSelected && !selected.length && !error ? (
                    <tr><td colSpan="5"><div className="dc-empty">No Author Page selected.</div></td></tr>
                  ) : null}

                  {selected.map((author, index) => (
                    <tr key={author.id}>
                      <td><div className="dc-rank">{index + 1}</div></td>
                      <td>
                        <div className="dc-person">
                          <Avatar author={author} />
                          <div style={{ minWidth: 0 }}>
                            <div className="dc-name">{author.page_name}</div>
                            <div className="dc-user">{author.page_username ? `@${author.page_username}` : author.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="dc-meta">{relativeTime(author.newest_post_at)}<small>{formatDateTime(author.newest_post_at)}</small></div>
                      </td>
                      <td><span className="dc-status">Active</span></td>
                      <td><button className="dc-btn danger" type="button" onClick={() => openRemove(author)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {modal ? (
        <div className="dc-overlay" role="presentation" onMouseDown={closeModal}>
          <form className="dc-modal" onSubmit={submitPasskey} onMouseDown={event => event.stopPropagation()}>
            <div className="dc-modal-top">
              <div>
                <h3>Enter Passkey</h3>
                <p>{modal.author.page_name}</p>
              </div>
              <button className="dc-close" type="button" disabled={submitting} onClick={closeModal}>×</button>
            </div>

            <div className="dc-pin" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={node => { inputRefs.current[index] = node }}
                  value={digit}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  aria-label={`Passkey digit ${index + 1}`}
                  onChange={event => updateDigit(index, event.target.value)}
                  onKeyDown={event => handleKeyDown(index, event)}
                />
              ))}
            </div>

            {modalError ? <div className="dc-modal-error">{modalError}</div> : null}

            <div className="dc-modal-actions">
              <button className="dc-btn secondary" type="button" disabled={submitting} onClick={closeModal}>Cancel</button>
              <button className="dc-btn" type="submit" disabled={submitting || !passkeyReady}>{submitting ? 'Please wait...' : 'Continue'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminLayout>
  )
}
