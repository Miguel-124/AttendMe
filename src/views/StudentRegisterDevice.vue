<template>
  <div class="registration-container">
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>

    
    <h1 class="title">Rejestracja urządzenia</h1>
    <p class="subtitle">
      Rejestrujesz urządzenie, którego będziesz używać do sprawdzania obecności.
      Uzupełnij poniższe dane i naciśnij przycisk "Rejestruj".
    </p>

    <div v-if="loading" class="loading">Rejestracja urządzenia...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="form-container">
      <form @submit.prevent="registerDevice">
        <label for="deviceName">Nazwa urządzenia</label>
        <input id="deviceName" v-model="deviceName" type="text" placeholder="Wprowadź nazwę urządzenia" required />

        <label for="firstName">Twoje imię</label>
        <input id="firstName" v-model="firstName" type="text" placeholder="Wprowadź swoje imię" required />

        <label for="lastName">Twoje nazwisko</label>
        <input id="lastName" v-model="lastName" type="text" placeholder="Wprowadź swoje nazwisko" required />

        <label for="studentId">Twój numer albumu</label>
        <input id="studentId" v-model="studentId" type="text" placeholder="Wprowadź numer albumu" required />

        <button type="submit" class="submit-button">Zarejestruj</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const token = ref<string>("");
const deviceName = ref("");
const firstName = ref("");
const lastName = ref("");
const studentId = ref("");
const error = ref<string | null>(null);
const loading = ref<boolean>(false);

// Pobranie tokena z URL
onMounted(() => {
  token.value = route.params.token as string || "";
  if (!token.value) {
    error.value = "Brak tokenu rejestracyjnego w adresie URL.";
  }
});

// Wysłanie żądania do backendu w celu rejestracji urządzenia
const registerDevice = async () => {
  if (!token.value || !deviceName.value) {
    error.value = "Wprowadź nazwę urządzenia!";
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post("https://attendme-backend.runasp.net/user/device/register", {
      token: token.value,
      deviceName: deviceName.value,
    });

    const newToken = response.data.token;
    localStorage.setItem("deviceToken", newToken);
    alert("Urządzenie zostało pomyślnie zarejestrowane!");
    router.push("/student/dashboard");
  } catch (err: unknown) {
  console.error("Błąd rejestracji:", err);

  // Sprawdzenie, czy błąd jest obiektem i zawiera `response`
  if (err instanceof Error && "response" in err) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    error.value = axiosError.response?.data?.message || "Błąd rejestracji urządzenia. Spróbuj ponownie.";
  } else {
    error.value = "Wystąpił nieznany błąd.";
  }
} finally {
  loading.value = false;
}
};


</script>

<style scoped>
.registration-container {
  max-width: 500px;
  padding: 20px;
  border-radius: 20px;
  margin: 50px auto;
  text-align: center;
  background-color: white;
}

.logo {
  width: 120px;
  border-radius: 20px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #000;
}

.subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
}

.form-container {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

label {
  font-weight: bold;
  display: block;
  margin: 10px 0 5px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.submit-button {
  width: 100%;
  background-color: #007b45;
  color: white;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 5px;
  margin-top: 20px;
  cursor: pointer;
  font-weight: bold;
}

.loading, .error {
  font-size: 18px;
  font-weight: bold;
  color: red;
  margin-top: 20px;
}

.submit-button:hover {
  background-color: #005c34;
}
</style>
