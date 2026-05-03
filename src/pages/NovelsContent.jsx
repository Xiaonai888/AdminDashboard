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

  .btn-primary {
    background: var(--primary); color: #fff; border: none; border-radius: 10px;
    padding: 10px 20px; font-size: 13.5px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 7px; transition: all 0.2s;
  }
  .btn-primary:hover { background: #4338CA; transform: translateY(-1px); }

  .filter-row {
    display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;
  }

  .search-input {
    flex: 1; min-width: 200px; background: #fff; border: 1.5px solid var(--border);
    border-radius: 10px; padding: 9px 14px 9px 38px; font-size: 13.5px;
    font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s;
  }
  .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
  .search-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; }

  .filter-select {
    background: #fff; border: 1.5px solid var(--border); border-radius: 10px;
    padding: 9px 14px; font-size: 13.5px; font-family: 'Inter', sans-serif;
    color: var(--text-main); outline: none; cursor: pointer;
  }

  .card { background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }

  .table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .table th { padding: 12px 16px; text-align: left; font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid var(--border); background: #FAFBFF; }
  .table td { padding: 14px 16px; border-bottom: 1px solid #F8FAFC; vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: #FAFBFF; }

  .novel-cover {
    width: 38px; height: 52px; border-radius: 6px; object-fit: cover;
    background: linear-gradient(135deg, #EEF2FF, #C7D2FE);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }

  .novel-info { display: flex; align-items: center; gap: 12px; }
  .novel-name { font-weight: 600; font-size: 14px; }
  .novel-chapters { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
  .badge-published { background: var(--success-light); color: var(--success); }
  .badge-draft { background: #F1F5F9; color: #64748B; }
  .badge-pending { background: #FEF3C7; color: #D97706; }
  .badge-suspended { background: #FEE2E2; color: #EF4444; }

  .action-btns { display: flex; gap: 8px; }
  .action-btn { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
  .action-btn.view { background: var(--primary-light); color: var(--primary); }
  .action-btn.view:hover { background: #C7D2FE; }
  .action-btn.delete { background: #FEE2E2; color: #EF4444; }
  .action-btn.delete:hover { background: #FECACA; }

  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-top: 1px solid var(--border); }
  .page-info { font-size: 13px; color: var(--text-muted); }
  .page-btns { display: flex; gap: 6px; }
  .page-btn { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid var(--border); background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.15s; }
  .page-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
  .page-btn:hover:not(.active) { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

  .stats-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
  .mini-card { background: var(--bg-card); border-radius: 12px; padding: 16px 20px; border: 1px solid var(--border); }
  .mini-label { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 6px; }
  .mini-value { font-size: 22px; font-weight: 700; }
`;

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const novels = [
  { id: 1, emoji: '⚔️', title: 'Solo Leveling: Ragnarok', author: 'Sung Jin', category: 'Action / Fantasy', chapters: 142, views: '1.2M', status: 'published' },
  { id: 2, emoji: '💕', title: "The CEO's Secret", author: 'LoveWriter', category: 'Romance', chapters: 87, views: '890K', status: 'published' },
  { id: 3, emoji: '🐉', title: "Dragon's Oath", author: 'KingScribe', category: 'Fantasy', chapters: 55, views: '320K', status: 'published' },
  { id: 4, emoji: '🌙', title: 'Moonlight Heir', author: 'NightQuill', category: 'Supernatural', chapters: 30, views: '145K', status: 'draft' },
  { id: 5, emoji: '🔪', title: 'Shadow Blade Chronicles', author: 'DarkPen88', category: 'Action', chapters: 20, views: '78K', status: 'pending' },
  { id: 6, emoji: '💼', title: 'Corporate Love Affair', author: 'ProsaRose', category: 'Romance', chapters: 110, views: '560K', status: 'suspended' },
];

export default function NovelsContent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = novels.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.author.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || n.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <style>{styles}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Novels Content</div>
            <div className="page-sub">Manage all novels published on Shadow Exclusive</div>
          </div>
          <button className="btn-primary">
            <Icon d="M12 5v14M5 12h14" size={16} /> Add Novel
          </button>
        </div>

        <div className="stats-mini">
          <div className="mini-card">
            <div className="mini-label">Total Novels</div>
            <div className="mini-value" style={{ color: '#4F46E5' }}>1,248</div>
          </div>
          <div className="mini-card">
            <div className="mini-label">Published</div>
            <div className="mini-value" style={{ color: '#10B981' }}>1,180</div>
          </div>
          <div className="mini-card">
            <div className="mini-label">Pending Review</div>
            <div className="mini-value" style={{ color: '#F59E0B' }}>14</div>
          </div>
        </div>

        <div className="filter-row">
          <div className="search-wrap">
            <svg className="search-icon" width={16} height={16} fill="none" stroke="#94A3B8" strokeWidth={2.5}><circle cx={7} cy={7} r={5} /><line x1={11} y1={11} x2={15} y2={15} /></svg>
            <input className="search-input" placeholder="Search novels, authors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Novel</th>
                <th>Author</th>
                <th>Category</th>
                <th>Chapters</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(novel => (
                <tr key={novel.id}>
                  <td>
                    <div className="novel-info">
                      <div className="novel-cover">{novel.emoji}</div>
                      <div>
                        <div className="novel-name">{novel.title}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#475569' }}>{novel.author}</td>
                  <td style={{ color: '#475569' }}>{novel.category}</td>
                  <td style={{ fontWeight: 600 }}>{novel.chapters}</td>
                  <td style={{ color: '#475569' }}>{novel.views}</td>
                  <td><span className={`badge badge-${novel.status}`}>{novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn view">View</button>
                      <button className="action-btn delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <span className="page-info">Showing {filtered.length} of {novels.length} novels</span>
            <div className="page-btns">
              {[1,2,3,'...', 20].map((p, i) => (
                <button key={i} className={`page-btn ${p === 1 ? 'active' : ''}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
