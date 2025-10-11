#!/usr/bin/env node

/**
 * AI Code Buddy Icon Generator
 * Generates PNG icons from SVG using sharp library
 * Usage: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Icon sizes to generate
const ICON_SIZES = [
  { size: 16, filename: 'icon16.png' },
  { size: 48, filename: 'icon48.png' },
  { size: 128, filename: 'icon128.png' }
];

async function generateIcons() {
  console.log('🎨 AI Code Buddy Icon Generator\n');

  const svgPath = path.join(__dirname, 'icon.svg');

  if (!fs.existsSync(svgPath)) {
    console.error('❌ Error: icon.svg not found!');
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  console.log('📝 Reading SVG file...');
  console.log(`   Source: ${svgPath}\n`);

  for (const { size, filename } of ICON_SIZES) {
    try {
      const outputPath = path.join(__dirname, filename);

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✅ Generated ${filename}`);
      console.log(`   Size: ${size}x${size}px | File: ${(stats.size / 1024).toFixed(2)}KB`);
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('\n📦 Generated files:');
  ICON_SIZES.forEach(({ filename }) => {
    console.log(`   - ${filename}`);
  });
}

// Run the generator
generateIcons().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
