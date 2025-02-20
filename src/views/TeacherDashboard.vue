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
      <div
        v-if="filteredSessions.length === 0"
        class="alert alert-warning mt-2"
      >
        Nie znaleziono zajęć spełniających kryteria wyszukiwania.
      </div>
      <ul class="session-list">
        <li
          v-for="session in filteredSessions"
          :key="session.courseSessionId"
          class="session-item"
        >
          <div
            class="session-header session-time"
            v-html="formatSessionDate(session.dateStart, session.dateEnd)"
          ></div>

          <div class="session-content">
            <h4>{{ session.courseName }}</h4>
            <p>{{ session.locationName }}</p>
            <p>{{ session.courseGroupName }}</p>
          </div>
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

// Zmienne do przechowywania danych użytkownika
const userName = ref("name");
const userRole = ref("role");

// Funkcja pobierająca dane użytkownika
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

// Funkcja pobierająca sesje
async function fetchSessions() {
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
      "https://attendme-backend.runasp.net/course/teacher/sessions/get",
      {
        pageNumber: 1,
        pageSize: 999999,
        filters,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    sessions.value = response.data.items || [];
  } catch (error) {
    console.error("Błąd pobierania sesji:", error);
  }
}

// Automatyczne pobieranie nowych danych po zmianie filtra
watch(dateFilter, fetchSessions);

onMounted(async () => {
  await fetchUserData();
  await fetchSessions();
});

// Filtrowanie listy sesji na podstawie wyszukiwarki
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

function getToken() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return "";
  }
  const authData = JSON.parse(storedData);
  return authData.token;
}

function logout() {
  localStorage.removeItem("token");
  router.push("/");
}

function openSession(id: number) {
  router.push(`/teacher/session/${id}`);
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

h4 {
  font-size: 20px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 5px;
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

.session-list {
  list-style: none;
  padding: 0;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin: 10px 30px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  color: #000000;
}

.session-header {
  font-size: 16px;
  font-weight: bold;
  color: #000000;
}

.btn-details {
  background: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-details:hover {
  background: #0056b3;
}
</style>
