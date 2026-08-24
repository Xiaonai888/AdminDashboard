import React from 'react'

const styles = `
  .si-live-panels {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, .65fr);
    gap: 18px;
    margin-top: 18px;
  }

  .si-live-card {
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    background: #FFFFFF;
    overflow: hidden;
  }

  .si-live-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid #EEF2F7;
  }

  .si-live-title {
    margin: 0;
    color: #0F172A;
    font-size: 14px;
    font-weight: 950;
  }

  .si-live-subtitle {
    margin-top: 4px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 750;
    line-height: 1.5;
  }

  .si-live-list {
    max-height: 430px;
    overflow: auto;
  }

  .si-live-row {
    display: grid;
    grid-template-columns: minmax(145px, .7fr) minmax(170px, 1.25fr) auto auto;
    gap: 12px;
    align-items: center;
    padding: 13px 18px;
    border-bottom: 1px solid #F1F5F9;
  }

  .si-live-row:last-child {
    border-bottom: 0;
  }

  .si-live-reader {
    min-width: 0;
    color: #475569;
    font-size: 10px;
    font-weight: 850;
    word-break: break-all;
  }

  .si-live-reader strong {
    display: block;
    margin-bottom: 3px;
    color: #0F172A;
    font-size: 11px;
    font-weight: 950;
  }

  .si-live-term {
    min-width: 0;
    color: #0F172A;
    font-size: 12px;
    font-weight: 900;
    word-break: break-word;
  }

  .si-live-meta {
    color: #94A3B8;
    font-size: 9px;
    font-weight: 800;
    white-space: nowrap;
  }

  .si-live-type {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    background: #EEF2FF;
    color: #4F46E5;
    font-size: 9px;
    font-weight: 950;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .si-suggestion-list {
    padding: 8px 0;
  }

  .si-suggestion-row {
    padding: 13px 16px;
    border-bottom: 1px solid #F1F5F9;
  }

  .si-suggestion-row:last-child {
    border-bottom: 0;
  }

  .si-suggestion-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .si-suggestion-pair {
    min-width: 0;
    color: #0F172A;
    font-size: 11px;
    font-weight: 900;
    line-height: 1.55;
  }

  .si-suggestion-arrow {
    color: #94A3B8;
    padding: 0 5px;
  }

  .si-confidence {
    flex: 0 0 auto;
    border-radius: 999px;
    background: #ECFDF5;
    color: #047857;
    padding: 4px 7px;
    font-size: 9px;
    font-weight: 950;
  }

  .si-suggestion-note {
    margin-top: 6px;
    color: #94A3B8;
    font-size: 9px;
    font-weight: 750;
    line-height: 1.5;
  }

  .si-suggestion-btn {
    margin-top: 9px;
    min-height: 32px;
    border: 1px solid #C7D2FE;
    border-radius: 10px;
    background: #EEF2FF;
    color: #4F46E5;
    padding: 0 11px;
    font: inherit;
    font-size: 9px;
    font-weight: 950;
    cursor: pointer;
  }

  .si-live-empty {
    padding: 28px 18px;
    color: #94A3B8;
    font-size: 11px;
    font-weight: 800;
    text-align: center;
  }

  @media (max-width: 1050px) {
    .si-live-panels {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .si-live-row {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 7px 10px;
    }

    .si-live-term {
      grid-column: 1 / -1;
      grid-row: 1;
    }

    .si-live-reader {
      grid-column: 1;
      grid-row: 2;
    }

    .si-live-type {
      grid-column: 2;
      grid-row: 2;
    }

    .si-live-meta {
      grid-column: 1 / -1;
      grid-row: 3;
    }
  }
`

function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatReaderId(value) {
  const id = String(value || '').trim()

  return id || 'Guest'
}

function formatResultCount(value) {
  const count = Math.max(0, Number(value || 0))

  return `${count} result${count === 1 ? '' : 's'}`
}

export default function AdminSearchInsightsLivePanels({
  recentActivity = [],
  mergeSuggestions = [],
  onReviewSuggestion,
}) {
  return (
    <>
      <style>{styles}</style>

      <div className="si-live-panels">
        <section className="si-live-card">
          <div className="si-live-head">
            <div>
              <h3 className="si-live-title">
                Recent Search Activity
              </h3>
              <div className="si-live-subtitle">
                Latest counted searches only. Reader names and emails are not stored here.
              </div>
            </div>
          </div>

          <div className="si-live-list">
            {recentActivity.length === 0 ? (
              <div className="si-live-empty">
                No new counted searches in this period.
              </div>
            ) : (
              recentActivity.map((item) => (
                <div
                  className="si-live-row"
                  key={item.id || `${item.searched_at}-${item.search_term}`}
                >
                  <div className="si-live-reader">
                    <strong>
                      {item.reader_id ? 'Reader ID' : 'Guest'}
                    </strong>
                    {formatReaderId(item.reader_id)}
                  </div>

                  <div className="si-live-term">
                    {item.search_term || '—'}
                  </div>

                  <span className="si-live-type">
                    {item.search_type || 'all'}
                  </span>

                  <div className="si-live-meta">
                    {formatResultCount(item.result_count)}
                    {' · '}
                    {formatTime(item.searched_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="si-live-card">
          <div className="si-live-head">
            <div>
              <h3 className="si-live-title">
                Suggested Merges
              </h3>
              <div className="si-live-subtitle">
                Similar terms are suggestions only. Nothing merges automatically.
              </div>
            </div>
          </div>

          <div className="si-suggestion-list">
            {mergeSuggestions.length === 0 ? (
              <div className="si-live-empty">
                No strong merge suggestions right now.
              </div>
            ) : (
              mergeSuggestions.slice(0, 10).map((item) => (
                <div
                  className="si-suggestion-row"
                  key={`${item.source_group_id}-${item.target_group_id}`}
                >
                  <div className="si-suggestion-top">
                    <div className="si-suggestion-pair">
                      {item.source_term || 'Unknown'}
                      <span className="si-suggestion-arrow">→</span>
                      {item.target_term || 'Unknown'}
                    </div>

                    <span className="si-confidence">
                      {Math.round(Number(item.confidence || 0))}%
                    </span>
                  </div>

                  <div className="si-suggestion-note">
                    Matched: {(item.matched_terms || []).filter(Boolean).join(' ↔ ') || 'similar terms'}
                  </div>

                  <button
                    type="button"
                    className="si-suggestion-btn"
                    onClick={() => onReviewSuggestion?.(item)}
                  >
                    Review Merge
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}
