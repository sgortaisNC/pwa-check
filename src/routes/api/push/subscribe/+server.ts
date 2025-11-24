import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addSubscription, getSubscriptionCount, getSubscriptionsInfo } from '$lib/push-subscriptions';

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
		await addSubscription(
			subscriptionId,
			subscription as PushSubscriptionJSON,
			userAgent || request.headers.get('user-agent') || 'unknown'
		);

		const count = await getSubscriptionCount();
		console.log(`Nouvel abonnement enregistré: ${subscriptionId} (Total: ${count})`);

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
	const count = await getSubscriptionCount();
	const subscriptions = await getSubscriptionsInfo();
	return json({
		count,
		subscriptions
	});
};

