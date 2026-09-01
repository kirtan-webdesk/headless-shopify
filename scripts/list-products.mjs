// Read-only check: lists product titles + handles + first variant GID in the
// connected dev store. Used to determine whether real products matching the
// homepage's static PODS data (Car Soap, Exterior Cleaner, etc.) exist yet,
// before deciding how to wire "Add to bag" buttons. Storefront API only.

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
const token = env.PUBLIC_STOREFRONT_API_TOKEN;

const QUERY = `#graphql
  query ListProducts {
    products(first: 50) {
      nodes {
        title
        handle
        productType
        variants(first: 1) {
          nodes { id availableForSale }
        }
      }
    }
  }
`;

const res = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  },
  body: JSON.stringify({query: QUERY}),
});

const json = await res.json();
if (json.errors) {
  console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
  process.exit(1);
}

const products = json.data.products.nodes;
console.log(`Total products: ${products.length}\n`);
for (const p of products) {
  console.log(`- ${p.title} | handle=${p.handle} | type=${p.productType} | firstVariant=${p.variants.nodes[0]?.id ?? 'none'}`);
}
