import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const inventoryEndpointPath = import.meta.env.VITE_SUPPLIES_ENDPOINT_PATH || '/supplies';

export class InventoryManagementApi extends BaseApi {
  #inventoryEndpoint;
  #transactionsEndpoint;
  #transactionsBySupplyEndpoint;
  #totalStockEndpoint;

  constructor() {
    super();
    this.#inventoryEndpoint = new BaseEndpoint(this, inventoryEndpointPath);
    this.#transactionsEndpoint = new BaseEndpoint(this, '/inventory-transactions');
    this.#totalStockEndpoint = this.createEndpoint('/supplies/total-stock');
  }

  createEndpoint(path) {
    return { http: this.http, endpointPath: path };
  }

  getSupplies() {
    return this.#inventoryEndpoint.getAll();
  }

  getSupplyById(id) {
    return this.#inventoryEndpoint.getById(id);
  }

  getSuppliesTotalStock() {
    return this.#totalStockEndpoint.http.get(this.#totalStockEndpoint.endpointPath);
  }

  getStockMovements() {
    return this.#transactionsEndpoint.getAll();
  }

  getStockMovementsBySupplyId(supplyId) {
    return this.http.get(`/inventory-transactions/by-supply/${supplyId}`);
  }

  createSupply(supply) {
    const payload = {
      name: supply.name,
      unitOfMeasure: supply.unitOfMeasure,
      currentStock: supply.currentStock,
      minimumStockLevel: supply.minimumStockLevel,
      category: supply.category
    };
    return this.#inventoryEndpoint.create(payload);
  }

  updateSupply(id, supply) {
    const payload = {
      name: supply.name,
      unitOfMeasure: supply.unitOfMeasure,
      currentStock: supply.currentStock,
      minimumStockLevel: supply.minimumStockLevel,
      category: supply.category
    };
    return this.#inventoryEndpoint.update(id, payload);
  }

  deleteSupply(id) {
    return this.#inventoryEndpoint.delete(id);
  }

  createStockMovement(movement) {
    const payload = {
      supplyId: movement.supplyId,
      type: movement.type,
      amount: movement.amount,
      reason: movement.reason
    };
    return this.#transactionsEndpoint.create(payload);
  }
}
