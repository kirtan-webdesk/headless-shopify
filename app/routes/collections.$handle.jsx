import {redirect, useLoaderData, useSearchParams, Link} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {CollectionProductCard} from '~/components/CollectionProductCard';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `PEARLS by Car Brite | ${data?.collection.title ?? ''}`}];
};

// Filter tabs match the approved reference (Design/Design/Collection page
// Design/) exactly. Mapped to Shopify productType per D-HL data-source rule --
// "map visible filters to supported Shopify collection/product filters,"
// not invented. On a store without this productType taxonomy, tabs still
// work, they'll just return zero/all results until products are tagged.
const FILTER_TABS = [
  {label: 'All products', productType: null},
  {label: 'Pods', productType: 'Pods'},
  {label: 'Kits & bundles', productType: 'Kits & bundles'},
  {label: 'Refills', productType: 'Refills'},
  {label: 'Gear', productType: 'Gear'},
];

// Reference labels -> real ProductCollectionSortKeys (verified against
// Shopify's Storefront API docs, not guessed). "Routine order" has no
// direct Storefront API equivalent; mapped to MANUAL (merchant-curated
// collection order), the closest real mechanism -- flagged in HANDOFF.md.
const SORT_OPTIONS = [
  {label: 'Featured', value: 'featured', sortKey: 'COLLECTION_DEFAULT', reverse: false},
  {label: 'Newest', value: 'new', sortKey: 'CREATED', reverse: true},
  {label: 'Price: low to high', value: 'low', sortKey: 'PRICE', reverse: false},
  {label: 'Price: high to low', value: 'high', sortKey: 'PRICE', reverse: true},
  {label: 'Routine order', value: 'routine', sortKey: 'MANUAL', reverse: false},
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  if (!handle) {
    throw redirect('/collections');
  }

  const activeTabParam = url.searchParams.get('tab') || 'All products';
  const activeTab =
    FILTER_TABS.find((t) => t.label === activeTabParam) ?? FILTER_TABS[0];

  const sortParam = url.searchParams.get('sort') || 'featured';
  const activeSort =
    SORT_OPTIONS.find((s) => s.value === sortParam) ?? SORT_OPTIONS[0];

  const filters = activeTab.productType
    ? [{productType: activeTab.productType}]
    : [];

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        filters,
        sortKey: activeSort.sortKey,
        reverse: activeSort.reverse,
        ...paginationVariables,
      },
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection, activeTab: activeTab.label, activeSort: activeSort.value};
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection, activeTab, activeSort} = useLoaderData();
  const [searchParams] = useSearchParams();

  return (
    <div className="collection-page">
      <RoutineStrip />

      <div className="collection-banner">
        <nav aria-label="Breadcrumb" className="collection-breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/collections">Shop</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{collection.title}</span>
        </nav>
        <h1>{collection.title}</h1>
        {collection.description && (
          <p className="collection-description">{collection.description}</p>
        )}
      </div>

      <div className="collection-controls">
        <div className="collection-filter-tabs" role="tablist" aria-label="Filter by category">
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
            {collection.products.nodes.length} products
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

      {collection.products.nodes.length === 0 ? (
        <p className="collection-empty" role="status">
          No products found for &ldquo;{activeTab}&rdquo;. Try a different filter.
        </p>
      ) : (
        <PaginatedResourceSection
          connection={collection.products}
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

      <Analytics.CollectionView
        data={{
          collection: {id: collection.id, handle: collection.handle},
        }}
      />
    </div>
  );
}

/**
 * Static merchandising strip above the grid, matches the reference exactly.
 * Not Storefront-API-driven -- SOW doesn't require this content to be
 * merchant-editable, only the product listing itself.
 */
function RoutineStrip() {
  const steps = [
    {step: 'Step 01', name: 'Car Soap', price: '$24'},
    {step: 'Step 02', name: 'Exterior Cleaner', price: '$28'},
    {step: 'Step 03', name: 'Tire & Wheels', price: '$26'},
    {step: 'Step 04', name: 'Glass Cleaner', price: '$22'},
    {step: 'Step 05', name: 'Interior Cleaner', price: '$26'},
  ];
  return (
    <section className="routine-strip" aria-labelledby="routine-heading">
      <p className="section-eyebrow routine-eyebrow">The Routine</p>
      <h2 id="routine-heading">
        Five pods. <em>One perfect finish.</em>
      </h2>
      <p className="routine-subtext">
        Single-dose detailing concentrates — drop, fill, shake. No measuring,
        no waste.
      </p>
      <div className="routine-links">
        <Link to="/collections/all" className="hero-cta hero-cta-primary">
          Build your kit &rarr;
        </Link>
        <Link to="/collections/all?tab=Pods">Shop all pods</Link>
        <Link to="/collections/all?tab=Refills">Refill subscriptions</Link>
      </div>
      <ol className="routine-steps">
        {steps.map((s) => (
          <li key={s.step}>
            <span className="routine-step-label">{s.step}</span>
            <span className="routine-step-name">{s.name}</span>
            <span className="routine-step-price">{s.price}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ShopBySurface() {
  const surfaces = [
    {name: 'Exterior', copy: 'Soap, paint, trim, bodywork'},
    {name: 'Wheels & Tires', copy: 'Sling-free gloss, ceramic-safe'},
    {name: 'Interior', copy: 'Glass, dash, vinyl, leather'},
  ];
  return (
    <section className="shop-by-surface" aria-labelledby="surface-heading">
      <p className="section-eyebrow">Shop by surface</p>
      <h2 id="surface-heading">Know what you&rsquo;re after?</h2>
      <div className="surface-grid">
        {surfaces.map((s) => (
          <Link key={s.name} to="/collections/all" className="surface-card">
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
      <p className="section-eyebrow">About this collection</p>
      <h2 id="about-heading">
        One system, <em>twelve ways in.</em>
      </h2>
      <p>
        PEARLS is a five-pod detailing system. Each pod is a single-dose
        concentrate — pre-measured to the exact ratio the job needs, so
        there&rsquo;s no guessing at dilution.
      </p>
      <p>
        Buying à la carte works if your car only needs one or two steps. Most
        people start with a kit: the Full Routine covers everything, the
        smaller kits cover one part of the job.
      </p>
      <p>
        Everything on this page is formulated and packed in the same
        Indianapolis facility Car Brite has run for 75 years.
      </p>
    </section>
  );
}

function NewsletterSignup() {
  return (
    <section className="newsletter-signup" aria-labelledby="newsletter-heading">
      <p className="section-eyebrow">The drop list</p>
      <h2 id="newsletter-heading">
        Get a free pod with your <em>first order.</em>
      </h2>
      <p>
        One email a month. New scents, garage tours, and the occasional 20%
        code. No spam.
      </p>
      {/* Static form -- newsletter provider not in scope for this sprint;
          wiring is a separate SOW item (INT-001/002 style manual config). */}
      <form
        className="newsletter-form"
        onSubmit={(e) => e.preventDefault()}
      >
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
    </section>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
