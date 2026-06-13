<script setup>
import { useRouter } from 'vue-router';
import InventoryDataTable from '../components/inventory-data-table.component.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

function goToCreate() {
  router.push('/inventory/items/new');
}
</script>

<template>
  <section class="inventory-management-view">
    <header class="inventory-management-view__hero">
      <div>
        <span class="inventory-management-view__kicker">{{ t('inventoryManagement.page.kicker') }}</span>
        <h1 class="inventory-management-view__title">{{ t('inventoryManagement.page.title') }}</h1>
        <p class="inventory-management-view__description">
          {{ t('inventoryManagement.page.description') }}
        </p>
      </div>

      <button type="button" class="inventory-management-view__action" @click="goToCreate">
        <i class="pi pi-plus"></i>
        <span>{{ t('inventoryManagement.page.actions.add') }}</span>
      </button>
    </header>

    <InventoryDataTable />
  </section>
</template>

<style scoped>
.inventory-management-view {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.inventory-management-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  padding: 12px 6px 0;
}

.inventory-management-view__kicker {
  display: inline-block;
  color: #a07832;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.inventory-management-view__title {
  margin: 10px 0 8px;
  color: #221b2a;
  font-size: clamp(2.6rem, 4vw, 3.3rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.inventory-management-view__description {
  color: #5b5247;
  font-size: 1.03rem;
}

.inventory-management-view__action {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  min-height: 52px;
  padding: 0 22px;
  border: none;
  border-radius: 16px;
  background: #2d241e;
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 600;
  text-transform: lowercase;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(45, 36, 30, 0.16);
}

.inventory-management-view__action i {
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .inventory-management-view__hero {
    flex-direction: column;
  }
}
</style>
