import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import TeacherDashboard from '../views/TeacherDashboard.vue';
import StudentDashboard from '../views/StudentDashboard.vue';
import SessionDetails from '../views/SessionDetails.vue';
import RegisterDevice from '../views/RegisterDevice.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/teacher', component: TeacherDashboard },
  { path: '/student', component: StudentDashboard },
  { path: '/session/:id', component: SessionDetails },
  { path: '/register-device', component: RegisterDevice }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;