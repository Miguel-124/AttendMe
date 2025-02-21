<template>
  <div class="scanner-container">
    <router-link to="/">
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />
    </router-link>

    <h1 class="title">Skaner QR</h1>

    <div v-if="loading" class="loading">Ładowanie skanera...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error" class="scanner">
      <qrcode-stream
        @decode="onScanSuccess"
        @init="onCameraInit"
      ></qrcode-stream>
    </div>

    <div v-if="scannedData" class="result">
      <p>
        Zeskanowany kod: <strong>{{ scannedData }}</strong>
      </p>
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

onMounted(() => {
  token.value = (route.params.token as string) || "";
  if (!token.value) {
    error.value = "Brak tokenu skanera w adresie URL.";
  } else {
    loading.value = false;
  }
});

const onScanSuccess = async (result: string) => {
  scannedData.value = result;
  console.log("Zeskanowany kod:", result);

  try {
    await axios.post(
      "https://attendme-backend.runasp.net/course/session/attendance/scan",
      {
        token: token.value,
        scannedData: result,
      }
    );

    alert("Kod QR został pomyślnie przesłany!");
  } catch (err) {
    console.error("Błąd przesyłania skanu:", err);
    error.value = "Błąd przesyłania skanowania. Spróbuj ponownie.";
  }
};

const onCameraInit = (promise: Promise<void>) => {
  promise.catch(() => {
    error.value = "Nie można uzyskać dostępu do kamery.";
  });
};
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

.loading,
.error {
  font-size: 18px;
  font-weight: bold;
  color: red;
  margin-top: 20px;
}

.scanner {
  width: 100%;
  height: 300px;
  border: 2px solid #007b45;
  border-radius: 10px;
  overflow: hidden;
  margin: 20px auto;
}

.result {
  font-size: 18px;
  font-weight: bold;
  color: #007b45;
  margin-top: 20px;
}
</style>
