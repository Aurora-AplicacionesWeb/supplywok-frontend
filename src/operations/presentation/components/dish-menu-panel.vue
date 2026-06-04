<script setup>
import { useI18n } from 'vue-i18n';
import DishCard from './dish-card.vue';

defineProps({
  dishesByCategory: { type: Object, required: true }
});

const emit = defineEmits(['add-dish', 'close']);
const { t } = useI18n();

function categoryLabel(cat) {
  const key = cat.name.toLowerCase().replace(/\s+/g, '_');
  return t(`operations.dishMenuPage.categories.${key}`) || cat.name;
}
</script>

<template>
  <div class="bg-white border-round shadow-1 p-3 menu-panel">
    <div class="flex justify-content-between align-items-center mb-2">
      <h3 class="m-0 font-semibold menu-title">{{ t('operations.dishMenuPage.title') }}</h3>
      <button type="button" class="border-none bg-transparent cursor-pointer menu-close" @click="emit('close')">
        <i class="pi pi-times" />
      </button>
    </div>
    <div v-for="group in dishesByCategory" :key="group.category.id" class="mb-3">
      <h4 class="m-0 mb-2 font-semibold pb-1 menu-category">{{ categoryLabel(group.category) }}</h4>
      <div class="menu-grid">
        <DishCard
            v-for="dish in group.dishes"
            :key="dish.id"
            :dish="dish"
            compact
            @add-to-order="emit('add-dish', dish)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-panel { max-height: 80vh; overflow-y: auto; }
.menu-title { color: #40342d; font-family: 'Poppins', system-ui, sans-serif; }
.menu-close { color: #7d7065; font-size: 18px; }
.menu-category { color: #65594f; font-size: 14px; border-bottom: 1px solid #efe6da; }
.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
</style>
