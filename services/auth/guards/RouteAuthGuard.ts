import { Route } from 'vue-router';
import { IAuthGuard, AuthRules } from '../interfaces/IAuthGuard';
import { IAuthStateManager } from '../interfaces/IAuthStateManager';
import { authStateManager } from '../AuthStateManager';

export class RouteAuthGuard implements IAuthGuard {
  constructor(
    private stateManager: IAuthStateManager,
    private rules: AuthRules
  ) {}

  async canAccess(route: Route): Promise<boolean> {
    // Ensure auth is initialized before checking access
    if (!this.stateManager.isInitialized()) {
      await this.stateManager.initializeState();
    }

    const state = this.stateManager.getAuthState();
    if (state.error) {
      console.error('Auth state error:', state.error);
      return false;
    }

    return this.rules.evaluate(route);
  }

  handleUnauthorized(route: Route): void {
    // If it's an API route, let the API handle the 403 error
    if (this.rules.protectedOperations.some(op => route.path.includes(op))) {
      return;
    }
    // For UI routes, redirect to home
    window.location.href = '/';
  }

  async handleRoute(route: Route): Promise<void> {
    const hasAccess = await this.canAccess(route);
    if (!hasAccess) {
      this.handleUnauthorized(route);
    }
  }
}

// Default auth rules
export const defaultAuthRules: AuthRules = {
  protectedRoutes: ['/create'],
  protectedOperations: ['/deck', '/cards'],
  evaluate(route: Route): boolean {
    const state = authStateManager.getAuthState();
    const isAuthenticated = !!state.user;
    
    return !this.protectedRoutes.includes(route.path) && 
           !this.protectedOperations.some(op => route.path.includes(op)) || 
           isAuthenticated;
  }
};
