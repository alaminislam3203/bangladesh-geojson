import { useEffect, useMemo, useRef, useState } from 'react';
import { search, SearchHit } from '../data';
import { T, nameOf, useLang } from '../lang';

interface Props {
  onSelect: (hit: SearchHit) => void;
}

const TYPE_TINT: Record<SearchHit['type'], string> = {
  division: 'bg-mint-100 text-mint-700',
  district: 'bg-peach-100 text-peach-700',
  upazila: 'bg-rose-100 text-rose-700',
  postcode: 'bg-soft text-sub',
};

export default function SearchBar({ onSelect }: Props) {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => (query ? search(query, 12) : []), [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={T.searchPh[lang]}
          className="w-full rounded-2xl border border-line bg-white py-3.5 pl-11 pr-4 text-sm placeholder:text-mute shadow-card focus:border-mint-500 focus:outline-none"
        />
      </div>
      {open && hits.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-96 w-full animate-fadein overflow-auto rounded-2xl border border-line bg-white py-1.5 shadow-card">
          {hits.map((h, i) => {
            const data = h.data as { name?: string; bn_name?: string; postOffice?: string; postCode?: string };
            const primary =
              h.type === 'postcode'
                ? `${data.postOffice} · ${data.postCode}`
                : nameOf(data, lang);
            const secondary =
              h.type === 'postcode'
                ? ''
                : lang === 'en'
                ? data.bn_name ?? ''
                : data.name ?? '';
            return (
              <li key={`${h.type}-${i}`}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-soft"
                  onClick={() => {
                    onSelect(h);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span className="min-w-0 truncate">
                    <span className="text-ink">{primary}</span>
                    {secondary && <span className="ml-2 text-mute">{secondary}</span>}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] tracking-wide ${TYPE_TINT[h.type]}`}>
                    {T[h.type][lang]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
