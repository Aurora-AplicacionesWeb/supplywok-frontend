<script setup>
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';

const props = defineProps({
  dish: { type: Object, required: true },
  compact: { type: Boolean, default: false }
});

const emit = defineEmits(['add-to-order']);
const { t } = useI18n();
</script>

<template>
  <article
      class="flex justify-content-between gap-3 bg-white border-round shadow-1 border-1"
      :style="{
            padding: props.compact ? '10px 12px' : '16px',
            borderColor: '#f0e8dd'
        }"
  >
    <div class="flex-1" :style="{ minWidth: 0 }">
      <div class="flex align-items-center gap-1">
        <h3
            class="font-semibold m-0 font-heading"
            :style="{ color: '#40342d', fontSize: props.compact ? '13px' : '15px' }"
        >{{ dish.name }}</h3>
        <span v-if="dish.outstanding" :style="{ color: '#e9b824', fontSize: '11px' }">
                    <i class="pi pi-star-fill" />
                </span>
      </div>
      <p v-if="!compact" class="m-0 mt-1" :style="{ color: '#7d7065', fontSize: '12px', lineHeight: 1.4 }">{{ dish.description }}</p>
      <div class="mt-2">
                <span
                    class="font-bold"
                    :style="{
                        color: '#c21204',
                        fontSize: props.compact ? '13px' : '15px'
                    }"
                >S/ {{ dish.price.toFixed(2) }}</span>
      </div>
    </div>
    <div class="flex align-items-end">
      <Button
          :label="props.compact ? '' : t('operations.dishMenuPage.addToOrder')"
          icon="pi pi-plus"
          severity="danger"
          :text="props.compact"
          :rounded="props.compact"
          :size="props.compact ? 'small' : undefined"
          :style="props.compact ? { width: '32px', height: '32px' } : {}"
          @click="emit('add-to-order', dish)"
      />
    </div>
  </article>
</template>

<style scoped>
.font-heading {
  font-family: 'Poppins', system-ui, sans-serif;
}
</style>
