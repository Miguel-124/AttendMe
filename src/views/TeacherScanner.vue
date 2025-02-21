<template>
  <div class="scanner-container">
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>

    <h1 class="title">Skaner QR</h1>

    <!-- 🔥 Komunikaty ładowania i błędów -->
    <div v-if="loading" class="loading">Ładowanie skanera...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- ✅ Podgląd z kamery -->
    <div v-if="!loading && !error" class="scanner">
      <qrcode-stream
        @decode="onScanSuccess"
        @init="onCameraInit"
        class="camera-feed"
      ></qrcode-stream>
    </div>

    <!-- ✅ Wynik skanowania -->
    <div v-if="scannedData" class="result">
      <p>Zeskanowany kod: <strong>{{ scannedData }}</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { QrcodeStream } from "vue-qrcode-reader";

const route = useRoute();
const token = ref<string>("");
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const scannedData = ref<string | null>(null);

onMounted(async () => {
  token.value = (route.params.token as string) || (route.query.token as string) || "";
  
  if (!token.value) {
    error.value = "Brak tokenu skanera w adresie URL.";
    return;
  }

  console.log("🔍 Sprawdzam dostępność kamery...");
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === "videoinput");

    if (videoDevices.length === 0) {
      error.value = "❌ Brak dostępnej kamery!";
      loading.value = false;
      return;
    }

    console.log("📷 Znaleziono kamery:", videoDevices);
  } catch (err) {
    console.error("❌ Błąd sprawdzania urządzeń:", err);
    error.value = "Nie można uzyskać dostępu do listy urządzeń.";
    loading.value = false;
  }
});

const onCameraInit = async (promise: Promise<void>) => {
  try {
    await promise;
    loading.value = false; // ✅ Jeśli kamera działa, przestań ładować
    console.log("✅ Kamera uruchomiona poprawnie!");
  } catch (err) {
    console.error("📷 Błąd inicjalizacji kamery:", err);
    error.value = "Nie można uruchomić skanera. Sprawdź uprawnienia.";
    loading.value = false;
  }
};

const onScanSuccess = async (result: string) => {
  scannedData.value = result;
  console.log("📷 Zeskanowany kod:", result);

  if (!token.value) {
    error.value = "Brak tokenu skanera. Nie można przesłać skanu.";
    return;
  }

  try {
    await axios.post(
      "https://attendme-backend.runasp.net/course/session/attendance/scan",
      { token: token.value, scannedData: result },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );

    alert("✅ Kod QR został pomyślnie przesłany!");
  } catch (err) {
    console.error("❌ Błąd przesyłania skanu:", err);
    error.value = "Błąd przesyłania skanowania. Spróbuj ponownie.";
  }
};

// 🔥 Pobieranie tokenu użytkownika
function getToken() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("❌ Brak danych autoryzacyjnych w sessionStorage");
    return "";
  }
  const authData = JSON.parse(storedData);
  return authData.token;
}
</script>

<style scoped>
.scanner-container {
  max-width: 500px;
  border-radius: 20px;
  padding: 20px;
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
  margin-bottom: 20px;
}

.loading, .error {
  font-size: 18px;
  font-weight: bold;
  color: red;
  margin-top: 20px;
}

/* ✅ Styl podglądu kamery */
.scanner {
  width: 100%;
  height: 400px;
  border: 2px solid #007b45;
  border-radius: 10px;
  overflow: hidden;
  margin: 20px auto;
  position: relative;
  background: black;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result {
  font-size: 18px;
  font-weight: bold;
  color: #007b45;
  margin-top: 20px;
}
</style>
