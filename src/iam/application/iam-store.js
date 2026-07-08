import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { IamApi } from '../infrastructure/iam.api.js';

const AUTH_STORAGE_KEY = 'supplywok:auth-user';

function readStoredUser() {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.token && parsed?.email
      ? {
          id: parsed.id ?? 0,
          email: parsed.email,
          token: parsed.token,
          role: parsed.role ?? null
        }
      : null;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export const useIamStore = defineStore('iam', () => {
  const api = new IamApi();

  const users = ref([]);
  const currentUser = ref(readStoredUser());
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => Boolean(currentUser.value?.token));
  const currentUserRole = computed(() => currentUser.value?.role ?? null);

  function persistUser(user) {
    currentUser.value = user;
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.localStorage.setItem('token', user.token);
  }

  function clearPersistedSession() {
    currentUser.value = null;
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem('token');
  }

  const loadUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      users.value = await api.getUsers();
    } catch {
      error.value = 'Failed to load users';
    } finally {
      loading.value = false;
    }
  };

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await api.signIn(email, password);
      if (!data?.token) {
        error.value = 'Invalid email or password';
        clearPersistedSession();
        return false;
      }

      persistUser({
        id: data.id,
        email: data.email,
        token: data.token,
        role: data.role
      });
      return true;
    } catch {
      error.value = 'Login process failed';
      clearPersistedSession();
      return false;
    } finally {
      loading.value = false;
    }
  };

  const registerUser = async (userData) => {
    loading.value = true;
    error.value = null;

    try {
      await api.signUp(userData.email, userData.password, userData.role);
      return await login(userData.email, userData.password);
    } catch {
      error.value = 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    clearPersistedSession();
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

export default useIamStore;
