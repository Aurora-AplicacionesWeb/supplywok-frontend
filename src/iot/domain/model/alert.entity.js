import { Sensor } from './sensor.entity.js';

/**
 * Represents a business alert generated from a sensor reading or fetched from supplier APIs.
 */
export class Alert {
  constructor({
    id = null,
    sensorId = null,
    titleKey = '',
    messageKey = '',
    messageParams = {},
    detail = '',
    severity = '',
    timestamp = null,
    date = '',
    status = 'Open',
    source = 'Unknown'
  } = {}) {
    this.id = id;
    this.sensorId = sensorId;
    this.titleKey = titleKey;
    this.messageKey = messageKey;
    this.messageParams = messageParams || {};
    this.detail = detail;
    this.severity = severity;
    this.timestamp = timestamp ? new Date(timestamp) : (date ? new Date(date) : new Date());
    this.status = status || 'Open';
    this.source = source || 'Unknown';
  }

  resolve() {
    this.status = 'Resolved';
  }

  acknowledge() {
    this.status = 'Acknowledged';
  }

  get detailText() {
    return this.detail || this.messageKey || '';
  }
}
