import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import i18n from '../../i18n.js';
import { OperationsApi } from '../infrastructure/operations-api.js';
import { TableAssembler } from '../infrastructure/table.assembler.js';
import { DishAssembler } from '../infrastructure/dish.assembler.js';
import { DishCategoryAssembler } from '../infrastructure/dish-category.assembler.js';
import { KitchenOrderAssembler } from '../infrastructure/kitchen-order.assembler.js';
import { Dish } from '../domain/model/dish.entity.js';
const operationsApi = new OperationsApi();
const translate = (key) => i18n.global.t(key);

const useOperationsStore = defineStore('operations', () => {
    const tables = ref([]);
    const dishes = ref([]);
    const dishCategories = ref([]);
    const kitchenOrders = ref([]);
    const currentKitchenOrder = ref(null);
    const errors = ref([]);
    const loading = ref(false);

    // --- New order form state ---

    const newOrderTableId = ref(null);
    const newOrderServiceType = ref('to_take_home');
    const newOrderDishes = ref([]);
    const newOrderObservations = ref('');

    // --- Computed state ---

    const pendingKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'pending'));
    const inPreparationKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'in_preparation'));
    const readyKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'ready'));
    const deliveredKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'delivered'));
    const cancelledKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'cancelled'));

    const activeKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state !== 'delivered' && o.state !== 'cancelled' && o.state !== 'deleted'));
    const activeDishes = computed(() => dishes.value.filter(d => d.active));
    const featuredDishes = computed(() => dishes.value.filter(d => d.outstanding && d.active));

    const dishesByCategory = computed(() => {
        const grouped = {};
        dishCategories.value.forEach(cat => {
            grouped[cat.id] = {
                category: cat,
                dishes: dishes.value.filter(d => d.dishCategoryId === cat.id && d.active)
            };
        });
        return grouped;
    });

    const freeTables = computed(() => tables.value.filter(t => t.state === 'available' && t.active));
    const occupiedTables = computed(() => tables.value.filter(t => t.state === 'busy' && t.active));
    const tablesByLocation = computed(() => {
        const grouped = {};
        tables.value.forEach(t => {
            if (!grouped[t.location]) grouped[t.location] = [];
            grouped[t.location].push(t);
        });
        return grouped;
    });

    const totalItemsNewOrder = computed(() => newOrderDishes.value.reduce((sum, d) => sum + (d.quantity || 0), 0));
    const totalNewOrder = computed(() => newOrderDishes.value.reduce((sum, d) => sum + (d.quantity || 0) * (d.price || 0), 0));

    // --- Order form actions ---

    function initNewKitchenOrder(tableId = null, typeService = 'to_take_home') {
        newOrderTableId.value = tableId;
        newOrderServiceType.value = typeService;
        newOrderDishes.value = [];
        newOrderObservations.value = '';
    }

    function selectServiceType(typeService, tableId = null) {
        newOrderServiceType.value = typeService;
        newOrderTableId.value = tableId;
    }

    function setNewOrderObservations(value) {
        newOrderObservations.value = value;
    }

    function setNewOrderDishes(dishes) {
        newOrderDishes.value = dishes;
    }

    function addItemToOrder(dish, quantity = 1) {
        const existing = newOrderDishes.value.find(d => d.id === dish.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            newOrderDishes.value.push(new Dish({ ...dish, quantity }));
        }
    }

    function removeItemFromOrder(dishId) {
        const index = newOrderDishes.value.findIndex(d => d.id === dishId);
        if (index !== -1) newOrderDishes.value.splice(index, 1);
    }

    function updateItemQuantity(dishId, quantity) {
        const dish = newOrderDishes.value.find(d => d.id === dishId);
        if (dish) {
            if (quantity <= 0) {
                removeItemFromOrder(dishId);
            } else {
                dish.quantity = quantity;
            }
        }
    }

    function clearCurrentOrder() {
        initNewKitchenOrder(null, 'to_take_home');
        currentKitchenOrder.value = null;
    }

    // --- Fetch actions ---

    function fetchTables() {
        loading.value = true;
        return operationsApi.getTables().then(response => {
            tables.value = TableAssembler.toEntitiesFromResponse(response);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function fetchDishes() {
        loading.value = true;
        return operationsApi.getDishes().then(response => {
            dishes.value = DishAssembler.toEntitiesFromResponse(response);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function fetchDishCategories() {
        loading.value = true;
        return operationsApi.getDishCategories().then(response => {
            dishCategories.value = DishCategoryAssembler.toEntitiesFromResponse(response);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function fetchKitchenOrders() {
        loading.value = true;
        return operationsApi.getKitchenOrders().then(ordersResponse => {
            kitchenOrders.value = KitchenOrderAssembler.toEntitiesFromResponse(ordersResponse);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function fetchKitchenOrderById(id) {
        loading.value = true;
        return operationsApi.getKitchenOrderById(id).then(response => {
            const order = KitchenOrderAssembler.toEntityFromResource(response.data);
            currentKitchenOrder.value = order;
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    // --- Mutation actions ---

    function serializeOrderDishes(dishes) {
        return (dishes || []).map(function (d) {
            return {
                id: d.id,
                code: d.code,
                name: d.name,
                description: d.description,
                quantity: d.quantity,
                price: d.price,
                active: d.active,
                outstanding: d.outstanding,
                dishCategoryId: d.dishCategoryId
            };
        });
    }

    function createKitchenOrder() {
        if (newOrderDishes.value.length === 0) {
            errors.value.push(translate('operations.store.validation.minItems'));
            return null;
        }
        if (newOrderServiceType.value === 'table_service' && !newOrderTableId.value) {
            errors.value.push(translate('operations.store.validation.selectTable'));
            return null;
        }

        const selectedTable = newOrderServiceType.value === 'table_service'
            ? tables.value.find(t => t.id === newOrderTableId.value) || null
            : null;

        const orderData = {
            number: `C${String(kitchenOrders.value.length + 1).padStart(3, '0')}`,
            table: selectedTable,
            typeService: newOrderServiceType.value,
            state: 'pending',
            dishes: serializeOrderDishes(newOrderDishes.value),
            observations: newOrderObservations.value,
            dateCreated: new Date().toISOString(),
            totalPrice: totalNewOrder.value
        };

        loading.value = true;
        // 1) crear orden → 2) agregar platos → 3) recargar
        return operationsApi.createKitchenOrder(orderData).then(response => {
            const newOrderId = response.data?.id ?? response.data?.kitchenOrderId;
            if (!newOrderId) {
                const newOrder = KitchenOrderAssembler.toEntityFromResource(response.data);
                kitchenOrders.value.push(newOrder);
                initNewKitchenOrder(null, 'to_take_home');
                loading.value = false;
                return newOrder;
            }
            const dishPromises = newOrderDishes.value.map(function(dish) {
                return operationsApi.addDishToKitchenOrder(newOrderId, {
                    id: dish.id,
                    quantity: dish.quantity
                });
            });
            return Promise.all(dishPromises).then(function() {
                return operationsApi.getKitchenOrderById(newOrderId);
            }).then(function(fullOrderResponse) {
                const newOrder = KitchenOrderAssembler.toEntityFromResource(fullOrderResponse.data);
                kitchenOrders.value.push(newOrder);
                initNewKitchenOrder(null, 'to_take_home');
                loading.value = false;
                return newOrder;
            });
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
            return null;
        });
    }

    function addTable(tableData) {
        loading.value = true;
        return operationsApi.createTable(tableData).then(response => {
            const newTable = TableAssembler.toEntityFromResource(response.data);
            tables.value.push(newTable);
            return newTable;
        }).catch(error => {
            errors.value.push(error);
            return null;
        });
    }

    function updateTable(tableId, tableData) {
        loading.value = true;
        return operationsApi.updateTable(tableId, tableData).then(response => {
            const updatedTable = TableAssembler.toEntityFromResource(response.data);
            const index = tables.value.findIndex(t => t.id === tableId);
            if (index !== -1) tables.value[index] = updatedTable;
            loading.value = false;
            return updatedTable;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
            return null;
        });
    }

    function deleteTable(id) {
        loading.value = true;
        return operationsApi.deleteTable(id).then(() => {
            return fetchTables();
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
            return false;
        });
    }

    function updateKitchenOrder(orderId, orderData) {
        loading.value = true;
        const existing = kitchenOrders.value.find(o => o.id === orderId);

        const payload = {
            number: existing?.number || '',
            tableId: orderData.tableId ?? existing?.tableId ?? existing?.table?.id ?? null,
            typeService: orderData.typeService ?? existing?.typeService ?? '',
            observations: orderData.observations ?? existing?.observations ?? '',
            dateCreated: existing?.dateCreated
                ? (existing.dateCreated instanceof Date ? existing.dateCreated.toISOString() : existing.dateCreated)
                : new Date().toISOString()
        };
        return operationsApi.updateKitchenOrder(orderId, payload).then(response => {
            const updated = KitchenOrderAssembler.toEntityFromResource(response.data);
            const index = kitchenOrders.value.findIndex(o => o.id === orderId);
            if (index !== -1) kitchenOrders.value[index] = updated;
            clearCurrentOrder();
            loading.value = false;
            return updated;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
            return null;
        });
    }

    function deleteKitchenOrder(orderId) {
        loading.value = true;
        return operationsApi.deleteKitchenOrder(orderId).then(() => {
            const index = kitchenOrders.value.findIndex(o => o.id === orderId);
            if (index !== -1) kitchenOrders.value.splice(index, 1);
            if (currentKitchenOrder.value?.id === orderId) currentKitchenOrder.value = null;
            loading.value = false;
            return true;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
            return false;
        });
    }

    function updateKitchenOrderStatus(orderId, newState, observations) {
        const order = kitchenOrders.value.find(o => o.id === orderId);
        if (!order) return null;

        const transitions = {
            pending: ['in_preparation', 'cancelled'],
            in_preparation: ['ready', 'cancelled'],
            ready: ['delivered'],
            delivered: [],
            cancelled: []
        };
        const allowed = transitions[order.state] || [];
        if (!allowed.includes(newState)) return null;

        loading.value = true;
        return operationsApi.updateKitchenOrderStatus(orderId, newState, observations).then(response => {
            const updated = KitchenOrderAssembler.toEntityFromResource(response.data);
            const index = kitchenOrders.value.findIndex(o => o.id === orderId);
            if (index !== -1) kitchenOrders.value[index] = updated;
            if (currentKitchenOrder.value?.id === orderId) currentKitchenOrder.value = updated;
            loading.value = false;
            return updated;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
            return null;
        });
    }

    function resetStore() {
        tables.value = [];
        dishes.value = [];
        dishCategories.value = [];
        kitchenOrders.value = [];
        currentKitchenOrder.value = null;
        errors.value = [];
        loading.value = false;
        initNewKitchenOrder(null, 'to_take_home');
    }

    return {
        tables, dishes, dishCategories, kitchenOrders,
        currentKitchenOrder, errors, loading,
        newOrderTableId, newOrderServiceType,
        newOrderDishes, newOrderObservations,
        pendingKitchenOrders, inPreparationKitchenOrders, readyKitchenOrders,
        deliveredKitchenOrders, cancelledKitchenOrders, activeKitchenOrders,
        activeDishes, featuredDishes, dishesByCategory,
        freeTables, occupiedTables, tablesByLocation,
        totalItemsNewOrder, totalNewOrder,
        initNewKitchenOrder, selectServiceType, setNewOrderObservations, setNewOrderDishes,
        addItemToOrder, removeItemFromOrder, updateItemQuantity, clearCurrentOrder,
        fetchTables, fetchDishes, fetchDishCategories, fetchKitchenOrders,
        fetchKitchenOrderById,
        createKitchenOrder, updateKitchenOrderStatus, updateKitchenOrder, deleteKitchenOrder,
        addTable, updateTable, deleteTable, resetStore
    };
});

export default useOperationsStore;
