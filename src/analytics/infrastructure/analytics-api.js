import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

export class AnalyticsApi extends BaseApi {
    #restaurantAnalyticsEndpoint;
    #supplierAnalyticsEndpoint;

    constructor() {
        super();
        this.#restaurantAnalyticsEndpoint = new BaseEndpoint(this, '/analytics/restaurant');
        this.#supplierAnalyticsEndpoint = new BaseEndpoint(this, '/analytics/supplier');
    }

    getReportsData() {
        return this.#restaurantAnalyticsEndpoint.http.get(
            this.#restaurantAnalyticsEndpoint.endpointPath
        );
    }

    getDemandForecast() {
        return this.#supplierAnalyticsEndpoint.http.get(
            this.#supplierAnalyticsEndpoint.endpointPath
        );
    }
}
