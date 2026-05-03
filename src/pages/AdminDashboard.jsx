import React, { useState } from 'react';

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
    --sidebar-collapsed: 80px;
    --sidebar-expanded: 260px;
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
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1000;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar::-webkit-scrollbar { width: 0px; }

  .sidebar:hover {
    width: var(--sidebar-expanded);
  }

  .sidebar-logo {
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
    padding-left: 10px;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  .sidebar:hover {
    box-shadow: 10px 0 30px rgba(0,0,0,0.02);
  }

  .sidebar:hover .logo-text {
    opacity: 1;
  }

  .nav-group-label {
    font-size: 10px;
    font-weight: 800;
    color: var(--text-muted);
    margin: 20px 0 8px 12px;
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
    min-height: 44px;
    padding: 0 12px;
    border-radius: 10px;
    color: var(--text-muted);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2px;
    white-space: nowrap;
    font-size: 14px;
  }

  .nav-item:hover, .nav-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }

  .nav-text {
    margin-left: 14px;
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
    height: 75px;
    background: #FFFFFF;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .content-body {
    padding: 30px 40px;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    animation: fadeIn 0.4s ease-out;
  }

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
    border: 1px solid var(--border);
    transition: transform 0.2s ease;
  }
  .stat-card:hover { transform: translateY(-3px); }

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
    border: 1px solid var(--border);
  }

  .mock-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 180px; padding-top: 20px; }
  .chart-bar { width: 10%; background: var(--primary-light); border-radius: 6px 6px 0 0; position: relative; transition: all 0.3s ease; }
  .chart-bar:hover { background: var(--primary); }
  .chart-bar.active { background: var(--primary); }
  .chart-bar span { position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%); font-size: 11px; color: var(--text-muted); font-weight: 600;}

  .log-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .log-item:last-child { border: none; }
  .log-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;}

  @media (max-width: 1024px) {
    .sidebar { display: none; }
    .bento-grid { grid-template-columns: 1fr; }
  }
`;

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '20px' }}>
    <path d={d} />
  </svg>
);

const AdminDashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentUserRole = 'Owner';

  const chartData = [
    { day: 'Mon', height: '40%' }, { day: 'Tue', height: '60%' },
    { day: 'Wed', height: '30%' }, { day: 'Thu', height: '80%' },
    { day: 'Fri', height: '50%' }, { day: 'Sat', height: '95%', active: true },
    { day: 'Sun', height: '70%' }
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-wrapper">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
            <div><h2 style={{ fontSize: '18px', fontWeight: '600' }}>Dashboard Overview</h2></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Search report..." style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '9px 14px 9px 38px', width: '280px', outline: 'none', fontSize: '14px' }} />
                <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <span style={{ position: 'absolute', top: '0', right: '1px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
              </div>
              <div style={{ position: 'relative' }}>
                <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <img src="https://ui-avatars.com/api/?name=Xiaonai+Xiao&background=4F46E5&color=fff&bold=true" alt="Admin" style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
                  <Icon d="M6 9l6 6 6-6" />
                </div>
                {showProfileMenu && (
                  <div style={{ position: 'absolute', top: '55px', right: '0', background: 'white', borderRadius: '14px', width: '200px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #F1F5F9' }}>
                      <p style={{ fontWeight: '700', fontSize: '13px' }}>Xiaonai Xiao</p>
                      <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>{currentUserRole}</p>
                    </div>
                    <div style={{ padding: '6px' }}>
                      <div style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>Settings</div>
                      <div style={{ padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#EF4444', fontWeight: '600' }}>Sign Out</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="content-body">
            <div className="stats-grid">
              <div className="stat-card">
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>TOTAL NOVELS</p>
                <h3 style={{ fontSize: '28px', fontWeight: '700' }}>1,248</h3>
                <p style={{ color: 'var(--success)', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>↑ 12 new this week</p>
              </div>
              <div className="stat-card">
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>ACTIVE READERS</p>
                <h3 style={{ fontSize: '28px', fontWeight: '700' }}>3,012</h3>
                <p style={{ color: 'var(--primary)', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>Live performance</p>
              </div>
              <div className="stat-card">
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>DAILY INCOME</p>
                <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success)' }}>$50.03</h3>
                <p style={{ color: 'var(--success)', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>Collected today</p>
              </div>
              <div className="stat-card">
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>PENDING REPORTS</p>
                <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger)' }}>05</h3>
                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>Attention required</p>
              </div>
            </div>

            <div className="bento-grid">
              <section className="card-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: '700' }}>Growth Analytics</h4>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>View Details</span>
                </div>
                <div className="mock-chart">
                  {chartData.map((data, index) => (
                    <div key={index} className={`chart-bar ${data.active ? 'active' : ''}`} style={{ height: data.height }}>
                      <span>{data.day}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card-panel">
                <h4 style={{ fontWeight: '700', marginBottom: '20px' }}>Admin Activity Log</h4>
                <div className="log-item">
                  <div className="log-avatar">S</div>
                  <div>
                    <p style={{ fontSize: '13px' }}><strong>Sok</strong> approved "Solo Leveling"</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>10 mins ago</p>
                  </div>
                </div>
                <div className="log-item">
                  <div className="log-avatar" style={{ background: '#6366f1' }}>D</div>
                  <div>
                    <p style={{ fontSize: '13px' }}><strong>Dev</strong> deleted reported comment</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1 hour ago</p>
                  </div>
                </div>
                <div className="log-item">
                  <div className="log-avatar" style={{ background: '#8b5cf6' }}>Y</div>
                  <div>
                    <p style={{ fontSize: '13px' }}><strong>You</strong> updated system rules</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>3 hours ago</p>
                  </div>
                </div>
              </section>
            </div>

            <section className="card-panel">
              <h4 style={{ fontWeight: '700', marginBottom: '20px' }}>Recently Published Novels</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 0' }}>Title</th>
                      <th style={{ padding: '12px 0' }}>Author</th>
                      <th style={{ padding: '12px 0' }}>Category</th>
                      <th style={{ padding: '12px 0' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '14px' }}>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 0', fontWeight: '600' }}>Solo Leveling: Ragnarok</td>
                      <td>Sung Jin</td>
                      <td>Fantasy</td>
                      <td><span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>LIVE</span></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 0', fontWeight: '600' }}>The CEO's Secret</td>
                      <td>LoveWriter</td>
                      <td>Romance</td>
                      <td><span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>LIVE</span></td>
                    </tr>
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
