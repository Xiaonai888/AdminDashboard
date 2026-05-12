import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminSettingsPage() {
  const navigate = useNavigate()

  const securityItems = [
    {
      title: 'Change Password',
      description: 'Update your admin login password.',
      status: 'Active',
      icon: '🔐',
      active: true,
      onClick: () => navigate('/admin/change-password'),
    },
    {
      title: 'Two-Factor Authentication',
      description: 'Add an email or app verification code when signing in.',
      status: 'Coming Soon',
      icon: '🛡️',
      active: false,
    },
    {
      title: 'Passkey',
      description: 'Use device passkey or biometrics for faster secure login.',
      status: 'Coming Soon',
      icon: '🔑',
      active: false,
    },
    {
      title: 'Login Devices',
      description: 'Review browsers and devices signed in to your admin account.',
      status: 'Coming Soon',
      icon: '💻',
      active: false,
    },
    {
      title: 'Login History',
      description: 'Check recent sign-ins, IP addresses, and device information.',
      status: 'Coming Soon',
      icon: '📍',
      active: false,
    },
    {
      title: 'Security Alerts',
      description: 'Get alerts when there are many failed login attempts.',
      status: 'Coming Soon',
      icon: '🚨',
      active: false,
    },
  ]

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button type="button" style={styles.backButton} onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <p style={styles.kicker}>ADMIN SETTINGS</p>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>
            Manage admin account security and login protection.
          </p>
        </div>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Security & Login</h2>
              <p style={styles.sectionText}>
                Change password is active now. Other security tools are prepared for later.
              </p>
            </div>
          </div>

          <div style={styles.grid}>
            {securityItems.map((item) => (
              <button
                key={item.title}
                type="button"
                style={{
                  ...styles.card,
                  ...(item.active ? styles.cardActive : styles.cardDisabled),
                }}
                onClick={item.active ? item.onClick : undefined}
                disabled={!item.active}
              >
                <div style={styles.cardTop}>
                  <div style={styles.iconBox}>{item.icon}</div>
                  <span
                    style={{
                      ...styles.badge,
                      ...(item.active ? styles.badgeActive : styles.badgeSoon),
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardText}>{item.description}</p>

                <div style={styles.cardFooter}>
                  {item.active ? 'Open →' : 'Not available yet'}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F8FAFC',
    padding: 24,
    fontFamily: 'Inter, sans-serif',
    color: '#0F172A',
  },
  container: {
    width: 'min(1040px, 100%)',
    margin: '0 auto',
  },
  backButton: {
    border: 'none',
    background: '#EEF2FF',
    color: '#4F46E5',
    minHeight: 36,
    padding: '0 14px',
    borderRadius: 10,
    fontWeight: 800,
    cursor: 'pointer',
    marginBottom: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  header: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 20,
    padding: 26,
    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)',
    marginBottom: 20,
  },
  kicker: {
    margin: 0,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.12em',
    color: '#4F46E5',
  },
  title: {
    margin: '8px 0 0',
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: '-0.03em',
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#64748B',
    fontSize: 15,
    lineHeight: 1.6,
  },
  section: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 20,
    padding: 22,
    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.05)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
  },
  sectionText: {
    margin: '6px 0 0',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 1.55,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 14,
  },
  card: {
    textAlign: 'left',
    borderRadius: 16,
    padding: 18,
    minHeight: 170,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    transition: 'all 0.18s ease',
  },
  cardActive: {
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
  },
  cardDisabled: {
    cursor: 'not-allowed',
    opacity: 0.68,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 21,
  },
  badge: {
    borderRadius: 999,
    padding: '5px 9px',
    fontSize: 11,
    fontWeight: 900,
  },
  badgeActive: {
    background: '#ECFDF5',
    color: '#047857',
  },
  badgeSoon: {
    background: '#F1F5F9',
    color: '#64748B',
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 900,
  },
  cardText: {
    margin: '8px 0 0',
    color: '#64748B',
    fontSize: 13,
    lineHeight: 1.55,
  },
  cardFooter: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: 900,
    color: '#0F172A',
  },
}
