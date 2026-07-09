<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useProfilesStore from '../../../profiles/application/profiles.store.js';
import { useIamStore } from '../../../iam/application/iam-store.js';
import useSessionStore from '../../application/session.store.js';

const { t } = useI18n();
const profilesStore = useProfilesStore();
const iamStore = useIamStore();
const sessionStore = useSessionStore();

const currentProfile = ref(null);
const businessName = ref('');
const firstName = ref('');
const lastName = ref('');
const contactEmail = ref('');
const street = ref('');
const district = ref('');
const city = ref('');
const country = ref('');
const phone = ref('');
const category = ref('');
const operatingHours = ref('11:00 AM - 10:00 PM');
const minimumThreshold = ref('15%');
const supportContact = ref('');
const employeeLockPassword = ref('********');
const notificationEmail = ref(true);
const notificationSms = ref(false);
const restrictedMode = ref(true);
const selectedDays = ref(['M', 'T', 'W', 'T2', 'F', 'S']);
const demoState = ref('Inactive');
const profileLoading = ref(true);
const saving = ref(false);
const saveSuccess = ref(false);

onMounted(async () => {
    const userRole = sessionStore.userRole;
    const userId = iamStore.currentUser?.id;

    if (userRole === 'supplier') {
        await profilesStore.fetchSupplierProfiles();
        if (userId) {
            const profile = profilesStore.supplierProfiles.find(p => p.userId === userId);
            if (profile) {
                currentProfile.value = profile;
                businessName.value = profile.businessName || '';
                firstName.value = profile.firstName || '';
                lastName.value = profile.lastName || '';
                contactEmail.value = profile.contactEmail || '';
                street.value = profile.street || '';
                district.value = profile.district || '';
                city.value = profile.city || '';
                country.value = profile.country || '';
                phone.value = profile.phone || '';
                category.value = profile.category || '';
                supportContact.value = profile.phone || profile.contactEmail || '';
            }
        }
    } else {
        await profilesStore.fetchRestaurantProfiles();
        if (userId) {
            const profile = profilesStore.restaurantProfiles.find(p => p.userId === userId);
            if (profile) {
                currentProfile.value = profile;
                businessName.value = profile.businessName || '';
                firstName.value = profile.firstName || '';
                lastName.value = profile.lastName || '';
                contactEmail.value = profile.contactEmail || '';
                street.value = profile.street || '';
                district.value = profile.district || '';
                city.value = profile.city || '';
                country.value = profile.country || '';
                supportContact.value = profile.contactEmail || '';
            }
        }
    }
    profileLoading.value = false;
});

async function saveProfile() {
    if (!currentProfile.value || saving.value) return;

    saving.value = true;
    saveSuccess.value = false;
    const userRole = sessionStore.userRole;
    const profileId = currentProfile.value.id;

    try {
        if (userRole === 'supplier') {
            await profilesStore.updateSupplierProfile({
                id: profileId,
                businessName: businessName.value,
                firstName: firstName.value,
                lastName: lastName.value,
                street: street.value,
                district: district.value,
                city: city.value,
                country: country.value,
                contactEmail: contactEmail.value,
                phone: phone.value,
                category: category.value,
            });
        } else {
            await profilesStore.updateRestaurantProfile({
                id: profileId,
                businessName: businessName.value,
                firstName: firstName.value,
                lastName: lastName.value,
                street: street.value,
                district: district.value,
                city: city.value,
                country: country.value,
                contactEmail: contactEmail.value,
            });
        }
        saveSuccess.value = true;
        setTimeout(() => { saveSuccess.value = false; }, 3000);
    } catch (err) {
        console.error('Failed to save profile:', err);
    } finally {
        saving.value = false;
    }
}

const dayChips = [
  { id: 'M', label: 'M' },
  { id: 'T', label: 'T' },
  { id: 'W', label: 'W' },
  { id: 'T2', label: 'T' },
  { id: 'F', label: 'F' },
  { id: 'S', label: 'S' },
  { id: 'S2', label: 'S' }
];

function toggleDay(dayId) {
  if (selectedDays.value.includes(dayId)) {
    selectedDays.value = selectedDays.value.filter((value) => value !== dayId);
    return;
  }

  selectedDays.value = [...selectedDays.value, dayId];
}
</script>

