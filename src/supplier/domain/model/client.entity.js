export class Client {
    constructor({
                    id = null,
                    name = '',
                    district = '',
                    status = ''
                } = {}) {
        this.id = id;
        this.name = name;
        this.district = district;
        this.status = status;
    }
}
