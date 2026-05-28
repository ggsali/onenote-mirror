import { defineConfig } from 'vite'
import { lovableTanstackConfig } from '@lovable.dev/vite-tanstack-config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  ...lovableTanstackConfig(),
  plugins: [
    ...(lovableTanstackConfig().plugins ?? []),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      manifest: {
        name: 'OneNote',
        short_name: 'OneNote',
        theme_color: '#1c1c1c',
        background_color: '#1E1E1E',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'html', networkTimeoutSeconds: 3 },
          },
        ],
      },
    }),
  ],
})
