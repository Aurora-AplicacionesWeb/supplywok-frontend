const restaurantReports = () => import('./views/restaurant-reports.vue');
const supplierForecast = () => import('./views/supplier-demand-forecast.vue');

const analyticsRoutes = [
    {
        path: '/operations/reports',
        name: 'restaurant-reports',
        component: restaurantReports,
        meta: {
            i18nKey: 'shared.titles.reports',
            role: 'restaurant'
        }
    },
    {
        path: '/supplier/forecast',
        name: 'supplier-forecast',
        component: supplierForecast,
        meta: {
            i18nKey: 'supplier-management.forecast.title',
            role: 'supplier'
        }
    }
];

export default analyticsRoutes;
