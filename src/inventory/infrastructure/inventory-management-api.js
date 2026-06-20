import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const inventoryEndpointPath = import.meta.env.VITE_SUPPLIES_ENDPOINT_PATH || '/supplies';
const localStockMovements = [];

export class InventoryManagementApi extends BaseApi {
  #inventoryEndpoint;

  constructor() {
    super();
    this.#inventoryEndpoint = new BaseEndpoint(this, inventoryEndpointPath);
  }

  getSupplies() {
    return this.#inventoryEndpoint.getAll();
  }

  getSupplyById(id) {
    return this.#inventoryEndpoint.getById(id);
  }

  getStockMovements() {
    return Promise.resolve({
      status: 200,
      statusText: 'OK',
      data: [...localStockMovements]
    });
  }

  getStockMovementsBySupplyId(supplyId) {
    return this.getStockMovements().then((response) => ({
      ...response,
      data: (response.data ?? []).filter((movement) => movement.supplyId === supplyId || movement.inventoryItemId === supplyId)
    }));
  }

  createSupply(supply) {
    const payload = {
      id: supply.id,
      name: supply.name,
      unitOfMeasure: supply.unitOfMeasure,
      currentStock: supply.currentStock,
      minimumStockLevel: supply.minimumStockLevel,
      category: supply.category,
      supplierId: supply.supplierId
    };
    return this.#inventoryEndpoint.create(payload);
  }

  updateSupply(id, supply) {
    const payload = {
      id: supply.id,
      name: supply.name,
      unitOfMeasure: supply.unitOfMeasure,
      currentStock: supply.currentStock,
      minimumStockLevel: supply.minimumStockLevel,
      category: supply.category,
      supplierId: supply.supplierId
    };
    return this.#inventoryEndpoint.update(id, payload);
  }

  deleteSupply(id) {
    return this.#inventoryEndpoint.delete(id);
  }

  createStockMovement(movement) {
    const payload = {
      id: movement.id ?? (localStockMovements.length + 1),
      supplyId: movement.supplyId,
      inventoryItemId: movement.supplyId,
      type: movement.type,
      amount: movement.amount,
      date: movement.date,
      reason: movement.reason
    };

    localStockMovements.push(payload);
    return Promise.resolve({
      status: 201,
      statusText: 'Created',
      data: payload
    });
  }

  updateStockMovement(id, movement) {
    const index = localStockMovements.findIndex((item) => Number(item.id) === Number(id));
    const payload = {
      id: movement.id ?? Number(id),
      supplyId: movement.supplyId,
      inventoryItemId: movement.supplyId,
      type: movement.type,
      amount: movement.amount,
      date: movement.date,
      reason: movement.reason
    };

    if (index !== -1) {
      localStockMovements.splice(index, 1, payload);
    }

    return Promise.resolve({
      status: 200,
      statusText: 'OK',
      data: payload
    });
  }

  deleteStockMovement(id) {
    const index = localStockMovements.findIndex((item) => Number(item.id) === Number(id));
    if (index !== -1) {
      localStockMovements.splice(index, 1);
    }
    return Promise.resolve({
      status: 200,
      statusText: 'OK',
      data: null
    });
  }
}
