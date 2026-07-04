import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const ordersEndpointPath = import.meta.env.VITE_PURCHASE_ORDERS_ENDPOINT_PATH ?? '/purchase-orders';
const catalogItemsTemplate = import.meta.env.VITE_CATALOG_ITEMS_ENDPOINT_PATH ?? '/suppliers/{supplierId}/catalog-items';
const clientsTemplate = import.meta.env.VITE_CLIENTS_ENDPOINT_PATH ?? '/suppliers/{supplierId}/restaurants';
const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH ?? '/supplier/alerts';

const localSupplierState = {
    deliveryRoutes: [],
    demandForecast: { aggregate: [], clients: [] },
    supplierSettings: {
        id: null,
        supplierName: '',
        supportContact: '',
        notifications: { email: true, sms: false },
        serviceZones: [],
        contacts: []
    },
    supplierSubscription: []
};

function resolveSupplierScopedPath(template, id) {
    return template
        .replace('{supplierId}', id)
        .replace(':supplierId', id);
}

export class SupplyManagementApi extends BaseApi {
    #supplyManagementEndpoint;
    #catalogItemsEndpoint;
    #clientsEndpoint;
    #alertsEndpoint;
    #supplierId = null;

    constructor(){
        super();

        this.#supplyManagementEndpoint = new BaseEndpoint(this, ordersEndpointPath);
        this.#alertsEndpoint = new BaseEndpoint(this, alertsEndpointPath);
        // Scoped endpoints are built once setSupplierId() is called
        this.#catalogItemsEndpoint = null;
        this.#clientsEndpoint = null;
    }

    /**
     * Sets the supplier profile id and rebuilds supplier-scoped endpoints.
     * Must be called after fetching the current user's supplier profile.
     * @param {number|string} id - Supplier profile id from the backend.
     */
    setSupplierId(id) {
        this.#supplierId = id;
        this.#catalogItemsEndpoint = new BaseEndpoint(this, resolveSupplierScopedPath(catalogItemsTemplate, id));
        this.#clientsEndpoint = new BaseEndpoint(this, resolveSupplierScopedPath(clientsTemplate, id));
        localSupplierState.supplierSettings.id = Number(id);
    }

    /** @returns {number|string|null} */
    get supplierId() { return this.#supplierId; }
    getOrders(){
        return this.#supplyManagementEndpoint.getAll();
    }
    getOrderById(id){
        return this.#supplyManagementEndpoint.getById(id);
    }
    createOrder(order){
        return this.#supplyManagementEndpoint.create(order);
    }
    updateOrder(id,order){
        return this.#supplyManagementEndpoint.update(id,order);
    }
    deleteOrder(id){
        return this.#supplyManagementEndpoint.delete(id);
    }
    getOrderItems(id){
        return this.#supplyManagementEndpoint.getById(id);
    }

    // ── Catalog Supplier section ──────────────────────────────────────────────
    // Endpoints for the supplier's product catalog (CatalogItem aggregate).

    #requireSupplierId() {
        if (!this.#catalogItemsEndpoint || !this.#clientsEndpoint) {
            throw new Error('Supplier profile id not set. Call setSupplierId() first.');
        }
    }

    getCatalogItems(){
        this.#requireSupplierId();
        return this.#catalogItemsEndpoint.getAll();
    }
    getCatalogItemById(id){
        this.#requireSupplierId();
        return this.#catalogItemsEndpoint.getById(id);
    }
    createCatalogItem(item){
        this.#requireSupplierId();
        return this.#catalogItemsEndpoint.create(item);
    }
    updateCatalogItem(id,item){
        this.#requireSupplierId();
        return this.#catalogItemsEndpoint.update(id,item);
    }
    deleteCatalogItem(id){
        this.#requireSupplierId();
        return this.#catalogItemsEndpoint.delete(id);
    }
    // ── End Catalog Supplier section ──────────────────────────────────────────

    getClients(){
        this.#requireSupplierId();
        return this.#clientsEndpoint.getAll();
    }

    getAlerts(){
        return this.#alertsEndpoint.getAll();
    }

    updateAlert(id, alert){
        return this.#alertsEndpoint.update(id, alert);
    }

    getDemandForecast(){
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: localSupplierState.demandForecast
        });
    }

    getDeliveryRoutes(){
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: localSupplierState.deliveryRoutes
        });
    }

    getSupplierSettings(){
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: localSupplierState.supplierSettings
        });
    }

    updateSupplierSettings(id, settings){
        localSupplierState.supplierSettings = {
            ...settings,
            id: Number(id ?? settings?.id ?? supplierId)
        };
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: localSupplierState.supplierSettings
        });
    }

    getSupplierSubscription(){
        return Promise.resolve({
            status: 200,
            statusText: 'OK',
            data: localSupplierState.supplierSubscription
        });
    }
}
