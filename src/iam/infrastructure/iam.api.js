import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { UserAssembler } from './assemblers/user.assembler.js';

const iamApiUrl = import.meta.env.VITE_IAM_API_URL;
const usersEndpointPath = import.meta.env.VITE_IAM_USERS_ENDPOINT_PATH ?? '/users';

export class IamApi extends BaseApi {
  #usersEndpoint;

  constructor() {
    super(iamApiUrl);
    this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
  }

  async getUsers() {
    const response = await this.#usersEndpoint.getAll();
    return UserAssembler.toEntitiesFromResponse(response.data);
  }

  async createUser(userEntity) {
    const resource = UserAssembler.toResourceFromEntity(userEntity);
    const response = await this.#usersEndpoint.create(resource);
    return UserAssembler.toEntityFromResource(response.data);
  }
}
