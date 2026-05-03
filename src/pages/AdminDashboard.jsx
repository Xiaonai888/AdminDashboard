import React, { useState } from 'react';

// === CSS ដ៏ប្រណិត និង Responsive ===
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
    --warning: #F59E0B;
    --danger: #EF4444;
    --border: #E2E8F0;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dashboard-wrapper {
    display: flex;
    height: 100vh;
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-main);
    color: var(--text-main);
    overflow: hidden;
  }

  /* === SIDEBAR (Desktop) === */
  .sidebar {
    width: 280px;
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 24px;
    transition: all 0.3s ease;
  }
  .sidebar-logo {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 12px;
    color: var(--text-muted);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 8px;
  }
  .nav-item:hover, .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }

  /* === MAIN CONTENT === */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  /* Header */
  .header {
    height: 80px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .search-bar {
    background: var(--bg-main);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 10px 20px;
    width: 300px;
    outline: none;
    font-family: 'Inter';
    transition: border 0.3s ease;
  }
  .search-bar:focus { border-color: var(--primary); }

  /* Content Body */
  .content-body {
    padding: 40px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Stat Cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }
  .stat-card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(226, 232, 240, 0.5);
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: transform 0.2s ease;
  }
  .stat-card:hover { transform: translateY(-3px); }
  .stat-title { color: var(--text-muted); font-size: 14px; font-weight: 500; }
  .stat-value { font-size: 28px; font-weight: 700; color: var(--text-main); }
  .stat-trend { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
  .trend-up { color: var(--success); }

  /* Charts & Logs Grid */
  .bento-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }
  .card-panel {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border);
  }
  .panel-header { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: var(--text-main); display:flex; justify-content: space-between;}

  /* CSS Mock Chart */
  .mock-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 180px; padding-top: 20px; }
  .chart-bar { width: 12%; background: var(--primary-light); border-radius: 6px 6px 0 0; position: relative; transition: height 1s ease; }
  .chart-bar.active { background: var(--primary); }
  .chart-bar span { position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 12px; color: var(--text-muted); }

  /* Admin Log Table */
  .log-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .log-item:last-child { border: none; padding-bottom: 0; }
  .log-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;}
  .log-text { font-size: 14px; }
  .log-time { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

  /* === MOBILE RESPONSIVE (ទូរសព្ទ) === */
  .mobile-menu-grid { display: none; }
  
  @media (max-width: 1024px) {
    .dashboard-wrapper { flex-direction: column; overflow-y: auto; }
    .sidebar { display: none; } /* លាក់ Sidebar លើទូរសព្ទ */
    .header { padding: 0 20px; }
    .search-bar { display: none; }
    .content-body { padding: 20px; }
    .bento-grid { grid-template-columns: 1fr; }
    
    /* បង្ហាញ Grid Menu ដូច Design របស់អ្នកលើទូរសព្ទ */
    .mobile-menu-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .mobile-menu-item {
      background: linear-gradient(135deg, #475569, #334155);
      border-radius: 16px;
      padding: 20px;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  }
`;

// === Icons ===
const Icon = ({ path }) => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const AdminDashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentUserRole = 'Owner';

  // ទិន្នន័យ Mock សម្រាប់ Chart
  const chartData = [
    { day: 'Mon', height: '40%' }, { day: 'Tue', height: '60%' },
    { day: 'Wed', height: '30%' }, { day: 'Thu', height: '80%' },
    { day: 'Fri', height: '50%' }, { day: 'Sat', height: '90%', active: true },
    { day: 'Sun', height: '70%' }
  ];

  // ទិន្នន័យកំណត់ហេតុ Admin (Audit Log)
  const adminLogs = [
    { name: 'Sok', action: 'Approved novel "Solo Leveling"', time: '10 mins ago' },
    { name: 'Dev', action: 'Deleted reported comment', time: '1 hour ago' },
    { name: 'You', action: 'Updated system rules', time: '3 hours ago' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        
        {/* === SIDEBAR FOR DESKTOP === */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--primary)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Shadow
          </div>
          
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '15px', marginTop: '10px' }}>MAIN MENU</div>
          <div className="nav-item active"><Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> Dashboard</div>
          <div className="nav-item"><Icon path="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /> Novels & Content</div>
          <div className="nav-item"><Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> Users & Authors</div>
          
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '15px', marginTop: '30px' }}>MANAGEMENT</div>
          <div className="nav-item"><Icon path="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> Revenue & Finance</div>
          <div className="nav-item"><Icon path="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" /> System Reports</div>
          <div className="nav-item"><Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> Roles & Security</div>
        </div>

        {/* === MAIN CONTENT AREA === */}
        <div className="main-content">
          
          <div className="header" style={{
            height: '80px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'sticky',
            top: '0',
            zIndex: '100'
          }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A', letterSpacing: '-0.02em' }}>
                Welcome back, Xiaonai! 👋
              </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="search-bar" 
                  placeholder="Search anything..." 
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '10px 16px 10px 40px',
                    width: '320px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                />
                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              <div style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '10px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                <svg width="22" height="22" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span style={{ 
                  position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', 
                  background: '#EF4444', borderRadius: '50%', border: '2px solid white',
                  animation: 'pulse 2s infinite' 
                }}></span>
              </div>

              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px', 
                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '10px', 
                      background: '#4F46E5', overflow: 'hidden', border: '2px solid #E2E8F0' 
                    }}>
                      <img src="https://ui-avatars.com/api/?name=Xiaonai+Xiao&background=4F46E5&color=fff&bold=true" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ 
                      position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', 
                      background: '#10B981', borderRadius: '50%', border: '2px solid white' 
                    }}></span>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>

                {showProfileMenu && (
                  <div style={{ 
                    position: 'absolute', top: '60px', right: '0', background: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)', borderRadius: '16px', width: '240px', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: '1000',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
                      <p style={{ fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>Xiaonai Xiao</p>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>xiaonai888@gmail.com</p>
                      <div style={{ 
                        marginTop: '10px', display: 'inline-block', padding: '2px 8px', 
                        borderRadius: '6px', background: '#EEF2FF', color: '#4F46E5', 
                        fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
                      }}>
                        {currentUserRole}
                      </div>
                    </div>
                    
                    <div style={{ padding: '8px' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontSize: '14px', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#4F46E5'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        My Profile
                      </div>
                      {currentUserRole === 'Owner' && (
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontSize: '14px', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#4F46E5'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                          System Settings
                        </div>
                      )}
                      <div style={{ height: '1px', background: '#F1F5F9', margin: '8px 4px' }}></div>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#EF4444', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sign Out
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTENT BODY */}
          <div className="content-body">
            
            {/* GRID MENU សម្រាប់តែទូរសព្ទ (លាក់នៅលើកុំព្យូទ័រ) */}
            <div className="mobile-menu-grid">
               <div className="mobile-menu-item"><Icon path="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /><span>Novels</span></div>
               <div className="mobile-menu-item"><Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><span>Users</span></div>
               <div className="mobile-menu-item"><Icon path="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /><span>Income</span></div>
               <div className="mobile-menu-item"><Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><span>Rules</span></div>
            </div>

            {/* TOP STAT CARDS */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-title">Total Novels</div>
                <div className="stat-value">1,248</div>
                <div className="stat-trend trend-up"><Icon path="M23 6l-9.5 9.5-5-5L1 18" /> +12 this week</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Active Readers Today</div>
                <div className="stat-value">3,012</div>
                <div className="stat-trend trend-up"><Icon path="M23 6l-9.5 9.5-5-5L1 18" /> +15% vs yesterday</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Daily Income</div>
                <div className="stat-value" style={{color: 'var(--success)'}}>$50.03</div>
                <div className="stat-trend trend-up"><Icon path="M23 6l-9.5 9.5-5-5L1 18" /> Trending up</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Pending Reports</div>
                <div className="stat-value" style={{color: 'var(--warning)'}}>5</div>
                <div className="stat-trend" style={{color: 'var(--text-muted)'}}>Needs attention</div>
              </div>
            </div>

            {/* CHARTS & LOGS */}
            <div className="bento-grid">
              
              {/* Left Column: Chart */}
              <div className="card-panel">
                <div className="panel-header">
                  <span>Reader Growth (Last 7 Days)</span>
                  <span style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer' }}>View Report</span>
                </div>
                <div className="mock-chart">
                  {chartData.map((data, index) => (
                    <div key={index} className={`chart-bar ${data.active ? 'active' : ''}`} style={{ height: data.height }}>
                      <span>{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Admin Activity Log */}
              <div className="card-panel">
                <div className="panel-header">Admin Activity Log</div>
                <div>
                  {adminLogs.map((log, index) => (
                    <div key={index} className="log-item">
                      <div className="log-avatar">{log.name.charAt(0)}</div>
                      <div>
                        <div className="log-text"><strong style={{color: 'var(--primary)'}}>{log.name}</strong> {log.action}</div>
                        <div className="log-time">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{ width: '100%', padding: '10px', marginTop: '16px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  View All Logs
                </button>
              </div>

            </div>

            {/* RECENT UPLOADS TABLE */}
            <div className="card-panel">
               <div className="panel-header">Recently Published Novels (Live)</div>
               <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                       <th style={{ padding: '12px 0' }}>Novel Title</th>
                       <th style={{ padding: '12px 0' }}>Author</th>
                       <th style={{ padding: '12px 0' }}>Category</th>
                       <th style={{ padding: '12px 0' }}>Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                       <td style={{ padding: '16px 0', fontWeight: '500' }}>Solo Leveling: Ragnarok</td>
                       <td>Sung Jin</td>
                       <td>Action / Fantasy</td>
                       <td><span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Published</span></td>
                     </tr>
                     <tr>
                       <td style={{ padding: '16px 0', fontWeight: '500' }}>The CEO's Secret</td>
                       <td>LoveWriter</td>
                       <td>Romance</td>
                       <td><span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Published</span></td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
