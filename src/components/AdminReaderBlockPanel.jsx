import React, { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com'
const BLOCKS_PAGE_SIZE = 10
const RECORDS_PAGE_SIZE = 20
const REVIEWS_PAGE_SIZE = 10

const readerTabs = [
  { key: 'comment', label: 'Comment' },
  { key: 'echo', label: 'Echo / Share' },
  { key: 'post', label: 'Post Article' },
  { key: 'account', label: 'Account' },
  { key: 'review', label: 'Review Queue' },
  { key: 'records', label: 'Records' },
]

const reasons = ['Spam', 'Harassment', 'Scam', 'Adult content', 'Hate speech', 'Payment abuse', 'Other']

const durations = [
  { value: '1d', label: '1 day' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'permanent', label: 'Permanent' },
]

const reviewStatuses = [
  { value: 'hidden', label: 'Hidden' },
  { value: 'restored', label: 'Restored' },
  { value: 'kept_hidden', label: 'Kept Hidden' },
  { value: 'all', label: 'All' },
]

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || ''
}

function formatDate(value) {
  if (!value) return 'Permanent'
  return new Date(value).toLocaleString()
}

function matchedWordsText(words) {
  if (!Array.isArray(words) || !words.length) return 'No matched word'
  return words.map((item) => `${item.word || ''}${item.count ? ` ×${item.count}` : ''}`).filter(Boolean).join(', ')
}

function ComingSoonPanel({ title, description, warning }) {
  return (
    <section className="block-list-record-card">
      <div className="block-list-card-head">
        <div>
          <h2 className="block-list-card-title">{title}</h2>
          <div className="block-list-card-desc">{description}</div>
        </div>

        <span className="block-list-status disabled">Coming Soon</span>
      </div>

      <div className="block-list-empty">
        {warning || 'This section is prepared for the next stage.'}
      </div>
    </section>
  )
}

