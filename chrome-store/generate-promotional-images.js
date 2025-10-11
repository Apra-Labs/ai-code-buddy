#!/usr/bin/env node

/**
 * AI Code Buddy Promotional Image Generator
 * Generates PNG promotional images from SVG using sharp library
 * Usage: node generate-promotional-images.js
 */

const fs = require('fs');
const path = require('path');

// Use sharp from parent icons directory
const iconsDir = path.join(__dirname, '..', 'icons');
const sharp = require(path.join(iconsDir, 'node_modules', 'sharp'));

// Promotional image specifications
const PROMO_IMAGES = [
  {
    svg: 'promotional-tile-small.svg',
    width: 440,
    height: 280,
    filename: 'promotional-tile-small.png'
  },
  {
    svg: 'promotional-marquee.svg',
    width: 1400,
    height: 560,
    filename: 'promotional-marquee.png'
  }
];

async function generatePromotionalImages() {
  console.log('🎨 AI Code Buddy Promotional Image Generator\n');

  const chromeStoreDir = __dirname;

  for (const { svg, width, height, filename } of PROMO_IMAGES) {
    try {
      const svgPath = path.join(chromeStoreDir, svg);

      if (!fs.existsSync(svgPath)) {
        console.error(`❌ Error: ${svg} not found!`);
        continue;
      }

      const svgBuffer = fs.readFileSync(svgPath);
      const outputPath = path.join(chromeStoreDir, filename);

      console.log(`📝 Processing ${svg}...`);

      await sharp(svgBuffer)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 248, g: 249, b: 250, alpha: 1 } // Light gray background
        })
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✅ Generated ${filename}`);
      console.log(`   Size: ${width}x${height}px | File: ${(stats.size / 1024).toFixed(2)}KB\n`);
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error.message);
    }
  }

  console.log('🎉 Promotional image generation complete!');
  console.log('\n📦 Generated files:');
  PROMO_IMAGES.forEach(({ filename }) => {
    console.log(`   - ${filename}`);
  });
  console.log('\nReady for Chrome Web Store submission!');
}

// Run the generator
generatePromotionalImages().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
