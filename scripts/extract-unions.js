#!/usr/bin/env node
/**
 * One-off importer: extracts all union records from the Bangladesh
 * National Information Portal page and maps each one to the parent
 * upazila ID in our existing dataset.
 *
 * Usage:
 *   curl -sL https://bangladesh.gov.bd/views/union-list -o /tmp/union-list.html
 *   node scripts/extract-unions.js /tmp/union-list.html
 *
 * Output:
 *   - src/data/bd-unions.json        (matched unions, ready to ship)
 *   - /tmp/unions-unmatched.json     (unmatched, for manual review)
 *
 * Source: https://bangladesh.gov.bd/views/union-list
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

const inputFile = process.argv[2] || '/tmp/union-list.html';
if (!fs.existsSync(inputFile)) {
  console.error(`Input not found: ${inputFile}`);
  console.error('Hint: curl -sL https://bangladesh.gov.bd/views/union-list -o /tmp/union-list.html');
  process.exit(1);
}

const html = fs.readFileSync(inputFile, 'utf8');

// Pull every JSON-ish curly object that mentions union_portal
const records = [];
const re = /\{(?:[^{}]|\{[^{}]*\})*\}/g;
let m;
while ((m = re.exec(html)) !== null) {
  if (m[0].includes('"office_type_code":"union_portal"')) {
    try {
      records.push(JSON.parse(m[0]));
    } catch {
      /* skip malformed */
    }
  }
}

console.log(`Parsed ${records.length} union records from source`);

const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

// Load our existing data
const divisions = JSON.parse(fs.readFileSync(path.join(DATA, 'bd-divisions.json'), 'utf8')).divisions;
const districts = JSON.parse(fs.readFileSync(path.join(DATA, 'bd-districts.json'), 'utf8')).districts;
const upazilas = JSON.parse(fs.readFileSync(path.join(DATA, 'bd-upazilas.json'), 'utf8')).upazilas;

const divByName = new Map();
for (const d of divisions) {
  divByName.set(norm(d.name), d);
  divByName.set(norm(d.bn_name), d);
}
const distByDivAndName = new Map();
for (const d of districts) {
  distByDivAndName.set(`${d.division_id}|${norm(d.name)}`, d);
  distByDivAndName.set(`${d.division_id}|${norm(d.bn_name)}`, d);
}
const upaByDistAndName = new Map();
for (const u of upazilas) {
  upaByDistAndName.set(`${u.district_id}|${norm(u.name)}`, u);
  upaByDistAndName.set(`${u.district_id}|${norm(u.bn_name)}`, u);
}

const unions = [];
const unmatched = [];

for (const rec of records) {
  const divEn = rec.division?.title_en || '';
  const divBn = rec.division?.title_bn || rec.division?.title || '';
  const distEn = rec.district?.title_en || '';
  const distBn = rec.district?.title_bn || rec.district?.title || '';
  const upaEn = rec.upazila?.title_en || '';
  const upaBn = rec.upazila?.title_bn || rec.upazila?.title || '';
  const titleEn = (rec.title_en || '').replace(/ Union$/i, '').trim();
  const titleBn = (rec.title_bn || rec.title || '').replace(/ ইউনিয়ন$/u, '').trim();

  const division =
    divByName.get(norm(divEn)) ||
    divByName.get(norm(divBn)) ||
    // Source uses "Chittagong"; we use "Chattogram"
    (norm(divEn) === 'chittagong' ? divByName.get('chattogram') : null);

  if (!division) {
    unmatched.push({ reason: 'no division', divEn, divBn, distEn, upaEn, titleEn });
    continue;
  }

  const district =
    distByDivAndName.get(`${division.id}|${norm(distEn)}`) ||
    distByDivAndName.get(`${division.id}|${norm(distBn)}`) ||
    (norm(distEn) === 'chittagong' ? distByDivAndName.get(`${division.id}|chattogram`) : null) ||
    (norm(distEn) === 'cox’s bazar' ? distByDivAndName.get(`${division.id}|cox's bazar`) : null) ||
    (norm(distEn) === "cox's bazar" ? distByDivAndName.get(`${division.id}|cox's bazar`) : null);

  if (!district) {
    unmatched.push({ reason: 'no district', divEn, distEn, distBn, upaEn, titleEn });
    continue;
  }

  const upazila =
    upaByDistAndName.get(`${district.id}|${norm(upaEn)}`) ||
    upaByDistAndName.get(`${district.id}|${norm(upaBn)}`);

  if (!upazila) {
    unmatched.push({
      reason: 'no upazila',
      divEn,
      distEn,
      district_id: district.id,
      upaEn,
      upaBn,
      titleEn,
    });
    continue;
  }

  unions.push({
    upazila_id: upazila.id,
    name: titleEn,
    bn_name: titleBn,
  });
}

// Deduplicate by (upazila_id, name) and assign incremental ids
const seen = new Set();
const unique = [];
for (const u of unions) {
  const key = `${u.upazila_id}|${norm(u.name)}|${norm(u.bn_name)}`;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(u);
}
unique.sort((a, b) => {
  const ai = parseInt(a.upazila_id, 10);
  const bi = parseInt(b.upazila_id, 10);
  if (ai !== bi) return ai - bi;
  return a.name.localeCompare(b.name);
});
const withIds = unique.map((u, i) => ({ id: String(i + 1), ...u }));

console.log(`Matched: ${withIds.length}`);
console.log(`Unmatched: ${unmatched.length}`);
const reasonCounts = unmatched.reduce((acc, x) => {
  acc[x.reason] = (acc[x.reason] || 0) + 1;
  return acc;
}, {});
console.log('Unmatched by reason:', reasonCounts);

if (unmatched.length) {
  fs.writeFileSync('/tmp/unions-unmatched.json', JSON.stringify(unmatched, null, 2));
  console.log('Wrote /tmp/unions-unmatched.json for manual review');
}

const dryRun = process.argv.includes('--dry-run');
if (!dryRun) {
  const out = { unions: withIds };
  fs.writeFileSync(path.join(DATA, 'bd-unions.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote src/data/bd-unions.json (${withIds.length} unions)`);
} else {
  console.log('(dry run — no files written)');
}
