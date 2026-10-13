#!/usr/bin/env node
/**
 * Copy the heavy boundary GeoJSON into demo/public/ so Vite serves it
 * as a static asset (lazy-loaded by the map at runtime, not bundled).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'demo', 'public');
const FILES = ['bangladesh.geojson', 'bd-bazars.geojson', 'bd-major-routes.geojson'];

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
for (const name of FILES) {
  const src = path.join(ROOT, 'src', 'data', name);
  if (!fs.existsSync(src)) {
    console.warn(`Skipping ${name} (not found)`);
    continue;
  }
  const dest = path.join(PUBLIC_DIR, name);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${name} → ${path.relative(ROOT, dest)}`);
}
