<template>
  <div class="dashboard">
    <!-- Filtry -->
    <div class="filters-container">
      <h5>Filtry</h5>
      <div class="filters">
        <select v-model="dateFilter" class="form-select">
          <option value="today">Dzisiaj</option>
          <option value="week-ahead">Bieżący tydzień</option>
          <option value="month-ahead">Bieżący miesiąc</option>
          <option value="future">Przyszłe</option>
          <option value="past">Minione</option>
          <option value="all">Wszystkie</option>
        </select>
        <input
          v-model="searchText"
          type="text"
          class="form-control"
          placeholder="Przedmiot, grupa, lokalizacja..."
        />
      </div>
    </div>

    <!-- Lista sesji -->
    <div class="container">
      <div v-if="filteredSessions.length === 0" class="no-sessions-alert">
        <i class="fas fa-exclamation-circle"></i>
        Nie znaleziono zajęć spełniających kryteria wyszukiwania.
      </div>
      <ul class="session-list">
        <li
          v-for="session in filteredSessions"
          :key="session.courseSessionId"
          class="session-item"
        >
          <!-- Sekcja daty i godziny -->
          <div
            class="session-time"
            v-html="formatSessionDate(session.dateStart, session.dateEnd)"
          ></div>
          <!-- Sekcja opisu sesji -->
          <div class="session-content">
            <h4>{{ session.courseName }}</h4>
            <p>{{ session.locationName }}</p>
            <p>{{ session.courseGroupName }}</p>
          </div>
          <!-- Przycisk szczegółów -->
          <button
            class="btn-details"
            @click="openSession(session.courseSessionId)"
          >
            Szczegóły
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "DashboardView",
});
import { ref, onMounted, watch, computed } from "vue";
import { fetchUserData, userRole } from "@/composables/useUser";
//import { fetchSessions, sessions } from "@/composables/useSessions"; //TODO: implement this function
//import { formatSessionDate } from "@/composables/useFormatters"; //TODO: implement this function
import { useRouter } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";
//import "dayjs/locale/pl";
//dayjs.locale("pl");

interface Session {
  courseId: number;
  courseName: string;
  courseGroupId: number;
  courseGroupName: string;
  courseSessionId: number;
  locationName: string;
  dateStart: string;
  dateEnd: string;
}

const router = useRouter();
const sessions = ref<Session[]>([]);
const dateFilter = ref("all");
const searchText = ref("");

const hasDeviceToken = ref(false);

async function fetchSessions() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return;
  }
  const authData = JSON.parse(storedData);
  const now = new Date();
  let dateStart: string | null = null;
  let dateEnd: string | null = null;
  switch (dateFilter.value) {
    case "today":
      dateStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      dateEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();
      break;
    case "week-ahead":
      dateStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      dateEnd = new Date(now.setDate(now.getDate() + 7)).toISOString();
      break;
    case "month-ahead":
      dateStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      dateEnd = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      break;
    case "future":
      dateStart = new Date().toISOString();
      dateEnd = null;
      break;
    case "past":
      dateStart = null;
      dateEnd = new Date().toISOString();
      break;
    case "all":
      dateStart = null;
      dateEnd = null;
      break;
  }
  interface Filters {
    dateStart?: string;
    dateEnd?: string;
  }
  const filters: Filters = {};
  if (dateStart) filters.dateStart = dateStart;
  if (dateEnd) filters.dateEnd = dateEnd;

  try {
    const url =
      userRole.value === "Nauczyciel"
        ? "https://attendme-backend.runasp.net/course/teacher/sessions/get"
        : "https://attendme-backend.runasp.net/course/student/sessions/get";

    const response = await axios.post(
      url,
      { pageNumber: 1, pageSize: 999999, filters },
      { headers: { Authorization: `Bearer ${authData.token}` } }
    );
    sessions.value = response.data.items || [];
  } catch (error) {
    console.error("Błąd pobierania sesji:", error);
  }
}

const filteredSessions = computed(() => {
  return sessions.value.filter((session) => {
    const matchesSearch =
      searchText.value === "" ||
      session.courseName
        .toLowerCase()
        .includes(searchText.value.toLowerCase()) ||
      session.locationName
        .toLowerCase()
        .includes(searchText.value.toLowerCase()) ||
      session.courseGroupName
        .toLowerCase()
        .includes(searchText.value.toLowerCase());
    return matchesSearch;
  });
});

function formatSessionDate(start: string, end: string): string {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  return `${startDate.format("DD.MM.YYYY")} (${startDate.format("dddd")})<br>${startDate.format("HH:mm")} - ${endDate.format("HH:mm")}`;
}

function openSession(id: number) {
  if (userRole.value === "Nauczyciel") {
    router.push(`/teacher/session/${id}`);
  } else if (userRole.value === "Uczeń") {
    router.push(`/session/${id}`);
  }
}

watch(dateFilter, fetchSessions);
onMounted(async () => {
  await fetchUserData();
  await fetchSessions();
  hasDeviceToken.value = !!sessionStorage.getItem("registeredDeviceToken");
});
</script>

<style scoped>
.no-sessions-alert {
  margin: 20px auto;
  max-width: 500px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #412e00;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.btn-details {
  background: #14ad00;
  color: white;
  font-size: 16px;
  border: none;
  padding: 10px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 20px;
}

.btn-details:hover {
  background: #0056b3;
}

.session-content {
  flex: 1;
  margin-left: 20px;
}

.session-content h4 {
  font-size: 20px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 6px;
}

.session-content p {
  margin: 2px 0;
  font-size: 14px;
  color: #555;
  font-weight: bold;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  margin: 15px 0;
  color: #000;
  transition: transform 0.2s ease;
}

.session-item:hover {
  transform: scale(1.01);
}

.session-time {
  min-width: 200px;
  text-align: center;
  color: #555;
  font-size: 14px;
  line-height: 1.4;
  margin-right: 20px;
  border-right: 2px solid #eee;
  padding-right: 20px;
  font-weight: bold;
}

.session-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 800px;
}

.form-select,
.form-control {
  width: 50%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #000;
  font-weight: bold;
  color: #000;
}

.filters-container {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px;
}

.filters {
  display: flex;
  gap: 10px;
}
</style>
