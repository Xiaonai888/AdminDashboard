const historyLogs = [
  { time: 'May 3, 2026 — 14:02', user: 'Sok', action: 'Approved novel "Solo Leveling: Ragnarok"', type: 'novels' },
  { time: 'May 3, 2026 — 13:45', user: 'Dev', action: 'Deleted reported comment from user_XX', type: 'moderation' },
  { time: 'May 3, 2026 — 11:20', user: 'Xiaonai', action: 'Updated system rules (Section 4.2)', type: 'settings' },
  { time: 'May 2, 2026 — 18:35', user: 'Support1', action: 'Resolved report #RPT-0088', type: 'reports' },
  { time: 'May 2, 2026 — 16:10', user: 'Sok', action: 'Suspended author DarkPen88', type: 'authors' },
  { time: 'May 1, 2026 — 10:00', user: 'Xiaonai', action: 'Added new banner for May campaign', type: 'visual' },
];

const typeColors = {
  novels: { bg: '#EEF2FF', color: '#4F46E5' },
  moderation: { bg: '#FEE2E2', color: '#EF4444' },
  settings: { bg: '#F0FDF4', color: '#10B981' },
  reports: { bg: '#FEF3C7', color: '#D97706' },
  authors: { bg: '#FDF2F8', color: '#EC4899' },
  visual: { bg: '#F0F9FF', color: '#0EA5E9' },
};

export function HistoryPage() {
  return (
    <>
      <style>{baseStyles + `
        .history-list { padding: 20px 24px; display: flex; flex-direction: column; gap: 0; }
        .history-item { display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; border-bottom: 1px solid #F8FAFC; }
        .history-item:last-child { border-bottom: none; }
        .history-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .history-type { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; margin-top: 1px; }
        .history-text { font-size: 13.5px; color: var(--text-main); flex: 1; }
        .history-text strong { color: var(--primary); }
        .history-time { font-size: 11.5px; color: #94A3B8; margin-top: 3px; }
      `}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Activity History</div>
            <div className="page-sub">Full log of all admin actions on Shadow Exclusive</div>
          </div>
        </div>
        <div className="card">
          <div className="history-list">
            {historyLogs.map((log, i) => {
              const tc = typeColors[log.type] || { bg: '#F1F5F9', color: '#64748B' };
              return (
                <div className="history-item" key={i}>
                  <div className="history-dot" style={{ background: tc.color }} />
                  <span className="history-type" style={{ background: tc.bg, color: tc.color }}>{log.type}</span>
                  <div style={{ flex: 1 }}>
                    <div className="history-text"><strong>{log.user}</strong> {log.action}</div>
                    <div className="history-time">{log.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

