import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const baseUno = import.meta.env.VITE_SUPPLY_WOK_REST_MANAGE_UNO_URL;   // "https://my-json-server.typicode.com/Nounz27/db.server/"
const baseDos = import.meta.env.VITE_SUPPLY_WOK_REST_MANAGE_DOS_URL;   // "https://my-json-server.typicode.com/Nounz27/db.server-2/"

const dishesEndpointPath           = baseUno + 'dishes';
const dishesCategoriesEndpointPath = baseUno + 'dishes-categories';
const kitchenOrdersEndpointPath    = baseUno + 'kitchen-orders';
const kitchenLocksEndpointPath     = baseDos + 'kitchen-locks';
const tablesEndpointPath           = baseDos + 'tables';

export class RestaurantManagementApi extends BaseApi {
    #dishesEndpoint;
    #dishesCategoriesEndpoint;
    #kitchenLocksEndpoint;
    #kitchenOrdersEndpoint;
    #tablesEndpoint;

    constructor() {
        super();

        this.#dishesEndpoint = new BaseEndpoint(this, dishesEndpointPath);
        this.#dishesCategoriesEndpoint = new BaseEndpoint(this, dishesCategoriesEndpointPath);
        this.#kitchenLocksEndpoint = new BaseEndpoint(this, kitchenLocksEndpointPath);
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
        return this.#tablesEndpoint.create(resource);
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
        return this.#kitchenOrdersEndpoint.create(resource);
    }

    updateKitchenOrderFull(id, resource) {
        return this.#kitchenOrdersEndpoint.update(id, resource);
    }

    updateKitchenOrderStatus(id, newState, observation) {
        var resource = { state: newState, observations: observation };
        if (newState === 'ready') resource.hourReady = new Date().toISOString();
        if (newState === 'delivered') resource.hourDelivered = new Date().toISOString();
        return this.#kitchenOrdersEndpoint.update(id, resource);
    }

    getKitchenLock() {
        return this.#kitchenLocksEndpoint.getAll();
    }

    updateKitchenLock(resource) {
        return this.#kitchenLocksEndpoint.update(resource.id, resource);
    }

    deleteKitchenOrder(id) {
        return this.#kitchenOrdersEndpoint.delete(id);
    }

    updateTableStatus(tableId, newState) {
        return this.#tablesEndpoint.update(tableId, { state: newState });
    }
}
