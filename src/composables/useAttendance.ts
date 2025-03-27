import axios from 'axios';
import { ref } from 'vue';
import { getAuthToken } from './useAuth';
import { setError } from './useError';
import { BACKEND_URL } from '../main';

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
  dateCreated: string;
}

export const attendanceList = ref<Attendance[]>([]);
export const attendanceCount = ref<number>(0);
export const isPresent = ref<boolean>(false);

export async function fetchAttendance(
    courseGroupId: number,
    courseSessionId: number,
    token: string
  ) {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/course/student/attendance/get?courseGroupId=${courseGroupId}`,
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

export async function toggleAttendance(attender: Attendance) {
  const token = getAuthToken();
  if (!token) return;
  const newStatus = !attender.wasUserPresent;
  try {
    await axios.get(
      `${BACKEND_URL}/course/session/attendance/toggle`,
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
