# bangladesh-geojson

[![npm version](https://img.shields.io/npm/v/bangladesh-geojson.svg)](https://www.npmjs.com/package/bangladesh-geojson)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Validate](https://github.com/alaminislam3203/bangladesh-geojson/actions/workflows/validate.yml/badge.svg)](https://github.com/alaminislam3203/bangladesh-geojson/actions/workflows/validate.yml)
[![Demo](https://img.shields.io/badge/demo-geojson.bd-006a4e)](https://geojson.bd)

Open-source geographic data for Bangladesh — divisions, districts, upazilas, postcodes, and full boundary GeoJSON. Free, accurate, and community-maintained.

> **Demo:** https:// · **GitHub:** https://github.com/alaminislam3203/bangladesh-geojson

## Quick Start

```bash
npm install bangladesh-geojson
```

```ts
import bd from 'bangladesh-geojson';

bd.getDivisions();              // 8 divisions
bd.getDistrictsByDivision('3'); // districts in Dhaka division
bd.getUpazilasByDistrict('1');  // upazilas in Dhaka district
bd.search('সিলেট');             // search EN + Bangla names
bd.getFullHierarchy();          // full division → district → upazila tree
```

You can also import the raw JSON files directly:

```ts
import divisions from 'bangladesh-geojson/src/data/bd-divisions.json';
import boundary from 'bangladesh-geojson/src/data/bangladesh.geojson';
```

## What's Inside

| File | Records | Description |
|------|---------|-------------|
| `bd-divisions.json` | 8 | Divisions with EN/BN names + coordinates |
| `bd-districts.json` | 64 | Districts mapped to divisions |
| `bd-upazilas.json` | 494 | Upazilas mapped to districts |
| `bd-postcodes.json` | 1,349 | Post offices and post codes |
| `bangladesh.geojson` | — | Full boundary polygons (~7MB) |
| `dhaka-city.json` | — | Dhaka city / city corporation areas |

All names are bilingual (English + বাংলা).

## Data Shape

```ts
interface Division  { id; name; bn_name; lat; long }
interface District  { id; division_id; name; bn_name; lat; long }
interface Upazila   { id; district_id; name; bn_name }
interface Postcode  { division_id; district_id; upazila; postOffice; postCode }
```

See [src/types.ts](src/types.ts) for the full TypeScript definitions.

## API

| Function | Returns |
|----------|---------|
| `getDivisions()` | `Division[]` |
| `getDivisionById(id)` | `Division \| undefined` |
| `getDistricts()` | `District[]` |
| `getDistrictById(id)` | `District \| undefined` |
| `getDistrictsByDivision(divisionId)` | `District[]` |
| `getUpazilas()` | `Upazila[]` |
| `getUpazilaById(id)` | `Upazila \| undefined` |
| `getUpazilasByDistrict(districtId)` | `Upazila[]` |
| `getPostcodes()` | `Postcode[]` |
| `getPostcodesByDistrict(districtId)` | `Postcode[]` |
| `search(query)` | `SearchResult[]` (matches EN + Bangla) |
| `getFullHierarchy()` | nested tree |

More examples in [docs/USAGE.md](docs/USAGE.md).

## Use Cases

- **E-commerce** — shipping address dropdowns, delivery zones, postcode lookup
- **Logistics** — route planning across divisions and districts
- **NGO / Government** — beneficiary mapping, coverage reporting
- **Fintech** — KYC address validation
- **Civic tech** — election visualizations, public service maps
- **Education** — teaching geography, building Bangla-first apps

## Demo Site

The demo at [geojson.bd](https://geojson.bd) lets you:
- Search any division, district, or upazila by EN or Bangla name
- Browse the full hierarchy with cascade dropdowns
- See the boundary on a MapLibre map (OpenFreeMap tiles)
- Copy any record as JSON in one click

Run it locally:

```bash
npm install
npm run demo:install
npm run demo:dev
```

## Contributing

Found wrong coordinates? A missing upazila? A typo in a Bangla name? PRs are very welcome.

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md). Data validation runs automatically on every PR.

## Validation

Before submitting a data PR, run:

```bash
node scripts/validate-data.js
```

This checks structure, required fields, referential integrity, coordinate bounds, and duplicate IDs.

## License

This project uses **two licenses**:

- **Code** (the npm package, demo site, scripts) — [MIT](LICENSE). Free for any use, commercial or otherwise.
- **Data files derived from OpenStreetMap** — [ODbL 1.0](LICENSE-DATA). Specifically `bd-bazars.geojson` and `bd-major-routes.geojson`. ODbL requires attribution and share-alike on derived databases.
- **Boundary data** (`bangladesh.geojson`) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), sourced from [geoBoundaries](https://www.geoboundaries.org/) (gbOpen, ADM3). Underlying authority: Bangladesh Bureau of Statistics (BBS) / OCHA ROAP.
- **Administrative reference data** (`bd-divisions.json`, `bd-districts.json`, `bd-upazilas.json`, `bd-postcodes.json`, `dhaka-city.json`) — community-contributed, MIT.

**Attribution when using OSM-derived layers:**

> © OpenStreetMap contributors — odbl-1.0

See `metadata.attribution` inside each derived GeoJSON for the exact string.

## Credits

Maintained by [@alaminislam3203](https://github.com/alaminislam3203) and [contributors](https://github.com/alaminislam3203/bangladesh-geojson/graphs/contributors). Map tiles by [OpenFreeMap](https://openfreemap.org).
