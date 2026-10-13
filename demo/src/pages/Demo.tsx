import { useMemo, useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Cascade from '../components/Cascade';
import LocationCard from '../components/LocationCard';
import Map from '../components/Map';
import {
  divisions,
  districts,
  upazilas,
  type Division,
  type District,
  type Upazila,
} from '../data';
import type { SearchHit } from '../data';
import { T, nameOf, useLang } from '../lang';

interface Selection {
  type: 'division' | 'district' | 'upazila';
  data: Division | District | Upazila;
}

const ACCENT_BY_TYPE: Record<'division' | 'district' | 'upazila' | 'postcode', 'mint' | 'peach' | 'rose'> = {
  division: 'mint',
  district: 'peach',
  upazila: 'rose',
  postcode: 'mint',
};

export default function Demo() {
  const { lang } = useLang();
  const [divisionId, setDivisionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [upazilaId, setUpazilaId] = useState('');
  const [searchHit, setSearchHit] = useState<SearchHit | null>(null);

  const selection: Selection | null = useMemo(() => {
    if (upazilaId) {
      const u = upazilas.find((x) => x.id === upazilaId);
      if (u) return { type: 'upazila', data: u };
    }
    if (districtId) {
      const d = districts.find((x) => x.id === districtId);
      if (d) return { type: 'district', data: d };
    }
    if (divisionId) {
      const d = divisions.find((x) => x.id === divisionId);
      if (d) return { type: 'division', data: d };
    }
    return null;
  }, [divisionId, districtId, upazilaId]);

  const flyTo = useMemo(() => {
    if (searchHit) {
      const d = searchHit.data as Partial<Division & District & Upazila>;
      if (searchHit.type === 'upazila') {
        const district = districts.find((x) => x.id === (d.district_id || ''));
        if (district) {
          return { lng: parseFloat(district.long), lat: parseFloat(district.lat), zoom: 10 };
        }
      }
      if ('lat' in d && 'long' in d && d.lat && d.long) {
        return {
          lng: parseFloat(d.long as string),
          lat: parseFloat(d.lat as string),
          zoom: searchHit.type === 'division' ? 8 : 10,
        };
      }
    }
    if (!selection) return null;
    if (selection.type === 'upazila') {
      const district = districts.find((x) => x.id === (selection.data as Upazila).district_id);
      if (district) {
        return { lng: parseFloat(district.long), lat: parseFloat(district.lat), zoom: 10 };
      }
      return null;
    }
    const data = selection.data as Division | District;
    return {
      lng: parseFloat(data.long),
      lat: parseFloat(data.lat),
      zoom: selection.type === 'division' ? 8 : 10,
    };
  }, [selection, searchHit]);

  const onUpazilaClick = (props: { upazila_id?: string; district_id?: string; division_id?: string }) => {
    if (!props.upazila_id) return;
    setDivisionId(props.division_id ?? '');
    setDistrictId(props.district_id ?? '');
    setUpazilaId(props.upazila_id);
    setSearchHit(null);
  };

  const onSearchSelect = (hit: SearchHit) => {
    setSearchHit(hit);
    if (hit.type === 'division') {
      setDivisionId((hit.data as Division).id);
      setDistrictId('');
      setUpazilaId('');
    } else if (hit.type === 'district') {
      const d = hit.data as District;
      setDivisionId(d.division_id);
      setDistrictId(d.id);
      setUpazilaId('');
    } else if (hit.type === 'upazila') {
      const u = hit.data as Upazila;
      const dist = districts.find((x) => x.id === u.district_id);
      setDivisionId(dist?.division_id ?? '');
      setDistrictId(u.district_id);
      setUpazilaId(u.id);
    }
  };

  const cardData = searchHit ?? selection;
  const cardJson = cardData?.data ?? null;
  const cardAccent = cardData ? ACCENT_BY_TYPE[cardData.type] : 'mint';
  const cardBadge = cardData ? T[cardData.type][lang] : '';
  const cardTitle = cardData
    ? cardData.type === 'postcode'
      ? `${(cardData.data as { postOffice: string }).postOffice} · ${(cardData.data as { postCode: string }).postCode}`
      : nameOf(cardData.data as { name?: string; bn_name?: string }, lang)
    : '';
  const cardSubtitle =
    cardData && cardData.type !== 'postcode'
      ? lang === 'en'
        ? (cardData.data as { bn_name: string }).bn_name
        : (cardData.data as { name: string }).name
      : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Header active="demo" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl tracking-crunch text-ink sm:text-3xl">
              {lang === 'en' ? 'play with the data' : 'ডেটা নিয়ে খেলুন'}
            </h1>
            <p className="mt-1 text-sm text-sub">
              {lang === 'en'
                ? 'type a place, pick from the dropdowns, or click anywhere on the map.'
                : 'যেকোনো জায়গা লিখুন, ড্রপডাউন থেকে বাছুন, বা ম্যাপে ক্লিক করুন।'}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <SearchBar onSelect={onSearchSelect} />
            <Cascade
              divisionId={divisionId}
              districtId={districtId}
              upazilaId={upazilaId}
              onChange={({ divisionId: d, districtId: dt, upazilaId: u }) => {
                setDivisionId(d);
                setDistrictId(dt);
                setUpazilaId(u);
                setSearchHit(null);
              }}
            />
            {cardJson ? (
              <LocationCard
                title={cardTitle}
                subtitle={cardSubtitle}
                badge={cardBadge}
                accent={cardAccent}
                json={cardJson}
              />
            ) : (
              <div className="flex items-start gap-3 rounded-3xl border border-dashed border-line bg-white/50 p-6 text-sm text-sub">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mute" />
                {T.empty[lang]}
              </div>
            )}
          </div>
          <div className="relative h-[520px] overflow-hidden rounded-3xl border border-line bg-white shadow-card lg:col-span-3 lg:h-auto lg:min-h-[640px]">
            <Map flyTo={flyTo} selectedUpazilaId={upazilaId} onUpazilaClick={onUpazilaClick} />
          </div>
        </div>
      </main>
      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-6 py-6 text-[11px] text-sub sm:flex-row sm:items-center">
          <p>
            {lang === 'en' ? 'made by ' : 'বানিয়েছেন '}
            <a
              href="https://x.com/alaminislam3203"
              target="_blank"
              rel="noreferrer"
              className="text-ink underline decoration-mint-200 underline-offset-2 hover:decoration-mint-700"
            >
              {lang === 'en' ? 'Alamin Islam' : 'আলামিন ইসলাম'}
            </a>{' '}
            ·{' '}
            <a
              href="https://x.com/alaminislam3203"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              @alaminislam3203
            </a>
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-mint-500" />
            {T.footerRight[lang]}
          </p>
        </div>
      </footer>
    </div>
  );
}
