<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { iotStore } from '../../application/iot-store.js';
import AlertsList from '../components/alerts/alerts-list.vue';
import AlertDetails from '../components/alerts/alert-details.vue';
import InputText from 'primevue/inputtext';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = iotStore();
const { supplierAlerts: alerts, supplierAlertsLoaded: alertsLoaded } = storeToRefs(store);
const { fetchSupplierAlerts: fetchAlerts, acknowledgeAlert } = store;

const searchQuery = ref('');
const priorityFilter = ref('all');
const selectedAlert = ref(null);
const isDetailsVisible = computed({
    get: () => /\/supplier\/alerts\/\d+\/view$/.test(route.path),
    set: (visible) => {
        if (!visible && /\/supplier\/alerts\/\d+\/view$/.test(route.path)) {
            router.push('/supplier/alerts');
        }
    }
});

const priorityOptions = computed(() => [
    { label: t('supplier-management.alerts.severity-placeholder'), value: 'all' },
    { label: t('supplier-management.alerts.severity.high'), value: 'high' },
    { label: t('supplier-management.alerts.severity.medium'), value: 'medium' },
    { label: t('supplier-management.alerts.severity.low'), value: 'low' }
]);

const filteredAlerts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    const p = priorityFilter.value.toLowerCase();

    return alerts.value.filter((alert) => {
        // Priority filter
        if (p !== 'all') {
            const severity = String(alert.severity || '').toLowerCase();
            if (p === 'high') {
                if (severity !== 'critical' && severity !== 'high') return false;
            } else if (p === 'medium') {
                if (severity !== 'medium') return false;
            } else if (p === 'low') {
                if (severity !== 'low' && severity !== 'info' && severity !== 'success') return false;
            }
        }

        // Search query filter
        if (!query) return true;
        return [
            alert.detail,
            alert.severity,
            alert.status,
            alert.detailText
        ].some((value) => String(value ?? '').toLowerCase().includes(query));
    });
});

function openDetails(alert) {
    router.push(`/supplier/alerts/${alert.id}/view`);
}

async function handleAcknowledge(id) {
    await acknowledgeAlert(id);
    if (selectedAlert.value?.id === id) {
        selectedAlert.value = alerts.value.find(alert => alert.id === id) ?? selectedAlert.value;
    }
}

onMounted(() => {
    if (!alertsLoaded.value) {
        fetchAlerts();
    }
});

watch(
    [() => route.path, () => alerts.value, () => alertsLoaded.value],
    () => {
        const match = route.path.match(/^\/supplier\/alerts\/(\d+)\/view$/);
        if (!match) {
            selectedAlert.value = null;
            return;
        }
        const id = Number(match[1]);
        const alert = alerts.value.find((item) => Number(item.id) === id);
        if (alert) {
            selectedAlert.value = alert;
        } else if (alertsLoaded.value) {
            router.push('/supplier/alerts');
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="alerts-page">
        <header class="alerts-header">
            <span class="alerts-header__kicker">{{ t('supplier-management.alerts.breadcrumb') }}</span>
            <h1 class="alerts-header__title">{{ t('supplier-management.alerts.title') }}</h1>
            <p class="alerts-header__description">{{ t('supplier-management.alerts.description') }}</p>
        </header>

        <div class="alerts-filters card">
            <div class="filter-group">
                <label>{{ t('supplier-management.alerts.search-label') }}</label>
                <div class="p-input-icon-left w-full">
                    <i class="pi pi-search" />
                    <InputText v-model="searchQuery" :placeholder="t('supplier-management.alerts.search-placeholder')" class="w-full" />
                </div>
            </div>
            <div class="filter-group">
                <label>{{ t('supplier-management.alerts.severity-label') }}</label>
                <select v-model="priorityFilter" class="alerts-filters__select">
                    <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <div class="alerts-table-container">
            <div v-if="!alertsLoaded" class="alerts-page__loading">
                <i class="pi pi-spin pi-spinner text-3xl"></i>
                <p class="mt-2 text-sm text-gray-500">Cargando alertas...</p>
            </div>
            <AlertsList
                v-else
                :alerts="filteredAlerts"
                :show-sensor="false"
                footer-key="supplier-management.alerts.table.footer"
                @acknowledge="handleAcknowledge"
                @view="openDetails"
            />
        </div>

        <AlertDetails
            v-if="selectedAlert"
            :alert="selectedAlert"
            :visible="isDetailsVisible"
            @update:visible="(val) => isDetailsVisible = val"
            :show-sensor="false"
            @close="isDetailsVisible = false"
        />
    </div>
</template>

<style scoped>
.alerts-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    font-family: 'Montserrat', system-ui, sans-serif;
}

.alerts-header__kicker {
    color: #b56a16;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.alerts-header__title {
    margin: 8px 0 4px;
    font-size: 32px;
    font-weight: 700;
    color: #2f241d;
    font-family: 'Poppins', system-ui, sans-serif;
}

.alerts-header__description {
    margin: 0;
    color: #7f7064;
    font-size: 16px;
}

.card {
    background: #ffffff;
    padding: 20px;
    border-radius: 14px;
    border: 1px solid #efe4d4;
    box-shadow: 0 10px 25px rgba(58, 42, 20, 0.04);
}

.alerts-filters {
    display: grid;
    grid-template-columns: 1fr 240px;
    gap: 20px;
}

.alerts-filters__select {
    width: 100%;
    min-height: 40px;
    border: 1px solid #efe4d4;
    border-radius: 10px;
    background: #fffdf9;
    color: #5a4f43;
    font: inherit;
    padding: 0 10px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.alerts-filters__select:focus {
    border-color: #b56a16;
    box-shadow: 0 0 0 2px rgba(181, 106, 22, 0.1);
}

.filter-group {
    display: grid;
    gap: 8px;
}

.filter-group label {
    font-size: 12px;
    font-weight: 700;
    color: #5a4f43;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.p-input-icon-left {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.p-input-icon-left i {
    position: absolute;
    left: 12px;
    color: #7b7269;
}

.p-input-icon-left :deep(.p-inputtext) {
    padding-left: 36px;
    width: 100%;
}

.alerts-page__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

@media (max-width: 768px) {
    .alerts-filters {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
</style>
