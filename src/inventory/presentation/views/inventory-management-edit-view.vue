<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import useInventoryManagementStore from '../../application/inventory-management.store.js';

const { t } = useI18n();
const store = useInventoryManagementStore();
const route = useRoute();
const router = useRouter();

const itemId = Number(route.params.itemId);

const supply = computed(() => store.supplies.find((s) => s.id === itemId));

const form = ref({
  name: '',
  unitOfMeasure: '',
  currentStock: 0,
  minimumStockLevel: 0,
  category: ''
});

watch(supply, (newVal) => {
  if (newVal) {
    form.value = {
      name: newVal.name,
      unitOfMeasure: newVal.unitOfMeasure,
      currentStock: newVal.currentStock,
      minimumStockLevel: newVal.minimumStockLevel,
      category: newVal.category
    };
  }
}, { immediate: true });

onMounted(() => {
  if (!store.suppliesLoaded) {
    store.fetchAll();
  }
});

const saving = ref(false);

function handleSave() {
  if (!form.value.name || !form.value.unitOfMeasure) return;
  saving.value = true;
  store.updateSupply(itemId, { ...form.value }, function () {
    saving.value = false;
    router.push('/inventory/items');
  });
}

function handleCancel() {
  router.push('/inventory/items');
}
</script>

<template>
  <section class="inventory-edit-view">
    <header class="inventory-edit-view__hero">
      <div>
        <span class="inventory-edit-view__kicker">{{ t('inventoryManagement.page.kicker') }}</span>
        <h1 class="inventory-edit-view__title">{{ t('inventoryManagement.table.actions.edit') }}: {{ supply?.name }}</h1>
        <p class="inventory-edit-view__description">
          {{ t('inventoryManagement.page.description') }}
        </p>
      </div>
    </header>

    <div v-if="!supply" class="inventory-edit-view__state">{{ t('inventoryManagement.loading') }}</div>

    <form v-else class="inventory-edit-form" @submit.prevent="handleSave">
      <div class="inventory-edit-form__card">
        <label class="inventory-edit-form__field">
          <span>{{ t('inventoryManagement.table.columns.product') }}</span>
          <input v-model="form.name" type="text" required />
        </label>

        <label class="inventory-edit-form__field">
          <span>Unit of Measure</span>
          <input v-model="form.unitOfMeasure" type="text" required />
        </label>

        <div class="inventory-edit-form__row">
          <label class="inventory-edit-form__field">
            <span>Current Stock</span>
            <input v-model.number="form.currentStock" type="number" min="0" disabled />
            <small class="inventory-edit-form__hint">
              {{ t('inventoryManagement.form.currentStockHint') }}
            </small>
          </label>

          <label class="inventory-edit-form__field">
            <span>Minimum Stock Level</span>
            <input v-model.number="form.minimumStockLevel" type="number" min="0" required />
          </label>
        </div>

        <label class="inventory-edit-form__field">
          <span>Category</span>
          <input v-model="form.category" type="text" />
        </label>
      </div>

      <div class="inventory-edit-form__actions">
        <button type="button" class="inventory-edit-form__btn inventory-edit-form__btn--secondary" @click="handleCancel">
          Cancel
        </button>
        <button type="submit" class="inventory-edit-form__btn inventory-edit-form__btn--primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.inventory-edit-view {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.inventory-edit-view__hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  padding: 12px 6px 0;
}

.inventory-edit-view__kicker {
  display: inline-block;
  color: #a07832;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.inventory-edit-view__title {
  margin: 10px 0 8px;
  color: #221b2a;
  font-size: clamp(2.6rem, 4vw, 3.3rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.inventory-edit-view__description {
  color: #5b5247;
  font-size: 1.03rem;
}

.inventory-edit-view__state {
  padding: 28px 22px;
  background: #ffffff;
  border: 1px solid #eadbca;
  border-radius: 26px;
  color: #7d7065;
}

.inventory-edit-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.inventory-edit-form__card {
  background: #ffffff;
  border: 1px solid #eadbca;
  border-radius: 26px;
  box-shadow: 0 18px 36px rgba(47, 36, 29, 0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.inventory-edit-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inventory-edit-form__field span {
  color: #53493f;
  font-size: 0.95rem;
  font-weight: 700;
}

.inventory-edit-form__field input {
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #e8dccd;
  border-radius: 14px;
  background: #ffffff;
  color: #221b2a;
  font-size: 1rem;
  outline: none;
}

.inventory-edit-form__hint {
  color: #a07832;
  font-size: 0.82rem;
  margin-top: 4px;
}

.inventory-edit-form__field input:focus {
  border-color: #a07832;
  box-shadow: 0 0 0 2px rgba(160, 120, 50, 0.15);
}

.inventory-edit-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.inventory-edit-form__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.inventory-edit-form__btn {
  min-height: 48px;
  padding: 0 28px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.inventory-edit-form__btn--secondary {
  background: #ffffff;
  border: 1px solid #e8dccd;
  color: #5b5247;
}

.inventory-edit-form__btn--primary {
  background: #2d241e;
  border: none;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(45, 36, 30, 0.16);
}

.inventory-edit-form__btn--primary:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 700px) {
  .inventory-edit-form__row {
    grid-template-columns: 1fr;
  }

  .inventory-edit-form__actions {
    flex-direction: column;
  }
}
</style>
