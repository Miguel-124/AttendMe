<template>
  <div class="login-container">
    <div class="login-box">
      <img src="@/assets/logo.png" alt="AttendMe Logo" class="logo" />

      <h2 class="title">Logowanie</h2>

      <form @submit.prevent="login" class="form">
        <label class="label">Login</label>
        <input
          v-model="email"
          type="text"
          placeholder="Podaj twój login"
          class="input"
        />

        <label class="label">Hasło</label>
        <input
          v-model="password"
          type="password"
          placeholder="Podaj hasło"
          class="input"
        />

        <button type="submit" class="button-login">Zaloguj</button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>

      <p class="footer">© 2025 true-vue</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

async function login() {
  try {
    const response = await axios.post(
      `https://attendme-backend.runasp.net/user/login?loginName=${encodeURIComponent(email.value)}&password=${encodeURIComponent(password.value)}`
    );

    if (!response.data.token) {
      throw new Error("Brak tokena w odpowiedzi serwera");
    }

    authStore.setToken(response.data.token);

    const userResponse = await axios.get(
      `https://attendme-backend.runasp.net/user/get`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    authStore.setUser({
      id: userResponse.data.id,
      name: userResponse.data.name,
      surname: userResponse.data.surname,
      role: userResponse.data.isTeacher
        ? "Nauczyciel"
        : userResponse.data.isStudent
          ? "Uczeń"
          : "Nieznana rola",
    });

    if (userResponse.data) {
      router.push("/dashboard");
    } else {
      throw new Error("Nieznana rola użytkownika");
    }
  } catch (error) {
    console.error("Błąd logowania:", error);
    errorMessage.value = "Błędny login lub hasło!";
  }
}
</script>

<style scoped>
.button-login{
  width: 100%;
  background: #2563eb;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
</style>