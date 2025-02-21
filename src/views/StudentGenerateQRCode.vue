<template>
  <div class="registration-container">
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>

    <!-- Komunikaty błędów i stanu -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="loading" class="loading">Trwa generowanie kodu QR...</div>

    <!-- Sekcja QR z odświeżaniem -->
    <div v-if="qrToken" class="qr-container">
      <h1 class="title">Skanuj QR</h1>
      <img :src="qrCodeUrl" alt="Kod QR" class="qr-code" />
      <p class="subtitle">Odświeżanie kodu co 2 sekundy...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";

const qrToken = ref<string>("");
const qrCodeUrl = ref<string>("");
const errorMessage = ref<string | null>(null);
const loading = ref<boolean>(true);
let refreshInterval: number | null = null;

const fetchQrToken = async () => {
  try {
    const response = await axios.get(
      "https://attendme-backend.runasp.net/user/attendance/ticket/get",
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    qrToken.value = response.data.token;
    qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken.value}`;
  } catch (error) {
    console.error("Błąd pobierania tokena QR:", error);
    errorMessage.value = "Nie udało się pobrać kodu QR.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchQrToken();
  refreshInterval = setInterval(fetchQrToken, 2000); // Odświeżanie co 2 sekundy
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

function getToken() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return "";
  }
  const authData = JSON.parse(storedData);
  return authData.token;
}
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

.qr-container {
  text-align: center;
  margin-top: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  border: 5px solid #007bff;
  border-radius: 10px;
  margin-top: 10px;
}

.subtitle {
  font-size: 16px;
  color: #555;
  margin-top: 10px;
}

.error {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
