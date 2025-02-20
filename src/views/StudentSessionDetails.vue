<template>
  <div class="session-details">
    <header class="navbar">
      <div class="navbar-container">
        <a href="#" class="logo">
          <img src="@/assets/logo.png" alt="AttendMe logo" />
        </a>

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

    <div class="container">
      <div v-if="loading" class="loading">Ładowanie danych...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="sessionDetails">
        <div class="session-header">
          <h2 class="course-title">{{ sessionDetails.courseName }}</h2>
          <div class="attendance-status">
            <p class="attendance-label">Obecność:</p>
            <button class="btn-present" v-if="isPresent">OBECNY</button>
            <button class="btn-absent" v-else>Nieobecny</button>
          </div>
        </div>

        <p class="session-info"><span>Termin:</span> <strong>{{ formatDate(sessionDetails.dateStart) }}</strong></p>
        <p class="session-info"><span>Godziny:</span> <strong>{{ formatTime(sessionDetails.dateStart) }} - {{ formatTime(sessionDetails.dateEnd) }}</strong></p>
        <p class="session-info"><span>Lokalizacja:</span> <strong>{{ sessionDetails.locationName }}</strong></p>

        <div class="progress-bars">
          <div class="progress-container">
            <p class="progress-text">Frekwencja dotychczasowa: <strong>{{ attendanceCount }} z {{ totalSessions }} - {{ attendancePercentage }}%</strong></p>
            <div class="progress-bar">
              <div class="progress red" :style="{ width: attendancePercentage + '%' }"></div>
            </div>
          </div>

          <div class="progress-container">
            <p class="progress-text">Zaawansowanie kursu: <strong>{{ totalSessions }} z {{ totalSessions }} - 100%</strong></p>
            <div class="progress-bar">
              <div class="progress blue" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="error">Nie znaleziono danych sesji.</div>
    </div>
  </div>
</template>




<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/pl";

dayjs.locale("pl");

interface SessionDetails {
  courseSessionId: number;
  courseName: string;
  dateStart: string;
  dateEnd: string;
  locationName: string;
  courseGroupId: number;
}

interface Attendance {
  attendanceLogId: number;
  attenderUserId: number;
  courseSessionId: number;
  dateCreated: string;
}

const route = useRoute();
const router = useRouter();
const sessionDetails = ref<SessionDetails | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const isPresent = ref<boolean>(false);
const attendanceCount = ref<number>(0);
const totalSessions = ref<number>(8);
const showMenu = ref<boolean>(false);
const userName = ref<string>("Ładowanie...");
const userRole = ref<string>("");

async function fetchSessionDetails() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    error.value = "Brak danych autoryzacyjnych.";
    loading.value = false;
    return;
  }
  const authData = JSON.parse(storedData);
  const courseSessionId = Number(route.params.id);

  try {
    const response = await axios.post(
      "https://attendme-backend.runasp.net/course/student/sessions/get",
      {
        pageNumber: 1,
        pageSize: 999999,
      },
      {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      }
    );

    const foundSession = response.data.items.find((s: SessionDetails) => s.courseSessionId === courseSessionId);
    if (!foundSession) {
      throw new Error("Nie znaleziono sesji.");
    }

    sessionDetails.value = foundSession;

    await fetchAttendance(foundSession.courseGroupId, courseSessionId, authData.token);
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = `Błąd: ${err.message}`;
    } else {
      error.value = "Nieznany błąd pobierania danych.";
    }
  } finally {
    loading.value = false;
  }
}

async function fetchAttendance(courseGroupId: number, courseSessionId: number, token: string) {
  try {
    const response = await axios.get(
      `https://attendme-backend.runasp.net/course/student/attendance/get?courseGroupId=${courseGroupId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const studentAttendances: Attendance[] = response.data;
    attendanceCount.value = studentAttendances.length;
    isPresent.value = studentAttendances.some((a) => a.courseSessionId === courseSessionId);
  } catch {
    error.value = "Błąd pobierania frekwencji.";
  }
}

async function fetchUserData() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return;
  }
  const authData = JSON.parse(storedData);

  try {
    const response = await axios.get("https://attendme-backend.runasp.net/user/get", {
      headers: {
        Authorization: `Bearer ${authData.token}`,
      },
    });

    const userData = response.data;

    // Ustawiamy nazwę użytkownika
    userName.value = `${userData.name} ${userData.surname}`;

    // Ustalanie roli użytkownika
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

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function logout() {
  localStorage.removeItem("token");
  router.push("/");
}

function formatDate(date: string): string {
  return dayjs(date).format("D MMMM YYYY");
}

function formatTime(date: string): string {
  return dayjs(date).format("HH:mm");
}

const attendancePercentage = computed(() => {
  return totalSessions.value > 0 ? Math.round((attendanceCount.value / totalSessions.value) * 100) : 0;
});

onMounted(() => {
  fetchSessionDetails();
  fetchUserData();
});

</script>

<style scoped>
.session-details {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  background: white;
}

.navbar {
  background-color: #ffffff;
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

/* Nagłówek */
.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* Styl dla nazwy zajęć */
.course-title {
  font-size: 22px;
  font-weight: bold;
  font-family: "Arial", sans-serif;
  color: #000;
}

/* Obecność */
.attendance-status {
  text-align: right;
}

.attendance-label {
  padding-top: 20px;
  font-size: 16px;
  font-weight: bold;
  font-family: "Arial", sans-serif;
  color: #000;
}

/* Tekst szczegółów sesji */
.session-info {
  font-size: 16px;
  color: #000;
  margin: 5px 0;
}

.session-info span {
  font-weight: normal;
}

.session-info strong {
  font-weight: bold;
}

/* Guziki */
.btn-present {
  background: #007b45;
  color: white;
  padding: 10px 20px;
  border: none;
  font-size: 20px;
  border-radius: 5px;
  font-weight: bold;
}

.btn-absent {
  background: grey;
  color: white;
  padding: 10px 20px;
  border: none;
  font-size: 20px;
  border-radius: 5px;
  font-weight: bold;
}

.progress-bars {
  margin-top: 20px;
}

.progress-container {
  margin-bottom: 10px;
}

/* Pasek postępu */
.progress-text {
  font-size: 14px;
  font-weight: normal;
  color: #000;
}

.progress-text strong {
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 15px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  text-align: center;
  line-height: 15px;
  font-size: 12px;
}

.red {
  background: red;
}

.blue {
  background: #007bff;
}

</style>
