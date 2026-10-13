# Bangladesh GeoJSON — Project Context

## What This Is
Open-source geographic data repository for Bangladesh. Free public good. No monetization.

**GitHub:** https://github.com/alaminislam3203/bangladesh-geojson  
**Demo site:** https://geojson.bd (GitHub Pages + custom domain)

## Goals
- Build community brand as the trusted Bangladesh geo data source
- Keep data accurate and fresh for the developer community
- No paid tiers, no SaaS, no over-engineering

## Current Data (in src/data/)
| File | Records |
|------|---------|
| bd-divisions.json | 8 divisions |
| bd-districts.json | 64 districts |
| bd-upazilas.json | 494 upazilas |
| bd-postcodes.json | 1,349 postcodes |
| bangladesh.geojson | full boundary polygons (7MB) |
| dhaka-city.json | Dhaka city data |

## Data Shape
```json
// Division
{ "id": "3", "name": "Dhaka", "bn_name": "ঢাকা", "lat": "23.810332", "long": "90.412518" }

// District
{ "id": "1", "division_id": "3", "name": "Dhaka", "bn_name": "ঢাকা", "lat": "23.7115253", "long": "90.4111451" }

// Upazila
{ "id": "1", "district_id": "34", "name": "Amtali", "bn_name": "আমতলী" }
```

## Target Structure
```
bangladesh-geojson/
├── src/
│   ├── data/          ← all JSON files live here
│   ├── index.ts       ← npm package entry (query functions)
│   └── types.ts       ← TypeScript definitions
├── demo/              ← React + Vite demo site (geojson.bd)
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── index.css
├── scripts/
│   └── validate-data.js  ← CI data validation
├── docs/
│   ├── CONTRIBUTING.md
│   └── USAGE.md
├── .github/workflows/
│   └── validate.yml   ← GitHub Actions: validate + deploy demo
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── CLAUDE.md
├── LICENSE            ← MIT
└── .gitignore
```

## Tech Stack
- **npm package:** TypeScript, exports query functions
- **Demo site:** React + Vite + Tailwind CSS + MapLibre GL JS
- **Map tiles:** OpenFreeMap (https://openfreemap.org) — free, no API key needed
- **Deploy:** GitHub Actions → GitHub Pages → geojson.bd

## npm Package API
```ts
import bd from 'bangladesh-geojson';

bd.getDivisions()
bd.getDivisionById(id)
bd.getDistricts()
bd.getDistrictsByDivision(divisionId)
bd.getDistrictById(id)
bd.getUpazilas()
bd.getUpazilasByDistrict(districtId)
bd.getUpazilaById(id)
bd.getPostcodes()
bd.getPostcodesByDistrict(districtName)
bd.search(query)           // searches EN + Bangla names
bd.getFullHierarchy()
```

## Demo Site (geojson.bd)
Single page React app. Shows:
1. Stats bar — 8 Divisions · 64 Districts · 494 Upazilas · 1,349 Postcodes
2. Search bar — find any location by EN or Bangla name
3. Division → District → Upazila cascade dropdowns
4. Selected location card — shows data + "Copy JSON" button
5. MapLibre map (OpenFreeMap tiles) centered on Bangladesh
   - Overlays bangladesh.geojson as division boundary layer
   - Map flies to selected/searched location

## Design
- Bangladesh green (#006a4e) as primary color
- Clean, minimal, fast
- Mobile friendly
- No analytics, no tracking, no ads

## GitHub Actions
Two jobs:
1. **validate** — runs `node scripts/validate-data.js` on every push/PR
2. **deploy-demo** — builds demo with Vite, deploys to GitHub Pages with CNAME: geojson.bd (runs on master merge only)

## Data Validation Rules
- JSON structure valid
- Required fields present (id, name, bn_name)
- Referential integrity (district.division_id exists, upazila.district_id exists)
- Coordinates within Bangladesh bounds (lat 20.5–26.7, long 88.0–92.8)
- No duplicate IDs

## Known Data Issues (fix as part of this build)
- 1,337 postcodes are missing the `district` field — needs to be mapped

## Notes
- Owner is a PHP developer — keep scripts simple and well commented
- Lazy load the 7MB bangladesh.geojson in the demo
- Always show both English and Bangla names
- Keep it simple — this is a data repo with a demo, not a product
