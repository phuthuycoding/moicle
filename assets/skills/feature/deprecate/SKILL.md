---
name: feature-deprecate
description: Deprecation workflow for safely removing features or code. Use when deprecating, removing features, sunsetting functionality, or when user says "deprecate", "remove feature", "sunset", "phase out", "delete feature".
---

# Deprecation Workflow

Safely sunset a feature, API, or module without breaking users. Built around a **timeline** (T-90 → T+30) and the principle that **announce → warn → migrate → remove → monitor**.

## When to use this skill

- ✅ Sunsetting a public API endpoint, SDK method, or user-facing feature
- ✅ Removing an internal module that other domains depend on
- ✅ Migrating consumers from v1 → v2 of anything
- ❌ Just deleting unused dead code (no consumers) → just delete in PR with explanation
- ❌ Renaming an internal helper → just rename, no deprecation needed
- ❌ Removing a feature behind a flag with 0 users → just remove the flag

---

## Workflow

```
IDENTIFY → PLAN → MIGRATE → REMOVE → VERIFY
   ↓        ↓        ↓         ↓        ↓
 announce  warn   migrate   remove   monitor
 (T-90)  (T-60)  (T-30)     (T-0)   (T+30)
```

## Read Architecture First

Read `~/.claude/architecture/ddd-architecture.md` + stack doc to understand layer impact before any deprecation.

---

## Deprecation Strategy

| Strategy | When | Timeline |
|----------|------|----------|
| **Soft** | Internal API, replacement available, low usage | Announce → warn → migrate → remove (1–3 months) |
| **Hard** | Security issue, breaking infra change | Announce + remove fast (days to weeks, with mitigation) |
| **Versioned** | Public API, breaking change | Run v1 + v2 side-by-side, sunset v1 over months/years |

---

## Phase 1: IDENTIFY

**Goal:** know what you're removing and who depends on it.

### Actions
1. Define the target: feature / endpoint / module / class / method
2. Find ALL usages:
   ```bash
   # adapt per stack
   grep -rn "{symbol}" --include="*.{ext}" .
   # for APIs, check access logs:
   {log_query for endpoint hits over last 30/90 days}
   ```
3. Identify consumers:
   - Internal teams / services
   - External users / SDK consumers
   - Third-party integrations
   - Docs and tutorials that reference it
4. Assess impact (per architecture layer):
   - Which layers reference it (domain / application / infra)?
   - Cross-domain consumers?
   - Breaking change severity?
5. Find replacement (or document "no replacement, here's the workaround")

### Output

```markdown
## Deprecation Analysis: {target}

### What
- Type: {feature / API / class / method / module}
- Location: {file:line(s)}
- Reason: {security / consolidation / better alternative / cost / etc.}

### Replacement
- {New API / pattern, with migration mapping}
- OR: {no replacement — rationale}

### Usage
- Internal callers: {list with team contacts}
- External callers (last 30d): {N requests / N unique tokens}
- Docs referencing it: {list}

### Impact
- Layers affected: {domain / application / infra}
- Severity: {breaking / non-breaking}
- Estimated migration effort per consumer: {hours}
```

### Gate
- [ ] All usages found (internal + external)
- [ ] Stakeholders listed with contacts
- [ ] Replacement defined (or explicit "no replacement")
- [ ] Impact severity assessed

---

## Phase 2: PLAN

**Goal:** lock the timeline and the communication plan.

### Timeline template

| Phase | Date | Action |
|-------|------|--------|
| T-90 | {date} | Announce deprecation (changelog + email + docs banner) |
| T-60 | {date} | Add runtime warning (log / response header) |
| T-30 | {date} | Hard warning (UI banner / error in non-prod) |
| T-0 | {date} | Remove. Return 410 Gone for APIs |
| T+30 | {date} | Remove deprecation code itself, archive docs |

**Adjust** based on strategy: hard = days, public API = months/quarters.

### Comms checklist
- [ ] CHANGELOG entry
- [ ] Release notes
- [ ] Email to known consumers
- [ ] Docs banner on the deprecated feature page
- [ ] Migration guide written (with code diff before/after)
- [ ] Slack / forum announcement
- [ ] Updated SDK (if applicable) with deprecation in code

### Gate
- [ ] Timeline locked with dates
- [ ] Migration guide drafted
- [ ] Comms plan signed off by stakeholders
- [ ] Replacement available and documented

