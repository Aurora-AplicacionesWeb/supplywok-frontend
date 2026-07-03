import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const supplierProfilesEndpointPath = import.meta.env.VITE_SUPPLIER_PROFILES_ENDPOINT_PATH ?? '/supplier-profiles';

export class SupplierApi extends BaseApi {
    #supplierProfilesEndpoint;

    constructor() {
        super();
        this.#supplierProfilesEndpoint = new BaseEndpoint(this, supplierProfilesEndpointPath);
    }

    getSuppliers() {
        return this.#supplierProfilesEndpoint.getAll();
    }
}
