import {readFileSync} from 'node:fs';

function loadEnv() {
  const text = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const env = {};
  for (const line of text.split('\n')) {
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
  mutation CreateHomepageEntry($metaobject: MetaobjectCreateInput!) {
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

// Content matches the approved reference (Design/Design/Homepage Design/PEARLS-Homepage.html),
// per G2 CONFIRM 2026-08-31 -- design frozen as reference.
const metaobject = {
  type: 'homepage_content',
  handle: 'main-homepage',
  fields: [
    {key: 'announcement_message_1', value: 'FREE SHIPPING OVER $60'},
    {key: 'announcement_message_2', value: 'VOLUME 01 — NOW SHIPPING'},
    {key: 'announcement_message_3', value: 'REFILL SUBSCRIPTIONS SHIP FREE'},
    {key: 'hero_eyebrow', value: 'NOW SHIPPING — VOLUME 01'},
    {key: 'hero_heading', value: 'The detail in a'},
    {key: 'hero_heading_highlight', value: 'pearl.'},
    {
      key: 'hero_subtext',
      value:
        'A five-step pod system that turns 75 years of professional car-detailing chemistry into something you keep on a shelf in the garage. Pop. Spray. Shine.',
    },
    {key: 'primary_cta_label', value: 'Shop the routine'},
    {key: 'primary_cta_link', value: '/collections/all'},
    {key: 'secondary_cta_label', value: 'How it works'},
    {key: 'secondary_cta_link', value: '/pages/how-it-works'},
  ],
};

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
  body: JSON.stringify({query: MUTATION, variables: {metaobject}}),
});
const json = await res.json();

if (json.errors) {
  console.error('GraphQL top-level errors:', JSON.stringify(json.errors, null, 2));
  process.exit(1);
}
const {metaobject: created, userErrors} = json.data.metaobjectCreate;
if (userErrors?.length) {
  console.error('userErrors:', JSON.stringify(userErrors, null, 2));
  process.exit(1);
}
console.log('Metaobject entry created:');
console.log('  id:', created.id);
console.log('  handle:', created.handle);
console.log('  field count:', created.fields.length);
