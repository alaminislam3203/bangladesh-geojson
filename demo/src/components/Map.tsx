import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MlMap, Popup } from 'maplibre-gl';
import { useLang, type Lang } from '../lang';

const BD_CENTER: [number, number] = [90.3563, 23.685];
const BD_ZOOM = 6.4;
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const GEOJSON_URL = '/bangladesh.geojson';
const BAZARS_URL = '/bd-bazars.geojson';
const ROUTES_URL = '/bd-major-routes.geojson';

interface FeatureProps {
  upazila_id?: string;
  district_id?: string;
  division_id?: string;
  name?: string;
  bn_name?: string;
  district_name?: string;
  district_bn_name?: string;
  source_name?: string;
}

interface Props {
  flyTo?: { lng: number; lat: number; zoom?: number } | null;
  selectedUpazilaId?: string;
  onUpazilaClick?: (props: FeatureProps) => void;
}

function popupHtml(p: FeatureProps, lang: Lang) {
  const primary =
    lang === 'bn' ? p.bn_name || p.name || p.source_name || '' : p.name || p.source_name || '';
  const secondary = lang === 'bn' ? p.name || '' : p.bn_name || '';
  const district = lang === 'bn' ? p.district_bn_name || p.district_name || '' : p.district_name || '';
  const safe = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
    <div style="font-family:Inter,system-ui,sans-serif;font-size:12px;line-height:1.35;padding:2px 4px;">
      <div style="color:#111;letter-spacing:-0.01em;">${safe(primary)}</div>
      ${secondary ? `<div style="color:#8a8a8a;font-size:11px;">${safe(secondary)}</div>` : ''}
      ${district ? `<div style="color:#3f8a5e;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;margin-top:3px;">${safe(district)}</div>` : ''}
    </div>
  `;
}

function bazarPopupHtml(p: { name?: string; bn_name?: string; upazila?: string; district?: string }, lang: Lang) {
  const primary = lang === 'bn' ? p.bn_name || p.name || '' : p.name || '';
  const upa = p.upazila || '';
  const dist = p.district || '';
  const safe = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
    <div style="font-family:Inter,system-ui,sans-serif;font-size:12px;line-height:1.35;padding:2px 4px;">
      <div style="color:#c47640;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;">Bazar</div>
      <div style="color:#111;letter-spacing:-0.01em;margin-top:2px;">${safe(primary)}</div>
      ${upa || dist ? `<div style="color:#8a8a8a;font-size:11px;">${safe([upa, dist].filter(Boolean).join(' · '))}</div>` : ''}
    </div>
  `;
}

export type OverlayKey = 'boundary' | 'bazars' | 'routes';

export interface MapHandle {
  toggle: (key: OverlayKey, on: boolean) => void;
}

