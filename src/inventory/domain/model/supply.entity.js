export class Supply {
  constructor({
    id = null,
    name = '',
    unitOfMeasure = '',
    currentStock = 0,
    minimumStockLevel = 0,
    category = 'UNCATEGORIZED',
    supplierId = null,
    supplierName = '',
    movements = []
  })
  {
    this.id = id;
    this.name = name;
    this.unitOfMeasure = unitOfMeasure;
    this.currentStock = currentStock;
    this.minimumStockLevel = minimumStockLevel;
    this.category = category;
    this.supplierId = supplierId;
    this.supplierName = supplierName;
    this.movements = movements;
  }
}
