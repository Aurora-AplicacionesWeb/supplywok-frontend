/**
 * Command used by IAM application services to register a new user.
 *
 * @class SignUpCommand
 */
export class SignUpCommand {
    /**
     * @param {Object} params - Command attributes.
     * @param {string} params.username - Desired username.
     * @param {string} params.password - Desired password.
     */
    constructor({username, password}) {
        this.username = username;
        this.password = password;
    }
}