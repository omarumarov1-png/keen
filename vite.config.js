import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/keen/, not domain root.
  base: '/keen/',
  plugins: [
    react(),
    VitePWA({
      // autoUpdate + Workbox's generated precache -- avoids the
      // cache-first-shell staleness trap hit before in this user's other
      // PWAs (Wird/Muhkam), same pattern as arabic-listening.
      registerType: 'autoUpdate',
      manifest: {
        name: 'Keen',
        short_name: 'Keen',
        description: 'Intuition training: eyes-free card guessing with haptic answers, plus chess, numbers, time, business and confidence modes',
        start_url: '/keen/',
        scope: '/keen/',
        display: 'standalone',
        background_color: '#090b10',
        theme_color: '#090b10',
        icons: [
          { src: 'logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // puzzles.json is the entire content library (~590KB) -- precache
        // it explicitly so the app works fully offline immediately after
        // first load, not just after the user happens to revisit it.
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        // Google Fonts (Unbounded / Manrope / Playfair Display): cache after
        // first load so the typography also works offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
