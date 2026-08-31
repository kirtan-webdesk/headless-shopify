---
tier: 2
load_when: ["code-review-detail"]
---

# Code Review Standards (Universal)

> Cross-platform code standards every agent + dev should respect. Platform-specific standards live in each platform arm's `knowledge/01-coding-standards.md`. This file is the universal floor.

---

## When this is loaded

Loaded by:
- Code Review Agent (always, regardless of platform)
- Frontend Agent (per platform)
- Backend Agent (per platform)
- Senior dev reviewers (read once, internalize)

---

## Universal principles

### 1. Code clarity over cleverness

If a line takes 2 seconds to understand, it's clearer than the same logic in 1 line that takes 30 seconds.

Bad:
```javascript
return arr.reduce((a,c)=>a+(c.p*c.q),0);
```

Good:
```javascript
const cartTotal = items.reduce((total, item) => {
  return total + (item.price * item.quantity);
}, 0);
return cartTotal;
```

### 2. Naming conveys intent

- `x`, `temp`, `data` are not names — they're placeholders that escaped
- Function names describe what they DO: `calculateCartTotal()` not `cart()`
- Variable names describe what they ARE: `customerEmail` not `e`
- Boolean variables read as questions: `isLoading`, `hasItems`, `canCheckout`

### 3. Single responsibility

A function should do one thing. If you describe it with "and," it's doing too much.

Bad: `validateAndSaveOrderAndSendEmail()`
Good: `validateOrder()` → `saveOrder()` → `sendOrderConfirmation()`

### 4. Magic numbers and strings are forbidden

```javascript
// BAD
if (cart.items.length > 99) { showLargeCartWarning(); }
setTimeout(check, 5000);

// GOOD
const MAX_CART_ITEMS = 99;
const HEALTH_CHECK_INTERVAL_MS = 5000;

if (cart.items.length > MAX_CART_ITEMS) { showLargeCartWarning(); }
setTimeout(check, HEALTH_CHECK_INTERVAL_MS);
```

### 5. Comments explain WHY, not WHAT

```javascript
// BAD (explains what — the code already says this)
// Increment counter by 1
counter += 1;

// GOOD (explains why — context the code can't convey)
// Increment to account for the off-by-one in Shopify's cart line item indexing
counter += 1;
```

### 6. DRY — but not before the third repetition

Don't abstract too early. Code that's repeated twice may stay repeated. Code that's repeated three times deserves extraction.

Premature abstraction creates worse coupling than duplication.

### 7. Fail loudly, recover gracefully

```javascript
// BAD — silent failure
try {
  await processOrder(order);
} catch (e) {
  // ignore
}

// GOOD — log + propagate or handle
try {
  await processOrder(order);
} catch (e) {
  logger.error('Order processing failed', { orderId: order.id, error: e });
  throw new OrderProcessingError(`Failed to process order ${order.id}`, { cause: e });
}
```

### 8. No dead code

Comments saying "TODO: remove this later" → remove now or assign + date.
Old code "in case we need it" → git history is your "in case" archive. Delete.

---

## File organization

Universal rules for file structure:

1. **One concept per file** — section, component, utility, class
2. **Co-located related files** — section.liquid + section.css + section.js together
3. **Index files re-export** — for libraries, an `index` file exports public API
4. **Tests next to code** — `foo.js` and `foo.test.js` in same dir (where convention allows)

---

## Code style

Specific style is enforced by linters per platform. But common principles:

### Indentation
- Spaces, not tabs (2 spaces for most languages; 4 for Python)
- Consistent within a file

### Line length
- Soft cap: 100 characters
- Hard cap: 120 characters
- If a line is longer, restructure (extract variable, break at logical point)

### Semicolons / Brackets
- Follow language convention. JS = semis required. Liquid/HTML = follow Shopify/platform style.

### Trailing commas
- Use them. Cleaner diffs.

```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3,  // ← trailing comma
};
```

### Imports
- Group by: external libraries → internal modules → relative imports
- Alphabetize within group
- One blank line between groups

```javascript
// External
import { useState } from 'react';
import classnames from 'classnames';

// Internal
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';

// Relative
import { Button } from './Button';
import styles from './ProductCard.module.css';
```

---

## Function signatures

### Parameters
- Required positional parameters first
- Optional named parameters second (use object destructuring)
- Maximum 3 positional, use object for more

