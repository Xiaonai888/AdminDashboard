import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://shadow-backend-kucw.onrender.com'

const BLOCKS_PAGE_SIZE = 10
const RECORDS_PAGE_SIZE = 20

const readerTabs = [
  { key: 'comment', label: 'Comment' },
  { key: 'echo', label: 'Echo / Share' },
  { key: 'post', label: 'Post Article' },
  { key: 'account', label: 'Account' },
  { key: 'review', label: 'Review Queue' },
  { key: 'records', label: 'Records' },
]

const reasons = [
  'Spam',
  'Harassment',
  'Scam',
  'Adult content',
  'Hate speech',
  'Payment abuse',
  'Other',
]

const durations = [
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '24h', label: '24 hours' },
  { value: '3d', label: '3 days' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
]

function getAdminToken() {
  return (
    sessionStorage.getItem(
      'shadow_admin_token'
    ) ||
    localStorage.getItem(
      'shadow_admin_token'
    ) ||
    ''
  )
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('en-US')
}

function ComingSoonPanel({
  title,
  description,
  warning,
}) {
  return (
    <section className="block-list-record-card">
      <div className="block-list-card-head">
        <div>
          <h2 className="block-list-card-title">
            {title}
          </h2>
          <div className="block-list-card-desc">
            {description}
          </div>
        </div>

        <span className="block-list-status disabled">
          Coming Soon
        </span>
      </div>

      <div className="block-list-empty">
        {warning ||
          'This section is prepared for the next stage.'}
      </div>
    </section>
  )
}

