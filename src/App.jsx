import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AdminDashboard from './pages/AdminDashboard';
import SlideSection from './pages/SlideSection';
import NovelsContent from './pages/NovelsContent';
import AuthorsCommunity from './pages/AuthorsCommunity';

function ComingSoon({ title }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      color: '#0F172A',
      padding: 24,
    }}>
      <div style={{
        width: 'min(520px, 100%)',
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 18,
        padding: 28,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🛠️</div>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h1>
        <p style={{ color: '#64748B', lineHeight: 1.6 }}>
          This page route is ready. We can build this section after the realtime Slide Section works.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/slides" element={<SlideSection />} />
        <Route path="/novels" element={<NovelsContent />} />
        <Route path="/authors" element={<AuthorsCommunity />} />
        <Route path="/banners" element={<ComingSoon title="Banner System" />} />
        <Route path="/advertisement" element={<ComingSoon title="Advertisement" />} />
        <Route path="/recommended" element={<ComingSoon title="Recommended" />} />
        <Route path="/category" element={<ComingSoon title="Category" />} />
        <Route path="/rule" element={<ComingSoon title="Rule" />} />
        <Route path="/account" element={<ComingSoon title="Account" />} />
        <Route path="/block-list" element={<ComingSoon title="Block List" />} />
        <Route path="/income" element={<ComingSoon title="Income" />} />
        <Route path="/history" element={<ComingSoon title="History" />} />
        <Route path="/deposit" element={<ComingSoon title="Deposit" />} />
        <Route path="/withdraw" element={<ComingSoon title="Withdraw" />} />
        <Route path="/ranking" element={<ComingSoon title="Ranking" />} />
      </Routes>
    </Router>
  );
}
