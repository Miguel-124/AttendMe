<template>
  <header class="navbar">
    <div class="navbar-container">
      <a href="#" class="logo" @click="goHome">
        <img src="@/assets/logo.png" alt="AttendMe logo" />
      </a>
      <button
        v-if="userRole === 'Nauczyciel' && hasDeviceToken"
        class="scan-button-dashboard"
        @click="goToScan"
      >
        Skanuj obecność
      </button>
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
            <li>
              <a class="dropdown-item" @click="logout">Wyloguj</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const showMenu = ref(false);
const userName = ref("Ładowanie...");
const userRole = ref("");
const hasDeviceToken = ref(false);
const authStore = useAuthStore();

onMounted(() => {
  if (authStore) {
    try {
      userName.value = authStore.user
        ? `${authStore.user.name} ${authStore.user.surname}`.trim()
        : "Użytkownik";
      userRole.value = authStore.user ? authStore.user.role : "Rola";
    } catch (e) {
      console.error("Błąd parsowania authData", e);
    }
  }
  hasDeviceToken.value = !!sessionStorage.getItem("registeredDeviceToken");
});

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function logout() {
  sessionStorage.removeItem("authData");
  router.push("/");
}

function goToScan() {
  router.push("/student/generate-qr");
}

function goHome() {
  router.push("/");
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

.scan-button-dashboard {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 20px;
  font-size: 16px;
  font-weight: bold;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  color: #000;
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
  color: #000;
  font-size: 16px;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  color: #000;
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
</style>
