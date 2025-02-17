<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo -->
      <img src="@/assets/logo.png" alt="AttendMe Logo" class="logo" />

      <!-- Nagłówek -->
      <h2 class="title">Logowanie</h2>

      <!-- Formularz logowania -->
      <div class="form">
        <label class="label">Login</label>
        <input v-model="email" type="email" placeholder="Podaj twój login" class="input" />

        <label class="label">Hasło</label>
        <input v-model="password" type="password" placeholder="Podaj hasło" class="input" />

        <button @click="login" class="button">Zaloguj</button>

        <!-- Błąd logowania -->
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>

      <!-- Stopka -->
      <p class="footer">© 2025 true-vue</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

async function login() {
  try {
    console.log("🟢 Próba logowania...");

    // Wysyłamy login i hasło do backendu
    // const response = await axios.post("https://attendme-backend.runasp.net/user/login", {
    //   loginName: email.value,
    //   password: password.value,
    // });
    const response = await axios.post(
      `https://attendme-backend.runasp.net/user/login?loginName=${email.value}&password=${password.value}`
    );

    // Sprawdzenie, czy backend zwrócił token
    if (!response.data.token) {
      throw new Error("Brak tokena w odpowiedzi serwera");
    }

    // Zapisujemy token w localStorage
    localStorage.setItem("token", response.data.token);
    console.log("✅ Zalogowano! Token zapisany:", response.data.token);

    // Pobieramy dane użytkownika z backendu
    const user = await axios.get(
      `https://attendme-backend.runasp.net/user/get`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    // Pobranie danych użytkownika
    console.log(user);
    router.push("/dashboard");
  } catch (error) {
    console.error("❌ Błąd logowania:", error);
    errorMessage.value = "Błędny login lub hasło!";
  }
}
</script>

<style scoped>
/* Główne kontener */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* min-height: 100vh; */
  background-color: #000000;
}

/* Pudełko z formularzem */
.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 400px;
}

/* Logo */
.logo {
  width: 200px;
  margin-bottom: 20px;
  border-radius: 20%;
}

/* Tytuł */
.title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

/* Formularz */
.form {
  text-align: left;
}

/* Etykiety pól */
.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

/* Pola input */
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

/* Przycisk logowania */
.button {
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

.button:hover {
  background: #1e40af;
}

/* Komunikat błędu */
.error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

/* Stopka */
.footer {
  margin-top: 20px;
  font-size: 12px;
  color: #777;
}
</style>