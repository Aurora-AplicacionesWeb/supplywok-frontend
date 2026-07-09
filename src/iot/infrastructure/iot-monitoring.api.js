import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { SensorAssembler } from './sensor.assembler.js';

/**
 * Service class responsible for interacting with the IoT Monitoring API.
 * Uses Fetch API to retrieve sensor data and transforms it using SensorAssembler.
 */
export class IotMonitoringApi {
  constructor() {
    const sensorsEndpointPath = import.meta.env.VITE_SENSORS_ENDPOINT_PATH || '/sensors';
    this.api = new BaseApi();
    this.sensorsEndpoint = new BaseEndpoint(this.api, sensorsEndpointPath);
  }

  /**
   * Retrieves all sensors from the API.
   * @returns {Promise<Sensor[]>}
   */
  async getSensors() {
    try {
      const response = await this.sensorsEndpoint.getAll();
      return SensorAssembler.toEntitiesFromResponse(response.data ?? response);
    } catch (error) {
      console.error('Failed to get sensors:', error);
      return [];
    }
  }

  async createSensor(sensorData) {
    try {
      const payload = this.#toBackendSensorPayload(sensorData);
      const response = await this.sensorsEndpoint.create(payload);
      return SensorAssembler.toEntityFromResource(response.data ?? response);
    } catch (error) {
      console.error('Failed to create sensor:', error);
      return null;
    }
  }

  async updateSensor(sensorData) {
    try {
      const payload = this.#toBackendSensorPayload(sensorData);
      const response = await this.sensorsEndpoint.update(sensorData.id, payload);
      return SensorAssembler.toEntityFromResource(response.data ?? response);
    } catch (error) {
      console.error('Failed to update sensor:', error);
      return null;
    }
  }

  async deleteSensor(sensorId) {
    return this.sensorsEndpoint.delete(sensorId);
  }

  /**
   * Internal helper to filter sensors by type.
   * @private
   */
  async _getSensorsByType(type) {
    const sensors = await this.getSensors();
    return sensors.filter(sensor => sensor.type === type);
  }

  /** Retrieves kitchen temperature sensors. */
  async getKitchenTemperatureSensors() {
    return this._getSensorsByType('kitchen-temperature');
  }

  /** Retrieves cold storage temperature sensors. */
  async getStorageTemperatureSensors() {
    return this._getSensorsByType('storage-temperature');
  }

  /** Retrieves table occupancy sensors. */
  async getTablePressureSensors() {
    return this._getSensorsByType('table-pressure');
  }

  /** Retrieves storage inventory sensors. */
  async getStoragePressureSensors() {
    return this._getSensorsByType('storage-pressure');
  }

  #toBackendSensorPayload(sensorData) {
    let backendType = 0;
    switch (sensorData.type) {
      case 'kitchen-temperature': backendType = 0; break;
      case 'table-pressure': backendType = 1; break;
      case 'storage-temperature': backendType = 2; break;
      case 'storage-pressure': backendType = 3; break;
      default: backendType = 0;
    }

    return {
      name: sensorData.name,
      minValue: Number(sensorData.minValue ?? 0),
      maxValue: Number(sensorData.maxValue ?? 0),
      enabled: Boolean(sensorData.enabled),
      lastValue: Number(sensorData.lastValue ?? 0),
      type: backendType
    };
  }
}
