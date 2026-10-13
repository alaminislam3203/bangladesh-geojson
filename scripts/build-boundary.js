#!/usr/bin/env node
/**
 * Regenerate src/data/bangladesh.geojson from a current upazila-level
 * boundary source (geoBoundaries CGAZ Bangladesh ADM3) and join each
 * polygon to our existing upazila/district/division IDs + Bangla names.
 *
 * Usage:
 *   node scripts/build-boundary.js
 *
 * Source:
 *   https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM3/
 *   License: CC BY 4.0 (attributed in the meta sidecar).
 *   Underlying: BBS / OCHA ROAP, year 2020.
 *
 * Strategy:
 *   - Match each ADM3 feature to one of our 494 upazilas by normalized name.
 *   - When multiple of our upazilas share a name (e.g. many "Sadar"
 *     upazilas), pick the one whose parent district centroid is nearest
 *     to the ADM3 polygon's centroid.
 *   - Unmatched features are kept with empty IDs and reported at the end
 *     for manual review.
 *   - The script does NOT call mapshaper; the geoBoundaries simplified
 *     file is already ~4MB which fits inside our budget.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const CACHE = path.join(ROOT, '.cache');

const META_URL = 'https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM3/';
const SIMPLIFIED_URL =
  'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BGD/ADM3/geoBoundaries-BGD-ADM3_simplified.geojson';

const SOURCE_FILE = path.join(CACHE, 'bgd-adm3-simplified.geojson');
const OUTPUT_FILE = path.join(DATA, 'bangladesh.geojson');
const META_FILE = path.join(DATA, 'bangladesh.geojson.meta.json');

// Hand-mapped aliases between source names and our upazila names.
// Source = geoBoundaries `shapeName`. Target = our `bd-upazilas.json` name.
// Each entry maps the *normalized* source name to the *raw* upazila name
// in our data. These cover spelling differences that the heuristic
// passes below cannot recover (transliteration, alternate names).
const NAME_ALIASES = {
  banchharampur: 'Bancharampur',
  baniachong: 'Baniachang',
  burichang: 'Burichong',
  daganbhuiyan: 'Daganbhyan',
  bishwambarpur: 'Bishwamvarpur',
  pirgacha: 'Pirgachha',
  pirganj: 'Pirganj',
  rajarhat: 'Rajarhat',
  rangpur: 'Rangpur Sadar',
  // Suffix-stripped variants — handled by stripSuffix(), kept for clarity:
};

// Source-side suffix/parenthetical noise we want to drop before matching.
const SOURCE_SUFFIX_RE = /\s*\(.+?\)\s*$/;

// Target-side suffixes / shorthand we want to drop on our upazila names.
const TARGET_SUFFIX_RES = [
  /\s+upazilla$/i,
  /\s+upazila$/i,
  /-s$/i, // truncated "-Sadar"
];

function strip(s, res) {
  let out = s;
  for (const re of res) out = out.replace(re, '');
  return out;
}

function baseNorm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[।॥]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tightNorm(s) {
  // No spaces, no hyphens, no apostrophes, no parens — for fuzzy match.
  return baseNorm(s).replace(/[\s\-'()]/g, '');
}

// Build all candidate keys for a name (used for both lookups and indexing).
function keysFor(rawName, side /* 'source' | 'target' */) {
  const out = new Set();
  let s = baseNorm(rawName);
  out.add(s);
  out.add(tightNorm(s));

  if (side === 'source') {
    const noParens = baseNorm(rawName.replace(SOURCE_SUFFIX_RE, ''));
    out.add(noParens);
    out.add(tightNorm(noParens));
  }
  if (side === 'target') {
    const stripped = baseNorm(strip(rawName, TARGET_SUFFIX_RES));
    out.add(stripped);
    out.add(tightNorm(stripped));
  }

  return [...out].filter(Boolean);
}

function applyAlias(sourceName) {
  const k = tightNorm(sourceName);
  return NAME_ALIASES[k] || null; // returns the alias's *target* raw name
}

function centroidOf(geometry) {
  // Crude centroid: mean of all positions. Good enough for nearest-district.
  let sumX = 0, sumY = 0, count = 0;
  function visit(coords) {
    if (typeof coords[0] === 'number') {
      sumX += coords[0];
      sumY += coords[1];
      count++;
    } else for (const c of coords) visit(c);
  }
  visit(geometry.coordinates);
  return count ? [sumX / count, sumY / count] : [0, 0];
}

function haversine([lng1, lat1], [lng2, lat2]) {
  // Plain squared euclidean is fine here — we're comparing district
  // distances within a small country, not measuring real-world km.
  const dx = lng1 - lng2;
  const dy = lat1 - lat2;
  return dx * dx + dy * dy;
}

