<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSubscriptionsStore } from '../../application/subscriptions.store.js';

const route = useRoute();
const router = useRouter();
const subscriptionsStore = useSubscriptionsStore();

const registrationId = computed(() => String(route.query.registration ?? ''));
const status = ref('');
const message = ref('');
const pollingHandle = ref(null);

async function refreshStatus() {
  if (!registrationId.value) {
    status.value = 'invalid';
    message.value = 'The registration reference is missing.';
    return;
  }

  const registration = await subscriptionsStore.fetchRegistrationStatus(registrationId.value);
  if (!registration) {
    status.value = 'failed';
    message.value = subscriptionsStore.error ?? 'The registration status could not be retrieved.';
    return;
  }

  status.value = registration.status;

  if (registration.status === 'Provisioned') {
    stopPolling();
    message.value = 'Payment confirmed. Redirecting to login...';
    await router.replace('/login');
    return;
  }

  if (registration.status === 'Failed' || registration.status === 'Expired') {
    stopPolling();
    message.value = 'The registration could not be completed. Please restart the process.';
    return;
  }

  message.value = 'We are confirming your payment and provisioning the account.';
}

function stopPolling() {
  if (pollingHandle.value) {
    window.clearInterval(pollingHandle.value);
    pollingHandle.value = null;
  }
}

onMounted(async () => {
  await refreshStatus();
  if (!['Provisioned', 'Failed', 'Expired', 'invalid'].includes(status.value)) {
    pollingHandle.value = window.setInterval(refreshStatus, 3000);
  }
});

onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <div class="auth-view">
    <main class="auth-container">
      <section class="status-card">
        <span class="status-card__eyebrow">Registration</span>
        <h1>Payment status</h1>
        <p class="status-card__message">{{ message }}</p>
        <p class="status-card__status">Current status: <strong>{{ status || 'Loading' }}</strong></p>
        <button v-if="status === 'Failed' || status === 'Expired' || status === 'invalid'" class="status-card__button" @click="router.push('/register')">
          Back to register
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: linear-gradient(180deg, #f6ede3 0%, #fbf7f2 100%);
}

.auth-container {
  width: 100%;
  max-width: 520px;
}

.status-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 2.5rem;
  box-shadow: 0 18px 44px rgba(43, 34, 24, 0.08);
  display: grid;
  gap: 1rem;
}

.status-card__eyebrow {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9a6a22;
  font-weight: 700;
}

.status-card h1 {
  margin: 0;
  color: #2f241d;
}

.status-card__message,
.status-card__status {
  margin: 0;
  color: #6e6157;
  line-height: 1.6;
}

.status-card__button {
  width: fit-content;
  border: none;
  border-radius: 12px;
  background: #2c2925;
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
