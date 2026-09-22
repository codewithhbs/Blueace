// Runs automatically after `vite build` (see package.json "postbuild").
//
// PROBLEM THIS FIXES:
// This site is a client-side-rendered (CSR) React SPA. <MetaTag> (react-helmet-async)
// injects <title>, <meta name="description">, and <link rel="canonical"> only AFTER
// the JS bundle runs in the browser. Any crawler/audit tool that just fetches the raw
// HTML (most SEO scanners, some social-media link previewers, etc.) sees an EMPTY
// <title></title> and no canonical/description at all — which is exactly the
// "canonical/description missing" issue reported on /services and /products.
//
// FIX: after `vite build` produces dist/index.html + hashed JS/CSS assets, this script
// clones that same index.html for every important route and bakes the correct
// <title>, <meta name="description">, and <link rel="canonical"> straight into the
// HTML `<head>` — the app's JS/CSS bundle is untouched, so client-side rendering and
// routing continue to work exactly as before for real visitors.
//
// Vercel serves a matching static file (e.g. dist/services/index.html for a request to
// /services) before it falls back to the SPA rewrite in vercel.json, so crawlers hitting
// /services now get the correct tags immediately, with no code/behavior change for users.

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const SITE = 'https://www.blueaceindia.com';
const API = 'https://www.api.blueaceindia.com/api/v1';

const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.warn('[generate-static-meta] dist/index.html not found, skipping.');
  process.exit(0);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage({ title, description, canonicalPath }) {
  const canonical = `${SITE}${canonicalPath}`;
  let html = template;

  // Replace <title>...</title> (may be empty in the source template)
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);

  // Remove any existing description/canonical this script previously injected
  html = html.replace(/\s*<meta name="description"[^>]*data-static-meta="true"[^>]*>/g, '');
  html = html.replace(/\s*<link rel="canonical"[^>]*data-static-meta="true"[^>]*>/g, '');

  const inject =
    `\n    <meta name="description" content="${esc(description)}" data-static-meta="true" />` +
    `\n    <link rel="canonical" href="${esc(canonical)}" data-static-meta="true" />`;

  html = html.replace('</title>', '</title>' + inject);

  return html;
}

function writePage(routePath, meta) {
  const dir = path.join(DIST_DIR, routePath === '/' ? '.' : routePath);
  fs.mkdirSync(dir, { recursive: true });
  const outFile = path.join(dir, 'index.html');
  fs.writeFileSync(outFile, renderPage({ ...meta, canonicalPath: routePath }));
  console.log('[generate-static-meta] wrote', path.relative(DIST_DIR, outFile));
}

