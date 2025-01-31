export default async function ({ store, redirect, route }) {
  // Initialize auth state if not already done
  if (!store.state.auth.user) {
    await store.dispatch('auth/initAuth')
  }

  const protectedRoutes = ['/create']
  const protectedOperations = route.path.includes('/deck') || route.path.includes('/cards')
  
  // If user is not authenticated and tries to access protected route or operation
  if (!store.getters['auth/isAuthenticated'] && (protectedRoutes.includes(route.path) || protectedOperations)) {
    // If it's an API route, let the API handle the 403 error
    if (protectedOperations) {
      return
    }
    // For UI routes, redirect to home
    return redirect('/')
  }
}
