import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'

const styles = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #f8fafc; font-family: Inter, Arial, sans-serif; color: #0f172a; }
  .wrap { padding: 28px 36px 70px; max-width: 1200px; margin: 0 auto; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; margin-bottom: 20px; }
  .title { font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
  .sub { margin-top: 6px; color: #64748b; font-size: 14px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; box-shadow: 0 8px 28px rgba(15,23,42,.05); overflow: hidden; }
  .card-head { padding: 18px 20px; border-bottom: 1px solid #e2e8f0; }
  .card-title { font-size: 16px; font-weight: 900; }
  .card-sub { margin-top: 4px; font-size: 12.5px; color: #64748b; line-height: 1.45; }
  .body { padding: 20px; }
  .label { display: block; margin: 12px 0 7px; font-size: 12px; font-weight: 900; color: #334155; }
  .input, .textarea, .select { width: 100%; border: 1px solid #dbe3ef; background: #f8fafc; border-radius: 12px; padding: 12px 13px; font-size: 14px; outline: none; font-family: inherit; }
  .textarea { min-height: 120px; resize: vertical; line-height: 1.55; }
  .input:focus, .textarea:focus, .select:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .btn { border: 0; border-radius: 13px; padding: 13px 16px; font-weight: 900; cursor: pointer; font-family: inherit; }
  .btn-primary { background: #4f46e5; color: white; }
  .btn-yellow { background: #ffbe00; color: #111827; }
  .btn-soft { background: #eef2ff; color: #4f46e5; }
  .btn-danger { background: #fee2e2; color: #dc2626; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }
  .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  .msg { margin-bottom: 14px; padding: 12px 14px; border-radius: 12px; font-size: 13px; font-weight: 800; }
  .ok { background: #d1fae5; color: #047857; }
  .err { background: #fee2e2; color: #b91c1c; }
  .books { display: grid; gap: 10px; }
  .book-item { width: 100%; text-align: left; border: 1px solid #e2e8f0; background: #fff; border-radius: 14px; padding: 13px; cursor: pointer; display: flex; justify-content: space-between; gap: 12px; }
  .book-item.active { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
  .book-name { font-size: 14px; font-weight: 900; }
  .book-meta { margin-top: 4px; font-size: 12px; color: #64748b; }
  .pill { display: inline-flex; align-items: center; height: 24px; padding: 0 9px; border-radius: 999px; background: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 900; white-space: nowrap; }
  .episodes { display: grid; gap: 9px; margin-top: 14px; }
  .ep { border: 1px solid #e2e8f0; border-radius: 13px; padding: 12px; background: #fafafa; }
  .ep-title { font-size: 13.5px; font-weight: 900; }
  .ep-meta { margin-top: 4px; font-size: 12px; color: #64748b; }
  .empty { padding: 14px; border-radius: 13px; background: #f8fafc; color: #64748b; font-size: 13px; }
  @media (max-width: 900px) { .wrap { padding: 20px 14px 70px; } .grid { grid-template-columns: 1fr; } .row { grid-template-columns: 1fr; } }
`

function getToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.ok === false) {
    throw new Error(data.message || data.error || 'Request failed')
  }

  return data
}

const emptyBookForm = {
  title: '',
  author_name: '',
  cover_url: '',
  description: '',
  genres: 'Romance, Action',
  status: 'ongoing',
}

const emptyEpisodeForm = {
  episode_number: '',
  title: '',
  content: '',
  is_free: true,
  is_published: true,
}

export default function NovelsContent() {
  const [books, setBooks] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [selectedBookId, setSelectedBookId] = useState('')
  const [bookForm, setBookForm] = useState(emptyBookForm)
  const [episodeForm, setEpisodeForm] = useState(emptyEpisodeForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const selectedBook = useMemo(() => {
    return books.find((book) => book.id === selectedBookId) || null
  }, [books, selectedBookId])

  async function loadBooks() {
    const data = await apiRequest('/api/books?include_inactive=true')
    setBooks(data.books || [])

    if (!selectedBookId && data.books?.[0]) {
      setSelectedBookId(data.books[0].id)
    }
  }

  async function loadEpisodes(bookId = selectedBookId) {
    if (!bookId) {
      setEpisodes([])
      return
    }

    const data = await apiRequest(`/api/books/${bookId}/episodes`)
    setEpisodes(data.episodes || [])
  }

  async function refreshAll(bookId = selectedBookId) {
    await loadBooks()
    if (bookId) await loadEpisodes(bookId)
  }

  useEffect(() => {
    loadBooks().catch((error) => {
      setMessage({ type: 'err', text: error.message })
    })
  }, [])

  useEffect(() => {
    loadEpisodes(selectedBookId).catch((error) => {
      setMessage({ type: 'err', text: error.message })
    })
  }, [selectedBookId])

  async function handleCreateBook(event) {
    event.preventDefault()

    if (!bookForm.title.trim()) {
      setMessage({ type: 'err', text: 'Book title is required.' })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      const data = await apiRequest('/api/books', {
        method: 'POST',
        body: JSON.stringify(bookForm),
      })

      setBookForm(emptyBookForm)
      setSelectedBookId(data.book.id)
      setMessage({ type: 'ok', text: 'Book created successfully.' })
      await refreshAll(data.book.id)
    } catch (error) {
      setMessage({ type: 'err', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateEpisode(event) {
    event.preventDefault()

    if (!selectedBookId) {
      setMessage({ type: 'err', text: 'Select a book first.' })
      return
    }

    if (!episodeForm.episode_number || !episodeForm.title.trim()) {
      setMessage({ type: 'err', text: 'Episode number and title are required.' })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      await apiRequest(`/api/books/${selectedBookId}/episodes`, {
        method: 'POST',
        body: JSON.stringify(episodeForm),
      })

      setEpisodeForm(emptyEpisodeForm)
      setMessage({ type: 'ok', text: 'Episode created successfully.' })
      await refreshAll(selectedBookId)
    } catch (error) {
      setMessage({ type: 'err', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteBook() {
    if (!selectedBookId) return
    if (!window.confirm('Hide this book from the reader website?')) return

    try {
      setLoading(true)
      setMessage(null)

      await apiRequest(`/api/books/${selectedBookId}`, {
        method: 'DELETE',
      })

      setSelectedBookId('')
      setEpisodes([])
      setMessage({ type: 'ok', text: 'Book hidden successfully.' })
      await loadBooks()
    } catch (error) {
      setMessage({ type: 'err', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="wrap">
        <div className="top">
          <div>
            <div className="title">Novels Content</div>
            <div className="sub">Simple manager first. Add real books and episodes, make it professional later.</div>
          </div>

          <button className="btn btn-soft" onClick={() => refreshAll()} disabled={loading}>
            Refresh
          </button>
        </div>

        {message ? (
          <div className={`msg ${message.type}`}>
            {message.text}
          </div>
        ) : null}

        <div className="grid">
          <section className="card">
            <div className="card-head">
              <div className="card-title">Add Book</div>
              <div className="card-sub">This creates one story in Supabase through Shadow-Backend.</div>
            </div>

            <form className="body" onSubmit={handleCreateBook}>
              <label className="label">Title</label>
              <input
                className="input"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                placeholder="Call Me As Your Name"
              />

              <label className="label">Author Name</label>
              <input
                className="input"
                value={bookForm.author_name}
                onChange={(e) => setBookForm({ ...bookForm, author_name: e.target.value })}
                placeholder="Reaper Of Soul"
              />

              <label className="label">Cover URL</label>
              <input
                className="input"
                value={bookForm.cover_url}
                onChange={(e) => setBookForm({ ...bookForm, cover_url: e.target.value })}
                placeholder="https://..."
              />

              <label className="label">Description</label>
              <textarea
                className="textarea"
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                placeholder="Story description..."
              />

              <div className="row">
                <div>
                  <label className="label">Genres</label>
                  <input
                    className="input"
                    value={bookForm.genres}
                    onChange={(e) => setBookForm({ ...bookForm, genres: e.target.value })}
                    placeholder="Romance, Action"
                  />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={bookForm.status}
                    onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Create Book'}
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="card-title">Books</div>
              <div className="card-sub">Select a book, then add episodes below.</div>
            </div>

            <div className="body">
              {books.length === 0 ? (
                <div className="empty">No books yet.</div>
              ) : (
                <div className="books">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      className={`book-item ${selectedBookId === book.id ? 'active' : ''}`}
                      onClick={() => setSelectedBookId(book.id)}
                    >
                      <div>
                        <div className="book-name">{book.title}</div>
                        <div className="book-meta">
                          {book.author_name || 'Unknown author'} • {book.total_episodes || 0} episodes
                        </div>
                      </div>
                      <span className="pill">{book.status}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="actions">
                <button className="btn btn-danger" onClick={handleDeleteBook} disabled={!selectedBookId || loading}>
                  Hide Selected Book
                </button>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="card-title">Add Episode</div>
              <div className="card-sub">
                Selected book: {selectedBook ? selectedBook.title : 'None'}
              </div>
            </div>

            <form className="body" onSubmit={handleCreateEpisode}>
              <div className="row">
                <div>
                  <label className="label">Episode Number</label>
                  <input
                    className="input"
                    type="number"
                    value={episodeForm.episode_number}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="label">Episode Title</label>
                  <input
                    className="input"
                    value={episodeForm.title}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                    placeholder="See You Again"
                  />
                </div>
              </div>

              <label className="label">Episode Content</label>
              <textarea
                className="textarea"
                value={episodeForm.content}
                onChange={(e) => setEpisodeForm({ ...episodeForm, content: e.target.value })}
                placeholder="Paste episode text here..."
                style={{ minHeight: 220 }}
              />

              <div className="row">
                <label className="label">
                  <input
                    type="checkbox"
                    checked={episodeForm.is_free}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, is_free: e.target.checked })}
                  />{' '}
                  Free episode
                </label>

                <label className="label">
                  <input
                    type="checkbox"
                    checked={episodeForm.is_published}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, is_published: e.target.checked })}
                  />{' '}
                  Published
                </label>
              </div>

              <div className="actions">
                <button className="btn btn-yellow" type="submit" disabled={!selectedBookId || loading}>
                  {loading ? 'Saving...' : 'Create Episode'}
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="card-title">Episodes</div>
              <div className="card-sub">Current public episodes from Backend API.</div>
            </div>

            <div className="body">
              {!selectedBookId ? (
                <div className="empty">Select a book first.</div>
              ) : episodes.length === 0 ? (
                <div className="empty">No episodes yet.</div>
              ) : (
                <div className="episodes">
                  {episodes.map((episode) => (
                    <div className="ep" key={episode.id}>
                      <div className="ep-title">
                        {episode.episode_number}. {episode.title}
                      </div>
                      <div className="ep-meta">
                        {episode.is_free ? 'Free' : 'Premium'} • {episode.is_published ? 'Published' : 'Draft'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
