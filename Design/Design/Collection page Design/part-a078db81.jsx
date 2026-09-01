/* PEARLS — shared chrome (nav + mega menu, newsletter, footer). Copied from the
   v5 homepage bundle so internal pages stay independent of the homepage entry. */

function Glyph({ kind, style }) {
  const s = { width: 14, height: 14, display: 'inline-block', ...(style || {}) };
  if (kind === 'dot') return <span style={{ ...s, borderRadius: '50%', background: 'currentColor' }} />;
  if (kind === 'square') return <span style={{ ...s, background: 'currentColor' }} />;
  if (kind === 'diamond') return <span style={{ ...s, background: 'currentColor', transform: 'rotate(45deg)' }} />;
  return null;
}

const R = window.__resources || {};
const POD_IMG = [R.pod1, R.pod2, R.pod3, R.pod4, R.pod5];

function TopBar({ active = 'Shop' }) {
  const [shopOpen, setShopOpen] = React.useState(false);
  const closeTimer = React.useRef(null);
  const open = () => { clearTimeout(closeTimer.current); setShopOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setShopOpen(false), 140); };

  const pods = [
    { n: '01', name: 'Car Soap', tag: 'Wash', price: '$24', img: POD_IMG[0] },
    { n: '02', name: 'Exterior Cleaner', tag: 'Exterior', price: '$28', img: POD_IMG[1] },
    { n: '03', name: 'Tire & Wheels', tag: 'Tires', price: '$26', img: POD_IMG[2] },
    { n: '04', name: 'Glass Cleaner', tag: 'Glass', price: '$22', img: POD_IMG[3] },
    { n: '05', name: 'Interior Cleaner', tag: 'Interior', price: '$26', img: POD_IMG[4] },
  ];

  return (
    <>
      <div className="promo">
        <span>Free shipping over $60</span>
        <span className="sep">/</span>
        <span>Volume 01 — now shipping</span>
        <span className="sep">/</span>
        <span>Refill subscriptions ship free</span>
      </div>
      <nav className="nav" onMouseLeave={scheduleClose}>
        <div className="wrap nav-row">
          <div className="nav-left">
            <a className="nav-logo" href="PEARLS Homepage v5.html">
              <div className="pearls">PEARLS</div>
              <div className="by">by Car Brite</div>
            </a>
          </div>
          <div className="nav-links">
            <div className="nav-item" onMouseEnter={open}>
              <a className={`nav-link has-mega ${shopOpen || active === 'Shop' ? 'active' : ''}`}>
                Shop <span className="caret" aria-hidden="true">⌄</span>
              </a>
            </div>
            <a className="nav-link">How it Works</a>
            <a className="nav-link">About Us</a>
            <a className="nav-link">Contact Us</a>
          </div>
          <div className="nav-right nav-cta">
            <button className="nav-icon" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
            </button>
            <button className="nav-icon nav-cart" aria-label="Bag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
            </button>
          </div>
        </div>

        <div className={`mega ${shopOpen ? 'show' : ''}`} onMouseEnter={open}>
          <div className="wrap mega-inner">
            <div className="mega-rail">
              <div className="mega-eyebrow">The Routine</div>
              <h3 className="mega-title">Five pods.<br />One perfect finish.</h3>
              <p className="mega-copy">Single-dose detailing concentrates — drop, fill, shake. No measuring, no waste.</p>
              <a className="mega-railcta">Build your kit →</a>
              <a className="mega-raillink">Shop all pods</a>
              <a className="mega-raillink">Refill subscriptions</a>
            </div>
            <div className="mega-grid">
              {pods.map((p, i) => (
                <a className={`mega-card mc${i + 1}`} key={i}>
                  <div className="mc-img">
                    <span className="mc-step">Step {p.n}</span>
                    <img src={p.img} alt={p.name} />
                  </div>
                  <div className="mc-meta">
                    <div className="mc-tag">{p.tag}</div>
                    <div className="mc-name">{p.name}</div>
                    <div className="mc-price">{p.price}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function NewsAndFooter() {
  return (
    <>
      <section className="news">
        <div className="wrap news-inner">
          <div>
            <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-cyan)' }} />The drop list</div>
            <h2>Get a free<br />pod with your<br /><em>first order.</em></h2>
            <p>One email a month. New scents, garage tours, and the occasional 20% code. No spam, no sales-bro tone.</p>
            <form className="news-form" onSubmit={e => e.preventDefault()}>
              <input placeholder="you@yourgarage.com" />
              <button>Sign me up</button>
            </form>
          </div>
          <div className="news-stats">
            <div className="stat"><div className="v">1</div><div className="k">Free pod, first order</div></div>
            <div className="stat"><div className="v">4.9★</div><div className="k">Average rating</div></div>
            <div className="stat"><div className="v">1<span style={{ fontSize: 30 }}>/mo</span></div><div className="k">Emails, that&rsquo;s it</div></div>
            <div className="stat"><div className="v">0</div><div className="k">Single-use bottles</div></div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-grid">
          <div className="brand">
            <div className="pearls">PEARLS</div>
            <div className="by">Powered by Car Brite · est. 1947</div>
            <div className="desc">75 years of professional detailing chemistry, distilled into pods that fit a shelf in your garage.</div>
          </div>
          <div><h4>Shop</h4><ul><li>The full lineup</li><li>Starter kits</li><li>Refill pods</li><li>Accessories</li><li>Gift card</li></ul></div>
          <div><h4>Learn</h4><ul><li>How it works</li><li>Chemistry deep-dive</li><li>Detail journal</li></ul></div>
          <div><h4>Help</h4><ul><li>Contact</li><li>Subscriptions</li><li>Shipping &amp; returns</li><li>FAQs</li></ul></div>
          <div><h4>Company</h4><ul><li>About PEARLS</li><li>Car Brite parent</li><li>Careers</li><li>Press</li></ul></div>
        </div>
        <div className="wrap footer-bottom">
          <div>© 2026 Car Brite Industries · PEARLS™</div>
          <div>Indianapolis, IN · Made in USA</div>
        </div>
      </footer>
    </>
  );
}

Object.assign(window, { Glyph, TopBar, NewsAndFooter, POD_IMG });
