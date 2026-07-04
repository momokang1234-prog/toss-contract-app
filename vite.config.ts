import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development" || command === "serve";

  return {
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDev ? '[local]_[hash:base64:5]' : '[hash:base64:8]',
      },
    },
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
        // CSP (Content Security Policy) - Updated to allow external fonts/dev tools
        'Content-Security-Policy': [
          "frame-ancestors 'self' https://cert.toss.im",
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
          "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
          "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
          "img-src 'self' data: https:",
          "connect-src 'self' https://*.supabase.co https://cert.toss.im wss://*.supabase.co",
          "frame-src 'none'",
          "object-src 'none'",
        ].join('; '),
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
          target: process.env.VITE_API_TARGET || "https://cert.toss.im",
          changeOrigin: true,
          secure: false, // For development
          rewrite: (path) => path.replace(/^\/api/, "/api/v2"),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.warn('API proxy error (using mock fallback):', err.message);
              // In development, return mock response to prevent app crashes
              if (isDev) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ mock: true, message: 'Development mode - API unavailable' }));
              }
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying:', req.method, req.url, '→', options.target);
            });
          },
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

