import { ref, computed } from 'vue';
import { authStateManager } from '~/services/auth/AuthStateManager';
import type { AuthState } from '~/services/auth/interfaces/IAuthStateManager';

export function useAuth() {
  const authState = ref<AuthState>(authStateManager.getAuthState());
  
  const isReady = computed(() => authState.value.initialized);
  const isAuthenticated = computed(() => !!authState.value.user);
  const isLoading = computed(() => authState.value.loading);
  const error = computed(() => authState.value.error);
  const user = computed(() => authState.value.user);

  const refreshState = () => {
    authState.value = authStateManager.getAuthState();
  };

  // Initialize auth state if not already initialized
  if (!authStateManager.isInitialized()) {
    authStateManager.initializeState().then(refreshState);
  }

  return {
    isReady,
    isAuthenticated,
    isLoading,
    error,
    user,
    refreshState
  };
}
