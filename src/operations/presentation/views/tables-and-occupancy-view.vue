<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import useOperationsStore from '../../application/operations.store.js';
import TableStatCards from '../components/table-stat-cards.vue';
import TableCard from '../components/table-card.vue';
import AddTableDialog from '../components/add-table-dialog.vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

const { t } = useI18n();
const store = useOperationsStore();
const route = useRoute();
const router = useRouter();

const {
  tables, tablesByLocation, freeTables, occupiedTables, loading
} = storeToRefs(store);

const { fetchTables } = store;

const totalTables = computed(() => tables.value.length);
const freeCount = computed(() => freeTables.value.length);
const occupiedCount = computed(() => occupiedTables.value.length);
const occupiedPercent = computed(() => {
  if (totalTables.value === 0) return 0;
  return Math.round((occupiedCount.value / totalTables.value) * 100);
});

const filterState = ref('all');
const searchQuery = ref('');
const selectedLocation = ref('');

const locations = computed(() => {
  const locs = tables.value.map(t => t.location).filter(Boolean);
  return [...new Set(locs)].sort();
});



function locationLabel(loc) {
  const key = loc.toLowerCase().replace(/\s+/g, '_');
  return t(`operations.tablesAndOccupancyPage.locations.${key}`) || loc;
}

const filteredLocations = computed(() => {
  const grouped = {};
  Object.entries(tablesByLocation.value).forEach(([location, tbls]) => {
    const selectedLocName = selectedLocation.value || '';
    if (selectedLocName && location !== selectedLocName) return;

    let filtered = filterState.value === 'all'
        ? tbls
        : tbls.filter(t => t.state === filterState.value);

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      filtered = filtered.filter(t =>
          String(t.number).toLowerCase().includes(q) ||
          (t.location && t.location.toLowerCase().includes(q))
      );
    }
    if (filtered.length > 0) grouped[location] = filtered;
  });
  return grouped;
});

onMounted(() => {
  fetchTables();
});


</script>

<template>
  <section class="flex flex-column gap-3">
    <div class="flex justify-content-between align-items-start gap-3">
      <div>
        <span class="inline-block font-bold uppercase mb-1 kicker-text">{{ t('operations.tablesAndOccupancyPage.kicker') }}</span>
        <h1 class="font-bold m-0 page-title">{{ t('operations.tablesAndOccupancyPage.title') }}</h1>
        <p class="mt-2 page-desc">{{ t('operations.tablesAndOccupancyPage.description') }}</p>
      </div>
      <AddTableDialog />
    </div>
    <TableStatCards
        :total-tables="totalTables"
        :free-count="freeCount"
        :occupied-count="occupiedCount"
        :occupied-percent="occupiedPercent"
    />
    <div class="flex align-items-center gap-2 flex-wrap">
            <span class="flex align-items-center gap-1 p-2 border-1 bg-white border-round flex-1 search-box">
                <i class="pi pi-search search-icon" />
                <InputText
                    v-model="searchQuery"
                    :placeholder="t('operations.tablesAndOccupancyPage.searchPlaceholder')"
                    class="w-full border-none bg-transparent search-input"
                />
            </span>
      <Select
          v-model="selectedLocation"
          :options="locations"
          :placeholder="t('operations.tablesAndOccupancyPage.allLocations')"
          class="location-select"
          :showClear="true"
      />
      <div class="flex gap-1">
        <button type="button" class="cursor-pointer font-semibold border-round filter-btn" :class="{ 'filter-btn--active filter-btn--all': filterState === 'all' }" @click="filterState = 'all'">
          {{ t('operations.tablesAndOccupancyPage.all') }}
        </button>
        <button type="button" class="cursor-pointer font-semibold border-round filter-btn" :class="{ 'filter-btn--active filter-btn--free': filterState === 'available' }" @click="filterState = 'available'">
          {{ t('operations.tablesAndOccupancyPage.free') }}
        </button>
        <button type="button" class="cursor-pointer font-semibold border-round filter-btn" :class="{ 'filter-btn--active filter-btn--occupied': filterState === 'busy' }" @click="filterState = 'busy'">
          {{ t('operations.tablesAndOccupancyPage.occupied') }}
        </button>
      </div>
    </div>
    <div v-if="loading" class="flex justify-content-center py-5 loading-spinner">
      <i class="pi pi-spin pi-spinner" />
    </div>
    <div v-else-if="Object.keys(filteredLocations).length === 0" class="p-5 text-center bg-white border-round empty-state">
      <p>{{ t('operations.tablesAndOccupancyPage.noTables') }}</p>
    </div>
    <div v-else v-for="(tbls, location) in filteredLocations" :key="location" class="flex flex-column align-items-start gap-2">
      <h2 class="font-bold m-0 pb-1 location-title">{{ locationLabel(location) }}</h2>
      <div class="flex flex-wrap justify-content-start" :style="{ gap: '20px', width: '100%' }">
        <TableCard v-for="table in tbls" :key="table.id" :table="table" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.kicker-text { color: #a07832; font-size: 12px; letter-spacing: 0.08em; }
.page-title { color: #342923; font-size: clamp(2rem, 2.2vw, 2.4rem); font-family: 'Poppins', system-ui, sans-serif; }
.page-desc { color: #65594f; font-size: 14px; }
.loading-spinner { font-size: 24px; color: #a07832; }
.search-box { border-color: #ebe2d7; min-width: 180px; }
.search-icon { color: #a09489; }
.search-input { box-shadow: none !important; color: #40342d !important; }
.search-input::placeholder { color: #a09489 !important; }
/* Select styling */
.location-select {
  min-width: 160px;
}
.location-select :deep(.p-select-label) {
  color: #4b3d34;
  font-size: 13px;
  padding: 0.78rem 0.9rem;
}
.location-select :deep(.p-select-dropdown) {
  color: #4b3d34;
  width: 2rem;
}
.location-select :deep(.p-select) {
  padding: 0;
  border-color: #ebe2d7;
  min-height: 42px;
}
/* Filter buttons */
.filter-btn { padding: 8px 16px; border: 1px solid #e6ddd3; font-size: 13px; background: #fff; color: #4b3d34; transition: all 0.2s; }
.filter-btn--active.filter-btn--all { background: #2d241e; color: #fff; border-color: #2d241e; }
.filter-btn--active.filter-btn--free { background: #16a34a; color: #fff; border-color: #16a34a; }
.filter-btn--active.filter-btn--occupied { background: #dc2626; color: #fff; border-color: #dc2626; }
.empty-state { color: #7d7065; }
.location-title { color: #40342d; font-size: 18px; border-bottom: 2px solid #efe6da; font-family: 'Poppins', system-ui, sans-serif; }
</style>
