<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import Chart from 'primevue/chart';
import useAnalyticsStore from '../../application/analytics.store.js';

const { t } = useI18n();
const store = useAnalyticsStore();
const { reportsData, loading } = storeToRefs(store);
const { fetchReportsData } = store;

const weeklyConsumptionList = computed(() => {
    const wc = reportsData.value?.weeklyConsumption;
    if (!wc?.labels || !wc?.data) return [];
    return wc.labels.map((label, i) => ({ week: label, value: wc.data[i] }));
});

const consumptionChartData = computed(() => ({
  labels: weeklyConsumptionList.value.map(item => item.week),
  datasets: [
    {
      label: t('operations.reportsPage.charts.consumptionTitle'),
      data: weeklyConsumptionList.value.map(item => item.value),
      backgroundColor: '#f7bf00',
      borderRadius: 6,
      barThickness: 16
    }
  ]
}));

const consumptionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#5a5147', font: { family: 'Montserrat', size: 11 } }
    },
    y: {
      grid: { color: '#ece4db' },
      ticks: { color: '#5a5147', font: { family: 'Montserrat', size: 11 } }
    }
  }
};

const consumptionSummary = computed(() => {
  const list = weeklyConsumptionList.value;
  const first = list[0]?.value ?? 0;
  const last = list[list.length - 1]?.value ?? 0;
  return t('operations.reportsPage.charts.summaryDesc', { from: first, to: last });
});

function exportCsv() {
  const rows = [
    [t('operations.reportsPage.charts.month'), t('operations.reportsPage.charts.consumptionTitle')],
    ...weeklyConsumptionList.value.map(item => [item.week, item.value])
  ];

  const csvContent = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'supplywok-reports.csv';
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}

function exportPdf() {
  window.print();
}

onMounted(() => {
  fetchReportsData();
});
</script>

<template>
  <section class="reports-page">
    <header class="reports-page__hero">
      <div>
        <span class="reports-page__kicker">{{ t('operations.reportsPage.kicker') }}</span>
        <h1 class="reports-page__title">{{ t('operations.reportsPage.title') }}</h1>
        <p class="reports-page__description">
          {{ t('operations.reportsPage.description') }}
        </p>
      </div>

      <div class="reports-page__actions">
        <button type="button" class="reports-page__secondary-action" @click="exportCsv">
          <i class="pi pi-download"></i>
          <span>{{ t('operations.reportsPage.actions.exportCsv') }}</span>
        </button>
        <button type="button" class="reports-page__primary-action" @click="exportPdf">
          <i class="pi pi-file-pdf"></i>
          <span>{{ t('operations.reportsPage.actions.exportPdf') }}</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="reports-page__loading-overlay">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      <p class="mt-2 text-sm text-gray-500">Cargando reportes dinámicos...</p>
    </div>

    <template v-else>
      <article class="reports-page__chart-card">
        <div class="reports-page__card-header">
          <h2>{{ t('operations.reportsPage.charts.consumptionTitle') }}</h2>
          <i class="pi pi-ellipsis-v"></i>
        </div>

        <div class="reports-page__chart-container mt-4">
          <Chart type="bar" :data="consumptionChartData" :options="consumptionChartOptions" />
        </div>

        <div class="reports-page__summary mt-4">
          <strong>{{ t('operations.reportsPage.charts.summary') }}</strong>
          <p>{{ consumptionSummary }}</p>
        </div>
      </article>
    </template>
  </section>
</template>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reports-page__hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  padding: 6px 0 0;
}

.reports-page__kicker {
  display: inline-block;
  color: #a07832;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.reports-page__title {
  margin: 10px 0 8px;
  color: #221b2a;
  font-size: clamp(2.6rem, 4vw, 3.3rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.reports-page__description {
  color: #5b5247;
  font-size: 1.03rem;
}

.reports-page__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.reports-page__actions button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
}

.reports-page__secondary-action {
  border: 1px solid #3a312b;
  background: #ffffff;
  color: #3a312b;
}

.reports-page__primary-action {
  border: none;
  background: #2d241e;
  color: #ffffff;
}

.reports-page__chart-card {
  background: #ffffff;
  border: 1px solid #e3d4c5;
  border-radius: 18px;
  box-shadow: 0 16px 34px rgba(47, 36, 29, 0.1);
  padding: 18px 20px;
}

.reports-page__card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.reports-page__card-header h2 {
  margin: 0;
  color: #2c2328;
  font-size: 1.05rem;
  font-weight: 700;
}

.reports-page__card-header i {
  color: #594f46;
}

.reports-page__chart-container {
  width: 100%;
  height: 220px;
}

.reports-page__loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #ffffff;
  border: 1px solid #e3d4c5;
  border-radius: 18px;
  box-shadow: 0 16px 34px rgba(47, 36, 29, 0.1);
  padding: 40px;
}

.reports-page__summary {
  margin-top: 16px;
  border-top: 1px solid #ece4db;
  padding-top: 12px;
  color: #574d43;
}

.reports-page__summary strong {
  display: block;
  margin-bottom: 6px;
}

@media (max-width: 900px) {
  .reports-page__hero {
    flex-direction: column;
  }
}
</style>
