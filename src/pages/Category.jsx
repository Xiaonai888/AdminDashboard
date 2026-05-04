import React, { useState } from 'react';

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  :root {
    --bg-main: #F8FAFC; --bg-card: #FFFFFF; --primary: #4F46E5; --primary-light: #EEF2FF;
    --text-main: #0F172A; --text-muted: #64748B; --success: #10B981; --success-light: #D1FAE5;
    --border: #E2E8F0; --danger: #EF4444;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-main); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .page-wrap { padding: 28px 36px; animation: fadeIn 0.3s ease; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .page-title { font-size: 20px; font-weight: 700; color: var(--text-main); }
  .page-sub { font-size: 13px; color: var(--text-muted); margin-top: 3px; }
  .btn-primary { background: var(--primary); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; font-family: 'Inter', sans-serif; transition: all 0.2s; }
  .btn-primary:hover { background: #4338CA; }
  .card { background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
  .card-header { padding: 18px 22px; border-bottom: 1.5px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .card-title { font-size: 15px; font-weight: 700; }
  .table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .table th { padding: 11px 18px; text-align: left; font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; background: #FAFBFF; }
  .table td { padding: 14px 18px; border-bottom: 1px solid #F8FAFC; vertical-align: middle; color: var(--text-main); }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: #FAFBFF; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
  .badge-active { background: var(--success-light); color: var(--success); }
  .badge-inactive { background: #F1F5F9; color: #64748B; }
  .action-btns { display: flex; gap: 8px; }
  .action-btn { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: 'Inter', sans-serif; }
  .action-btn.edit { background: var(--primary-light); color: var(--primary); }
  .action-btn.delete { background: #FEE2E2; color: #EF4444; }
`;

const categories = [
  { id: 1, emoji: '⚔️', name: 'Action', slug: 'action', novels: 312, status: 'active' },
  { id: 2, emoji: '💕', name: 'Romance', slug: 'romance', novels: 278, status: 'active' },
  { id: 3, emoji: '🐉', name: 'Fantasy', slug: 'fantasy', novels: 245, status: 'active' },
  { id: 4, emoji: '🌙', name: 'Supernatural', slug: 'supernatural', novels: 134, status: 'active' },
  { id: 5, emoji: '😂', name: 'Comedy', slug: 'comedy', novels: 98, status: 'active' },
  { id: 6, emoji: '🔍', name: 'Mystery', slug: 'mystery', novels: 89, status: 'active' },
  { id: 7, emoji: '💼', name: 'Business', slug: 'business', novels: 56, status: 'inactive' },
  { id: 8, emoji: '🚀', name: 'Sci-Fi', slug: 'sci-fi', novels: 36, status: 'active' },
];

export function CategoryPage() {
  return (
    <>
      <style>{baseStyles}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Category Management</div>
            <div className="page-sub">Manage novel categories and genres</div>
          </div>
          <button className="btn-primary">+ Add Category</button>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Novels</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ color: '#94A3B8', fontSize: '12.5px' }}>{cat.id}</td>
                  <td><span style={{ fontSize: '18px', marginRight: '10px' }}>{cat.emoji}</span><strong>{cat.name}</strong></td>
                  <td><code style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', fontSize: '12px' }}>{cat.slug}</code></td>
                  <td style={{ fontWeight: 600 }}>{cat.novels}</td>
                  <td><span className={`badge badge-${cat.status}`}>{cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
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
