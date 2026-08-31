// Uploads the approved hero photo to Shopify's Files and sets it on the
// homepage_content Metaobject's hero_image field, so it's genuinely
// editable in Admin (matches S2.2's own acceptance criteria) rather than
// hardcoded in JSX. Reads .env at runtime only -- values never printed.

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

async function gql(query, variables) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
    body: JSON.stringify({query, variables}),
  });
  return res.json();
}

const filePath = new URL('../public/images/hero-car.jpg', import.meta.url);
const fileBytes = readFileSync(filePath);
const filename = 'hero-car.jpg';
const mimeType = 'image/jpeg';

// 1. Staged upload target
const stagedResult = await gql(
  `#graphql
  mutation StagedUpload($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`,
  {
    input: [
      {
        filename,
        mimeType,
        httpMethod: 'POST',
        resource: 'IMAGE',
        fileSize: String(fileBytes.length),
      },
    ],
  },
);

if (stagedResult.errors || stagedResult.data.stagedUploadsCreate.userErrors?.length) {
  console.error('stagedUploadsCreate failed:', JSON.stringify(stagedResult.errors || stagedResult.data.stagedUploadsCreate.userErrors, null, 2));
  process.exit(1);
}

const target = stagedResult.data.stagedUploadsCreate.stagedTargets[0];
console.log('Staged upload target obtained.');

// 2. POST the file to the staged URL
const form = new FormData();
for (const {name, value} of target.parameters) form.append(name, value);
form.append('file', new Blob([fileBytes], {type: mimeType}), filename);

const uploadRes = await fetch(target.url, {method: 'POST', body: form});
if (!uploadRes.ok) {
  console.error('File upload failed:', uploadRes.status, await uploadRes.text());
  process.exit(1);
}
console.log('File uploaded to staged target.');

// 3. fileCreate
const fileCreateResult = await gql(
  `#graphql
  mutation CreateFile($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files { id fileStatus alt }
      userErrors { field message }
    }
  }`,
  {
    files: [
      {
        originalSource: target.resourceUrl,
        contentType: 'IMAGE',
        alt: 'A hand washing an orange car with PEARLS foaming soap',
        filename,
      },
    ],
  },
);

if (fileCreateResult.errors || fileCreateResult.data.fileCreate.userErrors?.length) {
  console.error('fileCreate failed:', JSON.stringify(fileCreateResult.errors || fileCreateResult.data.fileCreate.userErrors, null, 2));
  process.exit(1);
}

let file = fileCreateResult.data.fileCreate.files[0];
console.log('File created:', file.id, 'status:', file.fileStatus);

// 4. Poll until READY (files process async)
for (let i = 0; i < 10 && file.fileStatus !== 'READY'; i++) {
  await new Promise((r) => setTimeout(r, 1500));
  const pollResult = await gql(
    `#graphql
    query PollFile($id: ID!) {
      node(id: $id) {
        ... on MediaImage { id fileStatus }
      }
    }`,
    {id: file.id},
  );
  file = pollResult.data.node;
  console.log('  poll:', file.fileStatus);
}

if (file.fileStatus !== 'READY') {
  console.error('File did not reach READY status in time. Current status:', file.fileStatus);
  process.exit(1);
}

// 5. Set hero_image on the homepage_content Metaobject entry.
// No metaobjectUpdateByHandle mutation exists (verified) -- metaobjectUpdate
// needs the numeric id, which we already have from when the entry was
// created (scripts/create-homepage-metaobject-entry.mjs output).
const METAOBJECT_ID = 'gid://shopify/Metaobject/211403211050';

const updateResult = await gql(
  `#graphql
  mutation UpdateHomepageHero($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { id handle fields { key value } }
      userErrors { field message code }
    }
  }`,
  {
    id: METAOBJECT_ID,
    metaobject: {fields: [{key: 'hero_image', value: file.id}]},
  },
);

if (updateResult.errors || updateResult.data.metaobjectUpdate.userErrors?.length) {
  console.error('metaobjectUpdate failed:', JSON.stringify(updateResult.errors || updateResult.data.metaobjectUpdate.userErrors, null, 2));
  process.exit(1);
}

console.log('hero_image set on homepage_content/main-homepage:', file.id);
