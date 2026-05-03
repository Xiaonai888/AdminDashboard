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

  .btn-primary { background: var(--primary); color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all 0.2s; }
  .btn-primary:hover { background: #4338CA; }

  .filter-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .search-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-input { width: 100%; background: #fff; border: 1.5px solid var(--border); border-radius: 10px; padding: 9px 14px 9px 38px; font-size: 13.5px; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s; }
  .search-input:focus { border-color: var(--primary); }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }

  .authors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }

  .author-card {
    background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border);
    padding: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;
  }
  .author-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

  .author-top { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
  .author-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .author-name { font-size: 15px; font-weight: 700; }
  .author-handle { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .author-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
  .author-stat { text-align: center; padding: 8px; background: #F8FAFC; border-radius: 10px; }
  .author-stat-val { font-size: 15px; font-weight: 700; }
  .author-stat-lbl { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2px; }

  .author-badge-row { display: flex; align-items: center; justify-content: space-between; }
  .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
  .badge-active { background: var(--success-light); color: var(--success); }
  .badge-inactive { background: #F1F5F9; color: #64748B; }
  .badge-suspended { background: #FEE2E2; color: #EF4444; }

  .author-action-btn { padding: 6px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: transparent; color: var(--text-muted); transition: all 0.15s; }
  .author-action-btn:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
`;

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const authors = [
  { name: 'Sung Jin', handle: '@sungjin_writes', novels: 12, followers: '45.2K', earnings: '$3,200', status: 'active', color: '#4F46E5' },
  { name: 'LoveWriter', handle: '@lovewriter_official', novels: 8, followers: '32.1K', earnings: '$2,100', status: 'active', color: '#EC4899' },
  { name: 'KingScribe', handle: '@kingscribe', novels: 5, followers: '18.5K', earnings: '$890', status: 'active', color: '#F59E0B' },
  { name: 'NightQuill', handle: '@nightquill', novels: 3, followers: '7.2K', earnings: '$210', status: 'inactive', color: '#64748B' },
  { name: 'DarkPen88', handle: '@darkpen88', novels: 2, followers: '4.8K', earnings: '$120', status: 'suspended', color: '#EF4444' },
  { name: 'ProsaRose', handle: '@prosarose', novels: 15, followers: '62.3K', earnings: '$5,400', status: 'active', color: '#10B981' },
];

export default function AuthorsCommunity() {
  const [search, setSearch] = useState('');

  const filtered = authors.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.handle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{styles}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Authors Community</div>
            <div className="page-sub">Manage all registered authors on Shadow Exclusive</div>
          </div>
          <button className="btn-primary">
            <Icon d="M12 5v14M5 12h14" /> Invite Author
          </button>
        </div>

        <div className="filter-row">
          <div className="search-wrap">
            <svg className="search-icon" width={16} height={16} fill="none" stroke="#94A3B8" strokeWidth={2.5}><circle cx={7} cy={7} r={5} /><line x1={11} y1={11} x2={15} y2={15} /></svg>
            <input className="search-input" placeholder="Search authors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="authors-grid">
          {filtered.map((author, i) => (
            <div className="author-card" key={i}>
              <div className="author-top">
                <div className="author-avatar" style={{ background: author.color }}>{author.name.charAt(0)}</div>
                <div>
                  <div className="author-name">{author.name}</div>
                  <div className="author-handle">{author.handle}</div>
                </div>
              </div>
              <div className="author-stats">
                <div className="author-stat">
                  <div className="author-stat-val" style={{ color: '#4F46E5' }}>{author.novels}</div>
                  <div className="author-stat-lbl">Novels</div>
                </div>
                <div className="author-stat">
                  <div className="author-stat-val">{author.followers}</div>
                  <div className="author-stat-lbl">Followers</div>
                </div>
                <div className="author-stat">
                  <div className="author-stat-val" style={{ color: '#10B981' }}>{author.earnings}</div>
                  <div className="author-stat-lbl">Earnings</div>
                </div>
              </div>
              <div className="author-badge-row">
                <span className={`badge badge-${author.status}`}>{author.status.charAt(0).toUpperCase() + author.status.slice(1)}</span>
                <button className="author-action-btn">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
