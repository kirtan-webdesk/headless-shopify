/* PEARLS — Collections: Shop All */

const CATALOG = [
  { id: 'p1', kind: 'pod', step: '01', name: 'Car Soap', cls: 'c1', price: 24, meta: 'Makes 16 oz · 1 pod', desc: 'Foaming bucket wash. Lifts grime without stripping wax.', imgs: [POD_IMG[0]] },
  { id: 'p2', kind: 'pod', step: '02', name: 'Exterior Cleaner', cls: 'c2', price: 28, meta: 'Makes 16 oz · 1 pod', desc: 'Trim, paint, and bumpers. Cuts road film without the residue.', imgs: [POD_IMG[1]] },
  { id: 'p3', kind: 'pod', step: '03', name: 'Tire & Wheels', cls: 'c3', price: 26, meta: 'Makes 16 oz · 1 pod', desc: 'High-shine tire dressing. Sling-free and ceramic-safe.', imgs: [POD_IMG[2]] },
  { id: 'p4', kind: 'pod', step: '04', name: 'Glass Cleaner', cls: 'c4', price: 22, meta: 'Makes 16 oz · 1 pod', desc: 'Streak-free glass and crystal. Ammonia-free formula.', imgs: [POD_IMG[3]] },
  { id: 'p5', kind: 'pod', step: '05', name: 'Interior Cleaner', cls: 'c5', price: 26, meta: 'Makes 16 oz · 1 pod', desc: 'Dash, vinyl, and leather. Lifts grime to a matte finish.', imgs: [POD_IMG[4]] },
  { id: 'k1', kind: 'kit', tag: 'Kit · 5 pods', name: 'The Full Routine', cls: 'c3', price: 107, was: 126, meta: 'Pods 01–05 + reusable rack', desc: 'The whole car, start to shine. Our best value and the way most garages start.', imgs: [POD_IMG[2]] },
  { id: 'k2', kind: 'kit', tag: 'Kit · 3 pods', name: 'Exterior Kit', cls: 'c1', price: 72, was: 78, meta: 'Pods 01–03 + wash bottle', desc: 'Soap, exterior cleaner, and tire dressing — a full outside wash in one box.', imgs: [POD_IMG[0]] },
  { id: 'k3', kind: 'kit', tag: 'Kit · 2 pods', name: 'Interior Kit', cls: 'c5', price: 44, was: 48, meta: 'Pods 04–05 + cabin cloth', desc: 'Glass and interior cleaner for streak-free windows and a matte dash.', imgs: [POD_IMG[4]] },
  { id: 'k4', kind: 'kit', tag: 'Kit · 2 pods', name: 'Weekend Wash Kit', cls: 'c2', price: 58, was: 64, meta: 'Pods 01–02 + microfiber mitt', desc: 'The Saturday-morning pair. Everything a driveway wash actually needs.', imgs: [POD_IMG[1]] },
  { id: 'k5', kind: 'refill', tag: 'Refill · 6 pack', name: 'Car Soap Six-Pack', cls: 'c4', price: 126, was: 144, meta: '6 × pod 01 · six months of washes', desc: 'Stock the shelf. Six single-dose soap pods at the subscription rate.', imgs: [POD_IMG[0]] },
  { id: 'g1', kind: 'gear', tag: 'Gear', name: 'Starter Rack + Bottles', cls: 'c1', price: 34, meta: '5 bottles · powder-coated rack', desc: 'Five labelled 16-oz bottles and the wall rack they live on. Buy once.', imgs: [], ph: 'Rack + bottles product shot' },
  { id: 'g2', kind: 'kit', tag: 'Gift · Volume 01', name: 'The Volume 01 Gift Set', cls: 'c3', price: 118, was: 132, meta: 'Pods 01–05, boxed', desc: 'The full routine in a giftable case. Ships with a hand-signed lab card.', imgs: [], ph: 'Gift case product shot' },
];

const FILTERS = ['All products', 'Pods', 'Kits & bundles', 'Refills', 'Gear'];

