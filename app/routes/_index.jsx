import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'PEARLS by Car Brite | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}, {metaobject: homepage}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(HOMEPAGE_CONTENT_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
    homepage: metaobjectFieldsToObject(homepage),
  };
}

/**
 * Metaobject `fields` comes back as [{key, value}, ...] -- flatten to {key: value}
 * so the component can read `homepage.hero_heading` directly.
 * @param {{fields: {key: string; value: string}[]} | null} metaobject
 */
function metaobjectFieldsToObject(metaobject) {
  if (!metaobject) return null;
  return Object.fromEntries(metaobject.fields.map((f) => [f.key, f.value]));
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <AnnouncementBar homepage={data.homepage} />
      <Hero homepage={data.homepage} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

/**
 * Rotating announcement bar. Falls back to nothing if the Metaobject entry
 * hasn't been created yet in Admin -- never throws, never shows blank text.
 * @param {{homepage: Record<string, string> | null}}
 */
function AnnouncementBar({homepage}) {
  const messages = [
    homepage?.announcement_message_1,
    homepage?.announcement_message_2,
    homepage?.announcement_message_3,
  ].filter(Boolean);

  if (!messages.length) return null;

  return (
    <div className="announcement-bar" role="note">
      {messages.map((message, index) => (
        <span className="announcement-bar-item" key={index}>
          {message}
        </span>
      ))}
    </div>
  );
}

/**
 * Homepage hero, driven entirely by the `homepage_content` Metaobject.
 * Editing the entry in Shopify admin changes this section with no deploy.
 * @param {{homepage: Record<string, string> | null}}
 */
function Hero({homepage}) {
  if (!homepage) {
    // Metaobject entry missing -- surface this clearly instead of an empty hero.
    return (
      <section className="hero hero-empty" aria-labelledby="hero-heading">
        <h1 id="hero-heading">Homepage content not set</h1>
        <p>
          Add a &ldquo;Homepage content&rdquo; entry in Shopify admin (Content
          &rarr; Metaobjects) to populate this hero section.
        </p>
      </section>
    );
  }

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        {homepage.hero_eyebrow && (
          <p className="hero-eyebrow">{homepage.hero_eyebrow}</p>
        )}
        <h1 id="hero-heading" className="hero-heading">
          {homepage.hero_heading}{' '}
          {homepage.hero_heading_highlight && (
            <em className="hero-heading-highlight">
              {homepage.hero_heading_highlight}
            </em>
          )}
        </h1>
        {homepage.hero_subtext && (
          <p className="hero-subtext">{homepage.hero_subtext}</p>
        )}
        <div className="hero-ctas">
          {homepage.primary_cta_label && homepage.primary_cta_link && (
            <Link className="hero-cta hero-cta-primary" to={homepage.primary_cta_link}>
              {homepage.primary_cta_label} &rarr;
            </Link>
          )}
          {homepage.secondary_cta_label && homepage.secondary_cta_link && (
            <Link
              className="hero-cta hero-cta-secondary"
              to={homepage.secondary_cta_link}
            >
              {homepage.secondary_cta_label}
            </Link>
          )}
        </div>
      </div>
      {/* TEMPORARY: hero_image is a Metaobject field (file_reference) per
          the S2.2 "no deploy" acceptance criteria, but the Admin API token
          lacks write_files scope so it couldn't be uploaded into Shopify
          Files this session (see project.json risks). Falls back to the
          static reference asset for now -- swap to homepage.hero_image
          once the scope is granted and scripts/upload-hero-image.mjs runs. */}
      <div className="hero-photo">
        <img
          src="/images/hero-car.jpg"
          alt="A hand washing an orange car with PEARLS foaming soap"
          width="800"
          height="1000"
          loading="eager"
        />
      </div>
    </section>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image
            data={image}
            sizes="100vw"
            alt={image.altText || collection.title}
          />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <section
      className="recommended-products"
      aria-labelledby="recommended-products"
    >
      <h2 id="recommended-products">Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </section>
  );
}

const HOMEPAGE_CONTENT_QUERY = `#graphql
  query HomepageContent {
    metaobject(handle: {type: "homepage_content", handle: "main-homepage"}) {
      fields {
        key
        value
      }
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
