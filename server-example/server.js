// Exemple de serveur Node.js pour gérer les notifications push iOS/APNs
// Nécessite: npm install express @apns/apns2 jsonwebtoken

const express = require('express');
const apn = require('@apns/apns2');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Configuration APNs (à remplacer par vos valeurs)
const APNS_CONFIG = {
	keyId: process.env.APNS_KEY_ID || 'VOTRE_KEY_ID',
	teamId: process.env.APNS_TEAM_ID || 'VOTRE_TEAM_ID',
	bundleId: process.env.APNS_BUNDLE_ID || 'com.votredomaine.pwa-check',
	keyPath: process.env.APNS_KEY_PATH || path.join(__dirname, 'AuthKey.p8'),
	production: process.env.APNS_PRODUCTION === 'true'
};

// Stockage des abonnements (en production, utilisez une base de données)
const subscriptions = new Map();

// Générer le token JWT pour APNs
function generateAPNSToken() {
	const key = fs.readFileSync(APNS_CONFIG.keyPath, 'utf8');
	
	return jwt.sign(
		{
			iss: APNS_CONFIG.teamId,
			iat: Math.floor(Date.now() / 1000)
		},
		key,
		{
			algorithm: 'ES256',
			header: {
				alg: 'ES256',
				kid: APNS_CONFIG.keyId
			}
		}
	);
}

// Endpoint pour enregistrer un abonnement push
app.post('/api/push/subscribe', async (req, res) => {
	try {
		const { subscription, userAgent } = req.body;
		
		if (!subscription) {
			return res.status(400).json({ error: 'Subscription requise' });
		}

		// Stocker l'abonnement
		const subscriptionId = subscription.keys?.p256dh || Date.now().toString();
		subscriptions.set(subscriptionId, {
			subscription,
			userAgent,
			createdAt: new Date()
		});

		console.log('Nouvel abonnement enregistré:', subscriptionId);
		
		res.json({ 
			success: true, 
			subscriptionId,
			message: 'Abonnement enregistré avec succès' 
		});
	} catch (error) {
		console.error('Erreur lors de l\'enregistrement:', error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

// Endpoint pour envoyer une notification
app.post('/api/push/send', async (req, res) => {
	try {
		const { title, body, subscriptionId, data } = req.body;

		if (!subscriptionId) {
			return res.status(400).json({ error: 'Subscription ID requis' });
		}

		const stored = subscriptions.get(subscriptionId);
		if (!stored) {
			return res.status(404).json({ error: 'Abonnement non trouvé' });
		}

		const subscription = stored.subscription;
		const isIOS = /iPad|iPhone|iPod/.test(stored.userAgent || '');

		if (isIOS) {
			// Envoyer via APNs pour iOS
			await sendIOSNotification(subscription, title, body, data);
		} else {
			// Envoyer via Web Push standard pour autres plateformes
			await sendWebPushNotification(subscription, title, body, data);
		}

		res.json({ success: true, message: 'Notification envoyée' });
	} catch (error) {
		console.error('Erreur lors de l\'envoi:', error);
		res.status(500).json({ error: 'Erreur lors de l\'envoi' });
	}
});

// Fonction pour envoyer une notification iOS via APNs
async function sendIOSNotification(subscription, title, body, data = {}) {
	const token = generateAPNSToken();
	const apnsProvider = new apn.Provider({
		token: {
			key: fs.readFileSync(APNS_CONFIG.keyPath, 'utf8'),
			keyId: APNS_CONFIG.keyId,
			teamId: APNS_CONFIG.teamId
		},
		production: APNS_CONFIG.production
	});

	const notification = new apn.Notification();
	notification.alert = { title, body };
	notification.badge = 1;
	notification.sound = 'default';
	notification.topic = APNS_CONFIG.bundleId;
	notification.payload = data;
	notification.expiry = Math.floor(Date.now() / 1000) + 3600; // 1 heure

	// Extraire le device token depuis la subscription
	// Note: Pour iOS Web Push, le format est différent
	const deviceToken = subscription.endpoint.split('/').pop();

	const result = await apnsProvider.send(notification, deviceToken);
	
	if (result.failed.length > 0) {
		throw new Error(`Échec de l'envoi: ${result.failed[0].response.reason}`);
	}

	return result;
}

// Fonction pour envoyer une notification Web Push standard
async function sendWebPushNotification(subscription, title, body, data = {}) {
	// Utiliser web-push library pour les autres plateformes
	// npm install web-push
	const webpush = require('web-push');
	
	// Configuration de la clé publique/privée VAPID
	// À générer avec: webpush.generateVAPIDKeys()
	const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
	const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

	if (!vapidPublicKey || !vapidPrivateKey) {
		throw new Error('Clés VAPID non configurées');
	}

	webpush.setVapidDetails(
		'mailto:votre@email.com',
		vapidPublicKey,
		vapidPrivateKey
	);

	const payload = JSON.stringify({
		title,
		body,
		...data
	});

	await webpush.sendNotification(subscription, payload);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Serveur push démarré sur le port ${PORT}`);
	console.log(`Configuration APNs:`, {
		keyId: APNS_CONFIG.keyId,
		teamId: APNS_CONFIG.teamId,
		bundleId: APNS_CONFIG.bundleId,
		production: APNS_CONFIG.production
	});
});

