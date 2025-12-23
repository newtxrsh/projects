export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/verification-success', '/auth/callback']
  const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route))

  // Wait for auth to initialize on client side
  if (import.meta.client && authStore.isLoading) {
    // Initialize auth if not already done
    await authStore.initializeAuth()
  }

  // If user is not authenticated and trying to access protected route
  if (!authStore.isAuthenticated && !isPublicRoute) {
    // Save the intended destination for redirect after login
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined
    return navigateTo({
      path: '/auth/login',
      query: redirect ? { redirect } : undefined,
    })
  }

  // If user is authenticated and trying to access auth pages (except verification)
  if (authStore.isAuthenticated && isPublicRoute && to.path !== '/auth/verification-success') {
    // Check if there's a redirect query param
    const redirect = to.query.redirect as string
    return navigateTo(redirect || '/')
  }
})
