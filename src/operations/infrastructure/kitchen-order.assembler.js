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

    static normalizeTypeService(typeService) {
        const normalized = String(typeService ?? '');
        if (normalized === 'TableService') return 'table_service';
        if (normalized === 'ToTakeHomeService') return 'to_take_home';
        return String(typeService ?? '').toLowerCase();
    }

    static toEntityFromResource(resource) {
        return new KitchenOrder({
            id: resource.id,
            number: resource.number,
            tableId: resource.tableId,
            typeService: this.normalizeTypeService(resource.typeService),
            state: this.normalizeState(resource.state ?? resource.status),
            observations: resource.observations,
            dateCreated: resource.dateCreated ?? resource.createdAt,
            hourReady: resource.hourReady,
            hourDelivered: resource.hourDelivered,
            preparationTime: resource.preparationTime,
            totalPrice: resource.totalPrice,
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
            : response.data ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
