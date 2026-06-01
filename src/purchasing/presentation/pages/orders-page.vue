<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import useOrdersStore from '../../application/orders.store.js';
import PurchaseOrderFormPanel from '../components/purchase-order-form-panel.vue';
import PurchaseOrdersTable from '../components/purchase-orders-table.vue';

const { t } = useI18n();
const store = useOrdersStore();
const { purchaseOrders, loading } = storeToRefs(store);
const { fetchPurchaseOrders } = store;

onMounted(() => {
    fetchPurchaseOrders();
});
</script>

<template>
    <section class="orders-page">
        <div>
            <span class="orders-page__kicker">{{ t('supply-and-purchasing.orders-page.kicker') }}</span>
            <h1 class="orders-page__title">{{ t('supply-and-purchasing.orders-page.title') }}</h1>
            <p class="orders-page__description">{{ t('supply-and-purchasing.orders-page.description') }}</p>
        </div>

        <div class="orders-page__workspace">
            <PurchaseOrderFormPanel @saved="fetchPurchaseOrders" />
            <PurchaseOrdersTable :purchase-orders="purchaseOrders" :loading="loading" />
        </div>
    </section>
</template>

<style scoped>
.orders-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.orders-page__kicker {
    display: inline-block;
    color: #a07832;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.orders-page__title {
    margin: 0;
    font-size: clamp(2rem, 2.2vw, 2.4rem);
    line-height: 1;
    color: #342923;
}

.orders-page__description {
    margin: 8px 0 0;
    color: #65594f;
}

.orders-page__workspace {
    display: grid;
    grid-template-columns: minmax(340px, 1fr) minmax(420px, 1fr);
    gap: 18px;
    align-items: start;
}

@media (max-width: 960px) {
    .orders-page__workspace {
        grid-template-columns: 1fr;
    }
}
</style>
