import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';

// Static per the reference (both Design/Design/Homepage Design/Mockup/Pearls_HP.jpg
// and .../Collection page Design/Mockups/Pearls_CP.jpg show the identical footer) --
// these are brand/nav labels, not Shopify data, so they're not Metaobject/menu-driven.
// The real Shopify policy menu (privacy/refund/shipping/terms) is folded into the
// "Help" column as actual dynamic links, preserving that functionality.
const FOOTER_COLUMNS = [
  {
    heading: 'Shop',
    links: [
      {label: 'The full lineup', to: '/collections/all'},
      {label: 'Starter kits', to: '/collections/all?tab=Kits & bundles'},
      {label: 'Refill pods', to: '/collections/all?tab=Refills'},
      {label: 'Accessories', to: '/collections/all?tab=Gear'},
      {label: 'Gift card', to: '/products/gift-card'},
    ],
  },
  {
    heading: 'Learn',
    links: [
      {label: 'How it works', to: '/pages/how-it-works'},
      {label: 'Chemistry deep-dive', to: '/pages/chemistry'},
      {label: 'Detail journal', to: '/blogs/journal'},
    ],
  },
  {
    heading: 'Company',
    links: [
      {label: 'About PEARLS', to: '/pages/about'},
      {label: 'Car Brite parent', to: '/pages/car-brite'},
      {label: 'Careers', to: '/pages/careers'},
      {label: 'Press', to: '/pages/press'},
    ],
  },
];

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <p className="footer-logo">PEARLS</p>
        <p className="footer-tagline-eyebrow">
          Powered by Car Brite &middot; est. 1947
        </p>
        <p className="footer-tagline">
          75 years of professional detailing chemistry, distilled into pods
          that fit a shelf in your garage.
        </p>
      </div>

      <div className="footer-columns">
        {FOOTER_COLUMNS.map((col) => (
          <div className="footer-column" key={col.heading}>
            <h3>{col.heading}</h3>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <NavLink to={link.to} prefetch="intent">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-column">
          <h3>Help</h3>
          <ul>
            <li>
              <NavLink to="/pages/contact" prefetch="intent">
                Contact
              </NavLink>
            </li>
            <li>
              <NavLink to="/account" prefetch="intent">
                Subscriptions
              </NavLink>
            </li>
            <Suspense fallback={null}>
              <Await resolve={footerPromise}>
                {(footer) =>
                  footer?.menu && header.shop.primaryDomain?.url ? (
                    <FooterMenu
                      menu={footer.menu}
                      primaryDomainUrl={header.shop.primaryDomain.url}
                      publicStoreDomain={publicStoreDomain}
                    />
                  ) : null
                }
              </Await>
            </Suspense>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Car Brite Industries &middot; PEARLS&trade;</p>
        <p>Indianapolis, IN &middot; Made in USA</p>
      </div>
    </footer>
  );
}

/**
 * Real Shopify policy menu (privacy/refund/shipping/terms) -- rendered as
 * additional <li> items inside the Help column's existing <ul>.
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <>
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return (
          <li key={item.id}>
            {isExternal ? (
              <a href={url} rel="noopener noreferrer" target="_blank">
                {item.title}
              </a>
            ) : (
              <NavLink end prefetch="intent" to={url}>
                {item.title}
              </NavLink>
            )}
          </li>
        );
      })}
    </>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
