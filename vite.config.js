import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
// En GitHub Pages la app vive en una subruta (/nombre-del-repositorio/): VITE_BASE=/nombre/ npm run build
let base = process.env.VITE_BASE || '/'
if (!base.startsWith('/')) base = `/${base}`
if (!base.endsWith('/')) base += '/'
const stamp = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid' })

// La app es 100 % offline: el service worker guarda todo y no hay servidor propio.
export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(`${pkg.version} · ${stamp}`) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        // El lector de PDF (pdf.js y su worker .mjs) también se guarda para funcionar sin internet.
        globPatterns: ['**/*.{js,mjs,css,html,png,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      },
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'Repaso 4.º de Primaria',
        short_name: 'Repaso 4.º',
        description: 'Tareas diarias de 4º de primaria, sin internet',
        lang: 'es',
        theme_color: '#ff5fa2',
        background_color: '#fff0f7',
        display: 'standalone',
        id: base,
        start_url: base,
        scope: base,
        // Chrome en Android exige iconos PNG de 192 y 512 px para ofrecer "Instalar app".
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      }
    })
  ]
})
