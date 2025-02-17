import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView-copyy.vue";
import TeacherDashboard from "../views/TeacherDashboard.vue";
import TeacherSessionDetails from "../views/TeacherSessionDetails.vue";
import TeacherScanner from "../views/TeacherScanner.vue";
import StudentDashboard from "../views/StudentDashboard.vue";
import StudentRegisterDevice from "../views/StudentRegisterDevice.vue";
import StudentSessionDetails from "../views/StudentSessionDetails.vue";
import StudentGenerateQRCode from "../views/StudentGenerateQRCode.vue";

console.log("✅ Router uruchomiony!"); // 🔥 Debugowanie

const routes = [
  { path: "/", component: LoginView },
  { path: "/login", component: LoginView },
  { path: "/teacher", component: TeacherDashboard },
  { path: "/teacher/session/:id", component: TeacherSessionDetails },
  { path: "/teacher/scanner", component: TeacherScanner },
  { path: "/student", component: StudentDashboard },
  { path: "/student/register-device", component: StudentRegisterDevice },
  { path: "/student/session/:id", component: StudentSessionDetails },
  { path: "/student/generate-qr", component: StudentGenerateQRCode },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
