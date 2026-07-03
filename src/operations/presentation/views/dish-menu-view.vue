<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import useOperationsStore from '../../application/operations.store.js';
import DishCard from '../components/dish-card.vue';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';

const { t } = useI18n();
const router = useRouter();
const store = useOperationsStore();

const { dishes, dishCategories, dishesByCategory, loading, errors } = storeToRefs(store);
const { fetchDishes, fetchDishCategories, addItemToOrder } = store;

const searchQuery = ref('');
const selectedCategoryId = ref(null);

const filteredDishesByCategory = computed(() => {
  const entries = Object.entries(dishesByCategory.value);
  return entries
      .filter(([_, group]) => {
        if (selectedCategoryId.value && Number(selectedCategoryId.value) !== group.category.id) return false;
        return true;
      })
      .map(([id, group]) => ({
        ...group,
        dishes: group.dishes.filter(d => {
          if (!searchQuery.value.trim()) return true;
          const q = searchQuery.value.toLowerCase();
          return d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
        })
      }))
      .filter(group => group.dishes.length > 0);
});

function categoryLabel(cat) {
  const key = cat.name.toLowerCase().replace(/\s+/g, '_');
  return t(`operations.dishMenuPage.categories.${key}`) || cat.name;
}

function handleAddToOrder(dish) {
  addItemToOrder(dish, 1, '');
  router.push({ name: 'create-kitchen-order-view' });
}

onMounted(() => {
  if (dishes.value.length === 0) fetchDishes();
  if (dishCategories.value.length === 0) fetchDishCategories();
});
</script>

<template>
  <section class="flex flex-column gap-3">
    <div class="flex justify-content-between align-items-start gap-3">
      <div>
        <span class="inline-block font-bold uppercase mb-1 kicker-text">{{ t('operations.dishMenuPage.kicker') }}</span>
        <h1 class="font-bold m-0 page-title">{{ t('operations.dishMenuPage.title') }}</h1>
        <p class="mt-2 page-desc">{{ t('operations.dishMenuPage.description') }}</p>
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

    <div class="flex align-items-center gap-2 flex-wrap">
            <span class="flex align-items-center gap-1 p-2 border-1 bg-white border-round flex-1 search-box">
                <i class="pi pi-search search-icon" />
                <InputText
                    v-model="searchQuery"
                    :placeholder="t('operations.dishMenuPage.searchPlaceholder')"
                    class="w-full border-none bg-transparent search-input"
                />
            </span>

      <select v-model="selectedCategoryId" class="border-1 bg-white border-round category-select">
        <option :value="null">{{ t('operations.dishMenuPage.category') }}: {{ t('operations.tablesAndOccupancyPage.all') }}</option>
        <option v-for="cat in dishCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-content-center py-5 loading-spinner">
      <i class="pi pi-spin pi-spinner" />
    </div>

    <div v-else-if="filteredDishesByCategory.length === 0" class="p-5 text-center bg-white border-round empty-state">
      <p>{{ t('operations.dishMenuPage.noDishes') }}</p>
    </div>

    <div v-else v-for="group in filteredDishesByCategory" :key="group.category.id" class="flex flex-column gap-2">
      <h2 class="font-bold m-0 pb-1 category-title">{{ categoryLabel(group.category) }}</h2>
      <div class="dish-grid">
        <DishCard
            v-for="dish in group.dishes"
            :key="dish.id"
            :dish="dish"
            @add-to-order="handleAddToOrder"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.kicker-text { color: #a07832; font-size: 12px; letter-spacing: 0.08em; }
.page-title { color: #342923; font-size: clamp(2rem, 2.2vw, 2.4rem); font-family: 'Poppins', system-ui, sans-serif; }
.page-desc { color: #65594f; font-size: 14px; }
.loading-spinner { font-size: 24px; color: #a07832; }
.search-box { border-color: #ebe2d7; min-width: 200px; }
.search-icon { color: #a09489; }
.search-input { box-shadow: none !important; color: #40342d !important; }
.search-input::placeholder { color: #a09489 !important; }
.category-select { padding: 0.78rem 0.9rem; color: #4b3d34; min-width: 160px; border-color: #ebe2d7; }
.empty-state { color: #7d7065; }
.category-title { color: #40342d; font-size: 18px; border-bottom: 2px solid #efe6da; font-family: 'Poppins', system-ui, sans-serif; }
.dish-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
</style>
