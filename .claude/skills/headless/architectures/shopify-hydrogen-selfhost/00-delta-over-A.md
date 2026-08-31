---
tier: 1
load_when: ["platform-headless", "headless-platform-active", "headless-arch-b", "g0-intake-stage", "g1-plan-stage", "g3-scaffold-stage", "code-production", "g4-sprint-qa"]
description: "Architecture B — Hydrogen self-hosted. Written as a delta over architecture A, not a parallel copy. Covers only what changes: the B1 pre-signature deploy spike, the Headless-channel requirement, Oxygen-specific code removal and the custom server context, the two runtime families B spans, what A supplied that B does not, hosting and operational ownership with the mandatory SOW line, and the honest risk position. Application code is identical to A — a divergence there is a finding, not a choice."
applies_to: [headless]
decision_refs: [D-HL-STACK-01, D-HL-ENV-01, D-HL-SEC-01, D-HL-TYPES-01, D-KB-FIDELITY-01, D-QA-GATE-BLOCK]
last_reviewed: 2026-08-06
next_review_due: 2026-11-06
---

# Architecture B — Hydrogen + self-host (delta over A)

> **Read `architectures/shopify-hydrogen-oxygen/00-reference.md` first.** This file is a **delta**. Everything in A applies unless contradicted here.
>
> **Application code is identical to A.** Same Hydrogen version, same pins, same exports, same loaders, same cache helpers. **A divergence in application code between A and B is a finding, not a choice.** What changes is the runtime, the deploy path, what the platform supplies, and who owns the consequences.

---

## 1. The honest position — carry it into every B conversation

`D-HL-STACK-01`, unchanged by B's promotion:

> **B is the highest-risk of the four architectures. Do not sell B as "Hydrogen, just on Vercel."**

B was promoted from SUPPORTED-ON-DEMAND to full support because **a real client requires it** — a commercial decision. It was never a finding that the technical risk went away.

The risk is documented and specific. Shopify's self-hosting guide carries:

> *"This guide might not be compatible with features introduced in Hydrogen version 2025-05 and above"*

Current Hydrogen is **2026.4.4** (register §12a). The primary documentation for the thing B does is, by Shopify's own admission, potentially about a year stale. **Cite that warning in every B SOW.**

**This is not a reason to refuse B.** It is the reason B1 exists.

---

## 2. B1 — the deploy spike, before signature

**The gate.** `D-HL-ENV-01` check B1.

Deploy a scaffold Hydrogen app to **the actual target host** — the real one, not a representative one — and **serve a real Storefront API query through it.** Record what it took.

**It runs before SOW signature.** Its failure changes the architecture, and after signature that is a change order rather than a choice. At proposal the answer is *"then it's A, or C, or B with these extra days priced in."* After signature the same finding is a commercial dispute.

**An unrun spike is a failed check, not an unknown.**

What the spike must actually prove, not merely attempt:

| Proves | Not proven by |
|---|---|
| The app **builds** for the target host | A successful local build |
| The app **serves** — a real query returns real data through the deployed instance | A 200 on the root path |
| The **custom server context** works (B4) | Anything short of a loader reading from it |
| The host's limits are **known numbers** (B5) | The host's marketing page |

---

## 3. B2 — the channel, and the failure that never names itself

**Install the Headless channel. Not the Hydrogen channel.**

This is the inverse of A1, and it is the more common error precisely because the framework is the same — the instinct is "we're building Hydrogen, install Hydrogen." The resulting token errors **do not name the cause**, which is why this is a preflight check rather than a debugging note.

---

## 4. B3 / B4 — the actual work of self-hosting

This is what the stale guide covers, and it is why the spike is not a formality.

**B3 — Oxygen-specific code removal, enumerated.** The guide's *"Remove Oxygen-specific packages and code"* becomes a concrete file list:

- `server.js`
- `react-router.config.ts`
- `vite.config.ts`
- possibly `app/entry.server.tsx`

"Enumerated" is the operative word. A vague instruction to remove Oxygen bits produces a build that half-works and fails in a way that looks like an application bug.

**B4 — custom server context, proven.** The server entry creates a Hydrogen context and passes it through **`getLoadContext`**. Until a loader has read the storefront client out of that context on the deployed host, B4 is not proven.

`createHydrogenContext` is the same verified export A uses (register §12b). What changes is **who calls it and where** — on A the platform's entry does it; on B you wrote the entry.

---

## 5. Two runtime families — the distinction that changes the dependency audit

B's host set spans two different kinds of runtime, and **which one you are on changes the answer to the dependency audit**:

| Host family | Consequence |
|---|---|
| **Worker runtimes** (e.g. Cloudflare Workers) | Constraints in the same *shape* as Oxygen's — no Node built-ins, no filesystem, no long-lived processes. A dependency that disqualified A likely disqualifies this too. |
| **Node-capable runtimes** (e.g. Fly.io, Node targets) | Node built-ins available. A dependency that disqualified A may be fine here — which is sometimes the actual reason to choose B. |

