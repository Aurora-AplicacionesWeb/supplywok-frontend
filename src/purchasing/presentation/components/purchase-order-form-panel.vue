<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { Order } from '../../domain/model/order.entity.js';
import useOrdersStore from '../../application/orders.store.js';

const emit = defineEmits(['saved']);

const { t } = useI18n();
const store = useOrdersStore();
const { validationErrors, supplierDirectory } = storeToRefs(store);
const { addPurchaseOrder, clearValidationScope, validateOrderItem, ensureSuppliersLoaded } = store;

const priorityOptions = computed(() => ([
    { value: 'High', label: t('supply-and-purchasing.shared.priority.high') },
    { value: 'Medium', label: t('supply-and-purchasing.shared.priority.medium') },
    { value: 'Low', label: t('supply-and-purchasing.shared.priority.low') }
]));

const form = reactive({
    supplierId: '',
    supplierName: '',
    orderDate: formatLocalDate(new Date()),
    estimatedDate: formatLocalDate(addDays(new Date(), 2)),
    priority: 'Medium'
});

const draftLine = reactive({
    productName: '',
    quantity: '50',
    unitType: 'Kg',
    unitPrice: '2.50'
});

const orderLines = ref([]);

function resetDraftLine() {
    draftLine.productName = '';
    draftLine.quantity = '50';
    draftLine.unitType = 'Kg';
    draftLine.unitPrice = '2.50';
}

function syncSupplierData() {
    const selectedSupplier = supplierDirectory.value.find((supplier) => supplier.id === form.supplierId);
    form.supplierName = selectedSupplier?.name ?? '';
}

function buildOrderItemFromDraft() {
    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        inventoryItemId: null,
        productName: draftLine.productName,
        quantity: Number(draftLine.quantity || 0),
        unitPrice: Number(draftLine.unitPrice || 0),
        unitType: draftLine.unitType
    };
}

function addLine() {
    if (!validateOrderItem(buildOrderItemFromDraft(), 'draftLine')) {
        return;
    }

    orderLines.value.push(buildOrderItemFromDraft());
    clearValidationScope('items');
    resetDraftLine();
    clearValidationScope('draftLine');
}

function removeLine(index) {
    orderLines.value.splice(index, 1);
}

async function handleSubmit() {
    syncSupplierData();

    const items = [...orderLines.value];

    if (draftLine.productName.trim()) {
        if (!validateOrderItem(buildOrderItemFromDraft(), 'draftLine')) {
            return;
        }
        items.push(buildOrderItemFromDraft());
    } else {
        clearValidationScope('draftLine');
    }

    const purchaseOrder = new Order({
        code: buildPurchaseOrderCode(),
        supplierId: Number(form.supplierId),
        supplierName: form.supplierName,
        restaurantName: 'Gran Dragon Chifa',
        orderDate: form.orderDate,
        estimatedDate: form.estimatedDate,
        priority: form.priority,
        status: 'Pending',
        items: items
    });

    const wasCreated = await addPurchaseOrder(purchaseOrder);
    if (!wasCreated) {
        return;
    }

    orderLines.value = [];
    resetDraftLine();
    emit('saved');
}

function getFieldError(field) {
    return validationErrors.value[field] ?? '';
}

function getDraftFieldError(field) {
    return validationErrors.value.draftLine?.[field] ?? '';
}

function formatPrice(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue.toFixed(2) : '0.00';
}

function addDays(date, days) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildPurchaseOrderCode() {
    return `PO-${String(Date.now()).slice(-5)}`;
}

watch(supplierDirectory, (options) => {
    if (!form.supplierId && options.length > 0) {
        form.supplierId = options[0].id;
        form.supplierName = options[0].name;
    }
}, { immediate: true });

onMounted(() => {
    ensureSuppliersLoaded();
});
</script>

