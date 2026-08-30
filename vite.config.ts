import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/hanzi-cards/',
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/hanzi-cards/',
        name: 'Hanzi Cards',
        short_name: 'Hanzi Cards',
        description: 'Learn Chinese words with personal flashcards, photos, pinyin, and translations.',
        start_url: '/hanzi-cards/',
        scope: '/hanzi-cards/',
        display: 'standalone',
        theme_color: '#f7f4ee',
        background_color: '#f7f4ee',
        icons: [
          { src: '/hanzi-cards/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/hanzi-cards/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/hanzi-cards/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        globIgnores: ['**/manifest.webmanifest', '**/favicon.svg', '**/apple-touch-icon.png', '**/icons.svg'],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
})
