<template>
  <div id="app">
    <h1>AttendMe</h1>
    <!-- 🔥 Jeśli to się nie pojawia, to Vue się nie renderuje -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
console.log("✅ `App.vue` załadowane!");
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}
</style>
