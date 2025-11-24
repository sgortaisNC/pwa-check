import { prisma } from './db';
import type { PushSubscriptionJSON } from 'web-push';

/**
 * Ajouter un nouvel abonnement
 */
export async function addSubscription(
	subscriptionId: string,
	subscription: PushSubscriptionJSON,
	userAgent: string
): Promise<void> {
	try {
		// Vérifier la connexion avant d'essayer d'insérer
		await prisma.$connect();
		
		await prisma.pushSubscription.upsert({
			where: {
				endpoint: subscription.endpoint
			},
			update: {
				p256dh: subscription.keys?.p256dh,
				auth: subscription.keys?.auth,
				userAgent,
				updatedAt: new Date()
			},
			create: {
				id: subscriptionId,
				endpoint: subscription.endpoint,
				p256dh: subscription.keys?.p256dh,
				auth: subscription.keys?.auth,
				userAgent
			}
		});
	} catch (error) {
		console.error('Erreur lors de l\'enregistrement de l\'abonnement:', error);
		
		// Si c'est une erreur de connexion, donner plus de détails
		if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
			console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurée' : 'NON CONFIGURÉE');
			throw new Error('Impossible de se connecter à la base de données. Vérifiez que DATABASE_URL est configurée dans Vercel.');
		}
		
		throw error;
	}
}

/**
 * Obtenir toutes les subscriptions
 */
export async function getAllSubscriptions() {
	try {
		const subscriptions = await prisma.pushSubscription.findMany();
		return subscriptions.map((sub) => ({
			id: sub.id,
			subscription: {
				endpoint: sub.endpoint,
				keys: {
					p256dh: sub.p256dh || '',
					auth: sub.auth || ''
				}
			} as PushSubscriptionJSON,
			userAgent: sub.userAgent || 'unknown',
			createdAt: sub.createdAt
		}));
	} catch (error) {
		console.error('Erreur lors de la récupération des abonnements:', error);
		return [];
	}
}

/**
 * Obtenir le nombre d'abonnements
 */
export async function getSubscriptionCount(): Promise<number> {
	try {
		return await prisma.pushSubscription.count();
	} catch (error) {
		console.error('Erreur lors du comptage des abonnements:', error);
		return 0;
	}
}

/**
 * Obtenir les informations des abonnements (sans les données sensibles)
 */
export async function getSubscriptionsInfo() {
	try {
		const subscriptions = await prisma.pushSubscription.findMany({
			select: {
				id: true,
				userAgent: true,
				createdAt: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
		return subscriptions;
	} catch (error) {
		console.error('Erreur lors de la récupération des infos:', error);
		return [];
	}
}

/**
 * Supprimer un abonnement
 */
export async function removeSubscription(endpoint: string): Promise<void> {
	try {
		await prisma.pushSubscription.delete({
			where: {
				endpoint
			}
		});
	} catch (error) {
		console.error('Erreur lors de la suppression de l\'abonnement:', error);
		// Ne pas throw pour éviter de bloquer si l'abonnement n'existe pas
	}
}
