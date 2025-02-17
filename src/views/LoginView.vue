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
      `https://attendme-backend.runasp.net/user/login?loginName=${email.value}&password=${password.value}`
    );

    localStorage.setItem("token", response.data.token);
    const user = await axios.get(
      `https://attendme-backend.runasp.net/user/get`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    console.log(user);
    router.push("/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    errorMessage.value = "Błędny email lub hasło";
  }
}
</script>
