<template>
  <IotStatCard
      iconSrc="/images/icons/kitchen-ticket-icon.svg"
      :value="activeCount"
      label="operations.dashboard.activeOrders.label"
  />
</template>

<script setup>
import { computed } from 'vue';
import IotStatCard from '../../../../iot/presentation/components/stat-cards/iot-stat-card.vue';
import useOperationsStore from '../../../application/operations.store.js';

const store = useOperationsStore();

const activeCount = computed(() => store.activeKitchenOrders.length);
</script>
