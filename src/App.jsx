import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AdminDashboard from './pages/AdminDashboard';
import SlideSection from './pages/SlideSection';
import BannerSystem from './pages/BannerSystem';
import ShadowExclusiveAdmin from './pages/ShadowExclusiveAdmin';
import AuthorsCommunity from './pages/AuthorsCommunity';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminActivityLogsPage from "./pages/Admin/AdminActivityLogsPage";
import ChangePasswordPage from "./pages/Admin/ChangePasswordPage";
import AdminSettingsPage from "./pages/Admin/AdminSettingsPage";
import GenreManagementPage from './pages/GenreManagementPage';
import CommentModerationPage from './pages/CommentModerationPage';
import PaymentControlPage from './pages/PaymentControlPage';

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
          This page route is ready. We can build this section after the realtime system works.
        </p>
      </div>
    </div>
  );
}

function ProtectedPage({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin" element={<ProtectedPage><AdminDashboard /></ProtectedPage>} />
        <Route path="/slides" element={<ProtectedPage><SlideSection /></ProtectedPage>} />
        <Route path="/banners" element={<ProtectedPage><BannerSystem /></ProtectedPage>} />
        <Route path="/shadow-exclusive" element={<ProtectedPage><ShadowExclusiveAdmin /></ProtectedPage>} />
        <Route path="/authors" element={<ProtectedPage><AuthorsCommunity /></ProtectedPage>} />
        <Route path="/advertisement" element={<ProtectedPage><ComingSoon title="Advertisement" /></ProtectedPage>} />
        <Route path="/recommended" element={<ProtectedPage><ComingSoon title="Recommended" /></ProtectedPage>} />
        <Route path="/category" element={<ProtectedPage><ComingSoon title="Category" /></ProtectedPage>} />
        <Route path="/rule" element={<ProtectedPage><ComingSoon title="Rule" /></ProtectedPage>} />
        <Route path="/account" element={<ProtectedPage><ComingSoon title="Account" /></ProtectedPage>} />
        <Route path="/block-list" element={<ProtectedPage><ComingSoon title="Block List" /></ProtectedPage>} />
        <Route path="/income" element={<ProtectedPage><ComingSoon title="Income" /></ProtectedPage>} />
        <Route path="/history" element={<ProtectedPage><ComingSoon title="History" /></ProtectedPage>} />
        <Route path="/deposit" element={<ProtectedPage><PaymentControlPage /></ProtectedPage>} />
        <Route path="/withdraw" element={<ProtectedPage><ComingSoon title="Withdraw" /></ProtectedPage>} />
        <Route path="/ranking" element={<ProtectedPage><ComingSoon title="Ranking" /></ProtectedPage>} />
        <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
        <Route path="/admin/change-password" element={<ProtectedPage><ChangePasswordPage /></ProtectedPage>} />
        <Route path="/admin/settings" element={<ProtectedPage><AdminSettingsPage /></ProtectedPage>} />
        <Route path="/genres" element={<ProtectedPage><GenreManagementPage /></ProtectedPage>} />
        <Route path="/comments" element={<ProtectedPage><CommentModerationPage /></ProtectedPage>} />

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}
