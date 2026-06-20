import {Dish} from "../domain/model/dish.entity.js";

export class DishAssembler {
    static toEntityFromResource(resource) {
        return new Dish({...resource})
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = response.data instanceof Array ? response.data : response.data?.dishes ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
