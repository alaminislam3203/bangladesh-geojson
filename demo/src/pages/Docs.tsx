import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import Header from '../components/Header';
import { T, useLang } from '../lang';
import usageMd from '../../../docs/USAGE.md?raw';
import contributingMd from '../../../docs/CONTRIBUTING.md?raw';

interface Section {
  id: string;
  title: string;
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractSections(md: string): Section[] {
  const out: Section[] = [];
  for (const line of md.split('\n')) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) out.push({ id: slug(m[1]), title: m[1] });
  }
  return out;
}

function renderMd(md: string) {
  marked.setOptions({ gfm: true, breaks: false });
  let html = marked.parse(md) as string;
  // Add stable ids to h2/h3 by slugging their text content. Strips inner HTML
  // (e.g., inline code) for the id but keeps it for display.
  html = html.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_m, tag, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    const id = slug(text);
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
  return html;
}

export default function Docs() {
  const { lang } = useLang();
  const [activeId, setActiveId] = useState<string>('');
  const [tab, setTab] = useState<'usage' | 'contributing'>('usage');

  const md = tab === 'usage' ? usageMd : contributingMd;
  const html = useMemo(() => renderMd(md), [md]);
  const sections = useMemo(() => extractSections(md), [md]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const headings = Array.from(document.querySelectorAll('article h2[id]')) as HTMLElement[];
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveId((e.target as HTMLElement).id);
            return;
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    for (const h of headings) observer.observe(h);
    return () => observer.disconnect();
  }, [html]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header active="docs" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl tracking-crunch text-ink sm:text-4xl">
            {lang === 'en' ? 'docs' : 'ডকুমেন্টেশন'}
          </h1>
          <p className="mt-1 text-sm text-sub">
            {lang === 'en'
              ? 'how to install it, use it, and contribute back.'
              : 'কীভাবে ইনস্টল করবেন, ব্যবহার করবেন, ও অবদান রাখবেন।'}
          </p>
        </div>

        <div className="mb-6 inline-flex rounded-full border border-line bg-white p-0.5 text-[12px] shadow-card">
          <button
            type="button"
            onClick={() => setTab('usage')}
            className={`rounded-full px-3 py-1.5 transition ${tab === 'usage' ? 'bg-mint-100 text-mint-700' : 'text-mute hover:text-ink'
              }`}
          >
            {lang === 'en' ? 'usage' : 'ব্যবহার'}
          </button>
          <button
            type="button"
            onClick={() => setTab('contributing')}
            className={`rounded-full px-3 py-1.5 transition ${tab === 'contributing' ? 'bg-mint-100 text-mint-700' : 'text-mute hover:text-ink'
              }`}
          >
            {lang === 'en' ? 'contributing' : 'অবদান'}
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 flex flex-col gap-1 text-[12px]">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                {lang === 'en' ? 'On this page' : 'এই পেজে'}
              </p>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`truncate rounded-md px-2 py-1 transition ${activeId === s.id ? 'bg-soft text-ink' : 'text-sub hover:text-ink'
                    }`}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <article
            className="docs-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
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
              {lang === 'en' ? 'Al-amin' : 'আল-আমিন'}
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
