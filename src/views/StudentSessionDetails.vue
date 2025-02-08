<template>
  <div>
    <h1>Szczegóły zajęć</h1>
    <p>ID: {{ sessionId }}</p>
    <p>Nazwa: {{ session?.courseName }}</p>
    <p>Data: {{ session?.date }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";

interface Session {
  id: number;
  courseName: string;
  date: string;
}

const route = useRoute();
const sessionId = ref(route.params.id);
const session = ref<Session | null>(null);

async function fetchSessionDetails() {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get<Session>(
      `https://attendme-backend.runasp.net/api/course/session/${sessionId.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    session.value = response.data;
  } catch (error) {
    console.error("Błąd pobierania danych sesji", error);
  }
}

onMounted(fetchSessionDetails);
</script>
