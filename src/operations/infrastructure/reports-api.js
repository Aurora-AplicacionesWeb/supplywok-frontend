import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const reportsApiUrl = import.meta.env.VITE_SUPPLIERS_API_URL || import.meta.env.VITE_SUPPLY_WOK_API_URL || 'http://localhost:3000/api/v1';
const reportsEndpointPath = import.meta.env.VITE_REPORTS_ENDPOINT_PATH || '/restaurant-reports';

/**
 * Infrastructure API client for the Operations Reports.
 * Exposes dynamic operations to fetch reports data from Fake API/MockAPI.
 *
 * @class ReportsApi
 * @extends BaseApi
 */
export class ReportsApi extends BaseApi {
    #reportsEndpoint;

    constructor() {
        // Initialize BaseApi with the external API URL
        super(reportsApiUrl);
        this.#reportsEndpoint = new BaseEndpoint(this, reportsEndpointPath);
    }

    /**
     * Retrieves the reports data.
     * Handles both single object responses and array wrapper responses.
     *
     * @returns {Promise<Object>} The reports data object.
     */
    async getReportsData() {
        const response = await this.#reportsEndpoint.getAll();
        let data = response.data;
        if (Array.isArray(data)) {
            return data[0];
        }
        return data;
    }
}
