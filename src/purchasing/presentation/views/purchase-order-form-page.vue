<script setup>
import { useI18n } from 'vue-i18n';
import PurchaseOrderFormPanel from '../components/purchase-order-form-panel.vue';

const { t } = useI18n();
</script>

<template>
    <section class="purchase-order-form-page">
        <div class="purchase-order-form-page__header">
            <span class="purchase-order-form-page__kicker">{{ t('supply-and-purchasing.purchase-order-form-page.kicker') }}</span>
            <h1>{{ t('supply-and-purchasing.purchase-order-form-page.title') }}</h1>
            <p>{{ t('supply-and-purchasing.purchase-order-form-page.description') }}</p>
        </div>
        <PurchaseOrderFormPanel />
    </section>
</template>

<style scoped>
.purchase-order-form-page {

}
</style>
