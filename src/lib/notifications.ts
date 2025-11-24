export class NotificationService {
	private static instance: NotificationService;
	private permission: NotificationPermission = 'default';

	private constructor() {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			this.permission = Notification.permission;
		}
	}

	// Vérifier si les notifications sont supportées (Android optimisé)
	public isSupported(): boolean {
		if (typeof window === 'undefined') return false;
		// Android supporte l'API Notification standard
		return 'Notification' in window;
	}

	// Vérifier si c'est iOS (pour afficher un message spécifique)
	public isIOS(): boolean {
		if (typeof window === 'undefined') return false;
		return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
		       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	}

	public static getInstance(): NotificationService {
		if (!NotificationService.instance) {
			NotificationService.instance = new NotificationService();
		}
		return NotificationService.instance;
	}

	private isSecureContext(): boolean {
		if (typeof window === 'undefined') return false;
		try {
			return window.isSecureContext || window.location.protocol === 'https:' || 
			       window.location.hostname === 'localhost' || 
			       window.location.hostname === '127.0.0.1' ||
			       window.location.hostname === '[::1]';
		} catch {
			return false;
		}
	}

	public async requestPermission(): Promise<NotificationPermission> {
		if (typeof window === 'undefined' || !('Notification' in window)) {
			throw new Error('Les notifications ne sont pas supportées dans ce navigateur');
		}

		if (!this.isSecureContext()) {
			const protocol = typeof window !== 'undefined' ? window.location.protocol : 'unknown';
			const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
			throw new Error(
				`Les notifications nécessitent HTTPS ou localhost. ` +
				`Vous êtes actuellement sur ${protocol}//${hostname}. ` +
				`En développement, utilisez http://localhost:5173 ou https://localhost:5173`
			);
		}

		if (this.permission === 'granted') {
			return 'granted';
		}

		if (this.permission === 'denied') {
			throw new Error('Les notifications ont été refusées. Veuillez les autoriser dans les paramètres du navigateur.');
		}

		try {
			this.permission = await Notification.requestPermission();
			return this.permission;
		} catch (error) {
			throw new Error(`Erreur lors de la demande de permission : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
		}
	}

	// Envoyer une notification (optimisé pour Android)
	public async sendNotification(title: string, body: string, options?: NotificationOptions): Promise<void> {
		if (typeof window === 'undefined') {
			throw new Error('Window n\'est pas disponible');
		}

		if (this.permission !== 'granted') {
			await this.requestPermission();
		}

		if (this.permission !== 'granted') {
			throw new Error('Les notifications n\'ont pas été autorisées');
		}

		// Utiliser le service worker si disponible (recommandé pour PWA Android)
		if ('serviceWorker' in navigator) {
			try {
				// Timeout de 2 secondes pour éviter que ça bloque
				const registration = await Promise.race([
					navigator.serviceWorker.ready,
					new Promise<never>((_, reject) => 
						setTimeout(() => reject(new Error('Timeout service worker')), 2000)
					)
				]);
				
				if (registration && typeof registration.showNotification === 'function') {
					const notificationOptions: NotificationOptions = {
						body: body || 'Notification depuis votre PWA',
						icon: '/pwa-192x192.png',
						badge: '/pwa-192x192.png',
						tag: 'pwa-notification',
						requireInteraction: false,
						...options
					};
					// Ajouter vibration pour Android (propriété non standard mais supportée)
					if ('vibrate' in navigator) {
						(notificationOptions as any).vibrate = [200, 100, 200];
					}
					await registration.showNotification(title, notificationOptions);
					return;
				}
			} catch (error) {
				console.warn('Service worker non disponible, utilisation de Notification API:', error);
			}
		}

		// Fallback vers l'API Notification standard (fonctionne bien sur Android)
		if ('Notification' in window && Notification.permission === 'granted') {
			const notification = new Notification(title, {
				body: body || 'Notification depuis votre PWA',
				icon: '/pwa-192x192.png',
				badge: '/pwa-192x192.png',
				tag: 'pwa-notification',
				...options
			});

			notification.onclick = () => {
				if (window.focus) {
					window.focus();
				}
				notification.close();
			};
		} else {
			throw new Error('Les notifications ne sont pas supportées ou non autorisées');
		}
	}

	public getPermission(): NotificationPermission {
		return this.permission;
	}


	public getContextInfo(): { isSecure: boolean; protocol: string; hostname: string } {
		if (typeof window === 'undefined') {
			return { isSecure: false, protocol: 'unknown', hostname: 'unknown' };
		}
		try {
			return {
				isSecure: this.isSecureContext(),
				protocol: window.location.protocol,
				hostname: window.location.hostname
			};
		} catch {
			return { isSecure: false, protocol: 'unknown', hostname: 'unknown' };
		}
	}

	// Web Push pour iOS et autres plateformes
	public async subscribeToPush(serverPublicKey?: string): Promise<PushSubscription | null> {
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			throw new Error('Service Worker non disponible');
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			
			if (!registration.pushManager) {
				throw new Error('PushManager non disponible');
			}

			// Vérifier si déjà abonné
			let subscription = await registration.pushManager.getSubscription();
			
			if (!subscription) {
				// Créer un nouvel abonnement
				const options: PushSubscriptionOptionsInit = {};
				
				if (serverPublicKey) {
					// Convertir la clé publique en format Uint8Array
					const keyArray = this.urlBase64ToUint8Array(serverPublicKey);
					// Type assertion pour compatibilité avec PushSubscriptionOptionsInit
					(options as any).applicationServerKey = keyArray;
				}

				subscription = await registration.pushManager.subscribe(options);
			}

			return subscription;
		} catch (error) {
			console.error('Erreur lors de l\'abonnement push:', error);
			throw error;
		}
	}

	public async unsubscribeFromPush(): Promise<boolean> {
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			return false;
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			
			if (subscription) {
				await subscription.unsubscribe();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Erreur lors du désabonnement:', error);
			return false;
		}
	}

	private urlBase64ToUint8Array(base64String: string): Uint8Array {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}
}

