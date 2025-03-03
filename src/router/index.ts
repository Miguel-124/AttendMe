import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";

const routes = [
  { path: "/", component: () => import("../views/LoginView.vue") },
  { 
    path: "/teacher/session/:id", 
    component: () => import("../views/TeacherSessionDetails.vue"),
    meta: { requiresAuth: true },
  },
  { 
    path: "/teacher/scanner/:token", 
    component: () => import("../views/TeacherScanner.vue"),
  },
  { 
    path: "/student/register-device/:token", 
    component: () => import("../views/StudentRegisterDevice.vue"),
  },
  { 
    path: "/session/:id", 
    component: () => import("../views/StudentSessionDetails.vue"),
    meta: { requiresAuth: true },
  },
  { 
    path: "/student/generate-qr", 
    component: () => import("../views/StudentGenerateQRCode.vue"),
  },
  { 
    path: "/dashboard", 
    component: () => import("../views/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function showLogoutPopup() {
  const popup = document.createElement("div");
  popup.innerText = "Zostałeś wylogowany, zaloguj się ponownie";
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.backgroundColor = "#28a745";
  popup.style.color = "white";
  popup.style.padding = "10px 20px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  popup.style.zIndex = "10000";
  document.body.appendChild(popup);

  setTimeout(() => {
    document.body.removeChild(popup);
    router.push("/");
  }, 2000);
}

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!sessionStorage.getItem("authData")) {
      showLogoutPopup();
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    next();
  }
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      showLogoutPopup();
    }
    return Promise.reject(error);
});

export default router;
