export function BannerSystemPage() {
  const banners = [
    { name: 'Homepage Top Banner', size: '1200×300', placement: 'Homepage', status: 'active' },
    { name: 'Novel Page Sidebar', size: '300×600', placement: 'Novel Pages', status: 'active' },
    { name: 'Reader Bottom Banner', size: '1200×100', placement: 'Reader View', status: 'inactive' },
  ];
  return (
    <>
      <style>{baseStyles}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Banner System</div>
            <div className="page-sub">Manage promotional banners across the platform</div>
          </div>
          <button className="btn-primary">+ Add Banner</button>
        </div>
        <div className="card">
          <table className="table">
            <thead><tr><th>Banner Name</th><th>Size</th><th>Placement</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {banners.map((b, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>🖼 {b.name}</td>
                  <td><code style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '6px', fontSize: '12px' }}>{b.size}</code></td>
                  <td style={{ color: '#475569' }}>{b.placement}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span></td>
                  <td><div className="action-btns"><button className="action-btn edit">Edit</button><button className="action-btn delete">Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
