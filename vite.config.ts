import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Job Assist route lives on the local ib-backend (not yet on production)
      "/api/job-assist": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api": {
        target: "https://ib-backend.ib-innovativesolutions.com",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
