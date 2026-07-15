import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Le backend M-IA (Node.js + Express) sera monté ici une fois développé.
      // En attendant, les appels passent par des mocks dans src/services/api.
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
