import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg'],
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.ts',
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}']
			},
			manifest: {
				name: 'Test PWA SvelteKit',
				short_name: 'Test PWA',
				description: 'Application PWA de test avec SvelteKit',
				theme_color: '#1a1a1a',
				background_color: '#1a1a1a',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				],
				skipWaiting: true,
				clientsClaim: true
			},
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}']
			},
			devOptions: {
				enabled: false, // Désactivé en production pour éviter les problèmes
				type: 'module'
			}
		})
	],
	server: {
		// Configuration uniquement pour le développement local
		host: 'localhost',
		port: 5173
	}
});