export default function AdminReaderBlockPanel() {
  const [activeReaderTab, setActiveReaderTab] = useState('comment')
  const [search, setSearch] = useState('')
  const [readers, setReaders] = useState([])
  const [selectedReader, setSelectedReader] = useState(null)
  const [reason, setReason] = useState('Spam')
  const [duration, setDuration] = useState('7d')
  const [note, setNote] = useState('')
  const [blocks, setBlocks] = useState([])
  const [records, setRecords] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewStatus, setReviewStatus] = useState('hidden')
  const [blockPage, setBlockPage] = useState(1)
  const [recordPage, setRecordPage] = useState(1)
  const [reviewPage, setReviewPage] = useState(1)
  const [blockMeta, setBlockMeta] = useState({ total_pages: 1, has_next: false, has_prev: false, total: 0 })
  const [recordMeta, setRecordMeta] = useState({ total_pages: 1, has_next: false, has_prev: false, total: 0 })
  const [reviewMeta, setReviewMeta] = useState({ total_pages: 1, has_next: false, has_prev: false, total: 0 })
  const [loading, setLoading] = useState(false)
  const [recordLoading, setRecordLoading] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  const canBlock = useMemo(() => Boolean(selectedReader?.id && reason && duration), [selectedReader, reason, duration])

  async function apiFetch(path, options = {}) {
    const token = getAdminToken()
    const headers = { ...(options.headers || {}) }

    if (token) headers.Authorization = `Bearer ${token}`
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${API_URL}${path}`, { ...options, headers })
    const data = await response.json().catch(() => ({}))

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  function showMessage(text, type = 'success') {
    setMessage(text)
    setMessageType(type)
    window.setTimeout(() => setMessage(''), 5000)
  }

  async function searchReaders() {
    if (!search.trim() || search.trim().length < 2) {
      setReaders([])
      return
    }

    try {
      const data = await apiFetch(`/api/admin/block-list/readers/search?q=${encodeURIComponent(search.trim())}&limit=10`)
      setReaders(data.readers || [])
    } catch (error) {
      showMessage(error.message || 'Failed to search readers', 'error')
    }
  }

  async function fetchBlocks(targetPage = blockPage) {
    try {
      setLoading(true)
      const data = await apiFetch(`/api/admin/block-list/readers/blocks?page=${targetPage}&limit=${BLOCKS_PAGE_SIZE}&status=active`)
      setBlocks(data.blocks || [])
      setBlockPage(Number(data.page || targetPage))
      setBlockMeta({
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
        total: Number(data.total || 0),
      })
    } catch (error) {
      showMessage(error.message || 'Failed to load blocked readers', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecords(targetPage = recordPage) {
    try {
      setRecordLoading(true)
      const data = await apiFetch(`/api/admin/block-list/readers/records?page=${targetPage}&limit=${RECORDS_PAGE_SIZE}`)
      setRecords(data.records || [])
      setRecordPage(Number(data.page || targetPage))
      setRecordMeta({
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
        total: Number(data.total || 0),
      })
    } catch {
      setRecords([])
    } finally {
      setRecordLoading(false)
    }
  }

  async function fetchReviews(targetPage = reviewPage, nextStatus = reviewStatus) {
    try {
      setReviewLoading(true)
      const data = await apiFetch(`/api/admin/block-list/readers/hidden-comments?page=${targetPage}&limit=${REVIEWS_PAGE_SIZE}&status=${nextStatus}`)
      setReviews(data.reviews || [])
      setReviewPage(Number(data.page || targetPage))
      setReviewMeta({
        total_pages: Number(data.total_pages || 1),
        has_next: Boolean(data.has_next),
        has_prev: Boolean(data.has_prev),
        total: Number(data.total || 0),
      })
    } catch (error) {
      showMessage(error.message || 'Failed to load hidden comment reviews', 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  async function blockReader() {
    if (!canBlock) return

    try {
      setLoading(true)
      await apiFetch('/api/admin/block-list/readers/blocks', {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedReader.id,
          reason,
          duration,
          note,
        }),
      })

      setSelectedReader(null)
      setSearch('')
      setReaders([])
      setNote('')
      showMessage('Reader comment access blocked.')
      await fetchBlocks(1)
      await fetchRecords(1)
    } catch (error) {
      showMessage(error.message || 'Failed to block reader', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function unblockReader(block) {
    const ok = window.confirm(`Unblock comments for ${block.reader?.email || block.reader?.name || 'this reader'}?`)
    if (!ok) return

    try {
      await apiFetch(`/api/admin/block-list/readers/blocks/${block.id}/unblock`, { method: 'PATCH' })
      showMessage('Reader comment access unblocked.')
      await fetchBlocks(blockPage)
      await fetchRecords(1)
    } catch (error) {
      showMessage(error.message || 'Failed to unblock reader', 'error')
    }
  }

  async function restoreComment(review) {
    const ok = window.confirm('Restore this comment to public?')
    if (!ok) return

    try {
      await apiFetch(`/api/admin/block-list/readers/hidden-comments/${review.id}/restore`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_note: 'Restored by admin review' }),
      })
      showMessage('Comment restored.')
      await fetchReviews(reviewPage)
    } catch (error) {
      showMessage(error.message || 'Failed to restore comment', 'error')
    }
  }

  async function keepCommentHidden(review) {
    const ok = window.confirm('Keep this comment hidden?')
    if (!ok) return

    try {
      await apiFetch(`/api/admin/block-list/readers/hidden-comments/${review.id}/keep-hidden`, {
        method: 'PATCH',
        body: JSON.stringify({ admin_note: 'Kept hidden by admin review' }),
      })
      showMessage('Comment kept hidden.')
      await fetchReviews(reviewPage)
    } catch (error) {
      showMessage(error.message || 'Failed to keep comment hidden', 'error')
    }
  }

  async function blockReaderFromReview(review) {
    try {
      await apiFetch('/api/admin/block-list/readers/blocks', {
        method: 'POST',
        body: JSON.stringify({
          user_id: review.user_id,
          reason: 'Spam',
          duration: '7d',
          note: 'Blocked from hidden comment review',
        }),
      })
      showMessage('Reader blocked from commenting for 7 days.')
      await fetchBlocks(1)
      await fetchRecords(1)
    } catch (error) {
      showMessage(error.message || 'Failed to block reader', 'error')
    }
  }

  useEffect(() => {
    fetchBlocks(1)
    fetchRecords(1)
  }, [])

  function renderCommentTab() {
    return (
      <>
        <section className="block-list-record-card">
          <div className="block-list-card-head">
            <div>
              <h2 className="block-list-card-title">Manual Reader Comment Block</h2>
              <div className="block-list-card-desc">Temporarily or permanently restrict a reader from posting comments.</div>
            </div>
          </div>

          <div className="block-list-toolbar" style={{ gridTemplateColumns: 'minmax(220px,1fr) 130px' }}>
            <input
              className="block-list-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') searchReaders()
              }}
              placeholder="Search reader by name, username, or email..."
            />

            <button type="button" className="block-list-refresh" onClick={searchReaders}>
              Search
            </button>
          </div>

          {readers.length ? (
            <div className="block-list-record-list">
              {readers.map((reader) => (
                <div className="block-list-record-row" key={reader.id}>
                  <div className="block-list-record-action">Reader</div>
                  <div>
                    <div className="block-list-record-title">{reader.name} {reader.username ? `@${reader.username}` : ''}</div>
                    <div className="block-list-record-meta">{reader.email || 'No email'} · Joined: {formatDate(reader.joined_at)}</div>
                  </div>
                  <button type="button" className="block-list-page-btn" onClick={() => setSelectedReader(reader)}>
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {selectedReader ? (
            <div style={{ padding: 20, borderTop: '1px solid #E2E8F0' }}>
              <div className="block-list-card-title">Block selected reader</div>
              <div className="block-list-card-desc">{selectedReader.name} · {selectedReader.email || selectedReader.username || selectedReader.id}</div>

              <div className="block-list-toolbar" style={{ paddingLeft: 0, paddingRight: 0, gridTemplateColumns: '180px 180px minmax(220px,1fr) 120px' }}>
                <select className="block-list-select" value={reason} onChange={(event) => setReason(event.target.value)}>
                  {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select className="block-list-select" value={duration} onChange={(event) => setDuration(event.target.value)}>
                  {durations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>

                <input className="block-list-input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Admin note..." />

                <button type="button" className="block-list-add-btn" disabled={!canBlock || loading} onClick={blockReader}>
                  Block
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="block-list-record-card">
          <div className="block-list-card-head">
            <div>
              <h2 className="block-list-card-title">Blocked Comment Readers</h2>
              <div className="block-list-card-desc">Active comment restrictions. Showing {BLOCKS_PAGE_SIZE} per page.</div>
            </div>

            <button type="button" className="block-list-refresh" onClick={() => fetchBlocks(blockPage)} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="block-list-empty">Loading blocked readers...</div>
          ) : blocks.length ? (
            <>
              <div className="block-list-record-list">
                {blocks.map((block) => (
                  <div className="block-list-record-row" key={block.id}>
                    <div className="block-list-record-action disable">Blocked</div>
                    <div>
                      <div className="block-list-record-title">{block.reader?.name || 'Reader'} · {block.reader?.email || block.reader?.username || block.user_id}</div>
                      <div className="block-list-record-meta">Reason: {block.reason} · Until: {formatDate(block.expires_at)} · By: {block.blocked_by}</div>
                    </div>
                    <button type="button" className="block-list-page-btn" onClick={() => unblockReader(block)}>
                      Unblock
                    </button>
                  </div>
                ))}
              </div>

              <div className="block-list-pagination">
                <div className="block-list-page-info">Page {blockPage} of {blockMeta.total_pages} · {blockMeta.total} active blocks</div>
                <div className="block-list-page-buttons">
                  <button type="button" className="block-list-page-btn" disabled={!blockMeta.has_prev || loading} onClick={() => fetchBlocks(blockPage - 1)}>Previous</button>
                  <span className="block-list-current-page">{blockPage}</span>
                  <button type="button" className="block-list-page-btn" disabled={!blockMeta.has_next || loading} onClick={() => fetchBlocks(blockPage + 1)}>Next</button>
                </div>
              </div>
            </>
          ) : (
            <div className="block-list-empty">No blocked comment readers yet.</div>
          )}
        </section>
      </>
    )
  }

  function renderReviewTab() {
    return (
      <section className="block-list-record-card">
        <div className="block-list-card-head">
          <div>
            <h2 className="block-list-card-title">Hidden Comment Review</h2>
            <div className="block-list-card-desc">Review comments hidden automatically by blocked words. Showing {REVIEWS_PAGE_SIZE} per page.</div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              className="block-list-select"
              value={reviewStatus}
              onChange={(event) => {
                setReviewStatus(event.target.value)
                fetchReviews(1, event.target.value)
              }}
            >
              {reviewStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>

            <button type="button" className="block-list-refresh" onClick={() => fetchReviews(reviewPage)} disabled={reviewLoading}>
              {reviewLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {reviewLoading ? (
          <div className="block-list-empty">Loading hidden comments...</div>
        ) : reviews.length ? (
          <>
            <div className="block-list-record-list">
              {reviews.map((review) => (
                <div className="block-list-record-row" key={review.id}>
                  <div className={`block-list-record-action ${review.status === 'restored' ? 'enable' : review.status === 'kept_hidden' ? 'delete' : 'disable'}`}>
                    {review.status}
                  </div>
                  <div>
                    <div className="block-list-record-title">{review.reader?.email || review.reader?.name || 'Reader'} · {review.story?.title || 'Story'}</div>
                    <div className="block-list-record-meta">Matched: {matchedWordsText(review.matched_words)}</div>
                    <div className="block-list-record-meta">Comment: {review.comment_text}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {review.status === 'hidden' ? (
                      <>
                        <button type="button" className="block-list-page-btn" onClick={() => restoreComment(review)}>Restore</button>
                        <button type="button" className="block-list-page-btn" onClick={() => keepCommentHidden(review)}>Keep Hidden</button>
                        <button type="button" className="block-list-page-btn" onClick={() => blockReaderFromReview(review)}>Block Reader</button>
                      </>
                    ) : (
                      <div className="block-list-record-date">{formatDate(review.reviewed_at || review.created_at)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="block-list-pagination">
              <div className="block-list-page-info">Review page {reviewPage} of {reviewMeta.total_pages} · {reviewMeta.total} total reviews</div>
              <div className="block-list-page-buttons">
                <button type="button" className="block-list-page-btn" disabled={!reviewMeta.has_prev || reviewLoading} onClick={() => fetchReviews(reviewPage - 1)}>Previous</button>
                <span className="block-list-current-page">{reviewPage}</span>
                <button type="button" className="block-list-page-btn" disabled={!reviewMeta.has_next || reviewLoading} onClick={() => fetchReviews(reviewPage + 1)}>Next</button>
              </div>
            </div>
          </>
        ) : (
          <div className="block-list-empty">No hidden comments waiting for review.</div>
        )}
      </section>
    )
  }

  function renderRecordsTab() {
    return (
      <section className="block-list-record-card">
        <div className="block-list-card-head">
          <div>
            <h2 className="block-list-card-title">Reader Block Records</h2>
            <div className="block-list-card-desc">Recent reader comment block actions. Showing 20 per page.</div>
          </div>

          <button type="button" className="block-list-refresh" onClick={() => fetchRecords(recordPage)} disabled={recordLoading}>
            {recordLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {recordLoading ? (
          <div className="block-list-empty">Loading records...</div>
        ) : records.length ? (
          <>
            <div className="block-list-record-list">
              {records.map((record) => (
                <div className="block-list-record-row" key={record.id}>
                  <div className={`block-list-record-action ${String(record.action || '').toLowerCase()}`}>{record.action}</div>
                  <div>
                    <div className="block-list-record-title">{record.details || `${record.action} reader comment access`}</div>
                    <div className="block-list-record-meta">Reader: {record.reader_email || record.reader_name || record.user_id} · Reason: {record.reason || '-'} · By: {record.actor}</div>
                  </div>
                  <div className="block-list-record-date">{formatDate(record.created_at)}</div>
                </div>
              ))}
            </div>

            <div className="block-list-pagination">
              <div className="block-list-page-info">Record page {recordPage} of {recordMeta.total_pages} · {recordMeta.total} total records</div>
              <div className="block-list-page-buttons">
                <button type="button" className="block-list-page-btn" disabled={!recordMeta.has_prev || recordLoading} onClick={() => fetchRecords(recordPage - 1)}>Previous</button>
                <span className="block-list-current-page">{recordPage}</span>
                <button type="button" className="block-list-page-btn" disabled={!recordMeta.has_next || recordLoading} onClick={() => fetchRecords(recordPage + 1)}>Next</button>
              </div>
            </div>
          </>
        ) : (
          <div className="block-list-empty">No reader block records yet.</div>
        )}
      </section>
    )
  }

  return (
    <div>
      <section className="block-list-card">
        <div className="block-list-card-head">
          <div>
            <h2 className="block-list-card-title">Auto Protection</h2>
            <div className="block-list-card-desc">
              Blocked words are managed in the Block Words tab and will be used for platform-wide areas like Echo, Post Article, and public content. Story comments will be handled by Author comment settings later.
            </div>
          </div>

          <span className="block-list-status active">Active</span>
        </div>

        {message ? <div className={`block-list-message ${messageType}`}>{message}</div> : null}

        <div className="block-list-record-list">
          <div className="block-list-record-row">
            <div className="block-list-record-action enable">Auto</div>
            <div>
              <div className="block-list-record-title">Auto Hide Comment by Block Words</div>
              <div className="block-list-record-meta">This uses active words from Block Words. No duplicated word list is shown here.</div>
            </div>
            <div className="block-list-record-date">Enabled</div>
          </div>
        </div>
      </section>

      <div className="block-list-tabs" style={{ marginTop: 18, marginBottom: 0 }}>
        {readerTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`block-list-tab ${activeReaderTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveReaderTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeReaderTab === 'comment' ? renderCommentTab() : null}

      {activeReaderTab === 'echo' ? (
        <ComingSoonPanel
          title="Block Echo / Share"
          description="Restrict readers from echoing or sharing content."
        />
      ) : null}

      {activeReaderTab === 'post' ? (
        <ComingSoonPanel
          title="Block Post Article"
          description="Restrict readers from posting articles or community posts."
        />
      ) : null}

      {activeReaderTab === 'account' ? (
        <ComingSoonPanel
          title="Block Account Access"
          description="Restrict reader account access only for serious abuse."
          warning="Use carefully. Account blocking can affect balance, purchases, order history, and access."
        />
      ) : null}

      {activeReaderTab === 'review' ? (
  <ComingSoonPanel
    title="Review Queue"
    description="This section will review platform-wide blocked content later."
    warning="Story comment reviews will move to Author Dashboard comment protection later."
  />
) : null}

      {activeReaderTab === 'records' ? renderRecordsTab() : null}
    </div>
  )
}
