import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com';
const LOGS_PER_PAGE = 20;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#F8FAFC;color:#0F172A}
  .logs-page{min-height:100vh;background:#F8FAFC;padding:28px}
  .logs-shell{max-width:1180px;margin:0 auto}
  .top-row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}
  .back-btn,.black-btn{border:0;border-radius:12px;background:#000;color:#fff;padding:12px 16px;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.16)}
  .back-btn:hover,.black-btn:hover{opacity:.9}
  .page-title h1{font-size:28px;line-height:1.15;font-weight:900;letter-spacing:-.04em}
  .page-title p{margin-top:7px;font-size:14px;color:#64748B}
  .tools-card{background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 8px 28px rgba(15,23,42,.06);padding:18px;margin-bottom:18px}
  .tools-grid{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center}
  .search-box{width:100%;border:1px solid #CBD5E1;background:#F8FAFC;border-radius:14px;padding:13px 15px;font-size:14px;outline:none}
  .search-box:focus{background:#fff;border-color:#111827;box-shadow:0 0 0 3px rgba(15,23,42,.08)}
  .filter-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
  .filter-btn{border:1px solid #E2E8F0;background:#fff;color:#475569;border-radius:999px;padding:9px 12px;font-size:12px;font-weight:900;cursor:pointer}
  .filter-btn.active{background:#000;border-color:#000;color:#fff}
  .logs-card{overflow:hidden;background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 8px 28px rgba(15,23,42,.06)}
  .logs-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;border-bottom:1px solid #E2E8F0}
  .logs-card-header h2{font-size:16px;font-weight:900}
  .logs-card-header p{margin-top:3px;font-size:12px;color:#64748B}
  .count-pill{border-radius:999px;background:#F1F5F9;color:#334155;padding:8px 11px;font-size:12px;font-weight:900}
  .log-row{display:grid;grid-template-columns:130px 1fr 130px 190px;gap:16px;align-items:center;padding:16px 20px;border-bottom:1px solid #F1F5F9}
  .log-row:last-child{border-bottom:0}.log-row:hover{background:#FAFBFF}
  .action-pill{display:inline-flex;align-items:center;justify-content:center;width:max-content;min-width:92px;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900;letter-spacing:.3px;text-transform:uppercase}
  .action-pill.create{background:#D1FAE5;color:#047857}.action-pill.update{background:#EEF2FF;color:#4F46E5}.action-pill.visibility{background:#FEF3C7;color:#B45309}.action-pill.delete{background:#FEE2E2;color:#DC2626}.action-pill.default{background:#F1F5F9;color:#475569}
  .log-main strong{display:block;font-size:14px;color:#0F172A;margin-bottom:4px}.log-main span{display:block;font-size:13px;color:#475569;line-height:1.45}
  .actor{color:#334155;font-size:13px;font-weight:800}.time{text-align:right;color:#64748B;font-size:12px;line-height:1.45}
  .empty-state{padding:32px 20px;color:#64748B;font-size:14px;text-align:center}
  .footer-row{display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:16px 20px;border-top:1px solid #E2E8F0}
  .page-btn{border:1px solid #E2E8F0;background:#fff;color:#0F172A;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:900;cursor:pointer}
  .page-btn.primary{background:#000;border-color:#000;color:#fff}.page-btn:disabled{opacity:.45;cursor:not-allowed}.page-info{color:#475569;font-size:12px;font-weight:900}
  @media(max-width:900px){.logs-page{padding:18px}.top-row,.tools-grid,.logs-card-header{align-items:flex-start;flex-direction:column}.log-row{grid-template-columns:1fr;gap:8px}.time{text-align:left}}
`;

function getAdminToken() {
  return sessionStorage.getItem('shadow_admin_token');
}

function getActionClass(action) {
  const value = String(action || '').toLowerCase();
  if (value === 'create') return 'create';
  if (value === 'update') return 'update';
  if (value === 'delete') return 'delete';
  if (value === 'visibility') return 'visibility';
  return 'default';
}

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatMainTitle(record) {
  return record?.slide_title || (record?.order_index ? `Slide ${record.order_index}` : 'System activity');
}

export default function AdminActivityLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async (nextPage = page) => {
    try {
      setLoading(true);
      const token = getAdminToken();

      const response = await fetch(`${API_URL}/api/slides/records?page=${nextPage}&limit=${LOGS_PER_PAGE}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Admin-Name': 'Admin',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || 'Failed to load logs');
      }

      setLogs(data.records || []);
      setPage(data.page || nextPage);
      setTotalPages(data.total_pages || data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      setLogs([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const filteredLogs = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return logs.filter((log) => {
      const action = String(log.action || '').toUpperCase();
      const matchesAction = actionFilter === 'ALL' || action === actionFilter;

      const searchable = [
        log.action,
        log.actor,
        log.slide_title,
        log.details,
        log.order_index ? `Slide ${log.order_index}` : '',
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !q || searchable.includes(q);
      return matchesAction && matchesSearch;
    });
  }, [logs, searchText, actionFilter]);

  return (
    <>
      <style>{styles}</style>
      <div className="logs-page">
        <div className="logs-shell">
          <div className="top-row">
            <div className="page-title">
              <h1>Admin Activity Logs</h1>
              <p>View all admin actions, slide changes, and recent system activity.</p>
            </div>
            <button className="back-btn" type="button" onClick={() => navigate('/admin')}>
              ← Back to Dashboard
            </button>
          </div>

          <section className="tools-card">
            <div className="tools-grid">
              <input
                className="search-box"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search action, slide title, detail, or actor..."
              />
              <button className="black-btn" type="button" onClick={() => fetchLogs(page)} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="filter-row">
              {['ALL', 'CREATE', 'UPDATE', 'VISIBILITY', 'DELETE'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`filter-btn ${actionFilter === item ? 'active' : ''}`}
                  onClick={() => setActionFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="logs-card">
            <div className="logs-card-header">
              <div>
                <h2>All Logs</h2>
                <p>Showing {filteredLogs.length} of {logs.length} loaded records. Full history is paginated by 20 records per page.</p>
              </div>
              <div className="count-pill">{total} total</div>
            </div>

            <div className="log-table">
              {loading ? (
                <div className="empty-state">Loading admin activity logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="empty-state">No logs found.</div>
              ) : (
                filteredLogs.map((log) => (
                  <div className="log-row" key={log.id}>
                    <div><span className={`action-pill ${getActionClass(log.action)}`}>{log.action || 'LOG'}</span></div>
                    <div className="log-main">
                      <strong>{formatMainTitle(log)}</strong>
                      <span>{log.details || 'No detail'}</span>
                    </div>
                    <div className="actor">{log.actor || 'Admin'}</div>
                    <div className="time">{formatTime(log.created_at)}</div>
                  </div>
                ))
              )}
            </div>

            <div className="footer-row">
              <button className="page-btn" type="button" disabled={page <= 1 || loading} onClick={() => fetchLogs(page - 1)}>
                Previous
              </button>
              <span className="page-info">Page {page} / {totalPages}</span>
              <button className="page-btn primary" type="button" disabled={page >= totalPages || loading} onClick={() => fetchLogs(page + 1)}>
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
