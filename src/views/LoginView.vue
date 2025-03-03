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
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

async function login() {
  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
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
</style>
