<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import useSupplierManagementStore from '../../application/supply-management.store.js';
import { CatalogItem } from '../../domain/model/catalog-item.entity.js';
import ConfirmDeleteDialog from '../../../shared/presentation/components/confirm-delete-dialog.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useSupplierManagementStore();
const { catalogItems, catalogItemsLoaded } = storeToRefs(store);
const { fetchCatalogItems, addCatalogItem, updateCatalogItem, deleteCatalogItem } = store;

const searchQuery = ref('');
const isFormOpen = ref(false);
const isEditing = ref(false);
const isDeleteDialogVisible = ref(false);
const pendingDeleteItem = ref(null);
const unitOptions = [
  { label: 'KG', value: 'KG' },
  { label: 'LTR', value: 'LTR' },
  { label: 'BOX', value: 'BOX' }
];
const form = reactive({
  id: null,
  name: '',
  category: '',
  price: '',
  unit: '',
  deliveryConditions: ''
});

const filteredCatalogItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return catalogItems.value;

  return catalogItems.value.filter((item) => {
    return [item.name, item.category, item.unit, item.deliveryConditions]
      .some((value) => String(value).toLowerCase().includes(query));
  });
});

const isFormValid = computed(() => {
  return Boolean(
    form.name.trim() &&
    form.category.trim() &&
    Number(form.price) > 0 &&
    form.unit.trim() &&
    form.deliveryConditions.trim()
  );
});

function resetForm() {
  form.id = null;
  form.name = '';
  form.category = '';
  form.price = '';
  form.unit = '';
  form.deliveryConditions = '';
  isEditing.value = false;
}

function openCreateForm() {
  resetForm();
  router.push('/supplier/catalog/new');
}

function openEditForm(item) {
  router.push(`/supplier/catalog/${item.id}/edit`);
}

function hydrateEditForm(item) {
  form.id = item.id;
  form.name = item.name;
  form.category = item.category;
  form.price = item.price;
  form.unit = item.unit;
  form.deliveryConditions = item.deliveryConditions;
  isEditing.value = true;
  isFormOpen.value = true;
}

function closeForm() {
  router.push('/supplier/catalog');
  resetForm();
}

async function saveCatalogItem() {
  if (!isFormValid.value) return;

  const item = new CatalogItem({
    id: form.id,
    name: form.name.trim(),
    category: form.category.trim(),
    price: Number(form.price),
    unit: form.unit.trim(),
    deliveryConditions: form.deliveryConditions.trim()
  });

  if (isEditing.value) {
    const wasUpdated = await updateCatalogItem(item);
    if (!wasUpdated) return;
  } else {
    const wasCreated = await addCatalogItem(item);
    if (!wasCreated) return;
  }

  closeForm();
}

function requestDeleteCatalogItem(item) {
  pendingDeleteItem.value = item;
  isDeleteDialogVisible.value = true;
}

async function confirmDeleteCatalogItem() {
  if (!pendingDeleteItem.value) return;
  const wasDeleted = await deleteCatalogItem(pendingDeleteItem.value.id);
  if (!wasDeleted) return;
  pendingDeleteItem.value = null;
  router.push('/supplier/catalog');
}

function formatPrice(price) {
  return `$${Number(price).toLocaleString('en-US', {
    minimumFractionDigits: Number(price) % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2
  })}`;
}

onMounted(() => {
  if (!catalogItemsLoaded.value) fetchCatalogItems();
});

watch(
  [() => route.path, () => catalogItems.value, () => catalogItemsLoaded.value],
  () => {
    const isNewRoute = route.path === '/supplier/catalog/new';
    const editMatch = route.path.match(/^\/supplier\/catalog\/(\d+)\/edit$/);
    const id = Number(editMatch?.[1] ?? NaN);
    const item = Number.isFinite(id) ? catalogItems.value.find((entry) => Number(entry.id) === id) : null;

    isFormOpen.value = isNewRoute || Boolean(editMatch);
    isEditing.value = Boolean(editMatch);

    if (isNewRoute) {
      resetForm();
      return;
    }

    if (editMatch) {
      if (item) {
        hydrateEditForm(item);
      } else if (catalogItemsLoaded.value) {
        router.push('/supplier/catalog');
      }
    }
    if (!isFormOpen.value) resetForm();
  },
  { immediate: true }
);
</script>

