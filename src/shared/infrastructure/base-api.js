import axios from 'axios';

const platformApi = import.meta.env.VITE_SUPPLYWOK_API_URL;

/**
 * Shared infrastructure base class that owns the configured Axios client.
 * Bounded-context adapters extend this class to access a consistent HTTP gateway.
 *
 * @class BaseApi
 */
export class BaseApi {
    /** @type {import('axios').AxiosInstance} */
    #http;

    /**
     * Initializes the shared Axios client with environment-driven configuration.
     * @param {string} [customBaseUrl] - Optional custom base URL to override the default platform API.
     */
    constructor(customBaseUrl) {
        this.#http = axios.create({
            baseURL: customBaseUrl ?? platformApi,
            headers: { 'Content-Type': 'application/json' }
        });

        this.#http.interceptors.request.use(config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Axios client used by infrastructure endpoint adapters.
     *
     * @returns {import('axios').AxiosInstance}
     */
    get http() {
        return this.#http;
    }
}
