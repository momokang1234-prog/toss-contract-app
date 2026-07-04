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
        // Security Headers (based on nextjs-security-audit.md research)
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        // CSP (Content Security Policy)
        'Content-Security-Policy': "frame-ancestors 'self' https://cert.toss.im; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://cert.toss.im wss://*.supabase.co; frame-src 'none'; object-src 'none';",
        // Cache control for development
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
          manualChunks: {
            // Core frameworks - separate to prevent circular dependencies
            'react-core': ['react', 'react-dom', 'react-router-dom'],
            'toss-ui': ['@toss/tds-mobile', '@apps-in-toss/web-framework'],
            'emotion-core': ['@emotion/react', '@emotion/babel-plugin'],
            'supabase-core': ['@supabase/supabase-js'],
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});

