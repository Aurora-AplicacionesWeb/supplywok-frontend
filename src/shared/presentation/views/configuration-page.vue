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

const restaurantProfile = ref('');
const contactName = ref('');
const contactEmail = ref('');
const address = ref('');
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

onMounted(async () => {
    const userRole = sessionStore.userRole;
    const userId = iamStore.currentUser?.id;

    if (userRole === 'supplier') {
        await profilesStore.fetchSupplierProfiles();
        if (userId) {
            const profile = profilesStore.supplierProfiles.find(p => p.userId === userId);
            if (profile) {
                restaurantProfile.value = profile.businessName || '';
                contactName.value = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
                contactEmail.value = profile.contactEmail || '';
                address.value = [profile.street, profile.district, profile.city, profile.country].filter(Boolean).join(', ');
                supportContact.value = profile.phone || profile.contactEmail || '';
            }
        }
    } else {
        await profilesStore.fetchRestaurantProfiles();
        if (userId) {
            const profile = profilesStore.restaurantProfiles.find(p => p.userId === userId);
            if (profile) {
                restaurantProfile.value = profile.businessName || '';
                contactName.value = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
                contactEmail.value = profile.contactEmail || '';
                address.value = [profile.street, profile.district, profile.city, profile.country].filter(Boolean).join(', ');
                supportContact.value = profile.contactEmail || '';
            }
        }
    }
    profileLoading.value = false;
});

const dayChips = [
  { id: 'M', label: 'M' },
  { id: 'T', label: 'T' },
  { id: 'W', label: 'W' },
  { id: 'T2', label: 'T' },
  { id: 'F', label: 'F' },
  { id: 'S', label: 'S' },
  { id: 'S2', label: 'S' }
];

const users = [
  { initials: 'LZ', name: 'Lucia Zhao', role: 'Manager' },
  { initials: 'MH', name: 'Marco Huaman', role: 'Chef' },
  { initials: 'AW', name: 'Ana Wong', role: 'Inventory' }
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
          <button type="button">{{ t('shared.configurationPage.profile.save') }}</button>
        </div>

        <label class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.name') }}</span>
          <input v-model="restaurantProfile" type="text">
        </label>

        <label class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.hours') }}</span>
          <input v-model="operatingHours" type="text">
        </label>

        <label class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.thresholds') }}</span>
          <input v-model="minimumThreshold" type="text">
        </label>

        <div class="settings-field">
          <span>{{ t('shared.configurationPage.profile.fields.days') }}</span>
          <div class="settings-day-list">
            <button
              v-for="day in dayChips"
              :key="day.id"
              type="button"
              :class="{ 'settings-day-list__day--active': selectedDays.includes(day.id) }"
              @click="toggleDay(day.id)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>

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
          <div class="settings-card__header settings-card__header--simple">
            <h2>{{ t('shared.configurationPage.users.title') }}</h2>
          </div>

          <div class="user-list">
            <article v-for="user in users" :key="user.name" class="user-list__row">
              <div class="user-list__identity">
                <span class="user-list__avatar">{{ user.initials }}</span>
                <div>
                  <strong>{{ user.name }}</strong>
                  <small>{{ user.role }}</small>
                </div>
              </div>
              <span class="user-list__badge">{{ t('shared.configurationPage.users.status.active') }}</span>
            </article>
          </div>
        </article>

        <article class="settings-card">
          <label class="settings-field settings-field--select">
            <span>{{ t('shared.configurationPage.demo.state') }}</span>
            <div class="settings-field__select-shell">
              <select v-model="demoState">
                <option>Inactive</option>
                <option>Active</option>
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
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.configuration-page__hero {
  padding: 6px 0 0;
}

.configuration-page__kicker {
  display: inline-block;
  color: #a07832;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.configuration-page__title {
  margin: 10px 0 8px;
  color: #221b2a;
  font-size: clamp(2.5rem, 4vw, 3.2rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.configuration-page__description {
  color: #5b5247;
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
  background: #ffffff;
  border: 1px solid #e3d4c5;
  border-radius: 18px;
  box-shadow: 0 16px 34px rgba(47, 36, 29, 0.1);
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
  color: #2c2328;
  font-size: 1.1rem;
  font-weight: 700;
}

.settings-card__header button {
  min-height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #2d241e;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

.settings-field {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.settings-field span {
  color: #584f46;
  font-size: 0.95rem;
}

.settings-field input,
.settings-field__select-shell,
.settings-field__password-shell {
  min-height: 50px;
  border: 1px solid #e2d4c5;
  border-radius: 10px;
  background: #ffffff;
}

.settings-field input {
  padding: 0 12px;
  color: #433a31;
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
  background: #d7d0ca;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.settings-day-list__day--active {
  background: #2d241e !important;
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
  color: #52483f;
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
  background: #d8d4d0;
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
  background: #ffffff;
  transition: transform 0.2s ease;
}

.settings-toggle input:checked + .settings-toggle__slider {
  background: #c21204;
}

.settings-toggle input:checked + .settings-toggle__slider::after {
  transform: translateX(12px);
}

.user-list {
  display: grid;
  gap: 14px;
}

.user-list__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid #e6d9cc;
  border-radius: 12px;
}

.user-list__identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-list__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f5dcc9;
  color: #513824;
  font-weight: 700;
}

.user-list__identity strong {
  display: block;
  color: #2c2328;
}

.user-list__identity small {
  color: #796f65;
}

.user-list__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #def4df;
  color: #238148;
  font-size: 0.84rem;
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
  color: #433a31;
  font-size: 1rem;
}

.settings-field__select-shell i,
.settings-field__password-shell i {
  color: #7e756b;
}

.settings-card__divider {
  height: 1px;
  margin: 8px 0 18px;
  background: #ece4db;
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
  background: #f4ece5;
  color: #5f564d;
}

@media (max-width: 1120px) {
  .configuration-page__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .settings-toggles,
  .user-list__row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
