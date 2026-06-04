<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import KitchenOrderCard from '../kitchen-order-card.vue';
import useOperationsStore from '../../../application/operations.store.js';

const store = useOperationsStore();
const router = useRouter();

const MAX_VISIBLE = 3;

const visibleOrders = computed(() =>
    store.activeKitchenOrders.slice(0, MAX_VISIBLE)
);

function getTableCode(order) {
  const table = store.tables.find(t => String(t.id) === String(order.tableId));
  return table ? (table.code || String(table.number).padStart(2, '0')) : '';
}

function handleStatusChange({ orderId, newState }) {
  store.updateKitchenOrderStatus(orderId, newState);
}

function goToKitchenTickets() {
  router.push({ name: 'kitchen-tickets-view' });
}
</script>

<template>
  <div class="kt-panel-card">
    <div class="kt-header-section">
      <div class="kt-title-container">
        <img src="/images/icons/kitchen-ticket-icon.svg" alt="kitchen tickets" class="kt-icon" />
        <h2 class="kt-title">{{ $t('operations.dashboard.kitchenTickets.title') }}</h2>
      </div>
    </div>

    <div class="kt-order-list">
      <KitchenOrderCard
          v-for="order in visibleOrders"
          :key="order.id"
          :order="order"
          :tableCode="getTableCode(order)"
          @status-change="handleStatusChange"
      />
      <div v-if="store.activeKitchenOrders.length === 0" class="kt-empty">
        <i class="pi pi-inbox" style="font-size: 24px; color: #ccc;" />
        <p>{{ $t('operations.kitchenTicketsPage.noOrders') }}</p>
      </div>
    </div>

    <div class="kt-footer">
      <Button
          :label="$t('operations.dashboard.kitchenTickets.seeAll')"
          icon="pi pi-arrow-right"
          severity="secondary"
          size="small"
          text
          @click="goToKitchenTickets"
      />
    </div>
  </div>
</template>


<style scoped>
.kt-panel-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.kt-header-section {
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.kt-title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kt-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.kt-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #3b4256;
}

.kt-order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  overflow-y: auto;
  max-height: 500px;
}

.kt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #999;
  font-size: 13px;
}

.kt-footer {
  padding: 12px 20px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  justify-content: flex-end;
}
</style>
