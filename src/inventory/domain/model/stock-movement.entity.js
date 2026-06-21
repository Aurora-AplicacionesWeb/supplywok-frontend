import {Supply} from "./supply.entity.js";

export class StockMovement {
  constructor({id = null, supplyId = null, type = '', amount = 0, date = new Date(), reason = '', supply=null})
  {
    this.id = id;
    this.supplyId = supplyId;
    this.type = type;
    this.amount = amount;
    this.date = date;
    this.reason = reason;
    this.supply = supply instanceof Supply ? supply : null;
  }
}
