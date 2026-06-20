import { Client } from '../domain/model/client.entity.js';

export class ClientAssembler {
    static toEntityFromResource(resource) {
        return new Client({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = response.data instanceof Array
            ? response.data
            : response.data?.clients ?? [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