async function fetchIfMissing() {
  fs.mkdirSync(CACHE, { recursive: true });
  if (fs.existsSync(SOURCE_FILE) && fs.statSync(SOURCE_FILE).size > 1_000_000) {
    console.log(`Using cached ${path.relative(ROOT, SOURCE_FILE)}`);
    return;
  }
  console.log(`Downloading geoBoundaries ADM3 simplified...`);
  const res = await fetch(SIMPLIFIED_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${SIMPLIFIED_URL}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(SOURCE_FILE, buf);
  console.log(`Cached ${(buf.length / 1024).toFixed(0)} KB`);
}

async function fetchMeta() {
  const res = await fetch(META_URL);
  if (!res.ok) return null;
  return res.json();
}

(async () => {
  await fetchIfMissing();
  const sourceMeta = await fetchMeta().catch(() => null);

  const source = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  console.log(`Loaded source: ${source.features.length} features`);

  const divisions = JSON.parse(fs.readFileSync(path.join(DATA, 'bd-divisions.json'), 'utf8')).divisions;
  const districts = JSON.parse(fs.readFileSync(path.join(DATA, 'bd-districts.json'), 'utf8')).districts;
  const upazilas = JSON.parse(fs.readFileSync(path.join(DATA, 'bd-upazilas.json'), 'utf8')).upazilas;

  const districtById = new Map(districts.map((d) => [d.id, d]));
  const divisionById = new Map(divisions.map((d) => [d.id, d]));

  // Build an index from normalized name → upazila records. A single
  // upazila contributes multiple keys (loose + tight + suffix-stripped).
  const upazilasByName = new Map();
  const upazilaByRawName = new Map();
  for (const u of upazilas) {
    upazilaByRawName.set(u.name, u);
    for (const k of keysFor(u.name, 'target')) {
      if (!upazilasByName.has(k)) upazilasByName.set(k, []);
      if (!upazilasByName.get(k).includes(u)) upazilasByName.get(k).push(u);
    }
  }

  const usedUpazilaIds = new Set();
  const matched = [];
  const unmatched = [];

  for (const feat of source.features) {
    const rawName = feat.properties?.shapeName || '';
    const aliasTarget = applyAlias(rawName);
    let candidates = [];
    if (aliasTarget && upazilaByRawName.has(aliasTarget)) {
      const u = upazilaByRawName.get(aliasTarget);
      if (!usedUpazilaIds.has(u.id)) candidates = [u];
    }
    if (candidates.length === 0) {
      const seen = new Set();
      for (const k of keysFor(rawName, 'source')) {
        for (const u of upazilasByName.get(k) || []) {
          if (usedUpazilaIds.has(u.id) || seen.has(u.id)) continue;
          seen.add(u.id);
          candidates.push(u);
        }
        if (candidates.length) break; // first key with any hits wins
      }
    }

    let chosen = null;
    if (candidates.length === 1) {
      chosen = candidates[0];
    } else if (candidates.length > 1) {
      // Disambiguate by parent district centroid distance.
      const featCentroid = centroidOf(feat.geometry);
      let best = null;
      let bestDist = Infinity;
      for (const u of candidates) {
        const dist = districtById.get(u.district_id);
        if (!dist) continue;
        const dCentroid = [parseFloat(dist.long), parseFloat(dist.lat)];
        const d = haversine(featCentroid, dCentroid);
        if (d < bestDist) {
          bestDist = d;
          best = u;
        }
      }
      chosen = best || candidates[0];
    }

    let properties;
    if (chosen) {
      usedUpazilaIds.add(chosen.id);
      const district = districtById.get(chosen.district_id);
      const division = district ? divisionById.get(district.division_id) : null;
      properties = {
        upazila_id: chosen.id,
        district_id: chosen.district_id,
        division_id: district?.division_id || '',
        name: chosen.name,
        bn_name: chosen.bn_name,
        district_name: district?.name || '',
        district_bn_name: district?.bn_name || '',
        division_name: division?.name || '',
        division_bn_name: division?.bn_name || '',
        source_name: rawName,
      };
      matched.push({ rawName, upazila: chosen.name });
    } else {
      properties = {
        upazila_id: '',
        district_id: '',
        division_id: '',
        name: rawName,
        bn_name: '',
        district_name: '',
        district_bn_name: '',
        division_name: '',
        division_bn_name: '',
        source_name: rawName,
      };
      unmatched.push(rawName);
    }

    feat.properties = properties;
  }

  // Compute bbox for the meta sidecar + the file's top-level bbox field.
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  function visit(coords) {
    if (typeof coords[0] === 'number') {
      const [lng, lat] = coords;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else for (const c of coords) visit(c);
  }
  for (const f of source.features) visit(f.geometry.coordinates);
  source.bbox = [minLng, minLat, maxLng, maxLat];

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(source));
  const meta = {
    source: 'geoBoundaries gbOpen Bangladesh ADM3 (simplified)',
    sourceUrl: SIMPLIFIED_URL,
    sourceMetaUrl: META_URL,
    sourceLicense: 'CC BY 4.0',
    sourceAttribution:
      'Boundaries © geoBoundaries (geoboundaries.org), CC BY 4.0. Underlying: Bangladesh Bureau of Statistics (BBS) / OCHA ROAP.',
    sourceYear: sourceMeta?.boundaryYearRepresented || '2020',
    sourceCommit: '9469f09',
    fetchedAt: new Date().toISOString(),
    featureCount: source.features.length,
    matchedCount: matched.length,
    unmatchedCount: unmatched.length,
    bbox: source.bbox,
  };
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2) + '\n');

  console.log('-------------------------------------');
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_FILE)} (${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(0)} KB)`);
  console.log(`Wrote ${path.relative(ROOT, META_FILE)}`);
  console.log(`Matched:   ${matched.length}`);
  console.log(`Unmatched: ${unmatched.length}`);
  console.log(`Bbox: lat ${minLat.toFixed(3)}–${maxLat.toFixed(3)}, lng ${minLng.toFixed(3)}–${maxLng.toFixed(3)}`);
  if (unmatched.length) {
    console.log('\nUnmatched feature names (sample, up to 30):');
    for (const n of unmatched.slice(0, 30)) console.log(`  - ${n}`);
    if (unmatched.length > 30) console.log(`  ... and ${unmatched.length - 30} more`);
  }
})();