function ProductCard({ p, showSave }) {
  const save = p.was ? Math.round(((p.was - p.price) / p.was) * 100) : 0;
  return (
    <article className={`pcol ${p.cls}`}>
      <div className="pc-img">
        <div className="pc-badges">
          {p.kind === 'pod'
            ? <span className="pc-step">Step {p.step}</span>
            : <span className="pc-step alt">{p.tag}</span>}
        </div>
        {showSave && save > 0 && <span className="pc-save">Save {save}%</span>}
        {p.imgs.length > 0
          ? <div className="pc-pods">{p.imgs.map((src, i) => <img key={i} src={src} alt="" />)}</div>
          : <div className="pc-ph"><span className="pc-ph-box" /><span className="pc-ph-lbl">{p.ph}</span></div>}
      </div>
      <div className="pc-body">
        <div className="pc-kicker">{p.kind === 'pod' ? `PEARLS ${p.step}` : p.tag}</div>
        <h3 className="pc-name">{p.name}</h3>
        <p className="pc-desc">{p.desc}</p>
        <div className="pc-meta">{p.meta}</div>
        <div className="pc-foot">
          <div className="pc-price">
            <span className="now">${p.price}</span>
            {p.was && <span className="was">${p.was}</span>}
          </div>
          <button className="pc-add">Add to bag</button>
          <a className="pc-amazon" href="#" aria-label={`Buy ${p.name} on Amazon`}><span className="a-smile">↗</span> Buy on Amazon</a>
        </div>
      </div>
    </article>
  );
}

