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
    <div>
      <h1>Szczegóły zajęć</h1>
      <p>ID: {{ sessionId }}</p>
      <p>Nazwa: {{ session?.courseName }}</p>
      <p>Data: {{ session?.date }}</p>
    </div>
    <div>
      <h2>Lista obecności</h2>
      <table>
        <thead>
          <tr>
            <th>Uczestnik</th>
            <th>Nr albumu</th>
            <th>Obecność</th>
            <th>Akcja</th>
            <th>Urządzenie</th>
            <th>Rejestracja</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attender in attendanceList" :key="attender.attenderUserId">
            <td>{{ attender.userName }} {{ attender.userSurname }}</td>
            <td>{{ attender.studentAlbumIdNumber }}</td>
            <td>
              <span :class="attender.wasUserPresent ? 'present' : 'absent'">
                {{ attender.wasUserPresent ? "Obecny" : "Brak" }}
              </span>
            </td>
            <td>
              <button @click="toggleAttendance(attender)">
                {{ attender.wasUserPresent ? "Odnacz" : "Zaznacz" }}
              </button>
            </td>
            <td>
              <button @click="toggleAttendance(attender)">
                {{ attender.wasUserPresent ? "Odnacz" : "Zaznacz" }}
              </button>
            </td>
            <td>
              <button @click="toggleAttendance(attender)">
                {{ attender.wasUserPresent ? "Odnacz" : "Zaznacz" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
const sessionId = ref(Number(route.params.id));
const session = ref<Session | null>(null);
const showMenu = ref(false);

const userName = ref("");
const userRole = ref("");
const attendanceList = ref<Attendance[]>([]);

interface Attendance {
  attendanceLogId: number | null;
  courseSessionId: number;
  attenderUserId: number;
  userName: string;
  userSurname: string;
  studentAlbumIdNumber: number;
  attendanceLogMinDateCreated: string | null;
  wasUserPresent: boolean;
}

function getToken() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return;
  }
  const authData = JSON.parse(storedData);
  return authData.token;
}

async function fetchUserData() {
  try {
    const response = await axios.get(
      "https://attendme-backend.runasp.net/user/get",
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
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

async function fetchAttendanceList() {
  try {
    const response = await axios.get<Attendance[]>(
      `https://attendme-backend.runasp.net/course/session/attendance-list/get?sessionId=${sessionId.value}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    attendanceList.value = response.data;
  } catch (error) {
    console.error("Błąd pobierania listy obecności:", error);
  }
}

async function toggleAttendance(attender: Attendance) {
  const newStatus = !attender.wasUserPresent;
  try {
    await axios.post(
      "https://attendme-backend.runasp.net/course/session/attendance-list/update",
      {
        attendanceLogId: attender.attendanceLogId,
        attenderUserId: attender.attenderUserId,
        courseSessionId: attender.courseSessionId,
        wasUserPresent: newStatus,
      },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );

    // Aktualizacja lokalnej listy obecności
    attender.wasUserPresent = newStatus;
  } catch (error) {
    console.error("Błąd aktualizacji obecności:", error);
  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

onMounted(async () => {
  await fetchUserData();
  await fetchAttendanceList();
});
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

table {
  width: 90%;
  margin: 20px auto;
  border-collapse: collapse;
  margin-top: 20px;
}

tr {
  background-color: white;
}

th,
td {
  color: black;
  border: 1px solid #ccc;
  padding: 8px;
}

th {
  background-color: #c2c7cb;
  color: black;
  text-align: center;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.present {
  color: white;
  background-color: green;
  padding: 5px;
  border-radius: 4px;
}

.absent {
  color: white;
  background-color: red;
  padding: 5px;
  border-radius: 4px;
}

button {
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  opacity: 0.8;
}
</style>
