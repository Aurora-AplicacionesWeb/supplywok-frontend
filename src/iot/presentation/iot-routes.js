const iotAlertsView = () => import('./views/alerts-restaurant.vue');
const iotSensorsView = () => import('./views/sensors-restaurant.vue');

const iotRoutes = [
  { path: '/iot/alerts', name: 'restaurant-alerts', component: iotAlertsView, meta: { i18nKey: 'shared.titles.alerts', role: 'restaurant' } },
  { path: '/iot/alerts/:alertId/view', name: 'iot-alerts-view', component: iotAlertsView, meta: { i18nKey: 'shared.titles.alerts', role: 'restaurant' } },
  { path: '/iot/sensors', name: 'restaurant-sensors', component: iotSensorsView, meta: { i18nKey: 'shared.titles.sensors', role: 'restaurant' } }
];

export default iotRoutes;
