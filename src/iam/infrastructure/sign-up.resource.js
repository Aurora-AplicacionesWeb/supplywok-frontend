/**
 * Infrastructure resource returned after user registration.
 *
 * @class SignUpResource
 */
export class SignUpResource {
    /**
     * @param {{message: string}} params - Resource payload.
     */
    constructor({message}) {
        this.message = message;
    }
}