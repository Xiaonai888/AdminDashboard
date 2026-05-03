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
          
          {/* HEADER */}
          <div className="header">
            <div>
               <h2 style={{ fontSize: '20px' }}>Welcome back, Xiaonai! 👋</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <input type="text" className="search-bar" placeholder="Search authors, novels, reports..." />
              
              <svg width="24" height="24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              
              {/* PROFILE DROPDOWN (Keep your logical structure) */}
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  XX
                </div>
                {showProfileMenu && (
                  <div style={{ position: 'absolute', top: '55px', right: '0', background: 'white', padding: '16px', borderRadius: '12px', width: '200px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 'bold' }}>Xiaonai</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Role: <span style={{ color: 'var(--primary)'}}>{currentUserRole}</span></div>
                    {currentUserRole === 'Owner' && <div style={{ padding: '8px 0', cursor: 'pointer' }}>⚙️ Settings</div>}
                    <div style={{ padding: '8px 0', cursor: 'pointer', color: 'var(--danger)' }}>🚪 Logout</div>
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
