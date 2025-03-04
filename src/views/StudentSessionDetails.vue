<template>
  <div class="session-details">
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

        <p class="session-info">
          <span>Termin: </span>
          <strong>{{ formatDate(sessionDetails.dateStart) }}</strong>
        </p>
        <p class="session-info">
          <span>Godziny: </span>
          <strong
            >{{ formatTime(sessionDetails.dateStart) }} -
            {{ formatTime(sessionDetails.dateEnd) }}</strong
          >
        </p>
        <p class="session-info">
          <span>Lokalizacja: </span>
          <strong>{{ sessionDetails.locationName }}</strong>
        </p>

        <div class="progress-bars">
          <div class="progress-container">
            <p class="progress-text">
              Frekwencja dotychczasowa:
              <strong
                >{{ attendanceCount }} z {{ totalSessions }} -
                {{ attendancePercentage }}%</strong
              >
            </p>
            <div class="progress-bar">
              <div
                class="progress red"
                :style="{ width: attendancePercentage + '%' }"
              ></div>
            </div>
          </div>

          <div class="progress-container">
            <p class="progress-text">
              Zaawansowanie kursu:
              <strong>{{ totalSessions }} z {{ totalSessions }} - 100%</strong>
            </p>
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
import { useRoute } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/pl";
import { setError } from "@/composables/useError";

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
const sessionDetails = ref<SessionDetails | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const isPresent = ref<boolean>(false);
const attendanceCount = ref<number>(0);
const totalSessions = ref<number>(8);
const userName = ref<string>("Ładowanie...");
const userRole = ref<string>("");
const hasDeviceToken = ref(false);

async function fetchSessionDetails() {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    setError("Brak danych autoryzacyjnych.");
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

    const foundSession = response.data.items.find(
      (s: SessionDetails) => s.courseSessionId === courseSessionId
    );
    if (!foundSession) {
      throw new Error("Nie znaleziono sesji.");
    }

    sessionDetails.value = foundSession;

    await fetchAttendance(
      foundSession.courseGroupId,
      courseSessionId,
      authData.token
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(`Błąd: ${err.message}`);
    } else {
      setError("Nieznany błąd pobierania danych.");
    }
  } finally {
    loading.value = false;
  }
}

async function fetchAttendance(
  courseGroupId: number,
  courseSessionId: number,
  token: string
) {
  try {
    const response = await axios.get(
      `https://attendme-backend.runasp.net/course/student/attendance/get?courseGroupId=${courseGroupId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const studentAttendances: Attendance[] = response.data;
    attendanceCount.value = studentAttendances.length;
    isPresent.value = studentAttendances.some(
      (a) => a.courseSessionId === courseSessionId
    );
  } catch {
    setError("Błąd pobierania frekwencji.");
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

function formatDate(date: string): string {
  return dayjs(date).format("D MMMM YYYY");
}

function formatTime(date: string): string {
  return dayjs(date).format("HH:mm");
}

const attendancePercentage = computed(() => {
  return totalSessions.value > 0
    ? Math.round((attendanceCount.value / totalSessions.value) * 100)
    : 0;
});

onMounted(() => {
  fetchSessionDetails();
  fetchUserData();
  hasDeviceToken.value = !!sessionStorage.getItem("registeredDeviceToken");
});
</script>

<style scoped>
.red {
  background: red;
}

.blue {
  background: #007bff;
}

.progress-bars {
  margin-top: 20px;
}

.progress-container {
  margin-bottom: 10px;
}

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

.session-info {
  font-size: 16px;
  color: #000;
  margin: 5px 0;
}

.session-info span {
  font-weight: bold;
  color: #007b45;
}

.session-info strong {
  font-weight: bold;
}

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

.session-details {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
  background: white;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.course-title {
  font-size: 26px;
  font-weight: bold;
  font-family: "Arial", sans-serif;
  color: #000;
}
</style>