export default function Map({ flyTo, selectedUpazilaId, onUpazilaClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const bazarPopupRef = useRef<Popup | null>(null);
  const hoverIdRef = useRef<string | number | null>(null);
  const selectedIdRef = useRef<string | number | null>(null);
  const langRef = useRef<Lang>('en');
  const { lang } = useLang();
  langRef.current = lang;
  const onUpazilaClickRef = useRef(onUpazilaClick);
  onUpazilaClickRef.current = onUpazilaClick;

  const [overlays, setOverlays] = useState<Record<OverlayKey, boolean>>({
    boundary: true,
    bazars: false,
    routes: false,
  });
  const loadedRef = useRef<Record<OverlayKey, boolean>>({
    boundary: false,
    bazars: false,
    routes: false,
  });

  const ensureBazarsLayer = async () => {
    const m = mapRef.current;
    if (!m || loadedRef.current.bazars) return;
    const r = await fetch(BAZARS_URL);
    if (!r.ok) return;
    const geojson = await r.json();
    if (!mapRef.current) return;
    m.addSource('bd-bazars', { type: 'geojson', data: geojson });
    m.addLayer({
      id: 'bd-bazars-circle',
      type: 'circle',
      source: 'bd-bazars',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 1.6, 9, 3, 12, 5],
        'circle-color': '#f4a472',
        'circle-stroke-color': '#c47640',
        'circle-stroke-width': 0.6,
        'circle-opacity': 0.85,
      },
    });
    m.on('mouseenter', 'bd-bazars-circle', () => (m.getCanvas().style.cursor = 'pointer'));
    m.on('mouseleave', 'bd-bazars-circle', () => {
      m.getCanvas().style.cursor = '';
      bazarPopupRef.current?.remove();
    });
    m.on('mousemove', 'bd-bazars-circle', (e) => {
      if (!e.features?.length) return;
      const f = e.features[0];
      if (!bazarPopupRef.current) {
        bazarPopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 8,
        });
      }
      bazarPopupRef.current
        .setLngLat(e.lngLat)
        .setHTML(bazarPopupHtml(f.properties as { name?: string; bn_name?: string }, langRef.current))
        .addTo(m);
    });
    loadedRef.current.bazars = true;
  };

  const ensureRoutesLayer = async () => {
    const m = mapRef.current;
    if (!m || loadedRef.current.routes) return;
    const r = await fetch(ROUTES_URL);
    if (!r.ok) return;
    const geojson = await r.json();
    if (!mapRef.current) return;
    m.addSource('bd-routes', { type: 'geojson', data: geojson });
    m.addLayer(
      {
        id: 'bd-routes-line',
        type: 'line',
        source: 'bd-routes',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': [
            'match',
            ['get', 'highway'],
            'motorway', '#b85852',
            'trunk', '#e98a85',
            '#fbd9d4',
          ],
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            6, 0.6,
            10, 1.6,
            13, 3,
          ],
          'line-opacity': 0.85,
        },
      },
      // Place under the boundary line so polygons stay readable.
      m.getLayer('bd-boundary-line-active') ? 'bd-boundary-line-active' : undefined
    );
    loadedRef.current.routes = true;
  };

  // Apply overlay visibility whenever the toggle state changes.
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;
    (async () => {
      // Bazars
      if (overlays.bazars) {
        await ensureBazarsLayer();
        if (m.getLayer('bd-bazars-circle')) m.setLayoutProperty('bd-bazars-circle', 'visibility', 'visible');
      } else if (m.getLayer('bd-bazars-circle')) {
        m.setLayoutProperty('bd-bazars-circle', 'visibility', 'none');
      }
      // Routes
      if (overlays.routes) {
        await ensureRoutesLayer();
        if (m.getLayer('bd-routes-line')) m.setLayoutProperty('bd-routes-line', 'visibility', 'visible');
      } else if (m.getLayer('bd-routes-line')) {
        m.setLayoutProperty('bd-routes-line', 'visibility', 'none');
      }
      // Boundary
      const visBoundary = overlays.boundary ? 'visible' : 'none';
      for (const id of ['bd-boundary-fill', 'bd-boundary-line', 'bd-boundary-line-active']) {
        if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', visBoundary);
      }
    })();
  }, [overlays]);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: BD_CENTER,
      zoom: BD_ZOOM,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      fetch(GEOJSON_URL)
        .then((r) => (r.ok ? r.json() : null))
        .then((geojson) => {
          if (!geojson || !mapRef.current) return;
          const m = mapRef.current;
          for (let i = 0; i < geojson.features.length; i++) {
            const f = geojson.features[i];
            f.id = f.properties?.upazila_id || `f${i}`;
          }
          m.addSource('bd-boundary', { type: 'geojson', data: geojson });
          m.addLayer({
            id: 'bd-boundary-fill',
            type: 'fill',
            source: 'bd-boundary',
            paint: {
              'fill-color': '#7cc99c',
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                0.32,
                ['boolean', ['feature-state', 'hover'], false],
                0.18,
                0.04,
              ],
            },
          });
          m.addLayer({
            id: 'bd-boundary-line',
            type: 'line',
            source: 'bd-boundary',
            paint: {
              'line-color': '#3f8a5e',
              'line-width': 0.6,
              'line-opacity': 0.45,
            },
          });
          m.addLayer({
            id: 'bd-boundary-line-active',
            type: 'line',
            source: 'bd-boundary',
            filter: [
              'any',
              ['boolean', ['feature-state', 'hover'], false],
              ['boolean', ['feature-state', 'selected'], false],
            ],
            paint: {
              'line-color': '#1f4f37',
              'line-width': 1.6,
              'line-opacity': 0.9,
            },
          });
          loadedRef.current.boundary = true;

          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 8,
            className: 'bd-popup',
          });

          const setHover = (
            id: string | number | null,
            lngLat?: maplibregl.LngLat,
            props?: FeatureProps
          ) => {
            const prev = hoverIdRef.current;
            if (prev !== null && prev !== id) {
              try {
                m.setFeatureState({ source: 'bd-boundary', id: prev }, { hover: false });
              } catch {
                /* feature gone */
              }
            }
            hoverIdRef.current = id;
            if (id !== null) {
              try {
                m.setFeatureState({ source: 'bd-boundary', id }, { hover: true });
              } catch {
                /* feature gone */
              }
            }
            if (id !== null && lngLat && props && popupRef.current) {
              popupRef.current.setLngLat(lngLat).setHTML(popupHtml(props, langRef.current)).addTo(m);
            } else if (popupRef.current) {
              popupRef.current.remove();
            }
          };

          m.on('mousemove', 'bd-boundary-fill', (e) => {
            if (!e.features?.length) return;
            const f = e.features[0];
            const props = f.properties as FeatureProps;
            m.getCanvas().style.cursor = 'pointer';
            setHover(f.id ?? null, e.lngLat, props);
          });
          m.on('mouseleave', 'bd-boundary-fill', () => {
            m.getCanvas().style.cursor = '';
            setHover(null);
          });
          m.on('click', 'bd-boundary-fill', (e) => {
            if (!e.features?.length) return;
            const f = e.features[0];
            const props = f.properties as FeatureProps;
            if (props.upazila_id) {
              onUpazilaClickRef.current?.(props);
            }
          });
        })
        .catch(() => {
          /* boundary overlay optional */
        });
    });

    mapRef.current = map;
    return () => {
      popupRef.current?.remove();
      bazarPopupRef.current?.remove();
      popupRef.current = null;
      bazarPopupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;
    const prev = selectedIdRef.current;
    if (prev !== null && prev !== selectedUpazilaId) {
      try {
        m.setFeatureState({ source: 'bd-boundary', id: prev }, { selected: false });
      } catch {
        /* feature gone */
      }
    }
    if (selectedUpazilaId) {
      try {
        m.setFeatureState({ source: 'bd-boundary', id: selectedUpazilaId }, { selected: true });
      } catch {
        /* feature gone */
      }
    }
    selectedIdRef.current = selectedUpazilaId || null;
  }, [selectedUpazilaId]);

  useEffect(() => {
    if (popupRef.current && popupRef.current.isOpen() && hoverIdRef.current !== null) {
      popupRef.current.remove();
    }
  }, [lang]);

  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: flyTo.zoom ?? 10,
      essential: true,
    });
  }, [flyTo]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <Legend overlays={overlays} setOverlays={setOverlays} />
    </div>
  );
}

