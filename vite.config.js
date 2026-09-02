import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate + Workbox's generated precache -- avoids the
      // cache-first-shell staleness trap hit before in this user's other
      // PWAs (Wird/Muhkam), same pattern as arabic-listening.
      registerType: 'autoUpdate',
      manifest: {
        name: 'Chess Intuition Trainer',
        short_name: 'Chess Intuition',
        description: 'Flash-position chess intuition training -- real Lichess puzzles, adaptive difficulty, spaced repetition',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#111111',
        icons: [
          { src: 'icons.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // puzzles.json is the entire content library (~590KB) -- precache
        // it explicitly so the app works fully offline immediately after
        // first load, not just after the user happens to revisit it.
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
      },
    }),
  ],
})
