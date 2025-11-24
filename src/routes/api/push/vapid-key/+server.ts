import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// La clé publique VAPID (doit correspondre à VAPID_PUBLIC_KEY dans les variables d'environnement)
// Pour générer: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';

export const GET: RequestHandler = async () => {
	if (!VAPID_PUBLIC_KEY) {
		return json({
			publicKey: '',
			message: 'Clé VAPID non configurée. Configurez VAPID_PUBLIC_KEY dans les variables d\'environnement.'
		});
	}

	return json({
		publicKey: VAPID_PUBLIC_KEY
	});
};

