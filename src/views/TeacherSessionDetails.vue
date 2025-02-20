<!-- eslint-disable vue/require-toggle-inside-transition -->
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

    <!-- KARTA ZAJĘĆ -->
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
      <div class="lesson-actions">
        <button class="device-btn orange" @click="openQrScanner">
          <i class="fas fa-qrcode"></i> Skanuj Obecność
        </button>
      </div>
    </div>

    <!-- LISTA OBECNOŚCI -->
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
              <td>
                <strong
                  >{{ attender.userName }} {{ attender.userSurname }}</strong
                >
              </td>
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
                  {{ attender.wasUserPresent ? "Zanacz" : "Odznacz" }}
                </button>
              </td>
              <!-- PRZYCISK URZĄDZENIE -->
              <td class="center">
                <button
                  :class="getDeviceButtonClass(attender)"
                  @click="openDeviceModal(attender)"
                >
                  <i class="fas fa-eye"></i>
                  {{ getDeviceButtonText(attender) }}
                </button>
              </td>
              <td class="center">
                <button class="register-btn" @click="copyRegistrationLink(attender.attenderUserId)">
                  <i class="fas fa-qrcode"></i> Rejestruj
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL URZĄDZENIA Z TRANSITION (płynne otwieranie/zamykanie) -->
    <transition name="modal-fade">
      <div v-if="showDeviceModalFlag" class="modal-backdrop">
        <transition name="modal-scale">
          <div class="modal-content">
            <!-- Ikonka X w rogu -->
            <div class="close-button" @click="closeDeviceModal">×</div>

            <h2 class="modal-title">
              {{ selectedAttender?.userName }}
              {{ selectedAttender?.userSurname }}
            </h2>
            <p v-if="deviceTokenLoading">Ładowanie urządzenia...</p>
            <p v-else class="device-name">
              {{ deviceName }}
            </p>
            <p v-if="resetMessage" class="reset-message">
              {{ resetMessage }}
            </p>
            <div class="modal-actions">
              <button class="reset-btn" @click="resetDevice">Resetuj</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
    <transition name="modal-fade">
          <div v-if="showQrModal" class="modal-backdrop">
            <transition name="modal-scale">
              <div class="modal-content">
                <div class="close-button" @click="showQrModal = false">×</div>
                <h2 class="modal-title">Skaner obecności</h2>
                <p>Do sprawdzania obecności wymagane jest urządzenie wyposażone w kamerę (tablet lub telefon). Zeskanuj na nim poniższy kod QR lub otwórz adres url, który możesz skopiować poniższym przyciskiem. Sprawdzenie obecności polega na umieszczeniu w polu widzenia kamery skanera kodu QR wygnerowanego na ekranie telefonu uczestnika.</p>
                <img :src="'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + qrCodeUrl" alt="QR Code">
                <button @click="copyQrCodeUrl" class="reset-btn">Skopiuj adres</button>
              </div>
            </transition>
          </div>
        </transition>
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

// --- MODAL URZĄDZENIA ---
const showDeviceModalFlag = ref(false);
const selectedAttender = ref<Attendance | null>(null);
const deviceName = ref("");
const deviceTokenLoading = ref(false);
const resetMessage = ref("");

const showQrModal = ref(false);
const qrCodeUrl = ref("");


interface Attendance {
  attendanceLogId: number | null;
  courseSessionId: number;
  attenderUserId: number;
  userName: string;
  userSurname: string;
  studentAlbumIdNumber: number;
  attendanceLogMinDateCreated: string | null;
  wasUserPresent: boolean;
  deviceName?: string;
}

interface Session {
  courseName: string;
  courseGroupName: string;
  courseSessionId: number;
  locationName: string;
  dateStart: string;
  dateEnd: string;
}

