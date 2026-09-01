
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow,
  TweakSlider, TweakToggle, TweakRadio, TweakSelect,
  TweakText, TweakNumber, TweakColor, TweakButton,
});


/* PEARLS by Car Brite — section components */

// ── Small icon glyphs (kept primitive: dot/diamond/square) ──
function Glyph({ kind, style }) {
  const s = { width: 14, height: 14, display: 'inline-block', ...(style || {}) };
  if (kind === 'dot') return <span style={{ ...s, borderRadius: '50%', background: 'currentColor' }} />;
  if (kind === 'square') return <span style={{ ...s, background: 'currentColor' }} />;
  if (kind === 'diamond') return <span style={{ ...s, background: 'currentColor', transform: 'rotate(45deg)' }} />;
  return null;
}

// ── Hero ───────────────────────────────────────────────────
// Drop your hero clip at pearls-v3/img/hero.mp4 and set HERO_VIDEO_SRC to its
// path — the looping video then replaces the still automatically. Left empty,
// the section shows the poster still (no 404).
const HERO_VIDEO_SRC = window.__resources.heroVideo;

// media: 'card'  → media fills the card beside the headline (default)
//        'bg'    → media fills the entire hero section
//        'photo' → force the still image (no video)
function HeroMedia({ media }) {
  const showVideo = media !== 'photo' && HERO_VIDEO_SRC;
  return (
    <div className="hero-photo">
      {showVideo && (
        <>
          <video className="hero-vid" autoPlay muted loop playsInline
                 poster={window.__resources.heroCar}
                 onError={(e) => { e.currentTarget.style.display = 'none'; }}>
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="vid-scrim" />
        </>
      )}
      <span className="spark s1" />
      <span className="spark s2" />
      <span className="spark s3" />
      <span className="spark s4" />
    </div>
  );
}

function Hero({ media = 'card' }) {
  const bg = media === 'bg';
  return (
    <section className={'hero' + (bg ? ' media-bg' : '')}>
      <div className="hero-grain" />
      {bg && <HeroMedia media={media} />}
      <div className="wrap hero-inner">
        <div>
          <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-cyan)' }} />Now shipping — Volume 01</div>
          <h1>The detail<br />in a <em>pearl.</em></h1>
          <p className="lead">
            A five-step pod system that turns 75 years of professional car-detailing
            chemistry into something you keep on a shelf in the garage. Pop. Spray. Shine.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-arrow">Shop the routine</button>
            <button className="btn btn-ghost">How it works</button>
          </div>
          <div className="hero-meta">
            <div className="m"><span className="v">5</span><span className="k">Pods · One routine</span></div>
            <div className="m"><span className="v">75<span style={{fontSize:24,verticalAlign:'super'}}>y</span></span><span className="k">Pro lab heritage</span></div>
            <div className="m"><span className="v">0<span style={{fontSize:24,verticalAlign:'super'}}>%</span></span><span className="k">Shipped as water</span></div>
          </div>
        </div>

        {!bg && (
          <div className="hero-stage">
            <HeroMedia media={media} />
          </div>
        )}
      </div>
    </section>
  );
}

