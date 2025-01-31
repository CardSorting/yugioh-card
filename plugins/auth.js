import { authStateManager } from '~/services/auth/AuthStateManager';
import { supabase } from '~/config/supabase';

export default async function ({ app }) {
  // Initialize auth state on app startup
  if (!authStateManager.isInitialized()) {
    await authStateManager.initializeState();
  }

  // Inject $auth
  app.$auth = {
    user: () => authStateManager.getAuthState().user
  };

  // Inject into Vue instance
  if (!app.mixins) app.mixins = [];
  app.mixins.push({
    computed: {
      $auth() {
        return app.$auth;
      }
    }
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      authStateManager.setUser(session.user);
    } else if (event === 'SIGNED_OUT') {
      authStateManager.setUser(null);
    }
  });
}
