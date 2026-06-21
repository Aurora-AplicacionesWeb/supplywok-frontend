<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import useSupplierManagementStore from '../../application/supply-management.store.js';
import useOrdersStore from '../../../purchasing/application/orders.store.js';
import useAnalyticsStore from '../../../analytics/application/analytics.store.js';
import { iotStore } from '../../../iot/application/iot-store.js';
import StatCard from '../../../shared/presentation/components/stat-card.vue';
import SupplierActiveRoutesPanel from '../components/supplier-active-routes-panel.vue';
import SupplierAggregateForecastCard from '../../../analytics/presentation/components/aggregate-forecast-card.vue';

const { t } = useI18n();
const store = useSupplierManagementStore();
const ordersStore = useOrdersStore();
const analyticsStore = useAnalyticsStore();
const restaurantIotStore = iotStore();

const {
    deliveryRoutes,
    deliveryRoutesLoaded,
    clients,
    clientsLoaded
} = storeToRefs(store);

const {
    purchaseOrders,
    purchaseOrdersLoaded
} = storeToRefs(ordersStore);

const {
    demandForecast,
    demandForecastLoaded
} = storeToRefs(analyticsStore);

const {
    supplierAlerts: alerts,
    supplierAlertsLoaded: alertsLoaded
} = storeToRefs(restaurantIotStore);

const {
    fetchDeliveryRoutes,
    fetchClients
} = store;

const {
    fetchPurchaseOrders
} = ordersStore;

const {
    fetchDemandForecast
} = analyticsStore;

const {
    fetchSupplierAlerts: fetchAlerts
} = restaurantIotStore;

const aggregateSeries = computed(() => demandForecast.value?.aggregate ?? []);

const ordersReceived = computed(() => purchaseOrders.value.length);
const scheduledDeliveries = computed(() => {
    return deliveryRoutes.value.filter((route) => ['planned', 'in-progress'].includes(route.status)).length;
});
const linkedClients = computed(() => clients.value.length);
const urgentRequests = computed(() => {
    return alerts.value.filter((alert) => alert.status === 'pending').length;
});

const aggregateSummary = computed(() => {
    const first = aggregateSeries.value[0]?.value ?? 0;
    const last = aggregateSeries.value[aggregateSeries.value.length - 1]?.value ?? 0;

    return t('supplier-management.dashboard.aggregate.summary', {
        from: first,
        to: last
    });
});

const activeRoutes = computed(() => {
    const priorityWeight = {
        High: 3,
        Medium: 2,
        Low: 1
    };

    return deliveryRoutes.value
        .filter((route) => ['planned', 'in-progress'].includes(route.status))
        .sort((left, right) => {
            const leftKey = `${left.date ?? ''} ${left.estimatedDeparture ?? ''}`;
            const rightKey = `${right.date ?? ''} ${right.estimatedDeparture ?? ''}`;
            return leftKey.localeCompare(rightKey);
        })
        .slice(0, 3)
        .map((route) => {
            const matchedOrders = route.stops.flatMap((stop) => {
                return purchaseOrders.value.filter((order) => stop.orderCodes?.includes(order.code));
            });

            const priority = matchedOrders.reduce((currentPriority, order) => {
                return priorityWeight[order.priority] > priorityWeight[currentPriority] ? order.priority : currentPriority;
            }, 'Low');

            return {
                id: route.id,
                routeName: route.routeName,
                priority: t(`supplier-management.dashboard.priority.${priority.toLowerCase()}`),
                schedule: t('supplier-management.dashboard.routes.schedule', {
                    stops: route.totalStops,
                    departure: route.estimatedDeparture,
                    arrival: route.estimatedArrival
                }),
                timestamp: t('supplier-management.dashboard.routes.date', {
                    date: route.date
                })
            };
        });
});

const isLoaded = computed(() => {
    return purchaseOrdersLoaded.value &&
        deliveryRoutesLoaded.value &&
        demandForecastLoaded.value &&
        alertsLoaded.value &&
        clientsLoaded.value;
});

onMounted(() => {
    if (!purchaseOrdersLoaded.value) fetchPurchaseOrders();
    if (!deliveryRoutesLoaded.value) fetchDeliveryRoutes();
    if (!demandForecastLoaded.value) fetchDemandForecast();
    if (!alertsLoaded.value) fetchAlerts();
    if (!clientsLoaded.value) fetchClients();
});
</script>

<template>
    <section class="dashboard-page">
        <header class="dashboard-page__header">
            <h1 class="dashboard-page__title">{{ t('supplier-management.dashboard.title') }}</h1>
            <p class="dashboard-page__subtitle">{{ t('supplier-management.dashboard.subtitle') }}</p>
        </header>

        <section class="dashboard-page__stats">
            <StatCard
                icon="pi-shopping-bag"
                icon-class="stat-card__icon--orders"
                :value="ordersReceived"
                :label="t('supplier-management.dashboard.stats.orders-received')"
            />
            <StatCard
                icon="pi-truck"
                icon-class="stat-card__icon--deliveries"
                :value="scheduledDeliveries"
                :label="t('supplier-management.dashboard.stats.scheduled-deliveries')"
            />
            <StatCard
                icon="pi-chart-line"
                icon-class="stat-card__icon--forecast"
                :value="linkedClients"
                :label="t('shared.sidebar.clients')"
            />
            <StatCard
                icon="pi-bell"
                icon-class="stat-card__icon--alerts"
                :value="urgentRequests"
                :label="t('supplier-management.dashboard.stats.urgent-requests')"
                :badge="t('supplier-management.dashboard.stats.alert-badge')"
                badge-class="stat-card__badge--alert"
            />
        </section>

        <section class="dashboard-page__panels">
            <SupplierActiveRoutesPanel
                :title="t('supplier-management.dashboard.routes.title')"
                :routes="activeRoutes"
                :empty-text="isLoaded ? t('supplier-management.dashboard.routes.empty') : t('supplier-management.dashboard.loading')"
            />

            <SupplierAggregateForecastCard
                :title="t('supplier-management.dashboard.aggregate.title')"
                :summary="aggregateSummary"
                :series="aggregateSeries"
                :empty-text="isLoaded ? t('supplier-management.dashboard.aggregate.empty') : t('supplier-management.dashboard.loading')"
            />
        </section>
    </section>
</template>

<style scoped>
.dashboard-page {
    min-height: 100%;
    color: #2d241e;
    font-family: 'Montserrat', system-ui, sans-serif;
}

.dashboard-page__header {
    margin-bottom: 28px;
}

.dashboard-page__title {
    margin: 0;
    color: #746c66;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 33px;
    line-height: 1.1;
}

.dashboard-page__subtitle {
    margin: 12px 0 0;
    color: #5e544c;
    font-size: 16px;
}

.dashboard-page__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
    margin-bottom: 34px;
}

.dashboard-page__panels {
    display: grid;
    grid-template-columns: 1.05fr 1fr;
    gap: 32px;
}

@media (max-width: 1180px) {
    .dashboard-page__stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dashboard-page__panels {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 700px) {
    .dashboard-page__stats {
        grid-template-columns: 1fr;
    }
}
</style>
