export function RulePage() {
  const rules = [
    { id: 1, section: '1.0', title: 'Content Standards', desc: 'All novels must adhere to Shadow Exclusive content guidelines. No explicit content without proper age gate tagging.', updated: 'May 1, 2026' },
    { id: 2, section: '2.0', title: 'Author Conduct', desc: 'Authors are expected to maintain respectful interactions with readers. Harassment of any kind will result in suspension.', updated: 'Apr 20, 2026' },
    { id: 3, section: '3.0', title: 'Payment & Revenue', desc: 'Authors receive 70% of revenue generated from their novels. Payouts are processed within 7 business days of request.', updated: 'Mar 15, 2026' },
    { id: 4, section: '4.0', title: 'Copyright Policy', desc: 'Plagiarism of any form is strictly prohibited. All content submitted must be original or properly licensed.', updated: 'Jan 5, 2026' },
  ];
  return (
    <>
      <style>{baseStyles + `
        .rule-cards { display: flex; flex-direction: column; gap: 14px; }
        .rule-card { background: var(--bg-card); border-radius: 14px; border: 1px solid var(--border); padding: 20px 22px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
        .rule-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .rule-num { font-size: 11px; font-weight: 800; background: var(--primary-light); color: var(--primary); padding: 2px 10px; border-radius: 20px; }
        .rule-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
        .rule-desc { font-size: 13.5px; color: #475569; line-height: 1.6; margin-bottom: 10px; }
        .rule-meta { font-size: 11.5px; color: #94A3B8; }
        .rule-edit-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; background: var(--primary-light); color: var(--primary); border: none; cursor: pointer; font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="page-wrap">
        <div className="page-header">
          <div>
            <div className="page-title">Platform Rules</div>
            <div className="page-sub">Manage and update Shadow Exclusive community guidelines</div>
          </div>
          <button className="btn-primary">+ Add Rule</button>
        </div>
        <div className="rule-cards">
          {rules.map(rule => (
            <div className="rule-card" key={rule.id}>
              <div className="rule-header">
                <span className="rule-num">Section {rule.section}</span>
                <button className="rule-edit-btn">Edit</button>
              </div>
              <div className="rule-title">{rule.title}</div>
              <div className="rule-desc">{rule.desc}</div>
              <div className="rule-meta">Last updated: {rule.updated}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
