import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const supplierCrudApiUrl = import.meta.env.VITE_SUPPLIER_CRUD_API_URL;
const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH || '/supplier-alerts';

export class SupplierAlertsApi extends BaseApi {
    #alertsEndpoint;

    constructor() {
        super(supplierCrudApiUrl);
        this.#alertsEndpoint = new BaseEndpoint(this, alertsEndpointPath);
    }

    getAlerts() {
        return this.#alertsEndpoint.getAll();
    }

    updateAlert(id, alert) {
        return this.#alertsEndpoint.update(id, alert);
    }
}
