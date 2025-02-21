<template>
  <div class="registration-container">
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>

    <!-- Komunikaty błędów i stanu -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="loading" class="loading">Trwa rejestracja urządzenia...</div>

    <!-- Ekran: Urządzenie już zarejestrowane dla danego użytkownika -->
    <div v-if="deviceAlreadyRegistered" class="success-container">
      <h1 class="title">Urządzenie zarejestrowane</h1>
      <p class="subtitle">
        Urządzenie jest już zarejestrowane dla Ciebie. Możesz teraz skanować
        obecność lub otworzyć pulpit.
      </p>
      <button class="scan-button" @click="goToScan">Skanuj obecność</button>
      <button class="dashboard-button" @click="goToDashboard">
        Otwórz pulpit
      </button>
      <button class="reset-button" @click="resetDevice">
        Resetuj urządzenie
      </button>
      <p v-if="resetMessage" class="reset-message">{{ resetMessage }}</p>
    </div>

    <!-- Formularz rejestracji (pokazywany, gdy nie ma tokenu dla danego użytkownika) -->
    <div v-else class="form-container">
      <h1 class="title register">Rejestracja urządzenia</h1>
      <p class="subtitle register">
        Zarejestruj swoje urządzenie, którego będziesz używać do sprawdzania
        obecności.
      </p>
      <form @submit.prevent="registerDevice">
        <label for="deviceName">Nazwa urządzenia</label>
        <input
          id="deviceName"
          v-model="deviceNameInput"
          type="text"
          placeholder="Wprowadź nazwę urządzenia"
          required
        />

        <label for="firstName">Twoje imię</label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          placeholder="Wprowadź swoje imię"
          required
        />

        <label for="lastName">Twoje nazwisko</label>
        <input
          id="lastName"
          v-model="lastName"
          type="text"
          placeholder="Wprowadź swoje nazwisko"
          required
        />

        <label for="studentId">Twój numer albumu</label>
        <input
          id="studentId"
          v-model="studentId"
          type="text"
          placeholder="Wprowadź numer albumu"
          required
        />

        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? "Rejestracja..." : "Zarejestruj" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

// Funkcja pomocnicza do dekodowania JWT – wyciąga payload
function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return JSON.parse(window.atob(base64));
  } catch (e) {
    console.error("Błąd dekodowania JWT:", e);
    return null;
  }
}

const route = useRoute();
const router = useRouter();

// Pobieramy token rejestracyjny z URL (przekazywany jako param lub query)
const urlToken = ref<string>("");
// Wyciągamy identyfikator użytkownika z tokena (np. z pola "sub")
const userId = ref<string>("");

// Stan rejestracji – czy dla danego użytkownika urządzenie jest już zarejestrowane
const deviceAlreadyRegistered = ref(false);

// Pola formularza
const deviceNameInput = ref("");
const firstName = ref("");
const lastName = ref("");
const studentId = ref("");

// Komunikaty i stan ładowania
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const resetMessage = ref<string | null>(null);
const loading = ref<boolean>(false);

onMounted(() => {
  // Pobierz token z URL (params lub query)
  urlToken.value =
    (route.params.token as string) || (route.query.token as string) || "";
  if (!urlToken.value) {
    errorMessage.value = "Brak tokenu rejestracyjnego w adresie URL.";
    return;
  }

  // Dekoduj token i wyciągnij identyfikator użytkownika (pole "sub")
  const payload = parseJwt(urlToken.value);
  if (!payload || !payload.sub) {
    errorMessage.value = "Token rejestracyjny jest nieprawidłowy.";
    return;
  }
  userId.value = payload.sub;

  // Sprawdź w localStorage, czy dla tego użytkownika jest zapisany token
  const saved = localStorage.getItem("registeredDeviceTokens");
  const tokensMap = saved ? JSON.parse(saved) : {};
  if (tokensMap[userId.value]) {
    deviceAlreadyRegistered.value = true;
    successMessage.value = "Urządzenie jest już zarejestrowane!";
  }
});

const registerDevice = async () => {
  if (!urlToken.value) {
    errorMessage.value = "Brak tokenu. Sprawdź poprawność linku.";
    return;
  }
  loading.value = true;
  errorMessage.value = null;
  successMessage.value = null;
  try {
    await axios.post(
      "https://attendme-backend.runasp.net/user/device/register",
      {
        deviceName: deviceNameInput.value,
        studentName: firstName.value,
        studentSurname: lastName.value,
        albumIdNumber: studentId.value,
      },
      { headers: { Authorization: `Bearer ${urlToken.value}` } }
    );
    successMessage.value = "Urządzenie zostało pomyślnie zarejestrowane!";

    // Zapisz token w localStorage w obiekcie kluczowanym po userId
    const saved = localStorage.getItem("registeredDeviceTokens");
    const tokensMap = saved ? JSON.parse(saved) : {};
    tokensMap[userId.value] = urlToken.value;
    localStorage.setItem("registeredDeviceTokens", JSON.stringify(tokensMap));

    deviceAlreadyRegistered.value = true;
  } catch (error) {
    console.error("Błąd rejestracji urządzenia:", error);
    errorMessage.value =
      "Nie udało się zarejestrować urządzenia. Spróbuj ponownie.";
  } finally {
    loading.value = false;
  }
};

const resetDevice = async () => {
  // Pobierz token z localStorage dla danego usera
  const saved = localStorage.getItem("registeredDeviceTokens");
  const tokensMap = saved ? JSON.parse(saved) : {};
  const userToken = tokensMap[userId.value];
  if (!userToken) {
    resetMessage.value = "Brak zarejestrowanego urządzenia.";
    return;
  }
  try {
    // Przekażemy jako parametr deviceUserId (przyjmujemy, że userId jest tym samym identyfikatorem)
    await axios.post(
      "https://attendme-backend.runasp.net/user/device/reset",
      {},
      {
        headers: { Authorization: `Bearer ${userToken}` },
        params: { deviceUserId: userId.value },
      }
    );
    resetMessage.value = "Urządzenie zostało zresetowane.";
    // Usuń token dla tego użytkownika z localStorage
    delete tokensMap[userId.value];
    localStorage.setItem("registeredDeviceTokens", JSON.stringify(tokensMap));
    deviceAlreadyRegistered.value = false;
    successMessage.value = null;
  } catch (error) {
    console.error("Błąd resetowania urządzenia:", error);
    resetMessage.value = "Nie udało się zresetować urządzenia.";
  }
};

const goToScan = () => {
  window.location.href = "https://attendme.runasp.net/#/student/generate-qr";
};

const goToDashboard = () => {
  router.push("/student/dashboard");
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
  margin-top: 20px;
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
  box-sizing: border-box;
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

.submit-button:hover {
  background-color: #005c34;
}

.success-container {
  text-align: center;
  margin-top: 20px;
}

.error {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}

.success {
  color: green;
  font-weight: bold;
  margin-bottom: 10px;
}

.scan-button,
.dashboard-button,
.reset-button {
  width: 100%;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
  font-weight: bold;
}

.scan-button {
  background-color: #007b45;
  color: white;
}

.scan-button:hover {
  background-color: #005c34;
}

.dashboard-button {
  background-color: #f5a623;
  color: white;
}

.dashboard-button:hover {
  background-color: #d98e18;
}

.reset-button {
  background-color: #d9534f;
  color: white;
}

.reset-button:hover {
  background-color: #c9302c;
}

.reset-message {
  margin-top: 10px;
  font-weight: bold;
  color: #28a745;
}
</style>
