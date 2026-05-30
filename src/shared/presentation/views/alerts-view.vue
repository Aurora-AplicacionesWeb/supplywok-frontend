<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { iotStore } from '../../../iot/application/iot-store.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = iotStore();
const { supplierAlerts: alerts, supplierAlertsLoaded: alertsLoaded } = storeToRefs(store);
const { fetchSupplierAlerts: fetchAlerts, acknowledgeAlert } = store;

const searchQuery = ref('');
const severityFilter = ref(null);
const selectedAlert = ref(null);
const isDetailsVisible = computed({
    get: () => /\/supplier\/alerts\/\d+\/view$/.test(route.path),
    set: (visible) => {
        if (!visible && /\/supplier\/alerts\/\d+\/view$/.test(route.path)) {
            router.push('/supplier/alerts');
        }
    }
});

const severityOptions = computed(() => [
    { label: t('supplier-management.alerts.severity.high'), value: 'high' },
    { label: t('supplier-management.alerts.severity.medium'), value: 'medium' },
    { label: t('supplier-management.alerts.severity.low'), value: 'low' }
]);

const tableAlerts = computed(() => {
    return filteredAlerts.value.map((alert) => ({
        ...alert,
        severityOrder: getSeverityOrder(alert.severity)
    }));
});

const filteredAlerts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    return alerts.value.filter((alert) => {
        const matchesSeverity = !severityFilter.value || alert.severity === severityFilter.value;
        if (!matchesSeverity) {
            return false;
        }

        if (!query) {
            return true;
        }

        return [
            alert.detail,
            alert.severity,
            alert.status
        ].some((value) => String(value ?? '').toLowerCase().includes(query));
    });
});

function getSeverityOrder(severity) {
    switch (severity) {
        case 'high': return 1;
        case 'medium': return 2;
        case 'low': return 3;
        default: return 999;
    }
}

function getSeverityClass(severity) {
    switch (severity) {
        case 'high': return 'severity-high';
        case 'medium': return 'severity-medium';
        case 'low': return 'severity-low';
        default: return '';
    }
}

function getSeverityLabel(severity) {
    return t(`supplier-management.alerts.severity.${severity}`);
}

function getStatusLabel(status) {
    if (status === 'pending') return t('supplier-management.alerts.status.open');
    if (status === 'acknowledged') return t('supplier-management.alerts.status.acknowledged');
    return status;
}

function getStatusSeverity(status) {
    if (status === 'pending') return 'warn';
    if (status === 'acknowledged') return 'info';
    return 'secondary';
}

