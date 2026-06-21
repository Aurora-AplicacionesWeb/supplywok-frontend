<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import useSupplierManagementStore from '../../application/supply-management.store.js';

const { t } = useI18n();
const store = useSupplierManagementStore();
const { clients, clientsLoaded, clientsCount } = storeToRefs(store);
const { fetchClients } = store;

const searchQuery = ref('');
const statusFilter = ref('all');

const statusOptions = computed(() => [
    { label: t('supplier-management.clients.filters.all'), value: 'all' },
    { label: t('supplier-management.clients.filters.active'), value: 'active' }
]);

const filteredClients = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    return clients.value.filter((client) => {
        const matchesStatus = statusFilter.value === 'all' || client.status === statusFilter.value;
        if (!matchesStatus) {
            return false;
        }

        if (!query) {
            return true;
        }

        return [
            client.id,
            client.name,
            client.district,
            client.status
        ].some((value) => String(value ?? '').toLowerCase().includes(query));
    });
});

const visibleClientsText = computed(() => t('supplier-management.clients.visible-count', {
    visible: filteredClients.value.length,
    total: clientsCount.value
}));

function formatStatus(value) {
    return String(value ?? '').replace(/^\w/, (letter) => letter.toUpperCase());
}

onMounted(() => {
    if (!clientsLoaded.value) {
        fetchClients();
    }
});
</script>

<template>
    <section class="clients-page">
        <header class="clients-page__header">
            <p class="clients-page__eyebrow">{{ t('supplier-management.clients.breadcrumb') }}</p>
            <h1 class="clients-page__title">{{ t('supplier-management.clients.title') }}</h1>
            <p class="clients-page__subtitle">{{ t('supplier-management.clients.subtitle') }}</p>
        </header>

        <section class="clients-page__filters">
            <div class="clients-page__filter">
                <label for="clients-search">{{ t('supplier-management.clients.search') }}</label>
                <pv-input-text id="clients-search" v-model="searchQuery" type="search" />
            </div>

            <div class="clients-page__filter">
                <label for="clients-status">{{ t('supplier-management.clients.filters.status') }}</label>
                <select id="clients-status" v-model="statusFilter">
                    <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </section>

        <section class="clients-page__table-wrap">
            <pv-datatable
                class="clients-table"
                :loading="!clientsLoaded"
                :value="filteredClients"
                responsive-layout="scroll"
            >
                <pv-column field="id" header="ID" />
                <pv-column field="name" :header="t('supplier-management.clients.columns.client')" />
                <pv-column field="district" :header="t('supplier-management.clients.columns.district')" />
                <pv-column :header="t('supplier-management.clients.columns.status')">
                    <template #body="{ data }">
                        {{ formatStatus(data.status) }}
                    </template>
                </pv-column>
                <template #empty>
                    <span class="clients-page__empty">{{ t('supplier-management.clients.empty') }}</span>
                </template>
            </pv-datatable>

            <footer class="clients-page__footer">
                {{ visibleClientsText }}
            </footer>
        </section>
    </section>
</template>

<style scoped>
.clients-page {
    min-height: 100%;
    color: #2d241e;
    font-family: 'Montserrat', system-ui, sans-serif;
}

.clients-page__header {
    margin-bottom: 24px;
}

.clients-page__eyebrow {
    margin: 0 0 8px;
    color: #b0762a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
}

.clients-page__title {
    margin: 0;
    color: #241c17;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 30px;
    line-height: 1.1;
}

.clients-page__subtitle {
    margin: 10px 0 0;
    color: #6f665d;
    font-size: 14px;
}

.clients-page__filters {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 16px;
    margin-bottom: 18px;
    padding: 18px;
    border: 1px solid #efe4d4;
    border-radius: 28px;
    background: #fffdf9;
    box-shadow: 0 14px 30px rgba(58, 42, 20, 0.06);
}

.clients-page__filter {
    display: grid;
    gap: 8px;
}

.clients-page__filter label {
    color: #312820;
    font-size: 12px;
    font-weight: 800;
}

.clients-page__filter :deep(.p-inputtext),
.clients-page__filter select {
    width: 100%;
    min-height: 42px;
    border: 1px solid #d8dfe8;
    border-radius: 14px;
    color: #344457;
    font: inherit;
    padding: 0 12px;
    background: #ffffff;
}

.clients-page__table-wrap {
    overflow: hidden;
    border: 1px solid #efe4d4;
    border-radius: 22px;
    background: #fffdf9;
    box-shadow: 0 16px 34px rgba(58, 42, 20, 0.08);
}

.clients-table :deep(.p-datatable-table) {
    min-width: 1040px;
}

.clients-table :deep(.p-datatable-header-cell) {
    background: #fffdf9;
    color: #7a6f66;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
}

.clients-table :deep(.p-datatable-tbody > tr > td),
.clients-table :deep(.p-datatable-thead > tr > th) {
    padding: 18px 14px;
    border-color: #ede7de;
    font-size: 14px;
}

.clients-table :deep(.p-datatable-tbody > tr > td) {
    color: #4b433c;
    font-weight: 500;
}

.clients-page__empty {
    display: block;
    padding: 20px;
    text-align: center;
    color: #6f665d;
}

.clients-page__footer {
    padding: 14px 22px;
    border-top: 1px solid #ede7de;
    color: #7a6f66;
    font-size: 13px;
}

@media (max-width: 900px) {
    .clients-page__filters {
        grid-template-columns: 1fr;
        border-radius: 20px;
    }
}
</style>
