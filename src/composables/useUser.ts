import axios from 'axios';
import { ref } from 'vue';
import { getAuthToken } from './useAuth';
import { BACKEND_URL } from '../main';

export const userName = ref("Ładowanie...");
export const userRole = ref("");

export async function fetchUserData() {
  const token = getAuthToken();
  if (!token) return;
  try {
    const response = await axios.get(`${BACKEND_URL}/user/get`, {
      headers: { Authorization: `Bearer ${token}` }
    });
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

