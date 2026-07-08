<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Layout from './shared/presentation/components/layout.vue';

const route = useRoute();

/**
 * Authentication screens must bypass the shell layout.
 * Otherwise the auth cards render inside the application chrome and break navigation.
 */
const isAuthRoute = computed(() => ['login', 'register', 'register-complete'].includes(String(route.name ?? '')));
</script>

<template>
  <router-view v-if="isAuthRoute" />
  <Layout v-else />
</template>
