<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import Chart from 'primevue/chart';
import useAnalyticsStore from '../../application/analytics.store.js';

const { t } = useI18n();
const store = useAnalyticsStore();
const { demandForecast, demandForecastLoaded } = storeToRefs(store);
const { fetchDemandForecast } = store;

const aggregateSeries = computed(() => demandForecast.value?.aggregate ?? []);
const clientSeries = computed(() => demandForecast.value?.clients ?? []);

const aggregateSummary = computed(() => {
    const first = aggregateSeries.value[0]?.value ?? 0;
    const last = aggregateSeries.value[aggregateSeries.value.length - 1]?.value ?? 0;

    return t('supplier-management.forecast.chart-summary', {
        from: first,
        to: last
    });
});

const clientSummary = computed(() => {
    const topValue = clientSeries.value.reduce((max, client) => Math.max(max, Number(client.value ?? 0)), 0);

    return t('supplier-management.forecast.top-client-summary', {
        value: topValue
    });
});

const aggregateChartData = computed(() => ({
    labels: aggregateSeries.value.map(point => point.period),
    datasets: [
        {
            data: aggregateSeries.value.map(point => point.value),
            borderColor: '#a97827',
            backgroundColor: 'rgba(169, 120, 39, 0.18)',
            pointBackgroundColor: '#a97827',
            pointBorderColor: '#a97827',
            pointRadius: 3,
            borderWidth: 2,
            fill: true,
            tension: 0.32
        }
    ]
}));

const clientChartData = computed(() => ({
    labels: clientSeries.value.map(client => client.clientName),
    datasets: [
        {
            data: clientSeries.value.map(client => client.value),
            backgroundColor: ['#c71910', '#e9bd22', '#a97827', '#25212a'],
            borderRadius: 0,
            barThickness: 54
        }
    ]
}));

const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            enabled: true
        }
    },
    scales: {
        x: {
            grid: {
                color: '#e6ded3'
            },
            ticks: {
                color: '#6f665d',
                font: {
                    size: 11
                }
            }
        },
        y: {
            grid: {
                color: '#e6ded3'
            },
            ticks: {
                color: '#6f665d',
                font: {
                    size: 11
                }
            }
        }
    }
};

const aggregateChartOptions = {
    ...commonChartOptions,
    scales: {
        ...commonChartOptions.scales,
        y: {
            ...commonChartOptions.scales.y,
            min: 240,
            max: 320,
            ticks: {
                ...commonChartOptions.scales.y.ticks,
                stepSize: 20
            }
        }
    }
};

const clientChartOptions = {
    ...commonChartOptions,
    scales: {
        ...commonChartOptions.scales,
        y: {
            ...commonChartOptions.scales.y,
            min: 45,
            max: 75,
            ticks: {
                ...commonChartOptions.scales.y.ticks,
                stepSize: 5
            }
        }
    }
};

function formatTrend(trend) {
    return t(`supplier-management.forecast.trend.${trend}`, trend);
}

onMounted(() => {
    if (!demandForecastLoaded.value) {
        fetchDemandForecast();
    }
});
</script>

<template>
    <section class="forecast-page">
        <header class="forecast-page__header">
            <p class="forecast-page__eyebrow">{{ t('supplier-management.forecast.breadcrumb') }}</p>
            <h1 class="forecast-page__title">{{ t('supplier-management.forecast.title') }}</h1>
            <p class="forecast-page__subtitle">{{ t('supplier-management.forecast.subtitle') }}</p>
        </header>

        <p v-if="demandForecastLoaded && !aggregateSeries.length && !clientSeries.length" class="forecast-page__empty">
            {{ t('supplier-management.forecast.empty') }}
        </p>

        <template v-else>
            <section class="forecast-page__charts">
                <article class="forecast-card forecast-card--chart">
                    <h2>{{ t('supplier-management.forecast.aggregate-title') }}</h2>
                    <div class="forecast-card__chart">
                        <Chart type="line" :data="aggregateChartData" :options="aggregateChartOptions" />
                    </div>
                    <p>{{ aggregateSummary }}</p>
                </article>

                <article class="forecast-card forecast-card--chart">
                    <h2>{{ t('supplier-management.forecast.clients-title') }}</h2>
                    <div class="forecast-card__chart">
                        <Chart type="bar" :data="clientChartData" :options="clientChartOptions" />
                    </div>
                    <p>{{ clientSummary }}</p>
                </article>
            </section>

            <section class="forecast-page__insights">
                <article
                    v-for="client in clientSeries.slice(0, 2)"
                    :key="client.clientId"
                    class="forecast-card forecast-card--insight"
                >
                    <h2>{{ client.clientName }}</h2>
                    <strong>{{ formatTrend(client.trend) }}</strong>
                    <p>{{ client.summary }}</p>
                </article>
            </section>
        </template>
    </section>
</template>

<style scoped>
.forecast-page {
    min-height: 100%;
    color: #2d241e;
    font-family: 'Montserrat', system-ui, sans-serif;
}

.forecast-page__header {
    margin-bottom: 24px;
}

.forecast-page__eyebrow {
    margin: 0 0 8px;
    color: #b0762a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
}

.forecast-page__title {
    margin: 0;
    color: #241c17;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 30px;
    line-height: 1.1;
}

.forecast-page__subtitle {
    margin: 10px 0 0;
    color: #6f665d;
    font-size: 14px;
}

.forecast-page__charts,
.forecast-page__insights {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.forecast-page__insights {
    margin-top: 16px;
}

.forecast-card {
    border: 1px solid #efe4d4;
    border-radius: 8px;
    background: #fffdf9;
    box-shadow: 0 14px 30px rgba(58, 42, 20, 0.06);
}

.forecast-card h2 {
    margin: 0;
    color: #4a5361;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 18px;
    line-height: 1.2;
}

.forecast-card p {
    margin: 0;
    color: #6f665d;
    font-size: 12px;
    line-height: 1.45;
}

.forecast-card--chart {
    display: grid;
    grid-template-rows: auto 176px auto;
    gap: 12px;
    min-height: 278px;
    padding: 18px;
}

.forecast-card__chart {
    min-height: 176px;
}

.forecast-card--insight {
    min-height: 94px;
    padding: 18px;
}

.forecast-card--insight strong {
    display: block;
    margin-top: 10px;
    color: #5b6572;
    font-size: 12px;
    line-height: 1.2;
}

.forecast-card--insight p {
    margin-top: 4px;
}

.forecast-page__empty {
    padding: 20px;
    border: 1px solid #efe4d4;
    border-radius: 8px;
    background: #fffdf9;
    color: #6f665d;
}

@media (max-width: 900px) {
    .forecast-page__charts,
    .forecast-page__insights {
        grid-template-columns: 1fr;
    }
}
</style>
