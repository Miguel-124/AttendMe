import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: "" as string,
    user: null as {
      id: number;
      name: string;
      surname: string;
      role: string;
    } | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    setToken(newToken: string) {
      this.token = newToken;
      sessionStorage.setItem("authData", JSON.stringify({ token: newToken }));
    },

    setUser(userData: {
      id: number;
      name: string;
      surname: string;
      role: string;
    }) {
      this.user = userData;
    },

    clearAuth() {
      this.token = "";
      this.user = null;
      sessionStorage.removeItem("authData");
    },

    async login(email: string, password: string) {
      try {
        const response = await axios.post(
          `https://attendme-backend.runasp.net/user/login?loginName=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );

        if (!response.data.token) {
          throw new Error("Brak tokena w odpowiedzi serwera");
        }

        this.token = response.data.token;
        sessionStorage.setItem(
          "authData",
          JSON.stringify({ token: this.token })
        );

        const userResponse = await axios.get(
          "https://attendme-backend.runasp.net/user/get",
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        this.user = {
          id: userResponse.data.id,
          name: userResponse.data.name,
          surname: userResponse.data.surname,
          role: userResponse.data.isTeacher
            ? "Nauczyciel"
            : userResponse.data.isStudent
              ? "Uczeń"
              : "Nieznana rola",
        };

        if (!userResponse.data) {
          throw new Error("Nieznana rola użytkownika");
        }
      } catch (error) {
        console.error("Błąd logowania w authStore:", error);
        throw error;
      }
    },

    logout() {
      this.token = "";
      this.user = null;
      sessionStorage.removeItem("authData");
    },
  },
});
