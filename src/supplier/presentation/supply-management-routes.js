const supplierDashboard = () => import('./views/dashboard-supplier.vue');
const supplierOrders = () => import('./views/orders-supplier.vue');
const supplierClients = () => import('./views/clients-supplier.vue');
const supplierDelivery = () => import('./views/delivery-supplier.vue');
const supplierForecast = () => import('./views/demand-forecast.vue');
const supplierCatalog = () => import('./views/catalog-supplier.vue');
const supplierAlerts = () => import('../../shared/presentation/views/alerts-view.vue');
const supplierSettings = () => import('./views/settings-supplier.vue');
const supplierSubscription = () => import('./views/subscription-supplier.vue');

/**
 * Supply Management presentation routes.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const supplyManagementRoutes = [
    { path: '/supplier/dashboard', name: 'supplier-dashboard', component: supplierDashboard, meta: { title: 'Dashboard', role: 'supplier' } },
    { path: '/supplier/orders', name: 'supplier-orders', component: supplierOrders, meta: { title: 'Orders', role: 'supplier' } },
    { path: '/supplier/orders/:orderId/view', name: 'supplier-orders-view', component: supplierOrders, meta: { title: 'Orders', role: 'supplier' } },
    { path: '/supplier/clients', name: 'supplier-clients', component: supplierClients, meta: { title: 'Clients', role: 'supplier' } },
    { path: '/supplier/delivery', name: 'supplier-delivery', component: supplierDelivery, meta: { title: 'Delivery', role: 'supplier' } },
    { path: '/supplier/forecast', name: 'supplier-forecast', component: supplierForecast, meta: { title: 'Forecast', role: 'supplier' } },
    { path: '/supplier/catalog', name: 'supplier-catalog', component: supplierCatalog, meta: { title: 'Catalog', role: 'supplier' } },
    { path: '/supplier/catalog/new', name: 'supplier-catalog-new', component: supplierCatalog, meta: { title: 'Catalog', role: 'supplier' } },
    { path: '/supplier/catalog/:itemId/edit', name: 'supplier-catalog-edit', component: supplierCatalog, meta: { title: 'Catalog', role: 'supplier' } },
    { path: '/supplier/alerts', name: 'supplier-alerts', component: supplierAlerts, meta: { title: 'Alerts', role: 'supplier' } },
    { path: '/supplier/alerts/:alertId/view', name: 'supplier-alerts-view', component: supplierAlerts, meta: { title: 'Alerts', role: 'supplier' } },
    { path: '/supplier/configuration', name: 'supplier-configuration', component: supplierSettings, meta: { title: 'Configuration', role: 'supplier' } },
    { path: '/supplier/subscription', name: 'supplier-subscription', component: supplierSubscription, meta: { title: 'Subscription', role: 'supplier' } },
];

export default supplyManagementRoutes;
