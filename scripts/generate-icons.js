#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Since we can't use Sharp, we'll create simple PNG-like files
// For production, use https://realfavicongenerator.net/ or convert SVG to PNG

const iconsSvg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A192F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a3a5c;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect x="51" y="51" width="410" height="410" rx="61" fill="url(#shield-gradient)" stroke="#D4AF37" stroke-width="20"/>
  <rect x="77" y="77" width="358" height="358" rx="43" fill="none" stroke="#D4AF37" stroke-width="10"/>
  
  <text x="256" y="260" font-family="Arial, sans-serif" font-size="160" font-weight="900" fill="white" text-anchor="middle" letter-spacing="8">HATI</text>
  
  <g transform="translate(256, 340)">
    <rect x="-20" y="-50" width="40" height="100" fill="#D4AF37"/>
    <rect x="-50" y="-20" width="100" height="40" fill="#D4AF37"/>
  </g>
  
  <circle cx="80" cy="80" r="12" fill="#D4AF37"/>
  <circle cx="432" cy="80" r="12" fill="#D4AF37"/>
  <circle cx="80" cy="432" r="12" fill="#D4AF37"/>
  <circle cx="432" cy="432" r="12" fill="#D4AF37"/>
</svg>`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Save SVG
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconsSvg);
console.log('✅ Created icon.svg');

// For now, copy SVG as placeholder for PNG files
// In production, convert using online tools or ImageMagick
const sizes = [192, 512, 180, 16, 32];
const filenames = ['icon-192x192', 'icon-512x512', 'apple-touch-icon', 'favicon-16x16', 'favicon-32x32'];

filenames.forEach((name) => {
  const pngPath = path.join(iconsDir, `${name}.svg`);
  fs.writeFileSync(pngPath, iconsSvg);
  console.log(`✅ Created ${name}.svg (use online SVG to PNG converter for production)`);
});

console.log('\n⚠️  Note: These are SVG files. For production, convert to PNG at https://ezgif.com/svg-to-png');
