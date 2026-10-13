export interface Division {
  id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

export interface District {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

export interface Upazila {
  id: string;
  district_id: string;
  name: string;
  bn_name: string;
}

export interface Postcode {
  division_id: string;
  district_id: string;
  upazila: string;
  postOffice: string;
  postCode: string;
}

export interface DhakaArea {
  division_id: string;
  district_id: string;
  city_corporation: string;
  name: string;
  bn_name: string;
}

export interface Bazar {
  osm_id: string;
  name: string;
  bn_name: string;
  upazila_id: string;
  district_id: string;
  division_id: string;
  upazila: string;
  district: string;
  operator?: string;
  opening_hours?: string;
  wikidata?: string;
}

export interface Route {
  osm_id: string;
  name: string;
  bn_name: string;
  ref: string;
  highway: 'motorway' | 'trunk' | 'primary' | string;
  surface?: string;
  lanes?: string;
  oneway?: string;
}

export type SearchResultType = 'division' | 'district' | 'upazila' | 'postcode';

export interface SearchResult {
  type: SearchResultType;
  data: Division | District | Upazila | Postcode;
}

export interface HierarchyUpazila extends Upazila {}

export interface HierarchyDistrict extends District {
  upazilas: HierarchyUpazila[];
}

export interface HierarchyDivision extends Division {
  districts: HierarchyDistrict[];
}
