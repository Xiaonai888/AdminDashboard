import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
  { key: 'approved', label: 'Approved Exclusive' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'removed', label: 'Normal / Removed' },
];

const REQUEST_TABS = [
  { key: 'pending', label: 'Pending Requests' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const EMPTY_SUMMARY = {
  total_published: 0,
  exclusive_stories: 0,
  pending_requests: 0,
  rejected_requests: 0,
  normal_stories: 0,
  premium_stories: 0,
};

const styles = `
 

  :root {
    --se-bg:#F8FAFC;
    --se-card:#FFFFFF;
    --se-primary:#4F46E5;
    --se-primary-light:#EEF2FF;
    --se-text:#0F172A;
    --se-muted:#64748B;
    --se-border:#E2E8F0;
    --se-green:#10B981;
    --se-green-bg:#D1FAE5;
    --se-red:#EF4444;
    --se-red-bg:#FEE2E2;
    --se-amber:#F59E0B;
    --se-amber-bg:#FEF3C7;
  }

  * { box-sizing:border-box; }

  .se-page {
    min-height:100vh;
    background:var(--se-bg);
    padding:28px 36px 60px;
  
    color:var(--se-text);
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

  .se-kicker {
    display:inline-flex;
    align-items:center;
    min-height:30px;
    border-radius:999px;
    padding:7px 12px;
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
    color:var(--se-muted);
    font-size:14px;
    line-height:1.7;
    margin:8px 0 0;
    font-weight:500;
  }

  .se-refresh {
    min-height:42px;
    border:0;
    background:var(--se-primary);
    color:#fff;
    border-radius:13px;
    padding:0 16px;
    font-family:inherit;
    font-weight:900;
    cursor:pointer;
    box-shadow:0 12px 24px rgba(79,70,229,.18);
  }

  .se-refresh:disabled,
  .se-action-btn:disabled,
  .se-search-btn:disabled,
  .se-confirm:disabled,
  .se-cancel:disabled {
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
    border:1px solid var(--se-border);
    background:#fff;
    color:var(--se-muted);
    border-radius:16px;
    padding:14px 16px;
    font-family:inherit;
    cursor:pointer;
    min-width:240px;
    text-align:left;
  }

  .se-mode-tab.active {
    border-color:var(--se-primary);
    background:linear-gradient(135deg,#EEF2FF,#FFFFFF);
    box-shadow:0 12px 28px rgba(79,70,229,.12);
  }

  .se-mode-title {
    font-size:14px;
    font-weight:900;
    color:var(--se-text);
  }

  .se-mode-desc {
    margin-top:4px;
    font-size:12px;
    line-height:1.45;
    color:var(--se-muted);
    font-weight:600;
  }

  .se-stats {
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(155px,1fr));
    gap:14px;
    margin-bottom:18px;
  }

  .se-stat {
    min-width:0;
    background:#fff;
    border:1px solid var(--se-border);
    border-radius:18px;
    padding:16px;
    box-shadow:0 4px 18px rgba(15,23,42,.04);
  }

  .se-stat-label {
    color:var(--se-muted);
    font-size:10.5px;
    font-weight:900;
    text-transform:uppercase;
    letter-spacing:.55px;
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
    border:1px solid var(--se-border);
    border-radius:22px;
    box-shadow:0 8px 28px rgba(15,23,42,.05);
    overflow:hidden;
  }

  .se-card-head {
    padding:18px 20px;
    border-bottom:1px solid var(--se-border);
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
    color:var(--se-muted);
    font-size:12px;
    font-weight:600;
    margin-top:4px;
    line-height:1.5;
  }

  .se-result-count {
    display:inline-flex;
    margin-top:8px;
    min-height:25px;
    align-items:center;
    border-radius:999px;
    padding:4px 10px;
    background:#F1F5F9;
    color:#475569;
    font-size:11px;
    font-weight:800;
  }

  .se-tabs {
    display:flex;
    align-items:center;
    gap:8px;
    flex-wrap:wrap;
  }

  .se-tab {
    min-height:34px;
    border-radius:999px;
    border:1px solid var(--se-border);
    background:#fff;
    color:var(--se-muted);
    padding:6px 13px;
    font-size:12px;
    font-weight:900;
    cursor:pointer;
    white-space:nowrap;
  }

  .se-tab.active {
    border-color:var(--se-primary);
    background:var(--se-primary);
    color:#fff;
  }

  .se-tab-count {
    margin-left:5px;
    opacity:.85;
  }

  .se-toolbar {
    padding:14px 20px;
    border-bottom:1px solid var(--se-border);
    display:flex;
    gap:10px;
    align-items:center;
  }

  .se-search {
    flex:1;
    min-width:0;
    height:42px;
    border:1px solid var(--se-border);
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
    border-color:var(--se-primary);
    box-shadow:0 0 0 3px rgba(79,70,229,.1);
  }

  .se-search-btn {
    height:42px;
    border:1px solid var(--se-border);
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
    background:var(--se-green-bg);
    color:#047857;
  }

  .se-message.error {
    background:var(--se-red-bg);
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
    font-size:10px;
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
    color:var(--se-muted);
    font-size:11.5px;
    font-weight:700;
  }

  .se-pill {
    display:inline-flex;
    align-items:center;
    min-height:24px;
    border-radius:999px;
    padding:4px 9px;
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
    background:var(--se-amber-bg);
    color:#B45309;
  }

  .se-pill.approved {
    background:var(--se-green-bg);
    color:#047857;
  }

  .se-pill.rejected {
    background:var(--se-red-bg);
    color:#B91C1C;
  }

  .se-pill.premium {
    background:var(--se-primary-light);
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
    min-height:34px;
    border-radius:999px;
    border:1px solid var(--se-border);
    background:#fff;
    padding:7px 12px;
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
    color:var(--se-muted);
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
    max-height:calc(100dvh - 36px);
    overflow-y:auto;
    background:#fff;
    border-radius:22px;
    box-shadow:0 24px 70px rgba(15,23,42,.28);
  }

  .se-modal-head {
    padding:20px;
    border-bottom:1px solid var(--se-border);
  }

  .se-modal-title {
    font-size:18px;
    font-weight:900;
    margin:0;
  }

  .se-modal-desc {
    margin:6px 0 0;
    color:var(--se-muted);
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
    border:1px solid var(--se-border);
    border-radius:12px;
    padding:8px 10px;
    font-size:12px;
    font-weight:800;
    color:#334155;
    cursor:pointer;
  }

  .se-check input {
    accent-color:var(--se-primary);
  }

  .se-textarea {
    width:100%;
    min-height:92px;
    resize:vertical;
    border:1px solid var(--se-border);
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
    border-color:var(--se-primary);
    box-shadow:0 0 0 3px rgba(79,70,229,.1);
  }

  .se-modal-foot {
    position:sticky;
    bottom:0;
    padding:16px 20px;
    border-top:1px solid var(--se-border);
    display:flex;
    justify-content:flex-end;
    gap:10px;
    background:#fff;
  }

  .se-cancel,
  .se-confirm {
    min-height:40px;
    border-radius:12px;
    padding:8px 14px;
    font-weight:900;
    cursor:pointer;
  }

  .se-cancel {
    border:1px solid var(--se-border);
    background:#fff;
  }

  .se-confirm {
    border:0;
    background:var(--se-primary);
    color:#fff;
  }

  @media (max-width:900px) {
    .se-page {
      min-width:0;
      padding:20px 18px 44px;
    }

    .se-top {
      align-items:stretch;
      flex-direction:column;
      margin-bottom:18px;
    }

    .se-refresh {
      width:100%;
    }

    .se-mode-tabs,
    .se-tabs {
      flex-wrap:nowrap;
      overflow-x:auto;
      padding-bottom:6px;
      scrollbar-width:none;
    }

    .se-mode-tabs::-webkit-scrollbar,
    .se-tabs::-webkit-scrollbar {
      display:none;
    }

    .se-mode-tab {
      flex:0 0 min(320px,86vw);
      min-width:0;
    }

    .se-card-head {
      align-items:flex-start;
      flex-direction:column;
      padding:17px 16px;
    }

    .se-tabs {
      width:100%;
    }

    .se-tab {
      flex:0 0 auto;
    }

    .se-toolbar {
      padding:14px 16px;
    }

    .se-message {
      margin:14px 16px 0;
      overflow-wrap:anywhere;
    }

    .se-list {
      padding:10px;
    }

    .se-row {
      grid-template-columns:64px minmax(0,1fr);
      gap:12px;
      align-items:start;
      padding:12px 10px;
    }

    .se-cover {
      width:64px;
    }

    .se-story-title,
    .se-meta {
      white-space:normal;
      overflow-wrap:anywhere;
    }

    .se-actions {
      grid-column:1 / -1;
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      width:100%;
      padding-left:76px;
    }

    .se-action-btn {
      width:100%;
      white-space:normal;
      line-height:1.3;
    }

    .se-modal-backdrop {
      align-items:flex-end;
      padding:10px;
    }

    .se-modal {
      max-height:calc(100dvh - 20px);
      border-radius:20px;
    }
  }

  @media (max-width:560px) {
    .se-page {
      padding:18px 14px 38px;
    }

    .se-title {
      font-size:25px;
    }

    .se-stats {
      grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .se-toolbar {
      align-items:stretch;
      flex-direction:column;
    }

    .se-search,
    .se-search-btn {
      width:100%;
    }

    .se-row {
      grid-template-columns:56px minmax(0,1fr);
      gap:10px;
    }

    .se-cover {
      width:56px;
      border-radius:11px;
    }

    .se-actions {
      grid-template-columns:1fr;
      padding-left:66px;
    }

    .se-check-grid {
      grid-template-columns:1fr;
    }

    .se-modal-foot {
      display:grid;
      grid-template-columns:1fr 1fr;
    }
  }

  @media (max-width:420px) {
    .se-stats {
      grid-template-columns:1fr;
    }

    .se-row {
      grid-template-columns:1fr;
    }

    .se-cover {
      width:76px;
    }

    .se-actions {
      grid-column:auto;
      padding-left:0;
    }

    .se-modal-foot {
      grid-template-columns:1fr;
    }
  }
`;

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token') || localStorage.getItem('shadow_admin_token') || '';
}

function getAdminUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem('shadow_admin_user') ||
      localStorage.getItem('shadow_admin_user') ||
      '{}'
    );
  } catch {
    return {};
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatSectionLabel(value) {
  const option = SECTION_OPTIONS.find((item) => item.key === value);

  if (option) return option.label;

  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
      <div className="se-stat-value">{formatNumber(value)}</div>
    </div>
  );
}

