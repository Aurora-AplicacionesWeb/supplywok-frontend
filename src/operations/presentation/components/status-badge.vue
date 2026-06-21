<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  status: { type: String, default: '' }
});

const { t } = useI18n();

const label = computed(() => {
  return t(`operations.shared.status.${props.status}`) || props.status;
});

const colorMap = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  in_preparation: { bg: '#fce4ec', text: '#c21204' },
  ready: { bg: '#dcfce7', text: '#166534' },
  delivered: { bg: '#f3f4f6', text: '#6b7280' },
  cancelled: { bg: '#fce4ec', text: '#991b1b' }
};

const chipStyle = computed(() => ({
  backgroundColor: colorMap[props.status]?.bg || '#f3f4f6',
  color: colorMap[props.status]?.text || '#4b5563',
  padding: '2px 7px',
  fontSize: '10px',
}));
</script>

<template>
    <span class="inline-block border-round font-bold uppercase" :style="chipStyle">
        {{ label }}
    </span>
</template>
