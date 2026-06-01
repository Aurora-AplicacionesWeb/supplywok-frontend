<script setup>
import { computed } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    series: {
        type: Array,
        default: () => []
    },
    emptyText: {
        type: String,
        required: true
    }
});

const chartData = computed(() => ({
    labels: props.series.map((point) => point.period),
    datasets: [
        {
            data: props.series.map((point) => point.value),
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

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
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
}));
</script>

<template>
    <article class="forecast-card">
        <header class="forecast-card__header">
            <h2>
                <i class="pi pi-chart-line"></i>
                {{ title }}
            </h2>
        </header>

        <div v-if="series.length" class="forecast-card__body">
            <div class="forecast-card__chart">
                <Chart type="line" :data="chartData" :options="chartOptions" />
            </div>
            <p class="forecast-card__summary">{{ summary }}</p>
        </div>

        <p v-else class="forecast-card__empty">{{ emptyText }}</p>
    </article>
</template>

<style scoped>
.forecast-card {
    min-height: 388px;
    border: 1px solid #efe4d4;
    border-radius: 8px;
    background: #fffdf9;
    box-shadow: 0 16px 34px rgba(58, 42, 20, 0.08);
}

.forecast-card__header {
    padding: 10px 18px;
    border-bottom: 1px solid #ece5dc;
}

.forecast-card__header h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: #4b5768;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 18px;
}

.forecast-card__body {
    padding: 18px;
}

.forecast-card__chart {
    min-height: 220px;
}

.forecast-card__summary {
    margin: 16px 0 0;
    color: #6f665d;
    font-size: 14px;
}

.forecast-card__empty {
    margin: 0;
    padding: 22px 18px;
    color: #6f665d;
    font-size: 14px;
}
</style>
