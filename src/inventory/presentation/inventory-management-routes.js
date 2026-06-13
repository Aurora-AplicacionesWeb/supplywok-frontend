import inventoryManagementView from './views/inventory-management-view.vue';
import inventoryManagementEditView from './views/inventory-management-edit-view.vue';
import inventoryManagementCreateView from './views/inventory-management-create-view.vue';

export const inventoryManagementRoutes = [
  {
    path: '/inventory/items',
    name: 'restaurant-inventory',
    component: inventoryManagementView,
    meta: { i18nKey: 'shared.titles.inventory', role: 'restaurant' }
  },
  {
    path: '/inventory/items/new',
    name: 'inventory-item-create',
    component: inventoryManagementCreateView,
    meta: { i18nKey: 'shared.titles.inventory', role: 'restaurant' }
  },
  {
    path: '/inventory/items/:itemId/edit',
    name: 'inventory-item-edit',
    component: inventoryManagementEditView,
    meta: { i18nKey: 'shared.titles.inventory', role: 'restaurant' }
  }
];
