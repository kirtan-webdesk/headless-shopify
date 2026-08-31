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

async function gql(query, variables) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
    body: JSON.stringify({query, variables}),
  });
  return res.json();
}

// 1. Check current access
const checkResult = await gql(`#graphql
  query {
    metaobjectDefinitionByType(type: "homepage_content") {
      id
      access { storefront }
    }
  }
`);
console.log('Current access:', JSON.stringify(checkResult.data?.metaobjectDefinitionByType, null, 2));
if (checkResult.errors) console.log('errors:', JSON.stringify(checkResult.errors, null, 2));

const defId = checkResult.data?.metaobjectDefinitionByType?.id;
const currentAccess = checkResult.data?.metaobjectDefinitionByType?.access?.storefront;

if (currentAccess === 'PUBLIC_READ') {
  console.log('Already PUBLIC_READ, no change needed.');
  process.exit(0);
}

// 2. Update to PUBLIC_READ if not already
const updateResult = await gql(`#graphql
  mutation UpdateAccess($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
    metaobjectDefinitionUpdate(id: $id, definition: $definition) {
      metaobjectDefinition {
        id
        access { storefront }
      }
      userErrors { field message code }
    }
  }
`, {
  id: defId,
  definition: {access: {storefront: 'PUBLIC_READ'}},
});

console.log('Update result:', JSON.stringify(updateResult.data?.metaobjectDefinitionUpdate, null, 2));
if (updateResult.errors) console.log('errors:', JSON.stringify(updateResult.errors, null, 2));
