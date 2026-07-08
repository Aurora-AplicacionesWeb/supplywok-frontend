<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SidebarMenu from './sidebar-menu.vue';
import LanguageSwitcher from './language-switcher.vue';
import HeaderAlertsPopup from '../../../iot/presentation/components/alerts/header-alerts-popup.vue';
import useSessionStore from '../../application/session.store.js';
import { normalizeRole } from '../../application/role-routing.js';
import { useIamStore } from '../../../iam/application/iam-store.js';

const router = useRouter();
const { t } = useI18n();
const profileMenu = ref(null);
const sessionStore = useSessionStore();
const iamStore = useIamStore();

const currentRole = () => normalizeRole(sessionStore.userRole) ?? 'restaurant';
const getConfigurationPath = () => (currentRole() === 'supplier' ? '/supplier/configuration' : '/operations/configuration');

const profileMenuOptions = ref([
  {
    label: () => t('header.settings'),
    icon: 'pi pi-cog',
    command: () => router.push(getConfigurationPath())
  },
  {
    label: () => t('header.logout'),
    icon: 'pi pi-sign-out',
    command: () => {
      iamStore.logout();
      sessionStore.clearUserRole();
      router.push('/login');
    }
  }
]);

const toggleProfileMenu = (event) => {
  profileMenu.value.toggle(event);
};

const landingUrl = 'https://aurora-aplicacionesweb.github.io/SupplyWok-Landing-Page/';
</script>

<template>
  <div class="layout">
    <SidebarMenu />
    <div class="layout__main">
      <header class="layout__header">
        <strong class="layout__brand">SupplyWok</strong>
        <div class="header-actions">
          <LanguageSwitcher />
          <HeaderAlertsPopup />
          <a :href="landingUrl" target="_blank" class="header-icon-link" :title="t('header.help')">
            <i class="pi pi-question-circle"></i>
          </a>
          <button class="profile-button" @click="toggleProfileMenu">
            <i class="pi pi-user"></i>
            <span class="profile-text">{{ t('header.adminProfile') }}</span>
          </button>
          <pv-menu ref="profileMenu" :model="profileMenuOptions" :popup="true" />
        </div>
      </header>
      <main class="layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>
.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #fff;
  border-bottom: 1px solid #efe6da;
}

.layout__brand {
  color: #2d241e;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 18px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-icon-link {
  color: #2d241e;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: color 0.2s;
}

.header-icon-link:hover {
  color: #c0392b;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 12px;
  transition: background 0.2s;
  color: #2d241e;
}

.profile-button:hover {
  background-color: #f4f0e6;
}

.profile-button i {
  font-size: 1.5rem;
}

.profile-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
}

.layout__content {
  flex: 1;
  background-color: #EDEBE5;
  padding: 24px;
  overflow-y: auto;
}
</style>
