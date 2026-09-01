import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

// Literal .pcol.c1-c5 .pc-img gradients from the mockup source -- cycled by
// grid index since real Shopify products have no "cls" field to key off of.
const CARD_GRADIENTS = [
  'radial-gradient(65% 62% at 50% 42%, rgba(255,255,255,.4), transparent 72%), linear-gradient(160deg, #73CDDA, #0a4a6e)',
  'radial-gradient(65% 62% at 50% 42%, rgba(255,255,255,.4), transparent 72%), linear-gradient(160deg, #8E4D9E, #4a166e)',
  'radial-gradient(65% 62% at 50% 42%, rgba(255,255,255,.4), transparent 72%), linear-gradient(160deg, #644FA0, #33265E)',
  'radial-gradient(65% 62% at 50% 42%, rgba(255,255,255,.4), transparent 72%), linear-gradient(160deg, #2E9BB0, #074c75)',
  'radial-gradient(65% 62% at 50% 42%, rgba(255,255,255,.4), transparent 72%), linear-gradient(160deg, #A8561E, #5A2E10)',
];

/**
 * Product card for the collection grid. Matches the approved reference
 * (Design/Design/Collection page Design/) card structure: badge, optional
 * save-percent tag, image, category, title, description, subtext, price
 * (+ compare-at), Add to bag, and a static "Buy on Amazon" placeholder link
 * per explicit user decision 2026-08-31 -- not wired to any real integration.
 * @param {{
 *   product: import('storefrontapi.generated').ProductItemFragment;
 *   index?: number;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function CollectionProductCard({product, index = 0, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const {open} = useAside();
  const image = product.featuredImage;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const variant = product.variants?.nodes?.[0];

  return (
    <article className="collection-card">
      <Link
        className="collection-card-media"
        style={{background: gradient}}
        to={variantUrl}
        prefetch="intent"
      >
        <div className="collection-card-badges">
          {product.productType && (
            <span className="collection-card-badge">{product.productType}</span>
          )}
        </div>
        {onSale && (
          <span className="collection-card-save">
            Save{' '}
            {Math.round(
              ((Number(compareAt.amount) - Number(price.amount)) /
                Number(compareAt.amount)) *
                100,
            )}
            %
          </span>
        )}
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 320px, 50vw"
          />
        )}
      </Link>
      <div className="collection-card-body">
        {product.tags?.[0] && (
          <p className="collection-card-category">{product.tags[0]}</p>
        )}
        <h3 className="collection-card-title">
          <Link to={variantUrl} prefetch="intent">
            {product.title}
          </Link>
        </h3>
        {product.description && (
          <p className="collection-card-description">
            {product.description}
          </p>
        )}
        <div className="collection-card-price">
          <span className="collection-card-price-now">
            <Money data={price} />
          </span>
          {onSale && (
            <span className="collection-card-price-compare">
              <Money data={compareAt} />
            </span>
          )}
        </div>
        <div className="collection-card-actions">
          <AddToCartButton
            className="collection-card-add"
            disabled={!variant || !variant.availableForSale}
            onClick={() => open('cart')}
            lines={
              variant
                ? [{merchandiseId: variant.id, quantity: 1, selectedVariant: variant}]
                : []
            }
          >
            {variant && !variant.availableForSale ? 'Sold out' : 'Add to bag'}
          </AddToCartButton>
          {/* Static placeholder per 2026-08-31 decision -- reference-only,
              not a real Shopify data source or integration. */}
          <a
            className="collection-card-amazon"
            href="#"
            aria-label={`Buy ${product.title} on Amazon`}
          >
            Buy on Amazon
          </a>
        </div>
      </div>
    </article>
  );
}