function formatDate(date) {
    if (!date) return '';
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return date;
    }

    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')} ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

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
                <pv-icon-field iconPosition="left">
                    <pv-input-icon class="pi pi-search" />
                    <pv-input-text v-model="searchQuery" :placeholder="t('supplier-management.alerts.search-placeholder')" class="w-full" />
                </pv-icon-field>
            </div>
            <div class="filter-group">
                <label>{{ t('supplier-management.alerts.severity-label') }}</label>
                <pv-select
                    v-model="severityFilter"
                    :options="severityOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="t('supplier-management.alerts.severity-placeholder')"
                    showClear
                    class="w-full"
                />
            </div>
        </div>

        <div class="alerts-table-container card">
            <pv-datatable
                :value="tableAlerts"
                :loading="!alertsLoaded"
                paginator
                :rows="4"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                :currentPageReportTemplate="t('supplier-management.alerts.table.footer', { first: '{first}', last: '{last}', total: '{totalRecords}' })"
                responsiveLayout="scroll"
                class="p-datatable-sm"
            >
                <pv-column field="severity" sortField="severityOrder" :header="t('supplier-management.alerts.table.columns.severity')" sortable>
                    <template #body="slotProps">
                        <div class="severity-cell">
                            <span class="severity-dot" :class="getSeverityClass(slotProps.data.severity)"></span>
                            <span class="severity-text">{{ getSeverityLabel(slotProps.data.severity) }}</span>
                        </div>
                    </template>
                </pv-column>

                <pv-column field="detail" :header="t('supplier-management.alerts.table.columns.detail')">
                    <template #body="slotProps">
                        <div class="detail-cell">
                            <div class="detail-title">{{ slotProps.data.detail }}</div>
                        </div>
                    </template>
                </pv-column>
              
                <pv-column field="date" :header="t('supplier-management.alerts.table.columns.date')" sortable>
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.date) }}
                    </template>
                </pv-column>

                <pv-column field="status" :header="t('supplier-management.alerts.table.columns.status')" sortable>
                    <template #body="slotProps">
                        <pv-tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
                    </template>
                </pv-column>

                <pv-column :header="t('supplier-management.alerts.table.columns.actions')">
                    <template #body="slotProps">
                        <div class="actions-cell">
                            <button class="action-link" @click="openDetails(slotProps.data)">{{ t('supplier-management.alerts.table.actions.view-details') }}</button>
                            <button
                                v-if="slotProps.data.status === 'pending'"
                                class="action-link"
                                @click="handleAcknowledge(slotProps.data.id)"
                            >
                                {{ t('supplier-management.alerts.table.actions.acknowledge') }}
                            </button>
                        </div>
                    </template>
                </pv-column>

                <template #empty>
                    <span class="empty-state">{{ t('supplier-management.alerts.empty') }}</span>
                </template>
            </pv-datatable>
        </div>

        <pv-dialog
            v-model:visible="isDetailsVisible"
            modal
            :header="t('supplier-management.alerts.dialog.header')"
            :style="{ width: '450px' }"
            class="alert-details-dialog"
        >
            <div v-if="selectedAlert" class="details-content">
                <div class="details-header">
                    <div class="severity-indicator">
                        <span class="severity-dot" :class="getSeverityClass(selectedAlert.severity)"></span>
                        <span class="severity-text">{{ getSeverityLabel(selectedAlert.severity) }}</span>
                    </div>
                    <pv-tag :value="getStatusLabel(selectedAlert.status)" :severity="getStatusSeverity(selectedAlert.status)" />
                </div>

                <div class="details-body">
                    <h2 class="alert-title">{{ selectedAlert.detail }}</h2>

                    <div class="meta-info">
                        <div class="meta-item">
                            <span class="meta-label">{{ t('supplier-management.alerts.dialog.meta.date') }}:</span>
                            <span class="meta-value">{{ formatDate(selectedAlert.date) }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">{{ t('supplier-management.alerts.dialog.meta.status') }}:</span>
                            <span class="meta-value">{{ getStatusLabel(selectedAlert.status) }}</span>
                        </div>
                    </div>
                </div>

                <div class="details-footer">
                    <pv-button :label="t('supplier-management.alerts.dialog.actions.close')" text @click="isDetailsVisible = false" />
                    <pv-button
                        v-if="selectedAlert.status === 'pending'"
                        :label="t('supplier-management.alerts.dialog.actions.acknowledge')"
                        @click="handleAcknowledge(selectedAlert.id)"
                    />
                </div>
            </div>
        </pv-dialog>
    </div>
</template>

<style scoped>
.alerts-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
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
}

.alerts-header__description {
    margin: 0;
    color: #7f7064;
    font-size: 16px;
}

.card {
    background: #ffffff;
    padding: 24px;
    border-radius: 18px;
    box-shadow: 0 18px 40px rgba(47, 36, 29, 0.08);
}

.alerts-filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-weight: 600;
    color: #2f241d;
}

.severity-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.severity-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.severity-high { background-color: #d32f2f; }
.severity-medium { background-color: #ff9800; }
.severity-low { background-color: #4caf50; }

.detail-cell {
    display: flex;
    flex-direction: column;
}

.detail-title {
    font-weight: 700;
    color: #2f241d;
}

.actions-cell {
    display: flex;
    gap: 16px;
}

.action-link {
    background: none;
    border: none;
    color: #c0392b;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    text-transform: uppercase;
}

.action-link:hover {
    text-decoration: underline;
}

.empty-state {
    display: block;
    padding: 16px;
    text-align: center;
    color: #7f7064;
}

:deep(.p-datatable-header) {
    background: transparent;
    border: none;
    padding: 0;
}

:deep(.p-datatable-thead > tr > th) {
    background: #fdfaf6;
    color: #7f7064;
    font-size: 12px;
    font-weight: 700;
    padding: 16px;
    border-bottom: 2px solid #efe6da;
}

:deep(.p-tag) {
    border-radius: 8px;
    padding: 4px 12px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
}

.alert-details-dialog :deep(.p-dialog-header) {
    border-bottom: 1px solid #efe6da;
    padding: 1.5rem;
}

.details-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 1rem;
}

.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.details-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.alert-title {
    margin: 0;
    font-size: 1.25rem;
    color: #2f241d;
}

.meta-info {
    margin-top: 1rem;
    padding: 1rem;
    background: #fdfaf6;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.meta-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
}

.meta-label {
    color: #7f7064;
    font-weight: 600;
}

.meta-value {
    color: #2f241d;
}

.details-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .alerts-filters {
        grid-template-columns: 1fr;
    }
}
</style>
