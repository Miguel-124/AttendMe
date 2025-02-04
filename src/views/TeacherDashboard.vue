<template>
  <div>
    <h1>Pulpit wykładowcy</h1>
    <button @click="logout">Wyloguj</button>
    <ul>
      <li v-for="session in sessions" :key="session.id">
        {{ session.courseName }} - {{ session.date }}
        <button @click="openSession(session.id)">Szczegóły</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const sessions = ref([]);

async function fetchSessions() {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://attendme-backend.runasp.net/api/course/teacher/sessions",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  sessions.value = response.data;
}

function logout() {
  localStorage.removeItem("token");
  router.push("/");
}

function openSession(id: number) {
  router.push(`/session/${id}`);
}

onMounted(fetchSessions);
</script>
