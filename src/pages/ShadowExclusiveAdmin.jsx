import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';

const SECTION_OPTIONS = [
  { key: 'featured', label: 'Featured' },
  { key: 'new_exclusive', label: 'New Exclusive' },
  { key: 'popular_exclusive', label: 'Popular Exclusive' },
  { key: 'editor_pick', label: 'Editor Pick' },
  { key: 'premium_romance', label: 'Premium Romance' },
  { key: 'premium_fantasy', label: 'Premium Fantasy' },
  { key: 'completed_exclusive', label: 'Completed Exclusive' },
];

const ADMIN_PICK_TABS = [
  { key: 'all', label: 'All Published' },
  { key: 'approved', label: 'Already Premium' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'removed', label: 'Normal / Removed' },
];

const REQUEST_TABS = [
  { key: 'pending', label: 'Pending Requests' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --bg:#F8FAFC;
    --card:#FFFFFF;
    --primary:#4F46E5;
    --primaryLight:#EEF2FF;
    --text:#0F172A;
    --muted:#64748B;
    --border:#E2E8F0;
    --green:#10B981;
    --greenBg:#D1FAE5;
    --red:#EF4444;
    --redBg:#FEE2E2;
    --amber:#F59E0B;
    --amberBg:#FEF3C7;
  }

  * { box-sizing:border-box; }

  body {
    margin:0;
    background:var(--bg);
    font-family:Inter, system-ui, sans-serif;
    color:var(--text);
  }

  .se-page {
    min-height:100vh;
    background:var(--bg);
    padding:28px 36px 60px;
  }

  .se-shell {
    max-width:1500px;
    margin:0 auto;
  }

  .se-top {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:18px;
    margin-bottom:22px;
  }

  .se-back {
    border:1px solid var(--border);
    background:#fff;
    color:#0F172A;
    height:40px;
    border-radius:12px;
    padding:0 14px;
    font-weight:900;
    cursor:pointer;
    margin-bottom:14px;
  }

  .se-kicker {
    display:inline-flex;
    align-items:center;
    gap:8px;
    height:30px;
    border-radius:999px;
    padding:0 12px;
    background:#FFF7ED;
    border:1px solid #FED7AA;
    color:#B45309;
    font-size:11px;
    font-weight:900;
    letter-spacing:.5px;
    text-transform:uppercase;
  }

  .se-title {
    margin:12px 0 0;
    font-size:30px;
    font-weight:900;
    letter-spacing:-.04em;
    line-height:1.1;
  }

  .se-subtitle {
    max-width:850px;
    color:var(--muted);
    font-size:14px;
    line-height:1.7;
    margin-top:8px;
    font-weight:500;
  }

  .se-refresh {
    height:42px;
    border:0;
    background:var(--primary);
    color:white;
    border-radius:13px;
    padding:0 16px;
    font-family:inherit;
    font-weight:900;
    cursor:pointer;
    box-shadow:0 12px 24px rgba(79,70,229,.18);
  }

  .se-refresh:disabled {
    opacity:.6;
    cursor:not-allowed;
  }

  .se-mode-tabs {
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:18px;
  }

  .se-mode-tab {
    border:1px solid var(--border);
    background:#fff;
    color:var(--muted);
    border-radius:16px;
    padding:14px 16px;
    font-family:inherit;
    cursor:pointer;
    min-width:240px;
    text-align:left;
  }

  .se-mode-tab.active {
    border-color:var(--primary);
    background:linear-gradient(135deg,#EEF2FF,#FFFFFF);
    box-shadow:0 12px 28px rgba(79,70,229,.12);
  }

  .se-mode-title {
    font-size:14px;
    font-weight:900;
    color:#0F172A;
  }

  .se-mode-desc {
    margin-top:4px;
    font-size:12px;
    line-height:1.45;
    color:var(--muted);
    font-weight:600;
  }

  .se-stats {
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:14px;
    margin-bottom:18px;
  }

  .se-stat {
    background:#fff;
    border:1px solid var(--border);
    border-radius:18px;
    padding:16px;
    box-shadow:0 4px 18px rgba(15,23,42,.04);
  }

  .se-stat-label {
    color:var(--muted);
    font-size:11px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:.6px;
  }

  .se-stat-value {
    margin-top:8px;
    font-size:28px;
    line-height:1;
    font-weight:900;
    letter-spacing:-.04em;
  }

  .se-card {
    background:#fff;
    border:1px solid var(--border);
    border-radius:22px;
    box-shadow:0 8px 28px rgba(15,23,42,.05);
    overflow:hidden;
  }

  .se-card-head {
    padding:18px 20px;
    border-bottom:1px solid var(--border);
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
    flex-wrap:wrap;
  }

  .se-card-title {
    font-size:16px;
    font-weight:900;
    margin:0;
  }

  .se-card-desc {
    color:var(--muted);
    font-size:12px;
    font-weight:600;
    margin-top:4px;
  }

  .se-tabs {
    display:flex;
    align-items:center;
    gap:8px;
    flex-wrap:wrap;
  }

  .se-tab {
    height:34px;
    border-radius:999px;
    border:1px solid var(--border);
    background:#fff;
    color:var(--muted);
    padding:0 13px;
    font-size:12px;
    font-weight:900;
    cursor:pointer;
  }

  .se-tab.active {
    border-color:var(--primary);
    background:var(--primary);
    color:#fff;
  }

  .se-toolbar {
    padding:14px 20px;
    border-bottom:1px solid var(--border);
    display:flex;
    gap:10px;
    align-items:center;
  }

  .se-search {
    flex:1;
    height:42px;
    border:1px solid var(--border);
    border-radius:13px;
    padding:0 14px;
    font-family:inherit;
    font-size:13px;
    font-weight:600;
    outline:none;
    background:#F8FAFC;
  }

  .se-search:focus {
    background:#fff;
    border-color:var(--primary);
    box-shadow:0 0 0 3px rgba(79,70,229,.1);
  }

  .se-search-btn {
    height:42px;
    border:1px solid var(--border);
    background:#fff;
    border-radius:13px;
    padding:0 14px;
    font-weight:900;
    cursor:pointer;
  }

  .se-message {
    margin:14px 20px 0;
    border-radius:14px;
    padding:12px 14px;
    font-size:13px;
    font-weight:800;
    line-height:1.55;
  }

  .se-message.success {
    background:var(--greenBg);
    color:#047857;
  }

  .se-message.error {
    background:var(--redBg);
    color:#B91C1C;
  }

  .se-list {
    padding:12px;
  }

  .se-row {
    display:grid;
    grid-template-columns:72px minmax(0,1fr) auto;
    gap:14px;
    align-items:center;
    padding:12px;
    border-radius:18px;
  }

  .se-row:hover {
    background:#F8FAFC;
  }

  .se-cover {
    width:72px;
    aspect-ratio:2/3;
    overflow:hidden;
    border-radius:14px;
    background:#111827;
    box-shadow:0 8px 20px rgba(15,23,42,.14);
  }

  .se-cover img {
    width:100%;
    height:100%;
    object-fit:cover;
    display:block;
  }

  .se-empty-cover {
    width:100%;
    height:100%;
    display:grid;
    place-items:center;
    color:#94A3B8;
    font-size:11px;
    font-weight:900;
    text-align:center;
    padding:8px;
  }

  .se-story-title {
    font-size:14px;
    font-weight:900;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }

  .se-meta {
    margin-top:6px;
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    align-items:center;
    color:var(--muted);
    font-size:11.5px;
    font-weight:700;
  }

  .se-pill {
    display:inline-flex;
    align-items:center;
    height:24px;
    border-radius:999px;
    padding:0 9px;
    font-size:10px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:.28px;
  }

  .se-pill.none {
    background:#F1F5F9;
    color:#475569;
  }

  .se-pill.pending {
    background:var(--amberBg);
    color:#B45309;
  }

  .se-pill.approved {
    background:var(--greenBg);
    color:#047857;
  }

  .se-pill.rejected {
    background:var(--redBg);
    color:#B91C1C;
  }

  .se-pill.premium {
    background:var(--primaryLight);
    color:#4338CA;
  }

  .se-actions {
    display:flex;
    align-items:center;
    gap:8px;
    flex-wrap:wrap;
    justify-content:flex-end;
  }

  .se-action-btn {
    height:34px;
    border-radius:999px;
    border:1px solid var(--border);
    background:#fff;
    padding:0 12px;
    font-size:11.5px;
    font-weight:900;
    cursor:pointer;
    color:#334155;
  }

  .se-action-btn.request {
    border-color:#C7D2FE;
    background:#EEF2FF;
    color:#4338CA;
  }

  .se-action-btn.approve {
    border-color:#BBF7D0;
    background:#ECFDF3;
    color:#047857;
  }

  .se-action-btn.reject {
    border-color:#FECACA;
    background:#FEF2F2;
    color:#B91C1C;
  }

  .se-action-btn.remove {
    border-color:#FED7AA;
    background:#FFF7ED;
    color:#C2410C;
  }

  .se-empty {
    padding:44px 20px;
    text-align:center;
    color:var(--muted);
    font-size:13px;
    font-weight:700;
    line-height:1.7;
  }

  .se-modal-backdrop {
    position:fixed;
    inset:0;
    background:rgba(15,23,42,.42);
    z-index:9999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:18px;
  }

  .se-modal {
    width:min(560px,100%);
    background:#fff;
    border-radius:22px;
    overflow:hidden;
    box-shadow:0 24px 70px rgba(15,23,42,.28);
  }

  .se-modal-head {
    padding:20px;
    border-bottom:1px solid var(--border);
  }

  .se-modal-title {
    font-size:18px;
    font-weight:900;
    margin:0;
  }

  .se-modal-desc {
    margin-top:6px;
    color:var(--muted);
    font-size:13px;
    line-height:1.6;
    font-weight:600;
  }

  .se-modal-body {
    padding:20px;
  }

  .se-label {
    display:block;
    font-size:12px;
    font-weight:900;
    margin-bottom:8px;
    color:#334155;
  }

  .se-check-grid {
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:9px;
    margin-bottom:16px;
  }

  .se-check {
    display:flex;
    align-items:center;
    gap:8px;
    min-height:38px;
    border:1px solid var(--border);
    border-radius:12px;
    padding:8px 10px;
    font-size:12px;
    font-weight:800;
    color:#334155;
    cursor:pointer;
  }

  .se-check input {
    accent-color:var(--primary);
  }

  .se-textarea {
    width:100%;
    min-height:92px;
    resize:vertical;
    border:1px solid var(--border);
    border-radius:14px;
    padding:12px;
    font-family:inherit;
    font-size:13px;
    font-weight:600;
    outline:none;
    background:#F8FAFC;
  }

  .se-textarea:focus {
    background:#fff;
    border-color:var(--primary);
    box-shadow:0 0 0 3px rgba(79,70,229,.1);
  }

  .se-modal-foot {
    padding:16px 20px;
    border-top:1px solid var(--border);
    display:flex;
    justify-content:flex-end;
    gap:10px;
  }

  .se-cancel {
    height:40px;
    border-radius:12px;
    border:1px solid var(--border);
    background:#fff;
    padding:0 14px;
    font-weight:900;
    cursor:pointer;
  }

  .se-confirm {
    height:40px;
    border-radius:12px;
    border:0;
    background:var(--primary);
    color:#fff;
    padding:0 16px;
    font-weight:900;
    cursor:pointer;
  }

  .se-confirm:disabled,
  .se-cancel:disabled {
    opacity:.6;
    cursor:not-allowed;
  }

  @media (max-width:900px) {
    .se-page { padding:18px; }
    .se-top { flex-direction:column; }
    .se-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .se-row { grid-template-columns:64px minmax(0,1fr); }
    .se-actions {
      grid-column:1 / -1;
      justify-content:flex-start;
      padding-left:78px;
    }
  }

  @media (max-width:560px) {
    .se-stats { grid-template-columns:1fr; }
    .se-toolbar {
      flex-direction:column;
      align-items:stretch;
    }
    .se-check-grid { grid-template-columns:1fr; }
    .se-mode-tab { min-width:100%; }
  }
`;

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || '';
}

function StatusPill({ status }) {
  const value = String(status || 'none').toLowerCase();
  return <span className={`se-pill ${value}`}>{value}</span>;
}

function AccessPill({ accessType }) {
  const value = String(accessType || 'free').toLowerCase();
  return <span className={`se-pill ${value === 'premium' ? 'premium' : 'none'}`}>{value}</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="se-stat">
      <div className="se-stat-label">{label}</div>
      <div className="se-stat-value">{value}</div>
    </div>
  );
}

function ActionModal({
  open,
  mode,
  story,
  saving,
  sections,
  setSections,
  note,
  setNote,
  keepPremium,
  setKeepPremium,
  onClose,
  onConfirm,
}) {
  if (!open || !story) return null;

  const titleMap = {
    request: 'Move Story to Author Request Review',
    approve: 'Add to Shadow Exclusive',
    reject: 'Reject Shadow Exclusive Request',
    remove: 'Remove from Shadow Exclusive',
    sections: 'Update Exclusive Sections',
  };

  const descMap = {
    request: 'This keeps the old request/pending flow for stories that authors may request later.',
    approve: 'Admin can directly choose this story and add it into Premium / Shadow Exclusive.',
    reject: 'Reject this story from the request workflow.',
    remove: 'Remove this story from Shadow Exclusive. You can keep it premium if needed.',
    sections: 'Update only the sections where this approved story appears.',
  };

  const showSections = mode === 'approve' || mode === 'sections';

  const toggleSection = (key) => {
    setSections((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return [...current, key];
    });
  };

  return (
    <div className="se-modal-backdrop">
      <div className="se-modal">
        <div className="se-modal-head">
          <h2 className="se-modal-title">{titleMap[mode]}</h2>
          <p className="se-modal-desc">
            {story.title}
            <br />
            {descMap[mode]}
          </p>
        </div>

        <div className="se-modal-body">
          {showSections ? (
            <>
              <label className="se-label">Shadow Exclusive Sections</label>
              <div className="se-check-grid">
                {SECTION_OPTIONS.map((section) => (
                  <label className="se-check" key={section.key}>
                    <input
                      type="checkbox"
                      checked={sections.includes(section.key)}
                      onChange={() => toggleSection(section.key)}
                    />
                    {section.label}
                  </label>
                ))}
              </div>
            </>
          ) : null}

          {mode === 'remove' ? (
            <label className="se-check" style={{ marginBottom: 16 }}>
              <input
                type="checkbox"
                checked={keepPremium}
                onChange={(event) => setKeepPremium(event.target.checked)}
              />
              Keep premium after removing from Shadow Exclusive
            </label>
          ) : null}

          {mode !== 'sections' ? (
            <>
              <label className="se-label">Admin Note</label>
              <textarea
                className="se-textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note..."
              />
            </>
          ) : null}
        </div>

        <div className="se-modal-foot">
          <button type="button" className="se-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="se-confirm" onClick={onConfirm} disabled={saving}>
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShadowExclusiveAdmin() {
  const navigate = useNavigate();

  const [workMode, setWorkMode] = useState('admin_pick');
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [authExpired, setAuthExpired] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('approve');
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedSections, setSelectedSections] = useState(['featured']);
  const [note, setNote] = useState('');
  const [keepPremium, setKeepPremium] = useState(false);

  const statusTabs = workMode === 'author_requests' ? REQUEST_TABS : ADMIN_PICK_TABS;

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(''), 4200);
  };

  async function apiFetch(path, options = {}) {
    const token = getAdminToken();

    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem('shadow_admin_token');
      localStorage.removeItem('shadow_admin_token');
      setAuthExpired(true);
      throw new Error('Admin session expired. Please login again.');
    }

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async function fetchStories() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (activeStatus !== 'all') params.set('status', activeStatus);
      if (search.trim()) params.set('search', search.trim());

      const query = params.toString();
      const data = await apiFetch(`/api/admin/exclusive/stories${query ? `?${query}` : ''}`);

      setStories(data.stories || []);
    } catch (error) {
      setStories([]);
      showMessage(error.message || 'Failed to load stories', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, workMode]);

  const stats = useMemo(() => {
    return {
      total: stories.length,
      pending: stories.filter((story) => story.exclusive_status === 'pending').length,
      approved: stories.filter((story) => story.exclusive_status === 'approved').length,
      rejected: stories.filter((story) => story.exclusive_status === 'rejected').length,
    };
  }, [stories]);

  const switchMode = (mode) => {
    setWorkMode(mode);
    setSearch('');
    setMessage('');

    if (mode === 'author_requests') {
      setActiveStatus('pending');
    } else {
      setActiveStatus('all');
    }
  };

  const openAction = (mode, story) => {
    setModalMode(mode);
    setSelectedStory(story);
    setSelectedSections(story?.exclusive_sections?.length ? story.exclusive_sections : ['featured']);
    setNote(story?.exclusive_note || '');
    setKeepPremium(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setSelectedStory(null);
    setSelectedSections(['featured']);
    setNote('');
    setKeepPremium(false);
  };

  const runAction = async () => {
    if (!selectedStory) return;

    try {
      setSaving(true);

      let path = '';
      let body = {};

      if (modalMode === 'request') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/request`;
        body = { note };
      }

      if (modalMode === 'approve') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/approve`;
        body = {
          access_type: 'premium',
          exclusive_sections: selectedSections.length ? selectedSections : ['featured'],
          note,
        };
      }

      if (modalMode === 'reject') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/reject`;
        body = { note };
      }

      if (modalMode === 'remove') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/remove`;
        body = {
          keep_premium: keepPremium,
          note,
        };
      }

      if (modalMode === 'sections') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/sections`;
        body = {
          exclusive_sections: selectedSections.length ? selectedSections : ['featured'],
        };
      }

      const data = await apiFetch(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      showMessage(data.message || 'Saved successfully');
      closeModal();
      await fetchStories();
    } catch (error) {
      showMessage(error.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authExpired) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      return (
  <AdminLayout title="Shadow Exclusive" subtitle="Manage premium stories and author requests.">
    <style>{styles}</style>
      <ActionModal
        open={modalOpen}
        mode={modalMode}
        story={selectedStory}
        saving={saving}
        sections={selectedSections}
        setSections={setSelectedSections}
        note={note}
        setNote={setNote}
        keepPremium={keepPremium}
        setKeepPremium={setKeepPremium}
        onClose={closeModal}
        onConfirm={runAction}
      />

      <main className="se-page">
        <div className="se-shell">
          <div className="se-top">
            <div>

              <div>
                <span className="se-kicker">Premium Story Management</span>
                <h1 className="se-title">Shadow Exclusive</h1>
                <p className="se-subtitle">
                  Choose stories by yourself, or review stories that authors request later.
                  Admin Pick adds directly to Premium / Shadow Exclusive without waiting for author request.
                </p>
              </div>
            </div>

            <button type="button" className="se-refresh" onClick={fetchStories} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="se-mode-tabs">
            <button
              type="button"
              className={`se-mode-tab ${workMode === 'admin_pick' ? 'active' : ''}`}
              onClick={() => switchMode('admin_pick')}
            >
              <div className="se-mode-title">Admin Pick Stories</div>
              <div className="se-mode-desc">
                You choose any published story and add it directly to Shadow Exclusive.
              </div>
            </button>

            <button
              type="button"
              className={`se-mode-tab ${workMode === 'author_requests' ? 'active' : ''}`}
              onClick={() => switchMode('author_requests')}
            >
              <div className="se-mode-title">Author Requests</div>
              <div className="se-mode-desc">
                Review stories that authors request for Shadow Exclusive approval.
              </div>
            </button>
          </div>

          <section className="se-stats">
            <StatCard label="Loaded Stories" value={stats.total} />
            <StatCard label="Pending Review" value={stats.pending} />
            <StatCard label="Approved Premium" value={stats.approved} />
            <StatCard label="Rejected" value={stats.rejected} />
          </section>

          <section className="se-card">
            <div className="se-card-head">
              <div>
                <h2 className="se-card-title">
                  {workMode === 'admin_pick' ? 'Admin Pick Queue' : 'Author Request Queue'}
                </h2>
                <div className="se-card-desc">
                  {workMode === 'admin_pick'
                    ? 'Pick from published stories and add directly to Shadow Exclusive.'
                    : 'Approve or reject stories that are waiting in the request flow.'}
                </div>
              </div>

              <div className="se-tabs">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`se-tab ${activeStatus === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveStatus(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="se-toolbar">
              <input
                className="se-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') fetchStories();
                }}
                placeholder="Search story by title..."
              />

              <button type="button" className="se-search-btn" onClick={fetchStories}>
                Search
              </button>
            </div>

            {message ? (
              <div className={`se-message ${messageType === 'error' ? 'error' : 'success'}`}>
                {message}
              </div>
            ) : null}

            <div className="se-list">
              {loading ? (
                <div className="se-empty">Loading published stories...</div>
              ) : stories.length ? (
                stories.map((story) => (
                  <div className="se-row" key={story.id}>
                    <div className="se-cover">
                      {story.cover_url ? (
                        <img
                          src={story.cover_url}
                          alt={story.title}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="se-empty-cover">No Cover</div>
                      )}
                    </div>

                    <div>
                      <div className="se-story-title">{story.title || 'Untitled Story'}</div>

                      <div className="se-meta">
                        <span>{story.main_genre || 'Novel'}</span>
                        <span>•</span>
                        <span>{story.story_language || 'Unknown'}</span>
                        <span>•</span>
                        <span>EP {Number(story.total_episodes || 0)}</span>
                      </div>

                      <div className="se-meta">
                        <StatusPill status={story.exclusive_status} />
                        <AccessPill accessType={story.access_type} />
                        <span>
                          {story.exclusive_sections?.length
                            ? story.exclusive_sections.join(' / ')
                            : 'No exclusive section'}
                        </span>
                      </div>
                    </div>

                    <div className="se-actions">
                      {workMode === 'admin_pick' && story.exclusive_status !== 'approved' ? (
                        <button type="button" className="se-action-btn approve" onClick={() => openAction('approve', story)}>
                          Add to Shadow Exclusive
                        </button>
                      ) : null}

                      {workMode === 'admin_pick' && story.exclusive_status === 'none' && !story.is_shadow_exclusive ? (
                        <button type="button" className="se-action-btn request" onClick={() => openAction('request', story)}>
                          Move to Review
                        </button>
                      ) : null}

                      {workMode === 'author_requests' && story.exclusive_status !== 'approved' ? (
                        <button type="button" className="se-action-btn approve" onClick={() => openAction('approve', story)}>
                          Approve Request
                        </button>
                      ) : null}

                      {story.exclusive_status === 'approved' ? (
                        <button type="button" className="se-action-btn" onClick={() => openAction('sections', story)}>
                          Sections
                        </button>
                      ) : null}

                      {story.exclusive_status !== 'rejected' && story.exclusive_status !== 'none' ? (
                        <button type="button" className="se-action-btn reject" onClick={() => openAction('reject', story)}>
                          Reject
                        </button>
                      ) : null}

                      {story.is_shadow_exclusive ? (
                        <button type="button" className="se-action-btn remove" onClick={() => openAction('remove', story)}>
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="se-empty">
                  {workMode === 'admin_pick'
                    ? 'No published stories found. Admin Pick only shows stories where status is published.'
                    : 'No author requests found. Requested stories will appear here when exclusive_status is pending.'}
                </div>
              )}
            </div>
          </section>
        </div>
            </main>
    </AdminLayout>
  );
}
