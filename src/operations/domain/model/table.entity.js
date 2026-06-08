export class Table {

    constructor({id=null, number='', capacity='', location='', state='', active= true}) {
        this.id = id;
        this.number = number;
        this.capacity = capacity;
        this.location = location;
        this.state = state;
        this.active = active;
    }
}