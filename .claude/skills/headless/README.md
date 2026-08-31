# Before you start — headless build

**Arm v0.18.0.** This file is for the person doing the build. It is not loaded into agent context — it is here because you will open the bundle before you open anything else.

**Three minutes. Two of these will cost you a day if you meet them cold.**

---

## Do this first, before any code

**Fill in `templates/spec-conformance-ledger.md` at G1.**

Every SOW requirement becomes a row with an **observable acceptance test**. The test question is: *would an incorrect implementation also pass this?* If yes, it is not a test yet.

> *"Homepage is dynamic"* — a static homepage passes this. Not a test.
> *"Editing a Metaobject entry in admin changes the rendered homepage with no deploy"* — a static homepage fails this on day one. That is a test.

The ledger is walked at **every sprint exit**. A row with no test, a failing test, or a "done" that nobody independently verified **blocks the sprint**.

**This has never been run.** You are the first. Where it is awkward, slow, or asks for something that does not make sense — **say so rather than working around it.** That feedback is what turns this arm from 0.x into 1.0, and working around it silently is how the last pilot's problems stayed invisible until the client found them.

---

## Two things the arm does not do for you

### 1. There is no Metaobject section pattern

If your SOW has a Metaobject-driven requirement — a dynamic homepage, configurable content blocks — **the arm will hold you to it and will not show you how.**

`HL-SPEC-003` blocks static-where-dynamic-was-required at G4. That is deliberate. The last pilot delivered a static homepage against a SOW that required dynamic, and nobody noticed until the client did; the gate now catches that five weeks earlier.

**But blocking is not teaching.** The pattern is missing on purpose: writing it from theory rather than from a real build is how this arm shipped wrong content before. **You are the one who finds the right shape.** When you do, send it back — that becomes the pattern.

### 2. Publication scoping is now documented — read it before you debug

**If a product does not appear in your storefront, check publication before you check your query.** Shopify:

> *"Unpublished products will behave just like they were archived or deleted: they will be omitted from connections and not found when queried by handle or ID."*

**No error.** You get a `null` on a query that is correct, and the merchant sees the product in admin looking perfectly normal.

**Two conditions, and this is the part that catches people:**

> *"the Storefront API will only return products that are published both to your sales channel **and** the market you're querying for."*

A product published to the channel but not to the market you are querying is **absent**, and nothing at the API surface tells the two apart. Confirm both. `knowledge/11-environment-preflight.md` check 5b, `pointers/verified-facts.md` §17.

---

## One rule that will save you an argument later

**Numbers, limits, plan gates and API fields come from `pointers/verified-facts.md`, not from memory or from a docs page you found.**

The register has caught real ones: `CacheShort()` is **1 second** fresh, not the minutes everyone assumes. Shopify's own docs say Node v16.20+ while the pinned CLI requires `^22 || ^24`. `@bigcommerce/catalyst-core` does not exist. **If it is not in the register with a source and a date, it does not go in an estimate or a client email.**

If you verify something new, send it back with the source URL. It becomes a register entry and nobody re-checks it.

---

## If the gate catches you

**Log it. Do not route around it.**

A blocked sprint exit is the arm doing its job — but *where* it blocked and whether the block was right is the only feedback that makes it teach instead of just stop. That record is worth more than a clean run.

---

## Where things are

| You need | Open |
|---|---|
| The gate that blocks your sprint | `knowledge/13-spec-conformance.md` |
| The ledger to fill in at G1 | `templates/spec-conformance-ledger.md` |
| Environment checks before you build | `knowledge/11-environment-preflight.md` + `templates/env-preflight.md` |
| The audit that blocks pricing | `knowledge/12-discovery-audit.md` + `templates/discovery-audit.md` |
| Every number, limit and version | `pointers/verified-facts.md` |
| What never to do | `knowledge/09-forbidden.md` |
| Your architecture | `architectures/` — A reference, B delta over A, D standalone |

## Sending feedback back

There is no form. Say what happened, in whatever channel you already use:

- **Where the ledger was awkward** — the wording, the columns, the walk. It has never been used.
- **What the Metaobject pattern turned out to be**, if your build has one. That becomes the arm's pattern.
- **Any number that was wrong**, with where you found the right one.
- **Any gate that blocked you when it should not have** — a gate that is stricter than reality gets routed around, and once one is routed around the rest stop being taken seriously.

This is a two-way channel. The arm is at 0.x precisely because it has run against exactly one build.
