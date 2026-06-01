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

  static fromSensor(sensor) {
    if (!sensor.enabled) return null;

    const now = new Date();

    // Temperature Alerts (Kitchen/Storage)
    if (sensor.type === 'kitchen-temperature' || sensor.type === 'storage-temperature') {
      if (sensor.lastValue > sensor.maxValue || sensor.lastValue < sensor.minValue) {
        const isColdStorage = sensor.type === 'storage-temperature';
        const titleKey = isColdStorage ? 'iot.alerts.cold-storage-breach-title' : 'iot.alerts.kitchen-temp-breach-title';
        const messageKey = sensor.lastValue > sensor.maxValue ? 'iot.alerts.temp-exceeded-msg' : 'iot.alerts.temp-dropped-msg';
        
        return new Alert({
          id: parseInt(`${sensor.id}${now.getTime().toString().slice(-4)}`, 10),
          sensorId: sensor.id,
          titleKey: titleKey,
          messageKey: messageKey,
          messageParams: {
            sensorName: sensor.name,
            lastValue: sensor.lastValue,
            minValue: sensor.minValue,
            maxValue: sensor.maxValue
          },
          severity: isColdStorage ? 'Critical' : 'Low',
          source: isColdStorage ? 'Storage sensor' : 'Kitchen sensor',
          timestamp: now,
          status: 'Open'
        });
      }
    }

    // Low Stock Alerts (Pressure)
    if (sensor.type === 'storage-pressure') {
      if (sensor.lastValue <= sensor.minValue) {
        return new Alert({
          id: parseInt(`${sensor.id}${now.getTime().toString().slice(-4)}`, 10),
          sensorId: sensor.id,
          titleKey: 'iot.alerts.low-stock-title',
          messageKey: 'iot.alerts.low-stock-msg',
          messageParams: {
            sensorName: sensor.name,
            lastValue: sensor.lastValue,
            minValue: sensor.minValue
          },
          severity: 'High',
          source: 'Inventory sensor',
          timestamp: now,
          status: 'Open'
        });
      }
    }

    // Occupancy Alerts (Table pressure)
    if (sensor.type === 'table-pressure') {
       if (sensor.lastValue >= sensor.maxValue * 0.9 && sensor.maxValue > 0) {
          return new Alert({
            id: parseInt(`${sensor.id}${now.getTime().toString().slice(-4)}`, 10),
            sensorId: sensor.id,
            titleKey: 'iot.alerts.high-occupancy-title',
            messageKey: 'iot.alerts.high-occupancy-msg',
            messageParams: {
              sensorName: sensor.name,
              lastValue: sensor.lastValue
            },
            severity: 'Medium',
            source: 'Dining Room sensor',
            timestamp: now,
            status: 'Open'
          });
       }
    }

    return null;
  }
}
