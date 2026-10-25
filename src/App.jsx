import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminReadersTodayPage from './pages/AdminReadersTodayPage';
import AdminReaderOnlinePage from './pages/AdminReaderOnlinePage';

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
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminCommentTrashPage from './pages/AdminCommentTrashPage';
import PaymentControlPage from './pages/PaymentControlPage';
import ShadowMallProductsPage from './pages/ShadowMallProductsPage';
import ShadowMallOrdersPage from './pages/ShadowMallOrdersPage';
import AuthorStoreReviewPage from './pages/AuthorStoreReviewPage';
import AdminAuthorBookHoldsPage from './pages/AdminAuthorBookHoldsPage';
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
import AdminEpisodeSalesPage from './pages/AdminEpisodeSalesPage';
import AdminDiamondGiftsPage from './pages/AdminDiamondGiftsPage';
import AdminAuthorPageIncomePage from './pages/AdminAuthorPageIncomePage';
import AdminShadowMallIncomePage from './pages/AdminShadowMallIncomePage';
import AuthorStoresPage from './pages/AuthorStoresPage';
import AdminTaskCenterPage from './pages/AdminTaskCenterPage';
import AdminChatCenterPage from './pages/AdminChatCenterPage';
import AdminArchivedChatsPage from './pages/AdminArchivedChatsPage';
import AdminChatFoldersPage from './pages/AdminChatFoldersPage';
import AdminPaymentRecoveryTopUpPage from './pages/AdminPaymentRecoveryTopUpPage';
import AdminBalancePage from './pages/AdminBalancePage';
import AdminAuthorIncomePage from './pages/AdminAuthorIncomePage';
import AdminAuthorLibraryPage from './pages/AdminAuthorLibraryPage';
import AdminDiscoverControlPage from './pages/AdminDiscoverControlPage';
import AdminGoogleAdsPage from './pages/AdminGoogleAdsPage';
import AdminSearchInsightsPage from './pages/AdminSearchInsightsPage';
import AdminMusicPage from './pages/AdminMusicPage';
import AdminGamePage from './pages/AdminGamePage';
import AdminAppPage from './pages/AdminAppPage';
import AdminBoostDashboardPage from './pages/AdminBoostDashboardPage';
import AdminSystemControlPage from './pages/AdminSystemControlPage';
import AdminSystemUsageAnalyticsPage from './pages/AdminSystemUsageAnalyticsPage';
import AdminSystemRenderDetailPage from './pages/AdminSystemRenderDetailPage';
import AdminSystemSupabaseDetailPage from './pages/AdminSystemSupabaseDetailPage';
import AdminSystemCloudflareDetailPage from './pages/AdminSystemCloudflareDetailPage';
import AdminSystemProblemReportsPage from './pages/AdminSystemProblemReportsPage';
import AdminSystemIncidentDetailPage from './pages/AdminSystemIncidentDetailPage';
import AdminSystemManagePage from './pages/AdminSystemManagePage';
import AdminWorkPage from './pages/AdminWorkPage';
import AdminKillSwitchPage from './pages/AdminKillSwitchPage';
import AdminSecurityCenterPage from './pages/AdminSecurityCenterPage';
import AdminLoginGuardPage from './pages/AdminLoginGuardPage';
import AdminReportCenterPage from './pages/AdminReportCenterPage';
import ShadowMallPromotionPage from './pages/ShadowMallPromotionPage';
import AdminPromotionInsightsPage from './pages/AdminPromotionInsightsPage';
import HelpCenterManagementPage from './pages/HelpCenterManagementPage';
import ShadowMediaLibraryPage from './pages/ShadowMediaLibraryPage';
import AdminChatStoryLibraryPage from './pages/AdminChatStoryLibraryPage';
import AdminFrameManagementPage from './pages/AdminFrameManagementPage';
import AdminNewOrdersPage from './pages/AdminNewOrdersPage';
import AdminChatEvidencePage from './pages/AdminChatEvidencePage';
import AdminMonthlyVotePage from './pages/AdminMonthlyVotePage'
import AdminEventPage from './pages/AdminEventPage'
import AdminRolesPage from './pages/AdminRolesPage'
import AdminStaffAccountsPage from './pages/AdminStaffAccountsPage'
import AdminDeviceOfflineControlPage from './pages/AdminDeviceOfflineControlPage';


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

