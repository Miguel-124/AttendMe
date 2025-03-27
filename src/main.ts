import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

//export const BACKEND_URL = "http://127.0.0.1:8000";
export const BACKEND_URL = "https://attendme-backend.runasp.net";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
