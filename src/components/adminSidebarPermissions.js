const PATH_PERMISSION = {
  '/admin': 'dashboard.view',
  '/task-center': 'task_center.view',

  '/shadow-mall': 'mall_products.view',
  '/shadow-mall/orders': 'mall_orders.view',
  '/admin/orders/new': 'mall_orders.view',
  '/shadow-mall/publishers': 'mall_publishers.view',
  '/shadow-mall/promotion': 'mall_promotion.view',
  '/author-stores': 'author_stores.view',
  '/author-store/review': 'author_stores.view',

  '/stories': 'stories.view',
  '/readers-today': 'readers.view',
  '/authors': 'community.view',
  '/shadow-exclusive': 'shadow_exclusive.view',
  '/media-library': 'media_library.view',

  '/slides': 'slides.view',
  '/banners': 'banners.view',
  '/genres': 'genres.view',
  '/advertisement': 'advertisement.view',
  '/notifications': 'notifications.view',
  '/reader-mails': 'reader_mail.view',
  '/recommended': 'recommended.view',

  '/comments': 'comments.view',
  '/comments/trash': 'comments.view',
  '/reports': 'reports.view',
  '/chat-evidence': 'chat_evidence.view',
  '/help-center': 'help_center.view',
  '/block-list': 'block_list.view',
  '/spam-guard': 'spam_guard.view',

  '/payment': 'payment.view',
  '/income': 'income.view',
  '/withdraw': 'withdraw.view',
  '/ranking': 'ranking.view',
  '/monthly-vote': 'monthly_vote.view',
  '/history': 'history.view',

  '/category': 'category.view',
  '/rule': 'roles.view',
  '/account': 'accounts.view',
  '/admin-login-guard': 'admin_guard.view',
  '/admin/activity-logs': 'activity_logs.view',
}

function getStoredAdminUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem('shadow_admin_user') ||
      localStorage.getItem('shadow_admin_user') ||
      '{}'
    )
  } catch {
    return {}
  }
}

export function filterAdminNavSections(sections) {
  const admin = getStoredAdminUser()
  const legacyRole = String(admin?.role || '').trim().toLowerCase()

  if (
    admin?.has_all_permissions === true ||
    legacyRole === 'owner' ||
    legacyRole === 'admin'
  ) {
    return sections
  }

  const permissionKeys = new Set(
    Array.isArray(admin?.permission_keys) ? admin.permission_keys : []
  )

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const requiredPermission = PATH_PERMISSION[item.path]
        return Boolean(requiredPermission && permissionKeys.has(requiredPermission))
      }),
    }))
    .filter((section) => section.items.length > 0)
}
