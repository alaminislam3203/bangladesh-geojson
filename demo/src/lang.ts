import { createContext, useContext } from 'react';

export type Lang = 'en' | 'bn';

export const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: 'en', setLang: () => {} });

export const useLang = () => useContext(LangContext);

export function nameOf(
  item: { name?: string; bn_name?: string } | undefined,
  lang: Lang
): string {
  if (!item) return '';
  if (lang === 'bn') return item.bn_name || item.name || '';
  return item.name || item.bn_name || '';
}

export const T: Record<string, { en: string; bn: string }> = {
  tagline: { en: 'free for anyone building', bn: 'যেকোনো অ্যাপে ফ্রি' },
  divisions: { en: 'divisions', bn: 'বিভাগ' },
  districts: { en: 'districts', bn: 'জেলা' },
  upazilas: { en: 'upazilas', bn: 'উপজেলা' },
  postcodes: { en: 'postcodes', bn: 'পোস্টকোড' },
  division: { en: 'division', bn: 'বিভাগ' },
  district: { en: 'district', bn: 'জেলা' },
  upazila: { en: 'upazila', bn: 'উপজেলা' },
  postcode: { en: 'postcode', bn: 'পোস্টকোড' },
  searchPh: {
    en: "type a place — try 'sylhet' or 'ঢাকা'",
    bn: 'যেকোনো জায়গা লিখুন — যেমন ‘সিলেট’ বা ‘Dhaka’',
  },
  allDivisions: { en: 'all divisions', bn: 'সব বিভাগ' },
  allDistricts: { en: 'all districts', bn: 'সব জেলা' },
  allUpazilas: { en: 'all upazilas', bn: 'সব উপজেলা' },
  pickDivision: { en: 'pick a division', bn: 'বিভাগ বাছুন' },
  pickDistrict: { en: 'pick a district', bn: 'জেলা বাছুন' },
  empty: {
    en: 'click a place on the map, or pick one from the dropdowns. its details show up here.',
    bn: 'ম্যাপে কোনো জায়গায় ক্লিক করুন, অথবা ড্রপডাউন থেকে বাছুন। তার তথ্য এখানে দেখাবে।',
  },
  copy: { en: 'copy json', bn: 'JSON কপি করুন' },
  copied: { en: 'copied', bn: 'কপি হয়েছে' },
  footerLeft: {
    en: 'made by fahim',
    bn: 'বানিয়েছেন ফাহিম',
  },
  footerRight: {
    en: 'map tiles by openfreemap',
    bn: 'ম্যাপ টাইলস: OpenFreeMap',
  },
};
