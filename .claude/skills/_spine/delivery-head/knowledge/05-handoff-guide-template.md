---
tier: 2
load_when: ["agent-specific-detail"]
description: "Per J7, every project handoff includes: admin guide, training video script, credentials handover, warranty terms. Plus the master doc (from PM Agent) and client memory file. This file defines structure for the Delivery-Head-owned pieces."
---

# 05 — Handoff Guide Template

> Per J7, every project handoff includes: admin guide, training video script, credentials handover, warranty terms. Plus the master doc (from PM Agent) and client memory file. This file defines structure for the Delivery-Head-owned pieces.

---

## Handoff package structure

```
/projects/[client]/handoff/
├── 1-admin-guide.md          ← How to edit content, manage site (Delivery Head)
├── 2-training-video-script.md ← Script for video walkthrough (Delivery Head)
├── 3-credentials-handover.md  ← Account access (Delivery Head + Backend Agent)
├── 4-warranty-terms.md        ← Coverage + SLAs (Delivery Head)
├── master-doc.md             ← Technical reference (PM Agent)
├── client-memory.md          ← Internal — cross-project context (PM Agent)
└── README.md                 ← Index + how to use this package
```

Master doc and client memory are PM Agent's responsibility (per `_spine/pm-agent/knowledge/09-master-doc-template.md` and `10-client-memory-template.md`).

Delivery Head owns items 1-4 + README.

---

## 1. Admin Guide

Target audience: client's day-to-day content/store admin. NOT technical.

Tone: friendly, step-by-step, with screenshots.

```markdown
# [Project Name] — Admin Guide

Welcome! This guide shows you how to manage your new [website / store] day-to-day.

You can edit most things yourself. For anything that needs developer help, you'll find a "When to call us" note.

---

## Table of Contents

1. Logging in
2. Editing the homepage
3. Adding & editing products
4. Managing collections / categories
5. Editing the navigation menu
6. Editing the footer
7. Adding & editing blog posts
8. Managing customer accounts
9. Viewing orders
10. Discount codes
11. Apps & integrations (where to manage them)
12. Reports & analytics
13. Common questions
14. When to call us

---

## 1. Logging in

[Step-by-step with screenshots]
- URL: [admin login URL]
- Your username: [provided separately for security]
- Forgot password: [reset process]

---

## 2. Editing the homepage

The homepage is built with editable sections. To change content:

### Using the theme editor (Shopify) / Customizer (WordPress) / etc.

1. [Step with screenshot]
2. [Step with screenshot]
3. [Step with screenshot]

### Specific sections you can edit:

**Hero section**
- Change title: [where]
- Change image: [where]
- Change CTA button: [where]

**Featured products**
- Change which products show: [where]
- Number of products: [where]

[... continue for each editable section ...]

### When to call us
- Adding NEW section types (we'd need to build them)
- Major layout changes (we'd quote separately)

---

## 3. Adding & editing products

[Continue with step-by-step instructions, screenshots, "when to call us" notes]

---

## [Continue for all sections]

---

## 13. Common questions

### Q: How do I change the brand colors?
A: [Where to do this, what changes]

### Q: How do I add a new product?
A: [Steps with screenshots]

### Q: How do I run a sale / discount?
A: [Steps]

### Q: My site is slow today. What do I do?
A: [Troubleshooting + when to contact us]

### Q: I see an error message on the site
A: [What to do — screenshot it, contact us]

---

## 14. When to call us

Contact us if:
- You want to add new functionality not covered above
- Something is broken (bug, error, not working as expected)
- You want major design changes
- You need help with integrations
- You're not sure if you can do something yourself

**Contact:** [email or process]
**Response time:** [per warranty SLAs]
**Out-of-warranty support:** [separate agreement / billable rate]
```

The admin guide is platform-specific and project-specific. Delivery Head generates by:
1. Reading section-map.json (knows which sections are merchant-editable)
2. Reading project.json content_responsibility (knows what client manages)
3. Generating instructions per platform conventions
4. Including screenshots (manual capture by Delivery Head with Claude in Chrome assistance, or template screenshots from prior projects)

---

## 2. Training Video Script

Script for a 10-15 minute screen recording. Walks through key admin tasks.

