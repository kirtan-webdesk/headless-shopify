// One-time setup script: creates the "Homepage content" Metaobject definition
// via the Admin API, per SOW Module 2 "Meta Object Configuration".
// Reads credentials from .env at runtime only -- values are never printed.
// Run with: node scripts/create-homepage-metaobject.mjs

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
  mutation CreateHomepageMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
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
  name: 'Homepage content',
  type: 'homepage_content',
  fieldDefinitions: [
    {name: 'Announcement message 1', key: 'announcement_message_1', type: 'single_line_text_field'},
    {name: 'Announcement message 2', key: 'announcement_message_2', type: 'single_line_text_field'},
    {name: 'Announcement message 3', key: 'announcement_message_3', type: 'single_line_text_field'},
    {name: 'Hero eyebrow', key: 'hero_eyebrow', type: 'single_line_text_field'},
    {name: 'Hero heading', key: 'hero_heading', type: 'single_line_text_field'},
    {name: 'Hero heading highlight', key: 'hero_heading_highlight', type: 'single_line_text_field'},
    {name: 'Hero subtext', key: 'hero_subtext', type: 'multi_line_text_field'},
    {name: 'Hero image', key: 'hero_image', type: 'file_reference'},
    {name: 'Primary CTA label', key: 'primary_cta_label', type: 'single_line_text_field'},
    {name: 'Primary CTA link', key: 'primary_cta_link', type: 'single_line_text_field'},
    {name: 'Secondary CTA label', key: 'secondary_cta_label', type: 'single_line_text_field'},
    {name: 'Secondary CTA link', key: 'secondary_cta_link', type: 'single_line_text_field'},
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
