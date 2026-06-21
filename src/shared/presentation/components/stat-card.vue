<script setup>
import { computed } from 'vue';

const props = defineProps({
    icon: {
        type: String,
        default: ''
    },
    iconSrc: {
        type: String,
        default: ''
    },
    value: {
        type: [String, Number],
        required: true
    },
    label: {
        type: String,
        required: true
    },
    iconClass: {
        type: String,
        default: ''
    },
    badge: {
        type: String,
        default: ''
    },
    badgeClass: {
        type: String,
        default: ''
    },
    badgeSeverity: {
        type: String,
        default: 'info'
    },
    showBadge: {
        type: Boolean,
        default: true
    }
});

const displayValue = computed(() => {
    return props.value !== null && props.value !== undefined ? String(props.value) : '—';
});
</script>

<template>
    <article class="stat-card">
        <div class="stat-card__header">
            <template v-if="iconSrc">
                <img :src="iconSrc" alt="icon" class="stat-card__image" />
            </template>
            <template v-else-if="icon">
                <i class="pi stat-card__icon" :class="[icon, iconClass]"></i>
            </template>
            
            <span v-if="showBadge && (badge || badgeClass)" class="stat-card__badge" :class="[badgeClass, 'badge--' + badgeSeverity]">
                {{ badge }}
            </span>
        </div>

        <strong class="stat-card__value">{{ displayValue }}</strong>
        <p class="stat-card__label">{{ label }}</p>
    </article>
</template>

<style scoped>
.stat-card {
    min-height: 152px;
    padding: 22px 24px;
    border: 1px solid #efe4d4;
    border-radius: 8px;
    background: #fffdf9;
    box-shadow: 0 16px 34px rgba(58, 42, 20, 0.08);
}

.stat-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.stat-card__icon {
    font-size: 22px;
}

.stat-card__image {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

.stat-card__value {
    display: block;
    margin-top: 14px;
    color: #241c17;
    font-size: 17px;
    font-weight: 700;
}

.stat-card__label {
    margin: 6px 0 0;
    color: #41352d;
    font-size: 16px;
    line-height: 1.25;
    text-transform: uppercase;
}

.stat-card__badge {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
}

.stat-card__badge--alert {
    background: #fdeaea;
    color: #ff4d4f;
}

.badge--urgent {
  background-color: #fdecea;
  color: #c0392b;
}

.badge--alert {
  background-color: #e8f4fd;
  color: #2980b9;
}

.badge--ok {
  background-color: #eafaf1;
  color: #1e8449;
}

.badge--info {
  background-color: #f4f4f4;
  color: #555;
}
</style>
