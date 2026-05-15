import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShadowExclusiveAdmin() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        padding: 32,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#0F172A',
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 8px 28px rgba(15,23,42,0.06)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/admin')}
          style={{
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '10px 14px',
            fontWeight: 800,
            cursor: 'pointer',
            marginBottom: 18,
          }}
        >
          ← Back Dashboard
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Shadow Exclusive
        </h1>

        <p style={{ color: '#64748B', lineHeight: 1.7 }}>
          Shadow Exclusive admin page is ready. Full approve/remove system can be reconnected after build is stable.
        </p>
      </div>
    </div>
  );
}