<template>
  <section class="catalog-page">
    <header class="catalog-page__header">
      <div>
        <p class="catalog-page__eyebrow">{{ t('supplier-management.catalog.breadcrumb') }}</p>
        <h1 class="catalog-page__title">{{ t('supplier-management.catalog.title') }}</h1>
        <p class="catalog-page__subtitle">{{ t('supplier-management.catalog.subtitle') }}</p>
      </div>
      <pv-button
        class="catalog-page__add-button"
        icon="pi pi-plus"
        :label="t('supplier-management.catalog.add')"
        type="button"
        @click="openCreateForm"
      />
    </header>

    <form v-if="isFormOpen" class="catalog-form" @submit.prevent="saveCatalogItem">
      <div class="catalog-form__grid">
        <label class="catalog-form__field">
          <span>{{ t('supplier-management.catalog.form.product') }}</span>
          <pv-input-text v-model="form.name" />
        </label>
        <label class="catalog-form__field">
          <span>{{ t('supplier-management.catalog.form.category') }}</span>
          <pv-input-text v-model="form.category" />
        </label>
        <label class="catalog-form__field">
          <span>{{ t('supplier-management.catalog.form.price') }}</span>
          <pv-input-number
            v-model="form.price"
            :min="0.01"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            input-id="catalog-item-price"
            mode="decimal"
          />
        </label>
        <label class="catalog-form__field">
          <span>{{ t('supplier-management.catalog.form.unit') }}</span>
          <select v-model="form.unit">
            <option disabled value="">Select unit</option>
            <option v-for="option in unitOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label class="catalog-form__field catalog-form__field--wide">
          <span>{{ t('supplier-management.catalog.form.delivery-conditions') }}</span>
          <pv-input-text v-model="form.deliveryConditions" />
        </label>
      </div>
      <div class="catalog-form__actions">
        <pv-button
          :label="t('supplier-management.catalog.form.cancel')"
          severity="secondary"
          outlined
          type="button"
          @click="closeForm"
        />
        <pv-button
          :disabled="!isFormValid"
          :label="isEditing ? t('supplier-management.catalog.form.save') : t('supplier-management.catalog.add')"
          type="submit"
        />
      </div>
    </form>

    <div class="catalog-page__search">
      <label for="catalog-search">{{ t('supplier-management.catalog.search') }}</label>
      <pv-input-text id="catalog-search" v-model="searchQuery" type="search" />
    </div>

    <pv-datatable
      class="catalog-table"
      :loading="!catalogItemsLoaded"
      :value="filteredCatalogItems"
      responsive-layout="scroll"
    >
      <pv-column field="name" :header="t('supplier-management.catalog.columns.product')" />
      <pv-column field="category" :header="t('supplier-management.catalog.columns.category')" />
      <pv-column :header="t('supplier-management.catalog.columns.price')">
        <template #body="{ data }">
          {{ formatPrice(data.price) }}
        </template>
      </pv-column>
      <pv-column field="unit" :header="t('supplier-management.catalog.columns.unit')" />
      <pv-column field="deliveryConditions" :header="t('supplier-management.catalog.columns.delivery-conditions')" />
      <pv-column :header="t('supplier-management.catalog.columns.actions')" body-class="catalog-table__actions-cell">
        <template #body="{ data }">
          <div class="catalog-table__actions">
            <pv-button
              :label="t('supplier-management.catalog.actions.edit')"
              text
              type="button"
              @click="openEditForm(data)"
            />
            <pv-button
              :label="t('supplier-management.catalog.actions.delete')"
              severity="danger"
              text
              type="button"
              @click="requestDeleteCatalogItem(data)"
            />
          </div>
        </template>
      </pv-column>
      <template #empty>
        <span class="catalog-table__empty">{{ t('supplier-management.catalog.empty') }}</span>
      </template>
    </pv-datatable>

    <ConfirmDeleteDialog
      v-model:visible="isDeleteDialogVisible"
      :title="t('supplier-management.catalog.delete-dialog.title')"
      :message="t('supplier-management.catalog.delete-dialog.message', { product: pendingDeleteItem?.name ?? '' })"
      :cancel-label="t('supplier-management.catalog.form.cancel')"
      :confirm-label="t('supplier-management.catalog.delete-dialog.confirm')"
      @confirm="confirmDeleteCatalogItem"
    />
  </section>