```markdown
# Training Video Script — [Project Name]

**Duration target:** 10-15 minutes
**Recording:** [Loom / Camtasia / OBS] suggested
**Recorded by:** [Internal PM or designated team member]

---

## Intro (30 seconds)

"Hi! Welcome to your [Project Name] training video. In the next 10 minutes,
I'll show you how to manage your [website / store] day-to-day. You can
pause this anytime, and refer back to the written admin guide for detailed
instructions."

[Show: site homepage on the screen]

---

## Section 1: Logging in (1 minute)

[Show: navigating to admin login]

"To log in, go to [URL]. Enter your username and password. We've sent
these to you in a separate secure email.

Once you're in, you'll see your admin dashboard."

[Show: admin dashboard]

---

## Section 2: Editing the homepage (3 minutes)

"Let's edit the homepage. Click [theme editor / customize]."

[Show: theme editor]

"You'll see your homepage broken into sections. To change the hero..."

[Demonstrate editing the hero text, image, CTA]

"Click Save when you're done. Your changes are live immediately —
or scheduled if you set a publish date."

[Repeat for 2-3 key section types]

---

## Section 3: Adding a product (2 minutes)

[Demonstrate adding a new product end-to-end]
- Title, description, images
- Pricing
- Inventory
- Variants
- SEO meta
- Save and publish

---

## Section 4: Managing the navigation menu (1.5 minutes)

[Demonstrate adding/removing/reordering menu items]

---

## Section 5: Viewing orders (1 minute)

[Demonstrate where orders appear, basic info, statuses]

---

## Section 6: Running a discount code (1 minute)

[Demonstrate creating a code]

---

## Section 7: Where to find help (30 seconds)

"For detailed instructions, refer to your admin guide PDF.

For technical issues:
- During warranty (until [date]): contact us at [contact]
- After warranty: [process]

For anything else, just reach out!"

---

## Outro (30 seconds)

"That's the basics. Take some time to explore the admin yourself.
Everything is editable except where noted in the guide. You can't
break anything by experimenting — the worst case, we restore from
backup.

Welcome to your new [website / store]!"

[Show: live site URL]

[End recording]
```

The script is followed by [Internal PM or designated team member] who records the actual video. Video saved to handoff package.

---

## 3. Credentials Handover

Per J7. Contains all third-party account access.

**SENSITIVE** — handle securely. Delivered via secure mechanism (encrypted PDF, password manager share, in-person, etc.). Not in plain email.

```markdown
# Credentials Handover — [Project Name]

**Project:** [Project Name]
**Date:** [Date]
**Delivery method:** [Secure mechanism — e.g., 1Password share]

> IMPORTANT: Treat this document as confidential. Change passwords for
> any accounts where you don't want agency to retain access.

---

## Platform admin

### [Platform Name] (Shopify / WordPress / etc.)
- **Admin URL:** [URL]
- **Account:** [client's account email]
- **Plan:** [tier]
- **Access:** [Owner / Admin / Staff role]
- **2FA:** [enabled / not enabled — recommend enable]

### Recommendations
- Add additional admin users via the platform
- Remove agency staff access if no ongoing engagement
- Enable 2FA on all admin accounts

---

## Repository / Code

- **Repository:** [GitHub URL]
- **Owner:** [client or agency — note]
- **Access for client:** [yes / no — invite to repo if yes]
- **CI/CD:** GitHub Actions (configured per workflow files in `.github/`)
- **Deployment tokens:** [stored as GitHub Secrets, not shared in this doc]

---

## Third-Party Integrations

### Klaviyo
- **Login URL:** https://www.klaviyo.com/login
- **Account:** [client's account]
- **API key location:** Account → API Keys (only if client needs)
- **Access:** Client owns the account; agency had access for setup, removed at handoff [yes/no]

### Judge.me
[Same structure]

### GA4
[Same structure]

### Meta Pixel / Business Manager
[Same structure]

### [Other integrations...]
[For each: login URL, account, access level, agency access status]

---

## Hosting / Infrastructure

For WordPress / Magento / Node.js:
- **Hosting provider:** [name]
- **Account URL:** [URL]
- **Server access (SSH):** [credentials / key handover process]
- **DNS provider:** [name]
- **DNS account:** [client's account]
- **SSL certificate:** [provider, renewal date]

---

## Domain Management

- **Domain registrar:** [name]
- **Domain account:** [client's account]
- **Renewal date:** [date]
- **Auto-renewal:** [enabled / disabled — RECOMMEND ENABLED]

---

## Email

If client emails go through a configured service:
- **Email provider:** [Google Workspace, Microsoft 365, etc.]
- **MX records:** [verified, pointing to correct service]

If transactional emails go through a service:
- **Provider:** [Mailgun, SendGrid, etc.]
- **Account:** [client's account]
- **Sender domain verified:** [yes]

---

## Backups & Monitoring

### Monitoring (UptimeRobot or similar)
- **Service:** [name]
- **Account:** [agency or client — note]
- **URL monitored:** [URL]
- **Alert recipients:** [emails — should include client + agency]

### Backups
- **Backup service:** [Shopify built-in / UpdraftPlus / custom]
- **Backup retention:** [N days]
- **Last backup before launch:** [date, retained]

---

## Security Recommendations

1. **Change all passwords** within 30 days of agency engagement ending (unless ongoing maintenance agreement).
2. **Enable 2FA** on every account listed above.
3. **Remove agency access** from accounts where ongoing access isn't needed.
4. **Review audit logs** in each platform monthly.
5. **Keep this document secure** — it's a sensitive asset.

---

## After Warranty Period

If you don't continue with our agency for maintenance, after warranty ends:

1. We will remove our team's access to your accounts (per your timing)
2. You should rotate API keys we had access to
3. You retain full ownership of all credentials and accounts above
4. We retain copies of project files (code, design assets) in our archive for reference

If you continue with us:
- We maintain access for ongoing work
- Periodic credential rotation is still recommended

---

For any questions about this document, contact [Internal PM].
```

