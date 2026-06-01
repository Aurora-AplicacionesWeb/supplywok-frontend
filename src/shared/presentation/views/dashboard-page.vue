<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import useInventoryManagementStore from '../../../inventory/application/inventory-management.store.js';
import { iotStore } from '../../../iot/application/iot-store.js';
import useOrdersStore from '../../../purchasing/application/orders.store.js';
import useRestaurantManagementStore from '../../../operations/application/restaurant-management.store.js';

const inventoryStore = useInventoryManagementStore();
const monitoringStore = iotStore();
const purchaseStore = useOrdersStore();
const restaurantStore = useRestaurantManagementStore();

const { inventoryItems, lowStockItems } = storeToRefs(inventoryStore);
const { sensors, activeAlerts, occupiedTablePercentage } = storeToRefs(monitoringStore);
const { purchaseOrders, pendingPurchaseOrdersCount } = storeToRefs(purchaseStore);
const { activeKitchenOrders, occupiedTables } = storeToRefs(restaurantStore);

const highlightedSensors = computed(() => sensors.value.slice(0, 4));

const highlightedInventory = computed(() => {
    return [...lowStockItems.value]
        .sort((left, right) => left.getStockGap() - right.getStockGap())
        .slice(0, 5);
});

const highlightedOrders = computed(() => {
    return [...purchaseOrders.value]
        .sort((left, right) => toTimestamp(right.orderDate) - toTimestamp(left.orderDate))
        .slice(0, 4);
});

const highlightedKitchenOrders = computed(() => {
    return [...activeKitchenOrders.value]
        .sort((left, right) => toTimestamp(right.dateCreated) - toTimestamp(left.dateCreated))
        .slice(0, 4);
});

const inventoryHealth = computed(() => {
    if (!inventoryItems.value.length) {
        return 0;
    }

    const healthyItems = inventoryItems.value.filter((item) => item.getStockStatus() === 'healthy').length;
    return Math.round((healthyItems / inventoryItems.value.length) * 100);
});

onMounted(async () => {
    await Promise.allSettled([
        inventoryStore.fetchAll(),
        monitoringStore.loadSensors(),
        purchaseStore.ensurePurchaseOrdersLoaded(),
        restaurantStore.fetchKitchenOrders(),
        restaurantStore.fetchTables()
    ]);
});

