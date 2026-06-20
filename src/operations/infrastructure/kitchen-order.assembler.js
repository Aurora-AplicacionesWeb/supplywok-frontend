import {KitchenOrder} from "../domain/model/kitchen-order.entity.js";

export class KitchenOrderAssembler {
    static normalizeState(status) {
        const normalized = String(status ?? '').toUpperCase();
        if (normalized === 'OPEN') return 'pending';
        if (normalized === 'IN_PREPARATION') return 'in_preparation';
        if (normalized === 'SERVED') return 'ready';
        if (normalized === 'CLOSED') return 'delivered';
        return String(status ?? '').toLowerCase();
    }

    static toEntityFromResource(resource) {
        return new KitchenOrder({
            ...resource,
            state: resource.state ?? this.normalizeState(resource.status),
            dateCreated: resource.dateCreated ?? resource.createdAt,
            dishes: resource.dishes ?? resource.items ?? []
        })
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array
            ? response.data
            : response.data.comandas ?? response.data['kitchenOrders'] ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
