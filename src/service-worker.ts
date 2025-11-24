/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache tous les fichiers générés par Vite
precacheAndRoute(self.__WB_MANIFEST);

// Gérer les événements push (notifications serveur)
self.addEventListener('push', (event: PushEvent) => {
	console.log('Push event received:', event);

	if (!event.data) {
		return;
	}

	try {
		const data = event.data.json();
		const title = data.title || 'Notification PWA';
		const body = data.body || 'Vous avez une nouvelle notification';
		const options: NotificationOptions = {
			body,
			icon: data.icon || '/pwa-192x192.png',
			badge: data.badge || '/pwa-192x192.png',
			tag: data.tag || `push-${Date.now()}`,
			requireInteraction: data.requireInteraction || false,
			data: data.data || {}
		};

		// Ajouter vibration pour Android
		if (data.vibrate) {
			(options as any).vibrate = data.vibrate;
		} else if ('vibrate' in navigator) {
			(options as any).vibrate = [200, 100, 200];
		}

		event.waitUntil(
			self.registration.showNotification(title, options)
		);
	} catch (error) {
		console.error('Erreur lors du traitement du push:', error);
	}
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event: NotificationEvent) => {
	console.log('Notification clicked:', event);

	event.notification.close();

	// Ouvrir ou focus la fenêtre de l'application
	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			// Si une fenêtre est déjà ouverte, la focus
			for (const client of clientList) {
				if (client.url === '/' && 'focus' in client) {
					return client.focus();
				}
			}
			// Sinon, ouvrir une nouvelle fenêtre
			if (clients.openWindow) {
				return clients.openWindow('/');
			}
		})
	);
});

// Gérer les erreurs de notification
self.addEventListener('notificationclose', (event: NotificationEvent) => {
	console.log('Notification closed:', event);
});

// Prendre le contrôle immédiatement
clientsClaim();

