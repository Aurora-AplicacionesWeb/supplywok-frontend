import { Supply } from '../domain/model/supply.entity.js';

export class SupplyAssembler {
  static toEntityFromResource(resource) {
    return new Supply({
      id: resource.id,
      name: resource.name,
      unitOfMeasure: resource.unitOfMeasure,
      currentStock: resource.currentStock,
      minimumStockLevel: resource.minimumStockLevel,
      category: resource.category,
      supplierName: resource.supplierName ?? ''
    });
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`);
      return [];
    }
    let resources = response.data instanceof Array
      ? response.data
      : response.data ?? [];
    return resources.map(r => this.toEntityFromResource(r));
  }
}
