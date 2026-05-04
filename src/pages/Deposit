const deposits = [
  { id: '#DEP-001', user: 'Reader_AA', amount: '$20.00', method: 'PayPal', date: 'May 3, 2026', status: 'success' },
  { id: '#DEP-002', user: 'Reader_BB', amount: '$50.00', method: 'Credit Card', date: 'May 3, 2026', status: 'success' },
  { id: '#DEP-003', user: 'Reader_CC', amount: '$10.00', method: 'PayPal', date: 'May 2, 2026', status: 'pending' },
  { id: '#DEP-004', user: 'Reader_DD', amount: '$15.00', method: 'Bank Transfer', date: 'May 1, 2026', status: 'failed' },
];

export function DepositPage() {
  return (
    <>
      <style>{baseStyles + `
        .badge-success { background: var(--success-light); color: var(--success); }
        .badge-pending { background: #FEF3C7; color: #D97706; }
        .badge-failed { background: #FEE2E2; color: #EF4444; }
        .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
        .summary-card { background: var(--bg-card); border-radius: 12px; padding: 18px 20px; border: 1px solid var(--border); }
        .summary-label { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; }
        .summary-val { font-size: 22px; font-weight: 700; }
      `}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Deposit Management</div>
            <div className="page-sub">Track all reader deposits and top-ups</div>
          </div>
        </div>
        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-label">Total Deposits Today</div>
            <div className="summary-val" style={{ color: '#4F46E5' }}>$95.00</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Successful</div>
            <div className="summary-val" style={{ color: '#10B981' }}>3</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Failed / Pending</div>
            <div className="summary-val" style={{ color: '#EF4444' }}>2</div>
          </div>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>User</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748B' }}>{d.id}</td>
                  <td style={{ fontWeight: 600 }}>{d.user}</td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>{d.amount}</td>
                  <td style={{ color: '#475569' }}>{d.method}</td>
                  <td style={{ color: '#94A3B8', fontSize: '12.5px' }}>{d.date}</td>
                  <td><span className={`badge badge-${d.status}`}>{d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
