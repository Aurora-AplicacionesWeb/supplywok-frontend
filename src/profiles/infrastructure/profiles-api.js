import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const supplierProfilesEndpointPath = import.meta.env.VITE_SUPPLIER_PROFILES_ENDPOINT_PATH ?? '/supplier-profiles';
const restaurantProfilesEndpointPath = import.meta.env.VITE_RESTAURANT_PROFILES_ENDPOINT_PATH ?? '/restaurant-profiles';

export class ProfilesApi extends BaseApi {
    #supplierProfilesEndpoint;
    #restaurantProfilesEndpoint;

    constructor() {
        super();
        this.#supplierProfilesEndpoint = new BaseEndpoint(this, supplierProfilesEndpointPath);
        this.#restaurantProfilesEndpoint = new BaseEndpoint(this, restaurantProfilesEndpointPath);
    }

    // ── Supplier Profiles ─────────────────────────────────────────────────

    getSupplierProfiles() {
        return this.#supplierProfilesEndpoint.getAll();
    }

    getSupplierProfileById(id) {
        return this.#supplierProfilesEndpoint.getById(id);
    }

    createSupplierProfile(resource) {
        return this.#supplierProfilesEndpoint.create(resource);
    }

    updateSupplierProfile(resource) {
        return this.#supplierProfilesEndpoint.update(resource.id, resource);
    }

    deleteSupplierProfile(id) {
        return this.#supplierProfilesEndpoint.delete(id);
    }

    // ── Restaurant Profiles ───────────────────────────────────────────────

    getRestaurantProfiles() {
        return this.#restaurantProfilesEndpoint.getAll();
    }

    getRestaurantProfileById(id) {
        return this.#restaurantProfilesEndpoint.getById(id);
    }

    createRestaurantProfile(resource) {
        return this.#restaurantProfilesEndpoint.create(resource);
    }

    updateRestaurantProfile(resource) {
        return this.#restaurantProfilesEndpoint.update(resource.id, resource);
    }

    deleteRestaurantProfile(id) {
        return this.#restaurantProfilesEndpoint.delete(id);
    }
}
