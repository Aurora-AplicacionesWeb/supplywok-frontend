import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const supplierId = import.meta.env.VITE_SUPPLIER_ID ?? '1';
const ordersEndpointPath = import.meta.env.VITE_PURCHASE_ORDERS_ENDPOINT_PATH ?? '/purchase-orders';
const catalogItemsEndpointPath = import.meta.env.VITE_CATALOG_ITEMS_ENDPOINT_PATH ?? '/suppliers/{supplierId}/catalog-items';
const clientsEndpointPath = import.meta.env.VITE_CLIENTS_ENDPOINT_PATH ?? '/suppliers/{supplierId}/clients';
const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH ?? '/supplier/alerts';

const localSupplierState = {
    deliveryRoutes: [],
    demandForecast: { aggregate: [], clients: [] },
    supplierSettings: {
        id: Number(supplierId) || 1,
        supplierName: 'Golden Wok Produce',
        supportContact: 'soporte@goldenwok.pe',
        notifications: { email: true, sms: false },
        serviceZones: [],
        contacts: []
    },
    supplierSubscription: []
};

function resolveSupplierScopedPath(endpointPath = '') {
    return endpointPath
        .replace('{supplierId}', supplierId)
        .replace(':supplierId', supplierId);
}

export class SupplyManagementApi extends BaseApi {
    #supplyManagementEndpoint;
    #catalogItemsEndpoint;
    #clientsEndpoint;
    #alertsEndpoint;

    constructor(){
        super();

        this.#supplyManagementEndpoint = new BaseEndpoint(this, ordersEndpointPath);
        this.#catalogItemsEndpoint = new BaseEndpoint(this, resolveSupplierScopedPath(catalogItemsEndpointPath));
        this.#clientsEndpoint = new BaseEndpoint(this, resolveSupplierScopedPath(clientsEndpointPath));
        this.#alertsEndpoint = new BaseEndpoint(this, alertsEndpointPath);
    }
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
    getCatalogItems(){
        return this.#catalogItemsEndpoint.getAll();
    }
    getCatalogItemById(id){
        return this.#catalogItemsEndpoint.getById(id);
    }
    createCatalogItem(item){
        return this.#catalogItemsEndpoint.create(item);
    }
    updateCatalogItem(id,item){
        return this.#catalogItemsEndpoint.update(id,item);
    }
    deleteCatalogItem(id){
        return this.#catalogItemsEndpoint.delete(id);
    }
    // ── End Catalog Supplier section ──────────────────────────────────────────

    getClients(){
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
