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
.button-login {
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

.footer {
  margin-top: 20px;
  font-size: 12px;
  color: #777;
}

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  margin-bottom: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #2563eb;
}
.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.form {
  text-align: left;
}
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  justify-content: center;
  align-items: center;
  background-color: #000000;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 500px;
}
</style>
