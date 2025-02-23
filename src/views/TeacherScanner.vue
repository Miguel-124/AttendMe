<template>
  <div class="page-container">
    <div class="scanner-container">
      <!-- Logo -->
      <img src="@/assets/logo.png" alt="AttendMe logo" class="logo" />

      <!-- Tytuł -->
      <h1 class="title">Skaner QR</h1>

      <!-- Podgląd z kamery -->
      <video ref="video" autoplay playsinline class="camera-feed"></video>
      <!-- Ukryty element canvas do przechwytywania klatek wideo -->
      <canvas ref="canvas" style="display: none;"></canvas>

      <!-- MODAL z dwoma przejściami: fade (dla tła) i scale (dla treści) -->
      <transition name="modal-fade">
        <div v-if="showPopUpModal" class="modal-backdrop">
          <transition name="modal-scale">
            <div v-if="showPopUpModal" class="modal-content">
              <h2 class="modal-title">ZAREJESTROWANO OBECNOŚĆ</h2>
              <p class="modal-text" v-if="responseData">
                {{ responseData.name }} {{ responseData.surname }} 
                Nr Albumu: {{ responseData.student.albumIdNumber }}
              </p>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import jsQR from "jsqr";

export default defineComponent({
  name: "TeacherScanner",
  data() {
    return {
      videoStream: null as MediaStream | null,
      qrResult: null as string | null,
      scanInterval: undefined as number | undefined,
      loading: true, // flaga do wyświetlania komunikatu "Ładowanie skanera..."
      showPopUpModal: false, // steruje widocznością modala
      responseData: null as unknown, // lub zdefiniuj interfejs TS, jeśli chcesz

    };
  },
  
  mounted() {
    // Odczyt tokena z parametru trasy lub query
    const token = this.$route.params.token || this.$route.query.token;
    if (typeof token === 'string') {
      sessionStorage.setItem("scanner_token", token);
    }
    this.startCamera();
  },
  beforeUnmount() {
    // Zatrzymanie strumienia kamery przy zamknięciu komponentu
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(this.scanInterval);
  },
  methods: {
    /**
     * Prośba o dostęp do kamery i włączenie skanowania
     */
    async startCamera() {
      try {
        // Żądanie dostępu do kamery (preferowana tylna kamera)
        this.videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        const videoEl = this.$refs.video as HTMLVideoElement;
        videoEl.srcObject = this.videoStream;
        videoEl.addEventListener("loadedmetadata", () => {
          videoEl.play();
          this.loading = false; // Kamera gotowa
          this.startScanning();
        });
      } catch (error) {
        console.error("Błąd przy uzyskiwaniu dostępu do kamery:", error);
      }
    },

    /**
     * Co 500 ms przechwytujemy klatkę wideo i szukamy w niej kodu QR
     */
    startScanning() {
      this.scanInterval = window.setInterval(() => {
        const video = this.$refs.video as HTMLVideoElement;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const canvas = this.$refs.canvas as HTMLCanvasElement;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext("2d");
          if (!context) return;

          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, canvas.width, canvas.height);

          if (code) {
            // Odczytany kod
            this.qrResult = code.data;
            console.log("Zeskanowany kod:", this.qrResult);

            // Zatrzymanie dalszego skanowania
            clearInterval(this.scanInterval);

            // Wywołujemy funkcję rejestrującą obecność (GET request)
            this.registerAttendance(this.qrResult);
          }
        }
      }, 500); // Skanowanie co 500ms
    },

    async registerAttendance(attenderToken: string) {
      try {
        const response = await axios.get(
          `https://attendme-backend.runasp.net/course/session/attendance/register?attenderToken=${attenderToken}`,
          {
        headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
        console.log("Odpowiedź z backendu:", response.data);
        this.responseData = response.data;

        // Po pomyślnym zarejestrowaniu obecności – pokaż modal
        this.showPopUpModal = true;

        // Automatycznie schowaj modal po 5 sekundach
        setTimeout(() => {
          this.showPopUpModal = false;
        }, 5000);

      } catch (error) {
        console.error("Błąd rejestracji obecności:", error);
        // W razie potrzeby można wyświetlić modal z błędem
      }
    },
  },
});

function getToken() {
  const storedData = sessionStorage.getItem("scanner_token");
  if (!storedData) {
    console.error("Brak danych autoryzacyjnych w sessionStorage");
    return "";
  }
  return storedData;
}
</script>

<style scoped>
/* Kontener całej strony (ciemne tło, wycentrowanie) */
.page-container {
  background-color: #1c1c1c; /* ciemne tło */
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Biała karta w centrum */
.scanner-container {
  background-color: #fff;
  width: 90%;
  border-radius: 20px;
  padding: 20px;
  text-align: center;
}

/* Logo */
.logo {
  width: 100px;
  height: auto;
  border-radius: 20px;
  margin-bottom: 10px;
}

/* Tytuł */
.title {
  font-size: 24px;
  font-weight: bold;
  color: #000;
  margin-bottom: 10px;
}

/* Podgląd z kamery */
.camera-feed {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-top: 10px;
}

/* ========== MODAL + PRZEJŚCIA ========== */

/* Tło (backdrop) za modalem */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Zawartość modala */
.modal-content {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  max-width: 80%;
  text-align: center;
}

/* Tytuł modala */
.modal-title {
  margin-bottom: 10px;
  font-size: 20px;
  color: #007b45;
  font-weight: bold;
}

/* Tekst w modalu */
.modal-text {
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

/* FADE: wchodzenie/wychodzenie tła (modal-backdrop) */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

/* SCALE: wchodzenie/wychodzenie zawartości (modal-content) */
.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.3s;
}
.modal-scale-enter,
.modal-scale-leave-to {
  transform: scale(0.9);
}
</style>
