const withdrawals = [
  { id: '#WD-001', author: 'Sung Jin', amount: '$800.00', method: 'PayPal', requestDate: 'May 3, 2026', status: 'pending' },
  { id: '#WD-002', author: 'ProsaRose', amount: '$1,200.00', method: 'Bank Transfer', requestDate: 'May 2, 2026', status: 'approved' },
  { id: '#WD-003', author: 'LoveWriter', amount: '$450.00', method: 'PayPal', requestDate: 'Apr 30, 2026', status: 'approved' },
];

export function WithdrawPage() {
  return (
    <>
      <style>{baseStyles + `
        .badge-approved { background: var(--success-light); color: var(--success); }
        .badge-pending { background: #FEF3C7; color: #D97706; }
        .approve-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; background: var(--success-light); color: var(--success); font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Withdrawal Requests</div>
            <div className="page-sub">Review and approve author withdrawal requests</div>
          </div>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Author</th><th>Amount</th><th>Method</th><th>Request Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748B' }}>{w.id}</td>
                  <td style={{ fontWeight: 600 }}>{w.author}</td>
                  <td style={{ fontWeight: 700, color: '#4F46E5' }}>{w.amount}</td>
                  <td style={{ color: '#475569' }}>{w.method}</td>
                  <td style={{ color: '#94A3B8', fontSize: '12.5px' }}>{w.requestDate}</td>
                  <td><span className={`badge badge-${w.status}`}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</span></td>
                  <td>{w.status === 'pending' && <button className="approve-btn">Approve</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
