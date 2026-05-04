const rankings = [
  { rank: 1, emoji: '⚔️', title: 'Solo Leveling: Ragnarok', author: 'Sung Jin', views: '1.2M', rating: 4.9, change: 'up' },
  { rank: 2, emoji: '💕', title: "The CEO's Secret", author: 'LoveWriter', views: '890K', rating: 4.7, change: 'same' },
  { rank: 3, emoji: '🐉', title: "Dragon's Oath", author: 'KingScribe', views: '320K', rating: 4.6, change: 'up' },
  { rank: 4, emoji: '💼', title: 'Corporate Love Affair', author: 'ProsaRose', views: '280K', rating: 4.5, change: 'down' },
  { rank: 5, emoji: '🌙', title: 'Moonlight Heir', author: 'NightQuill', views: '145K', rating: 4.3, change: 'up' },
];

export function RankingPage() {
  return (
    <>
      <style>{baseStyles + `
        .rank-num { font-size: 18px; font-weight: 800; color: #94A3B8; width: 32px; }
        .rank-num.gold { color: #F59E0B; }
        .rank-num.silver { color: #94A3B8; }
        .rank-num.bronze { color: #CD7C5F; }
        .rank-change { font-size: 14px; }
        .stars { color: #F59E0B; font-size: 12px; }
      `}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">🏆 Novel Rankings</div>
            <div className="page-sub">Top performing novels this week on Shadow Exclusive</div>
          </div>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Novel</th>
                <th>Author</th>
                <th>Total Views</th>
                <th>Rating</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={r.rank}>
                  <td>
                    <span className={`rank-num ${r.rank === 1 ? 'gold' : r.rank === 2 ? 'silver' : r.rank === 3 ? 'bronze' : ''}`}>
                      {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
                    </span>
                  </td>
                  <td><span style={{ fontSize: '16px', marginRight: '8px' }}>{r.emoji}</span><strong>{r.title}</strong></td>
                  <td style={{ color: '#475569' }}>{r.author}</td>
                  <td style={{ fontWeight: 600 }}>{r.views}</td>
                  <td><span className="stars">{'★'.repeat(Math.round(r.rating))}</span> <span style={{ fontSize: '12px', color: '#64748B' }}>{r.rating}</span></td>
                  <td style={{ fontSize: '16px' }}>{r.change === 'up' ? '📈' : r.change === 'down' ? '📉' : '➡️'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
