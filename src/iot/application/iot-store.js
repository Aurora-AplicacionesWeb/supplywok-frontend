import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Alert } from '../domain/model/alert.entity.js';
import { IotMonitoringApi } from '../infrastructure/iot-monitoring.api.js';
import { SupplierAlertsApi } from '../infrastructure/supplier-alerts.api.js';
import { SupplierAlertAssembler } from '../infrastructure/supplier-alert.assembler.js';

/**
 * Pinia store for managing IoT Monitoring state.
 * Handles sensor data fetching, alert generation, and derived metrics.
 */
export const iotStore = defineStore('iot', () => {
  const api = new IotMonitoringApi();
  const supplierApi = new SupplierAlertsApi();

  // --- State ---
  const sensors = ref([]);
  const alertHistory = ref([]);
  const supplierAlerts = ref([]);
  const supplierAlertsLoaded = ref(false);
  const loading = ref(false);
  const error = ref(null);

  // --- Computed Properties (Getters) ---
  
  /** Total number of sensors registered. */
  const sensorsCount = computed(() => sensors.value.length);

  /** List of all alerts in the history. */
  const allAlerts = computed(() => alertHistory.value);

  /** 
   * List of all active (Open) alerts. 
   * Sorted by severity (Critical first) and then by timestamp (newest first).
   */
  const activeAlerts = computed(() => {
    return alertHistory.value
      .filter(a => a.status === 'Open')
      .sort((a, b) => {
        const severityMap = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        const diff = severityMap[a.severity] - severityMap[b.severity];
        if (diff !== 0) return diff;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
  });

  /** The 3 most recent alerts for quick display. */
  const recentAlerts = computed(() => {
    return [...alertHistory.value]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3);
  });

  /** Top 5 critical alerts for summary views. */
  const topCriticalAlerts = computed(() => {
    return activeAlerts.value.slice(0, 5);
  });

  // ... (lowStockStorageCount, etc. remain the same as they check sensors directly)
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
   * Synchronizes alerts based on current sensor values.
   */
  const syncAlerts = () => {
    for (const sensor of sensors.value) {
      const newAlert = Alert.fromSensor(sensor);
      const existingAlert = alertHistory.value.find(a => a.sensorId === sensor.id && a.status === 'Open');

      if (newAlert && !existingAlert) {
        alertHistory.value.unshift(newAlert);
      } else if (!newAlert && existingAlert) {
        existingAlert.resolve();
      }
    }
  };

  /** 
   * Fetches the latest sensor data from the API.
   */
  const loadSensors = async () => {
    loading.value = true;
    error.value = null;
    try {
      sensors.value = await api.getSensors();
      syncAlerts();
    } catch (err) {
      error.value = formatError(err, 'Failed to load sensors');
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
      supplierAlerts.value = SupplierAlertAssembler.toEntitiesFromResponse(response);
      supplierAlertsLoaded.value = true;
    } catch (err) {
      error.value = formatError(err, 'Failed to fetch supplier alerts');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Marks an alert as acknowledged (supports both supplier and sensor alerts).
   */
  const acknowledgeAlert = async (alertId) => {
    const alertIdNum = parseInt(alertId);
    
    // 1. Check if it's a supplier alert
    const existingSupplierAlert = supplierAlerts.value.find(a => a.id === alertIdNum);
    if (existingSupplierAlert) {
      if (existingSupplierAlert.status === 'acknowledged') {
        return;
      }
      const updated = {
        ...existingSupplierAlert,
        status: 'acknowledged'
      };
      try {
        const response = await supplierApi.updateAlert(alertIdNum, SupplierAlertAssembler.toResourceFromEntity(updated));
        const persisted = SupplierAlertAssembler.toEntityFromResource(response.data);
        const index = supplierAlerts.value.findIndex(a => a.id === persisted.id);
        if (index !== -1) {
          supplierAlerts.value[index] = persisted;
        }
      } catch (err) {
        error.value = formatError(err, 'Failed to acknowledge supplier alert');
      }
      return;
    }

    // 2. Otherwise treat as sensor alert
    const alert = alertHistory.value.find(a => a.id === alertIdNum);
    if (alert) {
      alert.acknowledge();
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
      sensors.value.push(sensor);
      syncAlerts();
    } catch (err) {
      error.value = formatError(err, 'Failed to create sensor');
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
      const index = sensors.value.findIndex(s => s.id === updatedSensor.id);
      if (index !== -1) {
        sensors.value.splice(index, 1, updatedSensor);
        syncAlerts();
      }
    } catch (err) {
      error.value = formatError(err, 'Failed to update sensor');
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
      sensors.value = sensors.value.filter(s => s.id !== id);
      syncAlerts();
    } catch (err) {
      error.value = formatError(err, 'Failed to delete sensor');
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

  // Auto-initialize store
  loadSensors();

  return {
    sensors,
    alertHistory,
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
    fetchSupplierAlerts,
    getSensorById,
    addSensor,
    updateSensor,
    deleteSensor,
    acknowledgeAlert
  };
});
