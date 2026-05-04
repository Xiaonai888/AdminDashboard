import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --bg-main: #F4F7FE;
    --bg-card: #FFFFFF;
    --primary: #4F46E5;
    --primary-light: #F0F3FF;
    --text-main: #1B2559;
    --text-muted: #A3AED0;
    --success: #05CD99;
    --success-light: #E6F9F4;
    --danger: #EE5D50;
    --border: #E9EDF7;
    --sidebar-collapsed: 80px;
    --sidebar-expanded: 280px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dashboard-wrapper {
    display: flex;
    height: 100vh;
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-main);
    color: var(--text-main);
    overflow: hidden;
  }

  .sidebar {
    width: var(--sidebar-collapsed);
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 20px 14px;
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1000;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar::-webkit-scrollbar { width: 0px; }

  .sidebar:hover {
    width: var(--sidebar-expanded);
    box-shadow: 10px 0 30px rgba(0,0,0,0.02);
  }

  .sidebar-logo {
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
    padding-left: 10px;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 800;
    color: var(--primary);
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  .sidebar:hover .logo-text {
    opacity: 1;
  }

  .nav-group-label {
    font-size: 10px;
    font-weight: 800;
    color: var(--text-muted);
    margin: 25px 0 10px 10px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .sidebar:hover .nav-group-label {
    opacity: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    min-height: 50px;
    padding: 0 14px;
    border-radius: 15px;
    color: var(--text-muted);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 4px;
    white-space: nowrap;
    text-decoration: none;
  }

  .nav-item:hover, .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }

  .nav-text {
    margin-left: 15px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .sidebar:hover .nav-text {
    opacity: 1;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .header {
    height: 85px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    background: transparent;
  }

  .profile-section {
    display: flex;
    align-items: center;
    gap: 15px;
    background: var(--bg-card);
    padding: 6px 10px 6px 20px;
    border-radius: 30px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
  }

  .avatar-round {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--primary-light);
    object-fit: cover;
  }

  .content-body { 
    padding: 0 40px 40px 40px; 
    width: 100%; 
    margin: 0 auto; 
    max-width: 1400px;
    animation: fadeIn 0.5s ease-out;
  }

  .slide-tabs {
    display: flex;
    background: var(--bg-card);
    padding: 10px;
    border-radius: 20px;
    margin-bottom: 25px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
    overflow-x: auto;
  }

  .tab-btn {
    flex: 1;
    min-width: 100px;
    padding: 14px;
    border: none;
    background: none;
    font-weight: 700;
    color: var(--text-muted);
    cursor: pointer;
    transition: 0.3s;
    border-radius: 12px;
  }

  .tab-btn.active {
    color: var(--primary);
    background: var(--primary-light);
  }

  .upload-card {
    background: var(--bg-card);
    border-radius: 24px;
    padding: 40px;
    text-align: center;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
    margin-bottom: 40px;
  }

  .drop-zone {
    border: 2px dashed var(--border);
    border-radius: 20px;
    padding: 60px;
    background: #F8FAFC;
    cursor: pointer;
    margin-bottom: 25px;
    transition: 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .drop-zone:hover { border-color: var(--primary); background: var(--primary-light); }

  .input-link {
    width: 100%;
    padding: 18px 25px;
    border-radius: 15px;
    border: 1px solid var(--border);
    background: #F8FAFC;
    margin-bottom: 25px;
    outline: none;
    font-size: 15px;
    transition: 0.3s;
  }

  .input-link:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px var(--primary-light); }

  .btn-create {
    background: var(--primary);
    color: white;
    border: none;
    padding: 16px 50px;
    border-radius: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0px 10px 25px rgba(79, 70, 229, 0.25);
    transition: 0.3s;
  }

  .btn-create:hover { transform: translateY(-2px); box-shadow: 0px 15px 30px rgba(79, 70, 229, 0.35); }

  .section-title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 30px;
    text-align: center;
    color: var(--text-main);
  }

  .slide-table-container {
    background: var(--bg-card);
    border-radius: 24px;
    padding: 20px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
  }

  .slide-table {
    width: 100%;
    border-collapse: collapse;
  }

  .slide-table th {
    text-align: left;
    padding: 20px;
    color: var(--text-muted);
    font-size: 13px;
    text-transform: uppercase;
    font-weight: 700;
    border-bottom: 1px solid var(--border);
  }

  .slide-table td {
    padding: 20px;
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    font-size: 14px;
    color: var(--text-main);
  }

  .img-preview-box {
    width: 130px;
    height: 70px;
    background: #111;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 11px;
    border: 2px solid var(--border);
    overflow: hidden;
  }

  .badge-active {
    background: var(--success-light);
    color: var(--success);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 800;
  }

  .action-group { display: flex; gap: 10px; }
  .btn-action { 
    padding: 8px 16px; 
    border-radius: 10px; 
    border: none; 
    font-weight: 700; 
    cursor: pointer; 
    font-size: 13px;
    transition: 0.2s;
  }
  .btn-edit { background: var(--primary-light); color: var(--primary); }
  .btn-delete { background: var(--danger-light); color: var(--danger); }
  .btn-action:hover { opacity: 0.8; }
`;

const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: size }}>
    <path d={d} />
  </svg>
);

const SlideSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  
  const slideList = [
    { id: 1, date: '28-11-2024', status: 'Active' },
    { id: 2, date: '28-11-2024', status: 'Active' },
    { id: 3, date: '28-11-2024', status: 'Active' },
    { id: 4, date: '28-11-2024', status: 'Active' },
    { id: 5, date: '28-11-2024', status: 'Active' },
    { id: 6, date: '28-11-2024', status: 'Active' },
    { id: 7, date: '28-11-2024', status: 'Active' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="var(--primary)" size={24} />
            <span className="logo-text">Shadow Exclusive</span>
          </div>

          <div className="nav-group-label">Overview</div>
          <div className="nav-item" onClick={() => navigate('/admin')}>
            <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <span className="nav-text">Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/novels')}>
            <Icon d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            <span className="nav-text">Novels Content</span>
          </div>

          <div className="nav-group-label">Visual Media</div>
          <div className="nav-item active">
            <Icon d="M2 3h20v14H2z M8 21h8 M12 17v4" />
            <span className="nav-text">Slide Section</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/banners')}>
            <Icon d="M3 3h18v18H3z M3 9h18 M9 3v18" />
            <span className="nav-text">Banner System</span>
          </div>

          <div className="nav-group-label">System Admin</div>
          <div className="nav-item" onClick={() => navigate('/category')}>
            <Icon d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            <span className="nav-text">Category</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/rule')}>
            <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <span className="nav-text">Rule</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/account')}>
            <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" />
            <span className="nav-text">Account</span>
          </div>

          <div className="nav-group-label">Finance</div>
          <div className="nav-item" onClick={() => navigate('/income')}>
            <Icon d="M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            <span className="nav-text">Income</span>
          </div>
        </aside>

        <div className="main-content">
          <header className="header">
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>Slide Management</h2>
            <div className="profile-section">
               <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" color="var(--text-muted)" />
               <img src="https://ui-avatars.com/api/?name=Xiaonai+Xiao&background=4F46E5&color=fff&bold=true" className="avatar-round" alt="Admin" />
            </div>
          </header>

          <main className="content-body">
            <div className="slide-tabs">
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <button 
                  key={num} 
                  className={`tab-btn ${activeTab === num ? 'active' : ''}`}
                  onClick={() => setActiveTab(num)}
                >
                  Slide {num}
                </button>
              ))}
            </div>

            <div className="upload-card">
              <h3 style={{ marginBottom: '25px', textAlign: 'left', fontWeight: '800', color: 'var(--text-main)' }}>Home Page Settings</h3>
              <div className="drop-zone">
                <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" size={30} color="var(--text-muted)" />
                <p style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Click or drag to upload picture</p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Recommended: 1920x1080px)</span>
              </div>
              <input type="text" className="input-link" placeholder="Enter redirect destination link..." />
              <div style={{ textAlign: 'left' }}>
                <button className="btn-create">Create Slide {activeTab}</button>
              </div>
            </div>

            <h2 className="section-title">Slide Center Inventory (07)</h2>

            <div className="slide-table-container">
              <table className="slide-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Preview</th>
                    <th>Date Created</th>
                    <th>Last Update</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slideList.map((slide) => (
                    <tr key={slide.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{slide.id < 10 ? `0${slide.id}` : slide.id}</td>
                      <td>
                        <div className="img-preview-box">
                          Slide Image {slide.id}
                        </div>
                      </td>
                      <td>{slide.date}</td>
                      <td>{slide.date}</td>
                      <td><span className="badge-active">ACTIVE</span></td>
                      <td>
                        <div className="action-group">
                          <button className="btn-action btn-edit">Edit</button>
                          <button className="btn-action btn-delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SlideSection;
