<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useOrdersStore from '../../application/orders.store.js';

const props = defineProps({
    maxItems: {
        type: Number,
        default: 3
    }
});

const { t } = useI18n();
const store = useOrdersStore();
const { purchaseOrders, purchaseOrdersCount, purchaseOrdersLoaded, loading, errors } = storeToRefs(store);
const { ensurePurchaseOrdersLoaded } = store;

const visiblePurchaseOrders = computed(() => {
    return [...purchaseOrders.value]
        .sort((left, right) => toTimestamp(right.orderDate) - toTimestamp(left.orderDate))
        .slice(0, props.maxItems);
});

onMounted(() => {
    ensurePurchaseOrdersLoaded();
});

function getStatusLabel(status) {
    const translations = {
        'Pending': t('supply-and-purchasing.shared.status.pending'),
        'In Preparation': t('supply-and-purchasing.shared.status.in-preparation'),
        'Confirmed': t('supply-and-purchasing.shared.status.confirmed'),
        'In Transit': t('supply-and-purchasing.shared.status.in-transit'),
        'Delivered': t('supply-and-purchasing.shared.status.delivered'),
        'Delayed': t('supply-and-purchasing.shared.status.delayed')
    };

    return translations[status] ?? status;
}

function getStatusClass(status) {
    if (status === 'Pending') return 'orders-summary-card__badge--warning';
    if (status === 'In Preparation' || status === 'Confirmed' || status === 'In Transit') return 'orders-summary-card__badge--info';
    if (status === 'Delivered') return 'orders-summary-card__badge--success';
    if (status === 'Delayed') return 'orders-summary-card__badge--danger';
    return 'orders-summary-card__badge--secondary';
}

function formatCode(purchaseOrder) {
    return purchaseOrder.code ? `#${purchaseOrder.code}` : `#PO-${String(purchaseOrder.id ?? '').padStart(4, '0')}`;
}

function formatOrderDate(orderDate) {
    if (!orderDate) {
        return '-';
    }

    const parsedDate = new Date(orderDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return orderDate;
    }

    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(parsedDate);
}

function toTimestamp(orderDate) {
    const parsedDate = new Date(orderDate);
    return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}
</script>

<template>
    <section class="orders-summary-card">
        <div class="orders-summary-card__header">
            <div>
                <h2 class="orders-summary-card__title">{{ t('supply-and-purchasing.summary-card.title') }}</h2>
                <p class="orders-summary-card__caption">
                    {{ t('supply-and-purchasing.summary-card.caption', { count: purchaseOrdersCount }) }}
                </p>
            </div>
        </div>

        <div v-if="loading && !purchaseOrdersLoaded" class="orders-summary-card__state">
            {{ t('supply-and-purchasing.summary-card.loading') }}
        </div>

        <div v-else-if="errors.length && !purchaseOrders.length" class="orders-summary-card__state orders-summary-card__state--error">
            {{ t('supply-and-purchasing.summary-card.error') }}
        </div>

        <div v-else class="orders-summary-card__table">
            <div class="orders-summary-card__head">
                <span>{{ t('supply-and-purchasing.summary-card.columns.id') }}</span>
                <span>{{ t('supply-and-purchasing.summary-card.columns.supplier') }}</span>
                <span>{{ t('supply-and-purchasing.summary-card.columns.status') }}</span>
                <span>{{ t('supply-and-purchasing.summary-card.columns.date') }}</span>
            </div>

            <div v-for="purchaseOrder in visiblePurchaseOrders" :key="purchaseOrder.id" class="orders-summary-card__row">
                <strong>{{ formatCode(purchaseOrder) }}</strong>
                <span>{{ purchaseOrder.supplierName || '-' }}</span>
                <span class="orders-summary-card__badge" :class="getStatusClass(purchaseOrder.status)">
                    {{ getStatusLabel(purchaseOrder.status) }}
                </span>
                <span>{{ formatOrderDate(purchaseOrder.orderDate) }}</span>
            </div>

            <div v-if="!visiblePurchaseOrders.length" class="orders-summary-card__state">
                {{ t('supply-and-purchasing.summary-card.empty') }}
            </div>
        </div>

        <RouterLink :to="{ name: 'restaurant-orders' }" class="orders-summary-card__cta">
            {{ t('supply-and-purchasing.summary-card.actions.view-history') }}
        </RouterLink>
    </section>
</template>

<style scoped>
.orders-summary-card {
    display: grid;
    gap: 14px;
    background: #ffffff;
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 14px 34px rgba(45, 36, 30, 0.1);
}

.orders-summary-card__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: start;
}

.orders-summary-card__title {
    margin: 0;
    color: #40342d;
    font-size: 1.55rem;
}

.orders-summary-card__caption {
    margin: 6px 0 0;
    color: #85786c;
    font-size: 0.92rem;
}

.orders-summary-card__table {
    border: 1px solid #efe6da;
    border-radius: 14px;
    overflow: hidden;
}

.orders-summary-card__head,
.orders-summary-card__row {
    display: grid;
    grid-template-columns: minmax(110px, 0.9fr) minmax(0, 1.5fr) minmax(120px, 0.9fr) minmax(110px, 0.8fr);
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
}

.orders-summary-card__head {
    background: #f7f0e6;
    color: #6d5f55;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.orders-summary-card__row {
    border-top: 1px solid #efe6da;
    color: #4b3d34;
    font-size: 0.95rem;
}

.orders-summary-card__row strong {
    color: #342923;
}

.orders-summary-card__badge {
    display: inline-flex;
    width: fit-content;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}

.orders-summary-card__badge--warning {
    background: #fef3c7;
    color: #a16207;
}

.orders-summary-card__badge--info {
    background: #dbeafe;
    color: #1d4ed8;
}

.orders-summary-card__badge--success {
    background: #dcfce7;
    color: #15803d;
}

.orders-summary-card__badge--danger {
    background: #fee2e2;
    color: #b91c1c;
}

.orders-summary-card__badge--secondary {
    background: #ede9e3;
    color: #5e5046;
}

.orders-summary-card__state {
    padding: 18px 4px;
    color: #7d7065;
}

.orders-summary-card__state--error {
    color: #b91c1c;
}

.orders-summary-card__cta {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    min-height: 44px;
    border: 1px solid #e4d8ca;
    border-radius: 10px;
    color: #342923;
    text-decoration: none;
    font-weight: 600;
    background: #fffdfa;
}

.orders-summary-card__cta:hover {
    background: #faf5ee;
}

@media (max-width: 960px) {
    .orders-summary-card__head,
    .orders-summary-card__row {
        grid-template-columns: 1fr;
    }
}
</style>
