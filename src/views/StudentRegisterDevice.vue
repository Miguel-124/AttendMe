<template>
  <div>
    <h1>Rejestracja urządzenia</h1>
    <p v-if="message">{{ message }}</p>
    <button @click="registerDevice" v-if="!message">
      Zarejestruj urządzenie
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const message = ref<string | null>(null);

async function registerDevice() {
  const token = route.query.token as string;

  if (!token) {
    message.value = "Brak tokenu rejestracyjnego.";
    return;
  }

  try {
    const response = await axios.post(
      "https://attendme-backend.runasp.net/api/user/device/register",
      { token },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    localStorage.setItem("deviceToken", response.data.token);
    message.value = "Urządzenie zarejestrowane pomyślnie!";

    setTimeout(() => {
      router.push("/student");
    }, 2000);
  } catch (error) {
    message.value = "Błąd rejestracji urządzenia. Spróbuj ponownie.";
  }
}

onMounted(registerDevice);
</script>
