import { ref } from 'vue';

export const authToken = ref('');

export function setAuthToken(token: string) {
  authToken.value = token;
  sessionStorage.setItem("authData", JSON.stringify({ token }));
}

export function getAuthToken(): string {
  const storedData = sessionStorage.getItem("authData");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return "";
  }
  try {
    const authData = JSON.parse(storedData);
    return authData.token || "";
  } catch (e) {
    console.error("Błąd parsowania authData", e);
    return "";
  }
}

export function clearAuth() {
  authToken.value = "";
  sessionStorage.removeItem("authData");
}
