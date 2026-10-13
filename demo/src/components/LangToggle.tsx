import { useLang } from '../lang';

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="relative inline-flex rounded-full border border-line bg-white p-0.5 text-[11px] shadow-card transition hover:-rotate-1">
      <span
        aria-hidden
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-mint-100 transition-transform duration-200 ${
          lang === 'bn' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`relative z-10 rounded-full px-3 py-1 transition ${
          lang === 'en' ? 'text-mint-700' : 'text-mute hover:text-ink'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('bn')}
        className={`relative z-10 rounded-full px-3 py-1 transition ${
          lang === 'bn' ? 'text-mint-700' : 'text-mute hover:text-ink'
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
