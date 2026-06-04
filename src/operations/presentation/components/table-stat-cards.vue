<script setup>
import { useI18n } from 'vue-i18n';
import ProgressBar from 'primevue/progressbar';

defineProps({
  totalTables: { type: Number, default: 0 },
  freeCount: { type: Number, default: 0 },
  occupiedCount: { type: Number, default: 0 },
  occupiedPercent: { type: Number, default: 0 }
});

const { t } = useI18n();
</script>

<template>
  <div class="grid equal-height-row">
    <div class="col-12 sm:col-4 flex">
      <div class="flex flex-column align-items-center gap-1 p-4 bg-white border-round shadow-1 border-2 stat-card flex-1">
        <span class="font-extrabold stat-value">{{ totalTables }}</span>
        <span class="font-bold uppercase stat-label">{{ t('operations.tablesAndOccupancyPage.totalTables') }}</span>
        <div class="w-full progress-wrapper">
          <ProgressBar :value="occupiedPercent" class="occupied-progress" />
        </div>
        <span class="font-bold stat-sub">{{ occupiedPercent }}% {{ t('operations.tablesAndOccupancyPage.occupied') }}</span>
      </div>
    </div>
    <div class="col-12 sm:col-4 flex">
      <div class="flex flex-column align-items-center gap-1 p-4 bg-white border-round shadow-1 border-2 stat-card--free flex-1">
        <span class="font-extrabold stat-value--green">{{ freeCount }}</span>
        <span class="font-bold uppercase stat-label">{{ t('operations.tablesAndOccupancyPage.freeTables') }}</span>
      </div>
    </div>
    <div class="col-12 sm:col-4 flex align-content-center">
      <div class="flex flex-column align-items-center gap-1 p-4 bg-white border-round shadow-1 border-2 stat-card--occupied flex-1">
        <span class="font-extrabold stat-value--red">{{ occupiedCount }}</span>
        <span class="font-bold uppercase stat-label">{{ t('operations.tablesAndOccupancyPage.occupiedTables') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-value { color: #2d241e; font-size: 28px; line-height: 1; font-family: 'Poppins', system-ui, sans-serif; }
.stat-value--green { color: #16a34a; font-size: 28px; line-height: 1; font-family: 'Poppins', system-ui, sans-serif; }
.stat-value--red { color: #dc2626; font-size: 28px; line-height: 1; font-family: 'Poppins', system-ui, sans-serif; }
.stat-label { color: #7d7065; font-size: 11px; letter-spacing: 0.05em; }
.stat-sub { color: #7d7065; font-size: 13px; }
.stat-card { border-color: #f0e8dd; }
.stat-card--free { border-color: #bbf7d0; }
.stat-card--occupied { border-color: #fecaca; }
.equal-height-row { display: flex; flex-wrap: wrap; }
.equal-height-row > .flex { display: flex; }
.progress-wrapper { margin-top: 2px; }
.occupied-progress :deep(.p-progressbar-value) {
  background: linear-gradient(90deg, #e9b824, #dc2626);
}
.occupied-progress :deep(.p-progressbar) {
  height: 8px;
  border-radius: 4px;
  background: #f0e8dd;
}
</style>
