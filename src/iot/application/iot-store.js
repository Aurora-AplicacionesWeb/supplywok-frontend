import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Alert } from '../domain/model/alert.entity.js';
import { IotMonitoringApi } from '../infrastructure/iot-monitoring.api.js';
import { SupplierAlertsApi } from '../infrastructure/supplier-alerts.api.js';
import { RestaurantAlertsApi } from '../infrastructure/restaurant-alerts.api.js';
import { AlertAssembler } from '../infrastructure/alert.assembler.js';

/**
 * Pinia store for managing IoT Monitoring state.
 * Handles sensor data fetching, alert generation, and derived metrics.
 */
export const iotStore = defineStore('iot', () => {
  const api = new IotMonitoringApi();
  const supplierApi = new SupplierAlertsApi();
  const restaurantApi = new RestaurantAlertsApi();

  // --- State ---
  const sensors = ref([]);
  const restaurantAlerts = ref([]);
  const restaurantAlertsLoaded = ref(false);
  const supplierAlerts = ref([]);
  const supplierAlertsLoaded = ref(false);
  const loading = ref(false);
  const error = ref(null);

  // --- Computed Properties (Getters) ---
  
  /** Total number of sensors registered. */
  const sensorsCount = computed(() => sensors.value.length);

  /** List of all alerts in the history. */
  const allAlerts = computed(() => restaurantAlerts.value);

  /** 
   * List of all active (Open) alerts. 
   * Sorted by severity (Critical first) and then by timestamp (newest first).
   */
  const activeAlerts = computed(() => {
    return restaurantAlerts.value
      .filter(a => a.status?.toLowerCase() === 'open')
      .sort((a, b) => {
        const severityMap = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        const aSeverity = (a.severity || 'low').toLowerCase();
        const bSeverity = (b.severity || 'low').toLowerCase();
        const diff = (severityMap[aSeverity] ?? 3) - (severityMap[bSeverity] ?? 3);
        if (diff !== 0) return diff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  });

  /** The 3 most recent alerts for quick display. */
  const recentAlerts = computed(() => {
    return [...restaurantAlerts.value]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3);
  });

  /** Top 5 critical alerts for summary views. */
  const topCriticalAlerts = computed(() => {
    return activeAlerts.value.slice(0, 5);
  });

  const lowStockStorageCount = computed(() => {
    const storage = sensors.value.filter(s => s.type === 'storage-pressure');
    if (storage.length === 0) return 0;
    return storage.filter(s => s.lastValue <= s.minValue).length;
  });

  const outOfRangeTemperatureCount = computed(() => {
    const tempSensors = sensors.value.filter(
      s => s.type === 'kitchen-temperature' || s.type === 'storage-temperature'
    );
    if (tempSensors.length === 0) return 0;
    return tempSensors.filter(
      s => s.lastValue > s.maxValue || s.lastValue < s.minValue
    ).length;
  });

  const averageKitchenTemperature = computed(() => {
    const active = sensors.value.filter(
      s => s.type === 'kitchen-temperature' && s.enabled
    );
    if (active.length === 0) return null;
    const sum = active.reduce((acc, s) => acc + s.lastValue, 0);
    return Math.round((sum / active.length) * 10) / 10;
  });

  const averageStorageTemperature = computed(() => {
    const active = sensors.value.filter(
      s => s.type === 'storage-temperature' && s.enabled
    );
    if (active.length === 0) return null;
    const sum = active.reduce((acc, s) => acc + s.lastValue, 0);
    return Math.round((sum / active.length) * 10) / 10;
  });

  const occupiedTablePercentage = computed(() => {
    const tables = sensors.value.filter(s => s.type === 'table-pressure');
    if (tables.length === 0) return null;
    const occupied = tables.filter(s => s.lastValue > s.minValue).length;
    return Math.round((occupied / tables.length) * 100);
  });

  // --- Actions ---

  /** 
   * Fetches the latest sensor data from the API.
   */
  const loadSensors = async () => {
    loading.value = true;
    error.value = null;
    try {
      sensors.value = await api.getSensors();
    } catch (err) {
      error.value = formatError(err, 'Failed to load sensors');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetches restaurant alerts from backend.
   */
  const fetchRestaurantAlerts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await restaurantApi.getAlerts();
      restaurantAlerts.value = AlertAssembler.toEntitiesFromResponse(response);
      restaurantAlertsLoaded.value = true;
    } catch (err) {
      error.value = formatError(err, 'Failed to fetch restaurant alerts');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetches supplier alerts from backend.
   */
  const fetchSupplierAlerts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierApi.getAlerts();
      supplierAlerts.value = AlertAssembler.toEntitiesFromResponse(response);
      supplierAlertsLoaded.value = true;
    } catch (err) {
      error.value = formatError(err, 'Failed to fetch supplier alerts');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Marks a restaurant alert as acknowledged.
   */
  const acknowledgeRestaurantAlert = async (alertId) => {
    const alertIdNum = parseInt(alertId);
    loading.value = true;
    error.value = null;
    try {
      const response = await restaurantApi.acknowledgeAlert(alertIdNum);
      const persisted = AlertAssembler.toEntityFromResource(response.data);
      const index = restaurantAlerts.value.findIndex(a => a.id === persisted.id);
      if (index !== -1) {
        restaurantAlerts.value[index] = persisted;
      }
      return persisted;
    } catch (err) {
      error.value = formatError(err, 'Failed to acknowledge restaurant alert');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Marks a supplier alert as acknowledged.
   */
  const acknowledgeSupplierAlert = async (alertId) => {
    const alertIdNum = parseInt(alertId);
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierApi.acknowledgeAlert(alertIdNum);
      const persisted = AlertAssembler.toEntityFromResource(response.data);
      const index = supplierAlerts.value.findIndex(a => a.id === persisted.id);
      if (index !== -1) {
        supplierAlerts.value[index] = persisted;
      }
      return persisted;
    } catch (err) {
      error.value = formatError(err, 'Failed to acknowledge supplier alert');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Helper to find a specific sensor by its ID.
   * @param {number} id - Sensor ID.
   */
  const getSensorById = (id) => {
    return computed(() => id ? sensors.value.find(sensor => sensor.id === id) : undefined);
  };

  /**
   * Adds a new sensor to the local state (Mock API integration).
   * @param {Object} sensor - New sensor data.
   */
  const addSensor = async (sensor) => {
    loading.value = true;
    error.value = null;
    try {
      const created = await api.createSensor(sensor);
      if (created) {
        sensors.value.push(created);
        return created;
      }
    } catch (err) {
      error.value = formatError(err, 'Failed to create sensor');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Updates an existing sensor in the local state (Mock API integration).
   * @param {Object} updatedSensor - Updated sensor data.
   */
  const updateSensor = async (updatedSensor) => {
    loading.value = true;
    error.value = null;
    try {
      const persisted = await api.updateSensor(updatedSensor);
      if (!persisted) {
        throw new Error('Failed to update sensor');
      }
      const index = sensors.value.findIndex(s => s.id === updatedSensor.id);
      if (index !== -1) {
        sensors.value.splice(index, 1, persisted);
      }
      return persisted;
    } catch (err) {
      error.value = formatError(err, 'Failed to update sensor');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Deletes a sensor from the local state (Mock API integration).
   * @param {number} id - Sensor ID to remove.
   */
  const deleteSensor = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await api.deleteSensor(id);
      sensors.value = sensors.value.filter(s => s.id !== id);
    } catch (err) {
      error.value = formatError(err, 'Failed to delete sensor');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Formats error messages for UI display.
   * @private
   */
  const formatError = (err, fallback) => {
    if (err instanceof Error) {
      return err.message.includes('Resource not found') ? `${fallback}: Not found` : err.message;
    }
    return fallback;
  };

  // Auto-initialization removed to prevent fetching before login. Components must fetch explicitly.
  return {
    sensors,
    restaurantAlerts,
    restaurantAlertsLoaded,
    supplierAlerts,
    supplierAlertsLoaded,
    loading,
    error,
    sensorsCount,
    allAlerts,
    activeAlerts,
    recentAlerts,
    topCriticalAlerts,
    lowStockStorageCount,
    outOfRangeTemperatureCount,
    averageKitchenTemperature,
    averageStorageTemperature,
    occupiedTablePercentage,
    loadSensors,
    fetchRestaurantAlerts,
    fetchSupplierAlerts,
    getSensorById,
    addSensor,
    updateSensor,
    deleteSensor,
    acknowledgeRestaurantAlert,
    acknowledgeSupplierAlert
  };
});
