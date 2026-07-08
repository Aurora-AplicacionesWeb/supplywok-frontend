import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

const registrationsEndpointPath =
  import.meta.env.VITE_SUBSCRIPTIONS_REGISTRATIONS_ENDPOINT_PATH ?? '/subscriptions/registrations';

export class SubscriptionsApi extends BaseApi {
  #registrationsEndpoint;

  constructor() {
    super();
    this.#registrationsEndpoint = new BaseEndpoint(this, registrationsEndpointPath);
  }

  async startRegistration(resource) {
    const response = await this.#registrationsEndpoint.create(resource);
    return response.data;
  }

  async getRegistrationStatus(registrationId) {
    const response = await this.#registrationsEndpoint.getById(registrationId);
    return response.data;
  }
}