**Do not assume B "escapes" Oxygen's runtime constraints.** On a worker-runtime host it does not. Establish which family the target host belongs to at preflight, then run the dependency audit **against that runtime** — not against "self-hosted" as a category.

**Every host-specific limit is fetched, not assumed** (B5): env var cap, bundle or function size cap, cold-start behaviour, request timeout. **The host's numbers, from the host.** Oxygen's numbers do not transfer, in either direction — B is not automatically more generous.

---

## 6. What A supplied that B does not

The delta, stated as the list to price:

| A supplied | B |
|---|---|
| Managed runtime, TLS, platform deploy | **Yours.** Client owns the hosting account by default. |
| **A caching layer** | **None by default.** See below. |
| Documented, fixed ceilings | **The host's**, fetched at preflight |
| Env store with a known **110** cap | Host-dependent, counted at preflight |
| `link` / `env pull` against Oxygen | Your host's own configuration mechanism |

**The caching point is subtle and it is where B estimates go wrong.** `CacheShort`, `CacheLong`, `CacheNone` and `CacheCustom` are the same exports and still work — they describe cache behaviour. **What backs them on Oxygen does not come with you.** On B the caching layer is designed, owned and **priced**, or it is absent (`HL-CACHE-003`). A B build that assumes A's cache behaviour has assumed infrastructure nobody bought.

Verify per host what cache primitive is actually available, at preflight. **Unnamed means absent. Absent means unpriced.**

---

## 7. Hosting and operational ownership

Per `D-HL-STACK-01`: **the client owns the hosting account by default.** WebDesk deploys into it. Managed service is a **separately priced add-on**, and if declined it is **explicitly out of scope**.

**Every B SOW carries this line, including when managed hosting is declined:**

> *"Client owns hosting, monitoring and incident response. WebDesk responds on request at prevailing hourly rates, no response-time commitment."*

That sentence is the one that stops the first outage becoming a free-work argument. The handover includes `knowledge/05-security-baseline.md` **as a runbook, not as a link** — B hands the entire security posture to someone who did not build it.

---

## 8. Ongoing cost

- **Upgrades are worse on B than on A.** A Hydrogen CalVer step is already an API-version migration (type 5). On B it is that **plus** re-validating the custom server entry and the deploy path against a guide that carries a staleness warning. Price it accordingly; never absorb it into a retainer.
- **Monitoring and incident response are the client's** unless purchased. The retainer covers what was bought, and hosting operations are in scope **only if explicitly purchased** (`D-HL-TYPES-01` §6).
- Re-run preflight at G3 (`D-HL-ENV-01`). On B this includes re-confirming the deploy path, because the host changes under you and the guide does not.

---

## 9. What does **not** change from A

Stated explicitly, because the temptation on a self-host build is to treat everything as negotiable:

- The Hydrogen version and **both** `~7.16.0` react-router pins.
- Node from `engines` (`^22 || ^24`), never from the docs.
- The verified export surface (register §12b) — no new names without verification.
- `CacheShort` = 1s/9s and `CacheLong` = 3600s/82800s. **The numbers do not change; only what backs them does.**
- Checkout is Shopify's. Cart is the platform's. The cart ID is a bearer capability.
- Every security rule in `knowledge/05-security-baseline.md`, with **more** weight, not less — B has no managed runtime absorbing any of it.
- The open items in A §8 remain open here.

---

## Anti-patterns

1. Selling B as "Hydrogen, just on Vercel."
2. Treating B's promotion to full support as evidence the technical risk went away. The promotion was commercial.
3. Signing a fixed-price B engagement with no deploy spike on the actual target host.
4. Treating an unrun B1 as an unknown rather than a failed check.
5. Running the spike against a representative host instead of the client's real one.
6. Calling the spike passed on a build that never served a real Storefront API query.
7. Installing the **Hydrogen** channel for a self-hosted build, then debugging tokens for a day.
8. Removing "the Oxygen bits" without enumerating the file list, and shipping a half-migrated entry.
9. Calling B4 done before a loader has read the storefront client out of the context on the deployed host.
10. Assuming self-hosting escapes Oxygen's runtime constraints — on a worker-runtime host it does not.
11. Running the dependency audit against "self-hosted" as a category instead of against the actual target runtime.
12. Carrying Oxygen's limits over to the host, in either direction.
13. Assuming the cache helpers still being exported means a caching layer still exists. It does not.
14. Pricing B with A's cache behaviour silently assumed.
15. Handing hosting to a client who declined managed service without the SOW line and without the security baseline as a runbook.
16. Pricing a B upgrade as if it were an A upgrade — B adds re-validating the server entry and the deploy path.
17. Letting application code diverge between A and B. Same code; different host.

---

Last reviewed: 2026-08-06
Next review due: 2026-11-06
