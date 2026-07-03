<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import useInventoryManagementStore from '../../application/inventory-management.store.js';

const { t } = useI18n();
const store = useInventoryManagementStore();
const router = useRouter();

const searchTerm = ref('');
const selectedCategory = ref('');
const currentPage = ref(1);
const rowsPerPage = 6;

const categories = computed(() => {
  return [...new Set(store.supplies.map((item) => item.category).filter(Boolean))].sort();
});

const filteredRows = computed(() => {
  const normalizedQuery = searchTerm.value.trim().toLowerCase();

  return store.supplies.filter((item) => {
    const matchesCategory = !selectedCategory.value || item.category === selectedCategory.value;
    const matchesQuery = !normalizedQuery || [
      item.name,
      item.category,
      item.supplierName,
      String(item.id)
    ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
});

const paginatedRows = computed(() => {
  const startIndex = (currentPage.value - 1) * rowsPerPage;
  return filteredRows.value.slice(startIndex, startIndex + rowsPerPage);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredRows.value.length / rowsPerPage));
});

const visibleCountText = computed(() => t('inventoryManagement.table.footer.showing', {
  visible: paginatedRows.value.length,
  total: filteredRows.value.length
}));

function goToPreviousPage() {
  currentPage.value = Math.max(1, currentPage.value - 1);
}

function goToNextPage() {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
}

function getStatusTone(item) {
  return store.getStockStatus(item);
}

function getProgressWidth(item) {
  return `${store.getStockLevelPercentage(item)}%`;
}

function getStockAlert(item) {
  const status = store.getStockStatus(item);
  if (status === 'critical') return t('inventoryManagement.stockStatus.critical');
  if (status === 'warning') return t('inventoryManagement.stockStatus.warning');
  return '';
}

function handleSearchInput() {
  currentPage.value = 1;
}

function handleCategoryChange() {
  currentPage.value = 1;
}

function openEditItem(row) {
  router.push(`/inventory/items/${row.id}/edit`);
}

function openDeleteItem(row) {
  if (confirm(t('inventoryManagement.table.actions.delete'))) {
    store.deleteSupply(row.id);
  }
}

onMounted(() => {
  if (!store.suppliesLoaded) {
    store.fetchAll();
  }
});
</script>

<template>
  <section class="inventory-table-card">
    <div class="inventory-table-card__filters">
      <label class="inventory-table-card__filter">
        <span>{{ t('inventoryManagement.table.search') }}</span>
        <div class="inventory-table-card__input-shell">
          <i class="pi pi-search"></i>
          <input
            v-model="searchTerm"
            type="text"
            :placeholder="t('inventoryManagement.table.searchPlaceholder')"
            @input="handleSearchInput"
          >
        </div>
      </label>

      <label class="inventory-table-card__filter">
        <span>{{ t('inventoryManagement.table.category') }}</span>
        <div class="inventory-table-card__input-shell">
          <i class="pi pi-search"></i>
          <select v-model="selectedCategory" @change="handleCategoryChange">
            <option value="">{{ t('inventoryManagement.table.allCategories') }}</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
          <i class="pi pi-chevron-down inventory-table-card__select-icon"></i>
        </div>
      </label>
    </div>

    <div v-if="store.loading && !store.suppliesLoaded" class="inventory-table-card__state">
      {{ t('inventoryManagement.loading') }}
    </div>

    <div v-else-if="store.errors.length && !store.supplies.length" class="inventory-table-card__state inventory-table-card__state--error">
      {{ t('inventoryManagement.table.error') }}
    </div>

    <div v-else-if="!filteredRows.length" class="inventory-table-card__state">
      {{ t('inventoryManagement.table.empty') }}
    </div>

    <div v-else class="inventory-table-card__table-wrap">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>{{ t('inventoryManagement.table.columns.product') }}</th>
            <th>{{ t('inventoryManagement.table.columns.stockLevels') }}</th>
            <th>{{ t('inventoryManagement.table.columns.category') }}</th>
            <th>{{ t('inventoryManagement.table.columns.supplier') }}</th>
            <th>{{ t('inventoryManagement.table.columns.actions') }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in paginatedRows" :key="row.id">
            <td>
              <div class="inventory-table__product">
                <strong>{{ row.name }}</strong>
                <small>{{ t('inventoryManagement.table.idLabel', { id: row.id }) }}</small>
                <em v-if="getStockAlert(row)">{{ getStockAlert(row) }}</em>
              </div>
            </td>

            <td>
              <div class="inventory-table__stock">
                <div class="inventory-table__stock-top">
                  <strong :class="`inventory-table__stock-value--${getStatusTone(row)}`">
                    {{ row.currentStock }} {{ row.unitOfMeasure }}
                  </strong>
                  <small>{{ t('inventoryManagement.table.minimumLabel', { value: row.minimumStockLevel }) }}</small>
                </div>
                <div class="inventory-table__bar">
                  <span
                    :class="`inventory-table__bar-fill inventory-table__bar-fill--${getStatusTone(row)}`"
                    :style="{ width: getProgressWidth(row) }"
                  ></span>
                </div>
              </div>
            </td>

            <td>
              <span class="inventory-table__tag">{{ row.category }}</span>
            </td>

            <td>
              <span class="inventory-table__supplier">
                <i class="pi pi-building"></i>
                {{ row.supplierName || t('inventoryManagement.table.unassignedSupplier') }}
              </span>
            </td>

            <td>
              <div class="inventory-table__actions">
                <button type="button" :aria-label="t('inventoryManagement.table.actions.edit')" @click="openEditItem(row)">
                  <i class="pi pi-pencil"></i>
                </button>
                <button type="button" :aria-label="t('inventoryManagement.table.actions.delete')" @click="openDeleteItem(row)">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="inventory-table-card__footer">
      <p>{{ visibleCountText }}</p>

      <div class="inventory-table-card__pagination">
        <button type="button" :disabled="currentPage === 1" @click="goToPreviousPage">
          {{ t('inventoryManagement.table.pagination.previous') }}
        </button>
        <button
          type="button"
          class="inventory-table-card__pagination-next"
          :disabled="currentPage === totalPages"
          @click="goToNextPage"
        >
          {{ t('inventoryManagement.table.pagination.next') }}
        </button>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.inventory-table-card {
  background: #ffffff;
  border: 1px solid #eadbca;
  border-radius: 26px;
  box-shadow: 0 18px 36px rgba(47, 36, 29, 0.1);
  overflow: hidden;
}

.inventory-table-card__filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 22px 22px 16px;
}

.inventory-table-card__filter {
  display: grid;
  gap: 8px;
}

.inventory-table-card__filter span {
  color: #53493f;
  font-size: 1.1rem;
  font-weight: 700;
}

.inventory-table-card__input-shell {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  border: 1px solid #e8dccd;
  border-radius: 18px;
  background: #ffffff;
  padding: 0 16px;
}

.inventory-table-card__input-shell > .pi-search {
  color: #8a8177;
  font-size: 1rem;
}

.inventory-table-card__input-shell input,
.inventory-table-card__input-shell select {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #6b6258;
  font-size: 1rem;
  padding-left: 12px;
  appearance: none;
}

.inventory-table-card__select-icon {
  color: #8a8177;
  font-size: 0.95rem;
}

.inventory-table-card__state {
  padding: 28px 22px;
  border-top: 1px solid #eadbca;
  color: #7d7065;
}

.inventory-table-card__state--error {
  color: #b91c1c;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table thead th {
  padding: 16px 22px;
  border-top: 1px solid #eadbca;
  border-bottom: 1px solid #eadbca;
  color: #85796d;
  font-size: 0.96rem;
  font-weight: 700;
  text-align: left;
}

.inventory-table tbody td {
  padding: 14px 22px;
  border-bottom: 1px solid #f0e7dc;
  vertical-align: middle;
}

.inventory-table__product {
  display: grid;
  gap: 3px;
}

.inventory-table__product strong {
  color: #30262e;
  font-size: 1.05rem;
}

.inventory-table__product small {
  color: #aea39a;
  font-size: 0.92rem;
}

.inventory-table__product em {
  color: #ff3b30;
  font-size: 0.92rem;
  font-style: normal;
}

.inventory-table__stock {
  display: grid;
  gap: 7px;
  max-width: 180px;
}

.inventory-table__stock-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
}

