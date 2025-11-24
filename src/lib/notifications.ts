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
				// Vérifier d'abord si un service worker est enregistré
				const registrations = await navigator.serviceWorker.getRegistrations();
				
				// Si un service worker est enregistré OU si on est dans un contexte PWA
				// (standalone mode), on DOIT utiliser le service worker
				const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
				                     (window.navigator as any).standalone === true ||
				                     document.referrer.includes('android-app://');
				
				if (registrations.length > 0 || isStandalone) {
					// Un service worker est actif ou on est en mode PWA, on DOIT l'utiliser
					// Attendre que le service worker soit prêt avec plusieurs tentatives
					let registration: ServiceWorkerRegistration | null = null;
					
					// Tentative 1: Utiliser ready (le plus rapide)
					try {
						registration = await Promise.race([
							navigator.serviceWorker.ready,
							new Promise<never>((_, reject) => 
								setTimeout(() => reject(new Error('Timeout ready')), 3000)
							)
						]);
					} catch (error) {
						console.warn('ready a échoué, tentative avec getRegistrations:', error);
					}
					
					// Tentative 2: Utiliser getRegistrations si ready a échoué
					if (!registration) {
						try {
							const regs = await navigator.serviceWorker.getRegistrations();
							if (regs.length > 0) {
								registration = regs[0];
								// Attendre que ce service worker soit actif
								if (registration.active) {
									// Service worker déjà actif, on peut l'utiliser
								} else if (registration.installing) {
									// Service worker en cours d'installation, attendre
									await new Promise<void>((resolve) => {
										const worker = registration!.installing;
										if (worker) {
											worker.addEventListener('statechange', () => {
												if (worker.state === 'activated') {
													resolve();
												}
											});
											// Timeout après 5 secondes
											setTimeout(() => resolve(), 5000);
										} else {
											resolve();
										}
									});
								} else if (registration.waiting) {
									// Service worker en attente, l'activer
									registration.waiting.postMessage({ type: 'SKIP_WAITING' });
									await new Promise<void>((resolve) => setTimeout(resolve, 1000));
								}
							}
						} catch (error) {
							console.error('Erreur avec getRegistrations:', error);
						}
					}
					
					// Tentative 3: Attendre un peu plus et réessayer ready
					if (!registration) {
						try {
							await new Promise(resolve => setTimeout(resolve, 2000));
							registration = await Promise.race([
								navigator.serviceWorker.ready,
								new Promise<never>((_, reject) => 
									setTimeout(() => reject(new Error('Timeout final')), 5000)
								)
							]);
						} catch (error) {
							console.error('Tentative finale échouée:', error);
						}
					}
					
					if (registration && typeof registration.showNotification === 'function') {
						const notificationOptions: NotificationOptions = {
							body: body || 'Notification depuis votre PWA',
							icon: '/pwa-192x192.png',
							badge: '/pwa-192x192.png',
							tag: `pwa-notification-${Date.now()}`, // Tag unique pour chaque notification
							requireInteraction: false,
							...options
						};
						// Ajouter vibration pour Android (propriété non standard mais supportée)
						if ('vibrate' in navigator) {
							(notificationOptions as any).vibrate = [200, 100, 200];
						}
						await registration.showNotification(title, notificationOptions);
						return;
					} else {
						// Dernière tentative: vérifier si on peut utiliser getRegistration avec l'URL actuelle
						try {
							const reg = await navigator.serviceWorker.getRegistration();
							if (reg && typeof reg.showNotification === 'function') {
								const notificationOptions: NotificationOptions = {
									body: body || 'Notification depuis votre PWA',
									icon: '/pwa-192x192.png',
									badge: '/pwa-192x192.png',
									tag: `pwa-notification-${Date.now()}`,
									requireInteraction: false,
									...options
								};
								if ('vibrate' in navigator) {
									(notificationOptions as any).vibrate = [200, 100, 200];
								}
								await reg.showNotification(title, notificationOptions);
								return;
							}
						} catch (error) {
							console.error('Dernière tentative échouée:', error);
						}
						throw new Error('Service worker enregistré mais showNotification non disponible. Essayez de recharger la page.');
					}
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