function toTimestamp(value) {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function formatDate(value) {
    if (!value) {
        return 'Sin fecha';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('es-PE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(parsedDate);
}

function getSensorStatus(sensor) {
    if (!sensor?.enabled) {
        return { label: 'Desconectado', tone: 'muted' };
    }

    const isOutOfRange = sensor.lastValue < sensor.minValue || sensor.lastValue > sensor.maxValue;
    if (isOutOfRange) {
        return { label: 'Fuera de rango', tone: 'critical' };
    }

    return { label: 'Estable', tone: 'healthy' };
}

function getKitchenStatusLabel(order) {
    const labels = {
        pending: 'Pendiente',
        in_preparation: 'En preparacion',
        ready: 'Lista',
        delivered: 'Entregada',
        cancelled: 'Anulada'
    };

    return labels[order?.state] ?? 'Sin estado';
}

function getKitchenStatusTone(order) {
    if (order?.state === 'ready') return 'healthy';
    if (order?.state === 'in_preparation') return 'warning';
    if (order?.state === 'pending') return 'muted';
    return 'critical';
}

function getOrderStatusTone(status) {
    if (status === 'Delivered') return 'healthy';
    if (status === 'In Preparation') return 'warning';
    if (status === 'Pending') return 'critical';
    return 'muted';
}
</script>

<template>
    <section class="dashboard-page">
        <header class="dashboard-page__hero">
            <div>
                <span class="dashboard-page__kicker">Centro operativo</span>
                <h1 class="dashboard-page__title">Dashboard principal</h1>
                <p class="dashboard-page__description">
                    Resume inventario, sensores, comandas y pedidos abiertos en una sola vista para reaccionar rapido.
                </p>
            </div>

            <div class="dashboard-page__hero-actions">
                <RouterLink to="/purchasing/orders/new" class="dashboard-page__primary-action">Crear pedido</RouterLink>
                <RouterLink to="/iot/alerts" class="dashboard-page__secondary-action">Revisar alertas</RouterLink>
            </div>
        </header>

        <div class="dashboard-page__metrics">
            <article class="metric-card">
                <span class="metric-card__label">Items saludables</span>
                <strong class="metric-card__value">{{ inventoryHealth }}%</strong>
                <p class="metric-card__hint">{{ highlightedInventory.length }} productos requieren reposicion</p>
            </article>

            <article class="metric-card">
                <span class="metric-card__label">Alertas activas</span>
                <strong class="metric-card__value">{{ activeAlerts.length }}</strong>
                <p class="metric-card__hint">Temperatura, stock y ocupacion fuera de rango</p>
            </article>

            <article class="metric-card">
                <span class="metric-card__label">Mesas ocupadas</span>
                <strong class="metric-card__value">{{ occupiedTablePercentage ?? 0 }}%</strong>
                <p class="metric-card__hint">{{ occupiedTables.length }} mesas en servicio ahora</p>
            </article>

            <article class="metric-card">
                <span class="metric-card__label">Pedidos pendientes</span>
                <strong class="metric-card__value">{{ pendingPurchaseOrdersCount }}</strong>
                <p class="metric-card__hint">Seguimiento rapido a proveedores prioritarios</p>
            </article>
        </div>

        <div class="dashboard-page__grid">
            <article class="dashboard-card">
                <div class="dashboard-card__header">
                    <div>
                        <span class="dashboard-card__eyebrow">Sensores</span>
                        <h2 class="dashboard-card__title">Panel operativo</h2>
                    </div>
                    <RouterLink to="/iot/alerts" class="dashboard-card__link">Ver incidencias</RouterLink>
                </div>

                <div class="sensor-list">
                    <article v-for="sensor in highlightedSensors" :key="sensor.id" class="sensor-row">
                        <div>
                            <strong>{{ sensor.name }}</strong>
                            <p>Rango {{ sensor.minValue }} - {{ sensor.maxValue }}</p>
                        </div>

                        <div class="sensor-row__meta">
                            <span class="sensor-row__value">{{ sensor.lastValue }}</span>
                            <span class="status-pill" :class="`status-pill--${getSensorStatus(sensor).tone}`">
                                {{ getSensorStatus(sensor).label }}
                            </span>
                        </div>
                    </article>

                    <p v-if="!highlightedSensors.length" class="dashboard-card__empty">
                        No hay sensores cargados en este entorno.
                    </p>
                </div>
            </article>

            <article class="dashboard-card">
                <div class="dashboard-card__header">
                    <div>
                        <span class="dashboard-card__eyebrow">Cocina</span>
                        <h2 class="dashboard-card__title">Comandas activas</h2>
                    </div>
                    <RouterLink to="/operations/kitchen" class="dashboard-card__link">Abrir cocina</RouterLink>
                </div>

                <div class="ticket-list">
                    <article v-for="order in highlightedKitchenOrders" :key="order.id" class="ticket-row">
                        <div>
                            <strong>{{ order.number }}</strong>
                            <p>{{ order.tableNumber ? `Mesa ${order.tableNumber}` : 'Para llevar' }}</p>
                        </div>

                        <div class="ticket-row__meta">
                            <span>{{ formatDate(order.dateCreated) }}</span>
                            <span class="status-pill" :class="`status-pill--${getKitchenStatusTone(order)}`">
                                {{ getKitchenStatusLabel(order) }}
                            </span>
                        </div>
                    </article>

                    <p v-if="!highlightedKitchenOrders.length" class="dashboard-card__empty">
                        No hay comandas activas para mostrar.
                    </p>
                </div>
            </article>

            <article class="dashboard-card">
                <div class="dashboard-card__header">
                    <div>
                        <span class="dashboard-card__eyebrow">Inventario</span>
                        <h2 class="dashboard-card__title">Productos con bajo stock</h2>
                    </div>
                    <RouterLink to="/inventory/items" class="dashboard-card__link">Ir a inventario</RouterLink>
                </div>

                <div class="inventory-list">
                    <article v-for="item in highlightedInventory" :key="item.id" class="inventory-row">
                        <div>
                            <strong>{{ item.name }}</strong>
                            <p>{{ item.currentStock }} disponibles de {{ item.minimumStockLevel }} minimos</p>
                        </div>

                        <div class="inventory-row__bar">
                            <div class="inventory-row__bar-fill" :style="{ width: `${item.getStockLevelPercentage()}%` }"></div>
                        </div>
                    </article>

                    <p v-if="!highlightedInventory.length" class="dashboard-card__empty">
                        No hay productos criticos por ahora.
                    </p>
                </div>
            </article>

            <article class="dashboard-card">
                <div class="dashboard-card__header">
                    <div>
                        <span class="dashboard-card__eyebrow">Abastecimiento</span>
                        <h2 class="dashboard-card__title">Pedidos recientes</h2>
                    </div>
                    <RouterLink to="/purchasing/orders" class="dashboard-card__link">Abrir pedidos</RouterLink>
                </div>

                <div class="order-list">
                    <article v-for="purchaseOrder in highlightedOrders" :key="purchaseOrder.id" class="order-row">
                        <div>
                            <strong>#PO-{{ String(purchaseOrder.id).padStart(4, '0') }}</strong>
                            <p>{{ purchaseOrder.supplierName }}</p>
                        </div>

                        <div class="order-row__meta">
                            <span>{{ formatDate(purchaseOrder.orderDate) }}</span>
                            <span class="status-pill" :class="`status-pill--${getOrderStatusTone(purchaseOrder.status)}`">
                                {{ purchaseOrder.status }}
                            </span>
                        </div>
                    </article>

                    <p v-if="!highlightedOrders.length" class="dashboard-card__empty">
                        No hay pedidos recientes cargados.
                    </p>
                </div>
            </article>
        </div>
    </section>
</template>

<style scoped>
.dashboard-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.dashboard-page__hero {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: flex-start;
    padding: 24px 28px;
    border-radius: 24px;
    background:
        radial-gradient(circle at top right, rgba(233, 184, 36, 0.28), transparent 32%),
        linear-gradient(135deg, #ffffff 0%, #f7efe4 100%);
    box-shadow: 0 18px 40px rgba(47, 36, 29, 0.08);
}

.dashboard-page__kicker,
.dashboard-card__eyebrow {
    display: inline-block;
    color: #a07832;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.dashboard-page__title {
    margin: 8px 0 10px;
    color: #2f241d;
    font-size: clamp(2rem, 3vw, 2.75rem);
}

.dashboard-page__description {
    max-width: 760px;
    color: #6e6157;
    line-height: 1.6;
}

.dashboard-page__hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.dashboard-page__primary-action,
.dashboard-page__secondary-action,
.dashboard-card__link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
}

.dashboard-page__primary-action {
    background: #c21204;
    color: #ffffff;
}

.dashboard-page__secondary-action,
.dashboard-card__link {
    border: 1px solid #e7d8c8;
    background: #fffdf9;
    color: #2f241d;
}

.dashboard-page__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
}

.metric-card,
.dashboard-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 18px 40px rgba(47, 36, 29, 0.08);
}

.metric-card {
    padding: 20px;
}

.metric-card__label {
    color: #8b7a6d;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.metric-card__value {
    display: block;
    margin-top: 12px;
    color: #2f241d;
    font-size: clamp(1.9rem, 2.6vw, 2.5rem);
    line-height: 1;
}

.metric-card__hint {
    margin-top: 8px;
    color: #6e6157;
    line-height: 1.5;
}

.dashboard-page__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
}

