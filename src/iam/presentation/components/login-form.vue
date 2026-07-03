<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useIamStore } from '../../application/iam-store.js';
import { useI18n } from 'vue-i18n';
import useSessionStore from '../../../shared/application/session.store.js';
import { getHomeByRole, normalizeRole } from '../../../shared/application/role-routing.js';

const { t } = useI18n();
const router = useRouter();
const iamStore = useIamStore();
const sessionStore = useSessionStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false);

const errors = computed(() => {
  return {
    email: !email.value.includes('@') && submitted.value,
    password: !password.value && submitted.value
  };
});

const handleLogin = async () => {
  submitted.value = true;
  if (!email.value.includes('@') || !password.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  
  const success = await iamStore.login(email.value, password.value);
  
  if (success) {
    const userRole = normalizeRole(iamStore.currentUser?.role);
    sessionStore.setUserRole(userRole);
    router.push(getHomeByRole(userRole));
  } else {
    errorMessage.value = iamStore.error || t('access.validation.invalid-credentials');
  }
  
  loading.value = false;
};
</script>

<template>
  <div class="auth-card">
    <div class="logo-container">
      <img src="/images/supplywok-logo.png" alt="SupplyWok Logo" class="logo" />
      <div class="logo-text">
        <span class="logo-text-supply">SUPPLY</span>
        <span class="logo-text-wok">WOK</span>
      </div>
    </div>
    
    <h1 class="welcome-text">{{ t('access.log-in.welcome') }}</h1>
    
    <p class="signup-prompt">
      {{ t('access.log-in.new-supply') }} 
      <router-link to="/register" class="link-primary">{{ t('access.log-in.sign-up-now') }}</router-link>
    </p>

    <form @submit.prevent="handleLogin" class="form-container">
      <div class="field">
        <label for="email">{{ t('access.log-in.email') }}</label>
        <pv-input-text 
          id="email" 
          v-model="email" 
          type="email" 
          :placeholder="t('access.log-in.email-example')" 
          :invalid="errors.email"
          fluid 
        />
        <small v-if="errors.email" class="error-msg">{{ t('access.validation.email-invalid') }}</small>
      </div>

      <div class="field">
        <label for="password">{{ t('access.log-in.password') }}</label>
        <pv-input-text 
          id="password" 
          v-model="password" 
          type="password" 
          :placeholder="t('access.log-in.password-example')" 
          :invalid="errors.password"
          fluid 
        />
      </div>

      <div class="forgot-password">
        <a href="#" class="link-secondary">{{ t('access.log-in.forgot-password') }}</a>
      </div>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <pv-button 
        type="submit" 
        :label="t('access.log-in.login')" 
        class="submit-button" 
        :loading="loading"
        fluid
      />
    </form>
  </div>
</template>

<style scoped>
.auth-card {
  background: #ffffff !important;
  padding: 2.5rem;
  border-radius: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  color: #1a1a1a !important;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.logo {
  height: 55px;
  object-fit: contain;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  line-height: 1.1;
  letter-spacing: 0.5px;
}

.logo-text-supply {
  color: #000000;
}

.logo-text-wok {
  color: #c0392b;
}

.welcome-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.signup-prompt {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.link-primary {
  color: #c0392b;
  text-decoration: underline;
  font-weight: 600;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

:deep(.p-inputtext) {
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  background-color: #f9f9f9 !important;
  border: 1px solid #e0e0e0 !important;
  color: #1a1a1a !important;
}

:deep(.p-inputtext.p-invalid) {
  border-color: #e74c3c !important;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 2px;
}

.forgot-password {
  text-align: center;
  margin-top: 0.25rem;
}

.link-secondary {
  color: #c0392b;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: underline;
}

.submit-button {
  background-color: #2c2925 !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 0.75rem !important;
  font-weight: 700 !important;
  margin-top: 0.5rem;
  color: #ffffff !important;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  text-align: center;
}
</style>
