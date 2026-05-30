import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ReportsApi } from '../infrastructure/reports-api.js';

const reportsApi = new ReportsApi();

/**
 * Application service store for managing operations reports.
 * Exposes reactive state and fetch operations to populate reports dashboard.
 *
 * @module useReportsStore
 */
const useReportsStore = defineStore('reports', () => {
    const reportsData = ref(null);
    const reportsLoaded = ref(false);
    const loading = ref(false);
    const errors = ref([]);

    /**
     * Loads reports data from infrastructure and updates state.
     *
     * @returns {Promise<void>}
     */
    async function fetchReportsData() {
        loading.value = true;
        try {
            const data = await reportsApi.getReportsData();
            reportsData.value = data;
            reportsLoaded.value = true;
        } catch (error) {
            console.error('Error fetching reports data:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Resets the reports store.
     */
    function resetStore() {
        reportsData.value = null;
        reportsLoaded.value = false;
        loading.value = false;
        errors.value = [];
    }

    return {
        reportsData,
        reportsLoaded,
        loading,
        errors,
        fetchReportsData,
        resetStore
    };
});

export default useReportsStore;
