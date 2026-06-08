import {KitchenOrder} from "../domain/model/kitchen-order.entity.js";

export class KitchenOrderAssembler {
    static toEntityFromResource(resource) {
        return new KitchenOrder({...resource})
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['kitchenOrders'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
