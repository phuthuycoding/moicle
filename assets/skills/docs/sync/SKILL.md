---
name: docs-sync
description: Sync documentation workflow - reads codebase and docs folder to generate structured output docs with architecture, use cases, diagrams, and README index. Includes automated review loop. Use when user says "sync docs", "sync documentation", "generate docs", "update docs sync", "doc sync".
---

# Sync Docs Workflow

Generate a complete `docs/` site (business overview, architecture, use cases with sequence diagrams, README index) from the current codebase. Includes a 3-iteration auto-review loop.

## When to use this skill

- ✅ Re-generate the whole `docs/` site from current code
- ✅ Existing docs have drifted; want batch sync with review loop
- ✅ Project has no structured docs at all
- ❌ Authoring a single doc by hand (README / API.md only) → use `/docs-write`
- ❌ Understand the codebase, not document it → use `/research-onboarding`
- ❌ Adding doc for one endpoint → use `/feature-api` Phase 4

## Read Architecture First

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. Read `ddd-architecture.md` + stack doc.

---

## Workflow

```
SCAN → CONFIRM mode → GENERATE → REVIEW loop (≤3x) → COMPLETE
```

`CONFIRM` asks the user to pick **REFACTOR** (full restructure of `docs/`) or **UPDATE** (keep existing structure, refresh content).

---

## Phase 1: SCAN

**Goal:** map codebase + existing docs in one pass.

```bash
# Existing docs
find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/vendor/*" -not -path "*/.dart_tool/*" | sort
ls docs/ 2>/dev/null

# Code surface
tree -L 4 -I 'node_modules|vendor|dist|build|.dart_tool|.git'

# Entry points / use cases (per stack)
# Go:       grep -r "func.*Handler" internal/
# NestJS:   grep -r "@Controller\|@Get\|@Post" src/
# Laravel:  cat routes/web.php routes/api.php
# Remix:    ls app/routes/
# Flutter:  grep -r "MaterialPageRoute\|GoRoute" lib/
```

### Extract
- Stack + framework
- All domains / modules
- All user-facing flows (endpoints / screens / commands)
- Existing docs structure (if any)

### Gate
- [ ] Stack identified
- [ ] All domains listed
- [ ] All use cases listed (count + brief name)
- [ ] Existing docs inventoried

---

## Phase 1.5: CONFIRM

Ask the user **explicitly** which mode:

| Mode | When to use | Effect |
|------|-------------|--------|
| **REFACTOR** | Existing docs are messy / partial / wrong structure | Restructure `docs/` from scratch, may delete old files |
| **UPDATE** | Existing structure is fine, content is stale | Keep file paths + headings, refresh content + add missing sections |

If the user is unsure: default to **UPDATE** (less destructive).

### Gate
- [ ] User confirmed mode
- [ ] If REFACTOR: explicit OK to remove old files

---

## Phase 2: GENERATE

**Goal:** produce the target `docs/` tree.

### Target structure (REFACTOR mode)

```
docs/
├── README.md              # Index linking to everything below
├── business.md            # WHAT the system does, for non-engineers
├── architecture.md        # HOW it's structured (layers + domains + tech)
├── use-cases/
│   ├── README.md          # Index of use cases
│   ├── <use-case-1>.md    # One file per user-facing flow, with sequence diagram
│   └── ...
├── api.md                 # If service has external API
└── runbook.md             # How to run / deploy / debug
```

### File rules

**`docs/README.md`** — index only (≤30 lines).
- One-line description, link to each sub-doc, last-updated timestamp.

**`docs/business.md`** — for non-engineers.
- NO API endpoints, NO code blocks, NO file paths
- Cover: what problem this solves, who uses it, key user journeys (named like a PRD), success metrics
- Plain language, no jargon

