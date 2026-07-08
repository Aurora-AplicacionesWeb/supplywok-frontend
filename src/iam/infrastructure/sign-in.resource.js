/**
 * Infrastructure resource returned by the authentication endpoint.
 *
 * @class SignInResource
 */
export class SignInResource {
    /**
     * @param {{id: number|string, username: string, token: string}} params - Resource payload.
     */
    constructor({id, username, token}) {
        this.id = id;
        this.username = username;
        this.token = token;
    }
}