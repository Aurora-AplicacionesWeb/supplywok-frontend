<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { iotStore } from '../../application/iot-store.js';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import AlertsList from '../components/alerts/alerts-list.vue';
import AlertDetails from '../components/alerts/alert-details.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';

const store = iotStore();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const selectedAlert = ref(null);
const showCreateDialog = ref(false);
const newSensor = ref({
    name: '',
    type: 'kitchen-temperature',
    minValue: 0,
    maxValue: 100,
    lastValue: 25,
    enabled: true
});

const typeOptions = computed(() => [
    { label: t('iot.sensors.types.kitchen-temperature'), value: 'kitchen-temperature' },
    { label: t('iot.sensors.types.storage-temperature'), value: 'storage-temperature' },
    { label: t('iot.sensors.types.table-pressure'), value: 'table-pressure' },
    { label: t('iot.sensors.types.storage-pressure'), value: 'storage-pressure' }
]);

const handleCreateSensor = () => {
    if (!newSensor.value.name || !newSensor.value.type) return;
    store.addSensor({
        name: newSensor.value.name,
        type: newSensor.value.type,
        minValue: Number(newSensor.value.minValue),
        maxValue: Number(newSensor.value.maxValue),
        lastValue: Number(newSensor.value.lastValue),
        enabled: Boolean(newSensor.value.enabled)
    }).then(() => {
        showCreateDialog.value = false;
        newSensor.value = {
            name: '',
            type: 'kitchen-temperature',
            minValue: 0,
            maxValue: 100,
            lastValue: 25,
            enabled: true
        };
    }).catch(err => {
        console.error('Failed to create sensor:', err);
    });
};
const isDetailsVisible = computed({
    get: () => /\/iot\/alerts\/\d+\/view$/.test(route.path),
    set: (visible) => {
        if (!visible && /\/iot\/alerts\/\d+\/view$/.test(route.path)) {
            router.push('/iot/alerts');
        }
    }
});

const searchQuery = ref('');
const priorityFilter = ref('all');

const priorityOptions = computed(() => [
    { label: t('iot.alerts-page.severity-placeholder'), value: 'all' },
    { label: `${t('iot.alerts.severity-critical')} / ${t('iot.alerts.severity-high')}`, value: 'high' },
    { label: t('iot.alerts.severity-medium'), value: 'medium' },
    { label: t('iot.alerts.severity-low'), value: 'low' }
]);

const filteredAlerts = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    const p = priorityFilter.value.toLowerCase();

    return store.allAlerts.filter(alert => {
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
        if (!q) return true;
        const title = alert.titleKey ? t(alert.titleKey, alert.messageParams) : (alert.detailText || alert.detail || '');
        const msg = alert.messageKey ? t(alert.messageKey, alert.messageParams) : '';
        const source = alert.source || '';
        return title.toLowerCase().includes(q) || 
               msg.toLowerCase().includes(q) || 
               source.toLowerCase().includes(q);
    });
});

const acknowledgeAlert = (id) => {
    store.acknowledgeAlert(id);
    if (selectedAlert.value && selectedAlert.value.id === id) {
        isDetailsVisible.value = false;
    }
};

const openDetails = (alert) => {
    router.push(`/iot/alerts/${alert.id}/view`);
};

onMounted(() => {
    store.loadSensors();
});