function CollectionHeader({ style }) {
  const crumbs = (
    <div className="crumbs"><a>Home</a><span>/</span><a>Shop</a><span>/</span><em>Shop All</em></div>
  );
  const lede = 'Every pod, kit, and piece of gear in the PEARLS system — five single-dose concentrates built on 75 years of Car Brite lab chemistry, plus the bundles that put them together.';

  if (style === 'image') {
    return (
      <header className="chead ch-image">
        <div className="ch-media"><div className="ch-scrim" /></div>
        <div className="wrap ch-inner">
          {crumbs}
          <h1 className="display">Shop all</h1>
          <p className="ch-lede">{lede}</p>
        </div>
      </header>
    );
  }

  if (style === 'split') {
    return (
      <header className="chead ch-split">
        <div className="wrap ch-inner">
          <div>
            {crumbs}
            <h1 className="display">Shop<br />all.</h1>
            <p className="ch-lede">{lede}</p>
            <div className="ch-facts">
              <div className="f"><span className="v">5</span><span className="k">Pods · one routine</span></div>
              <div className="f"><span className="v">7</span><span className="k">Kits &amp; bundles</span></div>
              <div className="f"><span className="v">$60</span><span className="k">Free shipping over</span></div>
            </div>
          </div>
          <div className="ch-stage">
            <div className="ch-glow" />
            {POD_IMG.map((src, i) => <img key={i} className={`ch-pod cp${i + 1}`} src={src} alt="" />)}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="chead ch-band">
      <div className="wrap ch-inner">
        {crumbs}
        <div className="ch-row">
          <div>
            <h1 className="display">Shop all</h1>
          </div>
          <p className="ch-lede">{lede}</p>
        </div>
      </div>
    </header>
  );
}

function Toolbar({ cols }) {
  return (
    <div className="toolbar">
      <div className="wrap tb-row">
        <div className="tb-pills">
          {FILTERS.map((f, i) => (
            <button key={f} className={`pill ${i === 0 ? 'active' : ''}`}>{f}</button>
          ))}
        </div>
        <div className="tb-right">
          <span className="tb-count">12 products</span>
          <label className="tb-sort">
            <span>Sort</span>
            <select defaultValue="featured">
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="routine">Routine order</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

function Grid({ cols, showSave }) {
  return (
    <section className="grid-sec">
      <div className="wrap">
        <div className="pgrid-col" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
          {CATALOG.map(p => <ProductCard key={p.id} p={p} showSave={showSave} />)}
        </div>

        <div className="pager">
          <button className="pg-arrow" aria-label="Previous page">←</button>
          <button className="pg-num active">1</button>
          <button className="pg-num">2</button>
          <button className="pg-num">3</button>
          <button className="pg-arrow" aria-label="Next page">→</button>
        </div>
      </div>
    </section>
  );
}

function RoutineBar() {
  return (
    <section className="bundle-sec">
      <div className="wrap">
        <div className="routine-bar">
          <div className="rb-l">
            <div className="rb-title">The full routine — all 5 pods</div>
            <div className="rb-sub">Ships with the reusable rack · free over $60</div>
          </div>
          <div className="rb-r">
            <div className="rb-price">
              <div className="p"><span className="rb-now">$107</span><span className="rb-was">$126</span></div>
              <div className="rb-save">Save 15% vs. à la carte</div>
            </div>
            <div className="rb-cta">
              <button className="btn btn-primary btn-arrow">Add all 5</button>
              <a className="rb-amazon" href="#" aria-label="Buy the full routine on Amazon"><span className="a-smile">↗</span> Amazon</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubCollections() {
  const tiles = [
    { t: 'Exterior', s: 'Soap, paint, trim, bodywork', img: (window.__resources||{}).social1 },
    { t: 'Wheels & Tires', s: 'Sling-free gloss, ceramic-safe', img: (window.__resources||{}).social3 },
    { t: 'Interior', s: 'Glass, dash, vinyl, leather', ph: 'Interior cabin shot' },
  ];
  return (
    <section className="subcol">
      <div className="wrap">
        <div className="subcol-head">
          <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-magenta)' }} />Shop by surface</div>
          <h2>Know what you&rsquo;re after?</h2>
        </div>
        <div className="subcol-grid">
          {tiles.map((x, i) => (
            <a className={`sctile ${x.ph ? 'ph' : ''}`} key={i}
               style={x.img ? { backgroundImage: `url(${x.img})` } : undefined}>
              <div className="sc-scrim" />
              {x.ph && <div className="sc-ph-lbl">{x.ph}</div>}
              <div className="sc-meta">
                <div className="sc-t display">{x.t}</div>
                <div className="sc-s">{x.s}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionCopy() {
  return (
    <section className="colcopy">
      <div className="wrap colcopy-grid">
        <div>
          <div className="eyebrow" style={{ color: 'rgba(21,25,73,.5)' }}>
            <Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-magenta)' }} />About this collection
          </div>
          <h2>One system,<br /><em>twelve ways in.</em></h2>
        </div>
        <div className="cc-cols">
          <p>PEARLS is a five-pod detailing system. Each pod is a single-dose concentrate — pre-measured to the exact ratio a professional detailer would mix by hand — built for one surface and one job. Drop it in a reusable 16-oz bottle, add water, and the chemistry does the rest.</p>
          <p>Buying à la carte works if your car only needs one or two steps. Most people start with a kit: the Full Routine covers the entire vehicle, the Exterior Kit handles a driveway wash, and the Interior Kit takes care of glass and cabin. Every pod is pH-balanced, wax-safe, and ceramic-coating safe.</p>
          <p>Everything on this page is formulated and packed in the same Indianapolis facility Car Brite has run since 1947 — the lab dealerships, body shops, and concours detailers have trusted for three generations. Nothing here is re-labeled.</p>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { CATALOG, ProductCard, CollectionHeader, Toolbar, Grid, RoutineBar, SubCollections, CollectionCopy });


/* ── App entry ─────────────────────────────────────────────── */

const COLLECTION_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headerStyle": "band",
  "cols": 3,
  "showSave": true,
  "palette": "pearls"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(COLLECTION_DEFAULTS);

  React.useEffect(() => {
    document.body.setAttribute('data-palette', t.palette);
  }, [t.palette]);

  return (
    <>
      <TopBar active="Shop" />
      <main>
        <CollectionHeader style={t.headerStyle} />
        <div className="hero-edge" />
        <Toolbar cols={t.cols} />
        <Grid cols={t.cols} showSave={t.showSave} />
        <SubCollections />
        <CollectionCopy />
        <NewsAndFooter />
      </main>

      <TweaksPanel title="Collections Tweaks">
        <TweakSection label="Collection header">
          <TweakSelect
            label="Treatment"
            value={t.headerStyle}
            options={[
              { value: 'band', label: 'Navy band + intro' },
              { value: 'image', label: 'Full-bleed image banner' },
              { value: 'split', label: 'Split: copy + product stage' },
            ]}
            onChange={v => setTweak('headerStyle', v)}
          />
        </TweakSection>
        <TweakSection label="Grid">
          <TweakRadio label="Per row" value={t.cols} options={[3, 4]} onChange={v => setTweak('cols', Number(v))} />
          <TweakToggle label="Save % badges" value={t.showSave} onChange={v => setTweak('showSave', v)} />
        </TweakSection>
        <TweakSection label="Palette">
          <TweakRadio
            label="Accent system"
            value={t.palette}
            options={[
              { value: 'pearls', label: 'Pearls' },
              { value: 'sunset', label: 'Sunset' },
              { value: 'electric', label: 'Electric' },
            ]}
            onChange={v => setTweak('palette', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
