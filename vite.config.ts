import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.png', 'icons/icon-*.png'],
          manifest: {
            name: 'HATI - Your Life. Certified.',
            short_name: 'HATI',
            description: 'Privacy-First Health Vault. The secure, encrypted vault for your family\'s medical history.',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            orientation: 'portrait-primary',
            background_color: '#0A192F',
            theme_color: '#0A192F',
            categories: ['medical', 'health', 'productivity'],
            icons: [
              { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
              { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
              { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
              { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
              { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
              { src: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
              { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
              { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
              { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
              { src: '/icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
            shortcuts: [
              {
                name: 'Login',
                short_name: 'Login',
                url: '/login',
                icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' }],
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
            ],
          },
          devOptions: {
            enabled: true,
          },
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
