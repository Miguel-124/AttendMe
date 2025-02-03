<template>
    <div>
      <h1>AttendMe - Logowanie</h1>
      <input v-model="login" placeholder="Login" />
      <input v-model="password" type="password" placeholder="Hasło" />
      <button @click="logIn">Zaloguj</button>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  const login = ref('');
  const password = ref('');
  const error = ref('');
  const router = useRouter();
  
  async function logIn() {
    try {
      const response = await axios.post('https://attendme-backend.runasp.net/api/auth/login', {
        loginName: login.value,
        password: password.value
      });
      localStorage.setItem('token', response.data.token);
      
      // Pobierz rolę użytkownika
      const user = await axios.get('https://attendme-backend.runasp.net/api/user/me', {
        headers: { Authorization: `Bearer ${response.data.token}` }
      });
  
      if (user.data.role === 'Teacher') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }
    } catch (err) {
      error.value = "Niepoprawne dane logowania";
    }
  }
  </script>