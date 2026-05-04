const adminAccounts = [
  { name: 'Xiaonai Xiao', email: 'xiaonai@shadow.com', role: 'Owner', lastLogin: '2 mins ago', color: '#4F46E5' },
  { name: 'Sok Admin', email: 'sok@shadow.com', role: 'Admin', lastLogin: '10 mins ago', color: '#10B981' },
  { name: 'Dev Manager', email: 'dev@shadow.com', role: 'Admin', lastLogin: '1 hour ago', color: '#6366f1' },
  { name: 'Support1', email: 'support1@shadow.com', role: 'Moderator', lastLogin: '3 hours ago', color: '#F59E0B' },
];

export function AccountPage() {
  return (
    <>
      <style>{baseStyles + `
        .role-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
        .role-owner { background: #EDE9FE; color: #7C3AED; }
        .role-admin { background: var(--primary-light); color: var(--primary); }
        .role-moderator { background: #FEF3C7; color: #D97706; }
        .acc-name { display: flex; align-items: center; gap: 12px; }
        .acc-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }
      `}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Account Management</div>
            <div className="page-sub">Manage admin and moderator accounts</div>
          </div>
          <button className="btn-primary">+ Add Account</button>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminAccounts.map((acc, i) => (
                <tr key={i}>
                  <td>
                    <div className="acc-name">
                      <div className="acc-avatar" style={{ background: acc.color }}>{acc.name.charAt(0)}</div>
                      <span style={{ fontWeight: 600 }}>{acc.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#475569' }}>{acc.email}</td>
                  <td><span className={`role-badge role-${acc.role.toLowerCase()}`}>{acc.role}</span></td>
                  <td style={{ color: '#94A3B8', fontSize: '12.5px' }}>{acc.lastLogin}</td>
                  <td><span className="badge badge-active">Active</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit">Edit</button>
                      {acc.role !== 'Owner' && <button className="action-btn delete">Remove</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
