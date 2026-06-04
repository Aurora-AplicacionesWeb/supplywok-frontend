<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import useOperationsStore from '../../application/operations.store.js';

const { t } = useI18n();
const store = useOperationsStore();
const route = useRoute();
const router = useRouter();

const locationOptions = ['Main Hall', 'Bar', 'Terrace'];
const statusOptions = ['available', 'busy'];

const newTable = ref({
  number: '',
  capacity: 4,
  location: '',
  state: 'available'
});

const isEditing = computed(() => /\/operations\/tables\/\d+\/edit$/.test(route.path));

const visible = computed({
  get: () => route.path === '/operations/tables/new' || isEditing.value,
  set: (visible) => {
    if (visible) {
      router.push('/operations/tables/new');
    } else {
      router.push('/operations/tables');
    }
  }
});

watch(() => route.path, (path) => {
  if (/\/operations\/tables\/\d+\/edit$/.test(path)) {
    const table = store.tables.find(t => String(t.id) === route.params.tableId);
    if (table) {
      newTable.value = {
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        state: table.state
      };
    }
  } else {
    newTable.value = { number: '', capacity: 4, location: '', state: 'available' };
  }
});

function open() {
  newTable.value = { number: '', capacity: 4, location: '', state: 'available' };
  router.push('/operations/tables/new');
}

function handleSave() {
  if (!newTable.value.number) return;
  const data = {
    number: newTable.value.number,
    capacity: newTable.value.capacity,
    location: newTable.value.location || 'Main Hall',
    state: newTable.value.state,
    active: true
  };
  const action = isEditing.value
      ? store.updateTable(route.params.tableId, data)
      : store.addTable(data);
  action.then(() => {
    router.push('/operations/tables');
    store.fetchTables();
  });
}
</script>

<template>
  <Button
      :label="t('operations.tablesAndOccupancyPage.addTable')"
      icon="pi pi-plus"
      severity="danger"
      @click="open"
  />

  <pv-dialog
      v-model:visible="visible"
      modal
      :header="isEditing ? t('operations.tablesAndOccupancyPage.editTable') : t('operations.tablesAndOccupancyPage.addTable')"
      :style="{ width: 'min(420px, calc(100vw - 32px))' }"
      :draggable="false"
  >
    <div class="flex flex-column gap-4 p-4">
      <div class="flex flex-column gap-1">
        <label class="dialog-label">{{ t('operations.tablesAndOccupancyPage.tableNumber') }}</label>
        <InputText v-model="newTable.number" :placeholder="t('operations.tablesAndOccupancyPage.tableNumber')" />
      </div>
      <div class="flex flex-column gap-1">
        <label class="dialog-label">{{ t('operations.tablesAndOccupancyPage.capacity') }}</label>
        <InputNumber v-model="newTable.capacity" :min="1" :max="20" class="w-full" />
      </div>
      <div class="flex flex-column gap-1">
        <label class="dialog-label">{{ t('operations.tablesAndOccupancyPage.location') }}</label>
        <Select v-model="newTable.location" :options="locationOptions" :placeholder="t('operations.tablesAndOccupancyPage.location')" :showClear="true" class="w-full" />
      </div>
      <div class="flex flex-column gap-1">
        <label class="dialog-label">{{ t('operations.tablesAndOccupancyPage.state') }}</label>
        <Select v-model="newTable.state" :options="statusOptions" class="w-full" />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button
            :label="t('operations.tablesAndOccupancyPage.cancel')"
            severity="secondary"
            outlined
            @click="visible = false"
        />
        <Button
            :label="isEditing ? t('operations.tablesAndOccupancyPage.confirmUpdateTable') : t('operations.tablesAndOccupancyPage.confirmAddTable')"
            severity="danger"
            @click="handleSave"
            :disabled="!newTable.number"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.dialog-label { font-size: 13px; font-weight: 600; color: #40342d; }
</style>
