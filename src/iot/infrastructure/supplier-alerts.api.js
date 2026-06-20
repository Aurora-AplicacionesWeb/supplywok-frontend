import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH || '/supplier/alerts';

export class SupplierAlertsApi extends BaseApi {
    #alertsEndpoint;

    constructor() {
        super();
        this.#alertsEndpoint = new BaseEndpoint(this, alertsEndpointPath);
    }

    getAlerts() {
        return this.#alertsEndpoint.getAll();
    }

    updateAlert(id, alert) {
        return this.acknowledgeAlert(id, alert);
    }

    acknowledgeAlert(id) {
        return this.#alertsEndpoint.http.post(`${this.#alertsEndpoint.endpointPath}/${id}/acknowledge`);
    }
}
