import {DishCategory} from "./dish-category.entity.js";

export class Dish {
    constructor({id= null, code='', name='', quantity=0,description='', price=0.0,
                    active=true, outstanding=true, dishCategoryId=null, dishCategory=null}) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.price = price;
        this.active = active;
        this.outstanding = outstanding;
        this.dishCategoryId = dishCategoryId;
        this.dishCategory = dishCategory instanceof DishCategory ? dishCategory : null;
    }
}