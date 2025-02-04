<template>
  <div>
    <h1>Pulpit studenta</h1>
    <ul>
      <li v-for="session in sessions" :key="session.id">
        {{ session.courseName }} - {{ session.date }}
        <button @click="registerAttendance">Rejestruj obecność</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const sessions = ref([]);

async function fetchSessions() {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    "https://attendme-backend.runasp.net/api/course/student/sessions",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  sessions.value = response.data;
}

async function registerAttendance() {
  await axios.post(
    "https://attendme-backend.runasp.net/api/course/attendance/register",
    {},
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  alert("Obecność zarejestrowana!");
}

onMounted(fetchSessions);
</script>
