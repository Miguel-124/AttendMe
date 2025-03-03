import { ref } from 'vue';
import axios from 'axios';
import { getAuthToken } from './useAuth';

export interface Session {
  courseId: number;
  courseName: string;
  courseGroupId: number;
  courseGroupName: string;
  courseSessionId: number;
  locationName: string;
  dateStart: string;
  dateEnd: string;
}

export const sessions = ref<Session[]>([]);

export async function fetchSessions(url: string, filters: Record<string, string | null> = {}) {
  const token = getAuthToken();
  if (!token) return;
  try {
    const response = await axios.post(
      url,
      { pageNumber: 1, pageSize: 999999, filters },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    sessions.value = response.data.items || [];
  } catch (error) {
    console.error("Błąd pobierania sesji:", error);
  }
}
