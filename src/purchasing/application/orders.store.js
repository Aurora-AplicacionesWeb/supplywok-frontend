import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { OrdersApi } from '../infrastructure/orders-api.js';
import { OrderAssembler } from '../infrastructure/order.assembler.js';
import { SupplierApi } from '../infrastructure/supplier-api.js';
import i18n from '../../i18n.js';

const ordersApi = new OrdersApi();
const supplierApi = new SupplierApi();
const translate = (key) => i18n.global.t(key);

export const useOrdersStore = defineStore('orders', () => {
    const purchaseOrders = ref([]);
    const suppliers = ref([]);
    const errors = ref([]);
    const validationErrors = ref({});
    const purchaseOrdersLoaded = ref(false);
    const suppliersLoaded = ref(false);
    const loading = ref(false);

    const purchaseOrdersCount = computed(() => {
        return purchaseOrdersLoaded.value ? purchaseOrders.value.length : 0;
    });

    const pendingPurchaseOrdersCount = computed(() => {
        return purchaseOrders.value.filter((purchaseOrder) => purchaseOrder.status === 'Pending').length;
    });

    const highPriorityPurchaseOrdersCount = computed(() => {
        return purchaseOrders.value.filter((purchaseOrder) => purchaseOrder.priority === 'High').length;
    });

    const supplierDirectory = computed(() => {
        return suppliers.value.map((supplier) => ({
            ...supplier,
            id: String(supplier.id),
            name: supplier.businessName ?? '',
            contactName: [supplier.firstName, supplier.lastName].filter(Boolean).join(' '),
            email: supplier.contactEmail ?? '',
            phone: supplier.phone ?? '',
            category: supplier.category ?? ''
        }));
    });

    async function fetchSuppliers() {
        loading.value = true;
        try {
            const response = await supplierApi.getSuppliers();
            const rawData = response?.data ?? [];
            suppliers.value = Array.isArray(rawData)
                ? rawData
                : Array.isArray(rawData.suppliers)
                    ? rawData.suppliers
                    : [];
            suppliersLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchPurchaseOrders() {
        loading.value = true;
        try {
            const response = await ordersApi.getOrders();
            purchaseOrders.value = OrderAssembler.toEntitiesFromResponse(response);
            purchaseOrdersLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    async function fetchOrderById(id) {
        loading.value = true;
        try {
            const response = await ordersApi.getOrderById(id);
            return OrderAssembler.toEntityFromResponse(response);
        } catch (error) {
            errors.value.push(error);
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function ensurePurchaseOrdersLoaded() {
        if (!purchaseOrdersLoaded.value && !loading.value) {
            await fetchPurchaseOrders();
        }
    }

    async function ensureSuppliersLoaded() {
        if (!suppliersLoaded.value && !loading.value) {
            await fetchSuppliers();
        }
    }

    function clearValidationErrors() {
        validationErrors.value = {};
    }

    function clearValidationScope(scope) {
        const nextValidationErrors = { ...validationErrors.value };
        delete nextValidationErrors[scope];
        validationErrors.value = nextValidationErrors;
    }

    function collectOrderItemValidationErrors(item) {
        const itemValidationErrors = {};
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        if (!String(item.productName ?? '').trim()) {
            itemValidationErrors.productName = translate('supply-and-purchasing.validation.product-name-required');
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            itemValidationErrors.quantity = translate('supply-and-purchasing.validation.quantity-invalid');
        }

        if (!String(item.unitType ?? '').trim()) {
            itemValidationErrors.unitType = translate('supply-and-purchasing.validation.unit-required');
        }

        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            itemValidationErrors.unitPrice = translate('supply-and-purchasing.validation.unit-price-invalid');
        }

        return itemValidationErrors;
    }

    function validateOrderItem(item, scope = 'draftLine') {
        const itemValidationErrors = collectOrderItemValidationErrors(item);
        const nextValidationErrors = { ...validationErrors.value };

        if (Object.keys(itemValidationErrors).length > 0) {
            nextValidationErrors[scope] = itemValidationErrors;
            validationErrors.value = nextValidationErrors;
            return false;
        }

        delete nextValidationErrors[scope];
        validationErrors.value = nextValidationErrors;
        return true;
    }

    function validatePurchaseOrder(purchaseOrder) {
        const nextValidationErrors = {};

        if (!String(purchaseOrder.supplierId ?? '').trim()) {
            nextValidationErrors.supplierId = translate('supply-and-purchasing.validation.supplier-required');
        }

        if (!String(purchaseOrder.orderDate ?? '').trim()) {
            nextValidationErrors.orderDate = translate('supply-and-purchasing.validation.order-date-required');
        }

        if (!String(purchaseOrder.priority ?? '').trim()) {
            nextValidationErrors.priority = translate('supply-and-purchasing.validation.priority-required');
        }

        if (!Array.isArray(purchaseOrder.items) || purchaseOrder.items.length === 0) {
            nextValidationErrors.items = translate('supply-and-purchasing.validation.items-required');
        } else {
            const itemLinesValidationErrors = {};

            purchaseOrder.items.forEach((item, index) => {
                const itemValidationErrors = collectOrderItemValidationErrors(item);
                if (Object.keys(itemValidationErrors).length > 0) {
                    itemLinesValidationErrors[index] = itemValidationErrors;
                }
            });

            if (Object.keys(itemLinesValidationErrors).length > 0) {
                nextValidationErrors.itemLines = itemLinesValidationErrors;
            }
        }

        validationErrors.value = nextValidationErrors;
        return Object.keys(nextValidationErrors).length === 0;
    }

    async function addPurchaseOrder(purchaseOrder) {
        clearValidationScope('draftLine');

        if (!validatePurchaseOrder(purchaseOrder)) {
            return false;
        }

        try {
            const response = await ordersApi.createOrder(OrderAssembler.toResourceFromEntity(purchaseOrder));
            const newPurchaseOrder = OrderAssembler.toEntityFromResource(response.data);
            purchaseOrders.value.unshift(newPurchaseOrder);
            clearValidationErrors();
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    async function updateOrder(id, order) {
        try {
            const response = await ordersApi.updateOrder(id, OrderAssembler.toResourceFromEntity(order));
            const updated = OrderAssembler.toEntityFromResource(response.data);
            const idx = purchaseOrders.value.findIndex(o => o.id === id);
            if (idx !== -1) {
                purchaseOrders.value[idx] = updated;
            }
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    async function deleteOrder(id) {
        try {
            await ordersApi.deleteOrder(id);
            purchaseOrders.value = purchaseOrders.value.filter(o => o.id !== id);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    return {
        purchaseOrders,
        suppliers,
        errors,
        validationErrors,
        purchaseOrdersLoaded,
        suppliersLoaded,
        loading,
        purchaseOrdersCount,
        pendingPurchaseOrdersCount,
        highPriorityPurchaseOrdersCount,
        supplierDirectory,
        fetchSuppliers,
        ensureSuppliersLoaded,
        ensurePurchaseOrdersLoaded,
        fetchPurchaseOrders,
        fetchOrderById,
        clearValidationErrors,
        clearValidationScope,
        validateOrderItem,
        validatePurchaseOrder,
        addPurchaseOrder,
        updateOrder,
        deleteOrder
    };
});

export default useOrdersStore;