```javascript
// BAD
function createOrder(customerId, items, shipping, billing, discount, notes, source) {}

// GOOD
function createOrder(customerId, items, { shipping, billing, discount, notes, source }) {}
```

### Return values
- Return early when possible (less nesting)

```javascript
// BAD
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.isPaid) {
        // process
        return result;
      }
    }
  }
  return null;
}

// GOOD
function processOrder(order) {
  if (!order) return null;
  if (order.items.length === 0) return null;
  if (!order.isPaid) return null;

  // process
  return result;
}
```

---

## Error handling

### Specific errors over generic
```javascript
// BAD
throw new Error('Something went wrong');

// GOOD
throw new InsufficientInventoryError(`Product ${sku} has ${available} units, needed ${requested}`);
```

### Error context
Include context that helps debugging:
```javascript
throw new PaymentValidationError('Payment failed', {
  customerId,
  amount,
  paymentMethod,
  attemptedAt: new Date(),
});
```

### Error propagation
- Use `cause` (in newer JavaScript) or equivalent to preserve original error
- Don't swallow errors silently

---

## Async code

### Don't mix paradigms
- All callbacks, OR all promises, OR all async/await — pick one per codebase
- Modern default: async/await

### Always handle promise rejections
```javascript
// BAD
fetch(url);  // unhandled rejection

// GOOD
try {
  await fetch(url);
} catch (e) {
  // handle
}

// or
fetch(url).catch(e => /* handle */);
```

### Avoid parallel awaits if independent
```javascript
// BAD — sequential when could be parallel
const products = await fetchProducts();
const reviews = await fetchReviews();

// GOOD — parallel
const [products, reviews] = await Promise.all([
  fetchProducts(),
  fetchReviews(),
]);
```

---

## Testing standards

### Test naming
Tests describe behavior, not implementation:

```javascript
// BAD
test('addProduct function works', () => {});

// GOOD
test('cart adds product when product is in stock', () => {});
test('cart rejects product when out of stock', () => {});
```

### One assertion per test (typically)
Easier to identify what failed.

### Test setup minimal
If setup is complex, extract to helper. Test should focus on what's being tested.

### No test interdependence
Each test should pass when run alone. No "this test needs the previous one to have run."

---

## Documentation

### Required docs

- README at repo root (per master doc template)
- Per-module docstrings on public functions
- API documentation for any service endpoints

### Docstring format

```javascript
/**
 * Calculate total cart value including tax and shipping.
 *
 * @param {Cart} cart - The cart to calculate for
 * @param {Object} options - Calculation options
 * @param {boolean} options.includeShipping - Whether to include shipping cost
 * @param {string} options.currency - ISO 4217 currency code (default: USD)
 * @returns {number} Total cart value in the specified currency
 * @throws {InvalidCartError} If cart is empty or contains invalid items
 */
function calculateCartTotal(cart, options = {}) {
  // ...
}
```

---

## Forbidden patterns (universal — also see platform-specific forbidden.md)

These are NEVER acceptable, regardless of platform:

- `eval()` or equivalent dynamic code execution
- Hardcoded credentials, API keys, passwords
- `console.log()` in production code (use logger)
- Catching errors and silently ignoring
- Modifying built-in prototypes
- `with` statement (JavaScript)
- Global mutable state (use proper state management)
- Unsanitized user input in queries, HTML, URLs, etc.
- Network requests without timeout
- Infinite loops without break condition

---

## When code review escalates to senior

Per Code Review Agent + `_spine/code-review-agent/knowledge/03-sensitive-paths.md`:

Senior dev review required for:
- Checkout, payment, authentication paths
- Database schema changes
- API endpoints (especially with auth)
- Cron jobs / scheduled tasks
- Caching strategies
- Security-related code

Plus anything Code Review Agent's AI judgment flags as needing human review.

---

## Code review etiquette (for human reviewers)

When a human reviews AI-generated or human-written code:

1. **Be respectful but direct.** "This won't work in production because X" not "I wonder if maybe perhaps..."
2. **Suggest specifics.** "Change to X" not "improve this"
3. **Explain rationale.** Help the author learn, not just fix.
4. **Distinguish must-fix from preference.** Use severity (P1/P2/P3/P4) per Code Review Agent's scale.
5. **Praise what's good.** Especially for juniors learning. Specific praise sticks.

---

## When this file is updated

Quarterly review (per K2). When recurring code quality issues come up across projects, this file is updated.

Owner: Tech Lead.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
