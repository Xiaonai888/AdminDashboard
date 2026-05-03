import React, { useState } from 'react';

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
    --warning: #FFB547;
    --danger: #EE5D50;
    --danger-light: #FEEFEE;
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

  /* SIDEBAR STYLING */
  .sidebar {
    width: var(--sidebar-collapsed);
    background: var(--bg-card);
    display: flex;
    flex-direction: column;
    padding: 25px 14px;
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1000;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar::-webkit-scrollbar { width: 0px; }
  .sidebar:hover { width: var(--sidebar-expanded); }

  .sidebar-logo {
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
    padding-left: 10px;
  }

  .logo-text {
    font-size: 22px;
    font-weight: 800;
    color: var(--primary);
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  .sidebar:hover .logo-text { opacity: 1; }

  .nav-group-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    margin: 25px 0 12px 14px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .sidebar:hover .nav-group-label { opacity: 1; }

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
    font-size: 15px;
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

  .sidebar:hover .nav-text { opacity: 1; }

  /* MAIN CONTENT AREA */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .header {
    height: 85px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  /* SEARCH BAR (Professional Detail) */
  .search-container {
    background: var(--bg-card);
    border-radius: 30px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    width: 400px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
  }

  .search-bar {
    border: none;
    outline: none;
    background: transparent;
    margin-left: 12px;
    width: 100%;
    font-size: 14px;
    color: var(--text-main);
  }

  /* ROUND PROFILE */
  .profile-section {
    display: flex;
    align-items: center;
    gap: 20px;
    background: var(--bg-card);
    padding: 6px 10px 6px 20px;
    border-radius: 30px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
  }

  .profile-img-container {
    width: 40px;
    height: 40px;
    border-radius: 50%; /* Perfect Circle */
    overflow: hidden;
    cursor: pointer;
    border: 2px solid var(--primary-light);
  }

  /* DASHBOARD BODY */
  .content-body {
    padding: 0 40px 40px 40px;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    animation: fadeIn 0.5s ease-out;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 25px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
    border: 1px solid transparent;
  }

  /* GRAPH COLORS (Green/Red Logic) */
  .mock-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 200px; padding-top: 20px; }
  .chart-bar { 
    width: 10%; 
    border-radius: 10px 10px 0 0; 
    position: relative; 
    transition: all 0.3s ease; 
  }
  .bar-positive { background: var(--success); }
  .bar-negative { background: var(--danger); }
  .bar-muted { background: var(--primary-light); }
  
  .chart-bar span { position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 11px; color: var(--text-muted); font-weight: 600;}

  /* TABLES */
  .card-panel {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
    margin-bottom: 30px;
  }

  .table-live { width: 100%; border-collapse: collapse; }
  .table-live th { text-align: left; color: var(--text-muted); font-size: 13px; padding: 15px; border-bottom: 1px solid var(--border); }
  .table-live td { padding: 20px 15px; border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 600; }
  
  .public-badge {
    color: var(--success);
    font-weight: 700;
    margin-right: 8px;
  }

  .status-live {
    background: var(--success-light);
    color: var(--success);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
  }

  @media (max-width: 1024px) {
    .sidebar { display: none; }
    .bento-grid { grid-template-columns: 1fr; }
  }
`;

const Icon = ({ d, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: size }}>
    <path d={d} />
  </svg>
);

const AdminDashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Stats with color logic indicators
  const stats = [
    { label: "Total Novels", value: "1,248", trend: "+12 this week", color: "var(--success)" },
    { label: "Active Readers Today", value: "3,012", trend: "+15% vs yesterday", color: "var(--success)" },
    { label: "Daily Income", value: "$50.03", trend: "Trending up", color: "var(--success)" },
    { label: "Pending Reports", value: "05", trend: "Needs attention", color: "var(--warning)" }
  ];

  // Dynamic Graph Data (Example: height 90% is green, 30% is red)
  const chartData = [
    { day: 'Mon', h: '40%', status: 'muted' },
    { day: 'Tue', h: '60%', status: 'muted' },
    { day: 'Wed', h: '30%', status: 'negative' }, // Low = Red
    { day: 'Thu', h: '80%', status: 'muted' },
    { day: 'Fri', h: '50%', status: 'muted' },
    { day: 'Sat', h: '95%', status: 'positive' }, // High = Green
    { day: 'Sun', h: '70%', status: 'muted' }
  ];

  const novels = [
    { title: "Solo Leveling: Ragnarok", author: "Sung Jin", cat: "Fantasy", status: "LIVE" },
    { title: "The CEO's Secret", author: "LoveWriter", cat: "Romance", status: "LIVE" }
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        
        {/* FULL SIDEBAR MENU */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" color="var(--primary)" size={26} />
            <span className="logo-text">Shadow Exclusive</span>
          </div>

          <div className="nav-group-label">Overview</div>
          <div className="nav-item active"><Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><span className="nav-text">Dashboard</span></div>
          <div className="nav-item"><Icon d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /><span className="nav-text">Novels Content</span></div>
          <div className="nav-item"><Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><span className="nav-text">Authors Community</span></div>

          <div className="nav-group-label">Visual Media</div>
          <div className="nav-item"><Icon d="M2 3h20v14H2z M8 21h8 M12 17v4" /><span className="nav-text">Slide Section</span></div>
          <div className="nav-item"><Icon d="M3 3h18v18H3z M3 9h18 M9 3v18" /><span className="nav-text">Banner System</span></div>
          <div className="nav-item"><Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /><span className="nav-text">Advertisement</span></div>
          <div className="nav-item"><Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /><span className="nav-text">Recommended</span></div>

          <div className="nav-group-label">System Admin</div>
          <div className="nav-item"><Icon d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /><span className="nav-text">Category</span></div>
          <div className="nav-item"><Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><span className="nav-text">Rule</span></div>
          <div className="nav-item"><Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" /><span className="nav-text">Account</span></div>
          <div className="nav-item"><Icon d="M18.36 6.64L5.64 19.36m0-12.72l12.72 12.72M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><span className="nav-text">Block List</span></div>

          <div className="nav-group-label">Finance & Growth</div>
          <div className="nav-item"><Icon d="M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /><span className="nav-text">Income</span></div>
          <div className="nav-item"><Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /><span className="nav-text">History</span></div>
          <div className="nav-item"><Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3" /><span className="nav-text">Deposit</span></div>
          <div className="nav-item"><Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-10l5-5 5 5m-5-5v12" /><span className="nav-text">Withdraw</span></div>
          <div className="nav-item"><Icon d="M6 9H4.5a2.5 2.5 0 010-5H6 M18 9h1.5a2.5 2.5 0 000-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0012 0V2z" /><span className="nav-text">Ranking</span></div>
        </aside>

        <div className="main-content">
          <header className="header">
            <div className="search-container">
              <Icon d="M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35" color="var(--text-muted)" size={18} />
              <input type="text" className="search-bar" placeholder="Search authors, novels, reports..." />
            </div>
            
            <div className="profile-section">
              <div style={{ cursor: 'pointer' }}><Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" color="var(--text-muted)" /></div>
              <div className="profile-img-container" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <img src="https://ui-avatars.com/api/?name=Xiaonai+Xiao&background=4F46E5&color=fff&bold=true" alt="Admin" style={{ width: '100%', height: '100%' }} />
              </div>
              {showProfileMenu && (
                <div style={{ position: 'absolute', top: '75px', right: '40px', background: 'white', borderRadius: '15px', width: '220px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid var(--border)' }}><p style={{ fontWeight: '700', fontSize: '14px' }}>Xiaonai Xiao</p><p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Owner Account</p></div>
                  <div style={{ padding: '8px' }}>
                    <div style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>Settings</div>
                    <div style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: 'var(--danger)', fontWeight: '700' }}>Sign Out</div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="content-body">
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '25px', color: 'var(--text-main)' }}>Welcome back, Xiaonai! 👋</h1>
            
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>{s.label}</p>
                  <h3 style={{ fontSize: '32px', fontWeight: '800' }}>{s.value}</h3>
                  <p style={{ color: s.color, fontSize: '12px', fontWeight: '700', marginTop: '10px' }}>{s.trend}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <section className="card-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: '800', fontSize: '18px' }}>Reader Growth (Last 7 Days)</h4>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>View Report</span>
                </div>
                <div className="mock-chart">
                  {chartData.map((d, i) => (
                    <div key={i} 
                         className={`chart-bar bar-${d.status}`} 
                         style={{ height: d.h }}>
                      <span>{d.day}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card-panel">
                <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '25px' }}>Admin Activity Log</h4>
                {[ 
                  { n: 'Sok', a: 'approved "Solo Leveling"', t: '10m ago', c: 'var(--primary)' },
                  { n: 'Dev', a: 'deleted a comment', t: '1h ago', c: '#6366f1' },
                  { n: 'You', a: 'updated rules', t: '3h ago', c: '#8b5cf6' }
                ].map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: log.c, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>{log.n[0]}</div>
                    <div><p style={{ fontSize: '14px' }}><strong>{log.n}</strong> {log.a}</p><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.t}</p></div>
                  </div>
                ))}
              </section>
            </div>

            <section className="card-panel">
              <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '25px' }}>Recently Published Novels (Live)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="table-live">
                  <thead>
                    <tr><th>Novel Title</th><th>Author</th><th>Category</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {novels.map((n, i) => (
                      <tr key={i}>
                        <td><span className="public-badge">[Public]</span> {n.title}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{n.author}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{n.cat}</td>
                        <td><span className="status-live">LIVE</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