async function openQrScanner() {
  try {
    const response = await axios.get(
      `https://attendme-backend.runasp.net/course/session/attendance/scanner/token/get`,
      {
        params: { courseSessionId: sessionId.value },
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );

    const token = response.data.token;
    if (!token) {
      console.error("Nie udało się pobrać tokenu skanera.");
      return;
    }

    qrCodeUrl.value = `https://attendme.runasp.net/#/teacher/scanner/${token}`;
    showQrModal.value = true;
  } catch (error) {
    console.error("Błąd pobierania tokena skanera:", error);
  }
}


async function copyRegistrationLink(userId: number) {
  try {
    const response = await axios.get(
      `https://attendme-backend.runasp.net/user/device/register/token/get`,
      {
        params: { deviceUserId: userId },
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );

    const token = response.data.token;
    if (!token) {
      console.error("Nie udało się pobrać tokenu.");
      return;
    }

    const registrationLink = `http://localhost:5173/student/register-device/${token}`;
    await navigator.clipboard.writeText(registrationLink);
  } catch (err) {
    console.error("Błąd pobierania tokenu:", err);
  }
}


// --- POBIERANIE LISTY SESJI ---
async function fetchSessions() {
  try {
    const response = await axios.post(
      "https://attendme-backend.runasp.net/course/teacher/sessions/get",
      {
        pageNumber: 1,
        pageSize: 999999,
      },
      {
        headers: { Authorization: `Bearer ${getToken()}` },
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

// --- POBIERANIE DANYCH ZALOGOWANEGO UŻYTKOWNIKA ---
async function fetchUserData() {
  try {
    const response = await axios.get(
      "https://attendme-backend.runasp.net/user/get",
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    const userData = response.data;
    userName.value = `${userData.name} ${userData.surname}`;
    userRole.value = userData.isTeacher
      ? "Nauczyciel"
      : userData.isStudent
        ? "Uczeń"
        : userData.isAdmin
          ? "Administrator"
          : "Nieznana rola";
  } catch (error) {
    console.error("Błąd pobierania danych użytkownika:", error);
    userName.value = "Błąd ładowania";
  }
}

// --- POBIERANIE LISTY OBECNOŚCI ---
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

// --- POBIERANIE INFORMACJI O URZĄDZENIU DLA KAŻDEGO UCZNIA ---
async function fetchDevicesForAttendance() {
  await Promise.all(
    attendanceList.value.map(async (attender) => {
      try {
        const token = getToken();
        if (!token) return;
        const response = await axios.get(
          "https://attendme-backend.runasp.net/user/get",
          {
            params: { userId: attender.attenderUserId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        attender.deviceName =
          data.deviceName && data.deviceName.length > 0
            ? data.deviceName
            : "Brak zarejestrowanego urządzenia";
      } catch (error) {
        console.error("Błąd pobierania urządzenia:", error);
        attender.deviceName = "Błąd lub brak urządzenia";
      }
    })
  );
}

// --- ZMIANA STATUSU OBECNOŚCI ---
async function toggleAttendance(attender: Attendance) {
  const token = getToken();
  if (!token) return;
  const newStatus = !attender.wasUserPresent;
  try {
    await axios.get(
      `https://attendme-backend.runasp.net/course/session/attendance/toggle`,
      {
        params: {
          attendingUserId: attender.attenderUserId,
          courseSessionId: sessionId.value,
          addOrRemove: newStatus,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    attender.wasUserPresent = newStatus;
  } catch (error) {
    console.error("Błąd zmiany statusu obecności:", error);
  }
}

// --- OTWIERANIE MODALA URZĄDZENIA ---
function openDeviceModal(attender: Attendance) {
  selectedAttender.value = attender;
  showDeviceModalFlag.value = true;
  resetMessage.value = "";
  document.body.classList.add("modal-open");

  if (attender.deviceName) {
    deviceName.value = attender.deviceName;
    deviceTokenLoading.value = false;
  } else {
    deviceTokenLoading.value = true;
    getUserDeviceName(attender.attenderUserId);
  }
}

// --- POBIERANIE NAZWY URZĄDZENIA DANEGO UCZNIA (fallback) ---
async function getUserDeviceName(userId: number) {
  try {
    const token = getToken();
    if (!token) return;
    const response = await axios.get(
      "https://attendme-backend.runasp.net/user/get",
      {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = response.data;
    deviceName.value =
      data.deviceName && data.deviceName.length > 0
        ? data.deviceName
        : "Brak zarejestrowanego urządzenia";
  } catch (error) {
    console.error("Błąd pobierania urządzenia:", error);
    deviceName.value = "Błąd lub brak urządzenia";
  } finally {
    deviceTokenLoading.value = false;
  }
}

// --- RESET URZĄDZENIA ---
async function resetDevice() {
  try {
    if (!selectedAttender.value) return;
    const token = getToken();
    if (!token) return;
    const deviceUserId = selectedAttender.value.attenderUserId;
    await axios.post(
      "https://attendme-backend.runasp.net/user/device/reset",
      {},
      {
        params: { deviceUserId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    resetMessage.value = "Pomyślnie zresetowano urządzenie!";
  } catch (error) {
    console.error("Błąd resetowania urządzenia:", error);
    resetMessage.value = "Wystąpił błąd przy resetowaniu urządzenia.";
  }
}

// --- ZAMYKANIE MODALA URZĄDZENIA ---
function closeDeviceModal() {
  showDeviceModalFlag.value = false;
  selectedAttender.value = null;
  resetMessage.value = "";
  document.body.classList.remove("modal-open");
}

// --- FUNKCJE DO OKREŚLENIA KLASY I TEKSTU PRZYCISKU URZĄDZENIA ---
function getDeviceButtonClass(attender: Attendance) {
  if (
    attender.deviceName &&
    attender.deviceName !== "Brak zarejestrowanego urządzenia"
  ) {
    return "device-btn yellow";
  } else {
    return "device-btn gray";
  }
}

function getDeviceButtonText(attender: Attendance) {
  if (
    attender.deviceName &&
    attender.deviceName !== "Brak zarejestrowanego urządzenia"
  ) {
    return "Zobacz";
  } else {
    return "Dodaj";
  }
}

// --- POMOCNICZE ---
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
  await fetchDevicesForAttendance();
});
function copyQrCodeUrl() {
  navigator.clipboard.writeText(qrCodeUrl.value).then(() => {
    console.log("Adres skopiowany do schowka");
  }).catch(err => {
    console.error("Błąd kopiowania adresu:", err);
  });
}
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
  z-index: 5;
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
  display: inline-flex;
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
  transform: scale(1.05);
}

.device-btn {
  padding: 10px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.device-btn.yellow {
  background: linear-gradient(135deg, #ffc107, #ffdf6b);
  color: black;
}

.device-btn.orange {
  background: linear-gradient(135deg, #ff8307, #f17508);
  color: rgb(254, 254, 254);
  padding: 10px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.device-btn.gray {
  background: #cccccc;
  color: white;
}
.device-btn:hover {
  transform: scale(1.05);
}

.register-btn {
  background: linear-gradient(135deg, #7028a7, #56d86b);
  color: white;
}

.register-btn:hover {
  transform: scale(1.05);
}

i {
  font-size: 16px;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  position: relative;
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 20px auto;
  text-align: left;
  border-left: 5px solid #007bff;
}

.lesson-actions {
  position: absolute;
  top: 60%;
  right: 40px;
  transform: translateY(-50%);
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

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  padding: 30px 20px;
  border-radius: 12px;
  min-width: 300px;
  max-width: 500px;
  position: relative;
  text-align: center;
  color: black;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 26px;
  cursor: pointer;
}

.modal-title {
  font-weight: bold;
  margin-bottom: 1rem;
}

.device-name {
  display: inline-block;
  margin: 10px 0;
  padding: 10px;
  border: 2px dashed #007bff;
  border-radius: 8px;
  font-weight: 500;
  width: 100%;
}

.reset-message {
  margin-top: 10px;
  color: #28a745;
  font-weight: bold;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.reset-btn {
  background: linear-gradient(135deg, #dc3545, #ff6b6b);
  color: #fff;
  border-radius: 30px;
  padding: 10px 20px;
  transition: transform 0.2s ease;
}
.reset-btn:hover {
  background: linear-gradient(135deg, #b52d2d, #ff3f3f);
  transform: scale(1.05);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.3s ease;
}
.modal-scale-enter,
.modal-scale-leave-to {
  transform: scale(0.8);
}

.modal-open {
  overflow-y: hidden !important;
}
</style>
