// Stockage des abonnements push (en production, utilisez une base de données)
// Structure: Map<subscriptionId, { subscription: PushSubscriptionJSON; userAgent: string; createdAt: Date }>
const subscriptions = new Map<string, { subscription: PushSubscriptionJSON; userAgent: string; createdAt: Date }>();

/**
 * Ajouter un nouvel abonnement
 */
export function addSubscription(
	subscriptionId: string,
	subscription: PushSubscriptionJSON,
	userAgent: string
): void {
	subscriptions.set(subscriptionId, {
		subscription,
		userAgent,
		createdAt: new Date()
	});
}

/**
 * Obtenir toutes les subscriptions
 */
export function getAllSubscriptions() {
	return Array.from(subscriptions.entries()).map(([id, data]) => ({
		id,
		subscription: data.subscription,
		userAgent: data.userAgent,
		createdAt: data.createdAt
	}));
}

/**
 * Obtenir le nombre d'abonnements
 */
export function getSubscriptionCount(): number {
	return subscriptions.size;
}

/**
 * Obtenir les informations des abonnements (sans les données sensibles)
 */
export function getSubscriptionsInfo() {
	return Array.from(subscriptions.entries()).map(([id, data]) => ({
		id,
		userAgent: data.userAgent,
		createdAt: data.createdAt
	}));
}

