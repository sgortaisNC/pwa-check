import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import webpush from 'web-push';
import { getAllSubscriptions } from '../subscribe/+server';

// Configuration VAPID (à définir dans les variables d'environnement)
// Pour générer les clés: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@example.com';

// Configurer web-push si les clés sont disponibles
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { title, body, data } = await request.json();

		if (!title || !body) {
			return json({ error: 'Titre et message requis' }, { status: 400 });
		}

		if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
			return json({
				error: 'Clés VAPID non configurées',
				message: 'Configurez VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans les variables d\'environnement'
			}, { status: 500 });
		}

		// Récupérer tous les abonnements
		const subscriptions = getAllSubscriptions();
		
		if (subscriptions.length === 0) {
			return json({ 
				success: false, 
				message: 'Aucun abonnement trouvé',
				sent: 0,
				failed: 0
			});
		}

		// Envoyer à tous les abonnements
		const results = await Promise.allSettled(
			subscriptions.map(async (sub) => {
				try {
					const payload = JSON.stringify({
						title,
						body,
						icon: '/pwa-192x192.png',
						badge: '/pwa-192x192.png',
						tag: `broadcast-${Date.now()}`,
						...data
					});

					await webpush.sendNotification(sub.subscription as any, payload);
					return { success: true, id: sub.id };
				} catch (error) {
					console.error(`Erreur pour l'abonnement ${sub.id}:`, error);
					// Si l'abonnement est invalide (410 Gone), il sera supprimé automatiquement
					return { success: false, id: sub.id, error: error instanceof Error ? error.message : 'Erreur inconnue' };
				}
			})
		);

		const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
		const failed = results.length - sent;

		return json({
			success: true,
			message: `Notifications envoyées: ${sent} réussies, ${failed} échouées`,
			sent,
			failed,
			total: subscriptions.length
		});
	} catch (error) {
		console.error('Erreur lors de l\'envoi:', error);
		return json(
			{ error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
			{ status: 500 }
		);
	}
};

