import { RestaurantProfile } from '../domain/model/restaurant-profile.entity.js';

export class RestaurantProfileAssembler {
    static toEntityFromResource(resource) {
        return new RestaurantProfile({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = response.data instanceof Array
            ? response.data
            : response.data?.restaurantProfiles ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
