<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import OrderDetails from './order-details.vue';

const props = defineProps({
    purchaseOrders: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const searchValue = ref('');
const selectedPurchaseOrder = ref(null);

const filteredPurchaseOrders = computed(() => {
    const normalizedSearchValue = searchValue.value.trim().toLowerCase();

    if (!normalizedSearchValue) {
        return props.purchaseOrders;
    }

    return props.purchaseOrders.filter((purchaseOrder) => {
        const supplierName = String(purchaseOrder.supplierName ?? '').toLowerCase();
        const priority = String(purchaseOrder.priority ?? '').toLowerCase();
        const status = String(purchaseOrder.status ?? '').toLowerCase();
        const code = String(purchaseOrder.code ?? '').toLowerCase();
        const id = String(purchaseOrder.id ?? '').toLowerCase();

        return supplierName.includes(normalizedSearchValue)
            || priority.includes(normalizedSearchValue)
            || status.includes(normalizedSearchValue)
            || code.includes(normalizedSearchValue)
            || id.includes(normalizedSearchValue);
    });
});

function getSeverityByStatus(status) {
    if (status === 'Pending') return 'warning';
    if (status === 'In Preparation' || status === 'Confirmed' || status === 'In Transit') return 'info';
    if (status === 'Delivered') return 'success';
    if (status === 'Delayed') return 'danger';
    return 'secondary';
}

function getStatusLabel(status) {
    const translations = {
        'Pending': t('supply-and-purchasing.shared.status.pending'),
        'In Preparation': t('supply-and-purchasing.shared.status.in-preparation'),
        'Confirmed': 'Confirmed',
        'In Transit': 'In Transit',
        'Delivered': t('supply-and-purchasing.shared.status.delivered'),
        'Delayed': t('supply-and-purchasing.shared.status.delayed')
    };

    return translations[status] ?? status;
}

function getPriorityLabel(priority) {
    const translations = {
        'High': t('supply-and-purchasing.shared.priority.high'),
        'Medium': t('supply-and-purchasing.shared.priority.medium'),
        'Low': t('supply-and-purchasing.shared.priority.low')
    };

    return translations[priority] ?? priority;
}

function sanitizeNumber(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function calculateOrderTotal(items) {
    return items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
}

function calculateItemSubtotal(item) {
    return sanitizeNumber(item.quantity) * sanitizeNumber(item.unitPrice);
}

function formatCurrency(value) {
    return sanitizeNumber(value).toFixed(2);
}

function openPurchaseOrderDetail(purchaseOrder) {
    router.push(`/purchasing/orders/${purchaseOrder.id}/view`);
}

function closePurchaseOrderDetail() {
    router.push('/purchasing/orders');
}

function formatCode(purchaseOrder) {
    return purchaseOrder.code ?? `PO-${String(purchaseOrder.id).padStart(5, '0')}`;
}

watch(
    [() => route.path, () => props.purchaseOrders],
    () => {
        const match = route.path.match(/^\/purchasing\/orders\/(\d+)\/view$/);
        if (!match) {
            selectedPurchaseOrder.value = null;
            return;
        }

        const id = Number(match[1]);
        const order = props.purchaseOrders.find((item) => Number(item.id) === id);
        selectedPurchaseOrder.value = order ?? null;
        if (!order && props.purchaseOrders.length > 0) {
            router.push('/purchasing/orders');
        }
    },
    { immediate: true }
);

// Pagination logic
const firstRow = ref(0);
const rowsPerPage = ref(5);

const totalRecords = computed(() => filteredPurchaseOrders.value.length);
const totalPages = computed(() => Math.ceil(totalRecords.value / rowsPerPage.value));
const currentPage = computed(() => Math.floor(firstRow.value / rowsPerPage.value) + 1);

const paginatedOrders = computed(() =>
    filteredPurchaseOrders.value.slice(firstRow.value, firstRow.value + rowsPerPage.value)
);

function prevPage() {
    if (firstRow.value > 0) {
        firstRow.value -= rowsPerPage.value;
    }
}

function nextPage() {
    if (firstRow.value + rowsPerPage.value < totalRecords.value) {
        firstRow.value += rowsPerPage.value;
    }
}

watch(searchValue, () => {
    firstRow.value = 0;
});
</script>

<template>
    <section class="purchase-orders-table">
        <div class="purchase-orders-table__toolbar">
            <div>
                <div class="purchase-orders-table__heading">
                    <div class="purchase-orders-table__icon-wrap">
                        <i class="pi pi-chart-bar" />
                    </div>
                    <h2 class="purchase-orders-table__title">{{ t('supply-and-purchasing.table.title') }}</h2>
                </div>
            </div>

            <div class="purchase-orders-table__toolbar-actions">
                <button type="button" class="purchase-orders-table__toolbar-button">
                    <i class="pi pi-filter" />
                </button>
                <button type="button" class="purchase-orders-table__toolbar-button">
                    <i class="pi pi-download" />
                </button>
            </div>
        </div>

        <span class="purchase-orders-table__search">
            <i class="pi pi-search" />
            <InputText v-model="searchValue" :placeholder="t('supply-and-purchasing.table.search-placeholder')" />
        </span>

        <DataTable
            :value="paginatedOrders"
            :loading="loading"
            responsiveLayout="scroll"
            dataKey="id"
            class="purchase-orders-table__grid"
        >
            <Column field="id" :header="t('supply-and-purchasing.table.columns.code')" sortable>
                <template #body="{ data }">
                    <div class="purchase-orders-table__code-cell">
                        <strong>{{ formatCode(data) }}</strong>
                        <span>{{ data.supplierName }}</span>
                    </div>
                </template>
            </Column>

            <Column field="status" :header="t('supply-and-purchasing.table.columns.status')" sortable>
                <template #body="{ data }">
                    <Tag :value="getStatusLabel(data.status).toUpperCase()" :severity="getSeverityByStatus(data.status)" class="purchase-orders-table__status-tag" />
                </template>
            </Column>

            <Column :header="t('supply-and-purchasing.table.columns.actions')">
                <template #body="{ data }">
                    <Button
                        :label="t('supply-and-purchasing.table.actions.detail')"
                        text
                        severity="secondary"
                        class="purchase-orders-table__detail-button"
                        @click="openPurchaseOrderDetail(data)"
                    />
                </template>
            </Column>
        </DataTable>

        <div class="purchase-orders-table__footer">
            <span>{{ t('supply-and-purchasing.table.footer.showing', { filtered: filteredPurchaseOrders.length, total: purchaseOrders.length }) }}</span>
            <div class="purchase-orders-table__pager">
                <button 
                    type="button" 
                    class="purchase-orders-table__toolbar-button"
                    :disabled="currentPage === 1"
                    :style="{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }"
                    @click="prevPage"
                >
                    <i class="pi pi-angle-left" />
                </button>
                <span class="flex align-items-center px-2 text-sm font-semibold" style="color: #4b3d34;">
                    {{ currentPage }} / {{ totalPages || 1 }}
                </span>
                <button 
                    type="button" 
                    class="purchase-orders-table__toolbar-button"
                    :disabled="currentPage === totalPages || totalPages === 0"
                    :style="{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.4 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }"
                    @click="nextPage"
                >
                    <i class="pi pi-angle-right" />
                </button>
            </div>
        </div>

        <OrderDetails
            v-if="selectedPurchaseOrder"
            :id="selectedPurchaseOrder.id"
            :visible="!!selectedPurchaseOrder"
            @update:visible="(val) => { if (!val) closePurchaseOrderDetail(); }"
            @close="closePurchaseOrderDetail"
        />
    </section>
</template>

<style scoped>
.purchase-orders-table {
    background: #ffffff;
    border-radius: 18px;
    padding: 0;
    box-shadow: 0 14px 34px rgba(45, 36, 30, 0.1);
    overflow: hidden;
}

.purchase-orders-table__toolbar {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    padding: 18px 18px 14px;
    border-bottom: 1px solid #eee5d9;
}

.purchase-orders-table__heading {
    display: flex;
    align-items: center;
    gap: 10px;
}

.purchase-orders-table__icon-wrap {
    color: #7b6d61;
    font-size: 14px;
}

.purchase-orders-table__title {
    margin: 0;
    color: #40342d;
    font-size: 22px;
}

.purchase-orders-table__toolbar-actions {
    display: flex;
    gap: 8px;
}

.purchase-orders-table__toolbar-button,
.purchase-orders-table__search {
    border: 1px solid #ebe2d7;
    background: #fbf8f4;
    border-radius: 10px;
}

.purchase-orders-table__toolbar-button {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #7a6c60;
    cursor: pointer;
}

.purchase-orders-table__search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 16px 18px 0;
    padding: 0 12px;
}

.purchase-orders-table__search :deep(.p-inputtext) {
    border: none;
    background: transparent;
    box-shadow: none;
    width: 100%;
}

.purchase-orders-table__grid {
    margin-top: 14px;
}

.purchase-orders-table__grid :deep(.p-datatable-header),
.purchase-orders-table__grid :deep(.p-paginator) {
    display: none;
}

.purchase-orders-table__grid :deep(.p-datatable-thead > tr > th) {
    background: #f7f0e6;
    color: #6d5f55;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.08em;
    border-color: #efe6da;
}

.purchase-orders-table__grid :deep(.p-datatable-tbody > tr > td) {
    border-color: #efe6da;
    padding: 1rem 1rem;
    color: #4b3d34;
}

.purchase-orders-table__code-cell {
    display: grid;
    gap: 3px;
}

.purchase-orders-table__code-cell strong {
    color: #40342d;
}

.purchase-orders-table__code-cell span {
    color: #8e8177;
    font-size: 12px;
}

.purchase-orders-table__status-tag {
    font-size: 11px;
}

.purchase-orders-table__detail-button {
    padding: 0;
    color: #4f4036;
}

.purchase-orders-table__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 18px 18px;
    color: #85786c;
    font-size: 12px;
}

.purchase-orders-table__pager {
    display: flex;
    gap: 6px;
}

.purchase-orders-table__detail-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(41, 31, 26, 0.35);
    z-index: 30;
}

