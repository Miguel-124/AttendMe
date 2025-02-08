<template>
  <div>
    <h1>Logowanie</h1>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Hasło" />
    <button @click="login">Zaloguj</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
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
    const response = await axios.post(
      "https://attendme-backend.runasp.net/api/auth/login",
      {
        email: email.value,
        password: password.value,
      }
    );

    localStorage.setItem("token", response.data.token);
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = "Błędny email lub hasło";
  }
}
</script>
