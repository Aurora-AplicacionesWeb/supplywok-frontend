/**
 * Application service store for the `Operations` bounded context.
 * It coordinates table, dish, dish-category, kitchen-order, kitchen-order-item and kitchen-lock use cases
 * and keeps a UI-facing state.
 *
 * @module useOperationsStore
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import i18n from '../../i18n.js';
import { OperationsApi } from '../infrastructure/operations-api.js';
import { TableAssembler } from '../infrastructure/table.assembler.js';
import { DishAssembler } from '../infrastructure/dish.assembler.js';
import { DishCategoryAssembler } from '../infrastructure/dish-category.assembler.js';
import { KitchenOrderAssembler } from '../infrastructure/kitchen-order.assembler.js';
import { KitchenLockAssembler } from '../infrastructure/kitchen-lock.assembler.js';
import { Table } from '../domain/model/table.entity.js';
import { Dish } from '../domain/model/dish.entity.js';
import { DishCategory } from '../domain/model/dish-category.entity.js';
import { KitchenOrder } from '../domain/model/kitchen-order.entity.js';
import { KitchenLock } from '../domain/model/kitchen-lock.entity.js';

const operationsApi = new OperationsApi();
const translate = (key) => i18n.global.t(key);

/**
 * Reactive store that exposes Operations commands and queries.
 *
 * @returns {Object} Reactive Operations state and use-case actions.
 */
