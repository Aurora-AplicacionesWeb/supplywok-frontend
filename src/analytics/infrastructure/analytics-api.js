import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const reportsApiUrl = import.meta.env.VITE_SUPPLIERS_API_URL || import.meta.env.VITE_SUPPLY_WOK_API_URL || 'http://localhost:3000/api/v1';
const reportsEndpointPath = import.meta.env.VITE_REPORTS_ENDPOINT_PATH || '/restaurant-reports';

const supplierGetApiUrl = import.meta.env.VITE_SUPPLIER_GET_API_URL;
const demandForecastsEndpointPath = import.meta.env.VITE_DEMAND_FORECASTS_ENDPOINT_PATH;

export class AnalyticsApi extends BaseApi {
    #reportsEndpoint;
    #demandForecastsEndpoint;

    constructor() {
        super(reportsApiUrl);
        this.#reportsEndpoint = new BaseEndpoint(this, reportsEndpointPath);

        const supplierGetApi = new BaseApi(supplierGetApiUrl);
        this.#demandForecastsEndpoint = new BaseEndpoint(supplierGetApi, demandForecastsEndpointPath);
    }

    async getReportsData() {
        const response = await this.#reportsEndpoint.getAll();
        let data = response.data;
        if (Array.isArray(data)) {
            return data[0];
        }
        return data;
    }

    getDemandForecast() {
        return this.#demandForecastsEndpoint.getAll();
    }
}
