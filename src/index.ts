import divisionsRaw from './data/bd-divisions.json';
import districtsRaw from './data/bd-districts.json';
import upazilasRaw from './data/bd-upazilas.json';
import postcodesRaw from './data/bd-postcodes.json';
import dhakaRaw from './data/dhaka-city.json';
import {
  Division,
  District,
  Upazila,
  Postcode,
  DhakaArea,
  SearchResult,
  HierarchyDivision,
  HierarchyDistrict,
} from './types';

const divisions: Division[] = (divisionsRaw as { divisions: Division[] }).divisions;
const districts: District[] = (districtsRaw as { districts: District[] }).districts;
const upazilas: Upazila[] = (upazilasRaw as { upazilas: Upazila[] }).upazilas;
const postcodes: Postcode[] = (postcodesRaw as { postcodes: Postcode[] }).postcodes;
const dhaka: DhakaArea[] = (dhakaRaw as { dhaka: DhakaArea[] }).dhaka;

export function getDivisions(): Division[] {
  return divisions;
}

export function getDivisionById(id: string): Division | undefined {
  return divisions.find((d) => d.id === id);
}

export function getDistricts(): District[] {
  return districts;
}

export function getDistrictById(id: string): District | undefined {
  return districts.find((d) => d.id === id);
}

export function getDistrictsByDivision(divisionId: string): District[] {
  return districts.filter((d) => d.division_id === divisionId);
}

export function getUpazilas(): Upazila[] {
  return upazilas;
}

export function getUpazilaById(id: string): Upazila | undefined {
  return upazilas.find((u) => u.id === id);
}

export function getUpazilasByDistrict(districtId: string): Upazila[] {
  return upazilas.filter((u) => u.district_id === districtId);
}

export function getPostcodes(): Postcode[] {
  return postcodes;
}

export function getPostcodesByDistrict(districtId: string): Postcode[] {
  return postcodes.filter((p) => p.district_id === districtId);
}

export function getDhakaAreas(): DhakaArea[] {
  return dhaka;
}

export function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];
  const matches = (s: string | undefined) => !!s && s.toLowerCase().includes(q);

  for (const d of divisions) {
    if (matches(d.name) || matches(d.bn_name)) results.push({ type: 'division', data: d });
  }
  for (const d of districts) {
    if (matches(d.name) || matches(d.bn_name)) results.push({ type: 'district', data: d });
  }
  for (const u of upazilas) {
    if (matches(u.name) || matches(u.bn_name)) results.push({ type: 'upazila', data: u });
  }
  for (const p of postcodes) {
    if (matches(p.postOffice) || matches(p.upazila) || matches(p.postCode)) {
      results.push({ type: 'postcode', data: p });
    }
  }
  return results;
}

export function getFullHierarchy(): HierarchyDivision[] {
  return divisions.map((division) => {
    const divDistricts: HierarchyDistrict[] = districts
      .filter((d) => d.division_id === division.id)
      .map((district) => ({
        ...district,
        upazilas: upazilas.filter((u) => u.district_id === district.id),
      }));
    return { ...division, districts: divDistricts };
  });
}

const bd = {
  getDivisions,
  getDivisionById,
  getDistricts,
  getDistrictById,
  getDistrictsByDivision,
  getUpazilas,
  getUpazilaById,
  getUpazilasByDistrict,
  getPostcodes,
  getPostcodesByDistrict,
  getDhakaAreas,
  search,
  getFullHierarchy,
};

export default bd;
export * from './types';
