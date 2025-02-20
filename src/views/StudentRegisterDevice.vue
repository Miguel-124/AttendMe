<template>
  <div class="registration-container">
    <!-- 🔹 Logo -->
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>

    <h1 class="title">{{ registered ? "Urządzenie zarejestrowane" : "Rejestracja urządzenia" }}</h1>
    
    <p class="subtitle" v-if="!registered">
      Rejestrujesz urządzenie, którego będziesz używać do sprawdzania obecności.
      Uzupełnij poniższe dane i naciśnij przycisk "Rejestruj".
    </p>
    <p class="subtitle" v-else>
      Przejdź do skanowania obecności lub do pulpitu (wymagane logowanie).
    </p>

    <!-- 🔥 Komunikaty -->
    <div v-if="loading" class="loading">Rejestracja urządzenia...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 🔹 Formularz rejestracji -->
    <div v-if="!loading && !error && !registered" class="form-container">
      <form @submit.prevent="registerDevice">
        <label for="deviceName">Nazwa urządzenia</label>
        <input id="deviceName" v-model="deviceName" type="text" placeholder="Wprowadź nazwę urządzenia" required />

        <button type="submit" class="submit-button">Zarejestruj</button>
      </form>
    </div>

    <!-- 🔥 Po rejestracji -->
    <div v-if="registered" class="options-container">
      <button class="scan-button" @click="goToScan">Skanuj obecność</button>
      <button class="dashboard-button" @click="goToDashboard">Otwórz pulpit</button>
      <button class="reset-button" @click="resetDevice">Resetuj</button>
      <p v-if="resetMessage" class="reset-message">{{ resetMessage }}</p>
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
const registered = ref<boolean>(false);
const error = ref<string | null>(null);
const loading = ref<boolean>(false);
const resetMessage = ref<string | null>(null);

// 🔥 Pobranie tokena z URL
onMounted(() => {
  token.value = route.params.token as string || "";
  if (!token.value) {
    error.value = "Brak tokenu rejestracyjnego w adresie URL.";
  }
});

// 🔥 Wysłanie żądania do backendu w celu rejestracji urządzenia
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
    registered.value = true;
  } catch (err) {
    console.error("Błąd rejestracji:", err);
    error.value = "Błąd rejestracji urządzenia. Spróbuj ponownie.";
  } finally {
    loading.value = false;
  }
};

// 🔥 Przejdź do skanowania obecności
const goToScan = () => {
  window.location.href = "https://attendme.runasp.net/#/student/generate-qr";
};

// 🔥 Przejdź do pulpitu (aktualnie placeholder `#`)
const goToDashboard = () => {
  router.push("/student/dashboard");
};

// 🔥 Resetowanie urządzenia
const resetDevice = async () => {
  try {
    const token = localStorage.getItem("deviceToken");
    if (!token) {
      resetMessage.value = "Brak tokenu urządzenia.";
      return;
    }

    await axios.post("https://attendme-backend.runasp.net/user/device/reset", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    resetMessage.value = "Pomyślnie zresetowano urządzenie!";
    localStorage.removeItem("deviceToken");
    registered.value = false;
  } catch (err) {
    console.error("Błąd resetowania urządzenia:", err);
    resetMessage.value = "Wystąpił błąd przy resetowaniu urządzenia.";
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

.loading, .error {
  font-size: 18px;
  font-weight: bold;
  color: red;
  margin-top: 20px;
}

.form-container {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

/* 🔥 Przyciski po rejestracji */
.options-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scan-button, .dashboard-button, .reset-button {
  width: 100%;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.scan-button {
  background-color: #007b45;
  color: white;
}

.dashboard-button {
  background-color: #f5a623;
  color: white;
}

.reset-button {
  background-color: #d9534f;
  color: white;
}

.scan-button:hover {
  background-color: #005c34;
}

.dashboard-button:hover {
  background-color: #d98c1f;
}

.reset-button:hover {
  background-color: #c9302c;
}

.reset-message {
  margin-top: 10px;
  font-size: 14px;
  color: green;
  font-weight: bold;
}
</style>
