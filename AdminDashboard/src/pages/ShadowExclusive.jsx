import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --se-bg: #F8FAFC;
    --se-card: #FFFFFF;
    --se-primary: #4F46E5;
    --se-primary-light: #EEF2FF;
    --se-text: #0F172A;
    --se-muted: #64748B;
    --se-border: #E2E8F0;
    --se-gold: #F59E0B;
    --se-green: #10B981;
    --se-red: #EF4444;
  }

  * { box-sizing: border-box; }

  .se-page {
    min-height: 100vh;
    background: var(--se-bg);
    font-family: 'Inter', sans-serif;
    color: var(--se-text);
    padding: 28px 36px 60px;
  }

  .se-shell {
    max-width: 1500px;
    margin: 0 auto;
  }

  .se-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .se-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 30px;
    border-radius: 999px;
    background: #FFF7ED;
    color: #B45309;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .se-title {
    font-size: 30px;
    line-height: 1.15;
    font-weight: 900;
    margin: 0;
    letter-spacing: -0.04em;
  }

  .se-subtitle {
    margin-top: 8px;
    max-width: 760px;
    color: var(--se-muted);
    font-size: 14px;
    line-height: 1.7;
    font-weight: 500;
  }

  .se-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .se-button {
    height: 42px;
    border: 0;
    border-radius: 12px;
    padding: 0 16px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }

  .se-button:active { transform: scale(0.98); }

  .se-button-primary {
    background: var(--se-primary);
    color: white;
    box-shadow: 0 12px 24px rgba(79,70,229,0.22);
  }

  .se-button-ghost {
    background: white;
    color: var(--se-text);
    border: 1px solid var(--se-border);
  }

  .se-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 22px;
  }

  .se-stat-card {
    background: var(--se-card);
    border: 1px solid var(--se-border);
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 2px 8px rgba(15,23,42,0.04);
  }

  .se-stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .se-stat-icon {
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: var(--se-primary-light);
    color: var(--se-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .se-stat-label {
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: var(--se-muted);
  }

  .se-stat-value {
    font-size: 28px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .se-stat-note {
    margin-top: 8px;
    color: var(--se-muted);
    font-size: 12px;
    font-weight: 600;
  }

  .se-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.75fr);
    gap: 18px;
  }

  .se-card {
    background: var(--se-card);
    border: 1px solid var(--se-border);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(15,23,42,0.04);
    overflow: hidden;
  }

  .se-card-header {
    padding: 18px 20px;
    border-bottom: 1px solid var(--se-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .se-card-title {
    font-size: 16px;
    font-weight: 900;
    margin: 0;
  }

  .se-card-subtitle {
    margin-top: 4px;
    color: var(--se-muted);
    font-size: 12px;
    font-weight: 600;
  }

  .se-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .se-tab {
    border: 1px solid var(--se-border);
    background: white;
    color: var(--se-muted);
    height: 34px;
    border-radius: 999px;
    padding: 0 13px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .se-tab.active {
    background: var(--se-primary);
    border-color: var(--se-primary);
    color: white;
  }

  .se-list {
    padding: 12px;
  }

  .se-story-row {
    display: grid;
    grid-template-columns: 68px minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    padding: 12px;
    border-radius: 16px;
    transition: background 0.15s ease;
  }

  .se-story-row:hover {
    background: #F8FAFC;
  }

  .se-cover {
    width: 68px;
    aspect-ratio: 2 / 3;
    border-radius: 12px;
    background: #111827;
    overflow: hidden;
    box-shadow: 0 8px 18px rgba(15,23,42,0.12);
  }

  .se-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .se-story-title {
    font-size: 14px;
    font-weight: 900;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .se-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--se-muted);
    font-size: 11.5px;
    font-weight: 700;
  }

  .se-pill {
    display: inline-flex;
    align-items: center;
    height: 24px;
    border-radius: 999px;
    padding: 0 9px;
    font-size: 10.5px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.25px;
  }

  .se-pill-pending { background: #FEF3C7; color: #B45309; }
  .se-pill-approved { background: #D1FAE5; color: #047857; }
  .se-pill-rejected { background: #FEE2E2; color: #B91C1C; }
  .se-pill-premium { background: #EEF2FF; color: #4F46E5; }
  .se-pill-removed { background: #F1F5F9; color: #475569; }

  .se-row-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .se-small-btn {
    height: 34px;
    border-radius: 999px;
    border: 1px solid var(--se-border);
    background: white;
    color: var(--se-text);
    padding: 0 12px;
    font-size: 11.5px;
    font-weight: 900;
    cursor: pointer;
  }

  .se-small-btn.approve {
    background: #ECFDF3;
    border-color: #BBF7D0;
    color: #047857;
  }

  .se-small-btn.reject {
    background: #FEF2F2;
    border-color: #FECACA;
    color: #B91C1C;
  }

  .se-small-btn.remove {
    background: #FFF7ED;
    border-color: #FED7AA;
    color: #C2410C;
  }

  .se-panel-body {
    padding: 18px 20px;
  }

  .se-section-box {
    padding: 14px;
    border: 1px solid var(--se-border);
    border-radius: 16px;
    margin-bottom: 12px;
    background: #FAFBFF;
  }

  .se-section-title {
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 4px;
  }

  .se-section-desc {
    color: var(--se-muted);
    font-size: 12px;
    line-height: 1.55;
    font-weight: 600;
  }

  .se-check-list {
    display: grid;
    gap: 10px;
  }

  .se-check-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    line-height: 1.5;
    color: #334155;
    font-weight: 600;
  }

  .se-check-icon {
    margin-top: 2px;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #DCFCE7;
    color: #047857;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
  }

  .se-note {
    margin-top: 12px;
    border-radius: 16px;
    border: 1px solid #FED7AA;
    background: #FFF7ED;
    padding: 14px;
    color: #9A3412;
    font-size: 12px;
    line-height: 1.6;
    font-weight: 700;
  }

  @media (max-width: 1000px) {
    .se-page { padding: 22px 16px 50px; }
    .se-header { flex-direction: column; }
    .se-actions { justify-content: flex-start; }
    .se-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .se-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .se-stats { grid-template-columns: 1fr; }
    .se-story-row { grid-template-columns: 58px minmax(0, 1fr); }
    .se-row-actions { grid-column: 1 / -1; justify-content: flex-start; padding-left: 72px; }
  }
`;

const demoStories = [
  {
    id: 's1',
    title: 'The Crown Behind the Shadow',
    author: 'Shadow Author',
    genre: 'Fantasy',
    episodes: 28,
    status: 'pending',
    accessType: 'premium',
    sections: ['Featured', 'Premium Fantasy'],
    cover: '/assets/Must Read pic/Must Read 1.jpg',
  },
  {
    id: 's2',
    title: 'My Contract With the Cold Duke',
    author: 'Lina Moon',
    genre: 'Romance',
    episodes: 34,
    status: 'approved',
    accessType: 'premium',
    sections: ['Popular Exclusive', 'Premium Romance'],
    cover: '/assets/Must Read pic/Must Read 2.jpg',
  },
  {
    id: 's3',
    title: 'After Midnight, I Became Royalty',
    author: 'Kai Novel',
    genre: 'Fantasy',
    episodes: 19,
    status: 'pending',
    accessType: 'premium',
    sections: ['New Exclusive'],
    cover: '/assets/Must Read pic/Must Read 3.jpg',
  },
];

function StatusPill({ status }) {
  const className =
    status === 'approved'
      ? 'se-pill se-pill-approved'
      : status === 'rejected'
      ? 'se-pill se-pill-rejected'
      : status === 'removed'
      ? 'se-pill se-pill-removed'
      : 'se-pill se-pill-pending';

  return <span className={className}>{status}</span>;
}

function StatCard({ icon, label, value, note }) {
  return (
    <div className="se-stat-card">
      <div className="se-stat-top">
        <div className="se-stat-label">{label}</div>
        <div className="se-stat-icon">{icon}</div>
      </div>
      <div className="se-stat-value">{value}</div>
      <div className="se-stat-note">{note}</div>
    </div>
  );
}

export default function ShadowExclusive() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [items, setItems] = useState(demoStories);

  const stories = useMemo(() => {
    if (activeTab === 'All') return items;
    return items.filter((story) => story.status === activeTab.toLowerCase());
  }, [activeTab, items]);

  const approvedCount = items.filter((story) => story.status === 'approved').length;
  const pendingCount = items.filter((story) => story.status === 'pending').length;
  const removedCount = items.filter((story) => story.status === 'removed').length;

  const updateStatus = (storyId, nextStatus) => {
    setItems((current) =>
      current.map((story) =>
        story.id === storyId
          ? {
              ...story,
              status: nextStatus,
              accessType: nextStatus === 'removed' ? 'free' : 'premium',
              sections: nextStatus === 'removed' ? [] : story.sections,
            }
          : story
      )
    );
  };

  return (
    <main className="se-page">
      <style>{styles}</style>

      <div className="se-shell">
        <header className="se-header">
          <div>
            <div className="se-kicker">👑 Premium Management</div>
            <h1 className="se-title">Shadow Exclusive</h1>
            <p className="se-subtitle">
              Review high-quality published stories, request author consent, approve premium access,
              decide where each story appears, and remove stories from Shadow Exclusive when an author requests normal monetization again.
            </p>
          </div>

          <div className="se-actions">
            <button type="button" className="se-button se-button-ghost" onClick={() => navigate('/admin')}>
              Back Dashboard
            </button>
            <button type="button" className="se-button se-button-primary">
              + New Review
            </button>
          </div>
        </header>

        <section className="se-stats">
          <StatCard icon="📚" label="Exclusive Stories" value={items.length} note="Stories in exclusive workflow" />
          <StatCard icon="⏳" label="Pending Review" value={pendingCount} note="Need admin decision" />
          <StatCard icon="✅" label="Approved" value={approvedCount} note="Visible in exclusive area" />
          <StatCard icon="↩️" label="Removed" value={removedCount} note="Returned to normal story" />
        </section>

        <section className="se-grid">
          <div className="se-card">
            <div className="se-card-header">
              <div>
                <h2 className="se-card-title">Exclusive Review Queue</h2>
                <div className="se-card-subtitle">
                  Approve only stories that meet Shadow quality and consent rules.
                </div>
              </div>

              <div className="se-tabs">
                {['All', 'Pending', 'Approved', 'Rejected', 'Removed'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`se-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="se-list">
              {stories.map((story) => (
                <div className="se-story-row" key={story.id}>
                  <div className="se-cover">
                    <img
                      src={story.cover}
                      alt={story.title}
                      onError={(event) => {
                        event.currentTarget.src = '/assets/Must Read pic/Must Read 1.jpg';
                      }}
                    />
                  </div>

                  <div>
                    <div className="se-story-title">{story.title}</div>
                    <div className="se-meta">
                      <span>{story.author}</span>
                      <span>•</span>
                      <span>{story.genre}</span>
                      <span>•</span>
                      <span>EP {story.episodes}</span>
                    </div>
                    <div className="se-meta" style={{ marginTop: 8 }}>
                      <StatusPill status={story.status} />
                      <span className="se-pill se-pill-premium">{story.accessType}</span>
                      {story.sections.length ? <span>{story.sections.join(' / ')}</span> : <span>No exclusive section</span>}
                    </div>
                  </div>

                  <div className="se-row-actions">
                    {story.status !== 'approved' && story.status !== 'removed' ? (
                      <button type="button" className="se-small-btn approve" onClick={() => updateStatus(story.id, 'approved')}>
                        Approve
                      </button>
                    ) : null}

                    {story.status !== 'rejected' && story.status !== 'removed' ? (
                      <button type="button" className="se-small-btn reject" onClick={() => updateStatus(story.id, 'rejected')}>
                        Reject
                      </button>
                    ) : null}

                    {story.status === 'approved' ? (
                      <button type="button" className="se-small-btn remove" onClick={() => updateStatus(story.id, 'removed')}>
                        Remove
                      </button>
                    ) : null}

                    {story.status === 'removed' ? (
                      <button type="button" className="se-small-btn approve" onClick={() => updateStatus(story.id, 'approved')}>
                        Re-Approve
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="se-card">
            <div className="se-card-header">
              <div>
                <h2 className="se-card-title">Rules</h2>
                <div className="se-card-subtitle">Professional Shadow Exclusive workflow.</div>
              </div>
            </div>

            <div className="se-panel-body">
              <div className="se-section-box">
                <div className="se-section-title">Recommended Sections</div>
                <div className="se-section-desc">
                  Featured, New Exclusive, Popular Exclusive, Editor Pick, Premium Romance, Premium Fantasy, Completed Exclusive.
                </div>
              </div>

              <div className="se-check-list">
                <div className="se-check-item">
                  <span className="se-check-icon">✓</span>
                  <span>Author consent is required before approval.</span>
                </div>

                <div className="se-check-item">
                  <span className="se-check-icon">✓</span>
                  <span>Shadow Exclusive stories should not appear in normal sections.</span>
                </div>

                <div className="se-check-item">
                  <span className="se-check-icon">✓</span>
                  <span>Premium users can read; free users should see a paywall later.</span>
                </div>

                <div className="se-check-item">
                  <span className="se-check-icon">✓</span>
                  <span>Admin can remove a story if the author wants normal monetization again.</span>
                </div>
              </div>

              <div className="se-note">
                Remove should later call backend to set:
                is_shadow_exclusive=false, exclusive_status=none, exclusive_sections=[].
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
