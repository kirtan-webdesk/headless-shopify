import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';

/**
 * Product card for the collection grid. Matches the approved reference
 * (Design/Design/Collection page Design/) card structure: badge, optional
 * save-percent tag, image, category, title, description, subtext, price
 * (+ compare-at), Add to bag, and a static "Buy on Amazon" placeholder link
 * per explicit user decision 2026-08-31 -- not wired to any real integration.
 * @param {{
 *   product: import('storefrontapi.generated').ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function CollectionProductCard({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale =
    compareAt && Number(compareAt.amount) > Number(price.amount);

  return (
    <article className="collection-card">
      <Link className="collection-card-media" to={variantUrl} prefetch="intent">
        {product.productType && (
          <span className="collection-card-badge">{product.productType}</span>
        )}
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
          {onSale && (
            <span className="collection-card-price-compare">
              <Money data={compareAt} />
            </span>
          )}
          <Money data={price} />
        </div>
        <div className="collection-card-actions">
          <button type="button" className="collection-card-add">
            Add to bag
          </button>
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
