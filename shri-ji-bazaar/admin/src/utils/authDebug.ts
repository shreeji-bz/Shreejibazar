/**
 * Shri Ji Bazaar - Admin Auth Debug
 * Open browser DevTools Console and run:
 *   window.__adminAuthDebug()
 * to inspect the current admin auth state.
 */

export const adminAuthDebug = () => {
  const adminAuth = localStorage.getItem('admin-auth');
  const adminToken = localStorage.getItem('admin_token');

  let parsed: any = null;
  try {
    parsed = adminAuth ? JSON.parse(adminAuth) : null;
  } catch {
    parsed = { raw: adminAuth, parseError: true };
  }

  return {
    hasAdminAuth: !!adminAuth,
    adminAuth,
    parsed,
    hasAdminToken: !!adminToken,
    adminTokenPreview: adminToken ? `${adminToken.slice(0, 20)}...` : null,
  };
};

export type AdminAuthDebug = ReturnType<typeof adminAuthDebug>;

declare global {
  interface Window {
    __adminAuthDebug: () => AdminAuthDebug;
  }
}

if (typeof window !== 'undefined') {
  (window as any).__adminAuthDebug = adminAuthDebug;
}