function CoverImage({ src, title }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="se-empty-cover">No Cover</div>;
  }

  return <img src={src} alt={title || 'Story cover'} onError={() => setFailed(true)} />;
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
    request: 'Move this published story into the pending review queue.',
    approve: 'Add this story directly to Premium and Shadow Exclusive.',
    reject: 'Reject this story from the Shadow Exclusive workflow.',
    remove: 'Remove this story from Shadow Exclusive. Premium access can remain enabled.',
    sections: 'Update the sections where this approved story appears.',
  };

  const showSections = mode === 'approve' || mode === 'sections';

  const toggleSection = (key) => {
    setSections((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    ));
  };

  return (
    <div className="se-modal-backdrop" role="presentation" onMouseDown={() => onClose()}>
      <div
        className="se-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="se-modal-head">
          <h2 className="se-modal-title">{titleMap[mode]}</h2>
          <p className="se-modal-desc">
            {story.title || 'Untitled Story'}
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
              Keep premium access after removing from Shadow Exclusive
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
                maxLength={2000}
              />
            </>
          ) : null}
        </div>

        <div className="se-modal-foot">
          <button type="button" className="se-cancel" onClick={() => onClose()} disabled={saving}>
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
  const [workMode, setWorkMode] = useState('admin_pick');
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [stories, setStories] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [resultCount, setResultCount] = useState(0);
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

