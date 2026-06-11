import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "bossimclockedin",
  brand: {
    displayName: "근로계약",
    primaryColor: "#3182F6",
    icon: "/icon.png",
  },
  web: {
    host: "192.168.0.3",
    port: 5173,
    commands: {
      dev: "vite dev --host",
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
  webViewProps: {
    type: "partner",
  },
  permissions: [],
  outdir: "dist",
});
