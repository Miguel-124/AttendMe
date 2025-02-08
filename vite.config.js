import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // ✅ Vite nasłuchuje na localhost:5173
    strictPort: true,
    watch: {
      usePolling: true // ✅ Pomaga w systemach plików z problemami z odświeżaniem
    }
  },
  resolve: {
    alias: {
      "@": "/src" // ✅ Pozwala na użycie `@/views/LoginView.vue` zamiast `../views/LoginView.vue`
    }
  }
});
