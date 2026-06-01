import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const supplierCrudApiUrl = import.meta.env.VITE_SUPPLIER_CRUD_API_URL || 'http://localhost:3000/api/v1';
const ordersEndpointPath = import.meta.env.VITE_PURCHASE_ORDERS_ENDPOINT_PATH || '/purchase-orders';

export class OrdersApi extends BaseApi {
    #ordersEndpoint;

    constructor() {
        super(supplierCrudApiUrl);
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
