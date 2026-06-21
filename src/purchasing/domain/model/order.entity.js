import { OrderItem } from './order-item.entity.js';

export class Order {
    constructor({
                    id = null, code = '', supplierId = null, supplierName = '',
                    restaurantName = '', orderDate = '', estimatedDate = '',
                    priority = '', status = '', items = []
                } = {}) {
        this.id = id;
        this.code = code;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.restaurantName = restaurantName;
        this.orderDate = orderDate;
        this.estimatedDate = estimatedDate;
        this.priority = priority;
        this.status = status;
        this.items = items.map((item) => item instanceof OrderItem ? item : new OrderItem(item));
    }
}
