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

## Read the project first

Detect stack via `~/.claude/architecture/_shared/stack-detection.md` for:
- Test command + test file location convention
- Build + lint commands (for the VERIFY step)
- Mocking pattern for dependencies

Then see `~/.claude/architecture/_shared/read-project-first.md`: the checklist and every item's implementation must match the pattern THIS project already uses (read a similar existing feature first) — not an assumed DDD layout.

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

**Goal:** understand the task deeply, pick the simplest approach that fits THIS project, decompose it into a high-quality checklist, self-critique the plan, and get the user to approve before touching anything. **A tracked loop is only as good as this plan** — a sloppy Phase 0 makes the whole loop sloppy, so this is where the rigor goes.

> **Fast-path:** for a trivial/obvious task, collapse steps 3 & 5 into one quick pass — don't turn a one-item change into ceremony. The rigor below is for real multi-item tasks.

### Steps

1. **Detect stack + read the project.** Get test/build/lint commands (`_shared/stack-detection.md`), then read 1–2 existing features closest to this task **end-to-end**. Write 2–3 lines capturing the *real* conventions (structure, naming, where logic lives, test style, wiring) — this proves you understood the codebase instead of guessing, and it's the pattern every item must match. See `_shared/read-project-first.md`.

2. **Clarify if ambiguous.** If scope, acceptance criteria, or edge cases are unclear, ask (AskUserQuestion) before planning. Don't assume.

3. **Choose the approach — brainstorm ≥2 options.** Invoke `/brainstorm` (First Principles, SCAMPER, Working Backwards, 5 Whys…). Compare options on effort / risk / blast-radius and pick the **simplest that fits the project's existing pattern**. Note in one line why the runner-up lost.
   - **Unknown too big?** If you can't tell which approach works without building, STOP planning and run `/research-explore` (SPIKE) first, then return. Never commit a checklist around a guess.

4. **Decompose into a checklist — every item must pass this rubric:**
   - **Vertical slice** — delivers one behavior testable on its own (not "all models" then "all handlers").
   - **Independently testable** — a single failing test can describe it.
   - **Right-sized** — one focused commit; needs two unrelated tests → split it; can't stand alone → merge it up.
   - **Ordered by dependency** — earlier items unblock later ones.
   - **Matches the project** — files/naming mirror the reference feature from step 1, not a textbook layer.

   Any item failing the rubric → split, merge, or reorder until it passes.

5. **Self-challenge the plan — invoke `/challenge`.** Before showing the user, poke holes: over- or under-engineered? missing an edge case or acceptance criterion? wrong item order? any hidden **DB migration / security / performance** work? imposing structure this codebase doesn't use? Refine, then present.

6. **Present the plan doc and WAIT for approval.** The last planning step — no branch, no code, no `TaskCreate` yet.

```markdown
## Track Plan: {task}

### Goal + acceptance
{What "done" means for the whole track — the observable outcome.}

### Project fit (from step 1)
{The reference feature you read + the conventions each item will follow.}

### Approach
{Chosen approach} — picked over {runner-up} because {one line}.

### Checklist
| # | Item (vertical slice) | Test that proves it | Files (match reference) |
|---|-----------------------|---------------------|-------------------------|
| 1 | … | … | … |
| 2 | … | … | … |
Proposed branch: `feat/<slug>`

### Risks / rollback
{Edge cases + any DB-migration / security / perf flag to confirm before that item runs.}
```

### Gate
- [ ] Stack detected + reference feature read (project pattern captured in 2–3 lines)
- [ ] Requirements clear (clarified if they weren't)
- [ ] ≥2 approaches compared, simplest project-fitting one picked (or SPIKE run for unknowns)
- [ ] Checklist drafted — **every item passes the rubric**
- [ ] Plan self-challenged via `/challenge` and refined
- [ ] Plan doc presented — **User APPROVED**

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
- **Match the project** — every item mirrors an existing feature's structure/naming; never impose DDD/layers the codebase doesn't already use (see `~/.claude/architecture/_shared/read-project-first.md`).

---

## Related Skills

| When | Use |
|------|-----|
| Need idea frameworks for Phase 0 | `/brainstorm` |
| Self-critique the plan in Phase 0 | `/challenge` |
| De-risk an unknown before planning | `/research-explore` (SPIKE mode) |
| Drive ONE unit deeper test-first | `/review-code` (TDD mode) |
| Full feature across the project's own layers | `/feature-build` (NEW mode) |
| Self-review the branch after the loop | `/review-code` (SELF mode) |
| Urgent prod bug, no checklist | `/fix-bug` (QUICK mode) |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| BRAINSTORM / PLAN | `@clean-architect` | Approach + decomposition |
| TEST | `@test-writer` | Failing test per item |
| IMPLEMENT | Stack-specific dev agent | Minimal implementation |
| VERIFY / FIX | `@code-reviewer` | Catch issues before commit |
