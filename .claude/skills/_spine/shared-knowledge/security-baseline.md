---
tier: 2
load_when: ["security-topic"]
---

# Security Baseline (Universal)

> Cross-platform security standards. Every project meets these regardless of platform. Platform-specific security rules layer on top (in each platform arm's KB).

---

## The baseline (non-negotiable)

These apply to every project. No exceptions.

### 1. HTTPS everywhere
- All pages served over HTTPS
- No mixed content (HTTP resources on HTTPS pages)
- HSTS enabled (Strict-Transport-Security header)
- SSL certificate valid, auto-renewing

### 2. Credentials never in code
- API keys, tokens, passwords never committed
- `.env` files in `.gitignore`
- Secrets in platform secret management (GitHub Secrets, Vercel env vars, etc.)
- Credential scanning in CI (pre-commit + pre-merge)

### 3. Authentication / Authorization
- Customer auth via platform's built-in system (or trusted SaaS)
- Never roll custom auth without senior approval
- Sessions with secure cookies (HttpOnly, Secure, SameSite=Strict where possible)
- Logout properly invalidates session

### 4. Input handling
- All user input sanitized + validated
- Output escaped before rendering (XSS prevention)
- Parameterized queries (no SQL injection)
- CSRF tokens on state-changing operations

### 5. Dependencies
- Dependencies pinned to specific versions
- Dependabot or equivalent monitors for vulnerabilities
- Security patches applied within 1 week of disclosure (P1 vulns: within 24 hours)
- No deprecated packages

### 6. Headers
Required security headers on every response:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN (or DENY)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: (per project — restrict camera, microphone, etc.)
Content-Security-Policy: (project-specific, see § CSP below)
```

### 7. PII handling
- PII never logged to console / logs (customer email, address, phone)
- PII never in error messages exposed to client
- PII transferred only over HTTPS
- PII storage encrypted at rest (platform handles this)
- GDPR / CCPA respected per spec

### 8. Payment handling
- NEVER touch card data directly (PCI scope expansion)
- Use platform's hosted payment fields (Shopify Checkout, Stripe Elements, etc.)
- Webhook signatures verified (server-side)
- Test mode separate from live mode (no test keys in production)

---

## Forbidden patterns (security-specific)

These never appear in code:

```
eval(*)                  → Dynamic code execution. Forbidden.
new Function(*)          → Same.
document.write(*)        → XSS vector.
innerHTML = userInput    → XSS without sanitization.
dangerouslySetInnerHTML  → React XSS; only with sanitization.
<script>...inline...</script>  → CSP violation. Use external script with src.
$wpdb->query("...$var...")  → SQL injection. Use prepare().
exec(*)                  → Command injection.
SELECT * FROM ... WHERE id = $userInput  → SQL injection.
```

These are auto-blocked by Code Review Agent (P1).

---

## Content Security Policy (CSP)

CSP is the most powerful XSS defense. Configure per project.

### Strict CSP (recommended baseline)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{server-generated-nonce}' https://cdn.shopify.com https://www.googletagmanager.com;
  style-src 'self' 'nonce-{nonce}';
  img-src 'self' data: https://cdn.shopify.com https://images.unsplash.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://www.google-analytics.com https://api.klaviyo.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

### Adjust per project for:
- Allowed third-party scripts (analytics, chat widgets, video embeds)
- Image hosts (CDNs)
- Font providers
- API endpoints

### Report-only mode
For new projects, run CSP in report-only mode first (logs violations but doesn't block):
```
Content-Security-Policy-Report-Only: ...
```

After 7-14 days, fix any false positives, then enforce.

---

## Authentication security

### Customer login

- Password requirements: minimum 8 characters, complexity per platform default
- Brute force protection: rate limit login attempts (5 per 15 minutes typical)
- Lockout after N failed attempts (with reset mechanism)
- 2FA available where platform supports
- Password reset via email with time-limited tokens (24-hour expiry)

### Admin login (agency / client team)

- 2FA mandatory for all admin accounts
- Sessions timeout after 8 hours of inactivity
- Login attempts logged and monitored
- IP allowlisting where possible (especially for staging environments)

### API access

- Long-lived tokens stored only in secrets
- Token rotation: at minimum annually, on staff departure, on suspected compromise
- Tokens scoped to minimum required permissions
- No tokens in URLs (use headers)

---

## Data protection

### At rest

- Platform handles database encryption (we don't roll our own)
- Backups encrypted
- File uploads scanned for malware (where platform supports)

### In transit

- HTTPS for all requests
- TLS 1.2+ minimum
- Strong cipher suites only

### Logs

- No PII in logs
- Log sensitive operations (login attempts, payment transactions, admin actions)
- Logs retained per platform / regulation (typically 90 days minimum)
- Logs themselves protected (limited access)

---

## Third-party security

### Vetting

Before adding a third-party tool / app:
- Review their security posture (SOC 2? GDPR-compliant? data residency?)
- Review their data handling (what do they access? store?)
- Review their permissions / scopes requested
- Document in spec

### Permissions

When integrating:
- Request minimum scopes required
- Don't grant write access if read is enough
- Document what each integration accesses

### Monitoring

- Integration tokens listed and monitored
- Failed/expired tokens detected
- Suspicious activity escalated

---

## Incident response

### If a security incident occurs:

1. **Identify** — what happened? Confirm via logs.
2. **Contain** — stop the bleeding (disable affected account, revoke token, take site down if needed)
3. **Eradicate** — fix the underlying issue
4. **Recover** — restore service, monitor for recurrence
5. **Communicate** — notify client per agreement; if breach, regulatory notifications per jurisdiction
6. **Document** — incident log, root cause analysis, lessons learned

### Severity classification

- **Critical (P1):** PII exposure, financial fraud, site takeover
- **High (P2):** Significant vulnerability in production code
- **Medium (P3):** Vulnerability in staging or non-production
- **Low (P4):** Theoretical issue, no exploitable path

### Response timeline

- P1: respond within 1 hour, contain within 4 hours
- P2: respond within 24 hours, contain within 48 hours
- P3: respond within 1 week
- P4: address in normal cycle

---

## Compliance considerations

### GDPR (EU customers)

Required:
- Privacy policy disclosing data practices
- Cookie consent (where applicable)
- Right to access (data export)
- Right to erasure (data deletion)
- Data breach notification within 72 hours

### CCPA (California customers)

Required:
- Privacy policy
- "Do Not Sell My Personal Information" link
- Data access/deletion requests

### PCI DSS (anyone handling card data)

Easiest path: NEVER touch card data directly. Use platform's hosted payment fields:
- Shopify Checkout
- Stripe Elements
- PayPal Smart Buttons

This keeps you in PCI SAQ-A scope (lowest compliance burden).

### Industry-specific

- HIPAA (health-related): generally avoid unless project explicitly requires
- COPPA (children under 13): special protections required
- Financial services: additional regulations

If project scope includes regulated data, security baseline is enhanced (per spec).

---

## Security review per stage

### At spec stage
- PM Agent flags any regulated data in scope
- Note compliance requirements
- Reserve security review time in estimates

### At design stage
- Designer Agent considers PII visibility (don't expose customer details on public pages unnecessarily)
- Token system handles access via auth (private metafields, customer-specific data)

### At dev stage
- Frontend Agent + Backend Agent follow security baseline
- Code Review Agent enforces forbidden patterns (P1 blocks)

### At QA stage
- QA Agent runs Module 8 (Security per `_spine/qa-agent/knowledge/01-qa-modules.md`)
- Dependency scan, header check, credential scan

### At pre-launch
- Delivery Head's pre-launch checklist includes security items
- Final dependency audit
- Security headers verified
- HTTPS verified

### At launch
- Backup before publish
- Monitoring active for security alerts

### Post-launch
- Synthetic monitoring includes security health
- Dependency scanner (Dependabot) auto-monitors

---

## Security training (per K8)

Tier 2 (all devs) training includes:
- OWASP Top 10 awareness
- Platform-specific security patterns
- How to use credentials properly
- How to handle PII

Tier 3 (seniors) training includes:
- Threat modeling
- Security architecture review
- Incident response

---

## Anti-patterns

1. **Trusting user input.** Always validate, always sanitize.
2. **Custom auth.** Reuse platform auth. Custom auth = vulnerabilities you didn't know existed.
3. **Hardcoded credentials.** Already covered. Critical.
4. **Skipping security review for "small" features.** Even small features touch security boundaries.
5. **Ignoring dependency warnings.** Dependabot alerts ignored = vulnerabilities accumulating.
6. **No incident response plan.** When it happens, you're improvising. Document a plan now.
7. **"Security through obscurity."** Hidden URLs, undisclosed admin paths — not security. Real security is hard.

---

## Updates to this file

Quarterly review per K2. When industry threats evolve (new CVE patterns, new attack vectors), update.

Owner: Tech Lead (or designated Security Lead if team grows).

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