export default function AdminReaderBlockPanel() {
  const [
    activeReaderTab,
    setActiveReaderTab,
  ] = useState('comment')
  const [search, setSearch] = useState('')
  const [readers, setReaders] = useState([])
  const [
    selectedReader,
    setSelectedReader,
  ] = useState(null)
  const [reason, setReason] = useState('Spam')
  const [duration, setDuration] =
    useState('7d')
  const [note, setNote] = useState('')
  const [blocks, setBlocks] = useState([])
  const [records, setRecords] =
    useState([])
  const [blockPage, setBlockPage] =
    useState(1)
  const [recordPage, setRecordPage] =
    useState(1)
  const [blockMeta, setBlockMeta] =
    useState({
      total_pages: 1,
      has_next: false,
      has_prev: false,
      total: 0,
    })
  const [recordMeta, setRecordMeta] =
    useState({
      total_pages: 1,
      has_next: false,
      has_prev: false,
      total: 0,
    })
  const [loading, setLoading] =
    useState(false)
  const [
    recordLoading,
    setRecordLoading,
  ] = useState(false)
  const [message, setMessage] =
    useState('')
  const [messageType, setMessageType] =
    useState('success')

  const canBlock = useMemo(
    () =>
      Boolean(
        selectedReader?.id &&
        reason &&
        duration
      ),
    [
      selectedReader,
      reason,
      duration,
    ]
  )

  async function apiFetch(
    path,
    options = {}
  ) {
    const token = getAdminToken()
    const headers = {
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization =
        `Bearer ${token}`
    }

    if (
      !(options.body instanceof FormData)
    ) {
      headers['Content-Type'] =
        'application/json'
    }

    const response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        headers,
      }
    )
    const data = await response
      .json()
      .catch(() => ({}))

    if (
      !response.ok ||
      data.ok === false
    ) {
      throw new Error(
        data.message ||
        'Request failed'
      )
    }

    return data
  }

  function showMessage(
    text,
    type = 'success'
  ) {
    setMessage(text)
    setMessageType(type)

    window.setTimeout(
      () => setMessage(''),
      5000
    )
  }

  async function searchReaders() {
    const query = search.trim()

    if (!query || query.length < 2) {
      setReaders([])
      return
    }

    try {
      const data = await apiFetch(
        `/api/admin/block-list/readers/search?q=${encodeURIComponent(query)}&limit=10`
      )

      setReaders(data.readers || [])
    } catch (error) {
      showMessage(
        error.message ||
        'Failed to search readers',
        'error'
      )
    }
  }

  async function fetchBlocks(
    targetPage = blockPage
  ) {
    try {
      setLoading(true)

      const data = await apiFetch(
        `/api/admin/block-list/readers/blocks?page=${targetPage}&limit=${BLOCKS_PAGE_SIZE}&status=active`
      )

      setBlocks(data.blocks || [])
      setBlockPage(
        Number(
          data.page || targetPage
        )
      )
      setBlockMeta({
        total_pages: Number(
          data.total_pages || 1
        ),
        has_next: Boolean(
          data.has_next
        ),
        has_prev: Boolean(
          data.has_prev
        ),
        total: Number(
          data.total || 0
        ),
      })
    } catch (error) {
      showMessage(
        error.message ||
        'Failed to load restricted readers',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecords(
    targetPage = recordPage
  ) {
    try {
      setRecordLoading(true)

      const data = await apiFetch(
        `/api/admin/block-list/readers/records?page=${targetPage}&limit=${RECORDS_PAGE_SIZE}`
      )

      setRecords(data.records || [])
      setRecordPage(
        Number(
          data.page || targetPage
        )
      )
      setRecordMeta({
        total_pages: Number(
          data.total_pages || 1
        ),
        has_next: Boolean(
          data.has_next
        ),
        has_prev: Boolean(
          data.has_prev
        ),
        total: Number(
          data.total || 0
        ),
      })
    } catch {
      setRecords([])
    } finally {
      setRecordLoading(false)
    }
  }

  async function blockReader() {
    if (!canBlock) return

    try {
      setLoading(true)

      const data = await apiFetch(
        '/api/admin/block-list/readers/blocks',
        {
          method: 'POST',
          body: JSON.stringify({
            user_id:
              selectedReader.id,
            reason,
            duration,
            note,
          }),
        }
      )

      setSelectedReader(null)
      setSearch('')
      setReaders([])
      setNote('')

      showMessage(
        data.message ||
        `Reader comment access restricted for ${duration}.`
      )

      await fetchBlocks(1)
      await fetchRecords(1)
    } catch (error) {
      showMessage(
        error.message ||
        'Failed to restrict reader',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  async function unblockReader(block) {
    const readerName =
      block.reader?.email ||
      block.reader?.name ||
      'this reader'

    const approved = window.confirm(
      `Release the comment restriction for ${readerName}?`
    )

    if (!approved) return

    try {
      const data = await apiFetch(
        `/api/admin/block-list/readers/blocks/${block.id}/unblock`,
        {
          method: 'PATCH',
        }
      )

      showMessage(
        data.message ||
        'Reader comment restriction released.'
      )

      await fetchBlocks(blockPage)
      await fetchRecords(1)
    } catch (error) {
      showMessage(
        error.message ||
        'Failed to release reader restriction',
        'error'
      )
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
              <h2 className="block-list-card-title">
                Manual Reader Comment Restriction
              </h2>
              <div className="block-list-card-desc">
                Temporarily restrict a reader
                from posting comments. Permanent
                restriction is disabled.
              </div>
            </div>
          </div>

          <div
            className="block-list-toolbar block-list-reader-search-toolbar"
            style={{
              gridTemplateColumns:
                'minmax(220px,1fr) 130px',
            }}
          >
            <input
              className="block-list-input"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  searchReaders()
                }
              }}
              placeholder="Search reader by name, username, or email..."
            />

            <button
              type="button"
              className="block-list-refresh"
              onClick={searchReaders}
            >
              Search
            </button>
          </div>

          {readers.length ? (
            <div className="block-list-record-list">
              {readers.map((reader) => (
                <div
                  className="block-list-record-row"
                  key={reader.id}
                >
                  <div className="block-list-record-action">
                    Reader
                  </div>

                  <div>
                    <div className="block-list-record-title">
                      {reader.name}{' '}
                      {reader.username
                        ? `@${reader.username}`
                        : ''}
                    </div>
                    <div className="block-list-record-meta">
                      {reader.email ||
                        'No email'}{' '}
                      · Joined:{' '}
                      {formatDate(
                        reader.joined_at
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="block-list-page-btn"
                    onClick={() =>
                      setSelectedReader(
                        reader
                      )
                    }
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {selectedReader ? (
            <div
              className="block-list-reader-selected"
              style={{
                padding: 20,
                borderTop:
                  '1px solid #E2E8F0',
              }}
            >
              <div className="block-list-card-title">
                Restrict selected reader
              </div>
              <div className="block-list-card-desc">
                {selectedReader.name} ·{' '}
                {selectedReader.email ||
                  selectedReader.username ||
                  selectedReader.id}
              </div>

              <div
                className="block-list-toolbar block-list-reader-selected-toolbar"
                style={{
                  paddingLeft: 0,
                  paddingRight: 0,
                  gridTemplateColumns:
                    '180px 180px minmax(220px,1fr) 120px',
                }}
              >
                <select
                  className="block-list-select"
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                >
                  {reasons.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  className="block-list-select"
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      event.target.value
                    )
                  }
                >
                  {durations.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                <input
                  className="block-list-input"
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                  placeholder="Admin note..."
                  maxLength={500}
                />

                <button
                  type="button"
                  className="block-list-add-btn"
                  disabled={
                    !canBlock ||
                    loading
                  }
                  onClick={blockReader}
                >
                  Restrict
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="block-list-record-card">
          <div className="block-list-card-head">
            <div>
              <h2 className="block-list-card-title">
                Restricted Comment Readers
              </h2>
              <div className="block-list-card-desc">
                Active temporary comment
                restrictions. Showing{' '}
                {BLOCKS_PAGE_SIZE} per page.
              </div>
            </div>

            <button
              type="button"
              className="block-list-refresh"
              onClick={() =>
                fetchBlocks(blockPage)
              }
              disabled={loading}
            >
              {loading
                ? 'Loading...'
                : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="block-list-empty">
              Loading restricted readers...
            </div>
          ) : blocks.length ? (
            <>
              <div className="block-list-record-list">
                {blocks.map((block) => (
                  <div
                    className="block-list-record-row"
                    key={block.id}
                  >
                    <div className="block-list-record-action disable">
                      Restricted
                    </div>

                    <div>
                      <div className="block-list-record-title">
                        {block.reader?.name ||
                          'Reader'}{' '}
                        ·{' '}
                        {block.reader?.email ||
                          block.reader
                            ?.username ||
                          block.user_id}
                      </div>
                      <div className="block-list-record-meta">
                        Reason:{' '}
                        {block.reason} · Until:{' '}
                        {formatDate(
                          block.expires_at
                        )}{' '}
                        · By:{' '}
                        {block.blocked_by}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="block-list-page-btn"
                      onClick={() =>
                        unblockReader(block)
                      }
                    >
                      Release
                    </button>
                  </div>
                ))}
              </div>

              <div className="block-list-pagination">
                <div className="block-list-page-info">
                  Page {blockPage} of{' '}
                  {blockMeta.total_pages} ·{' '}
                  {blockMeta.total} active
                  restrictions
                </div>

                <div className="block-list-page-buttons">
                  <button
                    type="button"
                    className="block-list-page-btn"
                    disabled={
                      !blockMeta.has_prev ||
                      loading
                    }
                    onClick={() =>
                      fetchBlocks(
                        blockPage - 1
                      )
                    }
                  >
                    Previous
                  </button>

                  <span className="block-list-current-page">
                    {blockPage}
                  </span>

                  <button
                    type="button"
                    className="block-list-page-btn"
                    disabled={
                      !blockMeta.has_next ||
                      loading
                    }
                    onClick={() =>
                      fetchBlocks(
                        blockPage + 1
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="block-list-empty">
              No active reader comment
              restrictions.
            </div>
          )}
        </section>
      </>
    )
  }

  function renderRecordsTab() {
    return (
      <section className="block-list-record-card">
        <div className="block-list-card-head">
          <div>
            <h2 className="block-list-card-title">
              Reader Restriction Records
            </h2>
            <div className="block-list-card-desc">
              Recent reader comment
              restriction actions. Showing{' '}
              {RECORDS_PAGE_SIZE} per page.
            </div>
          </div>

          <button
            type="button"
            className="block-list-refresh"
            onClick={() =>
              fetchRecords(recordPage)
            }
            disabled={recordLoading}
          >
            {recordLoading
              ? 'Loading...'
              : 'Refresh'}
          </button>
        </div>

        {recordLoading ? (
          <div className="block-list-empty">
            Loading records...
          </div>
        ) : records.length ? (
          <>
            <div className="block-list-record-list">
              {records.map((record) => (
                <div
                  className="block-list-record-row"
                  key={record.id}
                >
                  <div
                    className={`block-list-record-action ${String(
                      record.action || ''
                    ).toLowerCase()}`}
                  >
                    {record.action}
                  </div>

                  <div>
                    <div className="block-list-record-title">
                      {record.details ||
                        `${record.action} reader comment access`}
                    </div>
                    <div className="block-list-record-meta">
                      Reader:{' '}
                      {record.reader_email ||
                        record.reader_name ||
                        record.user_id}{' '}
                      · Reason:{' '}
                      {record.reason || '-'} · By:{' '}
                      {record.actor}
                    </div>
                  </div>

                  <div className="block-list-record-date">
                    {formatDate(
                      record.created_at
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="block-list-pagination">
              <div className="block-list-page-info">
                Record page {recordPage} of{' '}
                {recordMeta.total_pages} ·{' '}
                {recordMeta.total} total
                records
              </div>

              <div className="block-list-page-buttons">
                <button
                  type="button"
                  className="block-list-page-btn"
                  disabled={
                    !recordMeta.has_prev ||
                    recordLoading
                  }
                  onClick={() =>
                    fetchRecords(
                      recordPage - 1
                    )
                  }
                >
                  Previous
                </button>

                <span className="block-list-current-page">
                  {recordPage}
                </span>

                <button
                  type="button"
                  className="block-list-page-btn"
                  disabled={
                    !recordMeta.has_next ||
                    recordLoading
                  }
                  onClick={() =>
                    fetchRecords(
                      recordPage + 1
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="block-list-empty">
            No reader restriction records
            yet.
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="block-list-reader-panel">
      <section className="block-list-card">
        <div className="block-list-card-head">
          <div>
            <h2 className="block-list-card-title">
              Auto Protection
            </h2>
            <div className="block-list-card-desc">
              Blocked words are managed in
              the Block Words tab and used
              for platform-wide public
              content. Reader comment
              restrictions always expire.
            </div>
          </div>

          <span className="block-list-status active">
            Active
          </span>
        </div>

        {message ? (
          <div
            className={`block-list-message ${messageType}`}
          >
            {message}
          </div>
        ) : null}

        <div className="block-list-record-list">
          <div className="block-list-record-row">
            <div className="block-list-record-action enable">
              Auto
            </div>
            <div>
              <div className="block-list-record-title">
                Auto Hide Comment by Block
                Words
              </div>
              <div className="block-list-record-meta">
                This uses active words from
                Block Words. No duplicated
                word list is shown here.
              </div>
            </div>
            <div className="block-list-record-date">
              Enabled
            </div>
          </div>
        </div>
      </section>

      <div
        className="block-list-tabs block-list-reader-tabs"
        style={{
          marginTop: 18,
          marginBottom: 0,
        }}
      >
        {readerTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`block-list-tab ${
              activeReaderTab === tab.key
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setActiveReaderTab(tab.key)
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeReaderTab === 'comment'
        ? renderCommentTab()
        : null}

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

      {activeReaderTab === 'records'
        ? renderRecordsTab()
        : null}
    </div>
  )
}
