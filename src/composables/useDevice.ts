import axios from 'axios';
import { ref } from 'vue';
import { getAuthToken } from './useAuth';

export const deviceName = ref("");
export const deviceTokenLoading = ref(false);
export const resetMessage = ref("");

export async function getUserDeviceName(userId: number) {
  const token = getAuthToken();
  if (!token) return;
  try {
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

export async function resetDevice(selectedAttender: { attenderUserId: number; deviceName?: string } | null) {
  const token = getAuthToken();
  if (!token || !selectedAttender) return;
  try {
    await axios.post(
      "https://attendme-backend.runasp.net/user/device/reset",
      {},
      {
        params: { deviceUserId: selectedAttender.attenderUserId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // Aktualizujemy stan – ustawiamy nazwę urządzenia na "Brak zarejestrowanego urządzenia"
    selectedAttender.deviceName = "Brak zarejestrowanego urządzenia";
    resetMessage.value = "Pomyślnie zresetowano urządzenie!";
  } catch (error) {
    console.error("Błąd resetowania urządzenia:", error);
    resetMessage.value = "Wystąpił błąd przy resetowaniu urządzenia.";
  }
}