function PermissionGate({ permission, children }) {
  let admin = {}

  try {
    admin = JSON.parse(
      sessionStorage.getItem('shadow_admin_user') ||
      localStorage.getItem('shadow_admin_user') ||
      '{}'
    )
  } catch {
    admin = {}
  }

  const role = String(admin?.role || '').trim().toLowerCase()

  const allowed =
    admin?.has_all_permissions === true ||
    role === 'owner' ||
    role === 'admin' ||
    (
      Array.isArray(admin?.permission_keys) &&
      admin.permission_keys.includes(permission)
    )

  if (allowed) return children

  return (
    <AdminLayout
      title="Access Denied"
      subtitle="You do not have permission to open this page."
    >
      <div style={{
        padding: 32,
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 18,
        color: '#64748B',
        fontWeight: 700,
      }}>
        Permission required: <strong>{permission}</strong>
      </div>
    </AdminLayout>
  )
}

function ProtectedPage({ children, permission = '' }) {
  return (
    <ProtectedRoute>
      {permission
        ? <PermissionGate permission={permission}>{children}</PermissionGate>
        : children}
    </ProtectedRoute>
  );
}

if (typeof window !== 'undefined' && !window.__shadowAdminPageAttributionInstalled) {
  window.__shadowAdminPageAttributionInstalled = true
  const originalFetch = window.fetch.bind(window)
  const apiOrigin = new URL(
    import.meta.env.VITE_API_URL || 'https://shadow-backend-kucw.onrender.com',
    window.location.origin
  ).origin

  window.fetch = (input, init) => {
    try {
      const requestUrl = new URL(
        input instanceof Request ? input.url : String(input),
        window.location.origin
      )
      if (requestUrl.origin === apiOrigin && requestUrl.pathname.startsWith('/api/')) {
        const headers = new Headers(
          init?.headers || (input instanceof Request ? input.headers : undefined)
        )
        if (headers.has('Authorization') && !headers.has('X-Shadow-Page')) {
          const page = window.location.pathname.toLowerCase()
            .replace(/\/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}(?=\/|$)/g, '/:id')
            .replace(/\/\d+(?=\/|$)/g, '/:id')
            .replace(/[^/a-z0-9_:.-]/g, '_')
            .slice(0, 160)
          headers.set('X-Shadow-Page', `ADMIN:${page || '/'}`)
          return originalFetch(input, { ...init, headers })
        }
      }
    } catch {}
    return originalFetch(input, init)
  }
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
        <Route path="/shadow-exclusive" element={<ProtectedPage permission="shadow_exclusive.view"><ShadowExclusiveAdmin /></ProtectedPage>} />
        <Route path="/authors" element={<ProtectedPage permission="community.view"><AuthorsCommunity /></ProtectedPage>} />
        <Route path="/advertisement" element={<ProtectedPage><AdminAdvertisementPage /></ProtectedPage>} />
        <Route path="/notifications" element={<ProtectedPage><AdminNotificationsPage /></ProtectedPage>} />
        <Route path="/reader-mails" element={<ProtectedPage><AdminReaderMailsPage /></ProtectedPage>} />
        <Route path="/recommended" element={<ProtectedPage><ComingSoon title="Recommended" /></ProtectedPage>} />
        <Route path="/category" element={<ProtectedPage><ComingSoon title="Category" /></ProtectedPage>} />
        <Route path="/rule" element={<ProtectedPage permission="roles.view"><AdminRolesPage /></ProtectedPage>} />
        <Route path="/account" element={<ProtectedPage permission="accounts.view"><AdminStaffAccountsPage /></ProtectedPage>} />
        <Route path="/block-list" element={<ProtectedPage><AdminBlockListPage /></ProtectedPage>} />
        <Route path="/income" element={<ProtectedPage><AdminIncomePage /></ProtectedPage>} />
        <Route path="/income/episode-sales" element={<ProtectedPage><AdminEpisodeSalesPage /></ProtectedPage>} />
        <Route path="/income/diamond-gifts" element={<ProtectedPage><AdminDiamondGiftsPage /></ProtectedPage>} />
        <Route path="/income/author-page" element={<ProtectedPage><AdminAuthorPageIncomePage /></ProtectedPage>} />
        <Route path="/author-library" element={<ProtectedPage><AdminAuthorLibraryPage /></ProtectedPage>} />
        <Route path="/device-offline-control" element={<ProtectedPage permission="system_control.manage"><AdminDeviceOfflineControlPage /></ProtectedPage>} />
        <Route path="/discover-control" element={<ProtectedPage permission="income.view"><AdminDiscoverControlPage /></ProtectedPage>} />
        <Route path="/income/shadow-mall" element={<ProtectedPage><AdminShadowMallIncomePage /></ProtectedPage>} />
        <Route path="/payment" element={<ProtectedPage><PaymentControlPage /></ProtectedPage>} />
        <Route path="/deposit" element={<Navigate to="/payment" replace />} />
        <Route path="/withdraw" element={<ProtectedPage><AdminWithdrawalPage /></ProtectedPage>} />
        <Route path="/ranking" element={<ProtectedPage><AdminRankingPage /></ProtectedPage>} />
        <Route path="/event" element={<ProtectedPage permission="monthly_vote.view"><AdminEventPage /></ProtectedPage>} />
        <Route path="/monthly-vote" element={<ProtectedPage><AdminMonthlyVotePage /></ProtectedPage>} />
        <Route path="/admin/activity-logs" element={<ProtectedPage><AdminActivityLogsPage /></ProtectedPage>} />
        <Route path="/admin/change-password" element={<ProtectedPage><ChangePasswordPage /></ProtectedPage>} />
        <Route path="/admin/settings" element={<ProtectedPage><AdminSettingsPage /></ProtectedPage>} />
        <Route path="/genres" element={<ProtectedPage><GenreManagementPage /></ProtectedPage>} />
        <Route path="/comments" element={<ProtectedPage><CommentModerationPage /></ProtectedPage>} />
        <Route path="/reviews" element={<ProtectedPage permission="comments.view"><AdminReviewsPage /></ProtectedPage>} />
        <Route path="/comments/trash" element={<ProtectedPage><AdminCommentTrashPage /></ProtectedPage>} />
        <Route path="/reports" element={<ProtectedPage><AdminReportCenterPage /></ProtectedPage>} />
        <Route path="/chat-evidence" element={<ProtectedPage><AdminChatEvidencePage /></ProtectedPage>} />
        <Route path="/shadow-mall/orders" element={<ProtectedPage><ShadowMallOrdersPage /></ProtectedPage>} />
        <Route path="/author-store/review" element={<ProtectedPage><AuthorStoreReviewPage /></ProtectedPage>} />
        <Route path="/author-store/book-holds" element={<ProtectedPage><AdminAuthorBookHoldsPage /></ProtectedPage>} />
        <Route path="/shadow-mall/publishers" element={<ProtectedPage><ShadowMallPublishersPage /></ProtectedPage>} />
        <Route path="/readers-today" element={<ProtectedPage permission="readers.view"><AdminReadersTodayPage /></ProtectedPage>} />
        <Route path="/reader-online" element={<ProtectedPage><AdminReaderOnlinePage /></ProtectedPage>} />
        <Route path="/media-library" element={<ProtectedPage><ShadowMediaLibraryPage /></ProtectedPage>} />
        <Route path="/chat-story-library" element={<ProtectedPage permission="media_library.view"><AdminChatStoryLibraryPage /></ProtectedPage>} />
        <Route path="/profile-frames" element={<ProtectedPage permission="media_library.manage"><AdminFrameManagementPage /></ProtectedPage>} />
        <Route path="/admin-secret-reset/request" element={<AdminForgotPasswordPage />} />
        <Route path="/admin-secret-reset/confirm" element={<AdminResetPasswordPage />} />
        <Route path="/author-stores" element={<ProtectedPage><AuthorStoresPage /></ProtectedPage>} />
        <Route path="/task-center" element={<ProtectedPage><AdminTaskCenterPage /></ProtectedPage>} />
        <Route path="/admin-chat" element={<ProtectedPage permission="admin_chat.view"><AdminChatCenterPage /></ProtectedPage>} />
        <Route path="/admin-chat/archived" element={<ProtectedPage permission="admin_chat.view"><AdminArchivedChatsPage /></ProtectedPage>} />
        <Route path="/admin-chat/folders" element={<ProtectedPage permission="admin_chat.view"><AdminChatFoldersPage /></ProtectedPage>} />
        <Route path="/payment-recovery" element={<ProtectedPage permission="payment.view"><AdminPaymentRecoveryTopUpPage /></ProtectedPage>} />
        <Route path="/balance" element={<ProtectedPage><AdminBalancePage /></ProtectedPage>} />
        <Route path="/author-income" element={<ProtectedPage permission="income.view"><AdminAuthorIncomePage /></ProtectedPage>} />
        <Route path="/google-ads" element={<ProtectedPage permission="income.view"><AdminGoogleAdsPage /></ProtectedPage>} />
        <Route path="/search-insights" element={<ProtectedPage><AdminSearchInsightsPage /></ProtectedPage>} />
        <Route path="/music" element={<ProtectedPage><AdminMusicPage /></ProtectedPage>} />
        <Route path="/game" element={<ProtectedPage><AdminGamePage /></ProtectedPage>} />
        <Route path="/app" element={<ProtectedPage><AdminAppPage /></ProtectedPage>} />
        <Route path="/boost" element={<ProtectedPage><AdminBoostDashboardPage /></ProtectedPage>} />
        <Route path="/alerts/system-control" element={<ProtectedPage permission="system_control.view"><AdminSystemControlPage /></ProtectedPage>} />
        <Route path="/alerts/system-control/usage" element={<ProtectedPage permission="system_control.view"><AdminSystemUsageAnalyticsPage /></ProtectedPage>} />
        <Route path="/alerts/system-control/render" element={<ProtectedPage permission="system_control.view"><AdminSystemRenderDetailPage /></ProtectedPage>} />
        <Route path="/alerts/system-control/supabase" element={<ProtectedPage permission="system_control.view"><AdminSystemSupabaseDetailPage /></ProtectedPage>} />
        <Route path="/alerts/system-control/cloudflare" element={<ProtectedPage permission="system_control.view"><AdminSystemCloudflareDetailPage /></ProtectedPage>} />
        <Route path="/alerts/system-control/problems" element={<ProtectedPage permission="system_control.view"><AdminSystemProblemReportsPage /></ProtectedPage>} />
        <Route path="/alerts/system-control/problems/:incidentId" element={<ProtectedPage permission="system_control.view"><AdminSystemIncidentDetailPage /></ProtectedPage>} />
        <Route path="/alerts/system-control/manage" element={<ProtectedPage permission="system_control.view"><AdminSystemManagePage /></ProtectedPage>} />
        <Route path="/alerts/work" element={<ProtectedPage><AdminWorkPage /></ProtectedPage>} />
        <Route path="/alerts/kill-switch" element={<ProtectedPage><AdminKillSwitchPage /></ProtectedPage>} />
        <Route path="/alerts/security-center" element={<ProtectedPage><AdminSecurityCenterPage /></ProtectedPage>} />
        <Route path="/help-center" element={<ProtectedPage><HelpCenterManagementPage /></ProtectedPage>} />
       
<Route
  path="/stories"
  element={
    <ProtectedPage permission="stories.view">
      <AdminStoriesPage />
    </ProtectedPage>
  }
/>

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

        <Route
  path="/shadow-mall/promotion/insights"
  element={<ProtectedPage><AdminPromotionInsightsPage /></ProtectedPage>}
/>


        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}