// ---- Static routes: title/description mirror what each page's <MetaTag> already sets ----
const STATIC_ROUTES = [
  { path: '/', title: 'Premium HVAC & Energy Solutions by Blueace India - Eco-Friendly', description: "Explore Blueace India's top-rated HVAC, solar, and EV cold room systems. Sustainable, efficient, and reliable. Get a Quote Today for tailored solutions!" },
  { path: '/about-us', title: 'About Us | Blueace Limited - Trusted HVAC Experts in India', description: 'Learn about Blueace Limited, your trusted HVAC experts in India, delivering professional installation, maintenance, and repair solutions for lasting comfort.' },
  { path: '/services', title: 'HVAC Services | Blueace Limited - Expert HVAC Solutions', description: 'Explore Blueace Limited HVAC services, including installation, maintenance, and repairs. Get reliable, efficient solutions tailored to your comfort needs.' },
  { path: '/products', title: 'HVAC Products | Blueace Limited - Reliable HVAC Systems', description: 'Discover reliable HVAC products from Blueace Limited, built for efficient performance, lasting comfort, and dependable climate control in homes and businesses.' },
  { path: '/career', title: 'Careers | Blueace Limited - Join Our Growing HVAC Team', description: 'Explore career opportunities at Blueace Limited and join our growing HVAC team. Build your skills, contribute to innovative solutions, and grow with us.' },
  { path: '/contact', title: 'Contact Us | Blueace Limited - Get in Touch With Our Team', description: 'Contact Blueace Limited for professional HVAC installation, maintenance, and repair services. Our team is ready to answer your questions and help you today.' },
  { path: '/track-complain', title: 'Track Complaint | Blueace Limited - Check Service Status', description: 'Track your complaint with Blueace Limited and check the latest service status. Get clear updates on your HVAC service request and complaint resolution.' },
  { path: '/blog', title: 'Blog | Blueace Limited - Tips, Guides & Insights', description: 'Read the Blueace Limited HVAC blog for expert tips, helpful guides, maintenance advice, energy-saving ideas, and insights to improve comfort and efficiency.' },
  { path: '/gallery', title: 'Gallery | Blueace Limited - Our Work & Projects', description: 'Explore the Blueace Limited HVAC gallery featuring our installations, projects, team, and completed work showcasing quality, expertise, and professional service.' },
  { path: '/privacy', title: 'Privacy Policy | Blueace Limited - Your Data & Privacy', description: 'Read the Blueace Limited Privacy Policy to understand how we collect, use, protect, and manage your personal information when you use our website and services.' },
  { path: '/term-and-conditions', title: 'Terms & Conditions | Blueace Limited', description: 'Read the Blueace Limited Terms & Conditions to understand the rules, responsibilities, service terms, and guidelines that apply when using our website and services.' },
  { path: '/hvac', title: 'HVAC Contractor in Delhi | HVAC Consultant in Delhi', description: 'Blueace is a trusted HVAC contractor in Delhi offering expert installation, repair, and maintenance services for heating, ventilation, and air conditioning systems.' },
  { path: '/voltas-central-ac', title: 'Voltas Central Ac Dealer | Blueace India Limited', description: 'We are the authorised voltas central ac dealer offering premium voltas ac units with expert installation, maintenance, and repair services for efficient cooling solutions' },
  { path: '/air-cooled-chiller', title: 'Air Cooled Chiller Supplier | Air Conditioner Chillers', description: 'Looking for the best air cooled chiller supplier in Delhi contact Blueace India Limited. We provide air conditioner chillers with high quality, operation efficiency, and energy savings.' },
  { path: '/heat-pump-installation', title: 'Heat Pump Installation Services in Delhi | Blueace India', description: 'Blueace India provide the best heat pump installation services in Delhi. Energy-efficient solutions for home & business. For expert installation, maintenance, and repairs. Contact us today!' },
  { path: '/amc-manufacturer', title: 'Hire the best AMC Manufacturer in Delhi - Blueace India', description: 'AMC manufacturer in Delhi offer maintenance and support services for various systems and equipment, as leading AMC service provider in Delhi with solutions tailored to different industries.' },
  { path: '/cold-storage-contractors', title: 'Cold Storage Contractors in Delhi - Blueace India', description: 'Cold storage contractors in Delhi specialize in designing, building, and maintaining temperature-controlled storage solutions for various industries like food, pharmaceuticals, and more.' },
  { path: '/redefining-cold-storage', title: 'Cold Storage Plant | Blueace Ltd group', description: 'Preserve your goods efficiently with our advanced Cold Storage Plant solutions, ensuring freshness, reliability, and cost-effective performance.' },
  { path: '/trusted-cold-storage-partner', title: 'Cold Storage Facility | Blueace Ltd group', description: 'Secure, best solutions for all your storage needs. Our Cold Storage Facility ensures freshness with advanced temperature control systems.' },
  { path: '/cold-storage-construction-experts', title: 'Cold Storage Construction Company | Blueace Ltd group', description: 'Ensure long-term preservation with expert solutions from a cold storage construction company, providing quality and efficiency for every project.' },
  { path: '/hvac-chiller-dealers-in-delhi', title: 'HVAC Chiller Dealers in Delhi | Blueace India', description: 'Looking for HVAC chiller dealers and suppliers in Delhi? Blueace India offers reliable chiller plants and dealership support across Delhi NCR.' },
  { path: '/hvac-chiller-manufacturers-in-delhi', title: 'HVAC Chiller Manufacturers in Delhi | Blueace India', description: 'Blueace India is a trusted HVAC chiller manufacturer in Delhi, building industrial and commercial chiller plants engineered for efficiency and durability.' },
  { path: '/maintenance-ahu-fcu', title: 'AHU & FCU Maintenance Services | Blueace Limited', description: 'Professional maintenance of AHU (Air Handling Unit) and FCU (Fan Coil Unit) by Blueace Limited. Reliable HVAC upkeep for lasting performance and comfort.' },
  { path: '/service/cassette-air-conditioning-system', title: 'Cassette Ac Installation Service in Delhi | Blueace India', description: 'Get professional cassette AC installation services in Delhi. Efficient, discreet cooling solutions for commercial and residential spaces with expert setup and maintenance.' },
  { path: '/service/ductable-air-conditioner', title: 'Ductable ac repair Services in Delhi', description: 'Ductable air conditioner supplier and repair services in Delhi from Blueace India.' },
];

