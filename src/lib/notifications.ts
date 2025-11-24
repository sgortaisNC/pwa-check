export class NotificationService {
	private static instance: NotificationService;
	private permission: NotificationPermission = 'default';

	private constructor() {
		if (typeof window !== 'undefined') {
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
		return window.isSecureContext || window.location.protocol === 'https:' || 
		       window.location.hostname === 'localhost' || 
		       window.location.hostname === '127.0.0.1' ||
		       window.location.hostname === '[::1]';
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
		return typeof window !== 'undefined' && 'Notification' in window;
	}

	public getContextInfo(): { isSecure: boolean; protocol: string; hostname: string } {
		if (typeof window === 'undefined') {
			return { isSecure: false, protocol: 'unknown', hostname: 'unknown' };
		}
		return {
			isSecure: this.isSecureContext(),
			protocol: window.location.protocol,
			hostname: window.location.hostname
		};
	}
}

