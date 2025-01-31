export interface AuthState {
  user: any | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
}

export interface IAuthStateManager {
  initializeState(): Promise<void>;
  getAuthState(): AuthState;
  isInitialized(): boolean;
  setUser(user: any): void;
  setError(error: Error | null): void;
  setLoading(loading: boolean): void;
}
