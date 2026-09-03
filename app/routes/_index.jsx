import {Await, useLoaderData, Link} from 'react-router';
import {Suspense, useState} from 'react';
import {Image} from '@shopify/hydrogen';
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
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {metaobject: homepage} = await context.storefront.query(
    HOMEPAGE_CONTENT_QUERY,
  );

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    homepage: metaobjectFieldsToObject(homepage),
  };
}

/**
 * Metaobject `fields` comes back as [{key, value, reference}, ...] -- flatten
 * to {key: value} so the component can read `homepage.hero_heading` directly.
 * `hero_image` is a file_reference field: `value` is just the raw MediaImage
 * GID, the actual resolved image (url/altText/width/height) lives under
 * `reference.image` -- surfaced separately as `homepage.heroImage`.
 * @param {{fields: {key: string; value: string; reference: {image: {url: string; altText: string|null; width: number; height: number}} | null}[]}} metaobject
 */
function metaobjectFieldsToObject(metaobject) {
  if (!metaobject) return null;
  const flat = Object.fromEntries(metaobject.fields.map((f) => [f.key, f.value]));
  const heroImageField = metaobject.fields.find((f) => f.key === 'hero_image');
  flat.heroImage = heroImageField?.reference?.image ?? null;
  return flat;
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      {data.isShopLinked ? null : <MockShopNotice />}
      <AnnouncementBar homepage={data.homepage} />
      <Hero homepage={data.homepage} />
      <div className="hero-edge" />
      <PodSystem />
      <BrandSection />
      <SubscriptionSection />
      <Testimonials />
      <FaqSection />
      <NewsletterSection />
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
 * The stat row underneath (5 / 75Y / 0%) is static per the reference --
 * not part of the Metaobject schema, since these are fixed brand facts,
 * not homepage-editorial content.
 * @param {{homepage: Record<string, string> | null}}
 */
function Hero({homepage}) {
  if (!homepage) {
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
        <dl className="hero-stats">
          <div>
            <dt>5</dt>
            <dd>Pods · one routine</dd>
          </div>
          <div>
            <dt>75Y</dt>
            <dd>Pro lab heritage</dd>
          </div>
          <div>
            <dt>0%</dt>
            <dd>Shipped as water</dd>
          </div>
        </dl>
      </div>
      {/* hero_image is a Metaobject field (file_reference) -- genuinely
          editable in Shopify admin with no deploy, per S2.2's acceptance
          criteria. Uploaded via scripts/upload-hero-image.mjs once the
          Admin API token had write_files scope. Falls back to the static
          reference asset only if the field is ever cleared in admin,
          so editing/removing it can never produce a broken image. */}
      <div className="hero-photo">
        {homepage.heroImage ? (
          <Image
            data={homepage.heroImage}
            aspectRatio="4/5"
            alt={
              homepage.heroImage.altText ||
              'A hand washing an orange car with PEARLS foaming soap'
            }
            sizes="(min-width: 60em) 50vw, 100vw"
            loading="eager"
          />
        ) : (
          <img
            src="/images/hero-car.jpg"
            alt="A hand washing an orange car with PEARLS foaming soap"
            width="800"
            height="1000"
            loading="eager"
          />
        )}
      </div>
    </section>
  );
}

// Static per the reference (Design/Design/Homepage Design/PEARLS-Homepage.html)
// -- these are 5 SPECIFIC named products the mockup requires, which don't
// exist on the wds55 dev store (it has generic snowboard demo data). Once
// the real Car Brite catalog is live with matching handles, this should
// become a real Storefront API product query (see collections.all.jsx for
// the pattern) rather than staying hardcoded. Flagged in HANDOFF.md.
// Gradients are the literal .pcard.c1-c5 values extracted from the
// decompressed mockup source (app-source.jsx), not sampled/approximated by
// eye -- each is a white radial highlight over the product's own linear
// gradient, per the mockup's .pcard .img background.
const PODS = [
  {
    step: 'Step 01',
    code: 'Pearls 01',
    name: 'Car Soap',
    description: 'Foaming bucket wash. Lifts grime without stripping wax.',
    price: '$24',
    image: '/images/pod-1.png',
    gradient:
      'radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.4), transparent 70%), linear-gradient(160deg, #73CDDA, #0a4a6e)',
  },
  {
    step: 'Step 02',
    code: 'Pearls 02',
    name: 'Exterior Cleaner',
    description: 'Trim, paint, and bumpers. Cuts road film without the residue.',
    price: '$28',
    image: '/images/pod-2.png',
    gradient:
      'radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.4), transparent 70%), linear-gradient(160deg, #8E4D9E, #4a166e)',
  },
  {
    step: 'Step 03',
    code: 'Pearls 03',
    name: 'Tire & Wheels',
    description: 'High-shine tire dressing. Sling-free and ceramic-safe.',
    price: '$26',
    image: '/images/pod-3.png',
    gradient:
      'radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.4), transparent 70%), linear-gradient(160deg, #644FA0, #33265E)',
  },
  {
    step: 'Step 04',
    code: 'Pearls 04',
    name: 'Glass Cleaner',
    description: 'Streak-free glass + crystal. Ammonia-free formula.',
    price: '$22',
    image: '/images/pod-4.png',
    gradient:
      'radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.4), transparent 70%), linear-gradient(160deg, #2E9BB0, #074c75)',
  },
  {
    step: 'Step 05',
    code: 'Pearls 05',
    name: 'Interior Cleaner',
    description: 'Dash, vinyl, and leather. Lifts grime to a matte finish.',
    price: '$26',
    image: '/images/pod-5.png',
    gradient:
      'radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,.4), transparent 70%), linear-gradient(160deg, #A8561E, #5A2E10)',
  },
];

function PodSystem() {
  return (
    <section className="pod-system" aria-labelledby="pod-system-heading">
      <p className="section-eyebrow">The pod system</p>
      <h2 id="pod-system-heading">
        Five pods <em>are</em> the routine.
      </h2>
      <p className="pod-system-intro">
        Each pod is a single-dose concentrate built for one surface. Drop one
        in your reusable bottle, add water, shake.
      </p>
      <dl className="pod-system-stats">
        <div>
          <dt>7</dt>
          <dd>
            <strong>Concentrate, not water</strong>
            <span>
              Pods ship dry — you add the water at home, not pay to truck it
              around.
            </span>
          </dd>
        </div>
        <div>
          <dt>0</dt>
          <dd>
            <strong>Measuring, ever</strong>
            <span>
              Each pod is pre-dosed to the exact ratio. Drop, fill, shake —
              done.
            </span>
          </dd>
        </div>
        <div>
          <dt>pH</dt>
          <dd>
            <strong>Balanced &amp; wax-safe</strong>
            <span>
              Tuned to protect ceramic coatings and the wax already on your
              paint.
            </span>
          </dd>
        </div>
        <div>
          <dt>75yr</dt>
          <dd>
            <strong>Pro-grade chemistry</strong>
            <span>
              The same lab formulas Car Brite has shipped to detailers since
              1947.
            </span>
          </dd>
        </div>
      </dl>

      <div className="pod-grid">
        {PODS.map((pod) => (
          <article className="pod-card" key={pod.code}>
            <div className="pod-card-media" style={{background: pod.gradient}}>
              <span className="collection-card-badge">{pod.step}</span>
              <img src={pod.image} alt={pod.name} width="320" height="320" loading="lazy" />
            </div>
            <p className="collection-card-category">{pod.code}</p>
            <h3 className="collection-card-title">{pod.name}</h3>
            <p className="collection-card-description">{pod.description}</p>
            <div className="collection-card-price">{pod.price}</div>
            <div className="collection-card-actions">
              <button
                type="button"
                className="collection-card-add"
                disabled
                title="This pod isn't in the live Shopify catalog yet — Add to bag activates automatically once the real product is added."
              >
                Add to bag
              </button>
              <a className="collection-card-amazon" href="#">
                <span>Buy {pod.name} on Amazon</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="pod-bundle-bar">
        <p className="pod-bundle-eyebrow">Best value · most popular</p>
        <h3>The full routine — all 5 pods</h3>
        <p className="pod-bundle-subtext">
          Ships with the reusable rack · free over $60
        </p>
        <div className="pod-bundle-price">
          <div className="pod-bundle-price-row">
            <span>$107</span>
            <span className="collection-card-price-compare">$126</span>
          </div>
          <span className="pod-bundle-save">Save 15% vs. à la carte</span>
        </div>
        <div className="pod-bundle-actions">
          <button
            type="button"
            className="hero-cta hero-cta-primary"
            disabled
            title="The 5 pods aren't in the live Shopify catalog yet — this activates automatically once the real products are added."
          >
            Add all 5
          </button>
          <a href="#">Buy the full routine on Amazon</a>
        </div>
      </div>
    </section>
  );
}

function BrandSection() {
  const crests = [
    {
      ico: '47',
      label: 'Founded 1947',
      sub: 'Indianapolis lab. Three generations of detailing chemists.',
    },
    {
      ico: '★',
      label: 'Pro-detailer trusted',
      sub: 'Same chemistry shipped to dealerships, body shops, and marinas.',
    },
    {
      ico: 'pH',
      label: 'Lab-tested',
      sub: 'Every pod batch tested for pH, viscosity, and surfactant load.',
    },
    {
      ico: 'US',
      label: 'Made in USA',
      sub: 'Formulated and bottled in Indiana — never re-labeled.',
    },
  ];
  return (
    <section className="brand-section" aria-labelledby="brand-heading">
      <div className="brand-section-copy">
        <p className="section-eyebrow">Powered by Car Brite</p>
        <h2 id="brand-heading">
          Pro-grade chemistry, <em>garage-ready format.</em>
        </h2>
        <p>
          PEARLS is built in the same Indiana facility Car Brite has run
          since 1947 — the lab dealerships, body shops, and marinas have
          trusted for three generations. We just packed it into a pod.
        </p>
        <div className="crests">
          {crests.map((c) => (
            <div className="crest" key={c.label}>
              <div className="ico">{c.ico}</div>
              <div>
                <div className="label">{c.label}</div>
                <div className="sub">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="brand-stats-panel">
        <p className="section-eyebrow">By the numbers</p>
        <div className="brand-stats-number">75</div>
        <p className="brand-stats-caption">
          Years of professional
          <br />
          detailing chemistry
        </p>
        <p className="brand-stats-sub">
          Three generations of chemists, one obsessive standard — now
          portioned into a single-dose pod.
        </p>
        <dl className="brand-stats-grid">
          <div>
            <dt>12k+</dt>
            <dd>Pro detailers using Car Brite</dd>
          </div>
          <div>
            <dt>142k</dt>
            <dd>Bottles in driveways</dd>
          </div>
          <div>
            <dt>0</dt>
            <dd>Re-labeled formulas</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

const FREQUENCIES = [
  {id: 'm', value: '4w', label: 'Monthly'},
  {id: 'q', value: '12w', label: 'Quarterly'},
  {id: 's', value: '24w', label: 'Seasonal'},
];

function SubscriptionSection() {
  const bullets = [
    {
      n: 1,
      name: 'Choose your cadence',
      copy: 'Monthly, quarterly, or seasonal — change anytime in two taps.',
    },
    {
      n: 2,
      name: '15% off every refill',
      copy: 'Plus first dibs on limited-edition scents and new pods.',
    },
    {
      n: 3,
      name: 'Cancel in one tap',
      copy: 'No phone calls. No win-back guilt. Promise.',
    },
  ];
  const [frequency, setFrequency] = useState('q');
  return (
    <section className="subscription-section" aria-labelledby="subscription-section-heading">
      <div className="subscribe-card">
        <div className="subscription-copy">
          <p className="section-eyebrow">Refill, don&rsquo;t replace</p>
          <h2 id="subscription-section-heading">
            Subscribe <em>to the shine.</em>
          </h2>
          <p>
            Your bottle is forever. Pods arrive every month, season, or
            whenever you say. Pause, skip, or swap pods any time.
          </p>
          <ul className="sub-bullets">
            {bullets.map((b) => (
              <li key={b.name}>
                <span className="sub-bullet-dot">{b.n}</span>
                <span>
                  <strong>{b.name}</strong>
                  <span>{b.copy}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="subscription-panel">
          <p className="section-eyebrow">Delivery frequency</p>
          <div className="subscription-frequency" role="radiogroup" aria-label="Delivery frequency">
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={frequency === f.id}
                className={
                  frequency === f.id
                    ? 'subscription-frequency-option subscription-frequency-active'
                    : 'subscription-frequency-option'
                }
                onClick={() => setFrequency(f.id)}
              >
                <span className="subscription-frequency-value">{f.value}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
          <div className="subscription-price">
            <span>$107</span>
            <span className="collection-card-price-compare">$126</span>
            <span className="pod-bundle-save">Save 15%</span>
          </div>
          <button
            type="button"
            className="hero-cta hero-cta-primary subscription-cta"
            disabled
            title="Subscriptions aren't live yet — this activates once the real PEARLS bundle exists as a product and Recharge selling plans are installed (S2.4, still pending)."
          >
            Start my subscription
          </button>
          <p className="subscription-fineprint">
            First box ships in 3 business days · cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const social = [
    {handle: '@audiboy.av', quote: 'Cleaner finish than my $300 detail.', by: 'Marcus · Brooklyn', image: '/images/social-1.jpg'},
    {handle: '@detailing_carla', quote: 'The pods feel illegal. In the best way.', by: 'Carla · Phoenix', image: '/images/social-2.jpg'},
    {handle: '@911_garage', quote: 'Wax-safe, ceramic-safe, sling-free. Real.', by: 'Devon · Austin', image: '/images/social-3.jpg'},
    {handle: '@theweekendwash', quote: "My wife stole pod #3 for her boots. Send help.", by: 'Theo · Portland', image: '/images/social-4.jpg'},
  ];
  const reviews = [
    {
      quote:
        'Replaces six bottles I had under the sink. Smells like a Bugatti showroom.',
      by: 'Sarah K. · Verified buyer',
    },
    {
      quote:
        'I detail for a living. These hold up next to the pro stuff. The pods are the gimmick that works.',
      by: 'Luis A. · Pro detailer',
    },
    {
      quote:
        'Bought it for the bottles. Stayed for the chemistry. Refills land like clockwork.',
      by: 'James R. · Subscriber, 8mo',
    },
  ];
  return (
    <section className="testimonials" aria-labelledby="testimonials-heading">
      <p className="section-eyebrow">Real garages</p>
      <h2 id="testimonials-heading">People keep filming their cars now.</h2>
      <p className="testimonials-count">14,000+ tagged posts</p>

      <div className="testimonials-social-grid">
        {social.map((s) => (
          <figure className="testimonial-social-card" key={s.handle}>
            <img
              src={s.image}
              alt={`Customer photo shared by ${s.handle}`}
              width="320"
              height="320"
              loading="lazy"
            />
            <figcaption>
              <span className="testimonial-handle">{s.handle}</span>
              <blockquote>&ldquo;{s.quote}&rdquo;</blockquote>
              <p className="testimonial-by">{s.by}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="testimonials-review-grid">
        {reviews.map((r) => (
          <figure className="testimonial-review-card" key={r.by}>
            <div className="testimonial-stars" aria-label="5 out of 5 stars">
              ★★★★★
            </div>
            <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
            <p className="testimonial-by">{r.by}</p>
          </figure>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: 'What exactly is in a PEARLS pod?',
    a: 'A pre-measured concentrate of pH-balanced surfactants, polymers, and protectants — the same chemistry Car Brite has shipped to professional detailers for 75 years, split into single-dose pods.',
  },
  {
    q: 'Are pods safe on ceramic coatings and wax?',
    a: 'Yes. Every pod in the routine is pH-balanced and wax-safe — none of them strip an existing wax or ceramic coating.',
  },
  {
    q: 'Do I really need all five pods?',
    a: 'No — pick the routine that matches your car. The Car Soap and Exterior Cleaner cover a full exterior wash on their own.',
  },
  {
    q: 'How long does one pod last?',
    a: 'Each pod makes one full 16-oz refill bottle. For a typical weekend wash, that’s 4-6 details depending on the pod.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Anytime, in one tap, no questions, no win-back call. You can also pause, skip, or swap pods between deliveries.',
  },
  {
    q: 'What’s the connection to Car Brite?',
    a: 'PEARLS is made in the same Indiana facility Car Brite has run since 1947. Same chemists. Same lab. New format.',
  },
];

function FaqSection() {
  // One-open-at-a-time accordion, first item open by default -- matches the
  // All answers collapsed by default per explicit user direction --
  // deviates from the mockup's React.useState(0) (first item open), which
  // is what Faq() in the decompressed source uses.
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="faq-intro">
        <p className="section-eyebrow">Questions, answered</p>
        <h2 id="faq-heading">Ask us anything.</h2>
        <p>
          Don&rsquo;t see your answer? We&rsquo;re a small team of detailers
          and chemists. We answer every email within a day.
        </p>
        <button type="button" className="hero-cta hero-cta-secondary">
          Talk to a detailer
        </button>
      </div>
      <dl className="faq-list">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div className={`faq-item${isOpen ? ' faq-item-open' : ''}`} key={item.q}>
              <dt>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  {item.q}
                  <span aria-hidden="true" className="faq-icon">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
              </dt>
              {isOpen && <dd>{item.a}</dd>}
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="newsletter-signup" aria-labelledby="newsletter-heading">
      <div className="newsletter-copy">
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

const HOMEPAGE_CONTENT_QUERY = `#graphql
  query HomepageContent {
    metaobject(handle: {type: "homepage_content", handle: "main-homepage"}) {
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
