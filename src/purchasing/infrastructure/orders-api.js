import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const ordersApiUrl = import.meta.env.VITE_PURCHASE_ORDERS_API_URL || import.meta.env.VITE_SUPPLYWOK_API_URL || 'http://localhost:8091/api/v1';
const ordersEndpointPath = import.meta.env.VITE_PURCHASE_ORDERS_ENDPOINT_PATH || '/purchase-orders';

export class OrdersApi extends BaseApi {
    #ordersEndpoint;

    constructor() {
        super(ordersApiUrl);
        this.#ordersEndpoint = new BaseEndpoint(this, ordersEndpointPath);
    }

    getOrders() {
        return this.#ordersEndpoint.getAll();
    }

    getOrderById(id) {
        return this.#ordersEndpoint.getById(id);
    }

    createOrder(order) {
        return this.#ordersEndpoint.create(order);
    }

    updateOrder(id, order) {
        return this.#ordersEndpoint.update(id, order);
    }

    deleteOrder(id) {
        return this.#ordersEndpoint.delete(id);
    }
}
