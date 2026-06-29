import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AnalyticsApi } from '../infrastructure/analytics-api.js';
import { DemandForecastAssembler } from '../infrastructure/demand-forecast.assembler.js';

const analyticsApi = new AnalyticsApi();

const useAnalyticsStore = defineStore('analytics', () => {
    const reportsData = ref(null);
    const reportsLoaded = ref(false);
    const demandForecast = ref(null);
    const demandForecastLoaded = ref(false);
    const loading = ref(true);
    const errors = ref([]);

    const demandForecastClientCount = computed(() =>
        demandForecastLoaded.value ? demandForecast.value?.clients?.length ?? 0 : 0
    );

    function fetchReportsData() {
        loading.value = true;
        analyticsApi.getReportsData().then(response => {
            reportsData.value = response.data?.['restaurant-reports'] ?? response.data ?? response;
            reportsLoaded.value = true;
            loading.value = false;
        }).catch(error => {
            console.error('Error fetching reports data:', error);
            errors.value.push(error);
            loading.value = false;
        });
    }

    function fetchDemandForecast() {
        loading.value = true;
        analyticsApi.getDemandForecast().then(response => {
            demandForecast.value = DemandForecastAssembler.toEntityFromResponse(response);
            demandForecastLoaded.value = true;
            loading.value = false;
        }).catch(error => {
            console.error('Error fetching demand forecast:', error);
            errors.value.push(error);
            loading.value = false;
        });
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
        reportsData, reportsLoaded,
        demandForecast, demandForecastLoaded,
        loading, errors,
        demandForecastClientCount,
        fetchReportsData,
        fetchDemandForecast,
        resetStore
    };
});

export default useAnalyticsStore;
