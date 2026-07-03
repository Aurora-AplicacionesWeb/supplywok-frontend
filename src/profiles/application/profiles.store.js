import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ProfilesApi } from '../infrastructure/profiles-api.js';
import { SupplierProfileAssembler } from '../infrastructure/supplier-profile.assembler.js';
import { RestaurantProfileAssembler } from '../infrastructure/restaurant-profile.assembler.js';

const profilesApi = new ProfilesApi();

const useProfilesStore = defineStore('profiles', () => {
    const supplierProfiles = ref([]);
    const restaurantProfiles = ref([]);
    const errors = ref([]);
    const supplierProfilesLoaded = ref(false);
    const restaurantProfilesLoaded = ref(false);

    const supplierProfilesCount = computed(() => {
        return supplierProfilesLoaded.value ? supplierProfiles.value.length : 0;
    });

    const restaurantProfilesCount = computed(() => {
        return restaurantProfilesLoaded.value ? restaurantProfiles.value.length : 0;
    });

    // ── Supplier Profiles ─────────────────────────────────────────────────

    function fetchSupplierProfiles() {
        profilesApi.getSupplierProfiles().then(response => {
            supplierProfiles.value = SupplierProfileAssembler.toEntitiesFromResponse(response);
            supplierProfilesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function getSupplierProfileById(id) {
        const idNum = parseInt(id);
        return supplierProfiles.value.find(profile => profile.id === idNum);
    }

    function addSupplierProfile(profile) {
        profilesApi.createSupplierProfile(profile).then(response => {
            const resource = response.data;
            const newProfile = SupplierProfileAssembler.toEntityFromResource(resource);
            supplierProfiles.value.push(newProfile);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateSupplierProfile(profile) {
        profilesApi.updateSupplierProfile(profile).then(response => {
            const resource = response.data;
            const updatedProfile = SupplierProfileAssembler.toEntityFromResource(resource);
            const index = supplierProfiles.value.findIndex(p => p.id === updatedProfile.id);
            if (index !== -1) supplierProfiles.value[index] = updatedProfile;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteSupplierProfile(profile) {
        profilesApi.deleteSupplierProfile(profile.id).then(() => {
            const index = supplierProfiles.value.findIndex(p => p.id === profile.id);
            if (index !== -1) supplierProfiles.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    // ── Restaurant Profiles ───────────────────────────────────────────────

    function fetchRestaurantProfiles() {
        profilesApi.getRestaurantProfiles().then(response => {
            restaurantProfiles.value = RestaurantProfileAssembler.toEntitiesFromResponse(response);
            restaurantProfilesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function getRestaurantProfileById(id) {
        const idNum = parseInt(id);
        return restaurantProfiles.value.find(profile => profile.id === idNum);
    }

    function addRestaurantProfile(profile) {
        profilesApi.createRestaurantProfile(profile).then(response => {
            const resource = response.data;
            const newProfile = RestaurantProfileAssembler.toEntityFromResource(resource);
            restaurantProfiles.value.push(newProfile);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateRestaurantProfile(profile) {
        profilesApi.updateRestaurantProfile(profile).then(response => {
            const resource = response.data;
            const updatedProfile = RestaurantProfileAssembler.toEntityFromResource(resource);
            const index = restaurantProfiles.value.findIndex(p => p.id === updatedProfile.id);
            if (index !== -1) restaurantProfiles.value[index] = updatedProfile;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteRestaurantProfile(profile) {
        profilesApi.deleteRestaurantProfile(profile.id).then(() => {
            const index = restaurantProfiles.value.findIndex(p => p.id === profile.id);
            if (index !== -1) restaurantProfiles.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        supplierProfiles,
        restaurantProfiles,
        errors,
        supplierProfilesLoaded,
        restaurantProfilesLoaded,
        supplierProfilesCount,
        restaurantProfilesCount,
        fetchSupplierProfiles,
        getSupplierProfileById,
        addSupplierProfile,
        updateSupplierProfile,
        deleteSupplierProfile,
        fetchRestaurantProfiles,
        getRestaurantProfileById,
        addRestaurantProfile,
        updateRestaurantProfile,
        deleteRestaurantProfile
    };
});

export default useProfilesStore;
