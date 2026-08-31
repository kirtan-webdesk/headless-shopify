import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

// Static per the reference (both Pearls_HP.jpg and Pearls_CP.jpg show the
// identical header) -- these are brand nav labels, not Shopify menu data.
// wds55's own configured menu ("Home/Catalog/Contact") does not match the
// mockup, so this intentionally does NOT use header.menu for the primary
// nav (unlike the Hydrogen scaffold default). Real Shopify menu data is
// still used for isLoggedIn/cart via HeaderCtas below.
const NAV_LINKS = [
  {label: 'Shop', to: '/collections/all'},
  {label: 'How it Works', to: '/pages/how-it-works'},
  {label: 'About Us', to: '/pages/about'},
  {label: 'Contact Us', to: '/pages/contact'},
];

// "The Routine" mega-menu content, attached to the "Shop" nav item. Copy
// extracted verbatim from the reference HTML's live DOM (positioned before
// <main> on both Pearls_HP.jpg/Pearls_CP.jpg reference pages -- confirmed a
// mega-menu, not a page section, since it's absent from both mockup images
// on page load). Product names/prices match the 5 pods used consistently
// across the homepage Pod System section and this menu.
const ROUTINE_STEPS = [
  {step: 'Step 01', name: 'Car Soap', price: '$24'},
  {step: 'Step 02', name: 'Exterior Cleaner', price: '$28'},
  {step: 'Step 03', name: 'Tire & Wheels', price: '$26'},
  {step: 'Step 04', name: 'Glass Cleaner', price: '$22'},
  {step: 'Step 05', name: 'Interior Cleaner', price: '$26'},
];

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" className="header-logo" end>
        <span className="header-logo-mark">PEARLS</span>
        <span className="header-logo-sub">by Car Brite</span>
      </NavLink>
      <HeaderMenu viewport="desktop" />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

/**
 * @param {{viewport: Viewport}}
 */
export function HeaderMenu({viewport}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink end onClick={close} prefetch="intent" to="/">
          Home
        </NavLink>
      )}
      {NAV_LINKS.map((link) =>
        link.label === 'Shop' && viewport === 'desktop' ? (
          <ShopMegaMenuItem key={link.label} link={link} />
        ) : (
          <NavLink
            className="header-menu-item"
            end
            key={link.label}
            onClick={close}
            prefetch="intent"
            to={link.to}
          >
            {link.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}

/**
 * The "Shop" nav item on desktop: a normal link, plus a mega-menu panel
 * that opens on hover or keyboard focus (`:focus-within`, no JS state
 * needed -- also means it degrades to "just a link" if CSS fails, never a
 * dead-end). See ROUTINE_STEPS above for content provenance.
 * @param {{link: {label: string; to: string}}}
 */
function ShopMegaMenuItem({link}) {
  return (
    <div className="header-mega-menu-wrap">
      <NavLink className="header-menu-item" end prefetch="intent" to={link.to}>
        {link.label}
      </NavLink>
      <div className="header-mega-menu" aria-label="The Routine">
        <div className="header-mega-menu-intro">
          <p className="section-eyebrow">The Routine</p>
          <h3>
            Five pods. <em>One perfect finish.</em>
          </h3>
          <p>
            Single-dose detailing concentrates — drop, fill, shake. No
            measuring, no waste.
          </p>
          <div className="header-mega-menu-links">
            <NavLink to="/collections/all" className="hero-cta hero-cta-primary">
              Build your kit &rarr;
            </NavLink>
            <NavLink to="/collections/all?tab=Pods">Shop all pods</NavLink>
            <NavLink to="/collections/all?tab=Refills">
              Refill subscriptions
            </NavLink>
          </div>
        </div>
        <ol className="header-mega-menu-steps">
          {ROUTINE_STEPS.map((s) => (
            <li key={s.step}>
              <NavLink to="/collections/all?tab=Pods">
                <span className="header-mega-menu-step-label">{s.step}</span>
                <span className="header-mega-menu-step-name">{s.name}</span>
                <span className="header-mega-menu-step-price">{s.price}</span>
              </NavLink>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" className="header-cta-signin">
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M8.25 13.5C11.1495 13.5 13.5 11.1495 13.5 8.25C13.5 5.35051 11.1495 3 8.25 3C5.35051 3 3 5.35051 3 8.25C3 11.1495 5.35051 13.5 8.25 13.5Z"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path d="M12.375 12.375L15.75 15.75" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4.5 6H13.5L12.75 15H5.25L4.5 6Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 6V4.875C6.75 4.27826 6.98705 3.70597 7.40901 3.28401C7.83097 2.86205 8.40326 2.625 9 2.625C9.59674 2.625 10.169 2.86205 10.591 3.28401C11.0129 3.70597 11.25 4.27826 11.25 4.875V6"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset header-icon-button" onClick={() => open('search')} aria-label="Search">
      <SearchIcon />
    </button>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="header-icon-button header-cart"
      aria-label={`Cart, ${count} items`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <BagIcon />
      <span className="header-cart-count">{count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
