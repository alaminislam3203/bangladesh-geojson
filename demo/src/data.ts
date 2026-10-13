import divisionsRaw from '../../src/data/bd-divisions.json';
import districtsRaw from '../../src/data/bd-districts.json';
import upazilasRaw from '../../src/data/bd-upazilas.json';
import postcodesRaw from '../../src/data/bd-postcodes.json';
import type {
  Division,
  District,
  Upazila,
  Postcode,
} from '../../src/types';

export const divisions: Division[] = (divisionsRaw as { divisions: Division[] }).divisions;
export const districts: District[] = (districtsRaw as { districts: District[] }).districts;
export const upazilas: Upazila[] = (upazilasRaw as { upazilas: Upazila[] }).upazilas;
export const postcodes: Postcode[] = (postcodesRaw as { postcodes: Postcode[] }).postcodes;

export type { Division, District, Upazila, Postcode };

export type SearchHit =
  | { type: 'division'; data: Division }
  | { type: 'district'; data: District }
  | { type: 'upazila'; data: Upazila }
  | { type: 'postcode'; data: Postcode };

export function search(query: string, limit = 25): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: SearchHit[] = [];
  const matches = (s?: string) => !!s && s.toLowerCase().includes(q);

  for (const d of divisions) {
    if (matches(d.name) || matches(d.bn_name)) out.push({ type: 'division', data: d });
    if (out.length >= limit) return out;
  }
  for (const d of districts) {
    if (matches(d.name) || matches(d.bn_name)) out.push({ type: 'district', data: d });
    if (out.length >= limit) return out;
  }
  for (const u of upazilas) {
    if (matches(u.name) || matches(u.bn_name)) out.push({ type: 'upazila', data: u });
    if (out.length >= limit) return out;
  }
  for (const p of postcodes) {
    if (matches(p.postOffice) || matches(p.upazila) || matches(p.postCode)) {
      out.push({ type: 'postcode', data: p });
    }
    if (out.length >= limit) return out;
  }
  return out;
}
