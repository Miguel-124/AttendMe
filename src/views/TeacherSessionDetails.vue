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
    <div class="lesson-card" v-if="session">
      <h2 class="lesson-title">{{ session.courseName }}</h2>
      <div class="lesson-details">
        <p><strong>Grupa:</strong> {{ session.courseGroupName }}</p>
        <p><strong>Lokalizacja:</strong> {{ session.locationName }}</p>
        <p><strong>Termin:</strong> {{ formatDate(session.dateStart) }}</p>
        <p>
          <strong>Godzina:</strong>
          {{ formatTimeRange(session.dateStart, session.dateEnd) }}
        </p>
      </div>
    </div>

    <div>
      <div class="attendance-container">
        <h2 class="attendance-title">Lista obecności</h2>
        <table class="attendance-table">
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
            <tr
              v-for="attender in attendanceList"
              :key="attender.attenderUserId"
            >
              <td>{{ attender.userName }} {{ attender.userSurname }}</td>
              <td class="center">{{ attender.studentAlbumIdNumber }}</td>
              <td class="center">
                <span :class="attender.wasUserPresent ? 'present' : 'absent'">
                  {{ attender.wasUserPresent ? "Obecny" : "Nieobecny" }}
                </span>
              </td>
              <td class="center">
                <button class="toggle-btn" @click="toggleAttendance(attender)">
                  <i
                    class="fas"
                    :class="attender.wasUserPresent ? 'fa-times' : 'fa-check'"
                  ></i>
                  {{ attender.wasUserPresent ? "Odnacz" : "Zaznacz" }}
                </button>
              </td>
              <td class="center">
                <button class="device-btn">
                  <i class="fas fa-eye"></i> Zobacz
                </button>
              </td>
              <td class="center">
                <button class="register-btn">
                  <i class="fas fa-qrcode"></i> Rejestruj
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/pl";
dayjs.locale("pl");

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

interface Session {
  courseName: string;
  courseGroupName: string;
  courseSessionId: number;
  locationName: string;
  dateStart: string;
  dateEnd: string;
}

async function fetchSessions() {
  try {
    const response = await axios.post(
      "https://attendme-backend.runasp.net/course/teacher/sessions/get",
      {
        pageNumber: 1,
        pageSize: 999999,
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    session.value =
      response.data.items.find(
        (s: Session) => s.courseSessionId === sessionId.value
      ) || null;
  } catch (error) {
    console.error("Błąd pobierania sesji:", error);
  }
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
  const token = getToken();
  if (!token) return;

  const newStatus = !attender.wasUserPresent; // Zmieniamy obecność na przeciwną

  try {
    const response = await axios.get(
      `https://attendme-backend.runasp.net/course/session/attendance/toggle`,
      {
        params: {
          attendingUserId: attender.attenderUserId,
          courseSessionId: sessionId.value,
          addOrRemove: newStatus,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Odpowiedź API:", response.data);

    // Aktualizacja lokalnej listy obecności
    attender.wasUserPresent = newStatus;
  } catch (error) {
    console.error("Błąd zmiany statusu obecności:", error);
  }
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

function formatDate(date: string): string {
  return dayjs(date).format("DD.MM.YYYY");
}

function formatTimeRange(start: string, end: string): string {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  return `${startDate.format("HH:mm")} - ${endDate.format("HH:mm")}`;
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
  await fetchSessions();
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

.attendance-container {
  max-width: 95%;
  margin: 20px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
}

.attendance-title {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 20px;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 8px;
}

.attendance-table thead {
  background: linear-gradient(135deg, #007bff, #00c6ff);
  color: white;
  text-transform: uppercase;
}

.attendance-table th {
  padding: 12px;
  text-align: center;
  font-weight: bold;
}

.attendance-table tr {
  border-bottom: 1px solid #ddd;
  transition: background 0.2s;
}

.attendance-table td {
  padding: 12px;
  text-align: center;
  font-size: 15px;
  color: #333;
}

.present {
  background: linear-gradient(135deg, #28a745, #56d86b);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: bold;
}

.absent {
  background: linear-gradient(135deg, #dc3545, #ff6b6b);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: bold;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.3s ease-in-out;
}

.toggle-btn {
  background: linear-gradient(135deg, #007bff, #00c6ff);
  color: white;
}

.toggle-btn:hover {
  background: linear-gradient(135deg, #0056b3, #0096f5);
}

.device-btn {
  background: linear-gradient(135deg, #ffc107, #ffdf6b);
  color: black;
}

.device-btn:hover {
  background: linear-gradient(135deg, #e0a800, #ffd500);
}

.register-btn {
  background: linear-gradient(135deg, #7028a7, #56d86b);
  color: white;
}

.register-btn:hover {
  background: linear-gradient(135deg, #212188, #44c55b);
}

i {
  font-size: 16px;
}

.lesson-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 20px auto;
  text-align: left;
  border-left: 5px solid #007bff;
}

.lesson-title {
  font-size: 22px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
  text-align: center;
  text-transform: uppercase;
}

.lesson-details p {
  font-size: 16px;
  color: #333;
  margin: 8px 0;
  font-weight: 500;
}

.lesson-details strong {
  color: #007bff;
}
</style>
