<script lang="ts">
	import { onMount } from 'svelte';
	import { NotificationService } from '$lib/notifications';

	let notificationService: NotificationService | null = null;
	let permission: NotificationPermission = 'default';
	let isSupported = false;
	let isLoading = false;
	let message = '';
	let contextInfo = { isSecure: false, protocol: '', hostname: '' };
	let mounted = false;
	let error: string | null = null;

	onMount(() => {
		try {
			mounted = true;
			notificationService = NotificationService.getInstance();
			isSupported = notificationService.isSupported();
			permission = notificationService.getPermission();
			contextInfo = notificationService.getContextInfo();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erreur inconnue';
			console.error('Erreur lors de l\'initialisation:', e);
		}
	});

	async function requestPermission() {
		if (!notificationService) return;
		isLoading = true;
		message = '';
		try {
			permission = await notificationService.requestPermission();
			if (permission === 'granted') {
				message = '✅ Permissions accordées ! Vous pouvez maintenant recevoir des notifications.';
			} else {
				message = '❌ Permissions refusées. Veuillez les autoriser dans les paramètres du navigateur.';
			}
		} catch (err) {
			message = `❌ Erreur : ${err instanceof Error ? err.message : 'Erreur inconnue'}`;
		} finally {
			isLoading = false;
		}
	}

	async function testNotification() {
		if (!notificationService) return;
		isLoading = true;
		message = '';
		try {
			await notificationService.sendNotification('🎉 Notification de test !', {
				body: 'Ceci est une notification de test depuis votre PWA.',
				tag: 'test-notification',
				requireInteraction: false
			});
			message = '✅ Notification envoyée !';
		} catch (err) {
			message = `❌ Erreur : ${err instanceof Error ? err.message : 'Erreur inconnue'}`;
		} finally {
			isLoading = false;
		}
	}

	function getPermissionText(): string {
		switch (permission) {
			case 'granted':
				return '✅ Autorisées';
			case 'denied':
				return '❌ Refusées';
			default:
				return '⏳ En attente';
		}
	}
</script>

<svelte:head>
	<title>Test PWA - SvelteKit</title>
	<meta name="description" content="Application PWA de test avec notifications push" />
</svelte:head>

<div class="container">
	<div class="content">
		<h1>🚀 Test PWA</h1>
		<p class="subtitle">Application Progressive Web App avec SvelteKit</p>

		{#if error}
			<div class="alert error">
				<strong>Erreur de chargement</strong><br />
				{error}
			</div>
		{/if}

		{#if !mounted}
			<div class="loading">
				<div class="spinner"></div>
				<p>Chargement...</p>
			</div>
		{:else if notificationService}
			{#if !isSupported}
				<div class="alert error">
					⚠️ Les notifications ne sont pas supportées dans ce navigateur.
				</div>
			{:else if !contextInfo.isSecure}
				<div class="alert warning">
					⚠️ <strong>Contexte non sécurisé</strong><br />
					Les notifications nécessitent HTTPS ou localhost.<br />
					<span class="context-info">Vous êtes sur : {contextInfo.protocol}//{contextInfo.hostname}</span><br />
					<span class="help-text">En développement, utilisez <code>http://localhost:5173</code></span>
				</div>
			{:else}
				<div class="card">
					<h2>Notifications Push</h2>
					<div class="status">
						<span class="label">Statut :</span>
						<span class="value">{getPermissionText()}</span>
					</div>

					<div class="actions">
						{#if permission !== 'granted'}
							<button
								class="btn btn-primary"
								onclick={requestPermission}
								disabled={isLoading || !notificationService}
							>
								{isLoading ? '⏳ Chargement...' : '🔔 Demander les permissions'}
							</button>
						{:else}
							<button
								class="btn btn-success"
								onclick={testNotification}
								disabled={isLoading || !notificationService}
							>
								{isLoading ? '⏳ Envoi...' : '📨 Tester une notification'}
							</button>
						{/if}
					</div>

					{#if message}
						<div class="message" class:error={message.includes('❌')}>
							{message}
						</div>
					{/if}
				</div>
			{/if}
		{:else}
			<div class="card">
				<h2>Initialisation...</h2>
				<p>Chargement des services de notification...</p>
			</div>
		{/if}

		<div class="info">
			<h3>ℹ️ Informations</h3>
			<ul>
				<li>Cette application fonctionne comme une PWA</li>
				<li>Vous pouvez l'installer sur votre appareil</li>
				<li>Les notifications fonctionnent même hors ligne</li>
			</ul>
		</div>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
		color: #e0e0e0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, sans-serif;
		min-height: 100vh;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		min-height: 100vh;
		padding: 2rem;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	.content {
		max-width: 600px;
		width: 100%;
		text-align: center;
		position: relative;
		z-index: 2;
	}

	h1 {
		font-size: 3rem;
		margin: 0 0 0.5rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		color: #667eea; /* Fallback si gradient ne fonctionne pas */
	}

	.subtitle {
		font-size: 1.2rem;
		color: #b0b0b0;
		margin: 0 0 3rem 0;
	}

	.card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.8rem;
		color: #fff;
	}

	.status {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
	}

	.label {
		font-weight: 600;
		color: #b0b0b0;
	}

	.value {
		font-weight: 700;
		font-size: 1.1rem;
	}

	.actions {
		margin-bottom: 1rem;
	}

	.btn {
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: 600;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		width: 100%;
		color: #fff;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
	}

	.btn-success {
		background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
	}

	.btn-success:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(17, 153, 142, 0.4);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.message {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 8px;
		background: rgba(17, 153, 142, 0.2);
		border: 1px solid rgba(17, 153, 142, 0.3);
	}

	.message.error {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.3);
	}

	.alert {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.alert.error {
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #ff6b6b;
	}

	.alert.warning {
		background: rgba(255, 193, 7, 0.2);
		border: 1px solid rgba(255, 193, 7, 0.3);
		color: #ffc107;
		text-align: left;
		line-height: 1.6;
	}

	.alert.warning strong {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 1.1rem;
	}

	.context-info {
		display: block;
		margin: 0.5rem 0;
		font-family: monospace;
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.help-text {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	.help-text code {
		background: rgba(0, 0, 0, 0.3);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: monospace;
	}

	.info {
		background: rgba(255, 255, 255, 0.03);
		border-radius: 12px;
		padding: 1.5rem;
		text-align: left;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.info h3 {
		margin: 0 0 1rem 0;
		color: #fff;
		font-size: 1.3rem;
	}

	.info ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #b0b0b0;
		line-height: 1.8;
	}

	.info li {
		margin-bottom: 0.5rem;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading p {
		color: #b0b0b0;
		font-size: 1rem;
		margin: 0;
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.card {
			padding: 1.5rem;
		}

		.container {
			padding: 1rem;
		}
	}
</style>
