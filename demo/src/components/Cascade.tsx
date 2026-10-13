import { useMemo } from 'react';
import { divisions, districts, upazilas } from '../data';
import { T, nameOf, useLang } from '../lang';

interface Props {
  divisionId: string;
  districtId: string;
  upazilaId: string;
  onChange: (next: { divisionId: string; districtId: string; upazilaId: string }) => void;
}

export default function Cascade({ divisionId, districtId, upazilaId, onChange }: Props) {
  const { lang } = useLang();

  const filteredDistricts = useMemo(
    () => (divisionId ? districts.filter((d) => d.division_id === divisionId) : []),
    [divisionId]
  );
  const filteredUpazilas = useMemo(
    () => (districtId ? upazilas.filter((u) => u.district_id === districtId) : []),
    [districtId]
  );

  return (
    <div className="grid gap-2.5 sm:grid-cols-3">
      <Select
        accent="mint"
        label={T.division[lang]}
        value={divisionId}
        onChange={(v) => onChange({ divisionId: v, districtId: '', upazilaId: '' })}
        options={divisions.map((d) => ({ value: d.id, label: nameOf(d, lang) }))}
        placeholder={T.allDivisions[lang]}
      />
      <Select
        accent="peach"
        label={T.district[lang]}
        value={districtId}
        disabled={!divisionId}
        onChange={(v) => onChange({ divisionId, districtId: v, upazilaId: '' })}
        options={filteredDistricts.map((d) => ({ value: d.id, label: nameOf(d, lang) }))}
        placeholder={divisionId ? T.allDistricts[lang] : '—'}
      />
      <Select
        accent="rose"
        label={T.upazila[lang]}
        value={upazilaId}
        disabled={!districtId}
        onChange={(v) => onChange({ divisionId, districtId, upazilaId: v })}
        options={filteredUpazilas.map((u) => ({ value: u.id, label: nameOf(u, lang) }))}
        placeholder={districtId ? T.allUpazilas[lang] : '—'}
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  accent: 'mint' | 'peach' | 'rose';
}

const ACCENT_DOT: Record<SelectProps['accent'], string> = {
  mint: 'bg-mint-500',
  peach: 'bg-peach-500',
  rose: 'bg-rose-500',
};

function Select({ label, value, onChange, options, placeholder, disabled, accent }: SelectProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-mute">
        <span className={`h-1 w-1 rounded-full ${ACCENT_DOT[accent]}`} />
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border border-line bg-white px-4 py-2.5 pr-9 text-sm shadow-card focus:border-mint-500 focus:outline-none disabled:bg-soft disabled:text-mute"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </label>
  );
}
