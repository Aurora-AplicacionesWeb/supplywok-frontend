import { Sensor } from '../domain/model/sensor.entity.js';

export class SensorAssembler {
  static toEntitiesFromResponse(response) {
    const sensorsArray = Array.isArray(response) ? response : (response.sensors || []);
    return sensorsArray.map(resource => this.toEntityFromResource(resource));
  }

  static toEntityFromResource(resource) {
    let frontendType = resource.type;
    if (resource.type === 0 || resource.type === 'Temperature') frontendType = 'kitchen-temperature';
    else if (resource.type === 1 || resource.type === 'Weight') frontendType = 'table-pressure';
    else if (resource.type === 2) frontendType = 'storage-temperature';
    else if (resource.type === 3) frontendType = 'storage-pressure';

    return new Sensor({
      id: resource.id,
      name: resource.name,
      minValue: resource.minValue,
      maxValue: resource.maxValue,
      enabled: resource.enabled,
      lastValue: resource.lastValue,
      type: frontendType,
    });
  }
}
