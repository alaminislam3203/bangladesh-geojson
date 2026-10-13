#!/usr/bin/env node
/**
 * Rasterize demo/public/og.svg → demo/public/og.png (1200×630).
 *
 * Used as the og:image / twitter:image for all three pages
 * (landing, demo, docs). Re-run after editing the SVG.
 *
 * Usage:
 *   node scripts/build-og.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SVG = path.join(ROOT, 'demo', 'public', 'og.svg');
const PNG = path.join(ROOT, 'demo', 'public', 'og.png');

if (!fs.existsSync(SVG)) {
  console.error(`Source not found: ${SVG}`);
  process.exit(1);
}

let Resvg;
try {
  ({ Resvg } = require(path.join(ROOT, 'demo', 'node_modules', '@resvg', 'resvg-js')));
} catch (e) {
  console.error('@resvg/resvg-js is not installed. Run: npm install --save-dev @resvg/resvg-js (in demo/)');
  process.exit(1);
}

const svg = fs.readFileSync(SVG, 'utf8');

// Map our font names to system fallbacks resvg can find. Without this,
// resvg silently substitutes a default which breaks the visual hierarchy.
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: {
    loadSystemFonts: true,
    defaultFontFamily: 'Inter',
    serifFamily: 'Georgia',
    monospaceFamily: 'Menlo',
  },
});
const out = resvg.render().asPng();
fs.writeFileSync(PNG, out);

const sizeKB = (fs.statSync(PNG).size / 1024).toFixed(0);
console.log(`Wrote ${path.relative(ROOT, PNG)} (${sizeKB} KB)`);
