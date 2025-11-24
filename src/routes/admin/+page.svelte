<script lang="ts">
	import { onMount } from 'svelte';

	let adminMessage = '';
	let isLoading = false;
	let message = '';
	let subscriptionCount = 0;
	let isSubscribed = false;

	onMount(async () => {
		await checkSubscriptionCount();
		await checkIfSubscribed();
	});

	async function checkSubscriptionCount() {
		try {
			const response = await fetch('/api/push/subscribe');
			const data = await response.json();
			subscriptionCount = data.count || 0;
		} catch (error) {
			console.error('Erreur lors de la vérification:', error);
		}
	}

	async function checkIfSubscribed() {
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			try {
				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.getSubscription();
				isSubscribed = !!subscription;
			} catch (error) {
				console.error('Erreur:', error);
			}
		}
	}

	async function sendToAll() {
		if (!adminMessage.trim()) {
			message = '⚠️ Veuillez saisir un message';
			return;
		}

		isLoading = true;
		message = '';
		try {
			const response = await fetch('/api/push/send-all', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: '📨 Notification PWA',
					body: adminMessage.trim()
				})
			});

			const data = await response.json();
			
			if (data.success) {
				message = `✅ ${data.message}`;
				adminMessage = '';
			} else {
				message = `❌ ${data.error || data.message}`;
			}
		} catch (error) {
			console.error('Erreur:', error);
			message = `❌ Erreur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
		} finally {
			isLoading = false;
			await checkSubscriptionCount();
		}
	}
</script>

<svelte:head>
	<title>Admin - Envoyer des notifications</title>
</svelte:head>

<div class="container">
	<div class="content">
		<h1>🔐 Admin</h1>
		<p class="subtitle">Envoyer des notifications à tous les utilisateurs</p>

		<div class="card">
			<div class="stats">
				<div class="stat">
					<span class="stat-label">Abonnements actifs</span>
					<span class="stat-value">{subscriptionCount}</span>
				</div>
				<div class="stat">
					<span class="stat-label">Votre statut</span>
					<span class="stat-value">{isSubscribed ? '✅ Abonné' : '❌ Non abonné'}</span>
				</div>
			</div>

			<div class="admin-form">
				<label for="admin-message" class="form-label">
					💬 Message à envoyer à tous
				</label>
				<textarea
					id="admin-message"
					bind:value={adminMessage}
					placeholder="Saisissez le message à envoyer à tous les utilisateurs..."
					class="input-textarea"
					disabled={isLoading}
					rows="5"
				></textarea>
				<button
					class="btn btn-success"
					onclick={sendToAll}
					disabled={isLoading || !adminMessage.trim() || subscriptionCount === 0}
				>
					{isLoading ? '⏳ Envoi...' : `📨 Envoyer à ${subscriptionCount} utilisateur${subscriptionCount > 1 ? 's' : ''}`}
				</button>
			</div>

			{#if message}
				<div class="message" class:error={message.includes('❌')} class:warning={message.includes('⚠️')}>
					{message}
				</div>
			{/if}

			{#if subscriptionCount === 0}
				<div class="alert warning">
					⚠️ Aucun utilisateur abonné pour le moment.<br />
					Les utilisateurs doivent d'abord s'abonner aux notifications push depuis la page principale.
				</div>
			{/if}
		</div>

		<div class="info">
			<h3>ℹ️ Comment ça fonctionne</h3>
			<ol>
				<li>Les utilisateurs s'abonnent aux notifications push depuis la page principale</li>
				<li>Leurs abonnements sont stockés sur le serveur</li>
				<li>Vous pouvez envoyer un message depuis cette page</li>
				<li>Tous les utilisateurs abonnés recevront la notification</li>
			</ol>
			<p class="note">
				<strong>Note :</strong> Pour que cela fonctionne, vous devez configurer les clés VAPID dans les variables d'environnement du serveur.
			</p>
		</div>
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
	}

	.content {
		max-width: 700px;
		width: 100%;
		text-align: center;
	}

	h1 {
		font-size: 3rem;
		margin: 0 0 0.5rem 0;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		color: #667eea;
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

	.stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat {
		background: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #b0b0b0;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #fff;
	}

	.admin-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-label {
		font-weight: 600;
		color: #fff;
		font-size: 1rem;
		text-align: left;
	}

	.input-textarea {
		width: 100%;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(0, 0, 0, 0.3);
		color: #e0e0e0;
		font-family: inherit;
		font-size: 1rem;
		resize: vertical;
		min-height: 120px;
		transition: all 0.3s ease;
	}

	.input-textarea:focus {
		outline: none;
		border-color: #667eea;
		background: rgba(0, 0, 0, 0.4);
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.input-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
		color: #ff6b6b;
	}

	.message.warning {
		background: rgba(255, 193, 7, 0.2);
		border-color: rgba(255, 193, 7, 0.3);
		color: #ffc107;
	}

	.alert {
		padding: 1rem;
		border-radius: 8px;
		margin-top: 1rem;
	}

	.alert.warning {
		background: rgba(255, 193, 7, 0.2);
		border: 1px solid rgba(255, 193, 7, 0.3);
		color: #ffc107;
		text-align: left;
		line-height: 1.6;
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

	.info ol {
		margin: 0 0 1rem 0;
		padding-left: 1.5rem;
		color: #b0b0b0;
		line-height: 1.8;
	}

	.info li {
		margin-bottom: 0.5rem;
	}

	.note {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(102, 126, 234, 0.1);
		border-left: 3px solid #667eea;
		border-radius: 4px;
		color: #b0b0b0;
		font-size: 0.9rem;
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.stats {
			grid-template-columns: 1fr;
		}

		.container {
			padding: 1rem;
		}
	}
</style>

