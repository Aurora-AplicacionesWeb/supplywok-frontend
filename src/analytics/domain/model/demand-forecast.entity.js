export class DemandForecast {
    constructor({
                    id = null,
                    aggregate = [],
                    clients = []
                } = {}) {
        this.id = id;
        this.aggregate = aggregate;
        this.clients = clients;
    }
}
