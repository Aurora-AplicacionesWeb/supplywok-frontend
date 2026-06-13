export class DishCategory {
    constructor({id=null, name='', order=0, active=true }) {
        this.id = id;
        this.name = name;
        this.order = order;
        this.active = active;
    }
}