<template>
    <section class="purchase-order-form-panel">
        <div class="purchase-order-form-panel__header">
            <div class="purchase-order-form-panel__icon-wrap">
                <i class="pi pi-cart-plus" />
            </div>
            <h2 class="purchase-order-form-panel__title">{{ t('supply-and-purchasing.form.title') }}</h2>
        </div>

        <form class="purchase-order-form-panel__form" @submit.prevent="handleSubmit">
            <label class="purchase-order-form-panel__field">
                <span>{{ t('supply-and-purchasing.form.fields.supplier') }}</span>
                <select
                    v-model="form.supplierId"
                    class="purchase-order-form-panel__select"
                    :class="{ 'purchase-order-form-panel__select--invalid': getFieldError('supplierId') }"
                    @change="syncSupplierData"
                >
                    <option v-for="supplier in supplierDirectory" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option>
                </select>
                <small v-if="getFieldError('supplierId')" class="purchase-order-form-panel__error">{{ getFieldError('supplierId') }}</small>
            </label>

            <label class="purchase-order-form-panel__field">
                <span>{{ t('supply-and-purchasing.form.fields.estimated-date') }}</span>
                <InputText v-model="form.orderDate" :class="{ 'purchase-order-form-panel__input--invalid': getFieldError('orderDate') }" />
                <small v-if="getFieldError('orderDate')" class="purchase-order-form-panel__error">{{ getFieldError('orderDate') }}</small>
            </label>

            <label class="purchase-order-form-panel__field purchase-order-form-panel__field--with-divider">
                <span>{{ t('supply-and-purchasing.form.fields.priority') }}</span>
                <select
                    v-model="form.priority"
                    class="purchase-order-form-panel__select"
                    :class="{ 'purchase-order-form-panel__select--invalid': getFieldError('priority') }"
                >
                    <option v-for="priority in priorityOptions" :key="priority.value" :value="priority.value">{{ priority.label }}</option>
                </select>
                <small v-if="getFieldError('priority')" class="purchase-order-form-panel__error">{{ getFieldError('priority') }}</small>
            </label>

            <label class="purchase-order-form-panel__field">
                <span>{{ t('supply-and-purchasing.form.fields.product') }}</span>
                <InputText
                    v-model="draftLine.productName"
                    :placeholder="t('supply-and-purchasing.form.fields.product-placeholder')"
                    :class="{ 'purchase-order-form-panel__input--invalid': getDraftFieldError('productName') }"
                />
                <small v-if="getDraftFieldError('productName')" class="purchase-order-form-panel__error">{{ getDraftFieldError('productName') }}</small>
            </label>

            <div class="purchase-order-form-panel__line-grid">
                <label class="purchase-order-form-panel__field">
                    <span>{{ t('supply-and-purchasing.form.fields.quantity') }}</span>
                    <InputText v-model="draftLine.quantity" :class="{ 'purchase-order-form-panel__input--invalid': getDraftFieldError('quantity') }" />
                    <small v-if="getDraftFieldError('quantity')" class="purchase-order-form-panel__error">{{ getDraftFieldError('quantity') }}</small>
                </label>

                <label class="purchase-order-form-panel__field">
                    <span>{{ t('supply-and-purchasing.form.fields.unit') }}</span>
                    <InputText v-model="draftLine.unitType" :class="{ 'purchase-order-form-panel__input--invalid': getDraftFieldError('unitType') }" />
                    <small v-if="getDraftFieldError('unitType')" class="purchase-order-form-panel__error">{{ getDraftFieldError('unitType') }}</small>
                </label>

                <label class="purchase-order-form-panel__field">
                    <span>{{ t('supply-and-purchasing.form.fields.price') }}</span>
                    <InputText v-model="draftLine.unitPrice" :class="{ 'purchase-order-form-panel__input--invalid': getDraftFieldError('unitPrice') }" />
                    <small v-if="getDraftFieldError('unitPrice')" class="purchase-order-form-panel__error">{{ getDraftFieldError('unitPrice') }}</small>
                </label>
            </div>

            <button type="button" class="purchase-order-form-panel__add-line" @click="addLine">
                <i class="pi pi-plus-circle" />
                {{ t('supply-and-purchasing.form.actions.add-line') }}
            </button>

            <small v-if="getFieldError('items')" class="purchase-order-form-panel__error">{{ getFieldError('items') }}</small>

            <div v-if="orderLines.length" class="purchase-order-form-panel__lines-list">
                <article v-for="(line, index) in orderLines" :key="line.id" class="purchase-order-form-panel__line-card">
                    <div>
                        <strong>{{ line.productName }}</strong>
                        <p>{{ line.quantity }} {{ line.unitType }} - {{ formatPrice(line.unitPrice) }}</p>
                    </div>
                    <button type="button" class="purchase-order-form-panel__remove-line" @click="removeLine(index)">
                        <i class="pi pi-times" />
                    </button>
                </article>
            </div>

            <Button
                type="submit"
                :label="t('supply-and-purchasing.form.actions.create-order')"
                severity="danger"
                class="purchase-order-form-panel__submit"
            />
        </form>
    </section>
