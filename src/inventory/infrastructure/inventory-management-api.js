import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const inventoryBaseUrl = import.meta.env.VITE_INVENTORY_BASE_URL;
const inventoryEndpointPath = import.meta.env.VITE_INVENTORY_ENDPOINT_PATH;
const stockMovementEndpointPath = import.meta.env.VITE_STOCK_MOVEMENT_ENDPOINT_PATH;

export class InventoryManagementApi extends BaseApi {
  #inventoryEndpoint;
  #stockMovementEndpoint;

  constructor() {
    super(inventoryBaseUrl);
    this.#inventoryEndpoint = new BaseEndpoint(this, inventoryEndpointPath);
    this.#stockMovementEndpoint = new BaseEndpoint(this, stockMovementEndpointPath);
  }

  getSupplies() {
    return this.#inventoryEndpoint.getAll();
  }

  getSupplyById(id) {
    return this.#inventoryEndpoint.getById(id);
  }

  getStockMovements() {
    return this.#stockMovementEndpoint.getAll();
  }

  getStockMovementsBySupplyId(supplyId) {
    return this.#stockMovementEndpoint.getAll().then((response) => {
      const movements = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: movements.filter((movement) => movement.supplyId === supplyId)
      };
    });
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
      id: movement.id,
      inventoryItemId: movement.supplyId,
      type: movement.type,
      amount: movement.amount,
      date: movement.date,
      reason: movement.reason
    };
    return this.#stockMovementEndpoint.create(payload);
  }

  updateStockMovement(id, movement) {
    const payload = {
      id: movement.id,
      inventoryItemId: movement.supplyId,
      type: movement.type,
      amount: movement.amount,
      date: movement.date,
      reason: movement.reason
    };
    return this.#stockMovementEndpoint.update(id, payload);
  }

  deleteStockMovement(id) {
    return this.#stockMovementEndpoint.delete(id);
  }
}
