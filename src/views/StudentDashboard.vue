<template>
  <div class="teacher-dashboard">
    <header class="navbar">
      <div class="navbar-container">
        <a href="#" class="logo">
          <img src="@/assets/logo.png" alt="AttendMe logo" />
        </a>

        <!-- Hamburger Menu  -->
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

    <!-- Lista zajęć -->
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
        <div class="session-time" v-html="formatSessionDate(session.dateStart, session.dateEnd)"></div>

        <!-- Sekcja z opisem zajęć -->
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
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/pl";

dayjs.locale("pl");

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
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      }
    );

    const userData = response.data;

    userName.value = `${userData.name} ${userData.surname}`;

    if (userData.isTeacher) {
      userRole.value = "Nauczyciel";
    } else if (userData.isStudent) {
      userRole.value = "Uczeń";
    } else if (userData.isAdmin) {
      userRole.value = "Administrator";
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
  let dateStart = null;
  let dateEnd = null;

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
    const response = await axios.post(
      "https://attendme-backend.runasp.net/course/student/sessions/get",
      {
        pageNumber: 1,
        pageSize: 999999,
        filters,
      },
      {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      }
    );

    sessions.value = response.data.items || [];
  } catch (error) {
    console.error("Błąd pobierania sesji ucznia:", error);
  }
}

watch(dateFilter, fetchSessions);

onMounted(async () => {
  await fetchUserData();
  await fetchSessions();
});

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
  sessionStorage.removeItem("token");
  localStorage.removeItem("token");
  router.push("/");
}

function openSession(id: number) {
  router.push(`/session/${id}`);
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

watch(dateFilter, fetchSessions);
onMounted(fetchSessions);
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  border-radius: 5px;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo img {
  height: 100px;
  border-radius: 20%;
}

.navbar-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  color: #000000;
  font-weight: bold;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  min-width: 180px;
  border: 1px solid #ccc;
  list-style: none;
}

.dropdown-header {
  font-weight: bold;
  color: #000000;
  font-size: 16px;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #000000;
}

.dropdown-item:hover {
  background: #e0e0e0;
}

.badge {
  display: inline-block;
  padding: 5px 10px;
  font-size: 12px;
  background: #007bff;
  color: white;
  border-radius: 12px;
  font-weight: bold;
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

h5 {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  color: #000000;
  margin-bottom: 10px;
}

.form-select,
.form-control {
  width: 50%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #000000;
  font-weight: bold;
  color: #000000;
}

/* Kontener listy */
.session-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 800px;
}

/* Każdy element listy */
.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  margin: 15px 0;
  color: #000000;
  transition: transform 0.2s ease;
}
.session-item:hover {
  transform: scale(1.01);
}

/* Sekcja daty/godziny (po lewej) */
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

/* Sekcja z nazwą przedmiotu, lokalizacją, grupą */
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

/* Przycisk "Szczegóły" */
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
  align-self: flex-start;
}
.btn-details:hover {
  background: #0056b3;
}

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

.no-sessions-alert i {
  font-size: 20px;
}

</style>
