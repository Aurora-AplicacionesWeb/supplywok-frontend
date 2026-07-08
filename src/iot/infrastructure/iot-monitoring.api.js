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
    let backendType = 0;
    switch (sensorData.type) {
      case 'kitchen-temperature': backendType = 0; break;
      case 'storage-temperature': backendType = 1; break;
      case 'table-pressure': backendType = 2; break;
      case 'storage-pressure': backendType = 3; break;
      default: backendType = 0;
    }

    try {
      const payload = {
        ...sensorData,
        type: backendType
      };
      const response = await this.sensorsEndpoint.create(payload);
      return SensorAssembler.toEntityFromResource(response.data ?? response);
    } catch (error) {
      console.error('Failed to create sensor:', error);
      return null;
    }
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
}
