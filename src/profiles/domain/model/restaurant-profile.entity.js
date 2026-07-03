export class RestaurantProfile {
    constructor({
                    id = null,
                    businessName = '',
                    firstName = '',
                    lastName = '',
                    street = '',
                    district = '',
                    city = '',
                    country = '',
                    contactEmail = '',
                    status = '',
                    userId = null
                } = {}) {
        this.id = id;
        this.businessName = businessName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.district = district;
        this.city = city;
        this.country = country;
        this.contactEmail = contactEmail;
        this.status = status;
        this.userId = userId;
    }
}
