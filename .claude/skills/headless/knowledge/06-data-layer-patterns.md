---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "code-production", "agent-code-review", "g4-sprint-qa"]
description: "Cross-architecture data-layer patterns for the Headless arm. Where a query is allowed to live, the loader/RSC boundary per architecture, query shape and the BigCommerce complexity ceiling, fragment and colocation discipline, pagination, the N+1 waterfall, error and partial-data handling, mutation and cart-write rules, and caching keys. Enforces HL-CACHE-001/002, HL-SEC-004 and HL-CART-002 at the point where queries are written."
applies_to: [headless]
decision_refs: [D-HL-SPEC-01, D-HL-SEC-01, D-HL-STACK-01, D-HL-ENV-01, D-KB-FIDELITY-01]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# 06 — Data Layer Patterns (Headless)

> Cross-architecture. Where a rule differs by architecture it is marked **A/B**, **C** or **D**.
>
> Every limit quoted here has an entry in `pointers/verified-facts.md` (`HEADLESS-HALLUCINATION-01`). **No API field, argument or connection name in this file is invented** — where a shape is illustrative rather than verified, it says so.

---

## 1. The one rule the rest follows from

**Commerce data is fetched on the server. Always.**

In a theme, Liquid ran on Shopify's server and there was no other option. Headless hands you a browser that *can* fetch, and that capability is the source of most of this file's failure modes: a token in the bundle, an unrate-limited proxy, a cart total the client computed, a cache key that forgot the session.

| Where the query runs | Verdict |
|---|---|
| Server loader / RSC / route handler | **Correct.** Default for everything. |
| Browser, with the **public** Storefront token, read-only catalog | **Allowed** where the data is genuinely public and the interaction genuinely needs it — typeahead search, infinite scroll. |
| Browser, with any other token | **Forbidden.** `HL-SEC-001` / `HL-SEC-002`. |
| Browser, any write | **Forbidden.** Writes go through a server route you control and rate-limit (`HL-SEC-004`). |

The browser-fetch exception is narrower than it looks. Ask what happens when the third-party or the API is slow: if the answer is "the page is broken rather than degraded," it belongs on the server.

---

## 2. The fetch boundary, per architecture

| | Where server data is fetched | The trap |
|---|---|---|
| **A / B** — Hydrogen | Route `loader`. Storefront client comes from the Hydrogen context. | Fetching in a component instead of the loader — it still works, and it serialises your waterfall. |
| **C** — Next.js App Router | Server Component, or a route handler. `@shopify/hydrogen-react` supplies the data layer; **routes, caching, redirects and SEO are yours** (`00-overview.md` §2). | Marking a component `"use client"` high in the tree and pulling everything below it into the browser. |
| **D** — Catalyst | Server Component. **Private** token, server-env only (`HL-SEC-006`). | Reaching for a storefront token because a tutorial used one. |

**A and B are the same code.** B differs in *hosting* and in the custom server entry (`D-HL-ENV-01` B3/B4), not in how a query is written. If a data-layer pattern differs between A and B, that is a finding, not a style choice.

---

## 3. Query shape

### Ask for what renders. Nothing else.

Over-fetching is not a rounding error in this arm — on BigCommerce it is a hard ceiling, and on Oxygen it is bundle weight and CPU against a 30 s budget.

**D — the ceiling is verified and it is about shape, not volume** (register §9b):

| Limit | Value |
|---|---|
| Query complexity | **10,000** per request |
| Query depth | **16** |
| Request-count quota | **None documented** |
| Plan gate | **None** |

A rate limit does not protect you here. **Complexity does.** The deepest planned query is checked at preflight (`D-HL-ENV-01` D4), and every nested connection multiplies: a products connection containing a variants connection containing a metafields connection is three multiplied levels before you have rendered anything.

The practical discipline for D: **flatten before you nest.** Two shallow queries usually cost less complexity than one deep one, and they parallelise.

### Page size

Never request a connection without an explicit `first`. An unbounded connection is a query whose cost is set by the client's catalogue, not by your design — it passes review on a dev store with 20 products and fails on a real one.

Pick page size from what the page renders, not from a round number.

---

## 4. Fragments and colocation