.purchase-orders-table__detail-modal {
    width: min(720px, 100%);
    border-radius: 22px;
    background: #fffdf9;
    box-shadow: 0 24px 60px rgba(24, 18, 15, 0.22);
    padding: 22px;
}

.purchase-orders-table__detail-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
}

.purchase-orders-table__detail-kicker {
    display: inline-block;
    color: #a07832;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.purchase-orders-table__detail-header h3 {
    margin: 8px 0 0;
    color: #342923;
    font-size: 28px;
}

.purchase-orders-table__detail-header p {
    margin: 6px 0 0;
    color: #7d7065;
}

.purchase-orders-table__detail-meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.purchase-orders-table__detail-meta article {
    display: grid;
    gap: 8px;
    padding: 12px;
    border-radius: 14px;
    background: #f8f2e8;
}

.purchase-orders-table__detail-meta span {
    color: #7d7065;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.purchase-orders-table__detail-meta strong {
    color: #3e332d;
}

.purchase-orders-table__detail-items {
    margin-top: 18px;
    border: 1px solid #eee3d6;
    border-radius: 16px;
    overflow: hidden;
}

.purchase-orders-table__detail-items-head,
.purchase-orders-table__detail-item-row {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    gap: 12px;
    align-items: center;
    padding: 14px 16px;
}

.purchase-orders-table__detail-items-head {
    background: #f6eee3;
    color: #6d5f55;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.purchase-orders-table__detail-item-row {
    border-top: 1px solid #efe6da;
    color: #4b3d34;
}

@media (max-width: 1100px) {
    .purchase-orders-table__search {
        min-width: 0;
    }
}

@media (max-width: 960px) {
    .purchase-orders-table__toolbar {
        flex-direction: column;
        align-items: flex-start;
    }

    .purchase-orders-table__search {
        margin-right: 18px;
    }

    .purchase-orders-table__footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .purchase-orders-table__detail-meta {
        grid-template-columns: 1fr 1fr;
    }

    .purchase-orders-table__detail-items-head,
    .purchase-orders-table__detail-item-row {
        grid-template-columns: 1.6fr 1fr 1fr 1fr;
    }
}

@media (max-width: 640px) {
    .purchase-orders-table__detail-meta {
        grid-template-columns: 1fr;
    }

    .purchase-orders-table__detail-items-head,
    .purchase-orders-table__detail-item-row {
        grid-template-columns: 1fr;
    }
}
</style>
