// Careers and Press have no real content to source from (no actual job
// openings or press mentions exist anywhere in this project) -- rather than
// invent fake listings or press quotes, these entries are deliberately
// neutral: they state nothing false, just redirect to Contact Us.
// Run with: node scripts/create-site-page-entries-placeholder.mjs

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
      metaobject { id handle fields { key value } }
      userErrors { field message code }
    }
  }
`;

const pages = [
  {
    handle: 'careers',
    fields: {
      title: 'Careers',
      eyebrow: 'Join the team',
      heading: 'Interested in',
      heading_highlight: 'working with us?',
      subtext: 'We don’t have open roles listed here yet. Reach out and tell us what you’re looking for.',
      body: '',
      cta_label: 'Contact us',
      cta_link: '/pages/contact',
    },
  },
  {
    handle: 'press',
    fields: {
      title: 'Press',
      eyebrow: 'Media inquiries',
      heading: 'Writing about',
      heading_highlight: 'PEARLS or Car Brite?',
      subtext: 'For interviews, assets, or press inquiries, get in touch directly.',
      body: '',
      cta_label: 'Contact us',
      cta_link: '/pages/contact',
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
  console.log(`[${page.handle}] created: ${created.id}`);
}
