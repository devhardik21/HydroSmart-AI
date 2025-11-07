import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],

      manifest: {
        name: 'HydroSmart',
        short_name: 'HydroSmart',
        description: 'HydroSmart',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',   // your first icon
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/driver512.png',   // your second icon
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