<template>
  <section class="configuration-page">
    <header class="configuration-page__hero">
      <span class="configuration-page__kicker">{{ t('shared.configurationPage.kicker') }}</span>
      <h1 class="configuration-page__title">{{ t('shared.configurationPage.title') }}</h1>
      <p class="configuration-page__description">
        {{ t('shared.configurationPage.description') }}
      </p>
    </header>

    <div class="configuration-page__grid">
      <article class="settings-card settings-card--profile">
        <div class="settings-card__header">
          <h2>{{ t('shared.configurationPage.profile.title') }}</h2>
          <button type="button" :disabled="saving || !currentProfile" @click="saveProfile">
            {{ saving ? t('shared.configurationPage.profile.saving') : saveSuccess ? t('shared.configurationPage.profile.saved') : t('shared.configurationPage.profile.save') }}
          </button>
        </div>

        <label class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.name') }}</span>
          <input v-model="businessName" type="text">
        </label>

        <div class="settings-field-row">
          <label class="settings-field">
            <span>{{ t('shared.configurationPage.profile.fields.firstName') }}</span>
            <input v-model="firstName" type="text">
          </label>
          <label class="settings-field">
            <span>{{ t('shared.configurationPage.profile.fields.lastName') }}</span>
            <input v-model="lastName" type="text">
          </label>
        </div>

        <label class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.contactEmail') }}</span>
          <input v-model="contactEmail" type="email">
        </label>

        <div class="settings-field-row">
          <label class="settings-field">
            <span>{{ t('shared.configurationPage.profile.fields.street') }}</span>
            <input v-model="street" type="text">
          </label>
          <label class="settings-field">
            <span>{{ t('shared.configurationPage.profile.fields.district') }}</span>
            <input v-model="district" type="text">
          </label>
        </div>

        <div class="settings-field-row">
          <label class="settings-field">
            <span>{{ t('shared.configurationPage.profile.fields.city') }}</span>
            <input v-model="city" type="text">
          </label>
          <label class="settings-field">
            <span>{{ t('shared.configurationPage.profile.fields.country') }}</span>
            <input v-model="country" type="text">
          </label>
        </div>

        <label v-if="sessionStore.userRole === 'supplier'" class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.phone') }}</span>
          <input v-model="phone" type="text">
        </label>

        <label v-if="sessionStore.userRole === 'supplier'" class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.category') }}</span>
          <input v-model="category" type="text">
        </label>

        <label class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.contact') }}</span>
          <input v-model="supportContact" type="text">
        </label>

        <div class="settings-toggles">
          <label class="settings-toggle">
            <input v-model="notificationEmail" type="checkbox">
            <span class="settings-toggle__slider"></span>
            <span>{{ t('shared.configurationPage.profile.fields.email') }}</span>
          </label>

          <label class="settings-toggle">
            <input v-model="notificationSms" type="checkbox">
            <span class="settings-toggle__slider"></span>
            <span>{{ t('shared.configurationPage.profile.fields.sms') }}</span>
          </label>
        </div>
      </article>

      <div class="configuration-page__side">
        <article class="settings-card">
          <label class="settings-field settings-field--select">
            <span>{{ t('shared.configurationPage.demo.state') }}</span>
            <div class="settings-field__select-shell">
              <select v-model="demoState">
                <option :value="t('shared.configurationPage.demo.options.inactive')">{{ t('shared.configurationPage.demo.options.inactive') }}</option>
                <option :value="t('shared.configurationPage.demo.options.active')">{{ t('shared.configurationPage.demo.options.active') }}</option>
              </select>
              <i class="pi pi-chevron-down"></i>
            </div>
          </label>

          <div class="settings-card__divider"></div>

          <div class="settings-card__header">
            <h2>{{ t('shared.configurationPage.lock.title') }}</h2>
            <button type="button">{{ t('shared.configurationPage.profile.save') }}</button>
          </div>

          <label class="settings-toggle settings-toggle--full">
            <span>{{ t('shared.configurationPage.lock.restrictedMode') }}</span>
            <input v-model="restrictedMode" type="checkbox">
            <span class="settings-toggle__slider"></span>
          </label>

          <label class="settings-field">
            <span>{{ t('shared.configurationPage.lock.password') }}</span>
            <div class="settings-field__password-shell">
              <input v-model="employeeLockPassword" type="text">
              <i class="pi pi-eye-slash"></i>
            </div>
          </label>

          <div class="settings-callout">
            <i class="pi pi-info-circle"></i>
            <p>{{ t('shared.configurationPage.lock.callout') }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.configuration-page {
  --configuration-accent: var(--secondary-color);
  --configuration-title: var(--text-h);
  --configuration-body: var(--text-color);
  --configuration-muted: var(--text);
  --configuration-surface: var(--bg);
  --configuration-surface-subtle: var(--bg-color);
  --configuration-border: var(--border);
  --configuration-shadow: var(--shadow);
  --configuration-action-bg: var(--text-color);
  --configuration-action-fg: var(--bg);
  --configuration-track: var(--border);
  --configuration-checked: var(--primary-color);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.configuration-page__hero {
  padding: 6px 0 0;
}

.configuration-page__kicker {
  display: inline-block;
  color: var(--configuration-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.configuration-page__title {
  margin: 10px 0 8px;
  color: var(--configuration-title);
  font-size: clamp(2.6rem, 4vw, 3.3rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.configuration-page__description {
  color: var(--configuration-body);
  font-size: 1.03rem;
}

.configuration-page__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  align-items: start;
}

.configuration-page__side {
  display: grid;
  gap: 18px;
}

.settings-card {
  background: var(--configuration-surface);
  border: 1px solid var(--configuration-border);
  border-radius: 18px;
  box-shadow: var(--configuration-shadow);
  padding: 18px 20px;
}

.settings-card--profile {
  min-height: 580px;
}

.settings-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.settings-card__header--simple {
  margin-bottom: 12px;
}

.settings-card__header h2 {
  margin: 0;
  color: var(--configuration-title);
  font-size: 1.1rem;
  font-weight: 700;
}

.settings-card__header button {
  min-height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: var(--configuration-action-bg);
  color: var(--configuration-action-fg);
  font-weight: 600;
  cursor: pointer;
}

.settings-card__header button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.settings-field {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.settings-field span {
  color: var(--configuration-body);
  font-size: 0.95rem;
}

.settings-field input,
.settings-field__select-shell,
.settings-field__password-shell {
  min-height: 50px;
  border: 1px solid var(--configuration-border);
  border-radius: 10px;
  background: var(--configuration-surface);
}

.settings-field input {
  padding: 0 12px;
  color: var(--configuration-body);
}

.settings-day-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-day-list button {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: var(--configuration-track);
  color: var(--configuration-action-fg);
  font-weight: 700;
  cursor: pointer;
}

.settings-day-list__day--active {
  background: var(--configuration-action-bg) !important;
}

.settings-toggles {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

.settings-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--configuration-body);
  cursor: pointer;
}

.settings-toggle input {
  display: none;
}

.settings-toggle__slider {
  position: relative;
  width: 32px;
  height: 20px;
  border-radius: 999px;
  background: var(--configuration-track);
  transition: background 0.2s ease;
}

.settings-toggle__slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--configuration-surface);
  transition: transform 0.2s ease;
}

.settings-toggle input:checked + .settings-toggle__slider {
  background: var(--configuration-checked);
}

.settings-toggle input:checked + .settings-toggle__slider::after {
  transform: translateX(12px);
}

.settings-field__select-shell,
.settings-field__password-shell {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.settings-field__select-shell select,
.settings-field__password-shell input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--configuration-body);
  font-size: 1rem;
}

.settings-field__select-shell i,
.settings-field__password-shell i {
  color: var(--configuration-muted);
}

.settings-card__divider {
  height: 1px;
  margin: 8px 0 18px;
  background: var(--configuration-border);
}

.settings-toggle--full {
  justify-content: space-between;
  width: 100%;
  margin-bottom: 14px;
}

.settings-callout {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 10px;
  background: var(--configuration-surface-subtle);
  color: var(--configuration-body);
}

@media (max-width: 1120px) {
  .configuration-page__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .settings-toggles {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
