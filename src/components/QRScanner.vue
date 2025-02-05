<template>
  <div>
    <h2>Skanuj kod QR</h2>
    <qrcode-stream @decode="onDecode" />
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import axios from "axios";

const message = ref("");

async function onDecode(result: string) {
  try {
    const response = await axios.post(
      "https://attendme-backend.runasp.net/api/course/attendance/register",
      { token: result },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    message.value = "Obecność zarejestrowana!";
  } catch (error) {
    message.value = "Błąd podczas skanowania kodu QR.";
  }
}
</script>
