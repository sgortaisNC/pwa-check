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

		// Sur Android avec PWA, on DOIT utiliser le service worker
		// Le constructeur Notification() est interdit quand un service worker est actif
		if ('serviceWorker' in navigator) {
			try {
				// Vérifier si on est dans un contexte PWA (standalone mode)
				const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
				                     (window.navigator as any).standalone === true ||
				                     document.referrer.includes('android-app://');
				
				// Vérifier si un service worker est enregistré
				let registrations: readonly ServiceWorkerRegistration[] = [];
				try {
					registrations = await navigator.serviceWorker.getRegistrations();
				} catch (e) {
					console.warn('Erreur getRegistrations:', e);
				}
				
				// Essayer aussi getRegistration pour l'URL actuelle
				let currentRegistration: ServiceWorkerRegistration | null = null;
				try {
					const reg = await navigator.serviceWorker.getRegistration();
					currentRegistration = reg || null;
				} catch (e) {
					console.warn('Erreur getRegistration:', e);
				}
				
				// Si un service worker est enregistré OU si on est en mode PWA
				if (registrations.length > 0 || currentRegistration || isStandalone) {
					// Un service worker est actif ou on est en mode PWA, on DOIT l'utiliser
					let registration: ServiceWorkerRegistration | null = currentRegistration || null;
					
					// Si pas de registration actuelle, utiliser la première disponible
					if (!registration && registrations.length > 0) {
						registration = registrations[0];
					}
					
					// Si toujours pas de registration, essayer ready
					if (!registration) {
						try {
							registration = await Promise.race([
								navigator.serviceWorker.ready,
								new Promise<never>((_, reject) => 
									setTimeout(() => reject(new Error('Timeout')), 5000)
								)
							]);
						} catch (error) {
							console.warn('ready a échoué:', error);
						}
					}
					
					// Vérifier et attendre que le service worker soit actif
					if (registration) {
						// Si le service worker est en cours d'installation, attendre
						if (registration.installing) {
							await new Promise<void>((resolve) => {
								const worker = registration!.installing!;
								const checkState = () => {
									if (worker.state === 'activated' || worker.state === 'redundant') {
										resolve();
									} else {
										setTimeout(checkState, 100);
									}
								};
								worker.addEventListener('statechange', checkState);
								setTimeout(() => resolve(), 5000); // Timeout de sécurité
							});
						}
						
						// Si le service worker est en attente, essayer de l'activer
						if (registration.waiting && !registration.active) {
							try {
								registration.waiting.postMessage({ type: 'SKIP_WAITING' });
								await new Promise<void>(resolve => setTimeout(resolve, 1000));
							} catch (e) {
								console.warn('Impossible d\'activer le service worker en attente:', e);
							}
						}
						
						// Utiliser le service worker actif ou celui en attente
						const activeWorker = registration.active || registration.waiting;
						
						if (activeWorker && typeof registration.showNotification === 'function') {
							const notificationOptions: NotificationOptions = {
								body: body || 'Notification depuis votre PWA',
								icon: '/pwa-192x192.png',
								badge: '/pwa-192x192.png',
								tag: `pwa-notification-${Date.now()}`,
								requireInteraction: false,
								...options
							};
							// Ajouter vibration pour Android
							if ('vibrate' in navigator) {
								(notificationOptions as any).vibrate = [200, 100, 200];
							}
							await registration.showNotification(title, notificationOptions);
							return;
						}
					}
					
					// Si on arrive ici, le service worker n'est pas utilisable
					throw new Error('Service worker trouvé mais non actif. Rechargez la page complètement.');
				}
			} catch (error) {
				console.error('Erreur avec service worker:', error);
				// Si on est en mode standalone ou qu'un service worker est enregistré,
				// on ne peut PAS utiliser Notification()
				const registrations = await navigator.serviceWorker.getRegistrations();
				const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
				
				if (registrations.length > 0 || isStandalone) {
					throw new Error('Service worker requis mais non disponible. Rechargez la page et réessayez.');
				}
				// Sinon, continuer vers le fallback
			}
		}

		// Fallback uniquement si aucun service worker n'est enregistré ET qu'on n'est pas en mode PWA
		// (cas desktop sans PWA installée)
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		if (!isStandalone && 'Notification' in window && Notification.permission === 'granted') {
			try {
				const notification = new Notification(title, {
					body: body || 'Notification depuis votre PWA',
					icon: '/pwa-192x192.png',
					badge: '/pwa-192x192.png',
					tag: `pwa-notification-${Date.now()}`, // Tag unique pour chaque notification
					...options
				});

				notification.onclick = () => {
					if (window.focus) {
						window.focus();
					}
					notification.close();
				};
				return;
			} catch (error) {
				// Si ça échoue, c'est probablement qu'un service worker est actif
				throw new Error('Impossible d\'utiliser Notification(). Le service worker est requis.');
			}
		} else {
			throw new Error('Les notifications nécessitent le service worker. Rechargez la page.');
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

	// S'abonner aux notifications push serveur (pour recevoir des notifications à distance)
	public async subscribeToPush(serverPublicKey: string): Promise<{ subscriptionId: string; success: boolean }> {
		if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
			throw new Error('Service Worker non disponible');
		}

		if (!('PushManager' in window)) {
			throw new Error('PushManager non disponible dans ce navigateur');
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			
			if (!registration.pushManager) {
				throw new Error('PushManager non disponible');
			}

			// Vérifier si déjà abonné
			let subscription = await registration.pushManager.getSubscription();
			
			if (!subscription) {
				// Créer un nouvel abonnement avec la clé publique VAPID
				const keyArray = this.urlBase64ToUint8Array(serverPublicKey);
				const options: PushSubscriptionOptionsInit = {
					applicationServerKey: keyArray as any,
					userVisibleOnly: true
				};

				subscription = await registration.pushManager.subscribe(options);
			}

			// Envoyer l'abonnement au serveur pour qu'il puisse envoyer des notifications
			const subscriptionJSON = subscription.toJSON();
			const response = await fetch('/api/push/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					subscription: subscriptionJSON,
					userAgent: navigator.userAgent
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || 'Erreur lors de l\'enregistrement de l\'abonnement');
			}

			const data = await response.json();
			return { subscriptionId: data.subscriptionId, success: true };
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

