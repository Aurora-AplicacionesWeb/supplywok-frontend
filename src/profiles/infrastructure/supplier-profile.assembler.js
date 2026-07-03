import { SupplierProfile } from '../domain/model/supplier-profile.entity.js';

export class SupplierProfileAssembler {
    static toEntityFromResource(resource) {
        return new SupplierProfile({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = response.data instanceof Array
            ? response.data
            : response.data?.supplierProfiles ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
