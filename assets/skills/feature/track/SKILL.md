---
name: feature-track
description: Tracked development loop — first brainstorm + plan and get user approval, THEN checkout a branch, build a task checklist, and loop each item through test → implement → verify → fix → mark done → commit (one commit per item). Use when user says "bắt đầu loop", "làm track này", "tracked loop", "checklist driven dev", "run the loop", "checkout branch and start track", "brainstorm rồi làm track", "implement with checklist and commit per task".
args: "[TASK_DESCRIPTION]"
---

# Tracked Development Loop

Run a multi-step task as a controlled loop: **brainstorm + plan first, get approval, THEN** checkout a branch, turn the plan into a task checklist, and drive each item through test → implement → verify → fix → mark done → commit — **one commit per item**.

**ARGUMENTS:** `<task description>` — e.g., `wallet savings account`, `add rate limiting to auth`, `migrate orders module to events`

## When to use this skill

- ✅ A task that splits into several verifiable steps you want to drive as a checklist
- ✅ You want a clean history — one commit per completed step, easy to revert
- ✅ You want test-first discipline on each step, on a dedicated branch
- ❌ One-line / obvious change → just do it
- ❌ Urgent production bug → use `/fix-bug` (QUICK mode)
- ❌ Single full DDD feature across all layers → use `/feature-build` (NEW mode)
- ❌ Driving ONE unit test-first with no branch/checklist → use `/review-code` (TDD mode)

## Read Architecture First

Detect stack via `~/.claude/architecture/_shared/stack-detection.md`. The stack doc tells you:
- Test command + test file location convention
- Build + lint commands (for the VERIFY step)
- Mocking pattern for ports / dependencies

---

## Workflow

```
0 BRAINSTORM & PLAN ─▶ [USER APPROVES] ─▶ 1 SETUP ─▶ ┌─ 2 LOOP per item ──────────────────────┐ ─▶ 3 REPORT
(understand, /brainstorm,(last step of      (branch +  │ TEST → IMPLEMENT → VERIFY → FIX →       │
 plan + draft checklist)  planning)          checklist) │ MARK DONE → COMMIT                      │
                                                        │      └ fail ─▶ FIX ─▶ VERIFY (to pass) │
                                                        └─────────── next pending item ──────────┘
```

> Core rule: **brainstorm and plan, the LAST planning step is user approval, THEN start the loop.** Never jump straight to branch/checklist.

---

## Phase 0: BRAINSTORM & PLAN

**Goal:** understand the task, pick the simplest viable approach, draft the checklist — and get the user to approve before touching anything.

### Steps
1. **Detect stack** — load the matching architecture doc for test/build/lint commands and conventions.
2. **Understand the task** — read the relevant code/context. If `[TASK_DESCRIPTION]` is ambiguous (scope, acceptance criteria, edge cases), ask to clarify (AskUserQuestion). Don't assume.
3. **Brainstorm the approach — invoke `/brainstorm`** to generate and compare options for the task (First Principles, SCAMPER, Working Backwards, 5 Whys…), then pick the simplest that works. For a trivial/obvious task a quick single-framework pass is enough — don't overengineer, but don't skip the step.
4. **Draft the plan** — settle:
   - the chosen approach,
   - a proposed branch name (`feat/<slug>`),
   - the **draft checklist** — each item = one verifiable unit = one test passing + one commit,
   - files affected + how each item is tested.
5. **Present the plan and WAIT for approval.** This is the last step of planning. No branch, no code, no `TaskCreate` yet.

### Gate
- [ ] Stack detected
- [ ] Requirements clear (clarified if they weren't)
- [ ] Approach brainstormed via `/brainstorm` (simplest viable picked)
- [ ] Plan + draft checklist presented
- [ ] **User APPROVED the plan**

---

## Phase 1: SETUP

**Goal:** turn the approved plan into a branch + a live checklist. Runs only AFTER approval.

### Steps
1. **Checkout a new branch** with the approved name (`feat/<slug>`) off the current base. Never run the loop on `master` / `main`.
2. **Create the checklist** with `TaskCreate` — one task per checklist item, in order, matching the approved plan.

### Gate
- [ ] New branch created and checked out
- [ ] Checklist created via `TaskCreate`, matching the approved plan

---

## Phase 2: LOOP (per item)

Take the next `pending` item from the task list and run it through the full cycle. Repeat until no `pending` items remain.

1. **MARK IN_PROGRESS** — `TaskUpdate` the item → `in_progress`.
2. **TEST (RED)** — write a unit test describing the item's behavior. Run it and confirm it **fails for the right reason** (code missing / assertion fails), not a typo or import error.
3. **IMPLEMENT (GREEN)** — write the minimal code to make the test pass. Follow an existing reference module so it matches the codebase style.
4. **VERIFY** — actually run it: the item's test + build + lint (commands per stack). Never claim pass without running.
5. **FIX** — if anything fails, fix at the **root, never swallow the error** (handle exceptions explicitly — no empty catch). Then go back to VERIFY until green.
6. **MARK DONE** — `TaskUpdate` the item → `completed`.
7. **COMMIT** — commit just this item with a conventional message (`feat:` / `fix:` / `test:` / `refactor:` …). Commit only — **do not push automatically**.

### Gate (per item, before moving on)
- [ ] Test green
- [ ] Build + lint green
- [ ] Task marked `completed`
- [ ] Item committed (one commit)

---

## Phase 3: Final Report

```markdown
## Track Complete: {task}

Branch: `feat/{slug}`

| # | Item | Test(s) | Commit | Status |
|---|------|---------|--------|--------|
| 1 | {item} | {test name} | {hash} `feat: …` | ✅ |
| 2 | {item} | {test name} | {hash} `feat: …` | ✅ |

### Totals
- Items: {N} done / {N}
- Commits: {N}
- Tests added: {N}, all green

### Next
- Push + open PR, or run `/review-code` (SELF mode) first
```

---

## Hard Rules

- **Plan + user approval FIRST** — no branch, no code until the plan is approved.
- **Branch first** — never run the loop on `master` / `main`.
- **RED before GREEN** — no production code that a failing test didn't drive.
- **Verify by running real commands** — never assert pass from inspection alone.
- **Never swallow errors** in FIX — handle exceptions explicitly, fix the root cause.
- **One commit per item** — don't squash steps together, don't push automatically.
- **DB operations (migrate / seed / drop)** inside any item: **CONFIRM with the user before running — every time, even if a previous item was already confirmed.**
- **Simple first** — don't overengineer an item.

---

## Related Skills

| When | Use |
|------|-----|
| Need idea frameworks for Phase 0 | `/brainstorm` |
| Drive ONE unit deeper test-first | `/review-code` (TDD mode) |
| Full DDD feature across all layers | `/feature-build` (NEW mode) |
| Self-review the branch after the loop | `/review-code` (SELF mode) |
| Urgent prod bug, no checklist | `/fix-bug` (QUICK mode) |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| BRAINSTORM / PLAN | `@clean-architect` | Approach + decomposition |
| TEST | `@test-writer` | Failing test per item |
| IMPLEMENT | Stack-specific dev agent | Minimal implementation |
| VERIFY / FIX | `@code-reviewer` | Catch issues before commit |
