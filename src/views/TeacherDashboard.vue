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
          :key="session.id"
          class="session-item"
        >
          <div>
            <strong>{{ session.courseName }}</strong>
            <span>({{ session.date }})</span>
          </div>
          <button class="btn-details" @click="openSession(session.id)">
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

interface Session {
  id: number;
  courseName: string;
  date: string;
}

const router = useRouter();
const sessions = ref<Session[]>([]);
const showMenu = ref(false);
const userName = ref("Paweł Kołodziej");
const userRole = ref("Nauczyciel");
const dateFilter = ref("all");
const searchText = ref("");

/* Funkcja pobierająca sesje */
async function fetchSessions() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return;
  }
  const authData = JSON.parse(storedData);

  // 🔹 Ustalanie zakresu daty na podstawie `dateFilter`
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
      dateEnd = null; // 🔹 Brak limitu końcowego
      break;
    case "past":
      dateStart = null; // 🔹 Brak limitu początkowego
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

const filters: Filters = {}; // 🔹 Teraz jest poprawny typ zamiast `any`

  if (dateStart) filters.dateStart = dateStart;
  if (dateEnd) filters.dateEnd = dateEnd;

  try {
    const response = await axios.post(
      "https://attendme-backend.runasp.net/course/teacher/sessions/get",
      {
        pageNumber: 1,
        pageSize: 999999,
        filters, // 🔹 Dynamiczne filtrowanie daty
      },
      {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      }
    );
    console.log(response.data);

    sessions.value = response.data.items || []; // 🔥 Teraz sessions.value jest tablicą

  } catch (error) {
    console.error("Błąd pobierania sesji nauczyciela:", error);
  }
}



/*    Automatyczne pobieranie nowych danych po zmianie filtra */
watch(dateFilter, fetchSessions);

/*    Pobranie danych po załadowaniu strony */
onMounted(fetchSessions);

/*    Filtrowanie listy sesji na podstawie wyszukiwarki */
const filteredSessions = computed(() => {
  return sessions.value.filter(
    (session) =>
      searchText.value === "" ||
      session.courseName.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

function logout() {
  localStorage.removeItem("token");
  router.push("/");
}

function openSession(id: number) {
  router.push(`/session/${id}`);
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}
</script>

<style scoped>
/* NAVBAR */
.navbar {
  background-color: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  border-radius: 5px;
}

/*    NAVBAR - flexbox dla poprawnego rozmieszczenia */
.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* Logo - po lewej */
.logo img {
  height: 100px;
  border-radius: 20%;
}

/*    Sekcja nawigacji */
.navbar-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

/* MENU - hamburger */
.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  color: #000000;
  font-weight: bold;
}

/* Dropdown */
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

/*    Nagłówek dropdowna */
.dropdown-header {
  font-weight: bold;
  color: #000000;
  font-size: 16px;
}

/*    Opcje menu */
.dropdown-item {
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #000000;
}

/*    Podświetlenie opcji w dropdownie */
.dropdown-item:hover {
  background: #e0e0e0;
}

/* Odznaka (rola użytkownika) */
.badge {
  display: inline-block;
  padding: 5px 10px;
  font-size: 12px;
  background: #007bff;
  color: white;
  border-radius: 12px;
  font-weight: bold;
}

/* FILTRY */
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

/*    LISTA ZAJĘĆ */
.session-list {
  list-style: none;
  padding: 0;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  color: #000000;
}

/*    Przycisk "Szczegóły" */
.btn-details {
  background: #007bff;
  color: white;
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
