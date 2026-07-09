import axios from 'axios';

const localOrigins = new Set(['localhost', '127.0.0.1']);

function isLocalUrl(value) {
    if (!value) return false;

    try {
        const parsed = new URL(value);
        return localOrigins.has(parsed.hostname);
    } catch {
        return false;
    }
}

function resolvePlatformApi() {
    const configuredUrl = import.meta.env.VITE_SUPPLY_WOK_API_URL
        ?? import.meta.env.VITE_PLATFORM_API_URL
        ?? import.meta.env.VITE_SUPPLYWOK_API_URL
        ?? '';

    if (typeof window !== 'undefined' &&
        !localOrigins.has(window.location.hostname) &&
        (!configuredUrl || isLocalUrl(configuredUrl))) {
        return 'https://supply-wok-platform-cgbs.onrender.com/api/v1';
    }

    return configuredUrl;
}

const platformApi = resolvePlatformApi();

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
