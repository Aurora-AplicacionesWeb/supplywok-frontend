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

// ── Dynamic Mapping Computeds ──

const inventoryDataList = computed(() => {
    const trend = reportsData.value?.inventoryTrend;
    if (!trend?.labels || !trend?.data) return [];
    return trend.labels.map((label, i) => ({ month: label, value: trend.data[i] }));
});

const weeklyConsumptionList = computed(() => {
    const wc = reportsData.value?.weeklyConsumption;
    if (!wc?.labels || !wc?.data) return [];
    return wc.labels.map((label, i) => ({ week: label, value: wc.data[i] }));
});

const topSuppliersList = computed(() => reportsData.value?.topSuppliersOrders || []);

const tempFluctuationsList = computed(() => {
    const tf = reportsData.value?.temperatureFluctuations;
    if (!tf?.labels || !tf?.data) return [];
    return tf.labels.map((label, i) => ({ day: label, value: tf.data[i] }));
});

// Chart JS Data Configurations
const inventoryChartData = computed(() => ({
  labels: inventoryDataList.value.map(item => item.month),
  datasets: [
    {
      label: t('operations.reportsPage.charts.inventoryTitle'),
      data: inventoryDataList.value.map(item => item.value),
      fill: true,
      borderColor: '#ef3b34',
      backgroundColor: 'rgba(239, 59, 52, 0.12)',
      borderWidth: 3,
      tension: 0.38,
      pointRadius: 4,
      pointBackgroundColor: '#ef3b34',
      pointHoverRadius: 6
    }
  ]
}));

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

const tempChartData = computed(() => ({
  labels: tempFluctuationsList.value.map(item => item.day),
  datasets: [
    {
      label: t('operations.reportsPage.charts.tempTitle'),
      data: tempFluctuationsList.value.map(item => item.value),
      backgroundColor: '#ef7f84',
      borderRadius: 6,
      barThickness: 16
    }
  ]
}));

// Chart JS Options Configurations
const inventoryChartOptions = {
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

const miniChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#5a5147', font: { family: 'Montserrat', size: 10 } }
    },
    y: {
      grid: { color: '#f5ede4' },
      ticks: { color: '#5a5147', font: { family: 'Montserrat', size: 10 } }
    }
  }
};

// Summary strings computeds
const consumptionSummary = computed(() => {
  const list = weeklyConsumptionList.value;
  const first = list[0]?.value ?? 0;
  const last = list[list.length - 1]?.value ?? 0;
  return t('operations.reportsPage.charts.summaryDesc', { from: first, to: last });
});

const suppliersSummary = computed(() => {
  const list = topSuppliersList.value;
  return t('operations.reportsPage.charts.summaryValue', { value: list.length });
});

const tempSummary = computed(() => {
  const list = tempFluctuationsList.value;
  const maxTemp = list.reduce((max, item) => Math.max(max, item.value), 0);
  return t('operations.reportsPage.charts.summaryValue', { value: maxTemp });
});

// CSV Export utilizing dynamic state
function exportCsv() {
  const rows = [
    [t('operations.reportsPage.charts.month'), t('operations.reportsPage.charts.inventoryTitle')],
    ...inventoryDataList.value.map(item => [item.month, item.value])
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
      <article class="reports-page__chart-card reports-page__chart-card--wide">
        <div class="reports-page__card-header">
          <h2>{{ t('operations.reportsPage.charts.inventoryTitle') }}</h2>
          <i class="pi pi-ellipsis-v"></i>
        </div>

        <div class="reports-page__chart-container mt-4">
          <Chart type="line" :data="inventoryChartData" :options="inventoryChartOptions" />
        </div>
      </article>

      <div class="reports-page__grid">
        <article class="reports-page__chart-card">
          <div class="reports-page__card-header">
            <h2>{{ t('operations.reportsPage.charts.consumptionTitle') }}</h2>
            <i class="pi pi-ellipsis-v"></i>
          </div>

          <div class="reports-page__mini-chart-container mt-4">
            <Chart type="bar" :data="consumptionChartData" :options="miniChartOptions" />
          </div>

          <div class="reports-page__summary mt-4">
            <strong>{{ t('operations.reportsPage.charts.summary') }}</strong>
            <p>{{ consumptionSummary }}</p>
          </div>
        </article>

        <article class="reports-page__chart-card">
          <div class="reports-page__card-header">
            <h2>{{ t('operations.reportsPage.charts.ordersTitle') }}</h2>
            <i class="pi pi-ellipsis-v"></i>
          </div>

          <div class="reports-page__horizontal-bars">
            <div
              v-for="supplier in topSuppliersList"
              :key="supplier.supplier"
              class="reports-page__horizontal-row"
            >
              <span>{{ supplier.supplier }}</span>
              <div><strong :style="{ width: `${supplier.value}%` }"></strong></div>
              <small>{{ supplier.value }}</small>
            </div>
          </div>

          <div class="reports-page__summary mt-4">
            <strong>{{ t('operations.reportsPage.charts.summary') }}</strong>
            <p>{{ suppliersSummary }}</p>
          </div>
        </article>

        <article class="reports-page__chart-card">
          <div class="reports-page__card-header">
            <h2>{{ t('operations.reportsPage.charts.tempTitle') }}</h2>
            <i class="pi pi-ellipsis-v"></i>
          </div>

          <div class="reports-page__mini-chart-container mt-4">
            <Chart type="bar" :data="tempChartData" :options="miniChartOptions" />
          </div>

          <div class="reports-page__summary mt-4">
            <strong>{{ t('operations.reportsPage.charts.summary') }}</strong>
            <p>{{ tempSummary }}</p>
          </div>
        </article>
      </div>
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

.reports-page__chart-card--wide {
  padding-bottom: 14px;
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

.reports-page__mini-chart-container {
  width: 100%;
  height: 170px;
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

.reports-page__line-chart {
  width: 100%;
  height: 220px;
  margin-top: 6px;
}

.reports-page__axis-labels,
.reports-page__mini-axis {
  display: grid;
  color: #5a5147;
  font-size: 0.88rem;
}

.reports-page__axis-labels {
  grid-template-columns: repeat(6, 1fr);
  padding: 0 14px 0 18px;
}

.reports-page__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.reports-page__mini-chart {
  width: 100%;
  height: 170px;
  margin-top: 10px;
}

.reports-page__mini-axis {
  grid-template-columns: repeat(6, 1fr);
  padding: 0 10px;
}

.reports-page__horizontal-bars {
  display: grid;
  gap: 12px;
  margin-top: 26px;
}

.reports-page__horizontal-row {
  display: grid;
  grid-template-columns: 1fr 124px auto;
  gap: 8px;
  align-items: center;
  color: #5a5147;
  font-size: 0.9rem;
}

.reports-page__horizontal-row div {
  height: 18px;
  border-radius: 4px;
  background: #ece6df;
  overflow: hidden;
}

.reports-page__horizontal-row strong {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ba7a3c 0%, #a2592b 100%);
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

@media (max-width: 1120px) {
  .reports-page__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .reports-page__hero {
    flex-direction: column;
  }
}
</style>
