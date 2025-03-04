<template>
  <div class="default-layout">
    <HeaderComponent />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import HeaderComponent from "../components/HeaderComponent.vue";
</script>

<!-- <style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style> -->
