import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

console.log("✅ Vue uruchomione!");

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.mount("#app");

console.log("✅ Aplikacja zamontowana!");