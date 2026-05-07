import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --bg-main: #F8FAFC;
    --bg-card: #FFFFFF;
    --primary: #4F46E5;
    --primary-light: #EEF2FF;
    --text-main: #0F172A;
    --text-muted: #64748B;
    --success: #10B981;
    --success-light: #D1FAE5;
    --danger: #EF4444;
    --danger-light: #FEE2E2;
    --warning: #F59E0B;
    --border: #E2E8F0;
    --sidebar-collapsed: 80px;
    --sidebar-expanded: 260px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-main); color: var(--text-main); }

  .dashboard-wrapper { display: flex; height: 100vh; background: var(--bg-main); overflow: hidden; }
  .sidebar {
    width: var(--sidebar-collapsed); background: var(--bg-card); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 20px 14px; transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
    position: relative; z-index: 1000; overflow-y: auto; overflow-x: hidden; flex-shrink: 0;
  }
  .sidebar:hover { width: var(--sidebar-expanded); box-shadow: 10px 0 30px rgba(0,0,0,0.04); }
  .sidebar-logo { min-height: 40px; display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding-left: 10px; }
  .logo-text { font-size: 18px; font-weight: 700; color: var(--primary); opacity: 0; transition: opacity 0.2s; white-space: nowrap; }
  .sidebar:hover .logo-text { opacity: 1; }
  .nav-group-label { font-size: 10px; font-weight: 800; color: var(--text-muted); margin: 20px 0 8px 12px; white-space: nowrap; opacity: 0; transition: opacity 0.2s; text-transform: uppercase; letter-spacing: 1px; }
  .sidebar:hover .nav-group-label { opacity: 1; }
  .nav-item { display: flex; align-items: center; min-height: 44px; padding: 0 12px; border-radius: 10px; color: var(--text-muted); font-weight: 500; cursor: pointer; transition: all 0.2s ease; margin-bottom: 2px; white-space: nowrap; font-size: 14px; }
  .nav-item:hover, .nav-item.active { background: var(--primary-light); color: var(--primary); }
  .nav-text { margin-left: 14px; opacity: 0; transition: opacity 0.2s; }
  .sidebar:hover .nav-text { opacity: 1; }

  .main-content { flex: 1; overflow-y: auto; }
  .header { height: 70px; background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 36px; position: sticky; top: 0; z-index: 100; }
  .header h2 { font-size: 17px; font-weight: 700; }
  .api-pill { font-size: 12px; color: var(--text-muted); background: #F1F5F9; border: 1px solid var(--border); padding: 8px 12px; border-radius: 999px; }
  .content-body { padding: 28px 36px 48px; max-width: 1500px; width: 100%; margin: 0 auto; }

  .page-title-row { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
  .page-title-row h1 { font-size: 24px; font-weight: 800; color: var(--text-main); }
  .page-title-row p { font-size: 13.5px; color: var(--text-muted); margin-top: 4px; }

  .slide-tabs { display: grid; grid-template-columns: repeat(7, minmax(78px, 1fr)); gap: 8px; background: var(--bg-card); padding: 10px; border-radius: 18px; margin-bottom: 22px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .tab-btn { padding: 13px 10px; border: none; background: #F8FAFC; color: var(--text-muted); border-radius: 12px; cursor: pointer; font-weight: 800; transition: 0.2s; }
  .tab-btn.active { background: var(--primary); color: #fff; box-shadow: 0 10px 22px rgba(79,70,229,0.2); }

  .grid { display: grid; grid-template-columns: minmax(360px, 0.9fr) minmax(480px, 1.4fr); gap: 22px; align-items: start; }
  .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .card-header { padding: 20px 22px; border-bottom: 1px solid var(--border); }
  .card-header h3 { font-size: 16px; font-weight: 800; }
  .card-header p { color: var(--text-muted); font-size: 12.5px; margin-top: 4px; }
  .form { padding: 22px; }

  .drop-zone { border: 2px dashed #CBD5E1; border-radius: 16px; padding: 26px; background: #F8FAFC; cursor: pointer; margin-bottom: 16px; text-align: center; transition: 0.2s; overflow: hidden; }
  .drop-zone:hover { border-color: var(--primary); background: var(--primary-light); }
  .preview-img { width: 100%; aspect-ratio: 16 / 9; border-radius: 14px; object-fit: cover; display: block; }
  .upload-title { color: var(--text-main); font-weight: 800; margin-top: 10px; }
  .upload-help { color: var(--text-muted); font-size: 12px; margin-top: 4px; }
  .input, .textarea { width: 100%; padding: 13px 14px; border-radius: 12px; border: 1px solid var(--border); outline: none; background: #F8FAFC; font-size: 14px; margin-bottom: 12px; font-family: inherit; }
  .textarea { min-height: 80px; resize: vertical; }
  .input:focus, .textarea:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
  .btn-create { width: 100%; border: none; border-radius: 13px; padding: 14px 18px; background: var(--primary); color: #fff; font-weight: 800; cursor: pointer; transition: 0.2s; }
  .btn-create:hover { transform: translateY(-1px); box-shadow: 0 12px 24px rgba(79,70,229,0.25); }
  .btn-create:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
  .message { padding: 12px 14px; border-radius: 12px; margin-bottom: 14px; font-size: 13px; font-weight: 700; }
  .message.success { background: var(--success-light); color: var(--success); }
  .message.error { background: var(--danger-light); color: var(--danger); }

  .inventory { padding: 12px; }
  .slide-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .slide-table th { text-align: left; padding: 12px; color: var(--text-muted); text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
  .slide-table td { padding: 12px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; font-weight: 600; }
  .thumb { width: 118px; aspect-ratio: 16/9; object-fit: cover; border-radius: 10px; background: #111; display: block; }
  .empty { padding: 48px 20px; text-align: center; color: var(--text-muted); }
  .badge { display: inline-flex; padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; background: var(--success-light); color: var(--success); }
  .small-muted { color: var(--text-muted); font-size: 12px; margin-top: 3px; }
  @media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } .slide-tabs { grid-template-columns: repeat(4, 1fr); } .content-body { padding: 22px 16px; } }
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

export default function SlideSection() {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(1);
  const [slides, setSlides] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('/story/1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchSlides = async () => {
    try {
      const res = await fetch(`${API_URL}/api/slides?section_key=home_top_slider`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to fetch slides');
      setSlides(data.slides || []);
    } catch (error) {
      setMessage({ type: 'error', text: `Cannot load slides: ${error.message}` });
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreateSlide = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please choose a slide image first.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('section_key', 'home_top_slider');
      formData.append('title', title || `Home Slide ${activeTab}`);
      formData.append('subtitle', subtitle);
      formData.append('link_url', linkUrl || '/');
      formData.append('order_index', String(activeTab));
      formData.append('is_active', 'true');

      const res = await fetch(`${API_URL}/api/slides`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || 'Failed to create slide');

      setMessage({ type: 'success', text: `Slide ${activeTab} created successfully.` });
      setTitle('');
      setSubtitle('');
      setSelectedFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchSlides();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const activeSlides = slides.filter((slide) => Number(slide.order_index) === activeTab);

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <header className="header">
            <h2>Slide Management</h2>
            <div className="api-pill">API: {API_URL}</div>
          </header>

          <main className="content-body">
            <div className="page-title-row">
              <div>
                <h1>Home Page Slides</h1>
                <p>Manage 7 homepage slides from your custom AdminDashboard. Images upload to Shadow-Backend → Supabase Storage.</p>
              </div>
            </div>

            <div className="slide-tabs">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button key={num} className={`tab-btn ${activeTab === num ? 'active' : ''}`} onClick={() => setActiveTab(num)}>
                  Slide {num}
                </button>
              ))}
            </div>

            <div className="grid">
              <section className="card">
                <div className="card-header">
                  <h3>Create / Replace Slide {activeTab}</h3>
                  <p>Recommended image size: 1920×1080 or 16:9.</p>
                </div>
                <div className="form">
                  {message && <div className={`message ${message.type}`}>{message.text}</div>}

                  <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
                    {previewUrl ? (
                      <img src={previewUrl} alt="Selected slide preview" className="preview-img" />
                    ) : (
                      <>
                        <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12" size={30} color="var(--text-muted)" />
                        <div className="upload-title">Click to choose image from device</div>
                        <div className="upload-help">JPG, PNG, WEBP up to backend limit.</div>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>

                  <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Slide ${activeTab} title`} />
                  <textarea className="textarea" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Slide subtitle / description" />
                  <input className="input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Redirect link e.g. /story/1" />

                  <button className="btn-create" onClick={handleCreateSlide} disabled={loading}>
                    {loading ? 'Uploading...' : `Create Slide ${activeTab}`}
                  </button>
                </div>
              </section>

              <section className="card">
                <div className="card-header">
                  <h3>Slide Center Inventory ({slides.length})</h3>
                  <p>Current selected tab has {activeSlides.length} slide record(s).</p>
                </div>
                <div className="inventory">
                  {slides.length === 0 ? (
                    <div className="empty">No slides yet. Create Slide {activeTab} first.</div>
                  ) : (
                    <table className="slide-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Preview</th>
                          <th>Title</th>
                          <th>Link</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slides.map((slide) => (
                          <tr key={slide.id}>
                            <td>{String(slide.order_index).padStart(2, '0')}</td>
                            <td><img src={slide.image_url} alt={slide.title || 'Slide'} className="thumb" /></td>
                            <td>
                              <div>{slide.title || 'Untitled slide'}</div>
                              <div className="small-muted">{slide.subtitle || 'No subtitle'}</div>
                            </td>
                            <td>{slide.link_url || '/'}</td>
                            <td><span className="badge">ACTIVE</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
