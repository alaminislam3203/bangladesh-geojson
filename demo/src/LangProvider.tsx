import { useEffect, useState, type ReactNode } from 'react';
import { LangContext, type Lang } from './lang';

export default function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem('bd-geojson-lang');
    return saved === 'bn' ? 'bn' : 'en';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('bd-geojson-lang', lang);
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}
