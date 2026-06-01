export class OrderItem {
    constructor({
                    id = null, inventoryItemId = null, productName = '',
                    quantity = 0, unitPrice = 0, unitType = ''
                } = {}) {
        this.id = id;
        this.inventoryItemId = inventoryItemId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.unitType = unitType;
    }
}