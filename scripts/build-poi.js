#!/usr/bin/env node
/**
 * Extract POI layers (bazars, major routes) from OpenStreetMap via the
 * Overpass API and emit GeoJSON FeatureCollections under src/data/.
 *
 * Usage:
 *   node scripts/build-poi.js bazars
 *   node scripts/build-poi.js routes
 *   node scripts/build-poi.js all
 *
 * Output (ODbL 1.0, © OpenStreetMap contributors):
 *   src/data/bd-bazars.geojson         (Point FeatureCollection)
 *   src/data/bd-major-routes.geojson   (LineString/MultiLineString)
 *
 * Each output includes a `metadata` object with the Overpass query,
 * fetch date, and attribution. Bazars are point-in-polygon resolved
 * against bangladesh.geojson to attach upazila_id / district_id /
 * division_id when possible.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

const ATTRIBUTION = '© OpenStreetMap contributors — odbl-1.0';
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const QUERIES = {
  bazars: `[out:json][timeout:180];
area["ISO3166-1"="BD"]->.bd;
(
  node["amenity"="marketplace"](area.bd);
  way["amenity"="marketplace"](area.bd);
  node["shop"="marketplace"](area.bd);
  way["shop"="marketplace"](area.bd);
);
out center tags;`,
  routes: `[out:json][timeout:240];
area["ISO3166-1"="BD"]->.bd;
(
  way["highway"~"^(motorway|trunk|primary)$"](area.bd);
);
out geom;`,
};

async function overpass(query) {
  let lastErr = null;
  // Retry each endpoint twice with backoff, since Overpass commonly returns
  // 429 (rate limit) when the public servers are busy.
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const url of OVERPASS_ENDPOINTS) {
      try {
        console.log(`POST ${url} (attempt ${attempt + 1})`);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'bangladesh-geojson/1.0 (https://github.com/alaminislam3203/bangladesh-geojson)',
          },
          body: new URLSearchParams({ data: query }).toString(),
        });
        if (!res.ok) {
          lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
          if (res.status === 429 || res.status === 504) {
            await sleep(15_000);
          }
          continue;
        }
        return res.json();
      } catch (e) {
        lastErr = e;
      }
    }
    if (attempt === 0) await sleep(20_000);
  }
  throw lastErr || new Error('All Overpass endpoints failed');
}

function pickBazarName(tags) {
  return (
    tags.name || tags['name:en'] || tags.short_name || tags.alt_name || tags['official_name'] || ''
  );
}

function pickBnName(tags) {
  return tags['name:bn'] || '';
}

// --- Point-in-polygon utilities ------------------------------------------

function pointInRing(p, ring) {
  // Standard ray-casting; ring is [[lng,lat], ...].
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(p, polygon) {
  // polygon = [outer, ...holes]
  if (!pointInRing(p, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(p, polygon[i])) return false;
  }
  return true;
}

function pointInGeometry(p, geom) {
  if (geom.type === 'Polygon') return pointInPolygon(p, geom.coordinates);
  if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      if (pointInPolygon(p, poly)) return true;
    }
  }
  return false;
}

function bboxOfGeometry(geom) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function visit(c) {
    if (typeof c[0] === 'number') {
      if (c[0] < minX) minX = c[0];
      if (c[0] > maxX) maxX = c[0];
      if (c[1] < minY) minY = c[1];
      if (c[1] > maxY) maxY = c[1];
    } else for (const x of c) visit(x);
  }
  visit(geom.coordinates);
  return [minX, minY, maxX, maxY];
}

function loadBoundaryIndex() {
  const file = path.join(DATA, 'bangladesh.geojson');
  if (!fs.existsSync(file)) {
    console.warn('bangladesh.geojson not found — points will not be resolved to upazilas.');
    return null;
  }
  const fc = JSON.parse(fs.readFileSync(file, 'utf8'));
  // Pre-compute bboxes so we can skip features whose bbox excludes the point.
  const features = fc.features
    .filter((f) => f.properties?.upazila_id) // only resolve to matched upazilas
    .map((f) => ({
      bbox: bboxOfGeometry(f.geometry),
      geom: f.geometry,
      props: f.properties,
    }));
  return features;
}

function resolveUpazila(point, index) {
  if (!index) return null;
  const [x, y] = point;
  for (const f of index) {
    const [minX, minY, maxX, maxY] = f.bbox;
    if (x < minX || x > maxX || y < minY || y > maxY) continue;
    if (pointInGeometry(point, f.geom)) return f.props;
  }
  return null;
}

// --- Builders ------------------------------------------------------------

async function buildBazars() {
  const data = await overpass(QUERIES.bazars);
  console.log(`Got ${data.elements.length} elements from Overpass`);
  const index = loadBoundaryIndex();
  const features = [];
  let unnamed = 0;
  for (const el of data.elements) {
    const tags = el.tags || {};
    const name = pickBazarName(tags);
    if (!name) {
      unnamed++;
      continue;
    }
    let lng, lat;
    if (el.type === 'node') {
      lng = el.lon;
      lat = el.lat;
    } else if (el.center) {
      lng = el.center.lon;
      lat = el.center.lat;
    } else {
      continue;
    }
    const upa = resolveUpazila([lng, lat], index);
    features.push({
      type: 'Feature',
      id: `${el.type}/${el.id}`,
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        osm_id: `${el.type}/${el.id}`,
        name,
        bn_name: pickBnName(tags),
        upazila_id: upa?.upazila_id || '',
        district_id: upa?.district_id || '',
        division_id: upa?.division_id || '',
        upazila: upa?.name || '',
        district: upa?.district_name || '',
        // Useful surface tags:
        operator: tags.operator,
        opening_hours: tags.opening_hours,
        wikidata: tags.wikidata,
      },
    });
  }
  const fc = {
    type: 'FeatureCollection',
    metadata: {
      source: 'OpenStreetMap (Overpass API)',
      query: QUERIES.bazars,
      fetchedAt: new Date().toISOString(),
      attribution: ATTRIBUTION,
      license: 'ODbL 1.0',
      featureCount: features.length,
    },
    features,
  };
  const out = path.join(DATA, 'bd-bazars.geojson');
  fs.writeFileSync(out, JSON.stringify(fc));
  console.log(`Wrote ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
  console.log(`  ${features.length} bazars, ${unnamed} skipped (unnamed)`);
}

async function buildRoutes() {
  const data = await overpass(QUERIES.routes);
  console.log(`Got ${data.elements.length} elements from Overpass`);
  const features = [];
  // Round coords to 5 decimals (~1.1 m accuracy) to shrink the file.
  const round = (n) => Math.round(n * 1e5) / 1e5;
  // Drop tiny stub ways under ~150 m to cut noise.
  const minLengthDeg = 0.0014; // ≈ 150 m at this latitude
  function dedupConsecutive(coords) {
    const out = [coords[0]];
    for (let i = 1; i < coords.length; i++) {
      const [px, py] = out[out.length - 1];
      const [x, y] = coords[i];
      if (x !== px || y !== py) out.push([x, y]);
    }
    return out;
  }
  function pointLineDistSq(p, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    if (dx === 0 && dy === 0) {
      const ddx = p[0] - a[0];
      const ddy = p[1] - a[1];
      return ddx * ddx + ddy * ddy;
    }
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    const ex = a[0] + t * dx - p[0];
    const ey = a[1] + t * dy - p[1];
    return ex * ex + ey * ey;
  }
  function douglasPeucker(coords, epsilon) {
    if (coords.length < 3) return coords;
    const eps2 = epsilon * epsilon;
    const stack = [[0, coords.length - 1]];
    const keep = new Uint8Array(coords.length);
    keep[0] = 1;
    keep[coords.length - 1] = 1;
    while (stack.length) {
      const [s, e] = stack.pop();
      let maxD = 0;
      let maxI = -1;
      for (let i = s + 1; i < e; i++) {
        const d = pointLineDistSq(coords[i], coords[s], coords[e]);
        if (d > maxD) {
          maxD = d;
          maxI = i;
        }
      }
      if (maxD > eps2 && maxI !== -1) {
        keep[maxI] = 1;
        stack.push([s, maxI], [maxI, e]);
      }
    }
    const out = [];
    for (let i = 0; i < coords.length; i++) if (keep[i]) out.push(coords[i]);
    return out;
  }
  // ~55 m at Bangladesh latitude — enough to drop GPS jitter on long roads
  // while keeping curves visually smooth at the demo's zoom levels.
  const dpEpsilon = 0.0005;
  function approxLength(coords) {
    let s = 0;
    for (let i = 1; i < coords.length; i++) {
      const dx = coords[i][0] - coords[i - 1][0];
      const dy = coords[i][1] - coords[i - 1][1];
      s += Math.sqrt(dx * dx + dy * dy);
    }
    return s;
  }
  let dropped = 0;
  for (const el of data.elements) {
    if (el.type !== 'way' || !el.geometry) continue;
    let coords = el.geometry.map((g) => [round(g.lon), round(g.lat)]);
    coords = dedupConsecutive(coords);
    if (coords.length < 2) continue;
    if (approxLength(coords) < minLengthDeg) {
      dropped++;
      continue;
    }
    coords = douglasPeucker(coords, dpEpsilon);
    const tags = el.tags || {};
    features.push({
      type: 'Feature',
      id: `way/${el.id}`,
      geometry: { type: 'LineString', coordinates: coords },
      properties: {
        osm_id: `way/${el.id}`,
        name: tags.name || tags['name:en'] || '',
        bn_name: tags['name:bn'] || '',
        ref: tags.ref || '',
        highway: tags.highway,
        surface: tags.surface,
        lanes: tags.lanes,
        oneway: tags.oneway,
      },
    });
  }
  const fc = {
    type: 'FeatureCollection',
    metadata: {
      source: 'OpenStreetMap (Overpass API)',
      query: QUERIES.routes,
      fetchedAt: new Date().toISOString(),
      attribution: ATTRIBUTION,
      license: 'ODbL 1.0',
      featureCount: features.length,
    },
    features,
  };
  const out = path.join(DATA, 'bd-major-routes.geojson');
  fs.writeFileSync(out, JSON.stringify(fc));
  const sizeKB = fs.statSync(out).size / 1024;
  console.log(`Wrote ${path.relative(ROOT, out)} (${sizeKB.toFixed(0)} KB)`);
  console.log(`  ${features.length} ways kept, ${dropped} dropped (under 150m)`);
  if (sizeKB > 2048) {
    console.warn(
      `  ⚠ Routes file exceeds 2 MB budget — consider further mapshaper simplification or CDN hosting.`
    );
  }
}

(async () => {
  const cmd = process.argv[2];
  if (!cmd || !['bazars', 'routes', 'all'].includes(cmd)) {
    console.error('Usage: node scripts/build-poi.js <bazars|routes|all>');
    process.exit(1);
  }
  if (cmd === 'bazars' || cmd === 'all') await buildBazars();
  if (cmd === 'routes' || cmd === 'all') await buildRoutes();
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
