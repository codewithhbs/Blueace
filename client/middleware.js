// Vercel Routing Middleware — runs at the edge, before vercel.json's rewrites.
//
// WHY THIS EXISTS: this is a client-side-rendered SPA. Every unknown URL (a typo,
// an old/removed link, a bot probing random paths like /english) gets rewritten to
// index.html by vercel.json and served with HTTP 200 — React Router's existing
// "*" route (src/App.jsx) does show the Error.jsx 404 UI to a real visitor, but
// any crawler or SEO tool checking the raw HTTP status still sees 200, not 404.
// That's exactly the "isse 404 status aaye" ask.
//
// FIX: check the request path against every route the app actually defines
// (mirrors src/App.jsx's <Route path="..."> list). Known routes continue
// through untouched. Anything else still gets index.html (so the user-facing
// 404 page renders correctly) but with the HTTP status forced to 404 — so
// crawlers now see a real 404.
//
// IMPORTANT: if you add a new <Route path="..."> in src/App.jsx, add its path
// (or prefix, for a route with a :param) to the lists below too, or it will be
// wrongly 404'd here.

import { next } from '@vercel/functions';

// Exact paths with no :param segment.
const EXACT_PATHS = new Set([
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
const PREFIXES = [
  '/sub-category/',
  '/service/', // covers /service/:title as well as the two exact service/* paths above
  '/add-vendor-member/',
  '/membership-plan/',
  '/product/',
  '/blog/', // covers /blog/:slug as well as the exact /blog path above
  '/error-code/',
  '/show-error-code/',
  '/verify-account/',
  '/test-video/',
  '/test-question/',
  '/case-study/',
];

function isKnownRoute(pathname) {
  if (EXACT_PATHS.has(pathname)) return true;
  return PREFIXES.some((p) => pathname.startsWith(p));
}

export const config = {
  // Skip static assets, the SPA's own JS/CSS bundle, and files that already have
  // an extension (images, fonts, sitemap.xml, robots.txt, etc.) — those are real
  // files on disk and must never be 404'd by this route allowlist.
  matcher: ['/((?!assets/|favicon|sitemap\\.xml|robots\\.txt).*)'],
};

export default function middleware(request) {
  const { pathname } = new URL(request.url);

  // Anything with a file extension (.js, .css, .png, .webp, .xml, .txt, ...) is a
  // real static asset, not an app route — never 404 those here.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return next();
  }

  if (isKnownRoute(pathname)) {
    return next();
  }

  // Unknown route: still serve the SPA shell (so Error.jsx renders for the
  // visitor) but report a real 404 status to crawlers/SEO tools.
  return next({ status: 404 });
}