function Legend({
  overlays,
  setOverlays,
}: {
  overlays: Record<OverlayKey, boolean>;
  setOverlays: React.Dispatch<React.SetStateAction<Record<OverlayKey, boolean>>>;
}) {
  const { lang } = useLang();
  const labels: Record<OverlayKey, { en: string; bn: string; dot: string }> = {
    boundary: { en: 'Upazilas', bn: 'উপজেলা', dot: 'bg-mint-500' },
    bazars: { en: 'Bazars', bn: 'বাজার', dot: 'bg-peach-500' },
    routes: { en: 'Routes', bn: 'হাইওয়ে', dot: 'bg-rose-500' },
  };
  const order: OverlayKey[] = ['boundary', 'bazars', 'routes'];
  return (
    <div className="pointer-events-auto absolute left-3 top-3 flex flex-col gap-1.5 rounded-2xl border border-line bg-white/90 p-1.5 text-[11px] shadow-card backdrop-blur">
      {order.map((k) => {
        const on = overlays[k];
        return (
          <button
            key={k}
            type="button"
            onClick={() => setOverlays((s) => ({ ...s, [k]: !s[k] }))}
            className={`flex items-center gap-2 rounded-full px-2.5 py-1 transition hover:-rotate-1 hover:scale-[1.04] ${
              on ? 'bg-soft text-ink' : 'text-mute hover:text-ink'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${labels[k].dot} ${on ? '' : 'opacity-30'}`}
            />
            <span>{labels[k][lang]}</span>
          </button>
        );
      })}
    </div>
  );
}
