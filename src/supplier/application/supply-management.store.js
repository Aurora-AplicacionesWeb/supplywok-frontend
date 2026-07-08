import {defineStore} from "pinia";
import {computed, ref} from "vue";
import { SupplyManagementApi } from "../infrastructure/supply-management-api.js";
import { ProfilesApi } from "../../profiles/infrastructure/profiles-api.js";
import { useIamStore } from "../../iam/application/iam-store.js";

import {CatalogItemAssembler} from "../infrastructure/catalog-item.assembler.js";
import {ClientAssembler} from "../infrastructure/client.assembler.js";
import {DeliveryRouteAssembler} from "../infrastructure/delivery-route.assembler.js";
import {SupplierSettingsAssembler} from "../infrastructure/supplier-settings.assembler.js";
const supplierManagementApi = new SupplyManagementApi();
const profilesApi = new ProfilesApi();

/**
 * Application service store for the `Supply Management` bounded context.
 * It coordinates supplier purchase order use cases and keeps UI-facing state.
 *
 * @module useSupplierManagementStore
 */
const useSupplierManagementStore = defineStore('supplierManagement', () => {
    const errors=ref([]);
    const supplierProfileId = ref(null);
    const initialized = ref(false);

    /**
     * Fetches the current user's supplier profile from the backend
     * and configures the API with the real supplier profile id.
     * Must be called before any supplier-scoped operation.
     */
    async function initializeForCurrentUser() {
        if (initialized.value) return;
        const iamStore = useIamStore();
        const userId = iamStore.currentUser?.id;
        if (!userId) {
            errors.value.push(new Error('No authenticated user found'));
            return;
        }
        try {
            const response = await profilesApi.getSupplierProfileByUserId(userId);
            const profile = response.data;
            supplierProfileId.value = profile.id;
            supplierManagementApi.setSupplierId(profile.id);
            initialized.value = true;
        } catch (error) {
            errors.value.push(error);
        }
    }

    // ── Catalog Supplier section ──────────────────────────────────────────────
    // State and use cases for the supplier's product catalog (CatalogItem aggregate).

    const catalogItems = ref([]);
    const catalogItemsLoaded = ref(false);
    const clients = ref([]);
    const clientsLoaded = ref(false);
    const deliveryRoutes = ref([]);
    const deliveryRoutesLoaded = ref(false);
    const supplierSettings = ref(null);
    const supplierSettingsLoaded = ref(false);
    const settingsError = ref('');

    /**
     * Number of loaded catalog items.
     *
     * @type {import('vue').ComputedRef<number>}
     */
    const catalogItemsCount =
        computed(()=> catalogItemsLoaded.value ? catalogItems.value.length : 0);

    /**
     * Number of loaded clients.
     *
     * @type {import('vue').ComputedRef<number>}
     */
    const clientsCount =
        computed(() => clientsLoaded.value ? clients.value.length : 0);

    const deliveryRoutesCount =
        computed(() => deliveryRoutesLoaded.value ? deliveryRoutes.value.length : 0);

    /**
     * Loads the supplier's catalog items from infrastructure and updates local state.
     *
     * @returns {void}
     */
    async function fetchCatalogItems(){
        await initializeForCurrentUser();
        supplierManagementApi.getCatalogItems().then(response=>{
            catalogItems.value = CatalogItemAssembler.toEntitiesFromResponse(response);
            catalogItemsLoaded.value = true;
        }).catch(error=>{
            errors.value.push(error);
        });
    }

    /**
     * Loads supplier clients from infrastructure and updates local state.
     *
     * @returns {void}
     */
    async function fetchClients(){
        await initializeForCurrentUser();
        supplierManagementApi.getClients().then(response=>{
            clients.value = ClientAssembler.toEntitiesFromResponse(response);
            clientsLoaded.value = true;
        }).catch(error=>{
            errors.value.push(error);
        });
    }


    /**
     * Loads delivery routes from infrastructure and updates local state.
     *
     * @returns {void}
     */
    function fetchDeliveryRoutes(){
        supplierManagementApi.getDeliveryRoutes().then(response=>{
            deliveryRoutes.value = DeliveryRouteAssembler.toEntitiesFromResponse(response);
            deliveryRoutesLoaded.value = true;
        }).catch(error=>{
            errors.value.push(error);
        });
    }

    /**
     * Loads supplier settings from infrastructure and updates local state.
     *
     * @returns {void}
     */
    async function fetchSupplierSettings(){
        settingsError.value = '';
        await initializeForCurrentUser();
        supplierManagementApi.getSupplierSettings().then(response=>{
            supplierSettings.value = SupplierSettingsAssembler.toEntityFromResponse(response);
            supplierSettingsLoaded.value = true;
        }).catch(error=>{
            settingsError.value = error.message || String(error);
        });
    }

    /**
     * Persists supplier settings and replaces the local state with the saved entity.
     *
     * @param {import('../domain/model/supplier-settings.entity.js').SupplierSettings} settings - Settings to persist.
     * @returns {Promise<void>}
     */
    async function updateSupplierSettings(settings){
        if (!settings?.id) {
            return false;
        }

        try {
            const response = await supplierManagementApi.updateSupplierSettings(
                settings.id,
                SupplierSettingsAssembler.toResourceFromEntity(settings)
            );
            supplierSettings.value = SupplierSettingsAssembler.toEntityFromResource(response.data);
            supplierSettingsLoaded.value = true;
            return true;
        } catch (error) {
            settingsError.value = error.message || String(error);
            return false;
        }
    }

    /**
     * Finds a catalog item by its identifier from the local state.
     *
     * @param {string|number} id - Catalog item identifier.
     * @returns {import('../domain/model/catalog-item.entity.js').CatalogItem|undefined}
     */
    function getCatalogItemById(id){
        let idNum = parseInt(id);
        return catalogItems.value.find(item => item['id'] === idNum);
    }

    /**
     * Creates a catalog item through infrastructure and appends it to local state.
     *
     * @param {import('../domain/model/catalog-item.entity.js').CatalogItem} item - Catalog item entity to persist.
     * @returns {void}
     */
    async function addCatalogItem(item){
        await initializeForCurrentUser();
        try {
            const response = await supplierManagementApi.createCatalogItem(
                CatalogItemAssembler.toResourceFromEntity(item)
            );
            const resource = response.data;
            const newItem = CatalogItemAssembler.toEntityFromResource(resource);
            catalogItems.value.push(newItem);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Updates a catalog item through infrastructure and replaces it in local state.
     *
     * @param {import('../domain/model/catalog-item.entity.js').CatalogItem} item - Catalog item entity to update.
     * @returns {void}
     */
    async function updateCatalogItem(item){
        await initializeForCurrentUser();
        try {
            const response = await supplierManagementApi.updateCatalogItem(
                item.id,
                CatalogItemAssembler.toResourceFromEntity(item)
            );
            const resource = response.data;
            const updatedItem = CatalogItemAssembler.toEntityFromResource(resource);
            const index = catalogItems.value.findIndex(i => i['id'] === updatedItem.id);
            if(index !== -1){
                catalogItems.value[index] = updatedItem;
            }
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    /**
     * Deletes a catalog item through infrastructure and removes it from local state.
     *
     * @param {string|number} id - Catalog item identifier.
     * @returns {void}
     */
    async function deleteCatalogItem(id){
        await initializeForCurrentUser();
        try {
            await supplierManagementApi.deleteCatalogItem(id);
            const idNum = parseInt(id);
            const index = catalogItems.value.findIndex(i => i['id'] === idNum);
            if(index !== -1){
                catalogItems.value.splice(index, 1);
            }
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }
    // ── End Catalog Supplier section ──────────────────────────────────────────

    return{
        errors,
        supplierProfileId,
        initialized,
        initializeForCurrentUser,
        // ── Catalog Supplier exports ──
        catalogItems,
        catalogItemsLoaded,
        catalogItemsCount,
        clients,
        clientsLoaded,
        clientsCount,
        deliveryRoutes,
        deliveryRoutesLoaded,
        deliveryRoutesCount,
        supplierSettings,
        supplierSettingsLoaded,
        settingsError,
        fetchCatalogItems,
        fetchClients,
        fetchDeliveryRoutes,
        fetchSupplierSettings,
        updateSupplierSettings,
        getCatalogItemById,
        addCatalogItem,
        updateCatalogItem,
        deleteCatalogItem,
    }
});

export default useSupplierManagementStore;
