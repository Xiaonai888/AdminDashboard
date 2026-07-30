import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import ChangePasswordSection from './sections/ChangePasswordSection'
import ComingSoonSection from './sections/ComingSoonSection'
import LoginDevicesSection from './sections/LoginDevicesSection'
import LoginHistorySection from './sections/LoginHistorySection'
import SecurityAlertsSection from './sections/SecurityAlertsSection'
import TwoFactorSection from './sections/TwoFactorSection'
import PasskeyPinSection from './sections/PasskeyPinSection'

const styles = `
  :root {
    --settings-bg: #F8FAFC;
    --settings-card: #FFFFFF;
    --settings-primary: #4F46E5;
    --settings-primary-soft: #EEF2FF;
    --settings-text: #0F172A;
    --settings-muted: #64748B;
    --settings-border: #E2E8F0;
  }

  .settings-page {
    min-height: 100%;
    color: var(--settings-text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .settings-container {
    width: min(1180px, 100%);
    margin: 0 auto;
  }

  .settings-top {
    margin-bottom: 22px;
    animation: settingsFadeUp .28s ease;
  }

  .settings-top h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -.04em;
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
    border: 1px solid var(--settings-border);
    border-radius: 22px;
    background: var(--settings-card);
    box-shadow: 0 10px 30px rgba(15, 23, 42, .06);
  }

  .settings-sidebar {
    position: sticky;
    top: 92px;
    padding: 18px;
    animation: settingsFadeUp .3s ease;
  }

  .settings-sidebar-head {
    margin-bottom: 12px;
    padding: 6px 8px 16px;
    border-bottom: 1px solid var(--settings-border);
  }

  .settings-kicker {
    margin: 0;
    color: var(--settings-primary);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .13em;
  }

  .settings-sidebar-title {
    margin: 8px 0 0;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -.04em;
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
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    border: 0;
    border-radius: 16px;
    background: transparent;
    padding: 12px;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
  }

  .settings-tab:hover {
    background: #F8FAFC;
    transform: translateX(3px);
  }

  .settings-tab.active {
    background: linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%);
    box-shadow: 0 12px 28px rgba(79, 70, 229, .13);
    transform: translateX(4px);
  }

  .settings-tab.active::before {
    content: '';
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 0;
    width: 4px;
    border-radius: 999px;
    background: var(--settings-primary);
    animation: activeLine .18s ease;
  }

  .settings-tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 14px;
    background: #F1F5F9;
    font-size: 20px;
    transition: transform .18s ease, background .18s ease;
  }

  .settings-tab:hover .settings-tab-icon {
    background: #EEF2FF;
    transform: scale(1.05);
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
    overflow: hidden;
    color: #0F172A;
    font-size: 14px;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .settings-tab-desc {
    display: block;
    margin-top: 3px;
    color: var(--settings-muted);
    font-size: 12px;
    line-height: 1.35;
  }

  .settings-soon {
    border-radius: 999px;
    background: #F1F5F9;
    color: #64748B;
    padding: 4px 7px;
    font-size: 10px;
    font-weight: 900;
  }

  .settings-content {
    min-height: 560px;
    padding: 30px;
    animation: settingsFadeUp .34s ease;
  }

  .settings-content-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 26px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--settings-border);
  }

  .settings-content-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 16px;
    background: var(--settings-primary-soft);
    font-size: 23px;
  }

  .settings-content-title {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -.04em;
  }

  .settings-content-subtitle {
    margin: 6px 0 0;
    color: var(--settings-muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .settings-section-body {
    animation: settingsSectionIn .22s ease;
  }

  @keyframes settingsFadeUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes settingsSectionIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes activeLine {
    from {
      opacity: 0;
      transform: scaleY(.2);
    }

    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  @media (max-width: 980px) {
    .settings-layout {
      grid-template-columns: 1fr;
    }

    .settings-sidebar {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .settings-sidebar,
    .settings-content {
      border-radius: 18px;
      padding: 18px;
    }

    .settings-content-head {
      align-items: flex-start;
    }
  }
`

const tabs = [
  {
    key: 'password',
    title: 'Change Password',
    subtitle: 'Update your admin login password',
    icon: '🔐',
    available: true,
  },
  {
    key: '2fa',
    title: 'Two-Factor Authentication',
    subtitle: 'Email or app verification code',
    icon: '🛡️',
    available: true,
  },
  {
    key: 'passkey',
    title: 'Passkey PIN',
    subtitle: '6-digit admin security PIN',
    icon: '🔑',
    available: true,
  },
  {
    key: 'devices',
    title: 'Login Devices',
    subtitle: 'Signed-in browsers and devices',
    icon: '💻',
    available: true,
  },
  {
    key: 'history',
    title: 'Login History',
    subtitle: 'Recent sign-ins and IP records',
    icon: '📍',
    available: true,
  },
  {
    key: 'alerts',
    title: 'Security Alerts',
    subtitle: 'Failed login and risk alerts',
    icon: '🚨',
    available: true,
  },
]

function SettingsSection({ activeKey }) {
  if (activeKey === 'password') return <ChangePasswordSection />
  if (activeKey === '2fa') return <TwoFactorSection />
  if (activeKey === 'passkey') return <PasskeyPinSection />
  if (activeKey === 'devices') return <LoginDevicesSection />
  if (activeKey === 'history') return <LoginHistorySection />
  if (activeKey === 'alerts') return <SecurityAlertsSection />
  return <ComingSoonSection />
}

export default function AdminSettingsPage() {
  const [activeKey, setActiveKey] = useState('password')

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')

    if (tabs.some((item) => item.key === tab)) {
      setActiveKey(tab)
    }
  }, [])

  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0]

  return (
    <AdminLayout
      title="Admin Settings"
      subtitle="Manage account security, login protection, and access tools."
    >
      <style>{styles}</style>

      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-top">
            <h1>Settings</h1>
            <p>Manage admin account security, login protection, and access tools.</p>
          </div>

          <div className="settings-layout">
            <aside className="settings-sidebar">
              <div className="settings-sidebar-head">
                <p className="settings-kicker">ADMIN SETTINGS</p>
                <h2 className="settings-sidebar-title">Security</h2>
                <p className="settings-sidebar-subtitle">
                  Choose a security section to manage.
                </p>
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
                        {!tab.available ? (
                          <span className="settings-soon">Soon</span>
                        ) : null}
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
                <SettingsSection activeKey={activeKey} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
