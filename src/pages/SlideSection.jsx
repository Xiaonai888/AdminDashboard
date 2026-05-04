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
    width: 280px;
    background: var(--bg-card);
    display: flex;
    flex-direction: column;
    padding: 25px 14px;
    border-right: 1px solid var(--border);
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
    text-decoration: none;
  }

  .nav-item:hover, .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
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
  }

  .content-body { padding: 0 40px 40px 40px; width: 100%; margin: 0 auto; }

  /* SLIDE TABS */
  .slide-tabs {
    display: flex;
    background: white;
    padding: 10px;
    border-radius: 15px;
    margin-bottom: 25px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
  }

  .tab-btn {
    flex: 1;
    padding: 12px;
    border: none;
    background: none;
    font-weight: 700;
    color: var(--text-muted);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: 0.3s;
  }

  .tab-btn.active {
    color: var(--primary);
    border-bottom: 3px solid var(--primary);
  }

  /* UPLOAD CARD */
  .upload-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
    margin-bottom: 40px;
  }

  .drop-zone {
    border: 2px dashed var(--border);
    border-radius: 20px;
    padding: 40px;
    background: #F8FAFC;
    cursor: pointer;
    margin-bottom: 20px;
    transition: 0.3s;
  }

  .drop-zone:hover { border-color: var(--primary); background: var(--primary-light); }

  .input-link {
    width: 100%;
    padding: 15px 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: #F8FAFC;
    margin-bottom: 20px;
    outline: none;
  }

  .btn-create {
    background: var(--primary);
    color: white;
    border: none;
    padding: 14px 40px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0px 10px 20px rgba(79, 70, 229, 0.2);
  }

  /* TABLE */
  .slide-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
  }

  .slide-table th {
    text-align: left;
    padding: 20px;
    background: #F8FAFC;
    color: var(--text-muted);
    font-size: 13px;
    text-transform: uppercase;
  }

  .slide-table td {
    padding: 20px;
    border-bottom: 1px solid var(--border);
    font-weight: 600;
    font-size: 14px;
  }

  .img-preview {
    width: 120px;
    height: 65px;
    background: #000;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 11px;
  }

  .badge-active {
    background: var(--success);
    color: white;
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 12px;
  }

  .action-group { display: flex; gap: 10px; }
  .btn-edit { background: #4F46E5; color: white; border: none; padding: 6px 15px; border-radius: 8px; cursor: pointer; }
  .btn-delete { background: #EF4444; color: white; border: none; padding: 6px 15px; border-radius: 8px; cursor: pointer; }
`;

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
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#4F46E5', marginBottom: '40px' }}>Shadow</div>
          <div className="nav-item" onClick={() => navigate('/admin')}>Dashboard</div>
          <div className="nav-item active">Slide Section</div>
          <div className="nav-item">Novels Content</div>
        </aside>

        <div className="main-content">
          <header className="header">
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Slide Center Management</h2>
            <div style={{ background: '#4F46E5', color: 'white', padding: '8px 15px', borderRadius: '50%', fontWeight: 'bold' }}>XX</div>
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
              <h3 style={{ marginBottom: '20px', textAlign: 'left' }}>Upload Slide {activeTab}</h3>
              <div className="drop-zone">
                <p style={{ color: var(--text-muted), fontWeight: '600' }}>Upload Picture (1920x1080 Recommended)</p>
              </div>
              <input type="text" className="input-link" placeholder="Paste link destination here..." />
              <div style={{ textAlign: 'left' }}>
                <button className="btn-create">Create Slide {activeTab}</button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Slide Center (07)</h2>
            </div>

            <table className="slide-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Slide Preview</th>
                  <th>Date Created</th>
                  <th>Last Update</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {slideList.map((slide) => (
                  <tr key={slide.id}>
                    <td>{slide.id}</td>
                    <td><div className="img-preview">Slide Pic {slide.id}</div></td>
                    <td>{slide.date}</td>
                    <td>{slide.date}</td>
                    <td><span className="badge-active">{slide.status}</span></td>
                    <td>
                      <div className="action-group">
                        <button className="btn-edit">Edit</button>
                        <button className="btn-delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        </div>
      </div>
    </>
  );
};

export default SlideSection;
