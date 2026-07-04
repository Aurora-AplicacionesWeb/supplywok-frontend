import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const dishesEndpointPath = import.meta.env.VITE_DISHES_ENDPOINT_PATH || '/dishes';
const dishesCategoriesEndpointPath = import.meta.env.VITE_DISHES_CATEGORIES_ENDPOINT_PATH || '/dish-categories';
const kitchenOrdersEndpointPath = import.meta.env.VITE_KITCHEN_ORDERS_ENDPOINT_PATH || '/kitchen-orders';
const tablesEndpointPath = import.meta.env.VITE_TABLES_ENDPOINT_PATH || '/tables';

function toBackendTableStatus(state) {
    const normalized = String(state ?? '').toLowerCase();
    if (normalized === 'busy') return 'Busy';
    return 'Available';
}

function toBackendKitchenOrderStatus(state) {
    const normalized = String(state ?? '').toLowerCase();
    if (normalized === 'pending') return 'Pending';
    if (normalized === 'in_preparation') return 'InPreparation';
    if (normalized === 'ready') return 'Ready';
    if (normalized === 'delivered') return 'Delivered';
    if (normalized === 'cancelled') return 'Cancelled';
    return 'Pending';
}

function toBackendTypeService(typeService) {
    const normalized = String(typeService ?? '').toLowerCase();
    if (normalized === 'table_service' || normalized === 'tableservice') return 'TableService';
    if (normalized === 'to_take_home' || normalized === 'totakehome') return 'ToTakeHomeService';
    return 'ToTakeHomeService';
}

export class OperationsApi extends BaseApi {
    #dishesEndpoint;
    #dishesCategoriesEndpoint;
    #kitchenOrdersEndpoint;
    #tablesEndpoint;

    constructor() {
        super();
        this.#dishesEndpoint = new BaseEndpoint(this, dishesEndpointPath);
        this.#dishesCategoriesEndpoint = new BaseEndpoint(this, dishesCategoriesEndpointPath);
        this.#kitchenOrdersEndpoint = new BaseEndpoint(this, kitchenOrdersEndpointPath);
        this.#tablesEndpoint = new BaseEndpoint(this, tablesEndpointPath);
    }

    getDishes() {
        return this.#dishesEndpoint.getAll();
    }

    getDishCategories() {
        return this.#dishesCategoriesEndpoint.getAll();
    }

    getTables() {
        return this.#tablesEndpoint.getAll();
    }

    createTable(resource) {
        return this.#tablesEndpoint.create({
            number: resource.number,
            capacity: resource.capacity,
            location: resource.location ?? '',
            active: resource.active ?? true,
            state: toBackendTableStatus(resource.state ?? 'available')
        });
    }

    deleteTable(id) {
        return this.#tablesEndpoint.delete(id);
    }

    getKitchenOrders() {
        return this.#kitchenOrdersEndpoint.getAll();
    }

    getKitchenOrderById(id) {
        return this.#kitchenOrdersEndpoint.getById(id);
    }

    createKitchenOrder(resource) {
        const payload = {
            number: resource.number,
            tableId: resource.tableId ?? resource.table?.id ?? null,
            typeService: toBackendTypeService(resource.typeService),
            observations: resource.observations ?? '',
            dateCreated: resource.dateCreated
                ? new Date(resource.dateCreated).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        };
        return this.#kitchenOrdersEndpoint.create(payload);
    }

    addDishToKitchenOrder(orderId, dishResource) {
        return this.http.post(
            `${kitchenOrdersEndpointPath}/${orderId}/dishes`,
            {
                id: dishResource.id,
                quantity: dishResource.quantity ?? 1
            }
        );
    }

    updateKitchenOrder(id, resource) {
        return this.#kitchenOrdersEndpoint.update(id, {
            number: resource.number,
            tableId: resource.tableId ?? 0,
            typeService: resource.typeService ? toBackendTypeService(resource.typeService) : undefined,
            observations: resource.observations,
            dateCreated: resource.dateCreated
                ? new Date(resource.dateCreated).toISOString().split('T')[0]
                : undefined
        });
    }

    updateKitchenOrderStatus(id, newState, observation) {
        const resource = { status: toBackendKitchenOrderStatus(newState), observations: observation };
        return this.#kitchenOrdersEndpoint.http.patch(
            `${this.#kitchenOrdersEndpoint.endpointPath}/${id}`,
            resource
        );
    }

    deleteKitchenOrder(id) {
        return this.#kitchenOrdersEndpoint.delete(id);
    }

    updateTable(tableId, data) {
        return this.#tablesEndpoint.update(tableId, {
            number: data.number,
            capacity: data.capacity,
            location: data.location,
            active: data.active ?? true,
            state: toBackendTableStatus(data.state ?? data.status ?? 'available')
        });
    }
}