for (const route of STATIC_ROUTES) {
  writePage(route.path, route);
}

// ---- Dynamic routes: fetched live from the API at build time ----
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { timeout: 15000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject)
      .on('timeout', function () {
        this.destroy(new Error('timeout'));
      });
  });
}

async function prerenderDynamic() {
  // Products -> /product/:title (title is the product name, slug-cased by the app)
  try {
    const res = await fetchJson(`${API}/get-all-products`);
    const products = res?.data || [];
    for (const p of products) {
      if (!p?.title) continue;
      const slug = p.title.trim().replace(/\s+/g, '-');
      writePage(`/product/${slug}`, {
        title: `${p.title} | Blueace Limited`,
        description: p.smalldesc || `Explore ${p.title} by Blueace Limited — reliable HVAC products built for efficient performance and dependable climate control.`,
      });
    }
  } catch (e) {
    console.warn('[generate-static-meta] product prerender skipped:', e.message);
  }

  // Services -> /service/:title
  try {
    const res = await fetchJson(`${API}/get-all-service-category`);
    const services = res?.data || [];
    for (const s of services) {
      if (!s?.name) continue;
      const slug = s.name.trim().replace(/\s+/g, '-').toLowerCase();
      writePage(`/service/${slug}`, {
        title: s.metaTitle || `${s.name} | Blueace Limited`,
        description: s.metaDescription || `Explore ${s.name} services from Blueace Limited — professional HVAC installation, maintenance, and repair solutions.`,
      });
    }
  } catch (e) {
    console.warn('[generate-static-meta] service prerender skipped:', e.message);
  }

  // Sub-categories -> /sub-category/:name
  try {
    const res = await fetchJson(`${API}/get-all-service-main-category`);
    const subs = res?.data || [];
    for (const s of subs) {
      if (!s?.name) continue;
      const slug = s.name.trim().replace(/\s+/g, '-').toLowerCase();
      writePage(`/sub-category/${slug}`, {
        title: `${s.name} | Blueace Limited - HVAC Services`,
        description: `Explore ${s.name} services from Blueace Limited. Professional HVAC installation, maintenance, and repair solutions tailored to your needs.`,
      });
    }
  } catch (e) {
    console.warn('[generate-static-meta] sub-category prerender skipped:', e.message);
  }

  // Blogs -> /blog/:slug
  try {
    const res = await fetchJson(`${API}/get-all-blogs?page=1&limit=1000`);
    const blogs = res?.data || [];
    for (const b of blogs) {
      if (!b?.slug) continue;
      writePage(`/blog/${b.slug}`, {
        title: b.metaTitle || `${b.title} | Blueace Limited Blog`,
        description: b.metaDescription || 'Read the latest HVAC tips, guides, and insights from Blueace Limited.',
      });
    }
  } catch (e) {
    console.warn('[generate-static-meta] blog prerender skipped:', e.message);
  }
}

await prerenderDynamic();
console.log('[generate-static-meta] done.');
