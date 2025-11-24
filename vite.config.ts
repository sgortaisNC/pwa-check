import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg'],
			manifest: {
				name: 'Test PWA SvelteKit',
				short_name: 'Test PWA',
				description: 'Application PWA de test avec SvelteKit',
				theme_color: '#1a1a1a',
				background_color: '#1a1a1a',
				display: 'standalone',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}']
			},
			devOptions: {
				enabled: true,
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
