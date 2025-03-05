import { useAuthStore } from "@/stores/authStore";
import { computed } from "vue";

export function useAuth() {
  const authStore = useAuthStore();
  const authToken = computed(() => authStore.isAuthenticated);

  return { authToken };
}
