// Mirrors every <Route path="..."> in src/App.jsx.
// If you add a new route there, add it (or its :param prefix) here too —
// otherwise both the dev server and the Vercel middleware will wrongly 404 it.

export const EXACT_PATHS = new Set([
  '/',
  '/listing',
  '/vendor-dashboard',
  '/make-esitimated-bill',
  '/see-esitimated-bill',
  '/user-dashboard',
  '/about-us',
  '/career',
  '/contact',
  '/privacy',
  '/sign-up',
  '/corporate-sign-up',
  '/corporate-sign-in',
  '/employ-sign-in',
  '/employ-sign-up',
  '/vendor-sign-in',
  '/sign-in',
  '/doctor-detail',
  '/job-detail',
  '/Make-a-Service-Provider',
  '/vendor-registration',
  '/maintenance-ahu-fcu',
  '/register',
  '/forgot-password',
  '/forgot-vendor-password',
  '/services',
  '/products',
  '/blog',
  '/gallery',
  '/successfully-booking',
  '/successfully-member',
  '/verify-account',
  '/term-and-conditions',
  '/voltas-central-ac',
  '/hvac',
  '/cold-storage-contractors',
  '/amc-manufacturer',
  '/heat-pump-installation',
  '/service/cassette-air-conditioning-system',
  '/service/ductable-air-conditioner',
  '/air-cooled-chiller',
  '/hvac-chiller-dealers-in-delhi',
  '/hvac-chiller-manufacturers-in-delhi',
  '/thanks',
  '/redefining-cold-storage',
  '/trusted-cold-storage-partner',
  '/cold-storage-construction-experts',
  '/track-complain',
  '/not-eligible',
  '/successfull-payment',
  '/failed-payment',
]);

// Prefixes for routes with a :param segment, e.g. "/product/:title".
export const PREFIXES = [
  '/add-vendor-member/',
  '/membership-plan/',
  '/error-code/',
  '/show-error-code/',
  '/verify-account/',
  '/test-video/',
  '/test-question/',
  '/case-study/',
];

export function isKnownRoute(pathname) {
  if (EXACT_PATHS.has(pathname)) return true;
  return PREFIXES.some((p) => pathname.startsWith(p));
}


// ---- Dynamic routes: slug must exist in the API, else 404 ----
const API = 'https://www.api.blueaceindia.com/api/v1';
const slugify = (str = '') => String(str).trim().replace(/\s+/g, '-').toLowerCase();

const DYNAMIC = [
  { prefix: '/service/', url: `${API}/get-all-service-category`, slugs: (d) => d.map((x) => slugify(x?.name)) },
  { prefix: '/sub-category/', url: `${API}/get-all-service-main-category`, slugs: (d) => d.map((x) => slugify(x?.name)) },
  { prefix: '/product/', url: `${API}/get-all-products`, slugs: (d) => d.map((x) => slugify(x?.title)) },
  { prefix: '/blog/', url: `${API}/get-all-blogs?page=1&limit=1000`, slugs: (d) => d.map((x) => String(x?.slug || '').toLowerCase()) },
];

const cache = new Map(); // prefix -> { at, set }
const TTL = 5 * 60 * 1000;

async function getSlugs(cfg) {
  const hit = cache.get(cfg.prefix);
  if (hit && Date.now() - hit.at < TTL) return hit.set;
  const res = await fetch(cfg.url);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  const set = new Set(cfg.slugs(json?.data || []).filter(Boolean));
  cache.set(cfg.prefix, { at: Date.now(), set });
  return set;
}

// Use this in middleware / dev server. Fails OPEN (treated as known) if the API is down,
// so a temporary API error never turns real pages into 404.
export async function isKnownRouteAsync(pathname) {
  if (EXACT_PATHS.has(pathname)) return true;
  if (PREFIXES.some((p) => pathname.startsWith(p))) return true;
  const cfg = DYNAMIC.find((d) => pathname.startsWith(d.prefix));
  if (!cfg) return false;
  const slug = decodeURIComponent(pathname.slice(cfg.prefix.length)).replace(/\/$/, '').toLowerCase();
  if (!slug) return false;
  try {
    return (await getSlugs(cfg)).has(slug);
  } catch {
    return true;
  }
}
