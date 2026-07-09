<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import useOrdersStore from '../../application/orders.store.js';

const { t } = useI18n();
const store = useOrdersStore();
const { supplierDirectory, suppliersLoaded, loading, errors } = storeToRefs(store);
const { ensureSuppliersLoaded } = store;
const itemsPerPage = 5;
const currentPage = ref(1);

const getCategoryLabel = (category) => {
  const categories = {
    'GRAINS': t('supply-and-purchasing.suppliers-page.table.categories.grains'),
    'PROTEIN': t('supply-and-purchasing.suppliers-page.table.categories.protein'),
    'SAUCES': t('supply-and-purchasing.suppliers-page.table.categories.sauces'),
    'SEAFOOD': t('supply-and-purchasing.suppliers-page.table.categories.seafood')
  };
  return categories[category] ?? category;
};

const supplierRows = computed(() => {
  return supplierDirectory.value.map((supplier) => ({
    id: supplier.id,
    supplier: supplier.name,
    contact: supplier.contactName || t('supply-and-purchasing.suppliers-page.noContact'),
    email: supplier.email || t('supply-and-purchasing.suppliers-page.noEmail'),
    phone: supplier.phone || t('supply-and-purchasing.suppliers-page.noPhone'),
    category: normalizeCategory(supplier.category),
    street: supplier.street || t('supply-and-purchasing.suppliers-page.noStreet')
  }));
});

const totalPages = computed(() => Math.max(1, Math.ceil(supplierRows.value.length / itemsPerPage)));

const visibleSupplierRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return supplierRows.value.slice(start, start + itemsPerPage);
});

const paginationSummary = computed(() => {
  if (!supplierRows.value.length) {
    return { from: 0, to: 0, total: 0 };
  }

  const from = (currentPage.value - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage.value * itemsPerPage, supplierRows.value.length);
  return { from, to, total: supplierRows.value.length };
});

const canGoPrevious = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);

function goToPreviousPage() {
  if (canGoPrevious.value) {
    currentPage.value -= 1;
  }
}

function goToNextPage() {
  if (canGoNext.value) {
    currentPage.value += 1;
  }
}

function normalizeCategory(category) {
  const normalized = String(category ?? '').trim().toUpperCase();
  if (!normalized) return 'SAUCES';
  if (normalized.includes('GRAIN') || normalized.includes('PANTRY')) return 'GRAINS';
  if (normalized.includes('PROTEIN') || normalized.includes('COLD')) return 'PROTEIN';
  if (normalized.includes('SAUCE') || normalized.includes('OIL') || normalized.includes('ASIAN')) return 'SAUCES';
  if (normalized.includes('SEAFOOD')) return 'SEAFOOD';
  return normalized;
}

onMounted(() => {
  ensureSuppliersLoaded();
});

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages;
  }
});
</script>

