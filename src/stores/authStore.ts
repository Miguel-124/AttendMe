// src/stores/authStore.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as null | { 
      id: string; 
      name: string; 
      surname: string; 
      role: string 
    },
    isLoggedIn: false,
  }),
  actions: {
    setToken(newToken: string) {
      this.token = newToken;
      this.isLoggedIn = !!newToken;
      // Opcjonalnie: zapisz token do sessionStorage lub localStorage
      sessionStorage.setItem('authData', JSON.stringify({ token: newToken }));
    },
    setUser(userData: { id: string; name: string; surname: string; role: string }) {
      this.user = userData;
    },
    logout() {
      this.token = '';
      this.user = null;
      this.isLoggedIn = false;
      sessionStorage.removeItem('authData');
    },
  },
});
