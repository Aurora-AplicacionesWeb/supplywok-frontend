import { Supply } from '../domain/model/supply.entity.js';

export class SupplyAssembler {
  static toEntityFromResource(resource) {
    return new Supply({...resource});
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`);
      return [];
    }
    let resources = response.data instanceof Array
      ? response.data
      : response.data?.supplies ?? response.data?.inventory ?? [];
    return resources.map(r => this.toEntityFromResource(r));
  }
}
