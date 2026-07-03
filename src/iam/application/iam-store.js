import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { IamApi } from '../infrastructure/iam.api.js';
import useSessionStore from '../../shared/application/session.store.js';

/**
 * Pinia store for managing Identity and Access Management state.
 */
export const useIamStore = defineStore('iam', () => {
  const api = new IamApi();

  // --- State ---
  const users = ref([]);
  const currentUser = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // --- Computed (Getters) ---
  const isAuthenticated = computed(() => currentUser.value !== null);
  const currentUserRole = computed(() => currentUser.value?.role || null);

  // --- Actions ---

  /**
   * Loads all users from the API.
   */
  const loadUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      users.value = await api.getUsers();
    } catch (err) {
      error.value = 'Failed to load users';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Authenticates a user against the backend sign-in endpoint.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<boolean>} True if login is successful.
   */
  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.signIn(email, password);
      if (data && data.token) {
        currentUser.value = { id: data.id, email: data.email, token: data.token };
        localStorage.setItem('token', data.token);
        return true;
      } else {
        error.value = 'Invalid email or password';
        return false;
      }
    } catch (err) {
      error.value = 'Login process failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Registers a new user against the backend sign-up endpoint.
   * @param {Object} userData
   */
  const registerUser = async (userData) => {
    loading.value = true;
    error.value = null;
    try {
      await api.signUp(userData.email, userData.password);
      return true;
    } catch (err) {
      error.value = 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clears the current user session.
   */
  const logout = () => {
    const sessionStore = useSessionStore();
    currentUser.value = null;
    localStorage.removeItem('token');
    sessionStore.clearUserRole();
  };

  return {
    users,
    currentUser,
    loading,
    error,
    isAuthenticated,
    currentUserRole,
    loadUsers,
    login,
    registerUser,
    logout
  };
});
