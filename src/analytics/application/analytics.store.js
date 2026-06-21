import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AnalyticsApi } from '../infrastructure/analytics-api.js';
import { DemandForecastAssembler } from '../infrastructure/demand-forecast.assembler.js';

const analyticsApi = new AnalyticsApi();

const useAnalyticsStore = defineStore('analytics', () => {
    // State - Reports
    const reportsData = ref(null);
    const reportsLoaded = ref(false);
    
    // State - Forecast
    const demandForecast = ref(null);
    const demandForecastLoaded = ref(false);

    // Global loading/errors
    const loading = ref(true);
    const errors = ref([]);

    // Computed
    const demandForecastClientCount = computed(() => 
        demandForecastLoaded.value ? demandForecast.value?.clients?.length ?? 0 : 0
    );

    // Actions - Reports
    async function fetchReportsData() {
        loading.value = true;
        try {
            const data = await analyticsApi.getReportsData();
            reportsData.value = data;
            reportsLoaded.value = true;
        } catch (error) {
            console.error('Error fetching reports data:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    // Actions - Forecast
    async function fetchDemandForecast() {
        loading.value = true;
        try {
            const response = await analyticsApi.getDemandForecast();
            demandForecast.value = DemandForecastAssembler.toEntityFromResponse(response);
            demandForecastLoaded.value = true;
        } catch (error) {
            console.error('Error fetching demand forecast:', error);
            errors.value.push(error);
        } finally {
            loading.value = false;
        }
    }

    function resetStore() {
        reportsData.value = null;
        reportsLoaded.value = false;
        demandForecast.value = null;
        demandForecastLoaded.value = false;
        loading.value = false;
        errors.value = [];
    }

    return {
        reportsData,
        reportsLoaded,
        demandForecast,
        demandForecastLoaded,
        loading,
        errors,
        demandForecastClientCount,
        fetchReportsData,
        fetchDemandForecast,
        resetStore
    };
});

export default useAnalyticsStore;
