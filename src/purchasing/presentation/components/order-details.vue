<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import useOrdersStore from '../../application/orders.store.js';

const props = defineProps({
    id: {
        type: [String, Number],
        required: true
    },
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'close']);

const { t } = useI18n();
const store = useOrdersStore();
const order = ref(null);
const loading = ref(false);

const isVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
});

async function loadOrder() {
    loading.value = true;
    const orderId = Number(props.id);
    const existing = store.purchaseOrders.find(o => Number(o.id) === orderId);
    if (existing) {
        order.value = existing;
    } else {
        const fetched = await store.fetchOrderById(orderId);
        order.value = fetched;
    }
    loading.value = false;
}

onMounted(() => {
    loadOrder();
});

const orderTotal = computed(() => {
    if (!order.value?.items) return 0;
    return order.value.items.reduce((sum, item) => sum + (Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0)), 0);
});

function getSeverityByStatus(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') return 'warning';
    if (s === 'confirmed' || s === 'in preparation' || s === 'in transit') return 'info';
    if (s === 'delivered') return 'success';
    if (s === 'delayed') return 'danger';
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

function formatCurrency(value) {
    return `$${Number(value ?? 0).toFixed(2)}`;
}

function handleClose() {
    isVisible.value = false;
    emit('close');
}
</script>

<template>
    <Dialog
        v-model:visible="isVisible"
        modal
        :draggable="false"
        :header="t('supplier-management.orders.details.title')"
        :style="{ width: 'min(750px, calc(100vw - 32px))' }"
        @hide="handleClose"
    >
        <div v-if="loading" class="order-details__loading">
            <i class="pi pi-spin pi-spinner text-3xl"></i>
            <p class="mt-2 text-sm text-gray-500">{{ t('supply-and-purchasing.detail.loading') }}</p>
        </div>

        <template v-else-if="order">
            <div class="order-details">
                <header class="order-details__header">
                    <div>
                        <span class="order-details__kicker">{{ t('supply-and-purchasing.detail.kicker') }}</span>
                        <h3>{{ order.code || `PO-${String(order.id).padStart(5, '0')}` }}</h3>
                        <p class="order-details__relations">
                            <strong>{{ t('supplier-management.orders.columns.restaurant') }}:</strong> {{ order.restaurantName }} | 
                            <strong>{{ t('supplier-management.orders.details.supplier') }}:</strong> {{ order.supplierName }}
                        </p>
                    </div>
                </header>

                <div class="order-details__meta">
                    <article>
                        <span>{{ t('supply-and-purchasing.detail.meta.status') }}</span>
                        <Tag :value="getStatusLabel(order.status).toUpperCase()" :severity="getSeverityByStatus(order.status)" />
                    </article>
                    <article>
                        <span>{{ t('supply-and-purchasing.detail.meta.priority') }}</span>
                        <strong>{{ getPriorityLabel(order.priority) }}</strong>
                    </article>
                    <article>
                        <span>{{ t('supply-and-purchasing.detail.meta.date') }}</span>
                        <strong>{{ order.orderDate }}</strong>
                    </article>
                    <article>
                        <span>{{ t('supply-and-purchasing.detail.meta.total') }}</span>
                        <strong>{{ formatCurrency(orderTotal) }}</strong>
                    </article>
                </div>

                <div class="order-details__items">
                    <DataTable :value="order.items" responsiveLayout="scroll" class="order-details__grid">
                        <Column field="productName" :header="t('supply-and-purchasing.detail.items.product')" />
                        <Column field="quantity" :header="t('supply-and-purchasing.detail.items.quantity')" />
                        <Column field="unitType" :header="t('supply-and-purchasing.detail.items.unit')" />
                        <Column :header="t('supply-and-purchasing.detail.items.subtotal')">
                            <template #body="{ data }">
                                {{ formatCurrency((data.quantity ?? 0) * (data.unitPrice ?? 0)) }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </template>
        <template #footer>
            <Button
                :label="t('supplier-management.orders.details.close')"
                severity="secondary"
                outlined
                type="button"
                @click="handleClose"
            />
        </template>
    </Dialog>
</template>

<style scoped>
.order-details__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.order-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-family: 'Montserrat', system-ui, sans-serif;
}

.order-details__header h3 {
    margin: 4px 0 0;
    color: #342923;
    font-family: 'Poppins', system-ui, sans-serif;
    font-size: 26px;
}

.order-details__kicker {
    display: inline-block;
    color: #a07832;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.order-details__relations {
    margin: 6px 0 0;
    color: #65594f;
    font-size: 13px;
}

.order-details__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 6px;
}

.order-details__meta article {
    display: grid;
    gap: 6px;
    padding: 12px;
    border-radius: 12px;
    background: #f8f2e8;
}

.order-details__meta span {
    color: #7d7065;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.order-details__meta strong {
    color: #3e332d;
    font-size: 13px;
}

.order-details__items {
    border: 1px solid #eee3d6;
    border-radius: 14px;
    overflow: hidden;
    margin-top: 8px;
}

.order-details__grid :deep(.p-datatable-thead > tr > th) {
    background: #f6eee3;
    color: #6d5f55;
    font-weight: 800;
    font-size: 12px;
}

@media (max-width: 768px) {
    .order-details__meta {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
