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

    <!-- 🔁 Przycisk zmiany kamery -->
    <button v-if="!loading && !error" class="switch-camera" @click="switchCamera">
      Zmień kamerę
    </button>
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
const activeCamera = ref<number>(0); // Przechowuje indeks aktywnej kamery

onMounted(async () => {
  token.value = (route.params.token as string) || (route.query.token as string) || "";

  if (!token.value) {
    error.value = "Brak tokenu skanera w adresie URL.";
    return;
  }

  // ✅ Sprawdzenie kompatybilności BarcodeDetector
  if ("BarcodeDetector" in window) {
    console.log("✅ BarcodeDetector dostępny.");
  } else {
    console.warn("❌ BarcodeDetector nie jest obsługiwany.");
  }

  // ✅ Debugowanie dostępu do kamery
  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("📸 Dostęp do kamery uzyskany!");
  } catch (err) {
    console.error("❌ Błąd dostępu do kamery:", err);
    error.value = "Nie można uzyskać dostępu do kamery. Sprawdź uprawnienia.";
    loading.value = false;
  }
});

const onCameraInit = async (promise: Promise<void>) => {
  try {
    await promise;
    loading.value = false; // ✅ Kamera działa, ukryj ładowanie
    console.log("✅ Kamera uruchomiona!");
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

// 🔁 Zmiana aktywnej kamery
const switchCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === "videoinput");

    if (videoDevices.length > 1) {
      activeCamera.value = (activeCamera.value + 1) % videoDevices.length;
      console.log(`📷 Zmiana kamery na: ${videoDevices[activeCamera.value].label}`);
    } else {
      console.warn("⚠️ Brak dodatkowych kamer do przełączenia.");
    }
  } catch (err) {
    console.error("❌ Błąd zmiany kamery:", err);
    error.value = "Nie udało się przełączyć kamery.";
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

/* ✅ Nowy styl dla podglądu kamery */
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

/* 🔁 Przycisk zmiany kamery */
.switch-camera {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 10px;
  cursor: pointer;
}

.switch-camera:hover {
  background-color: #0056b3;
}
</style>
