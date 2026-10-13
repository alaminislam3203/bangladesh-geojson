import { useState } from 'react';
import { T, useLang } from '../lang';

interface Props {
  title: string;
  subtitle?: string;
  badge: string;
  accent: 'mint' | 'peach' | 'rose';
  json: unknown;
}

const ACCENT_BG: Record<Props['accent'], string> = {
  mint: 'bg-mint-50 text-mint-700 ring-mint-100',
  peach: 'bg-peach-50 text-peach-700 ring-peach-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
};

export default function LocationCard({ title, subtitle, badge, accent, json }: Props) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(json, null, 2);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="animate-fadein rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] ring-1 ring-inset ${ACCENT_BG[accent]}`}
          >
            {badge}
          </span>
          <h2 className="mt-2.5 truncate text-xl tracking-tightish text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-sub">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink transition hover:-rotate-2 hover:scale-105 hover:border-mint-500 hover:text-mint-700"
        >
          {copied ? T.copied[lang] : T.copy[lang]}
        </button>
      </div>
      <pre className="mt-4 overflow-auto rounded-2xl bg-soft p-4 font-mono text-[11px] leading-relaxed text-ink">
        {text}
      </pre>
    </div>
  );
}
