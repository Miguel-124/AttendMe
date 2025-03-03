<template>
  <div class="dashboard">
    <header class="navbar">
      <div class="navbar-container">
        <a href="#" class="logo">
          <img src="@/assets/logo.png" alt="AttendMe logo" />
        </a>
        <button v-if="userRole === 'Uczeń' && hasDeviceToken"
          class="scan-button-dashboard" @click="goToScan">
          Skanuj obecność
        </button>
        <!-- Hamburger Menu -->
        <div class="navbar-right">
          <div class="dropdown">
            <button class="menu-button" @click="toggleMenu">☰</button>
            <ul v-if="showMenu" class="dropdown-menu">
              <li class="dropdown-header">Zalogowany</li>
              <li class="dropdown-item">
                <b>{{ userName }}</b>
                <span class="badge">{{ userRole }}</span>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li><a class="dropdown-item" @click="logout">Wyloguj</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>

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
import { useAuth } from '@/composables/useAuth';
import { fetchUserData, userName, userRole } from '@/composables/useUser';
import { fetchSessions, sessions } from '@/composables/useSessions';
import { fetchAttendanceList, attendanceList, toggleAttendance } from '@/composables/useAttendance';
import { getUserDeviceName, resetDevice, deviceName, deviceTokenLoading, resetMessage } from '@/composables/useDevice';
import { formatDate, formatTimeRange, formatSessionDate } from '@/composables/useFormatters';
import { useRouter } from 'vue-router';
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
const showMenu = ref(false);
const dateFilter = ref("all");
const searchText = ref("");

const userName = ref("Ładowanie...");
const userRole = ref("");
const hasDeviceToken = ref(false);


async function fetchUserData() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return;
  }
  const authData = JSON.parse(storedData);
  try {
    const response = await axios.get(
      "https://attendme-backend.runasp.net/user/get",
      {
        headers: { Authorization: `Bearer ${authData.token}` },
      }
    );
    const userData = response.data;
    userName.value = `${userData.name} ${userData.surname}`;
    if (userData.isTeacher) {
      userRole.value = "Nauczyciel";
    } else if (userData.isStudent) {
      userRole.value = "Uczeń";
    } else {
      userRole.value = "Nieznana rola";
    }
  } catch (error) {
    console.error("Błąd pobierania danych użytkownika:", error);
    userName.value = "Błąd ładowania";
  }
}

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

function logout() {
  sessionStorage.removeItem("authData");
  localStorage.removeItem("authData");
  router.push("/");
}

function openSession(id: number) {
  if (userRole.value === "Nauczyciel") {
    router.push(`/teacher/session/${id}`);
  } else if (userRole.value === "Uczeń") {
    router.push(`/session/${id}`);
  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

watch(dateFilter, fetchSessions);
onMounted(async () => {
  await fetchUserData();
  await fetchSessions();
  hasDeviceToken.value = !!sessionStorage.getItem("registeredDeviceToken");
});

function goToScan() {
  const baseUrl = window.location.origin;
  window.location.href = `${baseUrl}/student/generate-qr`;
}
</script>

<style scoped>

</style>