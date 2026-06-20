import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const dishesEndpointPath = import.meta.env.VITE_DISHES_ENDPOINT_PATH || '/dishes';
const dishesCategoriesEndpointPath = import.meta.env.VITE_DISHES_CATEGORIES_ENDPOINT_PATH || '/dishes-categories';
const kitchenOrdersEndpointPath = import.meta.env.VITE_COMANDAS_ENDPOINT_PATH || '/comandas';
const tablesEndpointPath = import.meta.env.VITE_TABLES_ENDPOINT_PATH || '/tables';

const localDishes = [];
const localDishCategories = [];

function toBackendTableStatus(state) {
    const normalized = String(state ?? '').toLowerCase();
    if (normalized === 'busy') return 'OCCUPIED';
    if (normalized === 'reserved') return 'RESERVED';
    if (normalized === 'cleaning') return 'CLEANING';
    return 'AVAILABLE';
}

function toBackendKitchenOrderStatus(state) {
    const normalized = String(state ?? '').toLowerCase();
    if (normalized === 'in_preparation') return 'IN_PREPARATION';
    if (normalized === 'ready') return 'SERVED';
    if (normalized === 'delivered') return 'CLOSED';
    if (normalized === 'cancelled') return 'CLOSED';
    return 'OPEN';
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
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: [...localDishes]
        });
    }

    getDishCategories() {
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: [...localDishCategories]
        });
    }

    getTables() {
        return this.#tablesEndpoint.getAll();
    }

    createTable(resource) {
        return this.#tablesEndpoint.create({
            number: resource.number,
            capacity: resource.capacity
        }).then((response) => ({
            ...response,
            data: {
                ...(response.data ?? {}),
                location: resource.location ?? '',
                state: resource.state ?? 'available',
                active: resource.active ?? true
            }
        }));
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
        return this.#kitchenOrdersEndpoint.create({
            tableId: resource.tableId ?? resource.table?.id ?? null
        }).then((response) => ({
            ...response,
            data: {
                ...(response.data ?? {}),
                ...resource,
                status: response.data?.status ?? resource.state ?? resource.status ?? 'pending'
            }
        }));
    }

    updateKitchenOrder(id, resource) {
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: {
                id,
                ...resource,
                status: resource.state ?? resource.status ?? 'pending'
            }
        });
    }

    updateKitchenOrderStatus(id, newState, observation) {
        const resource = { status: toBackendKitchenOrderStatus(newState), observations: observation };
        return this.#kitchenOrdersEndpoint.http.put(
            `${this.#kitchenOrdersEndpoint.endpointPath}/${id}/status`,
            resource
        );
    }

    deleteKitchenOrder(id) {
        return this.#kitchenOrdersEndpoint.delete(id);
    }

    updateTable(tableId, data) {
        return this.#tablesEndpoint.http.put(
            `${this.#tablesEndpoint.endpointPath}/${tableId}/status`,
            { status: toBackendTableStatus(data.state ?? data.status) }
        ).then((response) => ({
            ...response,
            data: {
                ...(response.data ?? {}),
                ...data,
                status: response.data?.status ?? toBackendTableStatus(data.state ?? data.status)
            }
        }));
    }

    updateTableStatus(tableId, newState) {
        return this.#tablesEndpoint.http.put(
            `${this.#tablesEndpoint.endpointPath}/${tableId}/status`,
            { status: toBackendTableStatus(newState) }
        );
    }
}
