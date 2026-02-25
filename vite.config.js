import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: "/Deb-s_POS/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: "Deb's POS Pro",
        short_name: "Deb's POS",
        description: "Sistem Manajemen Kasir Offline-First",
        theme_color: "#10b981",
        background_color: "#F8FAFC",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      // PWA workbox configuration for offline-first
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
        navigateFallback: undefined,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:woff2?|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
  build: {
    // Code splitting dengan function untuk rolldown-vite compatibility
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('node_modules/react-dom')) return 'react-vendor';
          if (id.includes('node_modules/recharts')) return 'charts-vendor';
          if (id.includes('node_modules/framer-motion')) return 'motion-vendor';
          if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
          if (id.includes('node_modules/@radix-ui')) return 'radix-vendor';
        }
      }
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 500
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.jsx',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.{idea,git,cache,output,temp}/**'],
  },
})