const useOperationsStore = defineStore('operations', () => {
    /**
     * List of table entities.
     * @type {import('vue').Ref<Table[]>}
     */
    const tables = ref([]);
    /**
     * List of dish entities.
     * @type {import('vue').Ref<Dish[]>}
     */
    const dishes = ref([]);
    /**
     * List of dish-category entities.
     * @type {import('vue').Ref<DishCategory[]>}
     */
    const dishCategories = ref([]);
    /**
     * List of kitchen-order entities.
     * @type {import('vue').Ref<KitchenOrder[]>}
     */
    const kitchenOrders = ref([]);
    /**
     * List of kitchen-order-item entities.
     * @type {import('vue').Ref<KitchenOrderItem[]>}
     */
    const kitchenOrderItems = ref([]);
    /**
     * Current kitchen-lock entity.
     * @type {import('vue').Ref<KitchenLock|null>}
     */
    const kitchenLock = ref(null);
    /**
     * Currently selected kitchen-order entity.
     * @type {import('vue').Ref<KitchenOrder|null>}
     */
    const currentKitchenOrder = ref(null);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether any API operation is in progress.
     * @type {import('vue').Ref<boolean>}
     */
    const loading = ref(false);

    // --- New order form state ---

    /**
     * Table id for a new kitchen order.
     * @type {import('vue').Ref<number|null>}
     */
    const newOrderTableId = ref(null);
    /**
     * Table number for a new kitchen order.
     * @type {import('vue').Ref<string|null>}
     */
    const newOrderTableNumber = ref(null);
    /**
     * Service type for a new kitchen order.
     * @type {import('vue').Ref<string>}
     */
    const newOrderServiceType = ref('to_take_home');
    /**
     * Items for a new kitchen order.
     * @type {import('vue').Ref<Object[]>}
     */
    const newOrderItems = ref([]);
    /**
     * Observations for a new kitchen order.
     * @type {import('vue').Ref<string>}
     */
    const newOrderObservations = ref('');

    // --- Computed state ---

    /**
     * Kitchen orders with pending state.
     * @type {import('vue').ComputedRef<KitchenOrder[]>}
     */
    const pendingKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'pending'));
    /**
     * Kitchen orders with in_preparation state.
     * @type {import('vue').ComputedRef<KitchenOrder[]>}
     */
    const inPreparationKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'in_preparation'));
    /**
     * Kitchen orders with ready state.
     * @type {import('vue').ComputedRef<KitchenOrder[]>}
     */
    const readyKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'ready'));
    /**
     * Kitchen orders with delivered state.
     * @type {import('vue').ComputedRef<KitchenOrder[]>}
     */
    const deliveredKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'delivered'));
    /**
     * Kitchen orders with canceled state.
     * @type {import('vue').ComputedRef<KitchenOrder[]>}
     */
    const cancelledKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state === 'cancelled'));

    /**
     * Kitchen orders that are neither delivered nor canceled.
     * @type {import('vue').ComputedRef<KitchenOrder[]>}
     */
    const activeKitchenOrders = computed(() => kitchenOrders.value.filter(o => o.state !== 'delivered' && o.state !== 'cancelled' && o.state !== 'deleted'));
    /**
     * Dishes that are currently active.
     * @type {import('vue').ComputedRef<Dish[]>}
     */
    const activeDishes = computed(() => dishes.value.filter(d => d.active));
    /**
     * Dishes that are both outstanding and active.
     * @type {import('vue').ComputedRef<Dish[]>}
     */
    const featuredDishes = computed(() => dishes.value.filter(d => d.outstanding && d.active));

    /**
     * Dishes grouped by dish category.
     * @type {import('vue').ComputedRef<Object>}
     */
    const dishesByCategory = computed(() => {
        const grouped = {};
        dishCategories.value.forEach(cat => {
            grouped[cat.id] = {
                category: cat,
                dishes: dishes.value.filter(d => d.categoryId === cat.id && d.active)
            };
        });
        return grouped;
    });

    /**
     * Tables that are available and active.
     * @type {import('vue').ComputedRef<Table[]>}
     */
    const freeTables = computed(() => tables.value.filter(t => t.state === 'available' && t.active));
    /**
     * Tables that are busy and active.
     * @type {import('vue').ComputedRef<Table[]>}
     */
    const occupiedTables = computed(() => tables.value.filter(t => t.state === 'busy' && t.active));
    /**
     * Tables grouped by location.
     * @type {import('vue').ComputedRef<Object>}
     */
    const tablesByLocation = computed(() => {
        const grouped = {};
        tables.value.forEach(t => {
            if (!grouped[t.location]) grouped[t.location] = [];
            grouped[t.location].push(t);
        });
        return grouped;
    });

    /**
     * Total item count in the new order.
     * @type {import('vue').ComputedRef<number>}
     */
    const totalItemsNewOrder = computed(() => newOrderItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0));
    /**
     * Total price of the new order.
     * @type {import('vue').ComputedRef<number>}
     */
    const totalNewOrder = computed(() => newOrderItems.value.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0));

    /**
     * Whether the kitchen is currently locked.
     * @type {import('vue').ComputedRef<boolean>}
     */
    const isKitchenLocked = computed(() => kitchenLock.value?.stateLocked ?? false);
    /**
     * Number of failed unlock attempts.
     * @type {import('vue').ComputedRef<number>}
     */
    const failedAttempts = computed(() => kitchenLock.value?.failAttempt ?? 0);

    // --- Order form actions ---

    /**
     * Initializes the new kitchen order form.
     * @param {number|null} tableId - Table identifier.
     * @param {string|null} tableNumber - Table number.
     * @param {string} typeService - Service type.
     * @returns {void}
     */
    function initNewKitchenOrder(tableId = null, tableNumber = null, typeService = 'to_take_home') {
        newOrderTableId.value = tableId;
        newOrderTableNumber.value = tableNumber;
        newOrderServiceType.value = typeService;
        newOrderItems.value = [];
        newOrderObservations.value = '';
    }

    /**
     * Selects a service type for the new order.
     * @param {string} typeService - Service type.
     * @param {number|null} tableId - Table identifier.
     * @param {string|null} tableNumber - Table number.
     * @returns {void}
     */
    function selectServiceType(typeService, tableId = null, tableNumber = null) {
        newOrderServiceType.value = typeService;
        newOrderTableId.value = tableId;
        newOrderTableNumber.value = tableNumber;
    }

    /**
     * Sets observations for the new order.
     * @param {string} value - Observations text.
     * @returns {void}
     */
    function setNewOrderObservations(value) {
        newOrderObservations.value = value;
    }

    /**
     * Sets items for the new order.
     * @param {Object[]} items - Order items.
     * @returns {void}
     */
    function setNewOrderItems(items) {
        newOrderItems.value = items;
    }

    /**
     * Adds a dish to the new order, incrementing quantity if already present.
     * @param {Dish} dish - Dish entity to add.
     * @param {number} quantity - Quantity to add.
     * @param {string} observations - Item observations.
     * @returns {void}
     */
    function addItemToOrder(dish, quantity = 1, observations = '') {
        const existing = newOrderItems.value.find(item => item.dishId === dish.id);
        if (existing) {
            existing.quantity += quantity;
            if (observations) existing.observations = observations;
        } else {
            newOrderItems.value.push({
                dishId: dish.id,
                dishName: dish.name,
                quantity,
                unitPrice: dish.price,
                totalPrice: dish.price * quantity,
                state: 'pending',
                observations
            });
        }
    }

    /**
     * Removes a dish from the new order by dish id.
     * @param {number|string} dishId - Dish identifier.
     * @returns {void}
     */
    function removeItemFromOrder(dishId) {
        const index = newOrderItems.value.findIndex(item => item.dishId === dishId);
        if (index !== -1) newOrderItems.value.splice(index, 1);
    }

    /**
     * Updates the quantity of an item in the new order. Removes the item if quantity is zero or less.
     * @param {number|string} dishId - Dish identifier.
     * @param {number} quantity - New quantity.
     * @returns {void}
     */
    function updateItemQuantity(dishId, quantity) {
        const item = newOrderItems.value.find(i => i.dishId === dishId);
        if (item) {
            if (quantity <= 0) {
                removeItemFromOrder(dishId);
            } else {
                item.quantity = quantity;
                item.totalPrice = quantity * item.unitPrice;
            }
        }
    }

    /**
     * Clears the current order form and selected order.
     * @returns {void}
     */
    function clearCurrentOrder() {
        initNewKitchenOrder(null, null, 'to_take_home');
        currentKitchenOrder.value = null;
    }

    // --- Fetch actions ---

    /**
     * Loads tables from infrastructure and updates the application state.
     * @returns {Promise<void>}
     */
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

    /**
     * Loads dishes from infrastructure and updates the application state.
     * @returns {Promise<void>}
     */
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

    /**
     * Loads dish categories from infrastructure and updates the application state.
     * @returns {Promise<void>}
     */
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

    /**
     * Loads kitchen orders and their items from infrastructure and updates the application state.
     * @returns {Promise<void>}
     */
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

    /**
     * Loads a single kitchen order by identifier.
     * @param {number|string} id - Kitchen order identifier.
     * @returns {Promise<void>}
     */
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

    /**
     * Loads the kitchen lock from infrastructure.
     * @returns {Promise<void>}
     */
    function fetchKitchenLock() {
        return operationsApi.getKitchenLock().then(response => {
            const locks = KitchenLockAssembler.toEntitiesFromResponse(response);
            kitchenLock.value = locks.length > 0 ? locks[0] : null;
        }).catch(error => {
            console.error('Error fetching kitchen lock:', error);
        });
    }

    /**
     * Loads all operations data (tables, dishes, categories, orders, lock).
     * @returns {void}
     */
    function loadAllOperationsData() {
        loading.value = true;
        operationsApi.getTables().then(response => {
            tables.value = TableAssembler.toEntitiesFromResponse(response);
            return operationsApi.getDishes();
        }).then(response => {
            dishes.value = DishAssembler.toEntitiesFromResponse(response);
            return operationsApi.getDishCategories();
        }).then(response => {
            dishCategories.value = DishCategoryAssembler.toEntitiesFromResponse(response);
            return operationsApi.getKitchenOrders();
        }).then(ordersResponse => {
            kitchenOrders.value = KitchenOrderAssembler.toEntitiesFromResponse(ordersResponse);
            return operationsApi.getKitchenLock();
        }).then(response => {
            const locks = KitchenLockAssembler.toEntitiesFromResponse(response);
            kitchenLock.value = locks.length > 0 ? locks[0] : null;
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    // --- Mutation actions ---

    /**
     * Creates a kitchen order through infrastructure and prepends it to the local state.
     * @returns {KitchenOrder|null} Created kitchen order, or null on failure.
     */
    function createKitchenOrder() {
        if (newOrderItems.value.length === 0) {
            errors.value.push(translate('operations.store.validation.minItems'));
            return null;
        }
        if (newOrderServiceType.value === 'table_service' && !newOrderTableId.value) {
            errors.value.push(translate('operations.store.validation.selectTable'));
            return null;
        }

        const orderData = {
            number: `C${String(kitchenOrders.value.length + 1).padStart(3, '0')}`,
            tableId: newOrderTableId.value,
            tableNumber: newOrderTableNumber.value,
            typeService: newOrderServiceType.value,
            state: 'pending',
            items: [...newOrderItems.value],
            observations: newOrderObservations.value,
            dateCreated: new Date().toISOString()
        };

        loading.value = true;
        return operationsApi.createKitchenOrder(orderData).then(response => {
            const newOrder = KitchenOrderAssembler.toEntityFromResource(response.data);
            kitchenOrders.value.push(newOrder);
            initNewKitchenOrder(null, null, 'to_take_home');
            return newOrder;
        }).catch(error => {
            errors.value.push(error);
            return null;
        });
    }

    /**
     * Creates a table through infrastructure and appends it to the local state.
     * @param {Object} tableData - Table data.
     * @returns {Promise<Table|null>} Created table, or null on failure.
     */
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

    /**
     * Updates a table and synchronizes local state.
     * @param {number|string} tableId - Table identifier.
     * @param {Object} tableData - Updated table data.
     * @returns {Promise<Table|null>} Updated table, or null on failure.
     */
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

    /**
     * Deletes a table by identifier and removes it from local state.
     * @param {number|string} id - Table identifier.
     * @returns {Promise<boolean>} Whether deletion succeeded.
     */
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

    /**
     * Fully updates a kitchen order and synchronizes local state.
     * @param {number|string} orderId - Kitchen order identifier.
     * @param {Object} orderData - Updated order data.
     * @returns {Promise<KitchenOrder|null>} Updated kitchen order, or null on failure.
     */
    function serializeOrderItems(items) {
        return (items || []).map(function (i) {
            return {
                dishId: i.dishId,
                dishName: i.dishName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
                state: i.state || 'pending',
                observations: i.observations || ''
            };
        });
    }

    function updateKitchenOrder(orderId, orderData) {
        loading.value = true;
        const existing = kitchenOrders.value.find(o => o.id === orderId);
        const dateCreated = existing?.dateCreated
            ? (existing.dateCreated instanceof Date ? existing.dateCreated.toISOString() : existing.dateCreated)
            : new Date().toISOString();
        const fullData = {
            id: orderId,
            number: existing?.number || '',
            dateCreated,
            state: existing?.state || 'pending',
            ...orderData,
            items: serializeOrderItems(orderData.items || existing?.items)
        };
        return operationsApi.updateKitchenOrder(orderId, fullData).then(response => {
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

    /**
     * Deletes a kitchen order and removes it from the local state.
     * @param {number|string} orderId - Kitchen order identifier.
     * @returns {Promise<boolean>} Whether deletion succeeded.
     */
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

    /**
     * Updates a kitchen order status with state-transition validation.
     * @param {number|string} orderId - Kitchen order identifier.
     * @param {string} newState - Target state.
     * @returns {KitchenOrder|null|Promise<KitchenOrder|null>} Updated kitchen order, or null on failure or invalid transition.
     */
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

    /**
     * Activates kitchen mode (locks the kitchen).
     * @param {string} password - Kitchen lock password.
     * @returns {boolean|Promise<boolean>} Whether activation succeeded.
     */
    function activateKitchenMode(password) {
        if (!password || !password.trim()) {
            errors.value.push(translate('operations.store.validation.passwordRequired'));
            return false;
        }
        if (password === kitchenLock.value?.hashPassword) {
            kitchenLock.value.stateLocked = true;
            return operationsApi.updateKitchenLock(kitchenLock.value).then(() => true).catch(error => {
                errors.value.push(error);
                return false;
            });
        }
        errors.value.push(translate('operations.store.validation.passwordIncorrect'));
        return false;
    }

    /**
     * Deactivates kitchen mode (unlocks the kitchen).
     * @param {string} password - Kitchen lock password.
     * @returns {boolean|Promise<boolean>} Whether deactivation succeeded.
     */
    function deactivateKitchenMode(password) {
        if (!password || !password.trim()) {
            errors.value.push(translate('operations.store.validation.passwordRequired'));
            return false;
        }
        if (password === kitchenLock.value?.hashPassword) {
            kitchenLock.value.stateLocked = false;
            return operationsApi.updateKitchenLock(kitchenLock.value).then(() => true).catch(error => {
                errors.value.push(error);
                return false;
            });
        }
        if (kitchenLock.value) {
            kitchenLock.value.failAttempt = (kitchenLock.value.failAttempt ?? 0) + 1;
        }
        errors.value.push(translate('operations.store.validation.passwordIncorrect'));
        return false;
    }

    /**
     * Resets the entire store state to its initial values.
     * @returns {void}
     */
    function resetStore() {
        tables.value = [];
        dishes.value = [];
        dishCategories.value = [];
        kitchenOrders.value = [];
        kitchenLock.value = null;
        currentKitchenOrder.value = null;
        errors.value = [];
        loading.value = false;
        initNewKitchenOrder(null, null, 'to_take_home');
    }

    return {
        tables, dishes, dishCategories, kitchenOrders, kitchenOrderItems, kitchenLock,
        currentKitchenOrder, errors, loading,
        newOrderTableId, newOrderTableNumber, newOrderServiceType,
        newOrderItems, newOrderObservations,
        pendingKitchenOrders, inPreparationKitchenOrders, readyKitchenOrders,
        deliveredKitchenOrders, cancelledKitchenOrders, activeKitchenOrders,
        activeDishes, featuredDishes, dishesByCategory,
        freeTables, occupiedTables, tablesByLocation,
        totalItemsNewOrder, totalNewOrder, isKitchenLocked, failedAttempts,
        initNewKitchenOrder, selectServiceType, setNewOrderObservations, setNewOrderItems,
        addItemToOrder, removeItemFromOrder, updateItemQuantity, clearCurrentOrder,
        fetchTables, fetchDishes, fetchDishCategories, fetchKitchenOrders,
        fetchKitchenOrderById, fetchKitchenLock, loadAllOperationsData,
        createKitchenOrder, updateKitchenOrderStatus, updateKitchenOrder, deleteKitchenOrder,
        addTable, updateTable, deleteTable, activateKitchenMode, deactivateKitchenMode, resetStore
    };
});

export default useOperationsStore;