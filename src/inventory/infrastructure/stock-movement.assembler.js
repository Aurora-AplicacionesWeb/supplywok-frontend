import { StockMovement } from '../domain/model/stock-movement.entity.js';

export class StockMovementAssembler {
  static toEntityFromResource(resource) {
    return new StockMovement({
      id: resource.id,
      supplyId: resource.inventoryItemId,
      type: resource.type,
      amount: resource.amount,
      date: resource.date,
      reason: resource.reason
    });
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`);
      return [];
    }
    let resources = response.data instanceof Array
      ? response.data
      : response.data['stockMovements'] ?? response.data['movements'];
    return resources.map(r => this.toEntityFromResource(r));
  }
}
