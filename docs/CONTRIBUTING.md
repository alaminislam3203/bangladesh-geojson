# Contributing

PRs and issues welcome. Three things you can fix:

## Reference data

Edit the JSON in `src/data/`:

- `bd-divisions.json`, `bd-districts.json`, `bd-upazilas.json`, `bd-postcodes.json`

Rules for new entries: unique `id`, both `name` and `bn_name`, valid parent reference, lat/long inside Bangladesh (lat 20.5–26.7, long 88.0–92.8).

## Bazars and routes

These come from **[OpenStreetMap](https://www.openstreetmap.org/)** — fix them upstream, not here.

**Fastest path:** [open an issue](https://github.com/alaminislam3203/bangladesh-geojson/issues) with a Google Maps link or pin and what's wrong. I'll edit OSM and re-sync.

**Direct path:** sign up at [openstreetmap.org](https://www.openstreetmap.org/user/new), find the place, click **Edit**, fix the `name` / `name:bn` / `amenity=marketplace` / `highway=*` tag, save. Then ping me to re-run the sync.

## Code

PR with a short description. Keep it focused.

## Before you submit

```bash
node scripts/validate-data.js
```

This runs in CI on every PR. If it fails, the PR can't merge.

## Re-running data builds

```bash
node scripts/build-boundary.js     # upazila polygons
node scripts/build-poi.js bazars   # bazars from OpenStreetMap
node scripts/build-poi.js routes   # major highways from OpenStreetMap
node scripts/build-poi.js all      # both
```

Commit the regenerated files alongside your code change.

## License

Code → [MIT](../LICENSE). OpenStreetMap-derived data → [ODbL](../LICENSE-DATA). Submitting a PR means you agree to the matching license for the file you're editing.
