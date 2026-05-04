const blockedUsers = [
  { name: 'SpamUser123', email: 'spam@email.com', reason: 'Spam / Bot activity', blockedDate: 'May 1, 2026', blockedBy: 'Sok' },
  { name: 'HateAccount99', email: 'hate@mail.com', reason: 'Hate speech in comments', blockedDate: 'Apr 28, 2026', blockedBy: 'Dev' },
  { name: 'FakeAuthor55', email: 'fake@test.com', reason: 'Content plagiarism', blockedDate: 'Apr 20, 2026', blockedBy: 'Xiaonai' },
];

export function BlockListPage() {
  return (
    <>
      <style>{baseStyles}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Block List</div>
            <div className="page-sub">Users who have been permanently blocked from the platform</div>
          </div>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Reason</th>
                <th>Blocked Date</th>
                <th>Blocked By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blockedUsers.map((user, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>🚫 {user.name}</td>
                  <td style={{ color: '#475569' }}>{user.email}</td>
                  <td style={{ color: '#EF4444', fontSize: '12.5px' }}>{user.reason}</td>
                  <td style={{ color: '#94A3B8', fontSize: '12.5px' }}>{user.blockedDate}</td>
                  <td style={{ color: '#475569' }}>{user.blockedBy}</td>
                  <td><button className="action-btn edit" style={{ background: '#F1F5F9', color: '#475569', border: 'none' }}>Unblock</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
