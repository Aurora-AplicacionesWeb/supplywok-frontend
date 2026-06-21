import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const suppliersApiUrl = import.meta.env.VITE_SUPPLIERS_API_URL || import.meta.env.VITE_SUPPLYWOK_API_URL || '';
const suppliersEndpointPath = import.meta.env.VITE_SUPPLIERS_ENDPOINT_PATH ?? '';

export class SupplierApi extends BaseApi {
    #suppliersEndpoint;

    constructor() {
        super(suppliersApiUrl || undefined);
        this.#suppliersEndpoint = new BaseEndpoint(this, suppliersEndpointPath);
    }

    getSuppliers() {
        return this.#suppliersEndpoint.getAll();
    }
}