const adminUser = getAdminUser();
const adminRole = String(adminUser?.role || '').trim().toLowerCase();
const canManageExclusive =
  adminUser?.has_all_permissions === true ||
  adminRole === 'owner' ||
  adminRole === 'admin' ||
  (
    Array.isArray(adminUser?.permission_keys) &&
    adminUser.permission_keys.includes('shadow_exclusive.manage')
  );

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

    if (response.status === 401) {
  sessionStorage.removeItem('shadow_admin_token');
  localStorage.removeItem('shadow_admin_token');
  sessionStorage.removeItem('shadow_admin_user');
  localStorage.removeItem('shadow_admin_user');
  setAuthExpired(true);
  throw new Error('Admin session expired. Please login again.');
}

if (response.status === 403) {
  throw new Error('You do not have permission to perform this action.');
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
      params.set('limit', '100');

      if (activeStatus !== 'all') params.set('status', activeStatus);
      if (search.trim()) params.set('search', search.trim());

      const data = await apiFetch(`/api/admin/exclusive/stories?${params.toString()}`);

      setStories(Array.isArray(data.stories) ? data.stories : []);
      setSummary({
        ...EMPTY_SUMMARY,
        ...(data.summary || {}),
      });
      setResultCount(Number(data.result_count || 0));
    } catch (error) {
      setStories([]);
      setResultCount(0);
      showMessage(error.message || 'Failed to load stories', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStories();
  }, [activeStatus, workMode]);

  const getTabCount = (status) => {
    if (status === 'all') return summary.total_published;
    if (status === 'pending') return summary.pending_requests;
    if (status === 'approved') return summary.exclusive_stories;
    if (status === 'rejected') return summary.rejected_requests;
    if (status === 'removed') return summary.normal_stories;

    return 0;
  };

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
  if (!canManageExclusive) return;

  setModalMode(mode);
  setSelectedStory(story);
  setSelectedSections(
    Array.isArray(story?.exclusive_sections) && story.exclusive_sections.length
      ? story.exclusive_sections
      : ['featured'],
  );
  setNote(story?.exclusive_note || '');
  setKeepPremium(false);
  setModalOpen(true);
};

  const closeModal = (force = false) => {
    if (saving && !force) return;

    setModalOpen(false);
    setSelectedStory(null);
    setSelectedSections(['featured']);
    setNote('');
    setKeepPremium(false);
  };

  const runAction = async () => {
  if (!canManageExclusive || !selectedStory) return;

    try {
      setSaving(true);

      let path = '';
      let body = {};

      if (modalMode === 'request') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/request`;
        body = { note };
      } else if (modalMode === 'approve') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/approve`;
        body = {
          access_type: 'premium',
          exclusive_sections: selectedSections.length ? selectedSections : ['featured'],
          note,
        };
      } else if (modalMode === 'reject') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/reject`;
        body = { note };
      } else if (modalMode === 'remove') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/remove`;
        body = {
          keep_premium: keepPremium,
          note,
        };
      } else if (modalMode === 'sections') {
        path = `/api/admin/exclusive/stories/${selectedStory.id}/sections`;
        body = {
          exclusive_sections: selectedSections.length ? selectedSections : ['featured'],
        };
      }

      if (!path) throw new Error('Invalid Shadow Exclusive action');

      const data = await apiFetch(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      closeModal(true);
      showMessage(data.message || 'Saved successfully');
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
              <span className="se-kicker">Premium Story Management</span>
              <h1 className="se-title">Shadow Exclusive</h1>
              <p className="se-subtitle">
                Choose published stories directly, or review stories submitted through the author request workflow.
              </p>
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
                Select any published story and add it directly to Shadow Exclusive.
              </div>
            </button>

            <button
              type="button"
              className={`se-mode-tab ${workMode === 'author_requests' ? 'active' : ''}`}
              onClick={() => switchMode('author_requests')}
            >
              <div className="se-mode-title">Author Requests</div>
              <div className="se-mode-desc">
                Review stories waiting for Shadow Exclusive approval.
              </div>
            </button>
          </div>

          <section className="se-stats">
            <StatCard label="Total Published" value={summary.total_published} />
            <StatCard label="Approved Exclusive" value={summary.exclusive_stories} />
            <StatCard label="Pending Review" value={summary.pending_requests} />
            <StatCard label="Rejected" value={summary.rejected_requests} />
            <StatCard label="Normal / Removed" value={summary.normal_stories} />
            <StatCard label="Premium Access" value={summary.premium_stories} />
          </section>

          <section className="se-card">
            <div className="se-card-head">
              <div>
                <h2 className="se-card-title">
                  {workMode === 'admin_pick' ? 'Admin Pick Queue' : 'Author Request Queue'}
                </h2>
                <div className="se-card-desc">
                  {workMode === 'admin_pick'
                    ? 'Pick from published stories and add them directly to Shadow Exclusive.'
                    : 'Approve or reject stories waiting in the request flow.'}
                </div>
                <div className="se-result-count">
                  Showing {formatNumber(stories.length)} of {formatNumber(resultCount)} matching stories
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
                    <span className="se-tab-count">{formatNumber(getTabCount(tab.key))}</span>
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
                maxLength={200}
              />

              <button type="button" className="se-search-btn" onClick={fetchStories} disabled={loading}>
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
                      <CoverImage src={story.cover_url} title={story.title} />
                    </div>

                    <div>
                      <div className="se-story-title">{story.title || 'Untitled Story'}</div>

                      <div className="se-meta">
                        <span>{story.main_genre || 'Novel'}</span>
                        <span>•</span>
                        <span>{story.story_language || 'Unknown'}</span>
                        <span>•</span>
                        <span>EP {formatNumber(story.total_episodes)}</span>
                        <span>•</span>
                        <span>{formatNumber(story.total_views)} views</span>
                      </div>

                      <div className="se-meta">
                        <StatusPill status={story.exclusive_status} />
                        <AccessPill accessType={story.access_type} />
                        <span>
                          {Array.isArray(story.exclusive_sections) && story.exclusive_sections.length
                            ? story.exclusive_sections.map(formatSectionLabel).join(' / ')
                            : 'No exclusive section'}
                        </span>
                      </div>
                    </div>

                    {canManageExclusive ? (
  <div className="se-actions">
                      {workMode === 'admin_pick' && story.exclusive_status !== 'approved' ? (
                        <button
                          type="button"
                          className="se-action-btn approve"
                          onClick={() => openAction('approve', story)}
                          disabled={saving}
                        >
                          Add to Shadow Exclusive
                        </button>
                      ) : null}

                      {workMode === 'admin_pick' && story.exclusive_status === 'none' && !story.is_shadow_exclusive ? (
                        <button
                          type="button"
                          className="se-action-btn request"
                          onClick={() => openAction('request', story)}
                          disabled={saving}
                        >
                          Move to Review
                        </button>
                      ) : null}

                      {workMode === 'author_requests' && story.exclusive_status !== 'approved' ? (
                        <button
                          type="button"
                          className="se-action-btn approve"
                          onClick={() => openAction('approve', story)}
                          disabled={saving}
                        >
                          Approve Request
                        </button>
                      ) : null}

                      {story.exclusive_status === 'approved' ? (
                        <button
                          type="button"
                          className="se-action-btn"
                          onClick={() => openAction('sections', story)}
                          disabled={saving}
                        >
                          Sections
                        </button>
                      ) : null}

                      {story.exclusive_status !== 'rejected' && story.exclusive_status !== 'none' ? (
                        <button
                          type="button"
                          className="se-action-btn reject"
                          onClick={() => openAction('reject', story)}
                          disabled={saving}
                        >
                          Reject
                        </button>
                      ) : null}

                      {story.is_shadow_exclusive ? (
                        <button
                          type="button"
                          className="se-action-btn remove"
                          onClick={() => openAction('remove', story)}
                          disabled={saving}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  </div>
                ))
              ) : (
                <div className="se-empty">
                  {search.trim()
                    ? 'No story matches this search and filter.'
                    : workMode === 'admin_pick'
                      ? 'No published stories are available in this filter.'
                      : 'No author requests are available in this filter.'}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </AdminLayout>
  );
}
