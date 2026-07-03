import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { UserAssembler } from './assemblers/user.assembler.js';

const authEndpointPath = import.meta.env.VITE_AUTH_ENDPOINT_PATH ?? '/authentication';
const usersEndpointPath = import.meta.env.VITE_IAM_USERS_ENDPOINT_PATH ?? '/users';

export class IamApi extends BaseApi {
  #authEndpointPath;
  #usersEndpoint;

  constructor() {
    super();
    this.#authEndpointPath = authEndpointPath;
    this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
  }

  async signIn(email, password) {
    const response = await this.http.post(`${this.#authEndpointPath}/sign-in`, { email, password });
    return response.data;
  }

  async signUp(email, password) {
    const response = await this.http.post(`${this.#authEndpointPath}/sign-up`, { email, password });
    return response.data;
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
