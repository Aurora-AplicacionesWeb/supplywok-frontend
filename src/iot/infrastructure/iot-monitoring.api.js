import { SensorAssembler } from './sensor.assembler.js';

/**
 * Service class responsible for interacting with the IoT Monitoring API.
 * Uses Fetch API to retrieve sensor data and transforms it using SensorAssembler.
 */
export class IotMonitoringApi {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPPLYWOK_API_URL || 'http://localhost:3000/api/v1';
    this.endpoint = import.meta.env.VITE_SUPPLYWOK_API_SENSORS_ENDPOINT_PATH;
  }

  /**
   * Internal helper to fetch JSON data.
   * @private
   */
  async _fetchData(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Retrieves all sensors from the API.
   * @returns {Promise<Sensor[]>}
   */
  async getSensors() {
    try {
      const data = await this._fetchData(`${this.baseUrl}${this.endpoint}`);
      return SensorAssembler.toEntitiesFromResponse(data);
    } catch (error) {
      console.error('Failed to get sensors:', error);
      return [];
    }
  }

  /**
   * Creates a new sensor on the API.
   * @param {Object} sensorData - The raw sensor data.
   * @returns {Promise<Sensor|null>}
   */
  async createSensor(sensorData) {
    try {
      const data = await this._fetchData(`${this.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorData)
      });
      return SensorAssembler.toEntityFromResource(data);
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
