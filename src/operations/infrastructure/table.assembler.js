import {Table} from "../domain/model/table.entity.js";

export class TableAssembler {
    static normalizeState(status) {
        const normalized = String(status ?? '');
        if (normalized === 'Available') return 'available';
        if (normalized === 'Busy') return 'busy';
        return String(status ?? '').toLowerCase();
    }

    static toEntityFromResource(resource) {
        return new Table({
            ...resource,
            state: this.normalizeState(resource.state ?? resource.status),
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
            : response.data ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
