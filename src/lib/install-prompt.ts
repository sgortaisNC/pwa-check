export class InstallPromptService {
	private static instance: InstallPromptService;
	private deferredPrompt: BeforeInstallPromptEvent | null = null;
	private listeners: Array<(canInstall: boolean) => void> = [];

	private constructor() {
		if (typeof window !== 'undefined') {
			this.setupListeners();
		}
	}

	public static getInstance(): InstallPromptService {
		if (!InstallPromptService.instance) {
			InstallPromptService.instance = new InstallPromptService();
		}
		return InstallPromptService.instance;
	}

	private setupListeners(): void {
		// Écouter l'événement beforeinstallprompt (Android/Chrome)
		window.addEventListener('beforeinstallprompt', (e: Event) => {
			e.preventDefault();
			this.deferredPrompt = e as BeforeInstallPromptEvent;
			this.notifyListeners(true);
		});

		// Détecter si l'app est déjà installée
		window.addEventListener('appinstalled', () => {
			this.deferredPrompt = null;
			this.notifyListeners(false);
		});
	}

	public canInstall(): boolean {
		// Vérifier si déjà installée (mode standalone)
		if (this.isInstalled()) {
			return false;
		}

		// Vérifier si on a un prompt différé (Android/Chrome)
		if (this.deferredPrompt) {
			return true;
		}

		// Pour iOS, on peut toujours afficher les instructions
		return this.isIOS();
	}

	public isInstalled(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}

		// Vérifier le mode standalone
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		
		// Vérifier si lancé depuis l'écran d'accueil (iOS)
		const isIOSStandalone = (window.navigator as any).standalone === true;

		return isStandalone || isIOSStandalone;
	}

	public isIOS(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}
		return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
	}

	public async promptInstall(): Promise<boolean> {
		if (!this.deferredPrompt) {
			return false;
		}

		try {
			// Afficher le prompt d'installation
			this.deferredPrompt.prompt();

			// Attendre la réponse de l'utilisateur
			const { outcome } = await this.deferredPrompt.userChoice;

			// Réinitialiser le prompt
			this.deferredPrompt = null;
			this.notifyListeners(false);

			return outcome === 'accepted';
		} catch (error) {
			console.error('Erreur lors de l\'installation:', error);
			return false;
		}
	}

	public subscribe(callback: (canInstall: boolean) => void): () => void {
		this.listeners.push(callback);
		// Notifier immédiatement avec l'état actuel
		callback(this.canInstall());

		// Retourner une fonction de désabonnement
		return () => {
			this.listeners = this.listeners.filter(l => l !== callback);
		};
	}

	private notifyListeners(canInstall: boolean): void {
		this.listeners.forEach(listener => listener(canInstall));
	}

	public getIOSInstructions(): string {
		if (!this.isIOS()) {
			return '';
		}

		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		
		if (isSafari) {
			return 'Appuyez sur le bouton de partage (□↑) puis sur "Sur l\'écran d\'accueil"';
		}
		
		return 'Utilisez le menu de votre navigateur pour ajouter à l\'écran d\'accueil';
	}
}

// Type pour l'événement beforeinstallprompt
export interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

