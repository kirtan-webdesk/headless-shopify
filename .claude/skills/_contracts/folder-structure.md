---
tier: 2
load_when: ["misc"]
---

# WebDesk AI Delivery System — Folder Structure

This is the canonical layout for the entire system. Every skill, knowledge file, template, and artifact has a defined home. Do not deviate without updating this document.

## Top-level structure

```
/skills/
├── _spine/                          # Universal skills (platform-agnostic)
│   ├── orchestrator/                # Master conductor
│   ├── pm-agent/                    # SOW intake, planning
│   ├── designer-agent/              # Brand questionnaire, design system
│   ├── qa-agent/                    # Universal QA framework
│   ├── delivery-head/               # Pre-launch + handoff
│   └── shared-knowledge/            # Cross-platform standards
│
├── shopify/                         # Shopify platform arm
│   ├── SKILL.md                     # Platform entry point
│   ├── knowledge/                   # Agency standards for Shopify
│   ├── examples/                    # Real reference code
│   ├── templates/                   # Scaffolding templates
│   ├── pointers/                    # External doc anchors
│   └── projects/                    # Project-type skills
│       ├── redesign/
│       ├── new-development/
│       ├── migration/
│       ├── version-upgrade/
│       └── maintenance/
│
├── wordpress/                       # Same structure as shopify/
├── magento/                         # Same structure as shopify/
├── nodejs/                          # Same structure as shopify/
├── bigcommerce/                     # Same structure as shopify/
│
└── _contracts/                      # Schemas and protocols
    ├── project-json.schema.json
    ├── spec-template.md
    ├── gate-format.md
    ├── handoff-block.md
    └── artifact-versioning.md
```

## Inside each platform arm

```
/skills/shopify/
├── SKILL.md                         # Entry point — pointers only, < 200 lines
├── knowledge/
│   ├── 00-overview.md
│   ├── 01-coding-standards.md
│   ├── 02-naming-conventions.md
│   ├── 03-accessibility.md
│   ├── 04-performance-budget.md
│   ├── 05-security-baseline.md
│   ├── 06-section-patterns.md
│   ├── 07-cart-and-checkout.md
│   ├── 08-app-integrations/
│   │   ├── klaviyo.md
│   │   ├── judge-me.md
│   │   ├── recharge.md
│   │   └── _approved-apps.md
│   ├── 09-forbidden.md              # CRITICAL: what never to do
│   ├── 10-seo-baseline.md
│   ├── changelog.md
│   └── version.md
├── examples/
│   ├── sections/
│   │   ├── hero-banner.liquid
│   │   ├── product-grid.liquid
│   │   └── collection-list.liquid
│   ├── snippets/
│   ├── templates/
│   ├── settings_schema.json
│   └── README.md                    # When and how to use these
├── templates/
│   ├── new-section.liquid
│   ├── new-snippet.liquid
│   └── new-app-block.liquid
├── pointers/
│   ├── shopify-docs.md              # Anchored URLs + API version
│   ├── deprecations.md
│   └── mcp-tools.md
└── projects/
    └── redesign/
        ├── SKILL.md                 # Project-type entry
        ├── knowledge/
        │   ├── 01-seo-preservation.md
        │   ├── 02-design-system-audit.md
        │   ├── 03-content-inventory.md
        │   └── 04-redirect-strategy.md
        ├── templates/
        │   ├── audit-report.md
        │   └── redirect-map.csv
        └── gates.md                 # Project-type specific gates
```

## Inside the spine

```
/skills/_spine/
├── orchestrator/
│   ├── SKILL.md
│   ├── knowledge/
│   │   ├── routing-table.md
│   │   ├── gate-protocol.md
│   │   ├── escalation-paths.md
│   │   └── state-management.md
│   └── README.md
├── pm-agent/
│   ├── SKILL.md
│   ├── knowledge/
│   │   ├── 01-sow-intake-protocol.md
│   │   ├── 02-clarification-questions.md
│   │   ├── 03-milestone-framework.md
│   │   ├── 04-estimation-framework.md
│   │   ├── 05-risk-log-standards.md
│   │   └── 06-sprint-rules.md
│   └── templates/
│       ├── spec-template.md
│       ├── milestone-template.md
│       └── sprint-brief-template.md
├── designer-agent/
│   ├── SKILL.md
│   ├── knowledge/
│   │   ├── 01-brand-questionnaire.md       # 22 questions
│   │   ├── 02-design-path-decision.md
│   │   ├── 03-token-system-standards.md
│   │   ├── 04-wcag-requirements.md
│   │   ├── 05-cro-principles.md
│   │   └── 06-mobile-first-rules.md
│   └── templates/
│       ├── design-tokens.schema.json
│       └── section-map.schema.json
├── qa-agent/
│   ├── SKILL.md
│   ├── knowledge/
│   │   ├── 01-qa-modules.md                # 8 modules defined
│   │   ├── 02-bug-severity-matrix.md       # P1-P4 with SLAs
│   │   ├── 03-responsive-breakpoints.md
│   │   ├── 04-lighthouse-thresholds.md
│   │   └── 05-regression-protocol.md
│   └── templates/
│       └── bug-report.md
├── delivery-head/
│   ├── SKILL.md
│   ├── knowledge/
│   │   ├── 01-prelaunch-checklist.md       # 40 points, fully defined
│   │   ├── 02-publish-protocol.md
│   │   ├── 03-rollback-procedure.md
│   │   ├── 04-client-report-template.md
│   │   └── 05-handoff-guide-template.md
│   └── templates/
│       ├── client-report.md
│       ├── handoff-guide.md
│       └── archive-package.md
└── shared-knowledge/
    ├── code-review-standards.md
    ├── git-branch-strategy.md
    ├── pr-template.md
    ├── security-baseline.md
    └── ai-output-verification.md
```

## Per-project workspace (lives outside /skills/)

Each client project gets its own workspace folder. The agent reads from /skills/ and writes to the project workspace.

```
/projects/[client-name]/
├── project.json                     # State file (locked, versioned)
├── project.json.lock                # Lock file
├── project.json.versions/           # Auto-backup of every write
│   ├── 2026-05-24T10-00-00.json
│   └── ...
├── spec.md                          # Generated by PM agent
├── design-tokens.json               # Generated by designer agent
├── section-map.json                 # Generated by designer agent
├── milestones.json                  # Generated by PM agent
├── audit-log.jsonl                  # Append-only log of all actions
├── handoff-blocks/                  # Inter-agent handoffs
│   ├── pm-to-designer.md
│   ├── designer-to-frontend.md
│   └── ...
├── qa-reports/
│   ├── sprint-1-qa.md
│   └── ...
├── budget.json                      # Token + hours tracking
└── final-deliverables/
    ├── client-report.pdf
    ├── handoff-guide.pdf
    └── archive.zip
```

## Rules of the road

1. **Never put platform-specific content in /skills/_spine/.** If a file mentions Liquid, Shopify, WP_Query, or any platform name, it does not belong in the spine.
2. **Never put universal logic in a platform arm.** If the same rule applies to all platforms, it lives in /skills/_spine/shared-knowledge/.
3. **Project-type skills live inside the platform arm.** A Shopify redesign is more like a WordPress redesign than it is like a Shopify migration in some ways, but it's still 70% platform-specific code work. Inheritance is from platform, not project-type.
4. **All schemas live in /skills/_contracts/.** Schema changes are versioned and reviewed.
5. **Examples beat rules.** Every knowledge file should reference at least one example file.

---

Last reviewed: 2026-05-24 by Claude (initial)
Next review due: 2026-08-24
