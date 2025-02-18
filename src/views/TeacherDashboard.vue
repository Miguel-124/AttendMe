<template>
  <div class="teacher-dashboard">
    <!-- Nagłówek -->
    <header class="navbar">
      <!-- Opakowanie z flexboxem -->
      <div class="navbar-container">
        <!-- Logo -->
        <a href="#" class="logo">
          <img src="@/assets/logo.png" alt="AttendMe logo" />
        </a>

        <!-- 🔹 Hamburger Menu - TERAZ JEST PO PRAWEJ -->
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
        <input v-model="searchText" type="text" class="form-control" placeholder="Przedmiot, grupa, lokalizacja..." />
      </div>
    </div>

    <!-- Lista zajęć -->
    <div class="container">
      <div v-if="filteredSessions.length === 0" class="alert alert-warning mt-2">
        Nie znaleziono zajęć spełniających kryteria wyszukiwania.
      </div>
      <ul class="session-list">
        <li v-for="session in filteredSessions" :key="session.id" class="session-item">
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
const dateFilter = ref("all"); // Domyślnie wszystkie
const searchText = ref("");

/* 🔹 Funkcja pobierająca sesje */
async function fetchSessions() {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get<Session[]>(
      "https://attendme-backend.runasp.net/course/teacher/session/get",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          filter: dateFilter.value !== "all" ? dateFilter.value : undefined, // 🔹 Tylko jeśli filtr ≠ "all"
        },
      }
    );

    sessions.value = response.data; // Aktualizacja danych
  } catch (error) {
    console.error("Błąd pobierania sesji nauczyciela:", error);
  }
}

/* 🔹 Automatyczne pobieranie nowych danych po zmianie filtra */
watch(dateFilter, fetchSessions);

/* 🔹 Pobranie danych po załadowaniu strony */
onMounted(fetchSessions);

/* 🔹 Filtrowanie listy sesji na podstawie wyszukiwarki */
const filteredSessions = computed(() => {
  return sessions.value.filter(session =>
    (searchText.value === "" || session.courseName.toLowerCase().includes(searchText.value.toLowerCase()))
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
  width: 100%;
  border-radius: 5px;
}

/* 🔹 NAVBAR - flexbox dla poprawnego rozmieszczenia */
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

/* 🔹 Sekcja nawigacji po PRAWEJ STRONIE */
.navbar-right {
  display: flex;
  align-items: center;
  margin-left: auto; /* Przesuwa hamburgera na prawą stronę */
}

/* MENU - hamburger */
.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  color: #000000; /* 🔹 Naprawione: teraz czarny */
  font-weight: bold;
}

/* Dropdown */
.dropdown {
  position: relative;
}

/* 🔹 Tło białe + lepszy cień */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Mocniejszy cień */
  padding: 10px;
  min-width: 180px;
  border: 1px solid #ccc; /* Obrys dla lepszej widoczności */
  list-style: none;

}

/* 🔹 Nagłówek dropdowna */
.dropdown-header {
  font-weight: bold;
  color: #000000; /* Teraz czarny */
  font-size: 16px;
}

/* 🔹 Opcje menu */
.dropdown-item {
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #000000; /* Czarny, zamiast szarego */
}

/* 🔹 Podświetlenie opcji w dropdownie */
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

/* 🔹 Filtry są bardziej czytelne */
.filters {
  display: flex;
  gap: 10px;
}

/* Naprawiony tekst nagłówka "Filtry" */
h5 {
  font-size: 18px;
  font-weight: bold; /* 🔹 Pogrubienie */
  color: #000000; /* 🔹 Czarny tekst */
  margin-bottom: 10px;
}


.form-select,
.form-control {
  width: 50%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #000000; /* Czarna ramka */
  font-weight: bold; /* Pogrubienie tekstu */
  color: #000000; /* Czarny tekst */
}

/* 🔹 LISTA ZAJĘĆ */
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
  font-weight: bold; /* 🔹 Pogrubienie nazw zajęć */
  color: #000000; /* Czarny tekst */
}

/* 🔹 Przycisk "Szczegóły" */
.btn-details {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold; /* 🔹 Tekst pogrubiony */
}

.btn-details:hover {
  background: #0056b3;
}

</style>
