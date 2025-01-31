import { AuthState, IAuthStateManager } from './interfaces/IAuthStateManager';
import AuthService from '../authService';

export class AuthStateManager implements IAuthStateManager {
  private state: AuthState = {
    user: null,
    loading: false,
    error: null,
    initialized: false
  };

  async initializeState(): Promise<void> {
    try {
      this.setLoading(true);
      const user = await AuthService.getCurrentUser();
      this.setUser(user);
    } catch (error) {
      this.setError(error as Error);
    } finally {
      this.setLoading(false);
      this.state.initialized = true;
    }
  }

  getAuthState(): AuthState {
    return { ...this.state };
  }

  isInitialized(): boolean {
    return this.state.initialized;
  }

  setUser(user: any): void {
    this.state.user = user;
    this.state.error = null;
  }

  setError(error: Error | null): void {
    this.state.error = error;
  }

  setLoading(loading: boolean): void {
    this.state.loading = loading;
  }
}

// Create a singleton instance
export const authStateManager = new AuthStateManager();
