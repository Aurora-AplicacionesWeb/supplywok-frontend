import { Order } from '../domain/model/order.entity.js';
import { OrderItem } from '../domain/model/order-item.entity.js';

export class OrderAssembler {
    static toEntityFromResource(resource) {
        return new Order({
            ...resource,
            items: Array.isArray(resource.items) ? resource.items.map(item => new OrderItem({ ...item })) : []
        });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array
            ? response.data
            : response.data.purchaseOrders ?? response.data['purchase-orders'] ?? [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toEntityFromResponse(response) {
        return this.toEntitiesFromResponse(response)[0] ?? new Order();
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            code: entity.code,
            supplierId: entity.supplierId,
            supplierName: entity.supplierName,
            restaurantName: entity.restaurantName,
            orderDate: entity.orderDate,
            estimatedDate: entity.estimatedDate,
            priority: entity.priority,
            status: entity.status,
            items: entity.items.map(item => ({
                id: item.id,
                inventoryItemId: item.inventoryItemId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unitType: item.unitType
            }))
        };
    }
}
