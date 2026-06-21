<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const props = defineProps({
  alert: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  },
  showSensor: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'close']);

const { t, locale } = useI18n();

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const alertTitle = computed(() => {
  if (!props.alert) return '';
  return props.alert.detail || props.alert.detailText || (props.showSensor ? t('iot.alerts.defaultTitle') : t('iot.alerts.supplierTitle'));
});

const alertMessage = computed(() => {
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
    return date.toLocaleString(locale.value);
  } else {
    return date.toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }
}

function handleClose() {
  isVisible.value = false;
  emit('close');
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :draggable="false"
    :header="showSensor ? t('iot.alerts-page.dialog.headerIncident') : t('iot.alerts-page.dialog.header')"
    :style="{ width: 'min(500px, calc(100vw - 32px))' }"
    @hide="handleClose"
  >
    <div v-if="alert" class="alert-details">
      <header class="alert-details__header">
        <Tag :value="alert.severity.toUpperCase()" :severity="getSeverityBadge(alert.severity)" />
        <Tag :value="alert.status.toUpperCase()" :severity="getStatusBadge(alert.status)" />
      </header>

      <div class="alert-details__body mt-4">
        <h3>{{ alertTitle }}</h3>
        <p v-if="alertMessage" class="mt-2">{{ alertMessage }}</p>

        <hr class="my-4 border-gray-200" />

        <div class="alert-details__meta">
          <template v-if="showSensor">
            <div class="alert-details__meta-row">
              <span>{{ t('iot.alerts-page.dialog.meta.source') }}:</span>
              <strong>{{ alert.source }}</strong>
            </div>
            <div class="alert-details__meta-row" v-if="alert.sensorId">
              <span>{{ t('iot.alerts-page.dialog.meta.sensor-id') }}:</span>
              <strong>{{ alert.sensorId }}</strong>
            </div>
            <div class="alert-details__meta-row">
              <span>{{ t('iot.alerts-page.dialog.meta.dateTime') }}:</span>
              <strong>{{ formatAlertTimestamp(alert.timestamp) }}</strong>
            </div>
          </template>
          <template v-else>
            <div class="alert-details__meta-row">
              <span>{{ t('iot.alerts-page.dialog.meta.date') }}:</span>
              <strong>{{ formatAlertTimestamp(alert.timestamp) }}</strong>
            </div>
          </template>
        </div>
      </div>
    </div>
    <template #footer>
      <Button :label="t('iot.alerts-page.dialog.actions.close')" severity="secondary" outlined @click="handleClose" />
    </template>
  </Dialog>
</template>

<style scoped>
.alert-details {
  font-family: 'Montserrat', system-ui, sans-serif;
}

.alert-details__header {
  display: flex;
  gap: 8px;
}

.alert-details__body h3 {
  margin: 0;
  color: #241c17;
  font-size: 16px;
  font-family: 'Poppins', system-ui, sans-serif;
  line-height: 1.4;
}

.alert-details__body p {
  color: #6f665d;
  font-size: 14px;
  line-height: 1.5;
}

.alert-details__meta {
  display: grid;
  gap: 10px;
}

.alert-details__meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.alert-details__meta-row span {
  color: #7b7269;
}

.alert-details__meta-row strong {
  color: #241c17;
}
</style>
