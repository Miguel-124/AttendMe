import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from 'axios';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Konfiguracja globalnego interceptora
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem("authData");
      
      // Stwórz popup
      const popup = document.createElement('div');
      popup.innerText = "Zostałeś wylogowany, zaloguj się ponownie";
      popup.style.position = "fixed";
      popup.style.top = "20px";
      popup.style.left = "50%";
      popup.style.transform = "translateX(-50%)";
      popup.style.backgroundColor = "#28a745";
      popup.style.color = "white";
      popup.style.padding = "10px 20px";
      popup.style.borderRadius = "8px";
      popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      popup.style.zIndex = "10000";
      document.body.appendChild(popup);

      setTimeout(() => {
        // Usuń popup i przekieruj
        document.body.removeChild(popup);
        router.push("/");
      }, 3000);
    }
    return Promise.reject(error);
  }
);
