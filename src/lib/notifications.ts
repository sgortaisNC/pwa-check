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
		// Vérifier si c'est iOS/Safari qui a un support limité
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
		              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		// iOS Safari ne supporte pas l'API Notification standard
		if (isIOS) return false;
		return 'Notification' in window;
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
}

