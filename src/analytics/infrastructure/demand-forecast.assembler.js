import { DemandForecast } from '../domain/model/demand-forecast.entity.js';

export class DemandForecastAssembler {
    static toEntityFromResource(resource) {
        return new DemandForecast({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = response.data instanceof Array
            ? response.data
            : response.data['demand-forecasts'] ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    static toEntityFromResponse(response) {
        return this.toEntitiesFromResponse(response)[0] ?? new DemandForecast();
    }
}