---

## Phase 3: MIGRATE

**Goal:** make consumers stop using the deprecated thing.

### Add deprecation markers (in code)

Pick the language idiom — show **what** is deprecated, **when** it goes away, and **what to use instead**.

```ts
/** @deprecated Removed on {date}. Use `newFunction()`. See {link}. */
export function oldFunction() { ... }
```

```go
// Deprecated: removed on {date}. Use NewFunction instead. See {link}.
func OldFunction() { ... }
```

```php
/**
 * @deprecated since 2.0.0, removed in 3.0.0. Use newMethod(). See {link}.
 */
public function oldMethod() { ... }
```

```dart
@Deprecated('Removed on {date}. Use newWidget(). See {link}.')
class OldWidget { ... }
```

### Add runtime signal (for APIs)
- Response header: `Deprecation: true` + `Sunset: {RFC 3339 date}` + `Link: <docs>; rel="deprecation"`
- Server log: `deprecated.endpoint.called` with caller identity
- Metric: counter of deprecated calls, broken down by consumer

### Migrate internal consumers proactively
- Open PRs against internal consumers yourself when possible
- Track migration progress (% consumers migrated)

### Gate
- [ ] Deprecation markers in code
- [ ] Runtime signals in place (headers, logs, metrics)
- [ ] Internal usage trending down (verify weekly)
- [ ] Migration guide proven by ≥1 consumer

---

## Phase 4: REMOVE

**Goal:** delete the deprecated thing safely.

### Pre-removal checks
- [ ] Today's date ≥ T-0
- [ ] Usage metric shows 0 calls (or only known stragglers with explicit waiver)
- [ ] Final removal warning sent to remaining consumers
- [ ] Replacement still works and is documented

### Removal steps
1. Delete the code + tests + docs
2. For APIs: return `410 Gone` (NOT 404 — different meaning) with migration link in body
3. Remove DB columns / tables in a follow-up migration (NOT same PR — keep removal reversible)
4. Update CHANGELOG: "Removed: {thing}. See migration guide {link}."
5. Deploy through normal pipeline

### Gate
- [ ] Code, tests, docs removed
- [ ] API returns 410 (if applicable)
- [ ] CHANGELOG entry
- [ ] Deployed to all environments

---

## Phase 5: VERIFY (T+30)

**Goal:** confirm clean removal.

### Checks
- [ ] No errors related to the removed code in monitoring
- [ ] No customer support tickets about the missing feature
- [ ] No leftover references in code (grep for the symbol)
- [ ] Deprecation infra (warning headers, log alerts) cleaned up
- [ ] DB cleanup migration applied (if any)

### Final report

```markdown
## Deprecation Complete: {target}

### Timeline
- Announced: {date}
- Removed: {date}
- Verified: {date}

### Outcome
- Consumers migrated: {N/N}
- Errors post-removal: {0 / N — explanation}
- Replacement adoption: {%}

### Cleanup
- [x] Code removed
- [x] Tests removed
- [x] Docs removed
- [x] DB columns dropped (in {migration})
- [x] Deprecation infra cleaned
```

---

## Anti-Patterns

- **Silent removal** — removing without warning. Always announce first.
- **Vague deprecation** — `@deprecated` with no date and no replacement. Always include both.
- **Forever-deprecation** — marking deprecated and never removing. Set the date.
- **Returning 404 instead of 410** — 404 = "doesn't exist", 410 = "intentionally gone". Use 410.
- **Same-PR removal of API + DB columns** — keep removal reversible; drop columns in a follow-up.

---

## Related Skills

| When | Use |
|------|-----|
| Adding the replacement first | `/feature:new` |
| Restructuring the code that uses the deprecated thing | `refactor` |
| Documenting the migration guide | `/docs:write` |
| Reviewing the removal PR | `/review:pr` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| IDENTIFY | `@refactor` | Dependency analysis |
| IDENTIFY | `@code-reviewer` | Find all usages |
| PLAN | `@clean-architect` | Migration strategy |
| PLAN | `@api-designer` | API versioning |
| PLAN | `@docs-writer` | Deprecation notice + migration guide |
| MIGRATE | Stack-specific dev agent | Code changes |
| VERIFY | `@test-writer` | Migration tests |
| VERIFY | `@code-reviewer` | Final review |
