// Read-only Admin API check: confirms the homepage_content Metaobject
// definition + entry actually exist and what fields/values they currently
// hold, independent of the Storefront API's channel-locked raw-fetch issue.
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
const token = env.ADMIN_API_TOKEN;

if (!domain || !token) {
  console.error('Missing PUBLIC_STORE_DOMAIN or ADMIN_API_TOKEN in .env');
  process.exit(1);
}

const QUERY = `#graphql
  query ReadHomepageMetaobject {
    metaobjectDefinitionByType(type: "homepage_content") {
      id
      name
      type
      capabilities {
        publishable {
          enabled
        }
      }
      access {
        storefront
      }
      fieldDefinitions {
        key
        type {
          name
        }
      }
    }
    metaobjects(type: "homepage_content", first: 5) {
      nodes {
        id
        handle
        capabilities {
          publishable {
            status
          }
        }
        fields {
          key
          value
        }
      }
    }
  }
`;

const res = await fetch(`https://${domain}/admin/api/2026-07/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token,
  },
  body: JSON.stringify({query: QUERY}),
});

const json = await res.json();
console.log(`HTTP ${res.status}`);
console.log(JSON.stringify(json, null, 2));
