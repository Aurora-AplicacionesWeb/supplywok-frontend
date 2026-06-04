const placeholderPage = () => import('../../shared/presentation/views/placeholder-page.vue');
const configurationPage = () => import('../../shared/presentation/views/configuration-page.vue');
const subscriptionPage = () => import('../../shared/presentation/views/subscription-page.vue');

const dishMenuView = () => import('./views/dish-menu-view.vue');
const createKitchenOrderView = () => import('./views/create-kitchen-order-view.vue');
const kitchenTicketsView = () => import('./views/kitchen-tickets-view.vue');
const tablesAndOccupancyView = () => import('./views/tables-and-occupancy-view.vue');

const operationsRoutes = [
    { path: '/operations/dashboard', name: 'restaurant-dashboard', component: placeholderPage, meta: { i18nKey: 'shared.titles.dashboard', role: 'restaurant', isDashboard: true } },
    { path: '/operations/kitchen', name: 'kitchen-tickets-view', component: kitchenTicketsView, meta: { i18nKey: 'shared.titles.kitchen-tickets', role: 'restaurant' } },
    { path: '/operations/kitchen/new', name: 'create-kitchen-order-view', component: createKitchenOrderView, meta: { i18nKey: 'shared.titles.create-kitchen-order', role: 'restaurant' } },
    { path: '/operations/kitchen/:orderId/edit', name: 'create-kitchen-order-edit', component: createKitchenOrderView, meta: { i18nKey: 'shared.titles.create-kitchen-order', role: 'restaurant' } },
    { path: '/operations/tables', name: 'restaurant-tables', component: tablesAndOccupancyView, meta: { i18nKey: 'shared.titles.tables', role: 'restaurant' } },
    { path: '/operations/tables/new', name: 'operations-tables-new', component: tablesAndOccupancyView, meta: { i18nKey: 'shared.titles.tables', role: 'restaurant' } },
    { path: '/operations/tables/:tableId/view', name: 'operations-tables-view', component: tablesAndOccupancyView, meta: { i18nKey: 'shared.titles.tables', role: 'restaurant' } },
    { path: '/operations/configuration', name: 'restaurant-configuration', component: configurationPage, meta: { i18nKey: 'shared.titles.configuration', role: 'restaurant' } },
    { path: '/operations/subscription', name: 'restaurant-subscription', component: subscriptionPage, meta: { i18nKey: 'shared.titles.subscription', role: 'restaurant' } },
    { path: '/operations/dish-menu', name: 'dish-menu-view', component: dishMenuView, meta: { i18nKey: 'shared.titles.dish-menu', role: 'restaurant' } }
];

export default operationsRoutes;
