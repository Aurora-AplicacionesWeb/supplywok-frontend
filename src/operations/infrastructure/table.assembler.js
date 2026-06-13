import {Table} from "../domain/model/table.entity.js";

export class TableAssembler {
    static toEntityFromResource(resource) {
        return new Table({...resource})
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['tables'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
