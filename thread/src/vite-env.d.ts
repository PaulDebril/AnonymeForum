/// <reference types="vite/client" />

// Configuration runtime injectée via config.js
interface Window {
  ENV_CONFIG?: {
    VITE_API_URL?: string;
    VITE_SENDER_URL?: string;
  };
}
