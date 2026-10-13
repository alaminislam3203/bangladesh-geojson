import Header from '../components/Header';
import { divisions, districts, upazilas, postcodes } from '../data';
import { T, useLang } from '../lang';

export default function Landing() {
  const { lang } = useLang();

  return (
    <div className="flex min-h-screen flex-col">
      <Header active="home" />

      <main id="main">
        <section className="relative" aria-labelledby="hero-title">
          <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-20">
            <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-sub shadow-card transition hover:rotate-1">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
              {T.tagline[lang]}
            </span>
            <h1 id="hero-title" className="mt-5 max-w-3xl text-5xl leading-[1.05] tracking-crunch text-ink sm:text-7xl">
              {lang === 'en' ? (
                <>
                  every place in{' '}
                  <span className="relative inline-block font-serif italic tracking-normal text-ink">
                    bangladesh
                    <Squiggle />
                  </span>
                  .
                </>
              ) : (
                <>
                  <span className="relative inline-block font-serif italic tracking-normal text-ink">
                    বাংলাদেশের
                    <Squiggle />
                  </span>{' '}
                  প্রতিটা জায়গা।
                </>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-sub">
              {lang === 'en'
                ? '8 divisions, 64 districts, 494 upazilas, 1,349 postcodes. free, in one npm install.'
                : '৮ বিভাগ, ৬৪ জেলা, ৪৯৪ উপজেলা, ১,৩৪৯ পোস্টকোড — ফ্রি, এক npm install-এ।'}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="/demo/"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm lowercase text-white transition hover:bg-mint-700"
              >
                {lang === 'en' ? 'try the demo' : 'ডেমো দেখুন'}
                <span className="transition group-hover:translate-x-0.5">→</span>
              </a>
              <a
                href="/docs/"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm lowercase text-ink shadow-card transition hover:border-ink"
              >
                {lang === 'en' ? 'read the docs' : 'ডকুমেন্টেশন পড়ুন'}
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              <Stat n={divisions.length} label={T.divisions[lang]} dot="bg-mint-500" />
              <Stat n={districts.length} label={T.districts[lang]} dot="bg-peach-500" />
              <Stat n={upazilas.length} label={T.upazilas[lang]} dot="bg-rose-500" />
              <Stat n={postcodes.length} label={T.postcodes[lang]} dot="bg-ink" />
            </div>
          </div>
        </section>

        {/* Quick start */}
        <section className="border-t border-line/70 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                {lang === 'en' ? 'install' : 'ইনস্টল'}
              </p>
              <h2 className="mt-2 text-2xl tracking-crunch text-ink sm:text-3xl">
                {lang === 'en' ? 'one line, you’re done.' : 'এক লাইনেই হয়ে গেল।'}
              </h2>
              <p className="mt-3 max-w-md text-sm text-sub">
                {lang === 'en'
                  ? 'works with javascript or typescript. the data lives inside the package — no internet needed once you’ve installed it.'
                  : 'JavaScript বা TypeScript — দুটোতেই কাজ করে। ডেটা প্যাকেজের ভেতরেই থাকে, ইনস্টলের পর নেট লাগে না।'}
              </p>
            </div>
            <div className="space-y-3">
              <CodeBlock code={`npm install bangladesh-geojson`} lang="bash" />
              <CodeBlock
                code={`import bd from 'bangladesh-geojson';

bd.getDivisions();              // all 8 divisions
bd.getDistrictsByDivision('3'); // districts in dhaka
bd.search('সিলেট');             // works in english or bangla`}
              />
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="border-t border-line/70">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl tracking-crunch text-ink sm:text-3xl">
                {lang === 'en' ? 'stuff you can ship today' : 'আজকেই বানাতে পারবেন'}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <UseCase
                accent="mint"
                title={lang === 'en' ? 'address dropdowns' : 'অ্যাড্রেস ড্রপডাউন'}
                blurb={
                  lang === 'en'
                    ? 'pick a division → district → upazila when someone places an order.'
                    : 'অর্ডার দেওয়ার সময় বিভাগ → জেলা → উপজেলা বাছাই।'
                }
                code={`bd.getDivisions()
bd.getDistrictsByDivision(id)
bd.getUpazilasByDistrict(id)`}
              />
              <UseCase
                accent="peach"
                title={lang === 'en' ? 'postcode lookup' : 'পোস্টকোড লুকআপ'}
                blurb={
                  lang === 'en'
                    ? 'find the right postcode for any district. or check that one is real.'
                    : 'জেলা ধরে পোস্টকোড বের করুন। বা চেক করুন কোডটা আসল কিনা।'
                }
                code={`bd.getPostcodesByDistrict('1')
// → [{ postOffice, postCode, ... }]`}
              />
              <UseCase
                accent="rose"
                title={lang === 'en' ? 'show it on a map' : 'ম্যাপে দেখান'}
                blurb={
                  lang === 'en'
                    ? 'draw upazila shapes on a map. works with maplibre, mapbox, anything.'
                    : 'ম্যাপে উপজেলার আকৃতি আঁকুন। MapLibre, Mapbox — যেকোনোটায়।'
                }
                code={`import boundary from 'bangladesh-geojson/boundary';
map.addSource('bd', { type: 'geojson', data: boundary });`}
              />
              <UseCase
                accent="mint"
                title={lang === 'en' ? 'search in english or bangla' : 'ইংরেজি বা বাংলায় সার্চ'}
                blurb={
                  lang === 'en'
                    ? 'type the name in english or বাংলা — both work.'
                    : 'ইংরেজি বা বাংলা — যেভাবে খুশি লিখুন।'
                }
                code={`bd.search('cox')     // → cox's bazar
bd.search('সিলেট')   // → sylhet`}
              />
              <UseCase
                accent="peach"
                title={lang === 'en' ? 'bazars & highways' : 'বাজার ও হাইওয়ে'}
                blurb={
                  lang === 'en'
                    ? 'about 3,500 bazars and every major highway, pulled from openstreetmap.'
                    : 'প্রায় ৩,৫০০ বাজার ও সব মেজর হাইওয়ে, OpenStreetMap থেকে।'
                }
                code={`import bazars from 'bangladesh-geojson/bazars';
import routes from 'bangladesh-geojson/routes';`}
              />
              <UseCase
                accent="rose"
                title={lang === 'en' ? 'all places, nested' : 'সব জায়গা, একসাথে'}
                blurb={
                  lang === 'en'
                    ? 'the whole tree — every division, with its districts and upazilas inside.'
                    : 'পুরো ট্রি — প্রতিটা বিভাগ, তার ভেতরে জেলা ও উপজেলা।'
                }
                code={`bd.getFullHierarchy()
// → nested tree`}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-line/70 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl tracking-crunch text-ink sm:text-2xl">
                {lang === 'en' ? 'go build something.' : 'কিছু একটা বানিয়ে ফেলুন।'}
              </h2>
              <p className="mt-1 text-sm text-sub">
                {lang === 'en' ? (
                  <>
                    one npm install. say hi on{' '}
                    <a
                      href="https://x.com/alaminislam3203"
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink underline decoration-mint-200 underline-offset-2 hover:decoration-mint-700"
                    >
                      x
                    </a>{' '}
                    when you ship.
                  </>
                ) : (
                  <>
                    এক npm install। বানিয়ে ফেললে{' '}
                    <a
                      href="https://x.com/alaminislam3203"
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink underline decoration-mint-200 underline-offset-2 hover:decoration-mint-700"
                    >
                      X-এ
                    </a>{' '}
                    জানাবেন।
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/demo/"
                className="rounded-full bg-ink px-5 py-2.5 text-sm lowercase text-white transition hover:bg-mint-700"
              >
                {lang === 'en' ? 'try the demo' : 'ডেমো দেখুন'}
              </a>
              <a
                href="https://github.com/alaminislam3203/bangladesh-geojson"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-line bg-white px-5 py-2.5 text-sm lowercase text-ink shadow-card transition hover:border-ink"
              >
                github →
              </a>
            </div>
          </div>
        </section>
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
            </a>
            {lang === 'en' ? ' · ' : ' · '}
            <a
              href="https://x.com/alaminislam3203"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              @alaminislam3203
            </a>
            {lang === 'en' ? ' · ping me when you build something' : ' · কিছু বানালে জানাবেন'}
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

function Squiggle() {
  return (
    <svg
      viewBox="0 0 220 12"
      className="absolute -bottom-1 left-0 h-2 w-full text-mint-500"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2 8 Q 40 1, 80 6 T 160 5 T 218 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Stat({ n, label, dot }: { n: number; label: string; dot: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`h-1 w-1 rounded-full ${dot}`} />
        <span className="text-xs text-mute">{label}</span>
      </div>
      <div className="font-mono text-3xl tabular-nums tracking-crunch text-ink sm:text-4xl">
        {n.toLocaleString()}
      </div>
    </div>
  );
}

const ACCENT_DOT: Record<'mint' | 'peach' | 'rose', string> = {
  mint: 'bg-mint-500',
  peach: 'bg-peach-500',
  rose: 'bg-rose-500',
};

function UseCase({
  accent,
  title,
  blurb,
  code,
}: {
  accent: 'mint' | 'peach' | 'rose';
  title: string;
  blurb: string;
  code: string;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${ACCENT_DOT[accent]}`} aria-hidden="true" />
        <h3 className="text-sm tracking-tightish text-ink">{title}</h3>
      </div>
      <p className="text-xs text-sub">{blurb}</p>
      <pre className="mt-auto overflow-auto rounded-xl bg-soft p-3 font-mono text-[11px] leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </article>
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: 'bash' }) {
  return (
    <div className="overflow-auto rounded-2xl border border-line bg-soft p-4">
      {lang === 'bash' && (
        <span className="mr-2 select-none font-mono text-[11px] text-mute">$</span>
      )}
      <pre className="inline font-mono text-[12px] leading-relaxed text-ink">{code}</pre>
    </div>
  );
}
