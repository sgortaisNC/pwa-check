export class NotificationService {
	private static instance: NotificationService;
	private permission: NotificationPermission = 'default';

	private constructor() {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			this.permission = Notification.permission;
		}
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

	public async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
		if (typeof window === 'undefined' || !('Notification' in window)) {
			throw new Error('Les notifications ne sont pas supportées dans ce navigateur');
		}

		if (this.permission !== 'granted') {
			await this.requestPermission();
		}

		if (this.permission === 'granted') {
			const notification = new Notification(title, {
				icon: '/pwa-192x192.png',
				badge: '/pwa-192x192.png',
				...options
			});

			notification.onclick = () => {
				window.focus();
				notification.close();
			};
		}
	}

	public getPermission(): NotificationPermission {
		return this.permission;
	}

	public isSupported(): boolean {
		if (typeof window === 'undefined') return false;
		// Pour Android et Desktop : utiliser l'API Notification standard
		// Pour iOS : nécessite Web Push (non implémenté pour l'instant)
		const isIOS = this.isIOS();
		if (isIOS) {
			// iOS nécessite Web Push avec configuration serveur spécifique
			// Pour l'instant, on retourne false pour afficher le message générique
			return false;
		}
		// Android et Desktop supportent l'API Notification standard
		return 'Notification' in window;
	}

	public async isWebPushSupported(): Promise<boolean> {
		if (typeof window === 'undefined') return false;
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
		
		try {
			const registration = await navigator.serviceWorker.ready;
			return registration.pushManager !== undefined;
		} catch {
			return false;
		}
	}

	public isIOS(): boolean {
		if (typeof window === 'undefined') return false;
		return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
		       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
					options.applicationServerKey = this.urlBase64ToUint8Array(serverPublicKey);
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

