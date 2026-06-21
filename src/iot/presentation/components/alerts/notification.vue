<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  alert: {
    type: Object,
    required: true
  }
});

const { t } = useI18n();

const alertTitle = computed(() => {
  if (props.alert.titleKey) {
    return t(props.alert.titleKey, props.alert.messageParams);
  }
  return props.alert.detailText || props.alert.detail || t('iot.alerts.defaultTitle');
});

const alertMessage = computed(() => {
  if (props.alert.messageKey) {
    return t(props.alert.messageKey, props.alert.messageParams);
  }
  return '';
});

const formattedTime = computed(() => {
  if (!props.alert?.timestamp) return '';
  const date = new Date(props.alert.timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

function severityClass(severity) {
  const s = String(severity || '').toLowerCase();
  if (s === 'critical' || s === 'high') return 'notification--critical';
  if (s === 'medium') return 'notification--warning';
  return 'notification--normal';
}
</script>

<template>
  <div class="notification" :class="severityClass(alert.severity)">
    <div class="notification__indicator"></div>
    <div class="notification__body">
      <div class="notification__title">{{ alertTitle }}</div>
      <div v-if="alertMessage" class="notification__message">{{ alertMessage }}</div>
      <div class="notification__meta">
        <span class="notification__time">{{ formattedTime }}</span>
        <span v-if="alert.source && alert.source !== 'Unknown'" class="notification__source">
          • {{ alert.source }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #efe4d4;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.notification:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(58, 42, 20, 0.05);
}

.notification__indicator {
  width: 4px;
  border-radius: 99px;
  background: #cbd5e1;
}

.notification--critical .notification__indicator {
  background: #ef4444;
}

.notification--warning .notification__indicator {
  background: #f59e0b;
}

.notification--normal .notification__indicator {
  background: #10b981;
}

.notification__body {
  flex: 1;
}

.notification__title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.notification__message {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.notification__meta {
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}
</style>
