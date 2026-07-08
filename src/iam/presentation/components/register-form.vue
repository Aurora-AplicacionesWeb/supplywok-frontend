<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSubscriptionsStore } from '../../../subscriptions/application/subscriptions.store.js';

const { t } = useI18n();
const subscriptionsStore = useSubscriptionsStore();

const email = ref('');
const password = ref('');
const businessName = ref('');
const firstName = ref('');
const lastName = ref('');
const street = ref('');
const district = ref('');
const city = ref('');
const contactEmail = ref('');
const phone = ref('');
const category = ref('');
const role = ref(null);
const planCode = ref(null);
const termsAccepted = ref(false);

const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false);

const roles = computed(() => [
  { label: t('access.register.role-restaurant'), value: 'restaurant' },
  { label: t('access.register.role-supplier'), value: 'supplier' }
]);

const subscriptions = computed(() => [
  { label: t('access.register.subscription-premium'), value: 'Premium' },
  { label: t('access.register.subscription-enterprise'), value: 'Enterprise' }
]);

const isSupplier = computed(() => role.value === 'supplier');

const errors = computed(() => {
  return {
    email: !email.value.includes('@') && submitted.value,
    password: password.value.length < 8 && submitted.value,
    businessName: !businessName.value && submitted.value,
    firstName: !firstName.value && submitted.value,
    lastName: !lastName.value && submitted.value,
    street: !street.value && submitted.value,
    district: !district.value && submitted.value,
    city: !city.value && submitted.value,
    contactEmail: !contactEmail.value.includes('@') && submitted.value,
    phone: isSupplier.value && !phone.value && submitted.value,
    category: isSupplier.value && !category.value && submitted.value,
    role: !role.value && submitted.value,
    subscription: !planCode.value && submitted.value,
    terms: !termsAccepted.value && submitted.value
  };
});

const isFormValid = computed(() => {
  const baseValid = email.value.includes('@') &&
    password.value.length >= 8 &&
    businessName.value.length > 0 &&
    firstName.value.length > 0 &&
    lastName.value.length > 0 &&
    street.value.length > 0 &&
    district.value.length > 0 &&
    city.value.length > 0 &&
    contactEmail.value.includes('@') &&
    role.value &&
    planCode.value &&
    termsAccepted.value;

  if (!baseValid) return false;
  if (!isSupplier.value) return true;
  return phone.value.length > 0 && category.value.length > 0;
});