// ── Press strip ────────────────────────────────────────────
function Press() {
  const logos = ['MotorTrend', 'Top Gear', 'Hagerty', 'GQ', 'Road & Track', 'Petrolicious'];
  return (
    <section className="press">
      <div className="wrap">
        <div className="press-row">
          <div className="label">Trusted by · since 1947</div>
          <div className="logos">
            {logos.map((l, i) => <span key={i}>{l}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trusted by Professionals (Car Brite heritage) ──────────
function TrustBlock() {
  const crests = [
    { ico: '47', label: 'Founded 1947', sub: 'Indianapolis lab. Three generations of detailing chemists.' },
    { ico: '★', label: 'Pro-detailer trusted', sub: 'Same chemistry shipped to dealerships, body shops, and marinas.' },
    { ico: 'pH', label: 'Lab-tested', sub: 'Every pod batch tested for pH, viscosity, and surfactant load.' },
    { ico: 'US', label: 'Made in USA', sub: 'Formulated and bottled in Indiana — never re-labeled.' },
  ];
  return (
    <section className="trust">
      <div className="wrap trust-grid">
        <div>
          <div className="eyebrow">
            <Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--green)' }} />
            Powered by Car Brite
          </div>
          <h2>Pro-grade chemistry,<br /><em>garage-ready format.</em></h2>
          <p>
            PEARLS is built in the same Indiana facility Car Brite has run
            since 1947 — the lab dealerships, body shops, and concours detailers
            have trusted for three generations. We just packed it into a pod.
          </p>
          <div className="crests">
            {crests.map((c, i) => (
              <div className="crest" key={i}>
                <div className="ico">{c.ico}</div>
                <div>
                  <div className="label">{c.label}</div>
                  <div className="sub">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trust-stat">
          <div>
            <div className="eyebrow" style={{ color: 'var(--green)' }}>
              <Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--green)' }} />
              By the numbers
            </div>
            <div className="stat-big">75</div>
            <div className="stat-k">Years of professional<br />detailing chemistry</div>
            <div className="stat-sub">Three generations of chemists, one obsessive standard — now portioned into a single-dose pod.</div>
          </div>
          <div className="stat-row">
            <div className="c"><div className="v">12k+</div><div className="k">Pro detailers using Car Brite</div></div>
            <div className="c"><div className="v">142k</div><div className="k">Bottles in driveways</div></div>
            <div className="c"><div className="v">0</div><div className="k">Re-labeled formulas</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pod system + Routine (one shoppable list) ──────────────
function SystemRoutine() {
  const principles = [
    { k: '7', u: '×', t: 'Concentrate, not water', s: 'Pods ship dry — you add the water at home, not pay to truck it around.' },
    { k: '0', u: '', t: 'Measuring, ever', s: 'Each pod is pre-dosed to the exact ratio. Drop, fill, shake — done.' },
    { k: 'pH', u: '', t: 'Balanced & wax-safe', s: 'Tuned to protect ceramic coatings and the wax already on your paint.' },
    { k: '75', u: 'yr', t: 'Pro-grade chemistry', s: 'The same lab formulas Car Brite has shipped to detailers since 1947.' },
  ];
  const list = [
    { n: 1, name: 'Car Soap', cls: 'c1', price: '$24', surface: 'Bucket wash', img: window.__resources.pod1, desc: 'Foaming bucket wash. Lifts grime without stripping wax.' },
    { n: 2, name: 'Exterior Cleaner', cls: 'c2', price: '$28', surface: 'Paint + trim', img: window.__resources.pod2, desc: 'Trim, paint, and bumpers. Cuts road film without the residue.' },
    { n: 3, name: 'Tire & Wheels', cls: 'c3', price: '$26', surface: 'Black, glossy', img: window.__resources.pod3, desc: 'High-shine tire dressing. Sling-free and ceramic-safe.' },
    { n: 4, name: 'Glass Cleaner', cls: 'c4', price: '$22', surface: 'Streak-free', img: window.__resources.pod4, desc: 'Streak-free glass + crystal. Ammonia-free formula.' },
    { n: 5, name: 'Interior Cleaner', cls: 'c5', price: '$26', surface: 'Cabin + leather', img: window.__resources.pod5, desc: 'Dash, vinyl, and leather. Lifts grime to a matte finish.' },
  ];

  return (
    <section className="system">
      <div className="wrap">
        {/* ── Header — the idea + why pods ── */}
        <div className="sys-top">
          <div>
            <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-magenta)' }} />The pod system</div>
            <h2>Five pods <em>are</em><br />the routine.</h2>
            <p className="sys-lead">
              Each pod is a single-dose concentrate built for one surface. Drop one in your
              reusable bottle, add water, and the pro-grade chemistry goes to work. Run all
              five and you&rsquo;ve detailed the whole car, start to shine.
            </p>
          </div>
          <div className="sys-why">
            {principles.map((p, i) => (
              <div className="pr" key={i}>
                <div className="pr-k">{p.k}{p.u && <span className="u">{p.u}</span>}</div>
                <div className="pr-t">{p.t}</div>
                <div className="pr-s">{p.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── The routine — product cards + bundle bar underneath ── */}
        <div className="routine">
          <div className="pgrid">
            {list.map((p, i) => (
              <div className={`pcard ${p.cls}`} key={i}>
                <div className="img">
                  <div className="step-tag">Step 0{p.n}</div>
                  <img className="pod-photo" src={p.img} alt={p.name} />
                </div>
                <div className="body">
                  <div className="sub">Pearls 0{p.n}</div>
                  <div className="name">{p.name}</div>
                  <div className="desc">{p.desc}</div>
                  <div className="foot">
                    <div className="price">{p.price}</div>
                    <button className="add">Add to bag</button>
                    <a className="amazon-link" href="#" aria-label={`Buy ${p.name} on Amazon`}>
                      <span className="a-smile">↗</span> Buy on Amazon
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="routine-bar">
            <div className="rb-l">
              <div className="rb-eyebrow"><Glyph kind="diamond" style={{ width: 7, height: 7, color: 'var(--green)' }} />Best value · most popular</div>
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
      </div>
    </section>
  );
}

// ── 1 2 3 4 walkthrough ────────────────────────────────────
function Steps() {
  const steps = [
    { n: 1, name: 'Car Soap', desc: 'Foaming wash pod. Drop in a bucket, dilute, wash.', cls: 's1' },
    { n: 2, name: 'Exterior Cleaner', desc: 'Trim, paint, bumpers. Cuts road film without stripping wax.', cls: 's2' },
    { n: 3, name: 'Tire & Wheels', desc: 'High-shine tire dressing. Sling-free, ceramic-safe.', cls: 's3' },
    { n: 4, name: 'Glass Cleaner', desc: 'Streak-free glass + interior crystal. Ammonia-free.', cls: 's4' },
    { n: 5, name: 'Interior Cleaner', desc: 'Dash, vinyl, and leather. Lifts grime, leaves a matte finish.', cls: 's5' },
  ];
  return (
    <section className="steps">
      <div className="wrap steps-head">
        <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-cyan)' }} />The routine</div>
        <h2>Five steps. Done by lunch.</h2>
        <p>Each pod handles one job — color-coded so you can&rsquo;t mix them up. Run them in order, top to bottom, and you&rsquo;ll never miss a surface.</p>
      </div>
      <div className="steps-grid">
        {steps.map((s, i) => (
          <div className={`step ${s.cls}`} key={i}>
            <div className="pattern">
              <svg viewBox="0 0 200 280" preserveAspectRatio="none">
                {Array.from({ length: 12 }).map((_, j) => (
                  <path key={j}
                    d={`M -20 ${j * 28 + 8} Q 100 ${j * 28 - 8} 220 ${j * 28 + 8}`}
                    fill="none" stroke="white" strokeWidth="14" />
                ))}
              </svg>
            </div>
            <div className="top">
              <span>Step {s.n}</span>
              <span>· Pearls 0{s.n}</span>
            </div>
            <div className="num-huge">{s.n}</div>
            <div>
              <div className="name">{s.name}</div>
              <div className="desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── The Routine + Shop (combined) ──────────────────────────
function Products() {
  const list = [
    { n: 1, name: 'Car Soap', cls: 'c1', price: '$24', img: window.__resources.pod1, desc: 'Foaming bucket wash. Lifts grime without stripping wax.' },
    { n: 2, name: 'Exterior Cleaner', cls: 'c2', price: '$28', img: window.__resources.pod2, desc: 'Trim, paint, and bumpers. Cuts road film without the residue.' },
    { n: 3, name: 'Tire & Wheels', cls: 'c3', price: '$26', img: window.__resources.pod3, desc: 'High-shine tire dressing. Sling-free and ceramic-safe.' },
    { n: 4, name: 'Glass Cleaner', cls: 'c4', price: '$22', img: window.__resources.pod4, desc: 'Streak-free glass + crystal. Ammonia-free formula.' },
    { n: 5, name: 'Interior Cleaner', cls: 'c5', price: '$26', img: window.__resources.pod5, desc: 'Dash, vinyl, and leather. Lifts grime to a matte finish.' },
  ];

  return (
    <section className="products">
      <div className="wrap">
        <div className="head">
          <div>
            <div className="eyebrow" style={{ color: 'rgba(21,25,73,.5)' }}>
              <Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-magenta)' }} />The routine
            </div>
            <h2>Five steps.<br />One perfect finish.</h2>
          </div>
          <p className="head-lede">Each pod handles one job — color-coded so you can&rsquo;t mix them up. Run them in order, top to bottom, or add just the ones your car needs.</p>
        </div>

        <div className="pgrid">
          {list.map((p, i) => (
            <div className={`pcard ${p.cls}`} key={i}>
              <div className="img">
                <div className="step-tag">Step 0{p.n}</div>
                <img className="pod-photo" src={p.img} alt={p.name} />
              </div>
              <div className="body">
                <div className="sub">Pearls 0{p.n}</div>
                <div className="name">{p.name}</div>
                <div className="desc">{p.desc}</div>
                <div className="foot">
                  <div className="price">{p.price}</div>
                  <button className="add">Add to bag</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Build-your-kit ─────────────────────────────────────────
function KitBuilder() {
  const items = [
    { n: 1, cls: 's1', name: 'Car Soap', desc: 'Bucket wash', price: 24 },
    { n: 2, cls: 's2', name: 'Exterior Cleaner', desc: 'Paint + trim', price: 28 },
    { n: 3, cls: 's3', name: 'Tire & Wheels', desc: 'Black, glossy', price: 26 },
    { n: 4, cls: 's4', name: 'Glass Cleaner', desc: 'Streak-free', price: 22 },
    { n: 5, cls: 's5', name: 'Interior Cleaner', desc: 'Cabin + leather', price: 26 },
  ];
  const [picked, setPicked] = React.useState({ 1: true, 2: true, 3: true, 4: true, 5: true });
  const toggle = (n) => setPicked(p => ({ ...p, [n]: !p[n] }));
  const chosen = items.filter(i => picked[i.n]);
  const subtotal = chosen.reduce((a, b) => a + b.price, 0);
  const save = Math.round(subtotal * 0.15);
  const total = subtotal - save;

  return (
    <section className="kit">
      <div className="wrap kit-grid">
        <div>
          <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-cyan)' }} />Build your kit</div>
          <h2>Your garage,<br />your routine.</h2>
          <p className="lead">
            Pick the pods that match your weekend. The starter rack and reusable
            bottles ship free — refills arrive on your schedule.
          </p>
          <div className="kit-picker">
            {items.map((it) => (
              <div key={it.n} className={`kit-row ${it.cls} ${picked[it.n] ? 'on' : ''}`} onClick={() => toggle(it.n)}>
                <div className="kn">{it.n}</div>
                <div>
                  <div className="kname">{it.name}</div>
                  <div className="kdesc">{it.desc}</div>
                </div>
                <div className="kprice">${it.price}</div>
                <div className="check">{picked[it.n] ? '✓' : ''}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="kit-summary">
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            <Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-magenta)' }} />Your routine
          </div>
          <div className="row"><span>{chosen.length} pods selected</span><span>${subtotal}</span></div>
          <div className="row"><span>Reusable bottle rack</span><span style={{ color: 'var(--p-mint)' }}>Free</span></div>
          <div className="row"><span>Bundle discount</span><span style={{ color: 'var(--p-mint)' }}>− ${save}</span></div>
          <div className="row"><span>Shipping</span><span style={{ color: 'var(--p-mint)' }}>Free over $60</span></div>
          <div className="total">
            <div>
              <div className="l">Total today</div>
              <div className="save">Save 15% as a bundle</div>
            </div>
            <div className="v">${total}</div>
          </div>
          <button className="btn btn-accent btn-arrow" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}>Add my kit to bag</button>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginTop: 14, textAlign: 'center' }}>
            Ships free · 60-day returns · no subscription required
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Subscription ──────────────────────────────────────────
function Subscribe() {
  const [freq, setFreq] = React.useState('q');
  return (
    <section className="subscribe">
      <div className="wrap">
        <div className="subscribe-card">
          <div className="sub-left">
            <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-cyan)' }} />Refill, don&rsquo;t replace</div>
            <h2>Subscribe<br />to the shine.</h2>
            <p>Your bottle is forever. Pods arrive every month, season, or whenever you say. Pause, skip, swap pods — no awkward emails required.</p>
            <div className="sub-bullets">
              <div className="b"><div className="dot">1</div><div><strong>Choose your cadence</strong><span>Monthly, quarterly, or seasonal — change anytime in two taps.</span></div></div>
              <div className="b"><div className="dot">2</div><div><strong>15% off every refill</strong><span>Plus first dibs on limited-edition scents and new pods.</span></div></div>
              <div className="b"><div className="dot">3</div><div><strong>Cancel in one tap</strong><span>No phone calls. No win-back guilt. Promise.</span></div></div>
            </div>
          </div>
          <div className="sub-right">
            <div className="eyebrow">Delivery frequency</div>
            <div className="freq">
              {[
                { id: 'm', v: '4w', k: 'Monthly' },
                { id: 'q', v: '12w', k: 'Quarterly' },
                { id: 's', v: '24w', k: 'Seasonal' },
              ].map(o => (
                <div key={o.id} className={`opt ${freq === o.id ? 'on' : ''}`} onClick={() => setFreq(o.id)}>
                  <div className="v">{o.v}</div>
                  <div className="k">{o.k}</div>
                </div>
              ))}
            </div>
            <div className="sub-price">
              <div className="now">$107</div>
              <div className="was">$126</div>
              <div className="pct">Save 15%</div>
            </div>
            <div className="sub-cancel">First box ships in 3 business days · cancel anytime</div>
            <button className="btn btn-primary btn-arrow" style={{ marginTop: 14, justifyContent: 'center' }}>Start my subscription</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── UGC + Reviews ──────────────────────────────────────────
function Ugc() {
  const cards = [
    { cls: 'u1', handle: '@audiboy.av', q: 'Cleaner finish than my $300 detail.', who: 'Marcus · Brooklyn', img: window.__resources.social1 },
    { cls: 'u2', handle: '@detailing_carla', q: 'The pods feel illegal. In the best way.', who: 'Carla · Phoenix', img: window.__resources.social2 },
    { cls: 'u3', handle: '@911_garage', q: 'Wax-safe, ceramic-safe, sling-free. Real.', who: 'Devon · Austin', img: window.__resources.social3 },
    { cls: 'u4', handle: '@theweekendwash', q: 'My wife stole pod #3 for her boots. Send help.', who: 'Theo · Portland', img: window.__resources.social4 },
  ];
  const reviews = [
    { q: 'Replaces six bottles I had under the sink. Smells like a Bugatti showroom.', who: 'Sarah K. · Verified buyer' },
    { q: 'I detail for a living. These hold up next to the pro stuff. The pods are the gimmick that works.', who: 'Luis A. · Pro detailer' },
    { q: 'Bought it for the bottles. Stayed for the chemistry. Refills land like clockwork.', who: 'James R. · Subscriber, 8mo' },
  ];
  return (
    <section className="ugc">
      <div className="wrap">
        <div className="head">
          <div>
            <div className="eyebrow"><Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-cyan)' }} />Real garages</div>
            <h2>People keep filming<br />their cars now.</h2>
          </div>
          <div className="scroll-hint">14,000+ tagged posts</div>
        </div>
        <div className="ugc-grid">
          {cards.map((c, i) => (
            <div className={`ucard ${c.cls}`} key={i}
                 style={{ backgroundImage: `url(${c.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="handle">{c.handle}</div>
              <div className="quote">
                <div className="q">&ldquo;{c.q}&rdquo;</div>
                <div className="who">{c.who}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="reviews-strip">
          {reviews.map((r, i) => (
            <div className="rcard" key={i}>
              <div className="stars">★ ★ ★ ★ ★</div>
              <div className="q">&ldquo;{r.q}&rdquo;</div>
              <div className="who">{r.who}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────
function Faq() {
  const items = [
    { q: 'What exactly is in a PEARLS pod?', a: 'A pre-measured concentrate of pH-balanced surfactants, polymers, and protectants — the same chemistry classes Car Brite has shipped to professional detailers for 75 years. The film dissolves in water. The chemistry goes to work.' },
    { q: 'Are pods safe on ceramic coatings and wax?', a: 'Yes. Every pod in the routine is pH-balanced and wax-safe — none of them strip an existing wax or ceramic coating. The Exterior Cleaner cuts road film and grime while leaving your protection layer intact.' },
    { q: 'Do I really need all five pods?', a: 'No — pick the routine that matches your car. The Car Soap and Exterior Cleaner cover a full exterior wash; add the Tire & Wheels pod for glossy rubber, the Glass Cleaner for streak-free windows, and the Interior Cleaner for dash, vinyl, and leather.' },
    { q: 'How long does one pod last?', a: 'Each pod makes one full 16-oz refill bottle. For a typical weekend wash, that\u2019s 4-6 details depending on vehicle size.' },
    { q: 'Can I cancel my subscription?', a: 'Anytime, in one tap, no questions, no win-back call. You can also pause, skip, or swap pods between boxes.' },
    { q: 'What\u2019s the connection to Car Brite?', a: 'PEARLS is made in the same Indiana facility Car Brite has run since 1947. Same chemists. Same lab. New format, built for your garage instead of a body shop.' },
  ];
  const [open, setOpen] = React.useState(0);
  return (
    <section className="faq">
      <div className="wrap faq-grid">
        <div className="side">
          <div className="eyebrow" style={{ color: 'rgba(21,25,73,.5)' }}>
            <Glyph kind="diamond" style={{ width: 8, height: 8, marginRight: 10, color: 'var(--p-magenta)' }} />Questions, answered
          </div>
          <h2>Ask us<br />anything.</h2>
          <p>Don&rsquo;t see your answer? We&rsquo;re a small team of detailers and chemists. We answer every email within a day.</p>
          <button className="btn btn-dark btn-arrow">Talk to a detailer</button>
        </div>
        <div className="faq-list">
          {items.map((it, i) => (
            <div className={`faq-item ${open === i ? 'open' : ''}`} key={i} onClick={() => setOpen(open === i ? -1 : i)}>
              <div className="q"><span>{it.q}</span><span className="toggle">+</span></div>
              <div className="a">{it.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter + Footer ───────────────────────────────────
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
            <div className="stat"><div className="v">1<span style={{fontSize:30}}>/mo</span></div><div className="k">Emails, that&rsquo;s it</div></div>
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
          <div>
            <h4>Shop</h4>
            <ul>
              <li>The full lineup</li>
              <li>Starter kits</li>
              <li>Refill pods</li>
              <li>Accessories</li>
              <li>Gift card</li>
            </ul>
          </div>
          <div>
            <h4>Learn</h4>
            <ul>
              <li>How it works</li>
              <li>Chemistry deep-dive</li>
              <li>Detail journal</li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li>Contact</li>
              <li>Subscriptions</li>
              <li>Shipping &amp; returns</li>
              <li>FAQs</li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>About PEARLS</li>
              <li>Car Brite parent</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <div>© 2026 Car Brite Industries · PEARLS™</div>
          <div>Indianapolis, IN · Made in USA</div>
        </div>
      </footer>
    </>
  );
}

// ── Nav + promo bar ────────────────────────────────────────
function TopBar() {
  const [shopOpen, setShopOpen] = React.useState(false);
  const closeTimer = React.useRef(null);

  const open = () => { clearTimeout(closeTimer.current); setShopOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setShopOpen(false), 140); };

  const pods = [
    { n: '01', name: 'Car Soap', tag: 'Wash', price: '$24', img: window.__resources.pod1 },
    { n: '02', name: 'Exterior Cleaner', tag: 'Exterior', price: '$28', img: window.__resources.pod2 },
    { n: '03', name: 'Tire & Wheels', tag: 'Tires', price: '$26', img: window.__resources.pod3 },
    { n: '04', name: 'Glass Cleaner', tag: 'Glass', price: '$22', img: window.__resources.pod4 },
    { n: '05', name: 'Interior Cleaner', tag: 'Interior', price: '$26', img: window.__resources.pod5 },
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
            <div className="nav-logo">
              <div className="pearls">PEARLS</div>
              <div className="by">by Car Brite</div>
            </div>
          </div>
          <div className="nav-links">
            <div className="nav-item" onMouseEnter={open}>
              <a className={`nav-link has-mega ${shopOpen ? 'active' : ''}`}>
                Shop <span className="caret" aria-hidden="true">⌄</span>
              </a>
            </div>
            <a className="nav-link">How it Works</a>
            <a className="nav-link">About Us</a>
            <a className="nav-link">Contact Us</a>
          </div>
          <div className="nav-right nav-cta">
            <button className="nav-icon" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
            <button className="nav-icon nav-cart" aria-label="Bag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
              </svg>
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

Object.assign(window, { Hero, HeroMedia, Press, SystemRoutine, Steps, Products, KitBuilder, Subscribe, Ugc, Faq, NewsAndFooter, TopBar });


/* PEARLS — app entry. Wires sections + tweaks. */

const PEARLS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "pearls",
  "heroMedia": "card",
  "showGrain": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(PEARLS_DEFAULTS);

  // Apply palette to body
  React.useEffect(() => {
    document.body.setAttribute('data-palette', t.palette);
  }, [t.palette]);

  // Toggle grain
  React.useEffect(() => {
    document.querySelectorAll('.hero-grain').forEach(el => {
      el.style.display = t.showGrain ? '' : 'none';
    });
  }, [t.showGrain]);

  return (
    <>
      <TopBar />
      <main>
        <Hero media={t.heroMedia} />
        <div className="hero-edge" />
        <SystemRoutine />
        <TrustBlock />
        <Subscribe />
        <Ugc />
        <Faq />
        <NewsAndFooter />
      </main>

      <TweaksPanel title="PEARLS Tweaks">
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
        <TweakSection label="Hero">
          <TweakSelect
            label="Video placement"
            value={t.heroMedia}
            options={[
              { value: 'card', label: 'Beside the headline' },
              { value: 'bg', label: 'Full-section background' },
              { value: 'photo', label: 'Still image (no video)' },
            ]}
            onChange={v => setTweak('heroMedia', v)}
          />
          <TweakToggle
            label="Film grain overlay"
            value={t.showGrain}
            onChange={v => setTweak('showGrain', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
