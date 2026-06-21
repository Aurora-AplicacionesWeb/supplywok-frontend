import {Table} from "../domain/model/table.entity.js";

export class TableAssembler {
    static normalizeState(status) {
        const normalized = String(status ?? '').toUpperCase();
        if (normalized === 'AVAILABLE') return 'available';
        if (normalized === 'OCCUPIED') return 'busy';
        if (normalized === 'RESERVED') return 'reserved';
        if (normalized === 'CLEANING') return 'cleaning';
        return String(status ?? '').toLowerCase();
    }

    static toEntityFromResource(resource) {
        return new Table({
            ...resource,
            state: resource.state ?? this.normalizeState(resource.status),
            active: resource.active ?? true
        })
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array
            ? response.data
            : response.data.tables ?? response.data['tables'] ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
