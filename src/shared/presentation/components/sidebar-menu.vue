<script setup>
import { computed, ref } from 'vue';
import {useI18n} from "vue-i18n";
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import useSessionStore from '../../application/session.store.js';
import { useIamStore } from '../../../iam/application/iam-store.js';
import { getRoleFromPath, normalizeRole } from '../../application/role-routing.js';

/**
 * @component SidebarMenu
 * @summary Main navigation sidebar for the application, displaying the branding and main modules.
 * @author Aurora Development Team
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id - Unique identifier for the menu item.
 * @property {string} i18nKey - Translation key for the display text.
 * @property {string} iconOff - Path to the default icon image.
 * @property {string} iconOn - Path to the active icon image.
 */

/** @type {import('vue').Ref<string>} Reactive state for the restaurant name. */
const restaurantName = ref('GRAN DRAGÓN CHIFA');

const {t}=useI18n();
const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const iamStore = useIamStore();
const { userRole } = storeToRefs(sessionStore);
const { currentUserRole, currentUser } = storeToRefs(iamStore);

/** @type {import('vue').Ref<string>} Reactive state for the current subscription plan. */
const currentPlan = computed(() => sessionStore.subscriptionPlan);

/** @type {MenuItem[]} Array containing the main navigation items. */
const menuItems = {
  restaurant: [
    { id: 'dashboard', i18nKey: 'shared.sidebar.dashboard', iconOff: '/images/icons/dashboard-icon.svg', iconOn: '/images/icons/dashboard-on-icon.svg', path: '/operations/dashboard' },
    { id: 'inventory', i18nKey: 'shared.sidebar.inventory', iconOff: '/images/icons/inventory-icon.svg', iconOn: '/images/icons/inventory-on-icon.svg', path: '/inventory/items' },
    { id: 'orders', i18nKey: 'shared.sidebar.orders', iconOff: '/images/icons/orders-icon.svg', iconOn: '/images/icons/orders-on-icon.svg', path: '/purchasing/orders' },
    { id: 'kitchen-tickets', i18nKey: 'shared.sidebar.kitchen-tickets', iconOff: '/images/icons/kitchen-ticket-icon.svg', iconOn: '/images/icons/kitchen-tickets-on-icon.svg', path: '/operations/kitchen' },
    { id: 'suppliers', i18nKey: 'shared.sidebar.suppliers', iconOff: '/images/icons/suppliers-icon.svg', iconOn: '/images/icons/suppliers-on-icon.svg', path: '/purchasing/suppliers' },
    { id: 'tables-and-occupancy', i18nKey: 'shared.sidebar.tables-and-occupancy', iconOff: '/images/icons/tables-and-occupancy-icon.svg', iconOn: '/images/icons/tables-and-occupancy-on-icon.svg', path: '/operations/tables' },
    { id: 'alerts', i18nKey: 'shared.sidebar.alerts', iconOff: '/images/icons/alerts-icon.svg', iconOn: '/images/icons/alerts-on-icon.svg', path: '/iot/alerts' },
    { id: 'reports', i18nKey: 'shared.sidebar.reports', iconOff: '/images/icons/reports-icon.svg', iconOn: '/images/icons/reports-on-icon.svg', path: '/operations/reports' },
    { id: 'configuration', i18nKey: 'shared.sidebar.configuration', iconOff: '/images/icons/configuration-icon.svg', iconOn: '/images/icons/configuration-on-icon.svg', path: '/operations/configuration' },
    { id: 'subscription', i18nKey: 'shared.sidebar.subscription', iconOff: '/images/icons/subscripcion-icon.svg', iconOn: '/images/icons/subscription-on-icon.svg', path: '/operations/subscription' },

  ],
  supplier:[
    { id: 'dashboard', i18nKey: 'shared.sidebar.dashboard', iconOff: '/images/icons/dashboard-icon.svg', iconOn: '/images/icons/dashboard-on-icon.svg', path: '/supplier/dashboard' },
    { id: 'orders', i18nKey: 'shared.sidebar.orders', iconOff: '/images/icons/orders-icon.svg', iconOn: '/images/icons/orders-on-icon.svg', path: '/supplier/orders' },
    { id: 'clients', i18nKey: 'shared.sidebar.clients', iconOff: '/images/icons/clients-icon.svg', iconOn: '/images/icons/clients-icon.svg', path: '/supplier/clients' },
    { id: 'delivery', i18nKey: 'shared.sidebar.delivery', iconOff: '/images/icons/delivery-icon.svg', iconOn: '/images/icons/delivery-icon.svg', path: '/supplier/delivery' },
    { id: 'forecast', i18nKey: 'shared.sidebar.forecast', iconOff: '/images/icons/forecast-icon.svg', iconOn: '/images/icons/forecast-icon.svg', path: '/supplier/forecast' },
    { id: 'catalog', i18nKey: 'shared.sidebar.catalog', iconOff: '/images/icons/catalog-icon.svg', iconOn: '/images/icons/catalog-icon.svg', path: '/supplier/catalog' },
    { id: 'alerts', i18nKey: 'shared.sidebar.alerts', iconOff: '/images/icons/alerts-icon.svg', iconOn: '/images/icons/alerts-on-icon.svg', path: '/supplier/alerts' },
    { id: 'configuration', i18nKey: 'shared.sidebar.configuration', iconOff: '/images/icons/configuration-icon.svg', iconOn: '/images/icons/configuration-on-icon.svg', path: '/supplier/configuration' },
    { id: 'subscription', i18nKey: 'shared.sidebar.subscription', iconOff: '/images/icons/subscripcion-icon.svg', iconOn: '/images/icons/subscription-on-icon.svg', path: '/supplier/subscription' }
  ]
};

