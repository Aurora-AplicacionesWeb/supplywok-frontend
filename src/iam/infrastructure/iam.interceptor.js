import { useIamStore } from "../application/iam-store.js";

/**
 * Adds the IAM bearer token to outbound requests when a user is authenticated.
 *
 * @param {import('axios').InternalAxiosRequestConfig} config - Axios request configuration.
 * @returns {import('axios').InternalAxiosRequestConfig} Updated request configuration.
 */
export const iamInterceptor = (config) => {
    const store = useIamStore();
    if (store.isAuthenticated && store.currentUser?.token) {
        config.headers.Authorization = `Bearer ${store.currentUser.token}`;
        console.log(config);
    }
    return config;
};
