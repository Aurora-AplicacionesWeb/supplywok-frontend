<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import useOperationsStore from '../../application/operations.store.js';
import KpiCardsRow from '../components/kpi-cards-row.vue';
import StatusBadge from '../components/status-badge.vue';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Checkbox from 'primevue/checkbox';
import Message from 'primevue/message';
import { useConfirm } from 'primevue/useconfirm';

const { t } = useI18n();
const router = useRouter();
const store = useOperationsStore();
const confirm = useConfirm();
const showCreateDishDialog = ref(false);
const newDish = ref(createEmptyDish());

const {
  kitchenOrders, tables, dishCategories, pendingKitchenOrders, inPreparationKitchenOrders,
  readyKitchenOrders, loading, errors
} = storeToRefs(store);

const {
  fetchKitchenOrders, fetchTables, fetchDishCategories, createDish, updateKitchenOrderStatus, deleteKitchenOrder
} = store;

const openCount = computed(() => pendingKitchenOrders.value.length);
const inPrepCount = computed(() => inPreparationKitchenOrders.value.length);
const readyCount = computed(() => readyKitchenOrders.value.length);

const allOrders = computed(() =>
    [...kitchenOrders.value]
        .filter(o => o.state !== 'deleted')
        .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true }))
);

function serviceTypeLabel(order) {
  return t(`operations.shared.serviceType.${order.typeService}`) || order.typeService;
}

function itemCount(order) {
  const dishes = order.dishes || [];
  return dishes.reduce((sum, d) => sum + (d.quantity || 0), 0);
}

function tableCode(order) {
  const table = order.table || tables.value.find(t => t.id === order.tableId);
  return table?.code || table?.number || null;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return dd + '/' + mm + '/' + yy + ' | ' + hh + ':' + min;
}

function handleStatusChange(orderId, newState) {
  var result = updateKitchenOrderStatus(orderId, newState);
  if (result && typeof result.then === 'function') {
    result.then(function() {
      fetchKitchenOrders();
    });
  } else {
    fetchKitchenOrders();
  }
}

function handleDelete(orderId) {
  confirm.require({
    message: t('operations.kitchenTicketsPage.confirmDelete'),
    header: t('operations.kitchenTicketsPage.confirmHeader'),
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: t('operations.kitchenTicketsPage.cancel'),
    acceptLabel: t('operations.kitchenTicketsPage.delete'),
    accept: () => deleteKitchenOrder(orderId)
  });
}

function handleEdit(order) {
  router.push(`/operations/kitchen/${order.id}/edit`);
}

function goToNewTicket() {
  router.push('/operations/kitchen/new');
}

function createEmptyDish() {
  return {
    code: '',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    dishCategoryId: null,
    active: true,
    outstanding: false
  };
}

const dishCategoryOptions = computed(() =>
    dishCategories.value.map((category) => ({
      label: category.name,
      value: category.id
    }))
);

function openCreateDishDialog() {
  if (dishCategories.value.length === 0) {
    fetchDishCategories();
  }
  newDish.value = createEmptyDish();
  showCreateDishDialog.value = true;
}

async function handleCreateDish() {
  const created = await createDish(newDish.value);
  if (created) {
    showCreateDishDialog.value = false;
    newDish.value = createEmptyDish();
  }
}

onMounted(() => {
  fetchKitchenOrders();
  fetchTables();
  fetchDishCategories();
});
</script>