const routeRole = computed(() => {
  return getRoleFromPath(route.path);
});

const activeRole = computed(() => {
  return routeRole.value
      ?? normalizeRole(currentUserRole.value)
      ?? normalizeRole(userRole.value)
      ?? 'restaurant';
});

const visibleMenuItems = computed(() => menuItems[activeRole.value] ?? []);

const activeItem = computed(() => {
  if (route.path.startsWith('/iot/')) {
    return 'alerts';
  }
  const currentItem = visibleMenuItems.value.find((item) => route.path.startsWith(item.path));
  return currentItem?.id ?? 'dashboard';
});

/**
 * Navigates to role-scoped menu items.
 * @param {MenuItem} item - Menu item selected by the user.
 * @returns {void}
 */
const selectItem = (item) => {
  router.push(item.path);
};
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--supplier': activeRole === 'supplier' }">
    <!-- Branding Section -->
    <div class="sidebar__brand">
      <img src="/images/supplywok-logo.png" alt="SupplyWok Logo" class="sidebar__logo" />
      <div class="sidebar__brand-text">
        <h2 class="sidebar__title">SupplyWok</h2>
        <span class="sidebar__subtitle">{{ restaurantName }}</span>
      </div>
    </div>

    <!-- Status Tags Section -->
    <div class="sidebar__status">
      <span class="sidebar__tag sidebar__tag--role">{{ activeRole === 'supplier' ? t('shared.sidebar.supplier') : t('shared.sidebar.restaurant')}}</span>
      <span class="sidebar__tag sidebar__tag--plan">{{t('shared.sidebar.current-plan')}} {{ currentPlan }}</span>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar__nav" aria-label="Main Navigation">
      <ul class="sidebar__menu">
        <li
            v-for="item in visibleMenuItems"
            :key="item.id"
            class="sidebar__item"
            :class="{ 'sidebar__item--active': activeItem === item.id }"
        >
          <button class="sidebar__button" @click="selectItem(item)">
            <img
                :src="activeItem === item.id ? item.iconOn : item.iconOff"
                :alt="`${ t(item.i18nKey)} icon`"
                class="sidebar__icon"
            />
            <span class="sidebar__label">{{ $t(item.i18nKey) }}</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  min-height: 100vh;
  background-color: #2d241e;
  color: #b5b0a1;
  font-family: 'Montserrat', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  padding: 22px 0;
  box-sizing: border-box;
  flex-shrink: 0;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  padding: 0 26px;
  margin-bottom: 14px;
  gap: 10px;
}

.sidebar__logo {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.sidebar__brand-text {
  display: flex;
  flex-direction: column;
}

.sidebar__title {
  margin: 0;
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 19px;
  line-height: 1;
  font-weight: 700;
  color: #ffffff;
}

.sidebar__subtitle {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 600;
  color: #8c857b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.sidebar__status {
  display: flex;
  align-items: center;
  padding: 0 26px 18px;
  margin-bottom: 14px;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.sidebar__tag {
  font-size: 11px;
  border-radius: 6px;
  line-height: 1;
  white-space: nowrap;
}

.sidebar__tag--role {
  background-color: #c21204;
  color: #ffffff;
  padding: 7px 10px;
  font-weight: 700;
  font-family: 'Poppins', system-ui, sans-serif;
}

.sidebar__tag--plan {
  color: #8c857b;
  font-weight: 500;
}

.sidebar__nav {
  flex-grow: 1;
}

.sidebar__menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__item {
  position: relative;
}

.sidebar__button {
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 26px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.2s ease;
}

.sidebar__icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  opacity: 0.75;
  transition: opacity 0.2s ease;
}

.sidebar__label {
  font-size: 13px;
  font-weight: 500;
  color: #a39b8f;
  line-height: 1.25;
  transition: all 0.2s ease;
}

.sidebar__button:hover {
  background-color: rgba(255, 255, 255, 0.035);
}

.sidebar__button:hover .sidebar__label {
  color: #e2dfd8;
}

.sidebar__button:hover .sidebar__icon {
  opacity: 1;
}

.sidebar__item--active {
  background-color: rgba(0, 0, 0, 0.18);
}

.sidebar__item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background-color: #c21204;
}

.sidebar__item--active .sidebar__label {
  font-weight: 700;
  color: #ffffff;
}

.sidebar__item--active .sidebar__icon {
  opacity: 1;
}

.sidebar--supplier .sidebar__tag--role,
.sidebar--supplier .sidebar__item--active::before {
  background-color: #b76a13;
}

.sidebar--supplier {
  background-color: #2b1d05;
}

.sidebar--supplier .sidebar__item--active {
  background-color: rgba(80, 50, 0, 0.38);
}
</style>
