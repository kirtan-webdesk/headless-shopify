// Contact Us gets a site_page entry for its heading/intro (consistent with
// every other page), but the actual form is a bespoke static component
// (app/routes/pages.$handle.jsx special-cases handle === 'contact') since
// there's no email/CRM backend to submit to yet -- same honest pattern as
// the homepage newsletter form.
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

const metaobject = {
  type: 'site_page',
  handle: 'contact',
  fields: [
    {key: 'title', value: 'Contact Us'},
    {key: 'eyebrow', value: 'Talk to a detailer'},
    {key: 'heading', value: 'Ask us'},
    {key: 'heading_highlight', value: 'anything.'},
    {
      key: 'subtext',
      value: 'Don’t see your answer? We’re a small team of detailers and chemists. We answer every email within a day.',
    },
    {key: 'body', value: ''},
    {key: 'cta_label', value: ''},
    {key: 'cta_link', value: ''},
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
console.log('created:', created.id);
