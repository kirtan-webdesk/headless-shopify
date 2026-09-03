import {useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.sitePage?.title ?? data?.page?.title ?? '';
  return [{title: `PEARLS by Car Brite | ${title}`}];
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
 * Site content pages (About, How it Works, Chemistry, Car Brite, Careers,
 * Press, Contact) are Metaobject-driven (site_page type), matching the
 * homepage's pattern -- structured fields, not a raw richtext blob. Falls
 * back to a native Shopify Page (if one exists for the handle) so this
 * route still works for any page created directly in Shopify Admin.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const {metaobject: sitePage} = await context.storefront.query(SITE_PAGE_QUERY, {
    variables: {handle: params.handle},
  });

  if (sitePage) {
    return {sitePage: metaobjectFieldsToObject(sitePage), page: null};
  }

  // Fallback: a real Shopify Page created directly in Admin (not this
  // project's site_page Metaobject content).
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle: params.handle},
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {sitePage: null, page};
}

/**
 * @param {{fields: {key: string; value: string}[]}} metaobject
 */
function metaobjectFieldsToObject(metaobject) {
  if (!metaobject) return null;
  return Object.fromEntries(metaobject.fields.map((f) => [f.key, f.value]));
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {sitePage, page} = useLoaderData();

  if (page) {
    // Native Shopify Page fallback -- unstyled richtext passthrough.
    return (
      <div className="page">
        <header>
          <h1>{page.title}</h1>
        </header>
        <main dangerouslySetInnerHTML={{__html: page.body}} />
      </div>
    );
  }

  const bodyParagraphs = (sitePage.body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="site-page">
      <header className="site-page-hero">
        <div className="hero-edge" />
        <div className="site-page-hero-inner">
          {sitePage.eyebrow && <p className="section-eyebrow">{sitePage.eyebrow}</p>}
          <h1>
            {sitePage.heading}{' '}
            {sitePage.heading_highlight && <em>{sitePage.heading_highlight}</em>}
          </h1>
          {sitePage.subtext && <p className="site-page-subtext">{sitePage.subtext}</p>}
        </div>
      </header>

      {bodyParagraphs.length > 0 && (
        <div className="site-page-body">
          <ul>
            {bodyParagraphs.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {sitePage.cta_label && sitePage.cta_link && (
        <div className="site-page-cta">
          <a className="hero-cta hero-cta-primary" href={sitePage.cta_link}>
            {sitePage.cta_label} &rarr;
          </a>
        </div>
      )}

      {/* Contact Us gets a real form below the shared header/body content --
          static per the same honest pattern as the homepage newsletter form:
          no email/CRM backend exists to submit to yet, so it doesn't fake a
          submission. */}
      {sitePage.title === 'Contact Us' && <ContactForm />}
    </div>
  );
}

function ContactForm() {
  return (
    <div className="site-page-contact-form">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="contact-form-row">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" required />
        </div>
        <div className="contact-form-row">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" required />
        </div>
        <div className="contact-form-row">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={5} required />
        </div>
        <button type="submit" className="hero-cta hero-cta-primary">
          Send message
        </button>
        <p className="contact-form-note">
          This form isn&rsquo;t connected to an inbox yet — email support directly in the meantime.
        </p>
      </form>
    </div>
  );
}

const SITE_PAGE_QUERY = `#graphql
  query SitePage($handle: String!) {
    metaobject(handle: {type: "site_page", handle: $handle}) {
      fields {
        key
        value
      }
    }
  }
`;

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
