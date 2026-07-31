import React from 'react'

const styles = `
  .coming-soon-panel {
    border: 1px dashed #CBD5E1;
    border-radius: 20px;
    padding: 34px;
    text-align: center;
    background: #F8FAFC;
  }

  .coming-soon-icon {
    font-size: 34px;
    margin-bottom: 10px;
  }

  .coming-soon-title {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
    color: #0F172A;
  }

  .coming-soon-text {
    margin: 8px auto 0;
    color: #64748B;
    font-size: 14px;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 640px) {
    .coming-soon-panel {
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
      border-radius: 16px;
      padding: 24px 16px;
    }

    .coming-soon-icon {
      font-size: 30px;
    }

    .coming-soon-title {
      font-size: 19px;
      overflow-wrap: anywhere;
    }

    .coming-soon-text {
      max-width: 100%;
      font-size: 13px;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
  }
`

export default function ComingSoonSection() {
  return (
    <>
      <style>{styles}</style>

      <div className="coming-soon-panel">
        <div className="coming-soon-icon">🛠️</div>
        <h3 className="coming-soon-title">Coming Soon</h3>
        <p className="coming-soon-text">
          This security feature is prepared in the settings menu, but it is not active yet.
        </p>
      </div>
    </>
  )
}