const handleRegister = async () => {
  submitted.value = true;
  if (!isFormValid.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  const registrationData = {
    email: email.value,
    password: password.value,
    businessName: businessName.value,
    firstName: firstName.value,
    lastName: lastName.value,
    street: street.value,
    district: district.value,
    city: city.value,
    country: 'Peru',
    contactEmail: contactEmail.value,
    phone: phone.value || null,
    category: category.value || null,
    role: role.value,
    planCode: planCode.value
  };

  const registration = await subscriptionsStore.startRegistration(registrationData);

  if (registration?.checkoutUrl) {
    window.location.href = registration.checkoutUrl;
  } else {
    errorMessage.value = subscriptionsStore.error || t('access.register.registration-failed');
  }
  
  loading.value = false;
};

const landingUrl = 'https://aurora-aplicacionesweb.github.io/SupplyWok-Landing-Page/';
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
    
    <h1 class="welcome-text">{{ t('access.register.get-started') }}</h1>

    <form @submit.prevent="handleRegister" class="form-container">
      <div class="field-grid">
        <div class="field">
          <label for="businessName">Business name</label>
          <pv-input-text
            id="businessName"
            v-model="businessName"
            type="text"
            :invalid="errors.businessName"
            fluid
          />
        </div>

        <div class="field">
          <label for="contactEmail">Contact email</label>
          <pv-input-text
            id="contactEmail"
            v-model="contactEmail"
            type="email"
            :invalid="errors.contactEmail"
            fluid
          />
        </div>
      </div>

      <div class="field-grid">
        <div class="field">
          <label for="firstName">First name</label>
          <pv-input-text
            id="firstName"
            v-model="firstName"
            type="text"
            :invalid="errors.firstName"
            fluid
          />
        </div>

        <div class="field">
          <label for="lastName">Last name</label>
          <pv-input-text
            id="lastName"
            v-model="lastName"
            type="text"
            :invalid="errors.lastName"
            fluid
          />
        </div>
      </div>

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
        <small v-if="errors.password" class="error-msg">{{ t('access.validation.password-min') }}</small>
      </div>

      <div class="field-grid">
        <div class="field">
          <label for="street">Street</label>
          <pv-input-text
            id="street"
            v-model="street"
            type="text"
            :invalid="errors.street"
            fluid
          />
        </div>

        <div class="field">
          <label for="district">District</label>
          <pv-input-text
            id="district"
            v-model="district"
            type="text"
            :invalid="errors.district"
            fluid
          />
        </div>
      </div>

      <div class="field">
        <label for="city">City</label>
        <pv-input-text
          id="city"
          v-model="city"
          type="text"
          :invalid="errors.city"
          fluid
        />
      </div>

      <div class="field-grid">
        <div class="field">
          <label for="role">{{ t('access.register.role') }}</label>
          <pv-select
            id="role"
            v-model="role"
            :options="roles"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('access.register.select-one')"
            :invalid="errors.role"
            panelClass="custom-select-panel"
            fluid
          />
        </div>

        <div class="field">
          <label for="subscription">{{ t('access.register.subscription') }}</label>
          <pv-select
            id="subscription"
            v-model="planCode"
            :options="subscriptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('access.register.select-one')"
            :invalid="errors.subscription"
            panelClass="custom-select-panel"
            fluid
          />
        </div>
      </div>

      <div v-if="isSupplier" class="field-grid">
        <div class="field">
          <label for="phone">{{ t('access.register.phone') }}</label>
          <pv-input-text
            id="phone"
            v-model="phone"
            type="text"
            :placeholder="t('access.register.phone-example')"
            :invalid="errors.phone"
            fluid
          />
          <small v-if="errors.phone" class="error-msg">{{ t('access.validation.phone-invalid') }}</small>
        </div>

        <div class="field">
          <label for="category">Category</label>
          <pv-input-text
            id="category"
            v-model="category"
            type="text"
            :invalid="errors.category"
            fluid
          />
        </div>
      </div>

      <p class="plans-help">
        {{ t('access.register.no-plans') }} 
        <a :href="landingUrl" target="_blank" class="link-secondary">{{ t('access.register.click-here') }}</a>
      </p>

      <div class="terms-container">
        <pv-checkbox v-model="termsAccepted" :binary="true" inputId="terms" :invalid="errors.terms" />
        <label for="terms" class="terms-label" v-html="t('access.register.terms-accept', { 
            terms: `<a href='${landingUrl}' target='_blank'>${t('access.register.terms')}</a>`, 
            policy: `<a href='${landingUrl}' target='_blank'>${t('access.register.policy')}</a>` 
          })">
        </label>
      </div>
      <small v-if="errors.terms" class="error-msg text-center">{{ t('access.validation.terms-required') }}</small>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <pv-button 
        type="submit" 
        :label="t('access.register.go-to-pay')" 
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
  padding: 2rem 2.5rem;
  border-radius: 40px;
  width: 100%;
  max-width: 760px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  color: #1a1a1a !important;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.logo {
  height: 50px;
  object-fit: contain;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 1.25rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.field label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

:deep(.p-inputtext), :deep(.p-select) {
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  background-color: #f9f9f9 !important;
  border: 1px solid #e0e0e0 !important;
  color: #1a1a1a !important;
}

:deep(.p-inputtext.p-invalid), :deep(.p-select.p-invalid) {
  border-color: #e74c3c !important;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.7rem;
  margin-top: 2px;
}

.text-center {
  text-align: center;
}

.plans-help {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  margin-top: 0.25rem;
}

.link-secondary {
  color: #c0392b;
  font-weight: 600;
  text-decoration: underline;
}

.terms-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.terms-label {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.3;
}

.terms-label :deep(a) {
  color: #c0392b;
  text-decoration: underline;
  font-weight: 600;
}

.submit-button {
  background-color: #2c2925 !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 0.75rem !important;
  font-weight: 700 !important;
  margin-top: 0.25rem;
  color: #ffffff !important;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #e74c3c;
  font-size: 0.8rem;
  text-align: center;
}

@media (max-width: 640px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Global styles for the dropdown panel to force light mode */
.custom-select-panel {
  background: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
}
.custom-select-panel .p-select-option {
  color: #1a1a1a !important;
}
.custom-select-panel .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
  background: #f4f0e6 !important;
  color: #1a1a1a !important;
}
.custom-select-panel .p-select-option-selected {
  background: #e9f5ec !important;
  color: #1a1a1a !important;
}
</style>