**Colocate the fragment with the component that renders it.** The component that needs the field owns the fragment that requests it; the route composes fragments rather than enumerating fields.

Why it matters more here than in a generic React app: when a component's data needs change, an enumerated field list in a route gets updated by whoever remembers. A colocated fragment gets updated by the person changing the component, because the two are in the same file.

Rules:

- One fragment per component that fetches. Name it after the component.
- **A fragment is not a place to add fields "in case."** Every field in a fragment is a field in every query that spreads it, and on D that is complexity you spend on every request.
- Shared fragments live next to the shared type they describe — not in a `queries.ts` grab-bag, which becomes a union of every field anyone ever needed.
- Do not spread a fragment into a query that renders a different surface to save writing a second fragment. That is how a product-card query starts fetching full descriptions.

---

## 5. The waterfall

The dominant performance failure in this arm is not a slow query. It is **serialised queries that had no reason to be sequential.**

- Independent queries in one route are issued **concurrently**, not awaited one at a time.
- A query that depends on a previous query's result is a real dependency; a query that merely appears after another one is not.
- **The N+1 shape to watch:** fetch a collection, then fetch each product in a loop. In a theme this was invisible because Liquid ran next to the data. Here every iteration is a network round trip from your server to the platform.
- **A/B:** parallel loaders per route segment are the framework's answer — use them rather than one loader that awaits four things in order.
- **C/D:** concurrent Server Component fetches, and be deliberate about which boundaries suspend. A `<Suspense>` boundary around a slow non-critical query is the difference between a fast page with a loading area and a slow page.

Measure this the only way that works: look at the server's outbound request timeline for one route render. If the requests are stair-stepped and nothing forced them to be, that is the finding.

---

## 6. Errors and partial data

GraphQL returns **200 with an `errors` array**. A fetch wrapper that only checks HTTP status reports success on a failed query, and the page renders with holes.

Rules:

- Check the `errors` array on every response. Always.
- **Partial data is a decision, not a default.** For each query, decide whether a partial result renders degraded or fails the route — and write the decision down. Silently rendering a product page with no price is the worst of the three options.
- Never surface a raw GraphQL error to a customer. Log it server-side with enough context to find the query, and **never log the cart ID** (`HL-CART-001`).
- A third-party enrichment call in the render path needs an explicit degradation behaviour. `D-HL-APPS-01` gate question 5, verbatim: *"What happens on failure? If the app's service is down or rate-limited, does the storefront degrade or does the page fail? A hard dependency on a third-party service in the render path is an availability decision that must be named."*

---

## 7. Mutations, cart writes and money

Mutations are **server-side, always** — no exceptions, including "it's just an add-to-cart."

- The platform's cart is authoritative. Client state is a cache of it (`HL-CART-003`).
- **Never send a price, discount or line total from the client.** Send identifiers and quantities; read money back from the API response (`HL-CART-002`).
- Any client-computed total is **display-only** and is re-derived server-side before it influences anything.
- The mutation response is the source of truth for what the cart now contains. Do not optimistically update and skip reconciliation — inventory and pricing change under you.
- Cart writes flow through a rate-limited server route (`HL-SEC-004`).
- Mutation routes are idempotent where the platform allows it. A double-submitted add-to-cart is normal traffic.

---

## 8. Caching keys

Covered in full at `knowledge/07-cart-and-checkout.md` and `knowledge/04-performance-budget.md`; the data-layer half is one rule:

**Every input that changes the response is in the cache key. Every one.**

Enumerate them explicitly per cached query — market/locale, currency, customer segment, session, any filter argument. A key that omits one serves one customer's data to another, which is a privacy incident rather than a stale page (`HL-CACHE-001`).

Authenticated and per-session responses are **not** shared-cached. There is no clever key that makes this safe.

Caching availability differs and is not assumed (`HL-CACHE-003`): **A** has Oxygen's layer, **B** and **C** have nothing by default, **D** has Vercel Runtime Cache on Vercel and nothing off it.

---

## 8b. Navigation — where the menu comes from

*(`HL-CAP` capability gap, K4. In a theme the menu came from the Online Store and nobody chose. In headless somebody chooses, and most builds choose by accident.)*

