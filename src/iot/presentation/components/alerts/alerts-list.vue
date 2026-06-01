<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AlertsListItem from './alerts-list-item.vue';

const props = defineProps({
  alerts: {
    type: Array,
    required: true
  },
  showSensor: {
    type: Boolean,
    default: false
  },
  footerKey: {
    type: String,
    default: 'iot.alerts-page.table.footer'
  }
});

const emit = defineEmits(['acknowledge', 'view']);
const { t } = useI18n();

// Pagination logic
const firstRow = ref(0);
const rowsPerPage = ref(5);

const totalRecords = computed(() => props.alerts.length);
const totalPages = computed(() => Math.ceil(totalRecords.value / rowsPerPage.value));
const currentPage = computed(() => Math.floor(firstRow.value / rowsPerPage.value) + 1);

const paginatedAlerts = computed(() => {
  return props.alerts.slice(firstRow.value, firstRow.value + rowsPerPage.value);
});

function prevPage() {
  if (firstRow.value > 0) {
    firstRow.value -= rowsPerPage.value;
  }
}

function nextPage() {
  if (firstRow.value + rowsPerPage.value < totalRecords.value) {
    firstRow.value += rowsPerPage.value;
  }
}

// Translate footer message using first, last and total params
const showingText = computed(() => {
  const start = totalRecords.value === 0 ? 0 : firstRow.value + 1;
  const end = Math.min(firstRow.value + rowsPerPage.value, totalRecords.value);
  return t(props.footerKey, { first: start, last: end, total: totalRecords.value });
});

watch(() => props.alerts, () => {
  firstRow.value = 0;
});
</script>

<template>
  <div class="alerts-list">
    <table class="alerts-list__table">
      <thead>
        <tr>
          <th>{{ t('supplier-management.orders.columns.priority') }}</th>
          <th v-if="showSensor">{{ t('supply-and-purchasing.detail.items.product') }} / Detalle</th>
          <th v-else>Detalle</th>
          <th v-if="showSensor">Sensor</th>
          <th>{{ t('supply-and-purchasing.detail.meta.date') }}</th>
          <th>{{ t('supply-and-purchasing.detail.meta.status') }}</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <AlertsListItem
          v-for="alert in paginatedAlerts"
          :key="alert.id"
          :alert="alert"
          :show-sensor="showSensor"
          @acknowledge="(id) => emit('acknowledge', id)"
          @view="(a) => emit('view', a)"
        />
        <tr v-if="!alerts.length">
          <td :colspan="showSensor ? 6 : 5" class="alerts-list__empty">
            No se encontraron alertas activas.
          </td>
        </tr>
      </tbody>
    </table>

    <div class="alerts-list__footer">
      <span>{{ showingText }}</span>
      <div class="alerts-list__pager">
        <button 
          type="button" 
          class="alerts-list__toolbar-button"
          :disabled="currentPage === 1"
          :style="{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }"
          @click="prevPage"
        >
          <i class="pi pi-angle-left" />
        </button>
        <span class="alerts-list__page-indicator">
          {{ currentPage }} / {{ totalPages || 1 }}
        </span>
        <button 
          type="button" 
          class="alerts-list__toolbar-button"
          :disabled="currentPage === totalPages || totalPages === 0"
          :style="{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.4 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }"
          @click="nextPage"
        >
          <i class="pi pi-angle-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerts-list {
  background: #ffffff;
  border: 1px solid #efe4d4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(58, 42, 20, 0.04);
}

.alerts-list__table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.alerts-list__table th {
  background: #f8f1e5;
  color: #5a4f43;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid #eee4d4;
}

.alerts-list__table :deep(td) {
  padding: 14px 16px;
  border-bottom: 1px solid #efe4d4;
}

.alerts-list__empty {
  text-align: center;
  color: #7b7269;
  padding: 40px !important;
  font-size: 14px;
}

.alerts-list__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 16px;
  color: #7b7269;
  font-size: 12px;
  border-top: 1px solid #efe4d4;
  background: #fdfbf7;
}

.alerts-list__pager {
  display: flex;
  align-items: center;
  gap: 6px;
}

.alerts-list__toolbar-button {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ebe2d7;
  background: #fbf8f4;
  border-radius: 8px;
  color: #7a6c60;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.alerts-list__toolbar-button:hover:not(:disabled) {
  background: #f4ece1;
  border-color: #dcd0bf;
}

.alerts-list__page-indicator {
  padding: 0 8px;
  font-weight: 600;
  color: #5a4f43;
}
</style>