</template>

<style scoped>
.purchase-order-form-panel {
    background: #fff;
    border-radius: 18px;
    padding: 20px 18px;
    box-shadow: 0 14px 34px rgba(45, 36, 30, 0.1);
}

.purchase-order-form-panel__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
}

.purchase-order-form-panel__icon-wrap {
    color: #c21204;
    font-size: 14px;
}

.purchase-order-form-panel__title {
    margin: 0;
    color: #40342d;
    font-size: 22px;
}

.purchase-order-form-panel__form {
    display: grid;
    gap: 14px;
}

.purchase-order-form-panel__field {
    display: grid;
    gap: 7px;
}

.purchase-order-form-panel__field span {
    color: #6e6157;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.purchase-order-form-panel__error {
    color: #c1121f;
    font-size: 11px;
    font-weight: 500;
}

.purchase-order-form-panel__field--with-divider {
    padding-bottom: 12px;
    border-bottom: 1px solid #eee5d9;
}

.purchase-order-form-panel__select:focus,
.purchase-order-form-panel :deep(.p-inputtext:focus) {
    border-color: #d5b98f;
    box-shadow: 0 0 0 2px rgba(210, 18, 4, 0.08);
}

.purchase-order-form-panel__select,
.purchase-order-form-panel :deep(.p-inputtext) {
    width: 100%;
    border-radius: 10px;
    border: 1px solid #e6ddd3;
    background: #fffdfa;
    color: #4b3d34;
    padding: 0.78rem 0.9rem;
}

.purchase-order-form-panel__select--invalid,
.purchase-order-form-panel__input--invalid {
    border-color: #c1121f !important;
    box-shadow: 0 0 0 2px rgba(193, 18, 31, 0.08);
}

.purchase-order-form-panel__line-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.purchase-order-form-panel__add-line {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 0;
    border: none;
    background: transparent;
    color: #c21204;
    font-weight: 500;
    cursor: pointer;
}

.purchase-order-form-panel__submit {
    margin-top: 8px;
    border-radius: 10px;
    min-height: 42px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.purchase-order-form-panel__lines-list {
    display: grid;
    gap: 8px;
}

.purchase-order-form-panel__line-card {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 10px 12px;
    border-radius: 12px;
    background: #faf5ee;
    border: 1px solid #eee3d6;
}

.purchase-order-form-panel__line-card strong {
    color: #40342d;
    font-size: 14px;
}

.purchase-order-form-panel__line-card p {
    margin: 4px 0 0;
    color: #7d7065;
    font-size: 12px;
}

.purchase-order-form-panel__remove-line {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 999px;
    background: #fff;
    color: #a05b56;
    cursor: pointer;
}

@media (max-width: 720px) {
    .purchase-order-form-panel__line-grid {
        grid-template-columns: 1fr;
    }
}
</style>
