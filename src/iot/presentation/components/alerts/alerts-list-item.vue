<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const props = defineProps({
  alert: {
    type: Object,
    required: true
  },
  showSensor: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['acknowledge', 'view']);

const { t, locale } = useI18n();

const alertTitle = computed(() => {
  if (props.showSensor) {
    if (props.alert.titleKey) {
      return t(props.alert.titleKey, props.alert.messageParams);
    }
    return props.alert.detailText || props.alert.detail || t('iot.alerts.defaultTitle');
  }
  return props.alert.detailText || props.alert.detail || t('iot.alerts.defaultTitle');
});

const alertMessage = computed(() => {
  if (props.showSensor && props.alert.messageKey) {
    return t(props.alert.messageKey, props.alert.messageParams);
  }
  return '';
});

function getSeverityBadge(severity) {
  const s = String(severity || '').toLowerCase();
  if (s === 'critical' || s === 'high') return 'danger';
  if (s === 'medium') return 'warning';
  return 'success';
}

function getStatusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'open' || s === 'pending') return 'warning';
  if (s === 'resolved') return 'success';
  return 'info';
}

function formatAlertTimestamp(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  if (props.showSensor) {
    return date.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }
}

const canAcknowledge = computed(() => {
  const status = String(props.alert.status || '').toLowerCase();
  return status === 'open' || status === 'pending';
});
</script>

<template>
  <tr class="alerts-list-item">
    <td>
      <Tag :value="alert.severity.toUpperCase()" :severity="getSeverityBadge(alert.severity)" />
    </td>
    <td>
      <div class="alerts-list-item__detail">
        <strong>{{ alertTitle }}</strong>
        <p v-if="alertMessage">{{ alertMessage }}</p>
      </div>
    </td>
    <td v-if="showSensor">
      <span class="alerts-list-item__sensor">
        <i class="pi pi-compass mr-1"></i>
        {{ alert.source || t('iot.alerts.defaultTitle') }} ({{ t('iot.alerts-page.dialog.meta.sensor-id') }}: {{ alert.sensorId || t('iot.alerts-page.table.na') }})
      </span>
    </td>
    <td>
      {{ formatAlertTimestamp(alert.timestamp) }}
    </td>
    <td>
      <Tag :value="alert.status.toUpperCase()" :severity="getStatusBadge(alert.status)" />
    </td>
    <td>
      <div class="alerts-list-item__actions">
        <Button
          icon="pi pi-eye"
          outlined
          rounded
          severity="secondary"
          @click="emit('view', alert)"
        />
        <Button
          v-if="canAcknowledge"
          icon="pi pi-check"
          outlined
          rounded
          severity="success"
          @click="emit('acknowledge', alert.id)"
        />
      </div>
    </td>
  </tr>
</template>

<style scoped>
.alerts-list-item__detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alerts-list-item__detail strong {
  color: #241c17;
  font-size: 14px;
}

.alerts-list-item__detail p {
  margin: 0;
  color: #6f665d;
  font-size: 12px;
}

.alerts-list-item__sensor {
  font-size: 13px;
  color: #4b5768;
}

.alerts-list-item__actions {
  display: flex;
  gap: 8px;
}
</style>
