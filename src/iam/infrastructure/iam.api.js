import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";
import { BaseApi } from "../../shared/infrastructure/base-api.js";
const authEndpointPath = import.meta.env.VITE_AUTH_ENDPOINT_PATH ?? '/authentication';
const signInEndpointPath = import.meta.env.VITE_SIGNIN_ENDPOINT_PATH ?? `${authEndpointPath}/sign-in`;
const signUpEndpointPath = import.meta.env.VITE_SIGNUP_ENDPOINT_PATH ?? `${authEndpointPath}/sign-up`;

/**
 * Infrastructure adapter for IAM HTTP endpoints.
 *
 * @class IamApi
 * @extends BaseApi
 */
export class IamApi extends BaseApi {
  #signInEndpoint;
  #signUpEndpoint;

  /** Creates endpoint clients for sign-in and sign-up. */
  constructor() {
    super();
    this.#signInEndpoint = new BaseEndpoint(this, signInEndpointPath);
    this.#signUpEndpoint = new BaseEndpoint(this, signUpEndpointPath);
  }

  /**
   * Sends a sign-in command to the authentication endpoint.
   * @param {import('../domain/sign-in.command.js').SignInCommand} signInRequest - Sign-in command.
   * @returns {Promise<import('axios').AxiosResponse<{id: number|string, username: string, token: string}>>} HTTP response with authentication resource.
   */
  async signIn(email, password) {
    const response = await this.#signInEndpoint.create({ email, password });
    return response.data;
  }

  /**
   * Sends a sign-up command to the registration endpoint.
   * @param {import('../domain/sign-up.command.js').SignUpCommand} signUpRequest - Sign-up command.
   * @returns {Promise<import('axios').AxiosResponse<{message: string}>>} HTTP response with registration resource.
   */
  async signUp(email, password, role) {
    const response = await this.#signUpEndpoint.create({ email, password, role });
    return response.data;
  }
}
