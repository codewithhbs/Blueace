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

export function isKnownRoute(pathname) {
  if (EXACT_PATHS.has(pathname)) return true;
  return PREFIXES.some((p) => pathname.startsWith(p));
}
