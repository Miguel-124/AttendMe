import axios from 'axios';
import { ref } from 'vue';
import { getAuthToken } from './useAuth';

export interface Attendance {
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

export const attendanceList = ref<Attendance[]>([]);
export const attendanceCount = ref<number>(0);
export const isPresent = ref<boolean>(false);

export async function fetchAttendanceList(sessionId: number) {
  const token = getAuthToken();
  if (!token) return;
  try {
    const response = await axios.get<Attendance[]>(
      `https://attendme-backend.runasp.net/course/session/attendance-list/get?sessionId=${sessionId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    attendanceList.value = response.data;
  } catch (error) {
    console.error("Błąd pobierania listy obecności:", error);
  }
}

export async function toggleAttendance(attender: Attendance) {
  const token = getAuthToken();
  if (!token) return;
  const newStatus = !attender.wasUserPresent;
  try {
    await axios.get(
      `https://attendme-backend.runasp.net/course/session/attendance/toggle`,
      {
        params: {
          attendingUserId: attender.attenderUserId,
          courseSessionId: attender.courseSessionId,
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
