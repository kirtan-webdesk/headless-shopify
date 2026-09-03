// One-time setup script: creates the "Site page" Metaobject definition via
// the Admin API. Reused across About/How it Works/Chemistry/Car Brite parent
// so each is structured content (like homepage_content), not a raw Shopify
// Page richtext blob. Contact Us is handled separately (bespoke form page).
// Reads credentials from .env at runtime only -- values are never printed.
// Run with: node scripts/create-site-page-metaobject.mjs

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

if (!domain || !token) {
  console.error('Missing PUBLIC_STORE_DOMAIN or ADMIN_API_TOKEN in .env (names checked, not values).');
  process.exit(1);
}

const API_VERSION = '2026-07';
const endpoint = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;

const MUTATION = `#graphql
  mutation CreateSitePageMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition {
        id
        name
        type
        fieldDefinitions {
          name
          key
          type {
            name
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const definition = {
  name: 'Site page',
  type: 'site_page',
  fieldDefinitions: [
    {name: 'Page title', key: 'title', type: 'single_line_text_field'},
    {name: 'Eyebrow', key: 'eyebrow', type: 'single_line_text_field'},
    {name: 'Heading', key: 'heading', type: 'single_line_text_field'},
    {name: 'Heading highlight', key: 'heading_highlight', type: 'single_line_text_field'},
    {name: 'Subtext', key: 'subtext', type: 'multi_line_text_field'},
    {name: 'Body paragraphs', key: 'body', type: 'multi_line_text_field'},
    {name: 'CTA label', key: 'cta_label', type: 'single_line_text_field'},
    {name: 'CTA link', key: 'cta_link', type: 'single_line_text_field'},
  ],
};

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  },
  body: JSON.stringify({query: MUTATION, variables: {definition}}),
});

const json = await res.json();

if (json.errors) {
  console.error('GraphQL top-level errors:', JSON.stringify(json.errors, null, 2));
  process.exit(1);
}

const {metaobjectDefinition, userErrors} = json.data.metaobjectDefinitionCreate;

if (userErrors?.length) {
  console.error('userErrors:', JSON.stringify(userErrors, null, 2));
  process.exit(1);
}

console.log('Metaobject definition created:');
console.log('  id:', metaobjectDefinition.id);
console.log('  type:', metaobjectDefinition.type);
console.log('  fields:', metaobjectDefinition.fieldDefinitions.map((f) => f.key).join(', '));
