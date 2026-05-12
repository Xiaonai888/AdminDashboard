import React, { useState } from 'react'
import ChangePasswordSection from './sections/ChangePasswordSection'
import ComingSoonSection from './sections/ComingSoonSection'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --settings-bg: #F8FAFC;
    --settings-card: #FFFFFF;
    --settings-primary: #4F46E5;
    --settings-primary-soft: #EEF2FF;
    --settings-text: #0F172A;
    --settings-muted: #64748B;
    --settings-border: #E2E8F0;
  }

  * { box-sizing: border-box; }

  .settings-page {
    min-height: 100vh;
    background: var(--settings-bg);
    font-family: 'Inter', sans-serif;
    color: var(--settings-text);
    padding: 28px 34px 46px;
  }
  .settings-back-button {
  border: none;
  background: #EEF2FF;
  color: #4F46E5;
  min-height: 38px;
  padding: 0 15px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.10);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.settings-back-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.16);
}

  .settings-container {
    width: min(1180px, 100%);
    margin: 0 auto;
  }

  .settings-top {
    margin-bottom: 22px;
    animation: settingsFadeUp 0.28s ease;
  }

  .settings-top h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .settings-top p {
    margin: 6px 0 0;
    color: var(--settings-muted);
    font-size: 14px;
    line-height: 1.55;
  }

  .settings-layout {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 22px;
    align-items: start;
  }

  .settings-sidebar,
  .settings-content {
    background: var(--settings-card);
    border: 1px solid var(--settings-border);
    border-radius: 22px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  }

  .settings-sidebar {
    padding: 18px;
    position: sticky;
    top: 22px;
    animation: settingsFadeUp 0.3s ease;
  }

  .settings-sidebar-head {
    padding: 6px 8px 16px;
    border-bottom: 1px solid var(--settings-border);
    margin-bottom: 12px;
  }

  .settings-kicker {
    margin: 0;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.13em;
    color: var(--settings-primary);
  }

  .settings-sidebar-title {
    margin: 8px 0 0;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .settings-sidebar-subtitle {
    margin: 8px 0 0;
    color: var(--settings-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .settings-tabs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .settings-tab {
    width: 100%;
    border: 0;
    background: transparent;
    border-radius: 16px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    position: relative;
    transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }

  .settings-tab:hover {
    background: #F8FAFC;
    transform: translateX(3px);
  }

  .settings-tab.active {
    background: linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%);
    box-shadow: 0 12px 28px rgba(79, 70, 229, 0.13);
    transform: translateX(4px);
  }

  .settings-tab.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 4px;
    border-radius: 999px;
    background: var(--settings-primary);
    animation: activeLine 0.18s ease;
  }

  .settings-tab-icon {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 14px;
    background: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: transform 0.18s ease, background 0.18s ease;
  }

  .settings-tab:hover .settings-tab-icon {
    transform: scale(1.05);
    background: #EEF2FF;
  }

  .settings-tab.active .settings-tab-icon {
    background: #E0E7FF;
    transform: scale(1.07);
  }

  .settings-tab-main {
    min-width: 0;
    flex: 1;
  }

  .settings-tab-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .settings-tab-title {
    display: block;
    font-size: 14px;
    font-weight: 900;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .settings-tab-desc {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    color: var(--settings-muted);
    line-height: 1.35;
  }

  .settings-soon {
    font-size: 10px;
    font-weight: 900;
    color: #64748B;
    background: #F1F5F9;
    border-radius: 999px;
    padding: 4px 7px;
  }

  .settings-content {
    min-height: 560px;
    padding: 30px;
    animation: settingsFadeUp 0.34s ease;
  }

  .settings-content-head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--settings-border);
    margin-bottom: 26px;
  }

  .settings-content-icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 16px;
    background: var(--settings-primary-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
  }

  .settings-content-title {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .settings-content-subtitle {
    margin: 6px 0 0;
    color: var(--settings-muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .settings-section-body {
    animation: settingsSectionIn 0.22s ease;
  }

  @keyframes settingsFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes settingsSectionIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes activeLine {
    from { transform: scaleY(0.2); opacity: 0; }
    to { transform: scaleY(1); opacity: 1; }
  }

  @media (max-width: 980px) {
    .settings-layout { grid-template-columns: 1fr; }
    .settings-sidebar { position: static; }
  }

  @media (max-width: 640px) {
    .settings-page { padding: 20px 16px 36px; }
    .settings-sidebar,
    .settings-content {
      border-radius: 18px;
      padding: 18px;
    }
    .settings-content-head { align-items: flex-start; }
  }
`

const tabs = [
  { key: 'password', title: 'Change Password', subtitle: 'Update your admin login password', icon: '🔐', available: true },
  { key: '2fa', title: 'Two-Factor Authentication', subtitle: 'Email or app verification code', icon: '🛡️', available: false },
  { key: 'passkey', title: 'Passkey', subtitle: 'Device passkey or biometrics', icon: '🔑', available: false },
  { key: 'devices', title: 'Login Devices', subtitle: 'Signed-in browsers and devices', icon: '💻', available: false },
  { key: 'history', title: 'Login History', subtitle: 'Recent sign-ins and IP records', icon: '📍', available: false },
  { key: 'alerts', title: 'Security Alerts', subtitle: 'Failed login and risk alerts', icon: '🚨', available: false },
]

export default function AdminSettingsPage() {
  const [activeKey, setActiveKey] = useState('password')
  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0]

  return (
    <>
      <style>{styles}</style>

      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-top">
  <button
    type="button"
    className="settings-back-button"
    onClick={() => window.location.href = '/admin'}
  >
    ← Back to Dashboard
  </button>

  <h1>Settings</h1>
  <p>Manage admin account security, login protection, and access tools.</p>
</div>

          <div className="settings-layout">
            <aside className="settings-sidebar">
              <div className="settings-sidebar-head">
                <p className="settings-kicker">ADMIN SETTINGS</p>
                <h2 className="settings-sidebar-title">Security</h2>
                <p className="settings-sidebar-subtitle">Choose a security section to manage.</p>
              </div>

              <div className="settings-tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`settings-tab ${activeKey === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveKey(tab.key)}
                  >
                    <span className="settings-tab-icon">{tab.icon}</span>
                    <span className="settings-tab-main">
                      <span className="settings-tab-row">
                        <span className="settings-tab-title">{tab.title}</span>
                        {!tab.available ? <span className="settings-soon">Soon</span> : null}
                      </span>
                      <span className="settings-tab-desc">{tab.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <main className="settings-content">
              <div className="settings-content-head">
                <div className="settings-content-icon">{activeTab.icon}</div>
                <div>
                  <h2 className="settings-content-title">{activeTab.title}</h2>
                  <p className="settings-content-subtitle">{activeTab.subtitle}</p>
                </div>
              </div>

              <div key={activeKey} className="settings-section-body">
                {activeKey === 'password' ? <ChangePasswordSection /> : <ComingSoonSection />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
