<script setup>
import { ref, onMounted, computed } from 'vue';
import { iotStore } from '../../application/iot-store.js';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';

const store = iotStore();
const { t } = useI18n();
const router = useRouter();

const showCreateDialog = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');
const typeFilter = ref('all');

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

const filterTypeOptions = computed(() => [
    { label: t('iot.sensors.table.filter-all-types'), value: 'all' },
    ...typeOptions.value
]);

const handleSaveSensor = () => {
    if (!newSensor.value.name || !newSensor.value.type) return;
    
    const sensorData = {
        name: newSensor.value.name,
        type: newSensor.value.type,
        minValue: Number(newSensor.value.minValue),
        maxValue: Number(newSensor.value.maxValue),
        lastValue: Number(newSensor.value.lastValue),
        enabled: Boolean(newSensor.value.enabled)
    };

    if (isEditing.value) {
        store.updateSensor({ ...newSensor.value, ...sensorData }).then(() => {
            showCreateDialog.value = false;
        });
    } else {
        store.addSensor(sensorData).then(() => {
            showCreateDialog.value = false;
            resetForm();
        }).catch(err => {
            console.error('Failed to create sensor:', err);
        });
    }
};

const resetForm = () => {
    isEditing.value = false;
    newSensor.value = {
        name: '',
        type: 'kitchen-temperature',
        minValue: 0,
        maxValue: 100,
        lastValue: 25,
        enabled: true
    };
};

const openCreateDialog = () => {
    resetForm();
    showCreateDialog.value = true;
};

const openEditDialog = (sensor) => {
    isEditing.value = true;
    newSensor.value = { ...sensor };
    showCreateDialog.value = true;
};

const filteredSensors = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    const tFilter = typeFilter.value;

    return store.sensors.filter(sensor => {
        // Filter by type
        if (tFilter !== 'all' && sensor.type !== tFilter) {
            return false;
        }

        // Filter by query
        if (!q) return true;
        return sensor.name.toLowerCase().includes(q) || 
               t(`iot.sensors.types.${sensor.type}`).toLowerCase().includes(q);
    });
});

onMounted(() => {
    store.loadSensors();
});
</script>

<template>
    <div class="sensors-page">
        <header class="sensors-header">
            <div class="sensors-header__left">
                <div class="flex align-items-center gap-2 mb-2">
                    <Button icon="pi pi-arrow-left" text rounded @click="router.push('/iot/alerts')" />
                    <span class="sensors-header__kicker">{{ t('iot.alerts-page.kicker') }}</span>
                </div>
                <h1 class="sensors-header__title">{{ t('iot.sensors.title') }}</h1>
                <p class="sensors-header__description">{{ t('iot.sensors.description') }}</p>
            </div>
            <div class="sensors-header__right">
                <Button
                    :label="t('iot.sensors.create-button')"
                    icon="pi pi-plus"
                    @click="openCreateDialog"
                    class="create-sensor-btn"
                />
            </div>
        </header>

        <div class="sensors-filters card">
            <div class="filter-group">
                <label>{{ t('iot.sensors.table.search-label') }}</label>
                <div class="p-input-icon-left w-full">
                    <i class="pi pi-search" />
                    <InputText v-model="searchQuery" :placeholder="t('iot.sensors.table.search-placeholder')" class="w-full" />
                </div>
            </div>
            <div class="filter-group">
                <label>{{ t('iot.sensors.table.filter-type-label') }}</label>
                <select v-model="typeFilter" class="sensors-filters__select">
                    <option v-for="option in filterTypeOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <section class="sensors-table-wrap card">
            <pv-datatable
                class="sensors-table"
                :loading="store.loading"
                :value="filteredSensors"
                responsive-layout="scroll"
            >
                <pv-column field="id" :header="t('iot.sensors.table.id')" />
                <pv-column field="name" :header="t('iot.sensors.table.name')" />
                <pv-column :header="t('iot.sensors.table.type')">
                    <template #body="{ data }">
                        {{ t(`iot.sensors.types.${data.type}`) }}
                    </template>
                </pv-column>
                <pv-column field="minValue" :header="t('iot.sensors.table.min')" />
                <pv-column field="maxValue" :header="t('iot.sensors.table.max')" />
                <pv-column field="lastValue" :header="t('iot.sensors.table.last')" />
                <pv-column :header="t('iot.sensors.table.status')">
                    <template #body="{ data }">
                        <Tag 
                            :value="data.enabled ? t('iot.sensors.table.enabled') : t('iot.sensors.table.disabled')" 
                            :severity="data.enabled ? 'success' : 'danger'" 
                        />
                    </template>
                </pv-column>
                <pv-column>
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" text rounded @click="openEditDialog(data)" />
                    </template>
                </pv-column>
                <template #empty>
                    <span class="sensors-empty-text">{{ t('iot.sensors.table.empty') }}</span>
                </template>
            </pv-datatable>
        </section>

        <pv-dialog
            v-model:visible="showCreateDialog"
            modal
            :header="isEditing ? 'Editar Sensor' : t('iot.sensors.create-dialog.title')"
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
                        :label="isEditing ? 'Guardar Cambios' : t('iot.sensors.create-dialog.submit')"
                        @click="handleSaveSensor"
                        :disabled="!newSensor.name || !newSensor.type"
                        class="create-sensor-submit"
                    />
                </div>
            </template>
        </pv-dialog>
    </div>
</template>

<style scoped>
.sensors-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    font-family: 'Montserrat', system-ui, sans-serif;
}

.sensors-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.sensors-header__left {
    display: flex;
    flex-direction: column;
}

.sensors-header__kicker {
    color: #b56a16;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.sensors-header__title {
    margin: 8px 0 4px;
    font-size: 32px;
    font-weight: 700;
    color: #2f241d;
    font-family: 'Poppins', system-ui, sans-serif;
}

.sensors-header__description {
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

.sensors-filters {
    display: grid;
    grid-template-columns: 1fr 240px;
    gap: 20px;
}

.sensors-filters__select {
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

.sensors-filters__select:focus {
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

.sensors-table-wrap {
    padding: 0;
    overflow: hidden;
}

.sensors-table :deep(.p-datatable-thead > tr > th) {
    background-color: #fffaf0 !important;
    color: #4b3e34 !important;
    font-weight: 700 !important;
    border-bottom: 2px solid #efe4d4 !important;
    font-family: 'Poppins', system-ui, sans-serif;
}

.sensors-table :deep(.p-datatable-tbody > tr) {
    background-color: #ffffff !important;
    color: #5a4f43 !important;
    border-bottom: 1px solid #f6f0e6 !important;
    transition: background-color 0.2s !important;
}

.sensors-table :deep(.p-datatable-tbody > tr:hover) {
    background-color: #fffdf9 !important;
}

.sensors-empty-text {
    display: block;
    text-align: center;
    padding: 24px;
    color: #9b8c7e;
    font-style: italic;
}

@media (max-width: 768px) {
    .sensors-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .sensors-filters {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
</style>
