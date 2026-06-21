import {Table} from "./table.entity.js"
import {Dish} from "./dish.entity.js";

export class KitchenOrder {
    constructor({id=null, number='', tableId=null, typeService='', state='pending',
                    observations='', dateCreated=null, hourReady=null, hourDelivered=null,
                    preparationTime=null, totalPrice= 0.0,dishes=null,table = null}) {
        this.id = id;
        this.number = number;
        this.tableId = this.table?.id ?? tableId ?? null;
        this.table = table instanceof Table ? table : (table ? new Table(table) : null);
        this.typeService = typeService;
        this.state = state;
        this.observations = observations;
        this.dateCreated = dateCreated ? new Date(dateCreated) : null;
        this.hourReady = hourReady ? new Date(hourReady) : null;
        this.hourDelivered = hourDelivered ? new Date(hourDelivered) : null;
        this.preparationTime = preparationTime;
        this.totalPrice = totalPrice;
        this.dishes = dishes ? dishes.map(i => i instanceof Dish ? i : new Dish(i)) : [];
    }
}