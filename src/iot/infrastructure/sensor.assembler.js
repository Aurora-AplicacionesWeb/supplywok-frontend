import { Sensor } from '../domain/model/sensor.entity.js';

export class SensorAssembler {
  static toEntitiesFromResponse(response) {
    const sensorsArray = Array.isArray(response) ? response : (response.sensors || []);
    return sensorsArray.map(resource => this.toEntityFromResource(resource));
  }

  static toEntityFromResource(resource) {
    return new Sensor({
      id: resource.id,
      name: resource.name,
      minValue: resource.minValue,
      maxValue: resource.maxValue,
      enabled: resource.enabled,
      lastValue: resource.lastValue,
      type: resource.type,
    });
  }
}
