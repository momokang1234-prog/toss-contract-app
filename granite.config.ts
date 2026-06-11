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
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    initialAccessoryButton: {
      id: 'share-contract',
      title: '공유',
      icon: {
        name: 'icon-share-mono',
      },
    },
  },
  permissions: [
});
