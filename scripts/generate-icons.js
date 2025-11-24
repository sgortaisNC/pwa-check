// Script simple pour générer les icônes PWA
// Nécessite sharp: pnpm add -D sharp

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const sizes = [192, 512];

// Créer une icône SVG simple
function createIconSVG(size) {
	return `
		<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
					<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
				</linearGradient>
			</defs>
			<rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
			<text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">PWA</text>
		</svg>
	`.trim();
}

async function generateIcons() {
	const staticDir = join(process.cwd(), 'static');
	
	for (const size of sizes) {
		const svg = createIconSVG(size);
		const outputPath = join(staticDir, `pwa-${size}x${size}.png`);
		
		try {
			await sharp(Buffer.from(svg))
				.png()
				.toFile(outputPath);
			console.log(`✅ Icône générée: pwa-${size}x${size}.png`);
		} catch (error) {
			console.error(`❌ Erreur lors de la génération de l'icône ${size}x${size}:`, error);
		}
	}
}

generateIcons().catch(console.error);