.dashboard-card {
    padding: 22px;
}

.dashboard-card__header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 20px;
}

.dashboard-card__title {
    margin: 8px 0 0;
    color: #2f241d;
    font-size: 1.45rem;
}

.dashboard-card__empty {
    margin: 0;
    color: #8b7a6d;
}

.sensor-list,
.ticket-list,
.inventory-list,
.order-list {
    display: grid;
    gap: 12px;
}

.sensor-row,
.ticket-row,
.inventory-row,
.order-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    padding: 14px 16px;
    border-radius: 16px;
    background: #fbf7f0;
    border: 1px solid #efe3d5;
}

.sensor-row strong,
.ticket-row strong,
.inventory-row strong,
.order-row strong {
    color: #2f241d;
}

.sensor-row p,
.ticket-row p,
.inventory-row p,
.order-row p {
    margin: 4px 0 0;
    color: #7f7064;
    font-size: 0.92rem;
}

.sensor-row__meta,
.ticket-row__meta,
.order-row__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    color: #6e6157;
    font-size: 0.88rem;
}

.sensor-row__value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2f241d;
}

.inventory-row {
    flex-direction: column;
    align-items: stretch;
}

.inventory-row__bar {
    width: 100%;
    height: 10px;
    margin-top: 12px;
    border-radius: 999px;
    background: #eadfce;
    overflow: hidden;
}

.inventory-row__bar-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #c21204 0%, #e9b824 100%);
}

.status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.status-pill--healthy {
    background: #dff3df;
    color: #216a31;
}

.status-pill--warning {
    background: #fef0c8;
    color: #9a6400;
}

.status-pill--critical {
    background: #fee2e2;
    color: #a21d1d;
}

.status-pill--muted {
    background: #ede6dd;
    color: #6e6157;
}

@media (max-width: 1120px) {
    .dashboard-page__metrics,
    .dashboard-page__grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 768px) {
    .dashboard-page__hero,
    .dashboard-page__metrics,
    .dashboard-page__grid {
        grid-template-columns: 1fr;
        flex-direction: column;
    }

    .dashboard-page__metrics,
    .dashboard-page__grid {
        display: grid;
    }

    .sensor-row,
    .ticket-row,
    .order-row {
        flex-direction: column;
        align-items: flex-start;
    }

    .sensor-row__meta,
    .ticket-row__meta,
    .order-row__meta {
        align-items: flex-start;
    }
}
</style>
