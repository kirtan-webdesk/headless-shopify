import {useLoaderData, Await} from 'react-router';
import {Suspense} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {CollectionProductCard} from '~/components/CollectionProductCard';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [
    {title: `PEARLS by Car Brite | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

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

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

/**
 * Related products come from the product's own productType, fetched
 * deferred (below-the-fold, non-blocking) rather than critical -- matches
 * the pattern already used for RecommendedProducts on the homepage.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context, params}) {
  const relatedProducts = context.storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: {handle: params.handle},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {relatedProducts};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, relatedProducts} = useLoaderData();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  const quantityAvailable = selectedVariant?.quantityAvailable;
  const inStock = selectedVariant?.availableForSale;
  const lowStock =
    inStock && typeof quantityAvailable === 'number' && quantityAvailable > 0 && quantityAvailable <= 5;

  const sellingPlans = selectedVariant?.sellingPlanAllocations?.nodes ?? [];

  return (
    <div className="pdp">
      <div className="pdp-gallery">
        <ProductImage image={selectedVariant?.image} />
      </div>
      <div className="pdp-main">
        {product.productType && (
          <p className="pdp-category">{product.productType}</p>
        )}
        <h1 className="pdp-title">{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />

        <p className="pdp-availability" role="status">
          {inStock
            ? lowStock
              ? `Only ${quantityAvailable} left`
              : 'In stock'
            : 'Sold out'}
        </p>

        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />

        {sellingPlans.length > 0 && (
          <div className="pdp-subscription" aria-labelledby="subscription-heading">
            <p id="subscription-heading" className="section-eyebrow">
              Subscribe &amp; save
            </p>
            <ul className="pdp-subscription-list">
              {sellingPlans.map(({sellingPlan}) => (
                <li key={sellingPlan.name}>{sellingPlan.name}</li>
              ))}
            </ul>
          </div>
        )}

        {descriptionHtml && (
          <div className="pdp-description">
            <p className="section-eyebrow">Description</p>
            <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          </div>
        )}
      </div>

      <RelatedProducts productsPromise={relatedProducts} currentHandle={product.handle} />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/**
 * @param {{
 *   productsPromise: Promise<RelatedProductsQuery | null>;
 *   currentHandle: string;
 * }}
 */
function RelatedProducts({productsPromise, currentHandle}) {
  return (
    <section className="pdp-related" aria-labelledby="related-heading">
      <p className="section-eyebrow">You might also need</p>
      <h2 id="related-heading">Related products</h2>
      <Suspense fallback={null}>
        <Await resolve={productsPromise}>
          {(response) => {
            const products = response?.products?.nodes.filter(
              (p) => p.handle !== currentHandle,
            );
            if (!products?.length) return null;
            return (
              <div className="collection-grid">
                {products.slice(0, 4).map((product) => (
                  <CollectionProductCard key={product.id} product={product} />
                ))}
              </div>
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    quantityAvailable
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sellingPlanAllocations(first: 10) {
      nodes {
        sellingPlan {
          name
          description
        }
      }
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    productType
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const RELATED_PRODUCTS_QUERY = `#graphql
  fragment RelatedProduct on Product {
    id
    handle
    title
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
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
  query RelatedProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      productType
    }
    products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        ...RelatedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').RelatedProductsQuery} RelatedProductsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
