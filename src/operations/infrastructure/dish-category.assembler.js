import {DishCategory} from "../domain/model/dish-category.entity.js";

export class DishCategoryAssembler {
    static toEntityFromResource(resource) {
        return new DishCategory({...resource})
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : (response.data['dishCategories'] || response.data['dishesCategories']);

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
