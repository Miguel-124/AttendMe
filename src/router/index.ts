import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import TeacherDashboard from "../views/TeacherDashboard.vue";
import TeacherSessionDetails from "../views/TeacherSessionDetails.vue";
import TeacherScanner from "../views/TeacherScanner.vue";
import StudentDashboard from "../views/StudentDashboard.vue";
import StudentRegisterDevice from "../views/StudentRegisterDevice.vue";
import StudentSessionDetails from "../views/StudentSessionDetails.vue";
import StudentGenerateQRCode from "../views/StudentGenerateQRCode.vue";
import Dashboard from "@/views/Dashboard.vue";

const routes = [
  { path: "/", component: LoginView },
  { path: "/teacher", component: TeacherDashboard },
  { path: "/teacher/session/:id", component: TeacherSessionDetails },
  { path: "/teacher/scanner/:token", component: TeacherScanner },
  { path: "/student", component: StudentDashboard },
  { path: "/student/register-device/:token", component: StudentRegisterDevice },
  { path: "/session/:id", component: StudentSessionDetails },
  { path: "/student/generate-qr", component: StudentGenerateQRCode },
  { path: "/dashboard", component: Dashboard},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
