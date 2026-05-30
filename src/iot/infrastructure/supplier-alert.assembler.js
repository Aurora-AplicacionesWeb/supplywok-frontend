import { SupplierAlert } from '../domain/model/supplier-alert.entity.js';

export class SupplierAlertAssembler {
    static toEntityFromResource(resource) {
        return new SupplierAlert({
            id: resource.id,
            severity: resource.severity,
            detail: resource.detail,
            date: resource.date,
            status: resource.status
        });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = response.data instanceof Array
            ? response.data
            : response.data.alerts ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            severity: entity.severity,
            detail: entity.detail,
            date: entity.date,
            status: entity.status
        };
    }
}
