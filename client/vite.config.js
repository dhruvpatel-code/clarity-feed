import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'recharts': ['recharts'],
          'axios': ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    // Disable module preload to prevent race conditions
    modulePreload: false
  },
  server: {
    strictPort: false
  }
});
