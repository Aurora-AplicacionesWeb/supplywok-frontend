const ordersPage = () => import('./views/orders-page.vue');
const purchaseOrderFormPage = () => import('./views/purchase-order-form-page.vue');
const suppliersPage = () => import('./views/suppliers-page.vue');

/**
 * Supply and Purchasing presentation routes.
 *
 * @type {import('vue-router').RouteRecordRaw[]}
 */
const supplyAndPurchasingRoutes = [
    { path: '/purchasing/orders', name: 'restaurant-orders', component: ordersPage, meta: { i18nKey: 'shared.titles.orders', role: 'restaurant' } },
    { path: '/purchasing/orders/new', name: 'restaurant-orders-new', component: purchaseOrderFormPage, meta: { i18nKey: 'shared.titles.create-order', role: 'restaurant' } },
    { path: '/purchasing/orders/:orderId/view', name: 'purchasing-orders-view', component: ordersPage, meta: { i18nKey: 'shared.titles.orders', role: 'restaurant' } },
    { path: '/purchasing/suppliers', name: 'restaurant-suppliers', component: suppliersPage, meta: { i18nKey: 'shared.titles.suppliers', role: 'restaurant' } }
];

export default supplyAndPurchasingRoutes;
