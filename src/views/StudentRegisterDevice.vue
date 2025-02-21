<template>
  <div class="registration-container">
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>

    <!-- Komunikaty błędów i sukcesu -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="loading" class="loading">Trwa rejestracja urządzenia...</div>

    <div v-if="successMessage" class="success-container">
      <h1 class="title">Urządzenie zarejestrowane</h1>
      <p class="subtitle">Przejdź do skanowania obecności lub do pulpitu (wymagane logowanie).</p>

      <button class="scan-button" @click="goToScan">Skanuj obecność</button>
      <button class="dashboard-button" @click="goToDashboard">Otwórz pulpit</button>
      <button class="reset-button" @click="resetDevice">Resetuj</button>
      <p v-if="resetMessage" class="reset-message">{{ resetMessage }}</p>
    </div>

    <div v-if="!successMessage" class="form-container">
      <h1 class="title register">Rejestracja urządzenia</h1>
      <p class="subtitle register">
      Rejestrujesz urządzenie, którego będziesz używać do sprawdzania obecności.
      Uzupełnij poniższe dane i naciśnij przycisk "Rejestruj".
      </p>
      <form @submit.prevent="registerDevice">
        <label for="deviceName">Nazwa urządzenia</label>
        <input id="deviceName" v-model="deviceName" type="text" placeholder="Wprowadź nazwę urządzenia" required />

        <label for="firstName">Twoje imię</label>
        <input id="firstName" v-model="firstName" type="text" placeholder="Wprowadź swoje imię" required />

        <label for="lastName">Twoje nazwisko</label>
        <input id="lastName" v-model="lastName" type="text" placeholder="Wprowadź swoje nazwisko" required />

        <label for="studentId">Twój numer albumu</label>
        <input id="studentId" v-model="studentId" type="text" placeholder="Wprowadź numer albumu" required />

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
import axios from "axios"

const route = useRoute();
const router = useRouter();
const token = ref<string>("");

const deviceName = ref("");
const firstName = ref("");
const lastName = ref("");
const studentId = ref("");

const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const resetMessage = ref<string | null>(null);
const loading = ref<boolean>(false);

// Pobranie tokena z URL po zamontowaniu komponentu
onMounted(() => {
  token.value = route.params.token as string || "";
  if (!token.value) {
    errorMessage.value = "Brak tokenu rejestracyjnego w adresie URL.";
  }
});

// Funkcja rejestracji urządzenia
const registerDevice = async () => {
  if (!token.value) {
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
        deviceName: deviceName.value,
        studentName: firstName.value,
        studentSurname: lastName.value,
        albumIdNumber: studentId.value,
      },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    successMessage.value = "Urządzenie zostało pomyślnie zarejestrowane!";
  } catch (err) {
    console.error("Błąd rejestracji:", err);
    errorMessage.value = "Nie udało się zarejestrować urządzenia. Spróbuj ponownie.";
  } finally {
    loading.value = false;
  }
};

// ✅ Przekierowanie do skanowania obecności
const goToScan = () => {
  window.location.href = "https://attendme.runasp.net/#/student/generate-qr";
};

// ✅ Przekierowanie do pulpitu studenta
const goToDashboard = () => {
  router.push("/student/dashboard");
};

// ✅ Funkcja resetowania urządzenia
const resetDevice = async () => {
  try {
    const storedToken = token.value;
    if (!storedToken) {
      resetMessage.value = "Brak tokenu urządzenia.";
      return;
    }

    await axios.post(
      "https://attendme-backend.runasp.net/user/device/reset",
      {},
      {
        headers: { Authorization: `Bearer ${storedToken}` },
      }
    );

    resetMessage.value = "Urządzenie zostało zresetowane.";
  } catch (error) {
    console.error("Błąd resetowania urządzenia:", error);
    resetMessage.value = "Nie udało się zresetować urządzenia.";
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

.submit-button:hover {
  background-color: #005c34;
}

/* Style dla sekcji po rejestracji */
.success-container {
  text-align: center;
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

.scan-button {
  background-color: #007b45;
  color: white;
  width: 100%;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
}

.dashboard-button {
  background-color: #f5a623;
  color: white;
  width: 100%;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
}

.register {
  text-align: center;
  display: block;
  margin: 0 auto;
}

.reset-button {
  background-color: #d9534f;
  color: white;
  width: 100%;
  font-size: 16px;
  padding: 12px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
}

</style>