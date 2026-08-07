import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import AdminDashboard from './pages/AdminDashboard';
import SlideSection from './pages/SlideSection';
import BannerSystem from './pages/BannerSystem';
import ShadowExclusiveAdmin from './pages/ShadowExclusiveAdmin';
import AuthorsCommunity from './pages/AuthorsCommunity';
import AdminSpamGuardPage from './pages/AdminSpamGuardPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminActivityLogsPage from "./pages/Admin/AdminActivityLogsPage";
import ChangePasswordPage from "./pages/Admin/ChangePasswordPage";
import AdminSettingsPage from "./pages/Admin/AdminSettingsPage";
import GenreManagementPage from './pages/GenreManagementPage';
import CommentModerationPage from './pages/CommentModerationPage';
import AdminCommentTrashPage from './pages/AdminCommentTrashPage';
import PaymentControlPage from './pages/PaymentControlPage';
import ShadowMallProductsPage from './pages/ShadowMallProductsPage';
import ShadowMallOrdersPage from './pages/ShadowMallOrdersPage';
import AuthorStoreReviewPage from './pages/AuthorStoreReviewPage';
import ShadowMallPublishersPage from './pages/ShadowMallPublishersPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import AdminRankingPage from './pages/AdminRankingPage';
import AdminForgotPasswordPage from './pages/Admin/AdminForgotPasswordPage';
import AdminResetPasswordPage from './pages/Admin/AdminResetPasswordPage';
import AdminAdvertisementPage from './pages/AdminAdvertisementPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminReaderMailsPage from './pages/AdminReaderMailsPage';
import AdminBlockListPage from './pages/AdminBlockListPage';
import AdminWithdrawalPage from './pages/AdminWithdrawalPage';
import AdminIncomePage from './pages/AdminIncomePage';
import AuthorStoresPage from './pages/AuthorStoresPage';
import AdminTaskCenterPage from './pages/AdminTaskCenterPage';
import AdminLoginGuardPage from './pages/AdminLoginGuardPage';
import AdminReportCenterPage from './pages/AdminReportCenterPage';
import ShadowMallPromotionPage from './pages/ShadowMallPromotionPage';
import HelpCenterManagementPage from './pages/HelpCenterManagementPage';
import ShadowMediaLibraryPage from './pages/ShadowMediaLibraryPage';
import AdminNewOrdersPage from './pages/AdminNewOrdersPage';
import AdminChatEvidencePage from './pages/AdminChatEvidencePage';

function ComingSoon({ title }) {
  return (
    <AdminLayout
      title={title}
      subtitle="This admin section is ready and can be developed when needed."
    >
      <div style={{
        minHeight: 'calc(100vh - 190px)',
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0F172A',
        padding: 24,
        borderRadius: 22,
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
    </AdminLayout>
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
        <Route path="/admin/orders/new" element={<ProtectedPage><AdminNewOrdersPage /></ProtectedPage>} />
        <Route path="/slides" element={<ProtectedPage><SlideSection /></ProtectedPage>} />
        <Route path="/banners" element={<ProtectedPage><BannerSystem /></ProtectedPage>} />
        <Route path="/shadow-mall" element={<ProtectedPage><ShadowMallProductsPage /></ProtectedPage>} />
        <Route path="/shadow-exclusive" element={<ProtectedPage><ShadowExclusiveAdmin /></ProtectedPage>} />
        <Route path="/authors" element={<ProtectedPage><AuthorsCommunity /></ProtectedPage>} />
        <Route path="/advertisement" element={<ProtectedPage><AdminAdvertisementPage /></ProtectedPage>} />
        <Route path="/notifications" element={<ProtectedPage><AdminNotificationsPage /></ProtectedPage>} />
        <Route path="/reader-mails" element={<ProtectedPage><AdminReaderMailsPage /></ProtectedPage>} />
        <Route path="/recommended" element={<ProtectedPage><ComingSoon title="Recommended" /></ProtectedPage>} />
        <Route path="/category" element={<ProtectedPage><ComingSoon title="Category" /></ProtectedPage>} />
        <Route path="/rule" element={<ProtectedPage><ComingSoon title="Rule" /></ProtectedPage>} />
        <Route path="/account" element={<ProtectedPage><ComingSoon title="Account" /></ProtectedPage>} />
        <Route path="/block-list" element={<ProtectedPage><AdminBlockListPage /></ProtectedPage>} />
        <Route path="/income" element={<ProtectedPage><AdminIncomePage /></ProtectedPage>} />
        <Route path="/history" element={<ProtectedPage><ComingSoon title="History" /></ProtectedPage>} />
        <Route path="/payment" element={<ProtectedPage><PaymentControlPage /></ProtectedPage>} />
        <Route path="/deposit" element={<Navigate to="/payment" replace />} />
        <Route path="/withdraw" element={<ProtectedPage><AdminWithdrawalPage /></ProtectedPage>} />
        <Route path="/ranking" element={<ProtectedPage><AdminRankingPage /></ProtectedPage>} />
        <Route path="/admin/activity-logs" element={<ProtectedPage><AdminActivityLogsPage /></ProtectedPage>} />
        <Route path="/admin/change-password" element={<ProtectedPage><ChangePasswordPage /></ProtectedPage>} />
        <Route path="/admin/settings" element={<ProtectedPage><AdminSettingsPage /></ProtectedPage>} />
        <Route path="/genres" element={<ProtectedPage><GenreManagementPage /></ProtectedPage>} />
        <Route path="/comments" element={<ProtectedPage><CommentModerationPage /></ProtectedPage>} />
        <Route path="/comments/trash" element={<ProtectedPage><AdminCommentTrashPage /></ProtectedPage>} />
        <Route path="/reports" element={<ProtectedPage><AdminReportCenterPage /></ProtectedPage>} />
        <Route path="/chat-evidence" element={<ProtectedPage><AdminChatEvidencePage /></ProtectedPage>} />
        <Route path="/shadow-mall/orders" element={<ProtectedPage><ShadowMallOrdersPage /></ProtectedPage>} />
        <Route path="/author-store/review" element={<ProtectedPage><AuthorStoreReviewPage /></ProtectedPage>} />
        <Route path="/shadow-mall/publishers" element={<ProtectedPage><ShadowMallPublishersPage /></ProtectedPage>} />
        <Route path="/stories" element={<ProtectedPage><AdminStoriesPage /></ProtectedPage>} />
        <Route path="/media-library" element={<ProtectedPage><ShadowMediaLibraryPage /></ProtectedPage>} />
        <Route path="/admin-secret-reset/request" element={<AdminForgotPasswordPage />} />
        <Route path="/admin-secret-reset/confirm" element={<AdminResetPasswordPage />} />
        <Route path="/author-stores" element={<ProtectedPage><AuthorStoresPage /></ProtectedPage>} />
        <Route path="/task-center" element={<ProtectedPage><AdminTaskCenterPage /></ProtectedPage>} />
        <Route path="/help-center" element={<ProtectedPage><HelpCenterManagementPage /></ProtectedPage>} />



        <Route
          path="/spam-guard"
          element={<ProtectedPage><AdminSpamGuardPage /></ProtectedPage>}
        />

        <Route
          path="/admin-login-guard"
          element={<ProtectedPage><AdminLoginGuardPage /></ProtectedPage>}
        />

        <Route
          path="/shadow-mall/promotion"
          element={<ProtectedPage><ShadowMallPromotionPage /></ProtectedPage>}
        />


        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}