**Every headless storefront needs navigation and there is no default.** The choice is made once, early, and it determines whether marketing can change the menu without a developer.

| Source | Who can change it | Cost |
|---|---|---|
| **Platform menus** via the storefront API | Merchandisers, in admin, no deploy | Menu shape is the platform's; deep mega-menu structure may not fit it |
| **Metaobjects / structured content** | Merchandisers, in admin, no deploy | You design the schema and the rendering; more capable, more to build |
| **Hardcoded in the app** | **Developers only, with a deploy** | Cheapest to build, and the one that generates a change request every time marketing runs a campaign |

**The question that decides it is not technical:** *when marketing wants to add a menu item on a Friday, what happens?* If the honest answer is "they raise a ticket," the client is buying a retainer dependency they were probably not told about — and that belongs in the SOW, not in a discovery six months later.

**Rules:**

- **Record the choice at G1**, with the "who can change it" answer written next to it.
- **A mega-menu is a content structure, not a styling problem.** Decide whether its depth, grouping, promotional slots and imagery fit the platform's menu shape **before** committing to platform menus — retrofitting is a re-source, not a tweak.
- **Navigation is a shared surface** (`knowledge/13-spec-conformance.md` §6): it carries a conformance row that is re-walked **every** sprint exit, because it breaks from changes aimed elsewhere. The K4 pilot lost it exactly that way.
- Nav data is fetched **server-side** and cached with the same key discipline as everything else — it varies by market and locale if the storefront does.

**Anti-pattern this exists to stop:** hardcoding navigation because it is faster in sprint one, and discovering in sprint six that "add a menu item" is a deploy. Nothing surfaces that at the time — the menu renders correctly either way, which is what makes it the same shape as `HL-SPEC-003`.

---

## 9. Tokens at the data layer

Restating from `05-security-baseline.md` §2 because this is where the mistake is actually made:

| Architecture | Server-side reads use |
|---|---|
| A / B | Storefront API — public token is fine server-side; a **private/delegate** token pools all traffic into one rate-limit bucket and removes Shopify's per-IP protection *(that per-IP behaviour has **no register entry** — unverified, not client-quotable)* |
| C | Same as A/B, via `@shopify/hydrogen-react` |
| D | **Private token.** Not a storefront token. `HL-SEC-006`, cutoff **2027-03-31**. |

---

## Anti-patterns

1. Fetching commerce data in the browser with anything other than the public Storefront token, read-only.
2. Writing anything from the browser directly to the commerce API instead of through a rate-limited server route.
3. Fetching in a component when the framework gives you a loader or a Server Component, then wondering why the route serialised.
4. Marking a component `"use client"` high in the tree and pulling the subtree's data fetching into the browser with it.
5. Requesting a connection with no `first` — a query whose cost is set by the client's catalogue rather than your design.
6. Nesting connections on BigCommerce until depth 16 or complexity 10,000 becomes the thing that fails, instead of flattening.
7. Assuming a request-count rate limit protects a GraphQL endpoint whose real constraint is query shape.
8. Adding fields to a shared fragment "in case," and paying for them in every query that spreads it.
9. Spreading a fragment built for one surface into a query rendering another, to avoid writing a second fragment.
10. Fetching a collection and then looping per-product — the N+1 that was invisible in Liquid and is a network round trip here.
11. Awaiting independent queries in sequence because they were written in sequence.
12. Treating HTTP 200 as success on a GraphQL response and never reading the `errors` array.
13. Rendering partial data with no decision recorded about whether partial should degrade or fail.
14. Putting a third-party call in the render path with no named degradation behaviour.
15. Logging a cart ID while debugging a mutation.
16. Accepting a price, discount or total from the client for any reason.
17. Optimistically updating the cart and never reconciling against the mutation response.
18. Omitting market, locale, currency or session from a cache key and shipping it because it worked for one logged-out visitor.
19. Hardcoding navigation because it is faster in sprint one, and making "add a menu item" a deploy for the life of the storefront.
20. Choosing platform menus before checking whether the mega-menu's depth, grouping and promotional slots fit the platform's menu shape.
21. Treating navigation as a styling concern rather than a shared surface with a conformance row.
19. Using a BigCommerce storefront token for server-side fetching because a tutorial did.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
