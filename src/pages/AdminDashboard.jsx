import React, { useState } from 'react';

const AdminDashboard = () => {
  // ឧទាហរណ៍: កំណត់សិទ្ធិសាកល្បង ('Owner' ឬ 'Admin')
  const currentUserRole = 'Owner'; 
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ទិន្នន័យសម្រាប់ Grid Menu ទាំងពីរផ្នែក
  const managementMenus = [
    { name: 'Slide', icon: '📺' },
    { name: 'Banner', icon: '🖼️' },
    { name: 'Category', icon: '📁' },
    { name: 'Advertisement', icon: '📢' },
    { name: 'Recommended', icon: '⭐' },
  ];

  const systemMenus = [
    { name: 'Rule', icon: '🛡️' },
    { name: 'Account', icon: '👤' },
    { name: 'Income', icon: '💰' },
    { name: 'History', icon: '☂️' },
    { name: 'Deposit', icon: '📥' },
    { name: 'Withdraw', icon: '📤' },
    { name: 'Block', icon: '🚫' },
    { name: 'Ranking', icon: '🏆' },
  ];

  return (
    <div style={{ backgroundColor: '#E5E5E5', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER (Notification & Profile) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <span style={{ fontSize: '24px', cursor: 'pointer' }}>🔔</span>
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'black', cursor: 'pointer' }}
          ></div>

          {/* PROFILE DROPDOWN MENU */}
          {showProfileMenu && (
            <div style={{ 
              position: 'absolute', top: '50px', right: '0', backgroundColor: 'white', 
              padding: '20px', borderRadius: '15px', width: '200px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'black' }}></div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>User name</div>
                  <div style={{ fontSize: '12px', backgroundColor: 'black', color: 'white', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>
                    {currentUserRole}
                  </div>
                </div>
              </div>
              
              {/* បង្ហាញ Setting តែសម្រាប់ Owner */}
              {currentUserRole === 'Owner' && (
                <div style={{ padding: '10px 0', cursor: 'pointer', display: 'flex', gap: '10px' }}>
                  ⚙️ Setting
                </div>
              )}
              <div style={{ padding: '10px 0', cursor: 'pointer', display: 'flex', gap: '10px', color: 'black' }}>
                🚪 Log out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BILLBOARD INFORMATION */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>BILLBOARD INFORMATION</h2>
      </div>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
           <span>Total Admin = 2</span>
           <span>All positions = 5</span>
        </div>
        <hr style={{ border: '1px solid black', marginBottom: '20px' }}/>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* ALL TIME COLUMN */}
          <div style={{ width: '45%' }}>
            <h4 style={{ marginBottom: '15px' }}>All time</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Total Novel</span><span>1200</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Total complete</span><span>10</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Total Authors</span><span>100</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Total Readers</span><span>2000</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Total Online</span><span>3000</span></div>
          </div>

          {/* TODAY COLUMN */}
          <div style={{ width: '45%' }}>
            <h4 style={{ marginBottom: '15px' }}>Today</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>New Reader</span><span>1200</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>New Author</span><span>30</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>New Novel</span><span>02</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Updated Episode</span><span>100</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Not Updated Story</span><span>1000</span></div>
          </div>
        </div>

        <hr style={{ border: '1px solid black', marginTop: '20px', marginBottom: '20px' }}/>
        <h3 style={{ margin: 0 }}>Total income today : 50.03$</h3>
      </div>

      {/* GRID MENUS (ប៊ូតុងគ្រប់គ្រង) */}
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        
        {/* បង្ហាញម៉ឺនុយផ្នែកទី ១ (Slide, Banner...) */}
        {managementMenus.map((menu, index) => (
          <div key={index} style={{ backgroundColor: '#6C7A86', color: 'white', padding: '30px', borderRadius: '5px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <span style={{ fontSize: '30px', marginBottom: '10px' }}>{menu.icon}</span>
             <span style={{ fontSize: '18px' }}>{menu.name}</span>
          </div>
        ))}

        {/* បង្ហាញម៉ឺនុយផ្នែកទី ២ (Rule, Account...) */}
        {systemMenus.map((menu, index) => (
          <div key={index + 'sys'} style={{ backgroundColor: '#6C7A86', color: 'white', padding: '30px', borderRadius: '5px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <span style={{ fontSize: '30px', marginBottom: '10px', textAlign: 'center' }}>{menu.icon}</span>
             <span style={{ fontSize: '18px', textAlign: 'center' }}>{menu.name}</span>
          </div>
        ))}

      </div>

    </div>
  );
};

export default AdminDashboard;
