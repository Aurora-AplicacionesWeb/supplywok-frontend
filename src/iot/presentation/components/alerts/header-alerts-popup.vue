<template>
  <div class="header-alerts-wrapper">
    <!-- Icono de notificaciones -->
    <div class="notification-icon" @click="togglePanel">
      <img src="/images/icons/notify-icon.svg" alt="Alerts" />
      <span v-if="displayAlerts.length > 0" class="badge">
        {{ displayAlerts.length }}
      </span>
    </div>

    <!-- Panel de notificaciones -->
    <div v-if="isOpen" class="alerts-popup-panel" @click.self="togglePanel">
      <div class="alerts-popup-header">
        <h4>{{ $t('iot.alerts.notifications') }}</h4>
        <button class="close-btn" @click="togglePanel">&times;</button>
      </div>
      <div class="alerts-popup-body">
        <div v-if="displayAlerts.length === 0" class="empty-state">
          {{ $t('iot.alerts.no-active-alerts') }}
        </div>
        <AlertItem 
          v-for="alert in displayAlerts" 
          :key="alert.id"
          :alert="alert"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Dropdown/Popup component for displaying critical alerts in the application header.
 * Dynamically switches between IoT alerts (Restaurant) and Supplier alerts based on active role.
 */
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AlertItem from './alert-item.vue';
import { iotStore } from '../../../application/iot-store.js';
import { useIamStore } from '../../../../iam/application/iam-store.js';
import useSessionStore from '../../../../shared/application/session.store.js';
import { getRoleFromPath, normalizeRole } from '../../../../shared/application/role-routing.js';

const route = useRoute();
const { t } = useI18n();
const iamStore = useIamStore();
const sessionStore = useSessionStore();
const restaurantIotStore = iotStore();

/** Controls the visibility of the alerts popup. */
const isOpen = ref(false);

/** Toggles the popup panel open/closed. */
const togglePanel = () => {
  isOpen.value = !isOpen.value;
};

/** Calculates the current active role based on path or session. */
const activeRole = computed(() => {
  return getRoleFromPath(route.path)
      ?? normalizeRole(iamStore.currentUserRole)
      ?? normalizeRole(sessionStore.userRole)
      ?? 'restaurant';
});

/** 
 * Computes which alerts to show based on the active role.
 * Maps supplier alerts to the interface expected by AlertItem.
 */
const displayAlerts = computed(() => {
  if (activeRole.value === 'supplier') {
    return restaurantIotStore.supplierAlerts
      .filter(a => a.status === 'pending')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(a => {
        let mappedSeverity = 'normal';
        if (a.severity === 'high') mappedSeverity = 'critical';
        else if (a.severity === 'medium') mappedSeverity = 'warning';

        const translatedMessage = {
          'Rush reorder request': t('supplier-management.alerts.messages.rush-reorder'),
          'Route congestion detected': t('supplier-management.alerts.messages.route-congestion')
        }[a.detail] || a.detail;
        
        return {
          id: a.id,
          title: t('supplier-management.alerts.notification-title'),
          message: translatedMessage,
          severity: mappedSeverity,
          timestamp: new Date(a.date)
        };
      });
  }
  
  return restaurantIotStore.topCriticalAlerts;
});

onMounted(() => {
  if (activeRole.value === 'supplier' && !restaurantIotStore.supplierAlertsLoaded) {
    restaurantIotStore.fetchSupplierAlerts();
  }
});
</script>

<style scoped>
.header-alerts-wrapper {
  position: relative;
  display: inline-block;
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: 8px;
}

.notification-icon img {
  width: 24px;
  height: 24px;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  font-family: sans-serif;
}

.alerts-popup-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
  margin-top: 10px;
}

.alerts-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.alerts-popup-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
}

.alerts-popup-body {
  padding: 8px 16px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 16px 0;
  text-align: center;
  color: #888;
  font-size: 13px;
}
</style>
