export class KitchenOrder {
    constructor({id=null, number='', tableId=null, tableNumber=0, typeService='', state='',
                    item= [], items: itemsProp = [],
                    observations='', dateCreated=null, hourReady=null, hourDelivered=null, preparationTime=null}) {
        this.id = id;
        this.number = number;
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.typeService = typeService;
        this.state = state;
        const orderItems = (item && item.length > 0) ? item : (itemsProp || []);
        this.item = orderItems.map(i => ({
            id: i.id || null,
            kitchenOrderId: i.kitchenOrderId || id || null,
            dishId: i.dishId || null,
            dishName: i.dishName || '',
            quantity: i.quantity || 0,
            unitPrice: i.unitPrice || 0.0,
            totalPrice: i.totalPrice || (i.quantity * i.unitPrice) || 0.0,
            state: i.state || 'pending',
            observations: i.observations || ''
        }));
        this.observations = observations;
        this.dateCreated = dateCreated ? new Date(dateCreated) : null;
        this.hourReady = hourReady ? new Date(hourReady) : null;
        this.hourDelivered = hourDelivered ? new Date(hourDelivered) : null;
        this.preparationTime = preparationTime;
    }
}