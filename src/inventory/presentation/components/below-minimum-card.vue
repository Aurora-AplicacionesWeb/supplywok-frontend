<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import useInventoryManagementStore from '../../application/inventory-management.store.js';

const { t } = useI18n();
const store = useInventoryManagementStore();

const visibleLowStockSupplies = computed(() => {
  return store.lowStockSupplies;
});

onMounted(async () => {
  if (!store.suppliesLoaded) await store.fetchAll();
});

function getStockStatusLabel(item) {
  const status = store.getStockStatus(item);
  return t(`inventoryManagement.stockStatus.${status}`) || status;
}

function getStatusClass(item) {
  const status = store.getStockStatus(item);
  if (status === 'critical') return 'below-minimum-card__badge--critical';
  if (status === 'warning') return 'below-minimum-card__badge--warning';
  return 'below-minimum-card__badge--secondary';
}
</script>

<template>
  <section class="below-minimum-card">
    <div class="below-minimum-card__header">
      <div>
        <h2 class="below-minimum-card__title">{{ t('inventoryManagement.belowMinimum.title') }}</h2>
        <p class="below-minimum-card__caption">
          {{ t('inventoryManagement.belowMinimum.caption', { count: visibleLowStockSupplies.length }) }}
        </p>
      </div>
    </div>

    <div v-if="store.loading && !store.suppliesLoaded" class="below-minimum-card__state">
      {{ t('inventoryManagement.loading') }}
    </div>

    <div v-else-if="!visibleLowStockSupplies.length" class="below-minimum-card__state">
      {{ t('inventoryManagement.belowMinimum.empty') }}
    </div>

    <div v-else class="below-minimum-card__table">
      <div class="below-minimum-card__head">
        <span>{{ t('inventoryManagement.belowMinimum.columns.product') }}</span>
        <span>{{ t('inventoryManagement.belowMinimum.columns.currentStock') }}</span>
        <span>{{ t('inventoryManagement.belowMinimum.columns.status') }}</span>
      </div>

      <div v-for="item in visibleLowStockSupplies" :key="item.id" class="below-minimum-card__row">
        <strong>{{ item.name }}</strong>
        <span>{{ item.currentStock }} {{ item.unitOfMeasure }}</span>
        <span class="below-minimum-card__badge" :class="getStatusClass(item)">
          {{ getStockStatusLabel(item) }}
        </span>
      </div>
    </div>

    <RouterLink to="/inventory/items" class="below-minimum-card__cta">
      {{ t('inventoryManagement.belowMinimum.actions.sortAll') }}
    </RouterLink>
  </section>
</template>

<style scoped>
.below-minimum-card {
  display: grid;
  gap: 14px;
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 14px 34px rgba(45, 36, 30, 0.1);
}

.below-minimum-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.below-minimum-card__title {
  margin: 0;
  color: #40342d;
  font-size: 1.55rem;
}

.below-minimum-card__caption {
  margin: 6px 0 0;
  color: #85786c;
  font-size: 0.92rem;
}

.below-minimum-card__table {
  border: 1px solid #efe6da;
  border-radius: 14px;
  overflow: hidden;
}

.below-minimum-card__head,
.below-minimum-card__row {
  display: grid;
  grid-template-columns: minmax(200px, 2fr) minmax(120px, 1.2fr) minmax(120px, 1fr);
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
}

.below-minimum-card__head {
  background: #f7f0e6;
  color: #6d5f55;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.below-minimum-card__row {
  border-top: 1px solid #efe6da;
  color: #4b3d34;
  font-size: 0.95rem;
}

.below-minimum-card__row strong {
  color: #342923;
}

.below-minimum-card__badge {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.below-minimum-card__badge--critical {
  background: #fee2e2;
  color: #b91c1c;
}

.below-minimum-card__badge--warning {
  background: #fef3c7;
  color: #a16207;
}

.below-minimum-card__badge--secondary {
  background: #ede9e3;
  color: #5e5046;
}

.below-minimum-card__state {
  padding: 18px 4px;
  color: #7d7065;
}

.below-minimum-card__cta {
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

.below-minimum-card__cta:hover {
  background: #faf5ee;
}

@media (max-width: 960px) {
  .below-minimum-card__head,
  .below-minimum-card__row {
    grid-template-columns: 1fr;
  }
}
</style>