---

## 4. Warranty Terms Summary

Per J8 (variable warranty options). Specific to this project's warranty length.

```markdown
# Warranty Terms — [Project Name]

**Project:** [Project Name]
**Warranty period:** [N] days
**Start date:** [Launch date]
**End date:** [Launch date + N days]

---

## What's Covered

During the warranty period, we will fix at no additional charge:

✓ Bug fixes for defects in delivered functionality
✓ Code issues introduced by our team during development
✓ Issues that prevent the site from functioning as specified
✓ Critical performance regressions (we'll investigate cause)
✓ Critical security issues (we'll patch immediately)

## What's NOT Covered

The following are NOT covered under warranty:

✗ New features or scope additions (quoted separately)
✗ Content updates (we provided you tools to edit)
✗ Design changes (quoted separately)
✗ Third-party app/plugin updates breaking compatibility (we may help fix; not free)
✗ Issues caused by edits made to the site outside our team
✗ Hosting / server issues beyond our control
✗ Domain/DNS issues
✗ Third-party tool outages or changes (Klaviyo, GA4, etc.)
✗ Browser-specific issues in deprecated browsers (e.g., old IE versions)
✗ Issues affecting custom code not built by us

## Bug Severity SLAs (Response Times)

When you report a bug, we triage it by severity and respond per these SLAs:

| Severity | Description | Response Time |
|----------|-------------|---------------|
| P1 | Site down, checkout broken, data loss, security issue | 4 business hours |
| P2 | Major feature broken, workaround exists | 1 business day |
| P3 | Minor functional issue, edge case | 3 business days |
| P4 | Cosmetic, polish | Best effort during warranty |

Note: "Response time" = when we acknowledge and begin work. Fix time varies by complexity.

## How to Report Issues

1. Email: [contact]
2. Include:
   - Brief description of issue
   - Steps to reproduce (what you did, what you saw)
   - Screenshot or screen recording if possible
   - Browser + device (Safari iPhone, Chrome Mac, etc.)
3. We triage within the SLA above and respond.

For URGENT issues (site down, transactions failing):
- Email + call: [Phone]

## What Happens After Warranty Ends

After [End date]:

- This warranty no longer applies
- Bug fix work becomes billable (ad-hoc rate: [rate])
- Optional maintenance retainer: [rate] / month, includes [scope]
- Major changes (new features, redesigns): quoted separately

You'll receive an end-of-warranty report at [End date] reminding you
of these options.

## Documenting Issues for Post-Warranty

We recommend keeping a running list of any minor issues that come up
during warranty (even ones we fix). At end of warranty, you'll have a
clearer picture of:
- What's working well
- What might need ongoing attention
- Where you might want to invest in optimization

We provide a template for this in the admin guide.

---

For questions about warranty coverage or to report an issue,
contact [Internal PM] at [contact].

[Signature line for client acknowledgment, if formal]
```

---

## README.md (handoff package index)

```markdown
# [Project Name] — Handoff Package

Welcome to your handoff package! This folder contains everything you need
to manage and understand your new [website / store] going forward.

## What's in this folder

### Start here
1. **admin-guide.md** — How to edit content, add products, manage your site day-to-day
2. **training-video.mp4** — 10-minute video walkthrough (link: [URL])

### Reference
3. **credentials-handover.md** — All third-party accounts + access (SENSITIVE — keep secure)
4. **warranty-terms.md** — What's covered, response times, how to report issues
5. **master-doc.md** — Technical reference for any future developer work

### Internal (for our records)
6. **client-memory.md** — Our notes for if/when we work together again (not for client review)

## How to use this package

- **Day-to-day:** refer to admin-guide.md
- **First time editing:** watch the training video
- **Need help:** check warranty-terms.md, then contact us
- **Future dev work:** share master-doc.md with any developer

## Contact

Primary contact: [Internal PM name + email]
Emergency contact: [Phone for urgent issues]

---

Welcome to your new site! We've enjoyed working on this with you.
```

---

## Anti-patterns

1. **Generic admin guide.** Each guide is project-specific. Templates need customization per build.

2. **Credentials in plain email.** Use secure delivery (password manager, encrypted file).

3. **Skipping training video.** Even a 10-minute video reduces support tickets significantly.

4. **Vague warranty terms.** Be specific about what's covered + SLAs.

5. **No README in the handoff folder.** Client opens folder, sees 6 files, doesn't know where to start.

6. **Forgetting to remove agency access at end of warranty (if not continuing).** Security risk + uncomfortable for client.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
