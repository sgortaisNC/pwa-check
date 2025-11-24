import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Stockage en mémoire (en production, utilisez une base de données)
const subscriptions = new Map<string, { subscription: PushSubscriptionJSON; userAgent: string; createdAt: Date }>();

// Fonction pour obtenir toutes les subscriptions (exportée pour être utilisée par send-all)
export function getAllSubscriptions() {
	return Array.from(subscriptions.entries()).map(([id, data]) => ({
		id,
		subscription: data.subscription,
		userAgent: data.userAgent,
		createdAt: data.createdAt
	}));
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { subscription, userAgent } = await request.json();

		if (!subscription || !subscription.endpoint) {
			return json({ error: 'Subscription invalide' }, { status: 400 });
		}

		// Créer un ID unique pour cette subscription
		const subscriptionId = subscription.keys?.p256dh || 
		                      Buffer.from(subscription.endpoint).toString('base64').substring(0, 32);

		// Stocker l'abonnement
		subscriptions.set(subscriptionId, {
			subscription: subscription as PushSubscriptionJSON,
			userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
			createdAt: new Date()
		});

		console.log(`Nouvel abonnement enregistré: ${subscriptionId} (Total: ${subscriptions.size})`);

		return json({
			success: true,
			subscriptionId,
			message: 'Abonnement enregistré avec succès'
		});
	} catch (error) {
		console.error('Erreur lors de l\'enregistrement:', error);
		return json(
			{ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
			{ status: 500 }
		);
	}
};

// Endpoint pour obtenir le nombre d'abonnements (pour l'admin)
export const GET: RequestHandler = async () => {
	return json({
		count: subscriptions.size,
		subscriptions: Array.from(subscriptions.entries()).map(([id, data]) => ({
			id,
			userAgent: data.userAgent,
			createdAt: data.createdAt
		}))
	});
};