.inventory-table__stock-top small {
  color: #b2a69b;
  font-size: 0.82rem;
}

.inventory-table__stock-value--healthy {
  color: #19a64a;
}

.inventory-table__stock-value--warning {
  color: #ff6a1a;
}

.inventory-table__stock-value--critical {
  color: #ff3b30;
}

.inventory-table__bar {
  height: 8px;
  border-radius: 999px;
  background: #ece7e2;
  overflow: hidden;
}

.inventory-table__bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.inventory-table__bar-fill--healthy {
  background: #2ec95b;
}

.inventory-table__bar-fill--warning {
  background: #ff7c22;
}

.inventory-table__bar-fill--critical {
  background: #ff4b45;
}

.inventory-table__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f2efeb;
  color: #676057;
  font-size: 0.82rem;
  font-weight: 700;
}

.inventory-table__supplier {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5e564d;
}

.inventory-table__actions {
  display: flex;
  gap: 16px;
}

.inventory-table__actions button {
  border: none;
  background: transparent;
  color: #a59a91;
  font-size: 1.05rem;
  cursor: pointer;
}

.inventory-table-card__footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 22px;
}

.inventory-table-card__footer p {
  color: #8b8175;
  font-size: 0.95rem;
}

.inventory-table-card__pagination {
  display: flex;
  gap: 8px;
}

.inventory-table-card__pagination button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #e6dbcf;
  border-radius: 12px;
  background: #ffffff;
  color: #b8ada3;
  font-weight: 600;
  cursor: pointer;
}

.inventory-table-card__pagination-next {
  background: #2d241e !important;
  color: #ffffff !important;
  border-color: #2d241e !important;
}

.inventory-table-card__pagination button:disabled {
  opacity: 0.45;
  cursor: default;
}

@media (max-width: 1100px) {
  .inventory-table-card__filters {
    grid-template-columns: 1fr;
  }

  .inventory-table-card__table-wrap {
    overflow-x: auto;
  }

  .inventory-table {
    min-width: 860px;
  }
}

@media (max-width: 700px) {
  .inventory-table-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
