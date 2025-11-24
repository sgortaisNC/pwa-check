<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { InstallPromptService } from '$lib/install-prompt';

	let canInstall = false;
	let isInstalling = false;
	let installService: InstallPromptService | null = null;
	let unsubscribe: (() => void) | null = null;
	let showBanner = false;
	let iosInstructions = '';

	onMount(() => {
		if (typeof window === 'undefined') {
			return;
		}

		installService = InstallPromptService.getInstance();
		
		// Vérifier immédiatement
		canInstall = installService.canInstall();
		showBanner = canInstall;
		iosInstructions = installService.getIOSInstructions();

		// S'abonner aux changements
		unsubscribe = installService.subscribe((canInstallValue) => {
			canInstall = canInstallValue;
			showBanner = canInstallValue;
			iosInstructions = installService?.getIOSInstructions() || '';
		});

		// Vérifier périodiquement (pour détecter l'installation)
		const interval = setInterval(() => {
			if (installService) {
				const installed = installService.isInstalled();
				if (installed) {
					showBanner = false;
					canInstall = false;
				}
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	async function handleInstall() {
		if (!installService) {
			return;
		}

		isInstalling = true;
		try {
			const success = await installService.promptInstall();
			if (success) {
				showBanner = false;
			}
		} catch (error) {
			console.error('Erreur lors de l\'installation:', error);
		} finally {
			isInstalling = false;
		}
	}

	function dismissBanner() {
		showBanner = false;
		// Ne plus afficher pendant cette session
		sessionStorage.setItem('pwa-install-dismissed', 'true');
	}

	onMount(() => {
		// Vérifier si l'utilisateur a déjà fermé le bandeau dans cette session
		if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
			showBanner = false;
		}
	});
</script>

{#if showBanner && canInstall}
	<div class="install-banner">
		<div class="banner-content">
			<div class="banner-icon">📱</div>
			<div class="banner-text">
				<strong>Installez cette application</strong>
				{#if installService?.isIOS() && iosInstructions}
					<span class="ios-instructions">{iosInstructions}</span>
				{:else}
					<span>Pour une meilleure expérience, installez-la sur votre appareil</span>
				{/if}
			</div>
			<div class="banner-actions">
				{#if !installService?.isIOS()}
					<button
						class="btn-install"
						onclick={handleInstall}
						disabled={isInstalling}
					>
						{isInstalling ? '⏳ Installation...' : '📥 Installer'}
					</button>
				{/if}
				<button
					class="btn-dismiss"
					onclick={dismissBanner}
					aria-label="Fermer"
				>
					✕
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.install-banner {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		padding: 1rem;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.banner-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.banner-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.banner-text {
		flex: 1;
		min-width: 200px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.banner-text strong {
		font-size: 1.1rem;
		font-weight: 700;
	}

	.ios-instructions {
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.banner-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-shrink: 0;
	}

	.btn-install {
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		color: #fff;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
	}

	.btn-install:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-2px);
	}

	.btn-install:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-dismiss {
		background: transparent;
		border: none;
		color: #fff;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		line-height: 1;
		opacity: 0.8;
		transition: opacity 0.2s ease;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}

	.btn-dismiss:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 640px) {
		.banner-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.banner-icon {
			font-size: 1.5rem;
		}

		.banner-text {
			width: 100%;
		}

		.banner-actions {
			width: 100%;
			justify-content: space-between;
		}

		.btn-install {
			flex: 1;
		}
	}
</style>

