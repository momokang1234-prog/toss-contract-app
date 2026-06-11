import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "toss-contract-app",
  brand: {
    displayName: "근로계약",
    primaryColor: "#3182F6",
    icon: "/icon.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [
    { name: "push", reason: "계약서 전송 알림" },
    { name: "Smart Messenger", reason: "근로자에게 계약서 링크 전송" },
  ],
  outdir: "dist",
});
