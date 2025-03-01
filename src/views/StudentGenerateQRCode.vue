<template>
  <div class="qr-container">
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>
    <h1 class="title">Kod QR do rejestracji obecności</h1>

    <div v-if="loading" class="loading">Ładowanie kodu QR...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="qr-code">
      <img :src="qrCodeUrl" alt="Kod QR" />
    </div>

    <p class="info">
      Aby zarejestrować obecność, umieść telefon w polu widzenia skanera.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";

const qrCodeUrl = ref("");
const loading = ref(true);
const error = ref("");
let refreshInterval: number | undefined = undefined;

const fetchQRCode = async () => {
  try {
    // Ustaw loading tylko przy pierwszym załadowaniu
    if (!qrCodeUrl.value) {
      loading.value = true;
    }
    const response = await axios.get(
      "https://attendme-backend.runasp.net/user/attendance/ticket/get",
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    console.log("Odpowiedź z serwera:", getToken());

    if (response.data.token) {
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${response.data.token}`;
    } else {
      throw new Error("Brak tokenu w odpowiedzi");
    }
  } catch (err) {
    error.value = "Nie udało się pobrać kodu QR.";
    console.error("Błąd generowania kodu QR:", err);
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  fetchQRCode();
  refreshInterval = setInterval(fetchQRCode, 2000);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
});


function getToken() {
  const stored = sessionStorage.getItem("registeredDeviceToken");
  if (!stored) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return "";
  }
  const parts = stored.split(": ");
  // Zakładamy, że format to "userId: token"
  return parts.length > 1 ? parts[1] : "";
}

</script>

<style scoped>
.qr-container {
  width: 50%;
  border-radius: 20px;
  padding: 20px;
  margin: 50px auto;
  text-align: center;
  background-color: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.logo {
  width: 120px;
  border-radius: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
}

.qr-code img {
  width: 70%;
  margin-top: 20px;
}

.info {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}

.loading {
  font-size: 18px;
  font-weight: bold;
  color: blue;
}

.error {
  font-size: 18px;
  font-weight: bold;
  color: red;
}


</style>
