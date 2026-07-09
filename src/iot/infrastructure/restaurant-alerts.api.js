import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const platformApiUrl = import.meta.env.VITE_SUPPLY_WOK_API_URL;
const restaurantAlertsEndpointPath = import.meta.env.VITE_RESTAURANT_ALERTS_ENDPOINT_PATH || '/restaurant/alerts';

export class RestaurantAlertsApi extends BaseApi {
    #alertsEndpoint;

    constructor() {
        super(platformApiUrl);
        this.#alertsEndpoint = new BaseEndpoint(this, restaurantAlertsEndpointPath);
    }

    getAlerts() {
        return this.#alertsEndpoint.getAll();
    }

    acknowledgeAlert(id) {
        return this.http.patch(`${this.#alertsEndpoint.endpointPath}/${id}`);
    }
}
