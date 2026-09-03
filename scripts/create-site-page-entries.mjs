// Creates site_page Metaobject entries for About Us, How it Works, Chemistry
// deep-dive, and the Car Brite parent page. Content is deliberately NOT new
// copy -- every fact/sentence here is reused verbatim or lightly adapted from
// already-approved content elsewhere in this build (homepage BrandSection /
// PodSystem / SystemRoutine, collection page AboutCollection, footer). No new
// claims are introduced. Careers and Press are handled separately since no
// real job openings or press mentions exist to source content from.
// Run with: node scripts/create-site-page-entries.mjs

import {readFileSync} from 'node:fs';

function loadEnv() {
  const text = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const env = {};
  for (const line of text.split(/\r\n|\n|\r/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

const env = loadEnv();
const domain = env.PUBLIC_STORE_DOMAIN;
const token = env.ADMIN_API_TOKEN;
const API_VERSION = '2026-07';
const endpoint = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

const MUTATION = `#graphql
  mutation CreateSitePageEntry($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject {
        id
        handle
        fields { key value }
      }
      userErrors { field message code }
    }
  }
`;

const pages = [
  {
    handle: 'about',
    fields: {
      title: 'About PEARLS',
      eyebrow: 'Powered by Car Brite',
      heading: 'Pro-grade chemistry,',
      heading_highlight: 'garage-ready format.',
      subtext:
        'PEARLS is built in the same Indiana facility Car Brite has run since 1947 — the lab dealerships, body shops, and marinas have trusted for three generations. We just packed it into a pod.',
      body: [
        'PEARLS is a five-pod detailing system. Each pod is a single-dose concentrate — pre-measured to the exact ratio the job needs, so there’s no guessing at dilution.',
        'Founded 1947 — Indianapolis lab, three generations of detailing chemists.',
        'Pro-detailer trusted — the same chemistry shipped to dealerships, body shops, and marinas.',
        'Lab-tested — every pod batch tested for pH, viscosity, and surfactant load.',
        'Made in USA — formulated and bottled in Indiana, never re-labeled.',
      ].join('\n'),
      cta_label: 'Shop the routine',
      cta_link: '/collections/all',
    },
  },
  {
    handle: 'how-it-works',
    fields: {
      title: 'How it Works',
      eyebrow: 'The pod system',
      heading: 'Five pods',
      heading_highlight: 'are the routine.',
      subtext:
        'Each pod is a single-dose concentrate built for one surface. Drop one in your reusable bottle, add water, and the pro-grade chemistry goes to work. Run all five and you’ve detailed the whole car, start to shine.',
      body: [
        '7 — Concentrate, not water. Pods ship dry — you add the water at home, not pay to truck it around.',
        '0 — Measuring, ever. Each pod is pre-dosed to the exact ratio. Drop, fill, shake — done.',
        'pH — Balanced & wax-safe. Tuned to protect ceramic coatings and the wax already on your paint.',
        '75yr — Pro-grade chemistry. The same lab formulas Car Brite has shipped to detailers since 1947.',
      ].join('\n'),
      cta_label: 'Shop the routine',
      cta_link: '/collections/all',
    },
  },
  {
    handle: 'chemistry',
    fields: {
      title: 'Chemistry Deep-Dive',
      eyebrow: 'By the numbers',
      heading: '75 years of professional',
      heading_highlight: 'detailing chemistry.',
      subtext:
        'Three generations of chemists, one obsessive standard — now portioned into a single-dose pod.',
      body: [
        '12k+ — Pro detailers using Car Brite.',
        '142k — Bottles in driveways.',
        '0 — Re-labeled formulas.',
        'Everything in the PEARLS system is formulated and packed in the same Indianapolis facility Car Brite has run for 75 years.',
      ].join('\n'),
      cta_label: 'How it works',
      cta_link: '/pages/how-it-works',
    },
  },
  {
    handle: 'car-brite',
    fields: {
      title: 'Car Brite',
      eyebrow: 'Est. 1947',
      heading: 'The lab behind',
      heading_highlight: 'the pods.',
      subtext:
        'PEARLS is powered by Car Brite — 75 years of professional detailing chemistry, distilled into pods that fit a shelf in your garage.',
      body: [
        'Car Brite Industries, Indianapolis, IN — made in USA.',
        'PEARLS is made in the same Indiana facility Car Brite has run since 1947. Same chemists. Same lab. New format, built for your garage instead of a body shop.',
      ].join('\n'),
      cta_label: 'About PEARLS',
      cta_link: '/pages/about',
    },
  },
];

for (const page of pages) {
  const metaobject = {
    type: 'site_page',
    handle: page.handle,
    fields: Object.entries(page.fields).map(([key, value]) => ({key, value})),
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
    body: JSON.stringify({query: MUTATION, variables: {metaobject}}),
  });
  const json = await res.json();

  if (json.errors) {
    console.error(`[${page.handle}] GraphQL top-level errors:`, JSON.stringify(json.errors, null, 2));
    continue;
  }
  const {metaobject: created, userErrors} = json.data.metaobjectCreate;
  if (userErrors?.length) {
    console.error(`[${page.handle}] userErrors:`, JSON.stringify(userErrors, null, 2));
    continue;
  }
  console.log(`[${page.handle}] created: ${created.id} (${created.fields.length} fields)`);
}
