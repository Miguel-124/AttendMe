<template>
    <div>
      <h1>Rejestracja urządzenia</h1>
      <button @click="registerDevice">Zarejestruj urządzenie</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import axios from 'axios';
  
  async function registerDevice() {
    const token = localStorage.getItem('token');
    await axios.post('https://attendme-backend.runasp.net/api/user/device/register', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Urządzenie zarejestrowane!");
  }
  </script>