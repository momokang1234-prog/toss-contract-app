import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    cors: true,
    allowedHosts: ['toss-contract-app.private-apps.tossmini.com', 'localhost'],
    headers: {
      'Content-Security-Policy': "frame-ancestors *;",
    },
    watch: {
      ignored: ['**/workspace.html', '**/public/workspace.html'],
    },
    proxy: {
      "/api": {
        target: "https://cert.toss.im",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v2"),
      },
    },
  },
});
