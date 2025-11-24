import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Singleton pour éviter plusieurs instances de PrismaClient
let prisma: PrismaClient;

declare global {
	// eslint-disable-next-line no-var
	var __prisma: PrismaClient | undefined;
}

// Configuration Prisma avec gestion d'erreur améliorée
const prismaOptions = {
	log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	errorFormat: 'pretty',
};

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient(prismaOptions);
} else {
	if (!global.__prisma) {
		global.__prisma = new PrismaClient(prismaOptions);
	}
	prisma = global.__prisma;
}

// Gérer la déconnexion proprement
if (process.env.NODE_ENV === 'production') {
	process.on('beforeExit', async () => {
		await prisma.$disconnect();
	});
}

export { prisma };