**`docs/architecture.md`** — for engineers.
- Layer diagram (mermaid)
- Domain list with 1-line responsibility
- Cross-domain communication pattern
- Tech decisions (DB, queue, cache, auth — with rationale)
- Link to `~/.claude/architecture/<stack>.md` for layer rules

**`docs/use-cases/<name>.md`** — one per flow.
- Trigger (who, what action)
- Preconditions
- Sequence diagram (mermaid `sequenceDiagram`) showing actor → handler → usecase → infra → response
- Postconditions / side effects (events raised, notifications sent)
- Errors (each with HTTP code + meaning)

**`docs/api.md`** — only if external API exists.
- Auth, base URL, error format, pagination — then endpoint table
- For deep API ref, link to OpenAPI spec

**`docs/runbook.md`** — for ops / on-call.
- Local dev (≤5 commands)
- Deploy steps
- Common failures + how to recover
- Monitoring dashboards + log queries

### Mermaid rules

- Sequence diagrams for use cases
- Class diagrams only when ER is non-obvious
- Validate syntax: `mermaid-cli` if available, otherwise eyeball test
- ≤7 actors per sequence (split if more)

### Gate
- [ ] All target files written
- [ ] business.md has zero code / endpoints
- [ ] Every use case has a sequence diagram
- [ ] README.md links to every file
- [ ] All file paths in docs resolve (no broken references)

---

## Phase 3: REVIEW LOOP (≤3 iterations)

**Goal:** auto-check + fix until docs pass.

For each iteration:

### 3.1 Structure
- [ ] All target files exist
- [ ] README.md links resolve
- [ ] No duplicate content across files

### 3.2 Business
- [ ] business.md uses plain language (no `API`, `JSON`, `class`, file paths)
- [ ] business.md covers all top-level user journeys

### 3.3 Architecture
- [ ] Layer diagram matches actual code structure
- [ ] Every code domain has a row in domain table

### 3.4 Use cases
- [ ] One file per identified use case (Phase 1)
- [ ] Each has trigger / preconditions / sequence / postconditions / errors
- [ ] Sequence diagrams render

### 3.5 Consistency
- [ ] Same terminology everywhere (e.g., "domain" vs "module")
- [ ] No file paths referenced that don't exist
- [ ] No endpoints referenced that don't exist in code

### Loop
- If any check fails → fix that section, restart the relevant subset of checks
- Max 3 iterations; if still failing → report what's blocking + ask user

---

## Phase 4: COMPLETE

```markdown
## Docs Sync Complete

### Mode: {REFACTOR / UPDATE}

### Files
- Created: {N}
- Updated: {N}
- Deleted: {N — REFACTOR mode only}

### Coverage
- Domains documented: {N/N}
- Use cases documented: {N/N}
- Diagrams: {N}

### Review iterations: {1/2/3}

### Next steps for the team
- Review `docs/business.md` with product
- Validate `docs/use-cases/*.md` flows with team leads
- Set up doc lint in CI (broken-link checker)
```

---

## Hard Rules

- **business.md is for humans** — strip jargon, no code, no file paths
- **architecture.md links to canonical rules**, doesn't duplicate them
- **One use case per file** — easier to update, easier to review
- **Mermaid only if it renders** — broken diagrams worse than no diagrams
- **REFACTOR mode requires explicit user OK** — never delete docs without confirmation
- **Max 3 review iterations** — beyond that, the prompt or scope is the problem, not the docs

---

## Related Skills

| When | Use |
|------|-----|
| Author single doc by hand | `/docs-write` |
| Onboard self / new dev | `/research-onboarding` |
| Doc only one new endpoint | `/feature-api` Phase 4 |
| Architecture itself needs review | `/review-architect` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| SCAN | `@clean-architect` | Identify domains + patterns |
| GENERATE | `@docs-writer` | Write all doc files |
| GENERATE | `@api-designer` | API reference accuracy |
| GENERATE | `@db-designer` | Data model accuracy |
| REVIEW | `@code-reviewer` | Verify code refs resolve |
