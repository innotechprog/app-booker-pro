import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// For Apache/XAMPP subfolders (e.g. http://localhost/app-booker-pro/), set in .env.production:
//   VITE_BASE_PATH=/app-booker-pro/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const baseRaw = env.VITE_BASE_PATH?.trim() || "/";
  const base = baseRaw.endsWith("/") ? baseRaw : `${baseRaw}/`;

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Job Assist route lives on the local ib-backend (not yet on production)
        "/api/job-assist": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        // Send Me dedicated route lives on the local ib-backend (not yet on production)
        "/api/sendme": {
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
  };
});
