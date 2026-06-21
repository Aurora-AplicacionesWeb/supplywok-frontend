export class AnalyticsApi {
    async getReportsData() {
        return {
            inventoryTrend: [],
            weeklyConsumption: [],
            topSuppliersOrders: [],
            temperatureFluctuations: []
        };
    }

    async getDemandForecast() {
        return {
            status: 200,
            data: {
                aggregate: [],
                clients: []
            }
        };
    }
}
