import React, { useState } from 'react';

// --- CSS សរសេរក្នុងនេះស្រាប់ ដើម្បីងាយស្រួលនិងមានចលនា ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

  .admin-bg {
    font-family: 'Poppins', sans-serif;
    background-color: #f4f6f8;
    min-height: 100vh;
    color: #1a1a1a;
  }
  
  /* Top Navigation Bar */
  .top-nav {
    background: #ffffff;
    padding: 15px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .nav-logo {
    font-size: 24px;
    font-weight: 700;
    color: #2c3e50;
    letter-spacing: 1px;
  }

  /* Main Container */
  .main-container {
    padding: 40px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Billboard Card */
  .billboard {
    background: #ffffff;
    border-radius: 24px;
    padding: 35px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
    margin-bottom: 50px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .billboard:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 50px rgba(0,0,0,0.08);
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px dashed #edf2f7;
    font-size: 15px;
    color: #4a5568;
    transition: background 0.2s ease;
  }
  .stat-row:hover {
    background: #f8fafc;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 8px;
  }
  .stat-value {
    font-weight: 600;
    color: #2d3748;
  }

  /* Grid Layout សម្រាប់កុំព្យូទ័រ និង ទូរសព្ទ */
  .menu-grid {
    display: grid;
    gap: 25px;
    grid-template-columns: repeat(2, 1fr); /* សម្រាប់ទូរសព្ទ: ២ ជួរ */
  }
  @media (min-width: 768px) {
    .menu-grid { grid-template-columns: repeat(3, 1fr); } /* Tablet: ៣ ជួរ */
  }
  @media (min-width: 1024px) {
    .menu-grid { grid-template-columns: repeat(4, 1fr); } /* កុំព្យូទ័រ Desktop: ៤ ជួរ */
  }
  @media (min-width: 1400px) {
    .menu-grid { grid-template-columns: repeat(5, 1fr); } /* អេក្រង់ធំ: ៥ ជួរ */
  }

  /* Menu Cards (ប៊ូតុងនីមួយៗ) */
  .menu-card {
    background: linear-gradient(135deg, #4b5563, #374151);
    border-radius: 20px;
    padding: 25px;
    color: white;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* តម្រឹមឆ្វេងទាំងអស់ */
    position: relative;
    overflow: hidden;
  }
  
  .menu-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }

  .menu-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
  }
  .menu-card:hover::after {
    opacity: 1; /* ពេលដាក់ Mouse ពីលើ ដូរពណ៌ទៅជាខៀវបែប Premium */
  }

  .card-content {
    position: relative;
    z-index: 2;
    width: 100%;
  }

  .icon-box {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    padding: 12px;
    border-radius: 14px;
    display: inline-flex;
    margin-bottom: 16px;
    transition: transform 0.3s ease;
  }
  .menu-card:hover .icon-box {
    transform: scale(1.1) rotate(5deg);
    background: rgba(255, 255, 255, 0.25);
  }

  .card-title {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
`;

// --- បណ្ដុំ SVG Icons អាជីព (ជំនួស Emoji) ---
const Icons = {
  Slide: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
  Banner: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
  Category: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  Advertisement: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Recommended: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  Rule: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Account: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Income: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  History: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Deposit: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  Withdraw: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3v4"></path><path d="M7 3v4"></path><rect x="3" y="11" width="18" height="10" rx="2"></rect></svg>,
  Block: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>,
  Ranking: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>,
};

const AdminDashboard = () => {
  const currentUserRole = 'Owner'; 
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const managementMenus = [
    { name: 'Slide', icon: Icons.Slide },
    { name: 'Banner', icon: Icons.Banner },
    { name: 'Category', icon: Icons.Category },
    { name: 'Advertisement', icon: Icons.Advertisement },
    { name: 'Recommended', icon: Icons.Recommended },
  ];

  const systemMenus = [
    { name: 'Rule', icon: Icons.Rule },
    { name: 'Account', icon: Icons.Account },
    { name: 'Income', icon: Icons.Income },
    { name: 'History', icon: Icons.History },
    { name: 'Deposit', icon: Icons.Deposit },
    { name: 'Withdraw', icon: Icons.Withdraw },
    { name: 'Block', icon: Icons.Block },
    { name: 'Ranking', icon: Icons.Ranking },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="admin-bg">
        
        {/* TOP NAVIGATION */}
        <div className="top-nav">
          <div className="nav-logo">Shadow Exclusive</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <svg width="24" height="24" fill="none" stroke="#4a5568" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid white' }}></span>
            </div>
            
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              ></div>

              {showProfileMenu && (
                <div style={{ 
                  position: 'absolute', top: '60px', right: '0', background: 'white', 
                  padding: '20px', borderRadius: '16px', width: '220px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 100 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#1e293b' }}></div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>Xiaonai Xiao</div>
                      <div style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '4px', fontWeight: '500' }}>
                        {currentUserRole}
                      </div>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '15px 0' }}/>
                  
                  {currentUserRole === 'Owner' && (
                    <div style={{ padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#f8fafc'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> 
                      Settings
                    </div>
                  )}
                  <div style={{ padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', borderRadius: '8px', transition: 'background 0.2s', marginTop: '5px' }} onMouseOver={(e) => e.target.style.background = '#fef2f2'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-container">
          
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '30px', color: '#1e293b' }}>Overview Dashboard</h2>
          
          <div className="billboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: '#64748b', fontWeight: '500' }}>
               <span>Team Active: <strong style={{color:'#0f172a'}}>2 Admins</strong></span>
               <span>Total Roles: <strong style={{color:'#0f172a'}}>5 Positions</strong></span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>All Time Metrics</h4>
                <div className="stat-row"><span>Total Novels</span><span className="stat-value">1,200</span></div>
                <div className="stat-row"><span>Completed</span><span className="stat-value">10</span></div>
                <div className="stat-row"><span>Total Authors</span><span className="stat-value">100</span></div>
                <div className="stat-row"><span>Total Readers</span><span className="stat-value">2,000</span></div>
                <div className="stat-row"><span>Total Online</span><span className="stat-value" style={{color: '#10b981'}}>3,000</span></div>
              </div>

              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>Today's Activity</h4>
                <div className="stat-row"><span>New Readers</span><span className="stat-value" style={{color: '#3b82f6'}}>+1,200</span></div>
                <div className="stat-row"><span>New Authors</span><span className="stat-value">+30</span></div>
                <div className="stat-row"><span>New Novels</span><span className="stat-value">+2</span></div>
                <div className="stat-row"><span>Episodes Updated</span><span className="stat-value">100</span></div>
                <div className="stat-row"><span>Pending Updates</span><span className="stat-value" style={{color: '#f59e0b'}}>1,000</span></div>
              </div>
            </div>

            <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>Gross Income Today</span>
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>$50.03</span>
            </div>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#334155' }}>Management</h3>
          <div className="menu-grid" style={{ marginBottom: '40px' }}>
            {managementMenus.map((menu, index) => (
              <div key={index} className="menu-card">
                <div className="card-content">
                  <div className="icon-box">{menu.icon}</div>
                  <div className="card-title">{menu.name}</div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#334155' }}>System & Finance</h3>
          <div className="menu-grid">
            {systemMenus.map((menu, index) => (
              <div key={index + 'sys'} className="menu-card">
                <div className="card-content">
                  <div className="icon-box">{menu.icon}</div>
                  <div className="card-title">{menu.name}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
