<template>
  <IotStatCard
    iconSrc="/images/icons/orders-icon.svg"
    :value="pendingCount"
    label="supplyAndPurchasing.dashboard.pendingOrders.label"
  />
</template>

<script setup>
import { computed } from 'vue';
import IotStatCard from '../../../../iot/presentation/components/stat-cards/iot-stat-card.vue';
import useOrdersStore from '../../../application/orders.store.js';

const store = useOrdersStore();

const pendingCount = computed(() => store.pendingPurchaseOrdersCount);
</script>
