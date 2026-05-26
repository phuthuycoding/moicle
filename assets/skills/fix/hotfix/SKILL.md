---
name: fix-hotfix
description: Quick bug fix workflow with rollback plan. Use when fixing bugs, hotfixes, urgent issues, production bugs, or when user says "fix bug", "hotfix", "urgent fix", "production issue".
---

# Hotfix Workflow

Fast-track bug fix with a rollback plan. Use when the cause is identifiable in under an hour of investigation.

## When to use this skill

- ✅ Bug is reproducible and root cause is clear (or quickly identifiable)
- ✅ Need a fix shipped fast with a rollback plan
- ✅ Severity ranges from low (minor UI) to high (feature broken)
- ❌ Production is down right now → use `/fix:incident` first
- ❌ Bug has been "fixed" multiple times and keeps returning → use `/fix:root-cause`
- ❌ Building a new feature → use `/feature:new`

## Read Architecture First

Read `ddd-architecture.md` + stack-specific doc — the fix must land in the right layer (usecase / handler / infra) per architecture rules.

## Severity

Use `~/.claude/architecture/_shared/severity-levels.md` (incident table). Hotfix typically covers P2-P4. P1 → start with `/fix:incident` for triage / comms.

---

## Workflow

```
IDENTIFY → REPRODUCE → FIX → VERIFY → DEPLOY
                          ↑                ↓
                          └── ROLLBACK (if needed)
```

---

## Phase 1: IDENTIFY (≤15 min)

**Goal:** capture exactly what's broken — no speculation.

### Capture
- Error message / stack trace (verbatim)
- Steps to reproduce
- Expected vs actual behavior
- Environment (prod / staging / dev)
- Affected users (all / subset / specific tenant)
- Recent deploys / config changes (last 24-48h)

### 5 Whys (worked example)
> Q1: Why does checkout fail? A1: `OrderService.calculate` returns NaN.
> Q2: Why NaN? A2: `quantity * price` where price is undefined.
> Q3: Why undefined? A3: New SKUs from supplier feed have null price.
> Q4: Why null? A4: Feed schema added optional `price` field, defaulted to null.
> Q5: Why didn't validation catch it? A5: Import worker skips schema validation for "perf".

→ Root cause: skipped validation in import worker. Fix at the import boundary, not in checkout.

### Gate
- [ ] Error captured verbatim
- [ ] Reproduction steps known (or "intermittent" noted)
- [ ] Severity assigned (P2 / P3 / P4)
- [ ] Root cause identified (use `/fix:root-cause` if 5 Whys doesn't converge)

---

## Phase 2: REPRODUCE (≤30 min)

**Goal:** reproduce locally before changing any code.

### Steps
1. Check out the deployed commit (NOT main if main has drifted)
2. Reproduce with the exact data / inputs from Phase 1
3. If you can't reproduce → it's environment-specific. Check:
   - Env vars on prod vs local
   - DB state / data shape
   - Cache / CDN state
   - Runtime version differences

### Gate
- [ ] Reproduced locally on the deployed commit
- [ ] OR documented why local reproduction is impossible + plan to test on staging

---

## Phase 3: FIX

**Goal:** smallest correct change at the right layer.

### Rules
- Fix at the **root cause**, not the symptom
- Land the fix in the right layer (boundary validation → handler/DTO; business rule → usecase; data shape → infra mapper)
- **Add a regression test first** (RED), then make it pass (GREEN). See `/review:tdd`.
- Don't refactor on the fix — separate PR
- If the fix requires schema migration, plan it as 2 deploys (compatible code first, then migration)

### Boundary defense
For data-shape bugs (null where not expected, type mismatch from external API): defend at the **trust boundary** (handler / adapter), not inside business logic.

### Gate
- [ ] Regression test added (red → green)
- [ ] Fix is in the right layer (per architecture)
- [ ] No unrelated changes in the PR
- [ ] Existing tests still pass

---

## Phase 4: VERIFY

**Goal:** confirm fix works without breaking other paths.

### Local
- [ ] Original failure no longer reproducible
- [ ] All tests pass (`{test command}`)
- [ ] Linter clean
- [ ] Build green

### Staging (if available)
- [ ] Deploy to staging
- [ ] Reproduce the failure scenario — should pass
- [ ] Smoke-test adjacent features (anything sharing the code path)
- [ ] Monitor logs for 5-15 min

### Gate
- [ ] Local + staging both verified
- [ ] No regressions in adjacent features

---

## Phase 5: DEPLOY

### Pre-deploy checklist
- [ ] PR reviewed (`/review:branch` self + `/review:pr` from teammate)
- [ ] Rollback plan documented (see below)
- [ ] On-call notified
- [ ] CHANGELOG entry

### Rollback plan
Document **before** deploying:
- Rollback method: `revert PR` / `redeploy commit {sha}` / `feature flag off` / `DB migration down`
- Estimated rollback time
- Who has authority to roll back (usually IC or on-call)
- Signal to roll back (specific metric + threshold)

### Deploy steps
1. Deploy via normal pipeline (don't skip CI even under pressure)
2. Watch metrics + logs for the symptom + adjacent code paths
3. Hold deploy attention for at least 1× normal request cycle (15-30 min)

### Gate
- [ ] Deployed successfully
- [ ] Symptom no longer occurring
- [ ] No new errors in monitoring
- [ ] Stakeholders notified

---

## Phase 6: ROLLBACK (if Phase 5 verify fails)

### When to roll back
- Error rate increases post-deploy
- New error type appears
- Adjacent feature breaks
- Performance degrades meaningfully

### How
1. Announce: "Rolling back {fix} in 60s due to {observation}"
2. Execute: revert / redeploy previous / flip flag / migration down
3. Verify rollback: metrics return to baseline
4. Post-mortem the rollback — what was missed in Phase 3/4?

---

## Final Report

```markdown
## Hotfix: {short description}

### Root cause
{From Phase 1, 5 Whys final answer}

### Fix
- File: `path/to/file:line`
- Layer: {handler / usecase / infra / etc.}
- Approach: {boundary defense / logic correction / data migration}

### Tests
- Regression test: {file:line}
- All tests passing

### Deploy
- Deployed: {timestamp}
- Verified: {timestamp + how}
- Rollback plan: {revert / redeploy / flag / migration}

### Severity: {P2 / P3 / P4}
### Status: SHIPPED ✅ (or ROLLED BACK + reason)
```

---

## Hard Rules

- **Reproduce before fixing** — no fix lands without local repro
- **Regression test required** — every fix gets a test that would have caught it
- **Fix at the root, not the symptom** — patching the symptom invites the bug back
- **No drive-by refactor** — fix PR is focused, refactor goes in a separate PR
- **Always have a rollback plan** documented before deploy
- **Don't skip CI** under pressure — bypassing CI is what causes the next incident

---

## Related Skills

| When | Use |
|------|-----|
| Production is down right now | `/fix:incident` first, then hotfix |
| Bug keeps coming back after fixes | `/fix:root-cause` |
| Need to write regression test first | `/review:tdd` |
| Bug is on an open PR | `/fix:pr-comment` |
| Self-review before opening PR | `/review:branch` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| IDENTIFY | Stack-specific dev agent | Read error context |
| FIX | Stack-specific dev agent | Apply the fix |
| FIX | `@security-audit` | Security-related bugs |
| VERIFY | `@test-writer` | Regression test |
| VERIFY | `@code-reviewer` | Quick code review |
| DEPLOY | `@devops` | CI/CD + monitoring |
