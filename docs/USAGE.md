# Usage

## Install

```bash
npm install bangladesh-geojson
```

## Use it

```ts
import bd from 'bangladesh-geojson';

bd.getDivisions();              // all 8
bd.getDistrictsByDivision('3'); // districts in Dhaka
bd.getUpazilasByDistrict('1');  // upazilas in Dhaka district
bd.getPostcodesByDistrict('1'); // postcodes
bd.search('সিলেট');             // English or Bangla
bd.getFullHierarchy();          // nested tree of everything
```

The data ships inside the package — no API key, no internet needed once it's installed.

## Pick a layer

Each dataset has its own subpath, so your bundler ships only what you import:

```ts
import divisions from 'bangladesh-geojson/divisions';
import districts from 'bangladesh-geojson/districts';
import upazilas  from 'bangladesh-geojson/upazilas';
import postcodes from 'bangladesh-geojson/postcodes';

import boundary  from 'bangladesh-geojson/boundary'; // upazila polygons (~3.5 MB)
import bazars    from 'bangladesh-geojson/bazars';   // ~3,500 marketplaces
import routes    from 'bangladesh-geojson/routes';   // major highways
```

Boundary feature properties carry our IDs and Bangla names, so you can join polygons back to the JSON:

```ts
boundary.features[0].properties;
// { upazila_id, district_id, division_id, name, bn_name, ... }
```

## TypeScript

```ts
import type { Division, District, Upazila, Postcode, Bazar, Route } from 'bangladesh-geojson';
```

## License

Code is MIT. Boundary is CC BY 4.0 ([geoBoundaries](https://www.geoboundaries.org/)). Bazars and routes are ODbL ([OpenStreetMap](https://www.openstreetmap.org/)).

When you ship the bazars or routes layer, add this line somewhere visible:

> © OpenStreetMap contributors

That's it.

## Caveats

- 12 postcodes are missing the `district_id` mapping. PRs welcome.
- Upazilas don't have lat/long — use the parent district's coordinates.
- The boundary file has 544 polygons; ~118 of those are Dhaka/Chittagong city thanas, not in `bd-upazilas.json`.
