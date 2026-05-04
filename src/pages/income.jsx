import React, { useState } from 'react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  :root {
    --bg-main: #F8FAFC; --bg-card: #FFFFFF; --primary: #4F46E5; --primary-light: #EEF2FF;
    --text-main: #0F172A; --text-muted: #64748B; --success: #10B981; --success-light: #D1FAE5;
    --warning: #F59E0B; --danger: #EF4444; --border: #E2E8F0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-main); color: var(--text-main); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .page-wrap { padding: 28px 36px; animation: fadeIn 0.3s ease; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .page-title { font-size: 20px; font-weight: 700; }
  .page-sub { font-size: 13px; color: var(--text-muted); margin-top: 3px; }

  .income-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin-bottom: 24px; }
  .income-card {
    background: var(--bg-card); border-radius: 16px; padding: 22px 24px;
    border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .income-card.highlight { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #fff; border: none; }
  .income-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
  .income-card.highlight .income-label { color: rgba(255,255,255,0.7); }
  .income-label:not(.income-card.highlight .income-label) { color: var(--text-muted); }
  .income-value { font-size: 26px; font-weight: 700; }
  .income-trend { font-size: 12px; margin-top: 6px; font-weight: 600; }

  .card { background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; margin-bottom: 20px; }
  .card-header { padding: 18px 22px; border-bottom: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .card-title { font-size: 15px; font-weight: 700; }

  .table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .table th { padding: 12px 18px; text-align: left; font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFF; }
  .table td { padding: 14px 18px; border-bottom: 1px solid #F8FAFC; vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: #FAFBFF; }

  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
  .badge-success { background: var(--success-light); color: var(--success); }
  .badge-pending { background: #FEF3C7; color: #D97706; }
  .badge-failed { background: #FEE2E2; color: #EF4444; }

  .bar-chart { padding: 20px 22px; }
  .bar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .bar-month { font-size: 12px; color: var(--text-muted); width: 28px; flex-shrink: 0; }
  .bar-track { flex: 1; background: #F1F5F9; border-radius: 6px; height: 10px; }
  .bar-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, #4F46E5, #7C3AED); transition: width 0.8s ease; }
  .bar-val { font-size: 12.5px; font-weight: 600; color: var(--text-main); width: 55px; text-align: right; }
`;

const transactions = [
  { id: '#TXN-0041', novel: 'Solo Leveling: Ragnarok', author: 'Sung Jin', type: 'Subscription', amount: '$12.00', date: 'May 3, 2026', status: 'success' },
  { id: '#TXN-0040', novel: "The CEO's Secret", author: 'LoveWriter', type: 'Chapter Unlock', amount: '$1.50', date: 'May 3, 2026', status: 'success' },
  { id: '#TXN-0039', novel: "Dragon's Oath", author: 'KingScribe', type: 'Subscription', amount: '$12.00', date: 'May 2, 2026', status: 'pending' },
  { id: '#TXN-0038', novel: 'Moonlight Heir', author: 'NightQuill', type: 'Chapter Unlock', amount: '$2.00', date: 'May 2, 2026', status: 'failed' },
  { id: '#TXN-0037', novel: 'Shadow Blade Chronicles', author: 'DarkPen88', type: 'Subscription', amount: '$12.00', date: 'May 1, 2026', status: 'success' },
];

const monthData = [
  { month: 'Jan', amount: 1200, pct: 38 },
  { month: 'Feb', amount: 1580, pct: 50 },
  { month: 'Mar', amount: 2100, pct: 65 },
  { month: 'Apr', amount: 1900, pct: 60 },
  { month: 'May', amount: 3150, pct: 100 },
];

export default function Income() {
  return (
    <>
      <style>{styles}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Income & Revenue</div>
            <div className="page-sub">Track all revenue streams from Shadow Exclusive</div>
          </div>
          <button style={{ background: '#F1F5F9', border: '1.5px solid #E2E8F0', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Export Report
          </button>
        </div>

        <div className="income-grid">
          <div className="income-card highlight">
            <div className="income-label">Total Revenue (2026)</div>
            <div className="income-value">$9,930</div>
            <div className="income-trend" style={{ color: 'rgba(255,255,255,0.8)' }}>↑ +32% vs 2025</div>
          </div>
          <div className="income-card">
            <div className="income-label" style={{ color: '#64748B' }}>This Month</div>
            <div className="income-value" style={{ color: '#10B981' }}>$3,150</div>
            <div className="income-trend" style={{ color: '#10B981' }}>↑ +18% vs last month</div>
          </div>
          <div className="income-card">
            <div className="income-label" style={{ color: '#64748B' }}>Today</div>
            <div className="income-value">$50.03</div>
            <div className="income-trend" style={{ color: '#10B981' }}>↑ Trending up</div>
          </div>
          <div className="income-card">
            <div className="income-label" style={{ color: '#64748B' }}>Pending Payout</div>
            <div className="income-value" style={{ color: '#F59E0B' }}>$420.00</div>
            <div className="income-trend" style={{ color: '#F59E0B' }}>3 author requests</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Monthly Revenue (2026)</span>
          </div>
          <div className="bar-chart">
            {monthData.map((m, i) => (
              <div className="bar-row" key={i}>
                <span className="bar-month">{m.month}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${m.pct}%` }} />
                </div>
                <span className="bar-val">${m.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Transactions</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Novel</th>
                <th>Author</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748B' }}>{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.novel}</td>
                  <td style={{ color: '#475569' }}>{t.author}</td>
                  <td style={{ color: '#475569' }}>{t.type}</td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>{t.amount}</td>
                  <td style={{ color: '#94A3B8', fontSize: '12.5px' }}>{t.date}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