</template>

<style scoped>
.catalog-page {
  min-height: 100%;
  color: #2d241e;
  font-family: 'Montserrat', system-ui, sans-serif;
}

.catalog-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.catalog-page__eyebrow {
  margin: 0 0 6px;
  color: #b0762a;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}

.catalog-page__title {
  margin: 0;
  color: #241c17;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 30px;
  line-height: 1.1;
}

.catalog-page__subtitle {
  margin: 8px 0 0;
  color: #6f665d;
  font-size: 14px;
}

.catalog-page__add-button {
  border: 0;
  background: #a9792b;
  font-weight: 800;
}

.catalog-page__add-button:deep(.p-button):not(.p-disabled):hover,
.catalog-page__add-button:deep(.p-button):not(.p-disabled):focus {
  background: #a9792b;
  border-color: #a9792b;
}

.catalog-form,
.catalog-page__search {
  margin-bottom: 18px;
  padding: 18px;
  border: 1px solid #efe4d4;
  border-radius: 18px;
  background: #fffdf9;
  box-shadow: 0 12px 28px rgba(58, 42, 20, 0.06);
}

.catalog-form__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 14px;
}

.catalog-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #2d241e;
  font-size: 12px;
  font-weight: 800;
}

.catalog-form__field--wide {
  grid-column: span 2;
}

.catalog-form :deep(.p-inputtext),
.catalog-form :deep(.p-inputnumber),
.catalog-form :deep(.p-inputnumber-input),
.catalog-form select,
.catalog-page__search :deep(.p-inputtext) {
  width: 100%;
}

.catalog-form :deep(.p-inputtext),
.catalog-form :deep(.p-inputnumber-input),
.catalog-form select,
.catalog-page__search :deep(.p-inputtext) {
  min-height: 36px;
  color: #344457;
  font: inherit;
}

.catalog-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.catalog-page__search label {
  display: block;
  margin-bottom: 8px;
  color: #312820;
  font-size: 12px;
  font-weight: 800;
}

.catalog-page__search :deep(.p-inputtext) {
  min-height: 42px;
}

.catalog-table :deep(.p-datatable-table) {
  min-width: 900px;
}

.catalog-table :deep(.p-datatable-header-cell) {
  background: #f8edce;
  color: #2d241e;
  font-weight: 800;
}

.catalog-table :deep(.p-datatable-tbody > tr > td),
.catalog-table :deep(.p-datatable-thead > tr > th) {
  padding: 18px 14px;
  border-color: #edf0f3;
  font-size: 14px;
}

.catalog-table :deep(.p-datatable-tbody > tr > td) {
  color: #536579;
  font-weight: 600;
}

.catalog-table__actions {
  display: flex;
  gap: 12px;
}

.catalog-table__empty {
  display: block;
  text-align: center;
  color: #536579;
}

@media (max-width: 900px) {
  .catalog-page__header {
    flex-direction: column;
  }

  .catalog-form__grid {
    grid-template-columns: 1fr;
  }

  .catalog-form__field--wide {
    grid-column: span 1;
  }
}
</style>
