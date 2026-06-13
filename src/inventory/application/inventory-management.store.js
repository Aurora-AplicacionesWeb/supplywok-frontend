import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { InventoryManagementApi } from '../infrastructure/inventory-management-api.js';
import { SupplyAssembler } from '../infrastructure/supply.assembler.js';
import { StockMovementAssembler } from '../infrastructure/stock-movement.assembler.js';

const api = new InventoryManagementApi();

function hasCriticalStock(supply) {
  return supply.currentStock <= supply.minimumStockLevel;
}

function getStockStatus(supply) {
  if (hasCriticalStock(supply)) return 'critical';
  if (supply.currentStock <= supply.minimumStockLevel * 1.5) return 'warning';
  return 'healthy';
}

function getStockLevelPercentage(supply) {
  if (supply.minimumStockLevel <= 0) return supply.currentStock > 0 ? 100 : 0;
  const targetMaxStock = supply.minimumStockLevel * 6;
  return Math.min(100, Math.max(0, Math.round((supply.currentStock / targetMaxStock) * 100)));
}

function getStockGap(supply) {
  return supply.currentStock - supply.minimumStockLevel;
}

const useInventoryManagementStore = defineStore('inventory', () => {
  const supplies = ref([]);
  const stockMovements = ref([]);
  const loading = ref(false);
  const suppliesLoaded = ref(false);
  const stockMovementsLoaded = ref(false);
  const errors = ref([]);

  const totalSupplies = computed(() => (suppliesLoaded.value ? supplies.value.length : 0));

  const totalCurrentStock = computed(() => {
    return supplies.value.reduce((acc, item) => acc + (Number(item.currentStock) || 0), 0);
  });

  const criticalSuppliesCount = computed(() => supplies.value.filter((s) => hasCriticalStock(s)).length);

  const lowStockSupplies = computed(() => supplies.value.filter((s) => {
    const status = getStockStatus(s);
    return status === 'warning' || status === 'critical';
  }));

  const supplyUnits = computed(() => {
    const units = new Set(supplies.value.map((s) => s.unitOfMeasure));
    return Array.from(units);
  });

  function fetchSupplies() {
    loading.value = true;
    api.getSupplies().then(response => {
      supplies.value = SupplyAssembler.toEntitiesFromResponse(response);
      suppliesLoaded.value = true;
      loading.value = false;
    }).catch(error => {
      errors.value.push(error);
      loading.value = false;
    });
  }

  function fetchStockMovements() {
    loading.value = true;
    api.getStockMovements().then(response => {
      stockMovements.value = StockMovementAssembler.toEntitiesFromResponse(response);
      stockMovementsLoaded.value = true;
      loading.value = false;
    }).catch(error => {
      errors.value.push(error);
      loading.value = false;
    });
  }

  function attachMovementsToSupplies() {
    const movementsBySupply = stockMovements.value.reduce((map, movement) => {
      const key = movement.supplyId;
      if (!map[key]) map[key] = [];
      map[key].push(movement);
      return map;
    }, {});

    supplies.value.forEach((supply) => {
      const attached = movementsBySupply[supply.id] ?? [];
      supply.movements = attached;
    });
  }

  function fetchAll() {
    loading.value = true;
    api.getSupplies().then(response => {
      supplies.value = SupplyAssembler.toEntitiesFromResponse(response);
      suppliesLoaded.value = true;
      return api.getStockMovements();
    }).then(response => {
      stockMovements.value = StockMovementAssembler.toEntitiesFromResponse(response);
      stockMovementsLoaded.value = true;
      attachMovementsToSupplies();
      loading.value = false;
    }).catch(error => {
      errors.value.push(error);
      loading.value = false;
    });
  }

  function createSupply(supply) {
    loading.value = true;
    api.createSupply(supply).then(response => {
      const created = SupplyAssembler.toEntityFromResource(response.data ?? response);
      supplies.value.unshift(created);
      loading.value = false;
    }).catch(error => {
      errors.value.push(error);
      loading.value = false;
    });
  }

  function updateSupply(id, supply) {
    loading.value = true;
    api.updateSupply(id, supply).then(response => {
      const updated = SupplyAssembler.toEntityFromResource(response.data ?? response);
      const index = supplies.value.findIndex((s) => s.id === id);
      if (index >= 0) supplies.value.splice(index, 1, updated);
      loading.value = false;
    }).catch(error => {
      errors.value.push(error);
      loading.value = false;
    });
  }

  function deleteSupply(id) {
    loading.value = true;
    api.deleteSupply(id).then(() => {
      supplies.value = supplies.value.filter((s) => s.id !== id);
      loading.value = false;
    }).catch(error => {
      errors.value.push(error);
      loading.value = false;
    });
  }

  function createStockMovement(movementEntity) {
    loading.value = true;
    api.createStockMovement(movementEntity).then(response => {
      const created = StockMovementAssembler.toEntityFromResource(response.data ?? response);
      stockMovements.value.push(created);

      const supply = supplies.value.find((s) => s.id === created.supplyId);
      if (supply) {
        if (created.type === 'ENTRY') supply.currentStock += created.amount;
        else if (created.type === 'EXIT') supply.currentStock -= created.amount;
        else if (created.type === 'ADJUSTMENT') supply.currentStock += created.amount;
      }

      loading.value = false;
    }).catch(error => {
      errors.value.push(error);
      loading.value = false;
    });
  }

  return {
    supplies,
    stockMovements,
    loading,
    suppliesLoaded,
    stockMovementsLoaded,
    errors,
    totalSupplies,
    totalCurrentStock,
    criticalSuppliesCount,
    lowStockSupplies,
    supplyUnits,
    fetchSupplies,
    fetchStockMovements,
    fetchAll,
    attachMovementsToSupplies,
    createSupply,
    updateSupply,
    deleteSupply,
    createStockMovement,
    hasCriticalStock,
    getStockStatus,
    getStockLevelPercentage,
    getStockGap
  };
});

export default useInventoryManagementStore;
