<script setup>
import { onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import useOperationsStore from '../../application/operations.store.js';
import DishMenuPanel from '../components/dish-menu-panel.vue';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const store = useOperationsStore();

const {
  tables, freeTables, dishes, dishCategories, dishesByCategory,
  newOrderServiceType, newOrderTableId,
  newOrderDishes, newOrderObservations,
  totalItemsNewOrder, totalNewOrder, loading, errors
} = storeToRefs(store);

const {
  fetchTables, fetchDishes, fetchDishCategories,
  selectServiceType, setNewOrderObservations, setNewOrderDishes,
  addItemToOrder, removeItemFromOrder,
  updateItemQuantity, createKitchenOrder, updateKitchenOrder,
  fetchKitchenOrderById
} = store;

const showMenu = ref(false);
const editId = computed(() => {
  const routeParamId = route.params.orderId;
  if (routeParamId) return Number(routeParamId);
  const val = route.query.edit;
  return val ? Number(val) : null;
});

function handleCreateOrder() {
  function onResult(result) {
    if (result) {
      router.push({ name: 'kitchen-tickets-view' });
    }
  }
  if (editId.value) {
    updateKitchenOrder(editId.value, {
      tableId: newOrderTableId.value,
      typeService: newOrderServiceType.value,
      dishes: [...newOrderDishes.value],
      observations: newOrderObservations.value
    }).then(onResult);
  } else {
    var result = createKitchenOrder();
    if (result && typeof result.then === 'function') {
      result.then(onResult);
    }
  }
}

function handleAddDish(dish) {
  addItemToOrder(dish, 1);
  showMenu.value = false;
}

function goBack() {
  router.push('/operations/kitchen');
}

function loadEditOrder(editIdVal) {
  fetchKitchenOrderById(editIdVal).then(function () {
    var order = store.currentKitchenOrder;
    if (!order || !order.id) return;

    var tableId = order.table?.id || order.tableId;
    selectServiceType(order.typeService, tableId);
    setNewOrderObservations(order.observations || '');
    setNewOrderDishes(order.dishes || []);
  });
}

onMounted(function() {
  fetchTables().then(function () {
    if (dishes.value.length === 0) return fetchDishes();
  }).then(function () {
    if (dishCategories.value.length === 0) return fetchDishCategories();
  }).then(function () {
    if (editId.value) loadEditOrder(editId.value);
  }).catch(function () {});
});
</script>

<template>
  <section class="flex flex-column gap-3">
    <div class="flex justify-content-between align-items-start gap-3">
      <div class="flex align-items-start gap-2">
        <Button
            icon="pi pi-arrow-left"
            severity="secondary"
            text
            rounded
            :tooltip="t('operations.createKitchenOrderPage.back')"
            @click="goBack"
        />
        <div>
          <span class="inline-block font-bold uppercase mb-1 kicker-text">{{ t('operations.createKitchenOrderPage.kicker') }}</span>
          <h1 class="font-bold m-0 page-title">{{ t('operations.createKitchenOrderPage.title') }}</h1>
          <p class="mt-2 page-desc">{{ t('operations.createKitchenOrderPage.description') }}</p>
        </div>
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

    <div class="grid">
      <div class="col-12 lg:col-7">
        <div class="flex flex-column gap-3">
          <div class="bg-white border-round shadow-1 p-3">
            <h3 class="m-0 mb-2 font-semibold card-title">{{ t('operations.createKitchenOrderPage.serviceType') }}</h3>
            <div class="flex gap-2">
              <Button
                  :label="t('operations.createKitchenOrderPage.tableService')"
                  severity="danger"
                  :outlined="newOrderServiceType !== 'table_service'"
                  @click="selectServiceType('table_service')"
              />
              <Button
                  :label="t('operations.createKitchenOrderPage.toTakeHome')"
                  severity="danger"
                  :outlined="newOrderServiceType !== 'to_take_home'"
                  @click="selectServiceType('to_take_home')"
              />
            </div>
          </div>

            <div v-if="newOrderServiceType === 'table_service'" class="bg-white border-round shadow-1 p-3">
            <h3 class="m-0 mb-2 font-semibold card-title">{{ t('operations.createKitchenOrderPage.tableSelection') }}</h3>
            <div class="tables-grid">
              <button
                  v-for="table in freeTables"
                  :key="table.id"
                  type="button"
                  class="flex flex-column align-items-center gap-1 p-2 border-2 border-round bg-white cursor-pointer table-btn"
                  :class="{ 'table-btn--selected': newOrderTableId === table.id }"
                  @click="selectServiceType('table_service', table.id)"
              >
                <i class="pi pi-table" />
                <span>{{ table.number }}</span>
              </button>
            </div>
            <p v-if="freeTables.length === 0" class="no-tables-text">
              {{ t('operations.createKitchenOrderPage.freeTables') }}: 0
            </p>
          </div>

          <div class="bg-white border-round shadow-1 p-3">
            <h3 class="m-0 mb-2 font-semibold card-title">{{ t('operations.createKitchenOrderPage.selectedDishes') }}</h3>
            <div v-if="newOrderDishes.length === 0" class="empty-items-text">
              <p>{{ t('operations.createKitchenOrderPage.noItems') }}</p>
            </div>
            <div v-else class="flex flex-column gap-2 mb-2">
              <div v-for="dish in newOrderDishes" :key="dish.id" class="flex justify-content-between align-items-center gap-2 p-2 border-round item-row">
                <div class="item-info">
                  <strong class="item-name">{{ dish.name }}</strong>
                  <span class="item-price">{{ t('operations.createKitchenOrderPage.unitPrice') }}: S/ {{ dish.price.toFixed(2) }}</span>
                </div>
                <div class="flex align-items-center gap-1">
                  <button type="button" class="cursor-pointer font-bold border-1 border-round qty-btn" @click="updateItemQuantity(dish.id, dish.quantity - 1)">-</button>
                  <span class="font-semibold text-center qty-value">{{ dish.quantity }}</span>
                  <button type="button" class="cursor-pointer font-bold border-1 border-round qty-btn" @click="updateItemQuantity(dish.id, dish.quantity + 1)">+</button>
                  <button type="button" class="border-none bg-transparent cursor-pointer p-1 remove-btn" @click="removeItemFromOrder(dish.id)">
                    <i class="pi pi-trash" />
                  </button>
                </div>
              </div>
            </div>
            <Button
                :label="t('operations.createKitchenOrderPage.addDishes')"
                icon="pi pi-plus-circle"
                severity="secondary"
                text
                @click="showMenu = !showMenu"
            />
          </div>

          <div class="bg-white border-round shadow-1 p-3">
            <h3 class="m-0 mb-2 font-semibold card-title">{{ t('operations.createKitchenOrderPage.observations') }}</h3>
            <Textarea
                v-model="newOrderObservations"
                :placeholder="t('operations.createKitchenOrderPage.observationsPlaceholder')"
                rows="3"
                class="w-full border-1 border-round"
                :style="{ padding: '0.78rem 0.9rem', borderColor: '#e6ddd3', resize: 'vertical' }"
            />
          </div>

          <div class="bg-white border-round shadow-1 p-3 flex flex-column gap-2">
            <div class="flex justify-content-between align-items-center">
              <span class="summary-label">{{ t('operations.createKitchenOrderPage.totalItems') }}</span>
              <strong class="summary-value">{{ totalItemsNewOrder }}</strong>
            </div>
            <div class="flex justify-content-between align-items-center">
              <span class="summary-label">{{ t('operations.createKitchenOrderPage.totalAmount') }}</span>
              <strong class="summary-value">S/ {{ totalNewOrder.toFixed(2) }}</strong>
            </div>
          </div>

          <Button
              :label="editId ? t('operations.createKitchenOrderPage.updateOrder') : t('operations.createKitchenOrderPage.createOrder')"
              :icon="editId ? 'pi pi-save' : 'pi pi-check'"
              severity="danger"
              class="border-round uppercase submit-btn"
              :disabled="newOrderDishes.length === 0 || loading"
              :loading="loading"
              @click="handleCreateOrder"
          />
        </div>
      </div>

      <div v-if="showMenu" class="col-12 lg:col-5">
        <DishMenuPanel
            :dishes-by-category="dishesByCategory"
            @add-dish="handleAddDish"
            @close="showMenu = false"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.kicker-text { color: #a07832; font-size: 12px; letter-spacing: 0.08em; }
.page-title { color: #221b2a; font-size: clamp(2.6rem, 4vw, 3.3rem); line-height: 1; letter-spacing: -0.04em; font-family: 'Poppins', system-ui, sans-serif; }
.page-desc { color: #65594f; font-size: 14px; }
.card-title { color: #40342d; font-size: 16px; font-family: 'Poppins', system-ui, sans-serif; }
.tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 8px; }
.table-btn { border-color: #e6ddd3; color: #4b3d34; transition: all 0.2s; }
.table-btn:hover { border-color: #d5b98f; }
.table-btn--selected { border-color: #c21204 !important; background: #fef2f0 !important; color: #c21204 !important; }
.no-tables-text { color: #7d7065; font-size: 13px; }
.empty-items-text { color: #7d7065; padding: 12px 0; }
.item-row { background: #faf5ee; border: 1px solid #eee3d6; }
.item-info { display: grid; gap: 2px; }
.item-name { color: #40342d; font-size: 14px; }
.item-price { color: #7d7065; font-size: 11px; }
.qty-btn { width: 26px; height: 26px; border-color: #ddd1c4; background: #fff; color: #4b3d34; }
.qty-value { min-width: 20px; }
.remove-btn { color: #c21204; }
.summary-label { color: #7d7065; }
.summary-value { color: #40342d; font-size: 18px; }
.submit-btn { min-height: 42px; letter-spacing: 0.1em; }

</style>