<template>
  <section class="suppliers-page">
    <header class="suppliers-page__hero">
      <span class="suppliers-page__kicker">{{ t('supply-and-purchasing.suppliers-page.kicker') }}</span>
      <h1 class="suppliers-page__title">{{ t('supply-and-purchasing.suppliers-page.title') }}</h1>
      <p class="suppliers-page__description">
        {{ t('supply-and-purchasing.suppliers-page.description') }}
      </p>
    </header>

    <section class="suppliers-table-card">
      <div class="suppliers-table-card__table-wrap">
        <div v-if="loading && !suppliersLoaded" class="suppliers-table-card__state">
          {{ t('shared.placeholder.description') }}
        </div>

        <div v-else-if="errors.length && !supplierRows.length" class="suppliers-table-card__state suppliers-table-card__state--error">
          Failed to load suppliers.
        </div>

        <table v-else class="suppliers-table">
          <thead>
            <tr>
              <th>{{ t('supply-and-purchasing.suppliers-page.table.headers.supplier') }}</th>
              <th>{{ t('supply-and-purchasing.suppliers-page.table.headers.contact') }}</th>
              <th>{{ t('supply-and-purchasing.suppliers-page.table.headers.categories') }}</th>
              <th>{{ t('supply-and-purchasing.suppliers-page.table.headers.street') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in visibleSupplierRows" :key="row.id">
              <td class="suppliers-table__supplier-cell">{{ row.supplier }}</td>
              <td>
                <div class="suppliers-table__contact">
                  <strong>{{ row.contact }}</strong>
                  <small>{{ row.email }}</small>
                  <small>{{ row.phone }}</small>
                </div>
              </td>
              <td>
                <span class="suppliers-table__tag">{{ getCategoryLabel(row.category) }}</span>
              </td>
              <td>
                <span class="suppliers-table__street">{{ row.street }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="suppliers-table-card__footer">
        <p>{{ paginationSummary.from }}-{{ paginationSummary.to }} of {{ paginationSummary.total }} suppliers</p>
        <div class="suppliers-table-card__pagination">
          <button type="button" :disabled="!canGoPrevious" @click="goToPreviousPage">{{ t('supply-and-purchasing.suppliers-page.footer.previous') }}</button>
          <button type="button" class="suppliers-table-card__pagination-next" :disabled="!canGoNext" @click="goToNextPage">{{ t('supply-and-purchasing.suppliers-page.footer.next') }}</button>
        </div>
      </footer>
    </section>
  </section>
</template>

<style scoped>
.suppliers-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.suppliers-page__hero {
  padding: 12px 6px 0;
}

.suppliers-page__kicker {
  display: inline-block;
  color: #a07832;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.suppliers-page__title {
  margin: 10px 0 8px;
  color: #221b2a;
  font-size: clamp(2.6rem, 4vw, 3.3rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.suppliers-page__description {
  color: #5b5247;
  font-size: 1.03rem;
}

.suppliers-table-card {
  background: #ffffff;
  border: 1px solid #eadbca;
  border-radius: 22px;
  box-shadow: 0 18px 36px rgba(47, 36, 29, 0.1);
  overflow: hidden;
}

.suppliers-table-card__state {
  padding: 24px 20px;
  color: #7e756b;
}

.suppliers-table-card__state--error {
  color: #b42318;
}

.suppliers-table {
  width: 100%;
  border-collapse: collapse;
}

.suppliers-table thead th {
  padding: 15px 20px;
  border-bottom: 1px solid #eadbca;
  color: #85796d;
  font-size: 0.94rem;
  font-weight: 700;
  text-align: left;
}

.suppliers-table tbody td {
  padding: 14px 20px;
  border-bottom: 1px solid #f0e7dc;
  color: #31272f;
  vertical-align: middle;
}

.suppliers-table__supplier-cell {
  font-size: 1.02rem;
  font-weight: 700;
  }

.suppliers-table__contact,
.suppliers-table__contact {
  display: grid;
  gap: 2px;
}

.suppliers-table__contact strong {
  color: #31272f;
}

.suppliers-table__contact small {
  color: #7e756b;
  font-size: 0.92rem;
}

.suppliers-table__tag {
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

.suppliers-table__street {
  color: #5a5249;
  font-weight: 600;
}

.suppliers-table-card__footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 20px;
}

.suppliers-table-card__footer p {
  color: #8b8175;
  font-size: 0.95rem;
}

.suppliers-table-card__pagination {
  display: flex;
  gap: 8px;
}

.suppliers-table-card__pagination button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #e6dbcf;
  border-radius: 12px;
  background: #ffffff;
  color: #b8ada3;
  font-weight: 600;
}

.suppliers-table-card__pagination-next {
  background: #2d241e !important;
  color: #ffffff !important;
  border-color: #2d241e !important;
}

@media (max-width: 1100px) {
  .suppliers-table-card__table-wrap {
    overflow-x: auto;
  }

  .suppliers-table {
    min-width: 780px;
  }
}

@media (max-width: 700px) {
  .suppliers-table-card__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
