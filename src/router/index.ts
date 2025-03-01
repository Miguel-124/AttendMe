import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
//import TeacherDashboard from "../views/TeacherDashboard.vue";
import TeacherSessionDetails from "../views/TeacherSessionDetails.vue";
import TeacherScanner from "../views/TeacherScanner.vue";
//import StudentDashboard from "../views/StudentDashboard.vue";
import StudentRegisterDevice from "../views/StudentRegisterDevice.vue";
import StudentSessionDetails from "../views/StudentSessionDetails.vue";
import StudentGenerateQRCode from "../views/StudentGenerateQRCode.vue";
import Dashboard from "../views/Dashboard.vue";

const routes = [
  { path: "/", component: LoginView },
  // {
  //   path: "/teacher",
  //   component: TeacherDashboard,
  //   meta: { requiresAuth: true },
  // },
  {
    path: "/teacher/session/:id",
    component: TeacherSessionDetails,
    meta: { requiresAuth: true },
  },
  {
    path: "/teacher/scanner/:token",
    component: TeacherScanner,
    meta: { requiresAuth: true },
  },
  // {
  //   path: "/student",
  //   component: StudentDashboard,
  //   meta: { requiresAuth: true },
  // },
  {
    path: "/student/register-device/:token",
    component: StudentRegisterDevice,
    //meta: { requiresAuth: true },
  },
  {
    path: "/session/:id",
    component: StudentSessionDetails,
    meta: { requiresAuth: true },
  },
  {
    path: "/student/generate-qr",
    component: StudentGenerateQRCode,
    //meta: { requiresAuth: true },
  },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!sessionStorage.getItem("authData")) {
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
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
