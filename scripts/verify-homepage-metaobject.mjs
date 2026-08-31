// Verification script — confirms the homepage_content Metaobject definition
// exists and is Storefront-readable. Uses ONLY the Storefront API token
// already configured for this app (PRIVATE_STOREFRONT_API_TOKEN) — no Admin
// API access needed or used. Doubles as D-HL-ENV-01 check 5 (live Storefront
// API test query against the real store).

import {readFileSync} from 'node:fs';

function loadEnv() {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const env = {};
  for (const line of raw.split(/\r\n|\n|\r/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const domain = env.PUBLIC_STORE_DOMAIN;
const token = env.PRIVATE_STOREFRONT_API_TOKEN;

if (!domain || !token) {
  console.error('Missing PUBLIC_STORE_DOMAIN or PRIVATE_STOREFRONT_API_TOKEN in .env');
  process.exit(1);
}

const QUERY = `#graphql
  query VerifyHomepageMetaobject {
    metaobjects(type: "homepage_content", first: 10) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;

const res = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Private-Token': token,
  },
  body: JSON.stringify({query: QUERY}),
});

console.log(`HTTP ${res.status}`);
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
