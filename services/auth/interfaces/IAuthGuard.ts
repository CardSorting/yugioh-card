import { Route } from 'vue-router';

export interface AuthRules {
  protectedRoutes: string[];
  protectedOperations: string[];
  evaluate(route: Route): boolean;
}

export interface IAuthGuard {
  canAccess(route: Route): Promise<boolean>;
  handleUnauthorized(route: Route): void;
  handleRoute(route: Route): Promise<void>;
}
