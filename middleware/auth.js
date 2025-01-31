import { RouteAuthGuard, defaultAuthRules } from '~/services/auth/guards/RouteAuthGuard';
import { authStateManager } from '~/services/auth/AuthStateManager';

export default async function ({ route }) {
  const authGuard = new RouteAuthGuard(authStateManager, defaultAuthRules);
  await authGuard.handleRoute(route);
}
