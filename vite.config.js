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
        description: "Sistem Manajemen Kasir",
        theme_color: "#10b981",
        background_color: "#F8FAFC",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      // PWA workbox configuration for better caching
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/script\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
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