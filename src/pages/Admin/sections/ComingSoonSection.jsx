import React from 'react'

const styles = `
  .coming-soon-panel {
    border: 1px dashed #CBD5E1;
    border-radius: 20px;
    padding: 34px;
    text-align: center;
    background: #F8FAFC;
    animation: fadeSoft 0.22s ease;
  }

  .coming-soon-icon {
    font-size: 34px;
    margin-bottom: 10px;
  }

  .coming-soon-panel h3 {
    font-size: 20px;
    font-weight: 900;
    margin: 0;
  }

  .coming-soon-panel p {
    margin: 8px auto 0;
    color: #64748B;
    font-size: 14px;
    line-height: 1.6;
    max-width: 420px;
  }
`

export default function ComingSoonSection() {
  return (
    <>
      <style>{styles}</style>

      <div className="coming-soon-panel">
        <div className="coming-soon-icon">🛠️</div>
        <h3>Coming Soon</h3>
        <p>This security feature is prepared in the settings menu, but it is not active yet.</p>
      </div>
    </>
  )
}
