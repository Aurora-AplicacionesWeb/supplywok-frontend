const restaurantReports = () => import('./views/restaurant-reports.vue');
const supplierForecast = () => import('./views/supplier-demand-forecast.vue');

const analyticsRoutes = [
    {
        path: '/operations/reports',
        name: 'restaurant-reports',
        component: restaurantReports,
        meta: {
            title: 'Reports',
            role: 'restaurant'
        }
    },
    {
        path: '/supplier/forecast',
        name: 'supplier-forecast',
        component: supplierForecast,
        meta: {
            title: 'Forecast',
            role: 'supplier'
        }
    }
];

export default analyticsRoutes;
