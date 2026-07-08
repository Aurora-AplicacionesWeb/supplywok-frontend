import { useIamStore } from "../application/iam-store.js";

/**
 * Navigation guard that protects non-public routes for anonymous users.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Current route.
 * @param {Function} next - Callback to proceed with navigation.
 * @returns {boolean | { name: string}}
 */
export const authenticationGuard = (to, from, next) => {
    const store = useIamStore();
    const isAnonymous = !store.isAuthenticated;
    const publicRoutes = ['/login', '/register', '/register/complete', '/about', '/page-not-found'];
    const routeRequiresToBeAuthenticated = !publicRoutes.includes(to.path);
    if (isAnonymous && routeRequiresToBeAuthenticated) return { name: 'login' };
    console.log(`Navigation from ${from.path} to ${to.path}`);
    return next();
};
