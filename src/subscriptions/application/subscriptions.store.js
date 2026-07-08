import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SubscriptionsApi } from '../infrastructure/subscriptions.api.js';

const subscriptionsApi = new SubscriptionsApi();

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const loading = ref(false);
  const error = ref(null);
  const currentRegistration = ref(null);

  const startRegistration = async (registrationData) => {
    loading.value = true;
    error.value = null;
    try {
      const registration = await subscriptionsApi.startRegistration(registrationData);
      currentRegistration.value = registration;
      return registration;
    } catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Registration could not be started.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchRegistrationStatus = async (registrationId) => {
    loading.value = true;
    error.value = null;
    try {
      const registration = await subscriptionsApi.getRegistrationStatus(registrationId);
      currentRegistration.value = registration;
      return registration;
    } catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Registration status could not be loaded.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    currentRegistration,
    startRegistration,
    fetchRegistrationStatus
  };
});
