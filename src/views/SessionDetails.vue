<template>
  <div>
    <h1>Szczegóły zajęć</h1>
    <qrcode-vue :value="qrCode" size="200" level="H"></qrcode-vue>
    <button @click="generateQR">Odśwież QR</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import QrcodeVue from "qrcode.vue";

const qrCode = ref("");

async function generateQR() {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://attendme-backend.runasp.net/api/user/attendance-ticket",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  qrCode.value = response.data.token;
}

onMounted(generateQR);
</script>
