import { ref } from 'vue';

export const errorMessage = ref('');

export function setError(message: string, timeout = 3000) {
  errorMessage.value = message;
  setTimeout(() => {
    errorMessage.value = '';
  }, timeout);
}
