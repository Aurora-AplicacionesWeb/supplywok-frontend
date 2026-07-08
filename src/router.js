import { createRouter, createWebHistory } from 'vue-router';
import operationsRoutes from './operations/presentation/operations-routes.js';
import { inventoryManagementRoutes } from './inventory/presentation/inventory-management-routes.js';
import supplyAndPurchasingRoutes from './purchasing/presentation/supply-and-purchasing-routes.js';
import supplyManagementRoutes from './supplier/presentation/supply-management-routes.js';
import iotRoutes from './iot/presentation/iot-routes.js';
import analyticsRoutes from './analytics/presentation/analytics-routes.js';
import { useIamStore } from './iam/application/iam-store.js';
import useSessionStore from './shared/application/session.store.js';
import { getHomeByRole, getRoleFromPath, getScopedPathByRole, normalizeRole } from './shared/application/role-routing.js';
import i18n from './i18n.js';

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

/**
 * Resolves the best available active role from IAM or the lightweight session store.
 *
 * @returns {string}
 */
function getActiveRole() {
    const iamStore = useIamStore();
    const sessionStore = useSessionStore();

    return normalizeRole(iamStore.currentUserRole) ?? normalizeRole(sessionStore.userRole);
}

function isPublicRoute(to) {
    return ['login', 'register', 'register-complete', 'not-found'].includes(String(to.name ?? ''));
}

const legacyRedirectRoutes = [
    { path: '/dashboard', name: 'dashboard', redirect: () => getHomeByRole(getActiveRole() ?? 'restaurant') },
    { path: '/alerts', name: 'alerts', redirect: () => getScopedPathByRole(getActiveRole() ?? 'restaurant', 'alerts') },
    { path: '/reports', name: 'reports', redirect: '/operations/reports' },
    { path: '/configuration', name: 'configuration', redirect: () => getScopedPathByRole(getActiveRole() ?? 'restaurant', 'configuration') },
    { path: '/subscription', name: 'subscription', redirect: () => getScopedPathByRole(getActiveRole() ?? 'restaurant', 'subscription') },
    { path: '/inventory', name: 'inventory', redirect: '/inventory/items' },
    { path: '/orders', name: 'orders', redirect: '/purchasing/orders' },
    { path: '/orders/new', name: 'orders-new', redirect: '/purchasing/orders/new' },
    { path: '/suppliers', name: 'suppliers', redirect: '/purchasing/suppliers' },
    { path: '/restaurant/dashboard', redirect: '/operations/dashboard' },
    { path: '/restaurant/kitchen', redirect: '/operations/kitchen' },
    { path: '/restaurant/tables', redirect: '/operations/tables' },
    { path: '/restaurant/alerts', redirect: '/iot/alerts' },
    { path: '/restaurant/reports', redirect: '/operations/reports' },
    { path: '/restaurant/configuration', redirect: '/operations/configuration' },
    { path: '/restaurant/subscription', redirect: '/operations/subscription' },
    { path: '/restaurant/inventory', redirect: '/inventory/items' },
    { path: '/restaurant/orders', redirect: '/purchasing/orders' },
    { path: '/restaurant/orders/new', redirect: '/purchasing/orders/new' },
    { path: '/restaurant/suppliers', redirect: '/purchasing/suppliers' },
    { path: '/restaurant/kitchen-tickets', redirect: '/operations/kitchen' },
    { path: '/restaurant/create-kitchen-order', redirect: '/operations/kitchen/new' },
    { path: '/restaurant/tables-and-occupancy', redirect: '/operations/tables' }
];

const loginPage = () => import('./iam/presentation/views/login-view.vue');
const registerPage = () => import('./iam/presentation/views/register-view.vue');
const registerCompletePage = () => import('./subscriptions/presentation/views/register-complete-view.vue');

const routes = [
    ...operationsRoutes,
    ...inventoryManagementRoutes,
    ...supplyAndPurchasingRoutes,
    ...iotRoutes,
    ...supplyManagementRoutes,
    ...analyticsRoutes,
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: loginPage, meta: { i18nKey: 'shared.titles.login' } },
    { path: '/register', name: 'register', component: registerPage, meta: { i18nKey: 'shared.titles.register' } },
    { path: '/register/complete', name: 'register-complete', component: registerCompletePage, meta: { title: 'Complete registration' } },
    ...legacyRedirectRoutes,
    { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { i18nKey: 'shared.titles.not-found' } }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
});

/**
 * Updates document metadata and prevents navigating into another role's scope.
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {import('vue-router').RouteLocationNormalized} from
 * @param {import('vue-router').NavigationGuardNext} next
 * @returns {void}
 */
router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);

    const baseTitle = 'SupplyWok';
    const pageTitle = to.meta?.i18nKey ? i18n.global.t(to.meta.i18nKey) : (to.meta?.title || '');
    document.title = pageTitle ? `${baseTitle} - ${pageTitle}` : baseTitle;

    const iamStore = useIamStore();
    const sessionStore = useSessionStore();
    const currentRole = getActiveRole();
    const requiredRole = getRoleFromPath(to.path);
    const isAuthenticated = iamStore.isAuthenticated;
    const publicRoute = isPublicRoute(to);

    if (!isAuthenticated && !publicRoute) {
        if (requiredRole) sessionStore.clearUserRole();
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (isAuthenticated && to.name === 'login') {
        return next(getHomeByRole(currentRole));
    }

    if (currentRole && requiredRole && currentRole !== requiredRole) {
        return next(getHomeByRole(currentRole));
    }

    return next();
});

export default router;
