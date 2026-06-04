<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import StatusBadge from './status-badge.vue';

const props = defineProps({
  order: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
  tableCode: { type: String, default: '' }
});

const emit = defineEmits(['status-change']);
const { t } = useI18n();

const serviceTypeLabel = computed(() => {
  return t(`operations.shared.serviceType.${props.order.typeService}`) || props.order.typeService;
});

const itemCount = computed(() => {
  const items = props.order.items || [];
  return items.reduce((sum, i) => sum + (i.quantity || 0), 0);
});

const itemList = computed(() => {
  return props.order.items || [];
});
</script>

<template>
  <article class="bg-white border-round shadow-1 p-3 flex flex-column gap-2" :style="{ border: '1px solid #f0e8dd' }">
    <div class="flex justify-content-between align-items-start gap-2">
      <div class="flex align-items-center gap-2">
        <strong class="font-heading font-semibold text-lg">{{ order.number || `#${order.id}` }}</strong>
        <StatusBadge :status="order.state" />
      </div>
      <span v-if="tableCode || order.tableNumber" class="font-semibold" :style="{ color: '#7d7065', fontSize: '12px', whiteSpace: 'nowrap' }">
                <i class="pi pi-table mr-1" /> {{ tableCode || order.tableNumber }}
            </span>
      <span v-else class="font-semibold" :style="{ color: '#7d7065', fontSize: '12px', whiteSpace: 'nowrap' }">
                <i class="pi pi-shopping-bag mr-1" /> {{ serviceTypeLabel }}
            </span>
    </div>

    <div class="flex flex-column gap-1">
      <div v-for="item in itemList" :key="item.id || item.dishId" class="flex justify-content-between gap-2 text-sm">
        <span class="text-color">{{ item.dishName }}</span>
        <span class="font-semibold" :style="{ color: '#7d7065', whiteSpace: 'nowrap' }">x{{ item.quantity }}</span>
      </div>
    </div>

    <div v-if="order.observations" class="flex align-items-start gap-1 p-2 border-round" :style="{ fontSize: '12px', color: '#a07832', backgroundColor: '#fefce8' }">
      <i class="pi pi-comment" /> {{ order.observations }}
    </div>

    <div class="flex justify-content-between" :style="{ fontSize: '11px', color: '#8e8177' }">
            <span>
                <i class="pi pi-clock mr-1" />
                {{ new Date(order.dateCreated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
      <span>{{ itemCount }} items</span>
    </div>

    <div v-if="!readonly" class="flex gap-2 flex-wrap">
      <template v-if="order.state === 'pending'">
        <Button
            :label="t('operations.kitchenTicketsPage.markInPreparation')"
            icon="pi pi-play"
            severity="info"
            size="small"
            @click="emit('status-change', { orderId: order.id, newState: 'in_preparation' })"
        />
        <Button
            :label="t('operations.kitchenTicketsPage.cancel')"
            icon="pi pi-times"
            severity="danger"
            size="small"
            text
            @click="emit('status-change', { orderId: order.id, newState: 'cancelled' })"
        />
      </template>
      <template v-else-if="order.state === 'in_preparation'">
        <Button
            :label="t('operations.kitchenTicketsPage.markReady')"
            icon="pi pi-check"
            severity="success"
            size="small"
            @click="emit('status-change', { orderId: order.id, newState: 'ready' })"
        />
        <Button
            :label="t('operations.kitchenTicketsPage.cancel')"
            icon="pi pi-times"
            severity="danger"
            size="small"
            text
            @click="emit('status-change', { orderId: order.id, newState: 'cancelled' })"
        />
      </template>
      <template v-else-if="order.state === 'ready'">
        <Button
            :label="t('operations.kitchenTicketsPage.markDelivered')"
            icon="pi pi-send"
            severity="secondary"
            size="small"
            @click="emit('status-change', { orderId: order.id, newState: 'delivered' })"
        />
      </template>
    </div>
  </article>
</template>

<style scoped>
.font-heading {
  font-family: 'Poppins', system-ui, sans-serif;
}
</style>
