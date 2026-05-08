import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SECTION_KEY = 'home_top_slider';
const SLOTS = [1, 2, 3, 4, 5, 6, 7];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  :root{--bg:#F8FAFC;--card:#fff;--primary:#4F46E5;--light:#EEF2FF;--text:#0F172A;--muted:#64748B;--soft:#94A3B8;--border:#E2E8F0;--success:#10B981;--successBg:#D1FAE5;--danger:#EF4444;--dangerBg:#FEE2E2;--side:80px;--sideOpen:260px}
  *{box-sizing:border-box;margin:0;padding:0} body{font-family:Inter,sans-serif;background:var(--bg);color:var(--text)}
  .dashboard-wrapper{height:100vh;display:flex;background:var(--bg);overflow:hidden}.sidebar{width:var(--side);background:#fff;border-right:1px solid var(--border);padding:20px 14px;overflow:auto;overflow-x:hidden;transition:.25s;flex-shrink:0}.sidebar:hover{width:var(--sideOpen);box-shadow:10px 0 30px rgba(15,23,42,.05)}
  .sidebar-logo{height:40px;display:flex;align-items:center;gap:12px;margin-bottom:28px;padding-left:10px}.logo-text{opacity:0;white-space:nowrap;color:var(--primary);font-weight:900;font-size:18px}.sidebar:hover .logo-text,.sidebar:hover .nav-text,.sidebar:hover .nav-group-label{opacity:1}.nav-group-label{opacity:0;display:block;margin:18px 0 8px 12px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--soft);white-space:nowrap}.nav-item{height:44px;display:flex;align-items:center;border-radius:12px;padding:0 12px;color:var(--muted);cursor:pointer;margin-bottom:2px;font-weight:600;white-space:nowrap}.nav-item:hover,.nav-item.active{background:var(--light);color:var(--primary)}.nav-text{opacity:0;margin-left:14px;transition:.2s}
  .main-content{flex:1;overflow:auto}.header{height:70px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 36px;position:sticky;top:0;z-index:10}.header h2{font-size:17px;font-weight:900}.content-body{padding:28px 36px 48px;max-width:1600px;margin:0 auto}.page-title-row{margin-bottom:22px}.page-title-row h1{font-size:27px;font-weight:900;letter-spacing:-.04em}.page-title-row p{font-size:13.5px;color:var(--muted);margin-top:5px}
  .manager-shell{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(360px,.7fr);gap:24px;align-items:start}.panel{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:0 8px 28px rgba(15,23,42,.06);overflow:hidden}.panel-header{padding:20px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:14px;align-items:center}.panel-header h3{font-size:16px;font-weight:900}.panel-header p{font-size:12.5px;color:var(--muted);margin-top:4px}.count-pill{font-size:12px;font-weight:800;color:var(--primary);background:var(--light);border:1px solid #E0E7FF;padding:7px 11px;border-radius:999px}
  .slots-grid{padding:18px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.slot-card{border:1px solid var(--border);border-radius:18px;background:#fff;overflow:hidden;cursor:pointer;text-align:left;font-family:inherit;transition:.18s;box-shadow:0 2px 10px rgba(15,23,42,.04)}.slot-card:hover{transform:translateY(-2px);border-color:#C7D2FE;box-shadow:0 14px 34px rgba(79,70,229,.12)}.slot-card.selected{border-color:var(--primary);box-shadow:0 0 0 3px rgba(79,70,229,.14),0 14px 34px rgba(79,70,229,.16)}
  .slot-preview{position:relative;aspect-ratio:16/9;background:linear-gradient(135deg,#F8FAFC,#EEF2FF);overflow:hidden}.slot-preview img{width:100%;height:100%;object-fit:cover;display:block}.empty-preview{height:100%;display:flex;align-items:center;justify-content:center;color:var(--soft);font-size:12px;font-weight:800}.slot-number,.slot-status{position:absolute;top:10px;z-index:2;border-radius:999px;font-size:10.5px;font-weight:900;padding:6px 9px;backdrop-filter:blur(8px)}.slot-number{left:10px;background:rgba(15,23,42,.78);color:#fff}.slot-status{right:10px}.slot-status.active{background:rgba(209,250,229,.92);color:#047857}.slot-status.inactive{background:rgba(254,226,226,.92);color:#B91C1C}.slot-status.empty{background:rgba(241,245,249,.92);color:#475569}.slot-meta{padding:13px 14px 15px}.slot-title{font-size:13.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.slot-link{margin-top:4px;font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .editor-panel{position:sticky;top:92px}.editor-body{padding:20px}.selected-preview{aspect-ratio:16/9;border-radius:16px;border:1px solid var(--border);background:linear-gradient(135deg,#F8FAFC,#EEF2FF);overflow:hidden;margin-bottom:16px}.selected-preview img{width:100%;height:100%;object-fit:cover}.selected-preview-empty{height:100%;display:flex;align-items:center;justify-content:center;color:var(--soft);font-size:13px;font-weight:800}.field-label{display:block;font-size:12px;font-weight:900;color:#334155;margin:12px 0 7px}.input,.textarea{width:100%;padding:13px 14px;border-radius:13px;border:1px solid var(--border);outline:none;background:#F8FAFC;font-size:14px;font-family:inherit}.textarea{min-height:86px;resize:vertical}.input:focus,.textarea:focus{background:#fff;border-color:var(--primary);box-shadow:0 0 0 3px rgba(79,70,229,.1)}
  .upload-box{border:1.5px dashed #CBD5E1;background:#F8FAFC;border-radius:15px;padding:15px;margin-top:12px;cursor:pointer;text-align:center}.upload-box:hover{border-color:var(--primary);background:var(--light)}.upload-title{font-size:13px;font-weight:900}.upload-help{margin-top:4px;font-size:11.5px;color:var(--muted)}.toggle-row{margin-top:14px;padding:13px 14px;border:1px solid var(--border);border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:space-between}.toggle-title{font-size:13px;font-weight:900}.toggle-help{margin-top:3px;font-size:11.5px;color:var(--muted)}.switch{width:48px;height:28px;border-radius:999px;background:#CBD5E1;padding:3px;border:none;cursor:pointer}.switch.on{background:var(--success)}.switch-thumb{width:22px;height:22px;border-radius:50%;background:#fff;display:block;transition:.2s;box-shadow:0 2px 6px rgba(15,23,42,.18)}.switch.on .switch-thumb{transform:translateX(20px)}
  .btn-row{display:grid;gap:10px;margin-top:16px}.btn-primary,.btn-secondary{border:none;border-radius:14px;padding:14px 16px;font-weight:900;cursor:pointer;font-family:inherit}.btn-primary{background:var(--primary);color:#fff;box-shadow:0 12px 24px rgba(79,70,229,.22)}.btn-primary:disabled{opacity:.55;cursor:not-allowed}.btn-secondary{background:#F1F5F9;color:#334155;border:1px solid var(--border)}.message{padding:12px 14px;border-radius:13px;margin-bottom:14px;font-size:13px;font-weight:800;line-height:1.45}.message.success{background:var(--successBg);color:#047857}.message.error{background:var(--dangerBg);color:#B91C1C}.message.info{background:var(--light);color:var(--primary)}.note-box{margin-top:14px;padding:12px 14px;border-radius:14px;background:#F8FAFC;border:1px solid var(--border);color:var(--muted);font-size:12px;line-height:1.55}
  @media(max-width:1200px){.manager-shell{grid-template-columns:1fr}.editor-panel{position:static}}@media(max-width:900px){.content-body{padding:22px 16px}.header{padding:0 18px}.slots-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.slots-grid{grid-template-columns:1fr}}
`;

const Icon = ({ d, size = 20, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: `${size}px`, flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const navItems = {
  overview: [
    { path: '/admin', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/novels', label: 'Novels Content', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { path: '/authors', label: 'Authors Community', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ],
  visualMedia: [
    { path: '/slides', label: 'Slide Section', icon: 'M2 3h20v14H2z M8 21h8 M12 17v4' },
    { path: '/banners', label: 'Banner System', icon: 'M3 3h18v18H3z M3 9h18 M9 3v18' },
    { path: '/advertisement', label: 'Advertisement', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    { path: '/recommended', label: 'Recommended', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  ],
  systemAdmin: [
    { path: '/category', label: 'Category', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
    { path: '/rule', label: 'Rule', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z' },
    { path: '/block-list', label: 'Block List', icon: 'M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ],
  finance: [
    { path: '/income', label: 'Income', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/deposit', label: 'Deposit', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
    { path: '/withdraw', label: 'Withdraw', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12' },
    { path: '/ranking', label: 'Ranking', icon: 'M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z' },
  ],
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const renderGroup = (items) => items.map((item) => (
    <div key={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
      <Icon d={item.icon} size={20} />
      <span className="nav-text">{item.label}</span>
    </div>
  ));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="#4F46E5" />
        <span className="logo-text">Shadow Exclusive</span>
      </div>
      <span className="nav-group-label">Overview</span>{renderGroup(navItems.overview)}
      <span className="nav-group-label">Visual Media</span>{renderGroup(navItems.visualMedia)}
      <span className="nav-group-label">System Admin</span>{renderGroup(navItems.systemAdmin)}
      <span className="nav-group-label">Finance & Growth</span>{renderGroup(navItems.finance)}
    </aside>
  );
}

function getLatestSlide(slides, slotNumber) {
  return slides
    .filter((slide) => Number(slide.order_index) === slotNumber)
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))[0] || null;
}

export default function SlideSection() {
  const fileInputRef = useRef(null);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [slides, setSlides] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('/story/1');
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const slotMap = useMemo(() => SLOTS.reduce((acc, slot) => ({ ...acc, [slot]: getLatestSlide(slides, slot) }), {}), [slides]);
  const selectedSlide = slotMap[selectedSlot];

  const fetchSlides = async () => {
    try {
      const res = await fetch(`${API_URL}/api/slides?section_key=${SECTION_KEY}`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to fetch slides');
      setSlides(data.slides || []);
    } catch (error) {
      setMessage({ type: 'error', text: `Cannot load slides: ${error.message}` });
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  useEffect(() => {
    const slide = slotMap[selectedSlot];
    setTitle(slide?.title || '');
    setSubtitle(slide?.subtitle || '');
    setLinkUrl(slide?.link_url || '/story/1');
    setIsActive(slide?.is_active ?? true);
    setSelectedFile(null);
    setLocalPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedSlot, slotMap]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveSlide = async () => {
    if (!selectedFile) {
      setMessage({ type: 'info', text: 'Choose an image before saving. This version saves a new image record for the selected slot.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('section_key', SECTION_KEY);
      formData.append('title', title || `Home Slide ${selectedSlot}`);
      formData.append('subtitle', subtitle);
      formData.append('link_url', linkUrl || '/');
      formData.append('order_index', String(selectedSlot));
      formData.append('is_active', String(isActive));

      const res = await fetch(`${API_URL}/api/slides`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to save slide');

      setMessage({ type: 'success', text: `Slide ${selectedSlot} saved successfully.` });
      setSelectedFile(null);
      setLocalPreviewUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchSlides();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    const slide = slotMap[selectedSlot];
    setTitle(slide?.title || '');
    setSubtitle(slide?.subtitle || '');
    setLinkUrl(slide?.link_url || '/story/1');
    setIsActive(slide?.is_active ?? true);
    setSelectedFile(null);
    setLocalPreviewUrl('');
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentPreview = localPreviewUrl || selectedSlide?.image_url || '';

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <header className="header"><h2>Slide Management</h2></header>
          <main className="content-body">
            <div className="page-title-row">
              <h1>Home Slides Manager</h1>
              <p>Manage homepage hero slides, featured visuals, and promotional links.</p>
            </div>

            <div className="manager-shell">
              <section className="panel">
                <div className="panel-header">
                  <div><h3>Slide Slots</h3><p>Seven fixed homepage slots. Select a card to manage its content.</p></div>
                  <span className="count-pill">{slides.length} records</span>
                </div>
                <div className="slots-grid">
                  {SLOTS.map((slot) => {
                    const slide = slotMap[slot];
                    const statusClass = !slide ? 'empty' : slide.is_active === false ? 'inactive' : 'active';
                    return (
                      <button type="button" key={slot} className={`slot-card ${selectedSlot === slot ? 'selected' : ''}`} onClick={() => setSelectedSlot(slot)}>
                        <div className="slot-preview">
                          <span className="slot-number">Slide {slot}</span>
                          <span className={`slot-status ${statusClass}`}>{!slide ? 'EMPTY' : slide.is_active === false ? 'INACTIVE' : 'ACTIVE'}</span>
                          {slide?.image_url ? <img src={slide.image_url} alt={slide.title || `Slide ${slot}`} /> : <div className="empty-preview">No image assigned</div>}
                        </div>
                        <div className="slot-meta"><div className="slot-title">{slide?.title || `Slide ${slot}`}</div><div className="slot-link">{slide?.link_url || 'No link set'}</div></div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="panel editor-panel">
                <div className="panel-header"><div><h3>Edit Slide {selectedSlot}</h3><p>Update the selected homepage slide slot.</p></div></div>
                <div className="editor-body">
                  {message && <div className={`message ${message.type}`}>{message.text}</div>}
                  <div className="selected-preview">{currentPreview ? <img src={currentPreview} alt={`Slide ${selectedSlot} preview`} /> : <div className="selected-preview-empty">No image selected</div>}</div>
                  <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
                    <div className="upload-title">Choose or replace image</div><div className="upload-help">Recommended: 1920×1080, JPG, PNG, or WEBP.</div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>

                  <label className="field-label">Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Slide ${selectedSlot} title`} />
                  <label className="field-label">Subtitle</label><textarea className="textarea" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Short slide subtitle or note" />
                  <label className="field-label">Link</label><input className="input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Redirect link e.g. /story/1" />

                  <div className="toggle-row">
                    <div><div className="toggle-title">Slide visibility</div><div className="toggle-help">{isActive ? 'Visible on homepage' : 'Hidden from homepage'}</div></div>
                    <button type="button" className={`switch ${isActive ? 'on' : ''}`} onClick={() => setIsActive((value) => !value)} aria-label="Toggle slide visibility"><span className="switch-thumb" /></button>
                  </div>

                  <div className="btn-row"><button className="btn-primary" onClick={handleSaveSlide} disabled={loading}>{loading ? 'Saving...' : `Save Slide ${selectedSlot}`}</button><button className="btn-secondary" type="button" onClick={handleResetForm}>Reset Form</button></div>
                  <div className="note-box">This UI is prepared for fixed 7-slot management. The current backend still saves a new record when replacing an image; the next backend update should make each slot save over its existing record.</div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
