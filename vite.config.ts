import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development" || command === "serve";

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      {
        name: "html-transform",
        transformIndexHtml: {
          order: "pre",
          handler(html) {
            return html.replace(
              /<%\s*if\s*\(DEV\)\s*\{\s*%>(.*?)<%\s*\}\s*%>/gs,
              (_, content) => {
                return isDev ? content : "";
              }
            );
          },
        },
      },
    ],
    server: {
      port: 5173,
      host: '0.0.0.0',
      cors: true,
      allowedHosts: true,
      headers: {
        'Content-Security-Policy': "frame-ancestors *;",
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
      watch: {
        ignored: ['**/workspace.html', '**/public/workspace.html'],
      },
      proxy: {
        "/api/ux-test": {
          target: "http://localhost:3001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ux-test/, "/ux-test"),
        },
        "/api": {
          target: "https://cert.toss.im",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api/v2"),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // TDS UI framework
            if (id.includes('@toss/tds') || id.includes('@apps-in-toss')) {
              return 'toss-vendor';
            }
            // Emotion styling
            if (id.includes('@emotion')) {
              return 'emotion-vendor';
            }
            // PDF generation libraries - heavy!
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            // Lottie animations
            if (id.includes('lottie')) {
              return 'lottie-vendor';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // Other utilities
            if (id.includes('node_modules')) {
              return 'utils-vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});

