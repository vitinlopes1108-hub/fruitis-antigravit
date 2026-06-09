import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png'],
        manifest: {
          name: 'Frutinhas Geladas',
          short_name: 'Frutinhas',
          description: 'Peça seus vapes e bebidas geladas favoritas!',
          theme_color: '#7c3aed',
          background_color: '#0f0a1e',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          // Força o SW a assumir controle imediato sem esperar o reload
          skipWaiting: true,
          clientsClaim: true,
          // Remove SWs antigos automaticamente
          cleanupOutdatedCaches: true,
          // Só cacheia o app shell (HTML/CSS/JS) — NUNCA dados da API
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
          runtimeCaching: [
            {
              // Supabase REST API — SEMPRE vai direto para a rede, sem cache
              // Isso garante que qualquer device sempre recebe dados atualizados
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              // Supabase Realtime WebSocket — nunca cachear
              urlPattern: /^wss:\/\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              // Supabase Auth endpoints — sempre rede
              urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              // Fontes do Google — cache longo, raramente mudam
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
