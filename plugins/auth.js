export default async function ({ store, app }) {
  // Inject $auth
  app.$auth = {
    user: () => store.state.auth.user
  }
  // Inject into Vue instance
  if (!app.mixins) app.mixins = []
  app.mixins.push({
    computed: {
      $auth() {
        return app.$auth
      }
    }
  })

  // Initialize auth state on app startup
  await store.dispatch('auth/initAuth')

  // Listen for auth state changes
  const { supabase } = await import('~/config/supabase')
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      store.commit('auth/SET_USER', session.user)
    } else if (event === 'SIGNED_OUT') {
      store.commit('auth/SET_USER', null)
    }
  })
}
