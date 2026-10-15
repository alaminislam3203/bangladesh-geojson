import LangToggle from './LangToggle';

interface Props {
  active: 'home' | 'demo' | 'docs';
}

const HOME_HREF = '/';
const DEMO_HREF = '/demo/';
const DOCS_HREF = '/docs/';

export default function Header({ active }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href={HOME_HREF} className="flex items-center gap-2.5" aria-label="bangladesh-geojson home">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-mint-100" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </span>
          <span className="text-sm tracking-tightish text-ink">
            geojson<span className="text-mint-700">.bd</span>
          </span>
        </a>
        <nav className="flex items-center gap-1 text-[12px]" aria-label="Primary">
          <NavLink href={DEMO_HREF} label="demo" active={active === 'demo'} />
          <NavLink href={DOCS_HREF} label="docs" active={active === 'docs'} />
          <a
            href="https://github.com/alaminislam3203/bangladesh-geojson"
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3 py-1.5 text-mute transition hover:text-ink"
          >
            github
          </a>
          {(active === 'demo' || active === 'home') && (
            <span className="ml-2">
              <LangToggle />
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`rounded-full px-3 py-1.5 transition ${active ? 'bg-soft text-ink' : 'text-mute hover:text-ink'
        }`}
    >
      {label}
    </a>
  );
}
