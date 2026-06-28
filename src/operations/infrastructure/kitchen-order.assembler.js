import {KitchenOrder} from "../domain/model/kitchen-order.entity.js";

export class KitchenOrderAssembler {
    static normalizeState(status) {
        const normalized = String(status ?? '');
        if (normalized === 'Pending') return 'pending';
        if (normalized === 'InPreparation') return 'in_preparation';
        if (normalized === 'Ready') return 'ready';
        if (normalized === 'Delivered') return 'delivered';
        if (normalized === 'Cancelled') return 'cancelled';
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
            // #MOCK: response.data.comandas ?? response.data['kitchenOrders'] ?? [];
            : response.data ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