watch(
    [() => route.path, () => store.allAlerts],
    () => {
        const match = route.path.match(/^\/iot\/alerts\/(\d+)\/view$/);
        if (!match) {
            selectedAlert.value = null;
            return;
        }
        const id = Number(match[1]);
        const alert = store.allAlerts.find((item) => Number(item.id) === id);
        if (alert) {
            selectedAlert.value = alert;
        } else if (store.allAlerts.length > 0) {
            router.push('/iot/alerts');
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="alerts-page">
        <header class="alerts-header">
            <div class="alerts-header__left">
                <span class="alerts-header__kicker">{{ t('iot.alerts-page.kicker') }}</span>
                <h1 class="alerts-header__title">{{ t('iot.alerts-page.title') }}</h1>
                <p class="alerts-header__description">{{ t('iot.alerts-page.description') }}</p>
            </div>
            <div class="alerts-header__right">
                <Button
                    :label="t('iot.sensors.create-button')"
                    icon="pi pi-plus"
                    @click="showCreateDialog = true"
                    class="create-sensor-btn"
                />
            </div>
        </header>

        <div class="alerts-filters card">
            <div class="filter-group">
                <label>{{ t('iot.alerts-page.search-label') }}</label>
                <div class="p-input-icon-left w-full">
                    <i class="pi pi-search" />
                    <InputText v-model="searchQuery" :placeholder="t('iot.alerts-page.search-placeholder')" class="w-full" />
                </div>
            </div>
            <div class="filter-group">
                <label>{{ t('iot.alerts-page.severity-label') }}</label>
                <select v-model="priorityFilter" class="alerts-filters__select">
                    <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <div class="alerts-table-container">
            <AlertsList
                :alerts="filteredAlerts"
                show-sensor
                @acknowledge="acknowledgeAlert"
                @view="openDetails"
            />
        </div>

        <AlertDetails
            v-if="selectedAlert"
            :alert="selectedAlert"
            :visible="isDetailsVisible"
            @update:visible="(val) => isDetailsVisible = val"
            show-sensor
            @close="isDetailsVisible = false"
        />

        <pv-dialog
            v-model:visible="showCreateDialog"
            modal
            :header="t('iot.sensors.create-dialog.title')"
            :style="{ width: 'min(420px, calc(100vw - 32px))' }"
            :draggable="false"
        >
            <div class="flex flex-column gap-3 p-3">
                <div class="flex flex-column gap-1">
                    <label class="dialog-label">{{ t('iot.sensors.create-dialog.name') }}</label>
                    <InputText v-model="newSensor.name" :placeholder="t('iot.sensors.create-dialog.name-placeholder')" />
                </div>
                <div class="flex flex-column gap-1">
                    <label class="dialog-label">{{ t('iot.sensors.create-dialog.type') }}</label>
                    <pv-select
                        v-model="newSensor.type"
                        :options="typeOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                </div>
                <div class="flex gap-3">
                    <div class="flex flex-column gap-1 flex-1 min-w-0">
                        <label class="dialog-label">{{ t('iot.sensors.create-dialog.min-value') }}</label>
                        <pv-input-number v-model="newSensor.minValue" :min="-100" :max="5000" class="w-full" />
                    </div>
                    <div class="flex flex-column gap-1 flex-1 min-w-0">
                        <label class="dialog-label">{{ t('iot.sensors.create-dialog.max-value') }}</label>
                        <pv-input-number v-model="newSensor.maxValue" :min="-100" :max="5000" class="w-full" />
                    </div>
                </div>
                <div class="flex flex-column gap-1">
                    <label class="dialog-label">{{ t('iot.sensors.create-dialog.last-value') }}</label>
                    <pv-input-number v-model="newSensor.lastValue" :min="-100" :max="5000" class="w-full" />
                </div>
                <div class="flex align-items-center gap-2">
                    <pv-checkbox v-model="newSensor.enabled" :binary="true" id="enabled-checkbox" />
                    <label for="enabled-checkbox" class="dialog-label cursor-pointer">{{ t('iot.sensors.create-dialog.enabled') }}</label>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-content-end gap-2">
                    <Button
                        :label="t('iot.sensors.create-dialog.cancel')"
                        severity="secondary"
                        outlined
                        @click="showCreateDialog = false"
                    />
                    <Button
                        :label="t('iot.sensors.create-dialog.submit')"
                        @click="handleCreateSensor"
                        :disabled="!newSensor.name || !newSensor.type"
                        class="create-sensor-submit"
                    />
                </div>
            </template>
        </pv-dialog>
    </div>
</template>

<style scoped>
.alerts-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    font-family: 'Montserrat', system-ui, sans-serif;
}

.alerts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.alerts-header__left {
    display: flex;
    flex-direction: column;
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

.create-sensor-btn {
    background-color: #dc2626 !important;
    border-color: #dc2626 !important;
    color: #ffffff !important;
    font-family: 'Poppins', system-ui, sans-serif;
    font-weight: 600 !important;
    border-radius: 8px !important;
    padding: 10px 20px !important;
    transition: all 0.2s ease-in-out !important;
    box-shadow: 0 4px 10px rgba(220, 38, 38, 0.2) !important;
}

.create-sensor-btn:hover {
    background-color: #b91c1c !important;
    border-color: #b91c1c !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(220, 38, 38, 0.3) !important;
}

.create-sensor-submit {
    background-color: #dc2626 !important;
    border-color: #dc2626 !important;
    color: #ffffff !important;
    font-weight: 600 !important;
}

.create-sensor-submit:hover:not(:disabled) {
    background-color: #b91c1c !important;
    border-color: #b91c1c !important;
}

.dialog-label {
    font-size: 13px;
    font-weight: 600;
    color: #40342d;
    font-family: 'Montserrat', system-ui, sans-serif;
}

:deep(.p-inputnumber) {
    width: 100% !important;
}

:deep(.p-inputnumber-input) {
    width: 100% !important;
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

@media (max-width: 768px) {
    .alerts-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .alerts-filters {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
</style>
