<template>
  <div>
    <h2>Twój kod QR</h2>
    <qrcode-vue :value="qrCode" :size="200" level="H" />
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import QrcodeVue from "qrcode.vue";

const qrCode = ref("");
const message = ref("");

async function generateQRCode() {
  try {
    const response = await axios.get(
      "https://attendme-backend.runasp.net/api/user/attendance/ticket",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    qrCode.value = response.data.token;
  } catch (error) {
    message.value = "Nie udało się wygenerować kodu QR.";
  }
}

onMounted(generateQRCode);
</script>
