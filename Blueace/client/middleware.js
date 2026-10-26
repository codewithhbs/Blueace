// Vercel Routing Middleware — runs at the edge, before vercel.json's rewrites.
//
// WHY THIS EXISTS: this is a client-side-rendered SPA. Every unknown URL (a typo,
// an old/removed link, a bot probing random paths like /english) gets rewritten to
// index.html by vercel.json and served with HTTP 200 — React Router's existing
// "*" route (src/App.jsx) does show the Error.jsx 404 UI to a real visitor, but
// any crawler or SEO tool checking the raw HTTP status still sees 200, not 404.
//
// FIX: check the request path against every route the app actually defines
// (route-allowlist.mjs, which mirrors src/App.jsx's <Route path="..."> list).
// Known routes continue through untouched. Anything else still gets index.html
// (so the user-facing 404 page renders correctly) but with the HTTP status
// forced to 404 — so crawlers now see a real 404.
//
// NOTE: this only runs on Vercel (production/preview deployments). It does NOT
// run on `npm run dev` (Vite's local dev server) — that's handled separately by
// the small dev-only plugin in vite.config.js, so `localhost:5173` behaves the
// same way for testing.
//
// IMPORTANT: if you add a new <Route path="..."> in src/App.jsx, add its path
// (or prefix, for a route with a :param) to route-allowlist.mjs too, or it will
// be wrongly 404'd here.

import { next } from '@vercel/functions';
import { isKnownRoute } from './route-allowlist.mjs';

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
