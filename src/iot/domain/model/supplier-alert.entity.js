export class SupplierAlert {
    constructor({
                    id = null,
                    severity = '',
                    detail = '',
                    date = '',
                    status = ''
                } = {}) {
        this.id = id;
        this.severity = severity;
        this.detail = detail;
        this.date = date;
        this.status = status;
    }
}
