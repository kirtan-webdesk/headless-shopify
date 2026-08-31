import {useLoaderData, useSearchParams, Link} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {CollectionProductCard} from '~/components/CollectionProductCard';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `PEARLS by Car Brite | Shop all`}];
};

// Same tab/sort mapping as collections.$handle.jsx -- kept in both files
// rather than shared, since this route queries `products` directly (no
// `collection` object exists for the catalog-wide "all" pseudo-collection).
const FILTER_TABS = [
  {label: 'All products', productType: null},
  {label: 'Pods', productType: 'Pods'},
  {label: 'Kits & bundles', productType: 'Kits & bundles'},
  {label: 'Refills', productType: 'Refills'},
  {label: 'Gear', productType: 'Gear'},
];

// ProductSortKeys (verified: BEST_SELLING, CREATED_AT, ID, PRICE,
// PRODUCT_TYPE, RELEVANCE, TITLE, UPDATED_AT, VENDOR). RELEVANCE is
// explicitly documented as search-query-only -- not used here since this
// route has no search `query` param. "Featured" maps to BEST_SELLING as the
// closest real equivalent; ProductSortKeys has no MANUAL option (that's
// collection-scoped only, see collections.$handle.jsx), so "Routine order"
// falls back to the same BEST_SELLING default rather than asserting a sort
// key that doesn't exist on this query.
const SORT_OPTIONS = [
  {label: 'Featured', value: 'featured', sortKey: 'BEST_SELLING', reverse: false},
  {label: 'Newest', value: 'new', sortKey: 'CREATED_AT', reverse: true},
  {label: 'Price: low to high', value: 'low', sortKey: 'PRICE', reverse: false},
  {label: 'Price: high to low', value: 'high', sortKey: 'PRICE', reverse: true},
  {label: 'Routine order', value: 'routine', sortKey: 'BEST_SELLING', reverse: false},
];

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  const activeTabParam = url.searchParams.get('tab') || 'All products';
  const activeTab =
    FILTER_TABS.find((t) => t.label === activeTabParam) ?? FILTER_TABS[0];

  const sortParam = url.searchParams.get('sort') || 'featured';
  const activeSort =
    SORT_OPTIONS.find((s) => s.value === sortParam) ?? SORT_OPTIONS[0];

  // Top-level `products` query has NO `filters` argument (verified against
  // Shopify's docs -- only collection.products does). Filtering here goes
  // through the `query` search-syntax string instead.
  const searchQuery = activeTab.productType
    ? `product_type:'${activeTab.productType}'`
    : undefined;

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        query: searchQuery,
        sortKey: activeSort.sortKey,
        reverse: activeSort.reverse,
        ...paginationVariables,
      },
    }),
  ]);
  return {products, activeTab: activeTab.label, activeSort: activeSort.value};
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products, activeTab, activeSort} = useLoaderData();
  const [searchParams] = useSearchParams();

  return (
    <div className="collection-page">
      <div className="collection-banner">
        <nav aria-label="Breadcrumb" className="collection-breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/collections/all">Shop</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Shop All</span>
        </nav>
        <h1>Shop all</h1>
        <p className="collection-description">
          Every pod, kit, and piece of gear in the PEARLS system — five
          single-dose concentrates built on 75 years of Car Brite chemistry,
          plus the bundles that put them together.
        </p>
      </div>

      <div className="collection-controls">
        <div
          className="collection-filter-tabs"
          role="tablist"
          aria-label="Filter by category"
        >
          {FILTER_TABS.map((tab) => {
            const params = new URLSearchParams(searchParams);
            if (tab.label === 'All products') params.delete('tab');
            else params.set('tab', tab.label);
            const isActive = tab.label === activeTab;
            return (
              <Link
                key={tab.label}
                to={`?${params.toString()}`}
                role="tab"
                aria-selected={isActive}
                className={
                  isActive
                    ? 'collection-filter-tab collection-filter-tab-active'
                    : 'collection-filter-tab'
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="collection-meta-row">
          <p className="collection-count">
            {products.nodes.length} products
          </p>
          <label className="collection-sort">
            <span>Sort</span>
            <select
              defaultValue={activeSort}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value === 'featured') params.delete('sort');
                else params.set('sort', e.target.value);
                window.location.search = params.toString();
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {products.nodes.length === 0 ? (
        <p className="collection-empty" role="status">
          No products found for &ldquo;{activeTab}&rdquo;. Try a different
          filter.
        </p>
      ) : (
        <PaginatedResourceSection
          connection={products}
          resourcesClassName="collection-grid"
        >
          {({node: product, index}) => (
            <CollectionProductCard
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      )}

      <ShopBySurface />
      <AboutCollection />
      <NewsletterSignup />
    </div>
  );
}

function ShopBySurface() {
  const surfaces = [
    {name: 'Exterior', copy: 'Soap, paint, trim, bodywork', image: '/images/exterior.jpg'},
    {name: 'Wheels & Tires', copy: 'Sling-free gloss, ceramic-safe', image: '/images/wheels-tires.jpg'},
    {name: 'Interior', copy: 'Glass, dash, vinyl, leather', image: '/images/interior.jpg'},
  ];
  return (
    <section className="shop-by-surface" aria-labelledby="surface-heading">
      <p className="section-eyebrow">Shop by surface</p>
      <h2 id="surface-heading">Know what you&rsquo;re after?</h2>
      <div className="surface-grid">
        {surfaces.map((s) => (
          <Link
            key={s.name}
            to="/collections/all"
            className="surface-card"
            style={{backgroundImage: `url(${s.image})`}}
          >
            <span className="surface-name">{s.name}</span>
            <span className="surface-copy">{s.copy}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AboutCollection() {
  return (
    <section className="about-collection" aria-labelledby="about-heading">
      <div>
        <p className="section-eyebrow">About this collection</p>
        <h2 id="about-heading">
          One system, <em>twelve ways in.</em>
        </h2>
      </div>
      <div>
        <p>
          PEARLS is a five-pod detailing system. Each pod is a single-dose
          concentrate — pre-measured to the exact ratio the job needs, so
          there&rsquo;s no guessing at dilution.
        </p>
        <p>
          Buying à la carte works if your car only needs one or two steps.
          Most people start with a kit: the Full Routine covers everything,
          the smaller kits cover one part of the job.
        </p>
        <p>
          Everything on this page is formulated and packed in the same
          Indianapolis facility Car Brite has run for 75 years.
        </p>
      </div>
    </section>
  );
}

function NewsletterSignup() {
  return (
    <section className="newsletter-signup" aria-labelledby="newsletter-heading">
      <div>
        <p className="section-eyebrow">The drop list</p>
        <h2 id="newsletter-heading">
          Get a free pod with your <em>first order.</em>
        </h2>
        <p>
          One email a month. New scents, garage tours, and the occasional 20%
          code. No spam, no sales-bro tone.
        </p>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="you@yourgarage.com"
            required
          />
          <button type="submit">Sign me up</button>
        </form>
      </div>
      <dl className="newsletter-stats">
        <div>
          <dt>1</dt>
          <dd>Free pod, first order</dd>
        </div>
        <div>
          <dt>4.9★</dt>
          <dd>Average rating</dd>
        </div>
        <div>
          <dt>1/mo</dt>
          <dd>Emails, that&rsquo;s it</dd>
        </div>
        <div>
          <dt>0</dt>
          <dd>Single-use bottles</dd>
        </div>
      </dl>
    </section>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    description
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
