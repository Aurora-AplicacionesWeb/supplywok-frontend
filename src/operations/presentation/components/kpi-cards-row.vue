<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  openCount: { type: Number, default: 0 },
  inPrepCount: { type: Number, default: 0 },
  readyCount: { type: Number, default: 0 }
});

const { t } = useI18n();
</script>

<template>
  <div class="grid">
    <div class="col-12 sm:col-4">
      <div class="flex flex-column align-items-center gap-1 p-4 bg-white shadow-1 border-2 kpi-card--pending" :style="{ borderRadius: '18px' }">
        <span class="font-extrabold kpi-value kpi-value--amber">{{ openCount }}</span>
        <span class="font-bold uppercase kpi-label">{{ t('operations.kitchenTicketsPage.pending') }}</span>
      </div>
    </div>
    <div class="col-12 sm:col-4">
      <div class="flex flex-column align-items-center gap-1 p-4 bg-white shadow-1 border-2 kpi-card--prep" :style="{ borderRadius: '18px' }">
        <span class="font-extrabold kpi-value kpi-value--red">{{ inPrepCount }}</span>
        <span class="font-bold uppercase kpi-label">{{ t('operations.kitchenTicketsPage.inPreparation') }}</span>
      </div>
    </div>
    <div class="col-12 sm:col-4">
      <div class="flex flex-column align-items-center gap-1 p-4 bg-white shadow-1 border-2 kpi-card--ready" :style="{ borderRadius: '18px' }">
        <span class="font-extrabold kpi-value kpi-value--green">{{ readyCount }}</span>
        <span class="font-bold uppercase kpi-label">{{ t('operations.kitchenTicketsPage.ready') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-value { font-size: 28px; line-height: 1; font-family: 'Poppins', system-ui, sans-serif; }
.kpi-value--amber { color: #e9b824; }
.kpi-value--red { color: #c21204; }
.kpi-value--green { color: #16a34a; }
.kpi-label { color: #7d7065; font-size: 11px; letter-spacing: 0.05em; }
.kpi-card--pending { border-color: #fef3c7; }
.kpi-card--prep { border-color: #fce4ec; }
.kpi-card--ready { border-color: #dcfce7; }
</style>