<template>
  <section class="flex flex-column gap-3">
    <div class="flex justify-content-between align-items-start gap-3">
      <div>
        <span class="inline-block font-bold uppercase mb-1 kicker-text">{{ t('operations.kitchenTicketsPage.kicker') }}</span>
        <h1 class="font-bold m-0 page-title">{{ t('operations.kitchenTicketsPage.title') }}</h1>
        <p class="mt-2 page-desc">{{ t('operations.kitchenTicketsPage.description') }}</p>
      </div>
      <div class="flex gap-2 flex-wrap justify-content-end">
        <Button
            :label="t('operations.kitchenTicketsPage.addDishes')"
            icon="pi pi-plus"
            severity="secondary"
            outlined
            @click="openCreateDishDialog"
        />
        <Button
            :label="t('operations.kitchenTicketsPage.newTicket')"
            icon="pi pi-plus"
            severity="danger"
            @click="goToNewTicket"
        />
      </div>
    </div>

    <Message
        v-for="(err, i) in errors"
        :key="i"
        severity="error"
        :closable="true"
        :life="6000"
        class="w-full"
    >{{ err?.message ?? err?.toString?.() ?? err }}</Message>

    <div v-if="loading" class="flex justify-content-center py-5 loading-spinner">
      <i class="pi pi-spin pi-spinner" />
    </div>

    <template v-else>
      <KpiCardsRow
          :open-count="openCount"
          :in-prep-count="inPrepCount"
          :ready-count="readyCount"
      />

      <div class="bg-white shadow-1 overflow-x-auto table-wrapper" :style="{ borderRadius: '16px' }">
        <table class="w-full border-collapse main-table">
          <thead>
          <tr>
            <th class="text-left p-3 align-middle">{{ t('operations.kitchenTicketsPage.orderNumber') }}</th>
            <th class="text-left p-3 align-middle">{{ t('operations.kitchenTicketsPage.tableNumber') }}</th>
            <th class="text-left p-3 align-middle hide-md">{{ t('operations.kitchenTicketsPage.typeService') }}</th>
            <th class="text-left p-3 align-middle hide-sm">{{ t('operations.kitchenTicketsPage.items') }}</th>
            <th class="text-left p-3 align-middle">{{ t('operations.tablesAndOccupancyPage.state') }}</th>
            <th class="text-left p-3 align-middle hide-md">{{ t('operations.kitchenTicketsPage.dateCreated') }}</th>
            <th class="text-right p-3 align-middle"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="order in allOrders" :key="order.id" class="table-row">
            <td class="p-3 align-middle">
              <strong class="order-number">{{ order.number || '#' + order.id }}</strong>
            </td>
            <td class="p-3 align-middle">
                                <span v-if="tableCode(order)" class="inline-flex align-items-center gap-1 font-semibold table-badge">
                                    <i class="pi pi-table" /> {{ tableCode(order) }}
                                </span>
              <span v-else class="inline-flex align-items-center gap-1 font-semibold takeaway-badge">
                                    <i class="pi pi-shopping-bag" />
                                </span>
            </td>
            <td class="p-3 align-middle service-cell hide-md">{{ serviceTypeLabel(order) }}</td>
            <td class="p-3 align-middle font-semibold text-center hide-sm">{{ itemCount(order) }}</td>
            <td class="p-3 align-middle"><StatusBadge :status="order.state" /></td>
            <td class="p-3 align-middle time-cell hide-md">{{ formatDateTime(order.dateCreated) }}</td>
            <td class="p-3 align-middle">
              <div class="flex gap-1 justify-content-end actions-cell">
                <template v-if="order.state === 'pending'">
                  <Button icon="pi pi-play" severity="info" size="small" rounded text :tooltip="t('operations.kitchenTicketsPage.markInPreparation')" @click="handleStatusChange(order.id, 'in_preparation')" />
                  <Button icon="pi pi-times" severity="danger" size="small" rounded text :tooltip="t('operations.kitchenTicketsPage.cancel')" @click="handleStatusChange(order.id, 'cancelled')" />
                </template>
                <template v-else-if="order.state === 'in_preparation'">
                  <Button icon="pi pi-check" severity="success" size="small" rounded text :tooltip="t('operations.kitchenTicketsPage.markReady')" @click="handleStatusChange(order.id, 'ready')" />
                  <Button icon="pi pi-times" severity="danger" size="small" rounded text :tooltip="t('operations.kitchenTicketsPage.cancel')" @click="handleStatusChange(order.id, 'cancelled')" />
                </template>
                <template v-else-if="order.state === 'ready'">
                  <Button icon="pi pi-send" severity="secondary" size="small" rounded text :tooltip="t('operations.kitchenTicketsPage.markDelivered')" @click="handleStatusChange(order.id, 'delivered')" />
                </template>
                <Button icon="pi pi-pencil" severity="contrast" size="small" rounded :tooltip="t('operations.kitchenTicketsPage.edit')" @click="handleEdit(order)" />
                <Button icon="pi pi-trash" severity="danger" size="small" rounded :tooltip="t('operations.kitchenTicketsPage.delete')" @click="handleDelete(order.id)" />
              </div>
            </td>
          </tr>
          <tr v-if="allOrders.length === 0">
            <td colspan="7" class="text-center p-5 empty-state">{{ t('operations.kitchenTicketsPage.noOrders') }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>
    <ConfirmDialog />
    <Dialog
        v-model:visible="showCreateDishDialog"
        modal
        :header="t('operations.kitchenTicketsPage.createDishDialog.title')"
        :style="{ width: 'min(480px, calc(100vw - 32px))' }"
        :draggable="false"
    >
      <div class="flex flex-column gap-3 p-2">
        <div class="flex flex-column gap-1">
          <label class="dialog-label">{{ t('operations.kitchenTicketsPage.createDishDialog.code') }}</label>
          <InputText v-model="newDish.code" :placeholder="t('operations.kitchenTicketsPage.createDishDialog.codePlaceholder')" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="dialog-label">{{ t('operations.kitchenTicketsPage.createDishDialog.name') }}</label>
          <InputText v-model="newDish.name" :placeholder="t('operations.kitchenTicketsPage.createDishDialog.namePlaceholder')" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="dialog-label">{{ t('operations.kitchenTicketsPage.createDishDialog.description') }}</label>
          <InputText v-model="newDish.description" :placeholder="t('operations.kitchenTicketsPage.createDishDialog.descriptionPlaceholder')" />
        </div>
        <div class="flex gap-3">
          <div class="flex flex-column gap-1 flex-1">
            <label class="dialog-label">{{ t('operations.kitchenTicketsPage.createDishDialog.price') }}</label>
            <InputNumber v-model="newDish.price" mode="currency" currency="PEN" locale="es-PE" :min="0" class="w-full" />
          </div>
          <div class="flex flex-column gap-1 flex-1">
            <label class="dialog-label">{{ t('operations.kitchenTicketsPage.createDishDialog.quantity') }}</label>
            <InputNumber v-model="newDish.quantity" :min="0" class="w-full" />
          </div>
        </div>
        <div class="flex flex-column gap-1">
          <label class="dialog-label">{{ t('operations.kitchenTicketsPage.createDishDialog.category') }}</label>
          <Select
              v-model="newDish.dishCategoryId"
              :options="dishCategoryOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
          />
        </div>
        <div class="flex gap-4 flex-wrap">
          <div class="flex align-items-center gap-2">
            <Checkbox v-model="newDish.active" binary inputId="dish-active" />
            <label for="dish-active" class="dialog-label cursor-pointer">{{ t('operations.kitchenTicketsPage.createDishDialog.active') }}</label>
          </div>
          <div class="flex align-items-center gap-2">
            <Checkbox v-model="newDish.outstanding" binary inputId="dish-outstanding" />
            <label for="dish-outstanding" class="dialog-label cursor-pointer">{{ t('operations.kitchenTicketsPage.createDishDialog.outstanding') }}</label>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button
              :label="t('operations.kitchenTicketsPage.createDishDialog.cancel')"
              severity="secondary"
              outlined
              @click="showCreateDishDialog = false"
          />
          <Button
              :label="t('operations.kitchenTicketsPage.createDishDialog.submit')"
              severity="danger"
              :disabled="!newDish.code || !newDish.name || !newDish.dishCategoryId"
              @click="handleCreateDish"
          />
        </div>
      </template>
    </Dialog>
  </section>
</template>

<style scoped>
.kicker-text { color: #a07832; font-size: 12px; letter-spacing: 0.08em; }
.page-title { color: #221b2a; font-size: clamp(2.6rem, 4vw, 3.3rem); line-height: 1; letter-spacing: -0.04em; font-family: 'Poppins', system-ui, sans-serif; }
.page-desc { color: #65594f; font-size: 14px; }
.loading-spinner { font-size: 24px; color: #a07832; }
.table-wrapper { border: 1px solid #f0e8dd; }
.main-table { font-size: 13px; }
.main-table th { color: #7d7065; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #faf5ee; border-bottom: 2px solid #efe6da; white-space: nowrap; }
.main-table td { border-bottom: 1px solid #f0e8dd; color: #40342d; }
.table-row:hover { background: #faf5ee; }
.order-number { font-family: 'Poppins', system-ui, sans-serif; font-weight: 600; color: #2d241e; }
.table-badge { font-size: 12px; color: #4b3d34; }
.takeaway-badge { font-size: 12px; color: #a07832; }
.service-cell { color: #65594f; font-size: 12px; }
.time-cell { color: #7d7065; font-size: 12px; white-space: nowrap; text-align: center; }
.actions-cell { white-space: nowrap; }
.empty-state { color: #7d7065; font-size: 13px; }
.dialog-label { color: #40342d; font-size: 13px; font-weight: 600; }
@media (max-width: 768px) { .hide-md { display: none; } }
@media (max-width: 640px) { .hide-sm { display: none; } }
</style>
